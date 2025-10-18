import express from 'express';
import request from 'supertest';

// Controllers under test
import {
  getGoogleOauthUrl,
  googleCallback,
  calendarStatus,
  getCalendarEvents,
  syncCalendar,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent
} from '../controllers/calendar.controller.js';

// Mock calendar service module functions
import * as calendarService from '../services/calendar.service.js';

// Mock Supabase client for updateCalendarEvent google_event_id resolution path
import { supabase } from '../database/supabase.js';

jest.mock('../services/calendar.service.js');
jest.mock('../database/supabase.js', () => {
  const from = jest.fn();
  return { supabase: { from } };
});

function createApp() {
  const app = express();
  app.use(express.json());

  app.get('/google/oauth-url/:userId', getGoogleOauthUrl);
  app.get('/google/callback', googleCallback);
  app.get('/calendar/status/:userId', calendarStatus);
  app.get('/calendar/events/:userId', getCalendarEvents);
  app.post('/calendar/sync/:userId', syncCalendar);
  app.post('/calendar/create/:userId', createCalendarEvent);
  app.patch('/calendar/:calendarId', updateCalendarEvent);
  app.delete('/calendar/:calendarId', deleteCalendarEvent);

  return app;
}

describe('Calendar/Google OAuth Controller HTTP tests', () => {
  let app;
  const OLD_ENV = process.env;

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...OLD_ENV, FRONTEND_URL: 'http://localhost:3000', NODE_ENV: 'test' };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  describe('GET /google/oauth-url/:userId', () => {
    test('returns oauth url', async () => {
      calendarService.buildOauthUrl.mockReturnValue('https://accounts.google.com/o/oauth2/v2/auth?x=1');

      const res = await request(app).get('/google/oauth-url/u1').expect(200);
      expect(res.body).toEqual({ url: expect.stringContaining('https://accounts.google.com') });
      expect(calendarService.buildOauthUrl).toHaveBeenCalledWith('u1');
    });

    test('500 on build error', async () => {
      calendarService.buildOauthUrl.mockImplementation(() => { throw new Error('boom'); });
      const res = await request(app).get('/google/oauth-url/u1');
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to build oauth url' });
    });
  });

  describe('GET /google/callback', () => {
    test('400 when missing code', async () => {
      const res = await request(app).get('/google/callback?state=u1');
      expect(res.status).toBe(400);
      expect(res.text).toMatch(/Missing code/);
    });

    test('302 redirect after saving tokens', async () => {
      calendarService.exchangeCodeForTokens.mockResolvedValue({ access_token: 'at', refresh_token: 'rt', expires_in: 3600 });
      calendarService.saveTokensForUser.mockResolvedValue({});

      const res = await request(app).get('/google/callback?code=abc&state=u123');
      expect(calendarService.exchangeCodeForTokens).toHaveBeenCalledWith('abc');
      expect(calendarService.saveTokensForUser).toHaveBeenCalledWith('u123', expect.objectContaining({ access_token: 'at' }));
      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('http://localhost:3000');
    });

    test('500 on callback error', async () => {
      calendarService.exchangeCodeForTokens.mockRejectedValue(new Error('fail'));
      const res = await request(app).get('/google/callback?code=abc&state=u1');
      expect(res.status).toBe(500);
      expect(res.text).toMatch(/OAuth callback failed/);
    });
  });

  describe('GET /calendar/status/:userId', () => {
    test('connected false when no tokens', async () => {
      calendarService.getTokensForUser.mockResolvedValue(null);
      const res = await request(app).get('/calendar/status/u1');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ connected: false });
    });

    test('connected true when valid not expired', async () => {
      const future = Math.floor(Date.now() / 1000) + 3600;
      calendarService.getTokensForUser.mockResolvedValue({ access_token: 'at', expires_at: future });
      const res = await request(app).get('/calendar/status/u1');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ connected: true });
    });

    test('refresh flow when expired but refresh token exists', async () => {
      const past = Math.floor(Date.now() / 1000) - 10;
      calendarService.getTokensForUser.mockResolvedValue({ access_token: 'old', refresh_token: 'rt', expires_at: past });
      calendarService.refreshAccessToken.mockResolvedValue({ access_token: 'newAT', expires_in: 3600 });
      calendarService.updateAccessTokenForUser.mockResolvedValue({});
      const res = await request(app).get('/calendar/status/u1');
      expect(calendarService.refreshAccessToken).toHaveBeenCalledWith('rt');
      expect(calendarService.updateAccessTokenForUser).toHaveBeenCalledWith('u1', 'newAT', 3600);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ connected: true });
    });

    test('500 on error returns connected false', async () => {
      calendarService.getTokensForUser.mockRejectedValue(new Error('db'));
      const res = await request(app).get('/calendar/status/u1');
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ connected: false });
    });
  });

  describe('GET /calendar/events/:userId', () => {
    test('returns events array', async () => {
      calendarService.getEventsForUser.mockResolvedValue([{ id: 'c1' }]);
      const res = await request(app).get('/calendar/events/u1');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([{ id: 'c1' }]);
    });

    test('500 on error returns []', async () => {
      calendarService.getEventsForUser.mockRejectedValue(new Error('db'));
      const res = await request(app).get('/calendar/events/u1');
      expect(res.status).toBe(500);
      expect(res.body).toEqual([]);
    });
  });

  describe('POST /calendar/sync/:userId', () => {
    test('400 when user not connected (no refresh token)', async () => {
      calendarService.getTokensForUser.mockResolvedValue({ access_token: 'at' });
      const res = await request(app).post('/calendar/sync/u1');
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'user not connected' });
    });

    test('sync success with current access token', async () => {
      calendarService.getTokensForUser.mockResolvedValue({ access_token: 'at', refresh_token: 'rt' });
      calendarService.fetchGoogleCalendarEvents.mockResolvedValue([{ google_event_id: 'g1', title: 'A' }]);
      calendarService.saveOrUpdateEventsForUser.mockResolvedValue([{ calendar_id: 'c1' }]);
      const res = await request(app).post('/calendar/sync/u1');
      expect(res.status).toBe(200);
      expect(calendarService.fetchGoogleCalendarEvents).toHaveBeenCalledWith('at');
      expect(calendarService.saveOrUpdateEventsForUser).toHaveBeenCalledWith('u1', expect.any(Array));
      expect(res.body).toEqual([{ calendar_id: 'c1' }]);
    });

    test('refresh flow on expired token then success', async () => {
      calendarService.getTokensForUser.mockResolvedValue({ access_token: 'oldAT', refresh_token: 'rt' });
      calendarService.fetchGoogleCalendarEvents
        .mockRejectedValueOnce(new Error('access token expired'))
        .mockResolvedValueOnce([{ google_event_id: 'g2', title: 'B' }]);
      calendarService.refreshAccessToken.mockResolvedValue({ access_token: 'newAT', expires_in: 3600 });
      calendarService.updateAccessTokenForUser.mockResolvedValue({});
      calendarService.saveOrUpdateEventsForUser.mockResolvedValue([{ calendar_id: 'c2' }]);

      const res = await request(app).post('/calendar/sync/u1');
      expect(calendarService.refreshAccessToken).toHaveBeenCalledWith('rt');
      expect(calendarService.fetchGoogleCalendarEvents).toHaveBeenLastCalledWith('newAT');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([{ calendar_id: 'c2' }]);
    });

    test('500 on arbitrary error', async () => {
      calendarService.getTokensForUser.mockResolvedValue({ access_token: 'at', refresh_token: 'rt' });
      calendarService.fetchGoogleCalendarEvents.mockRejectedValue(new Error('boom'));
      const res = await request(app).post('/calendar/sync/u1');
      expect(res.status).toBe(500);
      expect(res.body).toEqual(expect.objectContaining({ error: 'sync failed' }));
    });
  });

  describe('POST /calendar/create/:userId', () => {
    test('creates calendar event', async () => {
      calendarService.saveOrCreateEventForUser.mockResolvedValue({ id: 'c1', title: 'X' });
      const res = await request(app)
        .post('/calendar/create/u1')
        .send({ title: 'X', start: '2025-01-01T10:00:00Z', end: '2025-01-01T11:00:00Z' });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ id: 'c1', title: 'X' });
      expect(calendarService.saveOrCreateEventForUser).toHaveBeenCalledWith('u1', expect.any(Object));
    });

    test('500 on create error', async () => {
      calendarService.saveOrCreateEventForUser.mockRejectedValue(new Error('fail'));
      const res = await request(app)
        .post('/calendar/create/u1')
        .send({ title: 'Y' });
      expect(res.status).toBe(500);
      expect(res.body).toEqual(expect.objectContaining({ error: 'create failed' }));
    });
  });

  describe('PATCH /calendar/:calendarId', () => {
    test('updates using UUID calendar_id', async () => {
      calendarService.updateEventForUser.mockResolvedValue({ calendar_id: '11111111-1111-1111-1111-111111111111', task: 'T' });
      const res = await request(app)
        .patch('/calendar/11111111-1111-1111-1111-111111111111')
        .send({ title: 'T' });
      expect(res.status).toBe(200);
      expect(res.body).toEqual(expect.objectContaining({ calendar_id: expect.any(String) }));
      expect(calendarService.updateEventForUser).toHaveBeenCalled();
    });

    test('resolves google_event_id to calendar_id then updates', async () => {
      // Setup supabase.from('calendar').select(...).eq(...).single()
      const single = jest.fn().mockResolvedValue({ data: { calendar_id: 'uuid-123' }, error: null });
      const eq = jest.fn().mockReturnValue({ single });
      const select = jest.fn().mockReturnValue({ eq });
      supabase.from.mockReturnValue({ select });

      calendarService.updateEventForUser.mockResolvedValue({ calendar_id: 'uuid-123', task: 'Updated' });

      const res = await request(app)
        .patch('/calendar/google-evt-999')
        .send({ title: 'Updated' });

      expect(select).toHaveBeenCalledWith('calendar_id');
      expect(eq).toHaveBeenCalledWith('google_event_id', 'google-evt-999');
      expect(calendarService.updateEventForUser).toHaveBeenCalledWith('uuid-123', expect.any(Object));
      expect(res.status).toBe(200);
      expect(res.body).toEqual(expect.objectContaining({ calendar_id: 'uuid-123' }));
    });

    test('401 on GOOGLE_AUTH_REQUIRED', async () => {
      calendarService.updateEventForUser.mockRejectedValue({ code: 'GOOGLE_AUTH_REQUIRED' });
      const res = await request(app)
        .patch('/calendar/11111111-1111-1111-1111-111111111111')
        .send({ title: 'X' });
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'google_auth_required' });
    });

    test('500 on update error', async () => {
      calendarService.updateEventForUser.mockRejectedValue(new Error('db'));
      const res = await request(app)
        .patch('/calendar/11111111-1111-1111-1111-111111111111')
        .send({ title: 'X' });
      expect(res.status).toBe(500);
      expect(res.body).toEqual(expect.objectContaining({ error: 'update failed' }));
    });
  });

  describe('DELETE /calendar/:calendarId', () => {
    test('deletes and returns success', async () => {
      calendarService.deleteEventForUser.mockResolvedValue({ success: true });
      const res = await request(app).delete('/calendar/uuid-1');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, result: { success: true } });
    });

    test('500 on delete error', async () => {
      calendarService.deleteEventForUser.mockRejectedValue(new Error('db'));
      const res = await request(app).delete('/calendar/uuid-1');
      expect(res.status).toBe(500);
      expect(res.body).toEqual(expect.objectContaining({ error: 'delete failed' }));
    });
  });
});
