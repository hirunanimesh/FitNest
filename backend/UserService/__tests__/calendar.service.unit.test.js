

import { jest } from '@jest/globals';

jest.mock('../database/supabase.js', () => {
  const from = jest.fn();
  return { supabase: { from } };
});

jest.mock('googleapis', () => ({
  google: {
    auth: { OAuth2: jest.fn().mockImplementation(() => ({ setCredentials: jest.fn() })) },
    calendar: jest.fn().mockImplementation(() => ({
      events: {
        list: jest.fn().mockResolvedValue({ data: { items: [
          { id: 'g1', summary: 'S', start: { dateTime: '2025-01-01T10:00:00Z' }, end: { dateTime: '2025-01-01T11:00:00Z' }, description: 'D' },
        ] } }),
        delete: jest.fn().mockResolvedValue({}),
        patch: jest.fn().mockResolvedValue({ data: {} }),
        insert: jest.fn().mockResolvedValue({ data: { id: 'gNew', summary: 'S' } })
      }
    }))
  }
}));

import { supabase } from '../database/supabase.js';
import {
  buildOauthUrl,
  exchangeCodeForTokens,
  fetchGoogleCalendarEvents,
  deleteEventForUser,
  updateAccessTokenForUser,
  ensureValidAccessToken,
  getEventsForUser,
  saveOrUpdateEventsForUser,
  updateEventForUser,
  saveOrCreateEventForUser
} from '../services/calendar.service.js';

describe('calendar.service unit tests', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    // Preserve mock implementations defined in jest.mock while clearing call history
    jest.clearAllMocks();
    process.env = { ...OLD_ENV,
      GOOGLE_AUTH_URL: 'https://accounts.google.com/o/oauth2/v2/auth',
      BACKEND_URL: 'http://localhost:3004',
      GOOGLE_CLIENT_ID: 'cid',
      GOOGLE_CLIENT_SECRET: 'csecret',
      GOOGLE_TOKEN_URL: 'https://oauth2.googleapis.com/token'
    };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  test('buildOauthUrl composes correct URL', () => {
  const url = buildOauthUrl('u1');
    expect(url).toContain('client_id=cid');
    expect(url).toContain(encodeURIComponent('http://localhost:3004/google/callback'));
    expect(url).toContain('response_type=code');
    expect(url).toContain('scope=');
    expect(url).toContain('state=u1');
  });

  describe('ensureValidAccessToken (alias of refreshAccessTokenIfNeeded)', () => {
    test('returns current token when not near expiry', async () => {
      const nowSec = Math.floor(Date.now() / 1000);
      supabase.from.mockImplementation((table) => {
        if (table === 'user_google_tokens') {
          return {
            select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { access_token: 'at', expires_at: nowSec + 3600 }, error: null }) }) })
          };
        }
        throw new Error('unexpected table ' + table);
      });
      const token = await ensureValidAccessToken('u1');
      expect(token).toBe('at');
    });

    test('returns null when no refresh token available', async () => {
      const nowSec = Math.floor(Date.now() / 1000);
      supabase.from.mockImplementation((table) => {
        if (table === 'user_google_tokens') {
          return {
            select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { access_token: 'old', expires_at: nowSec - 1, refresh_token: null }, error: null }) }) })
          };
        }
        throw new Error('unexpected table ' + table);
      });
      const token = await ensureValidAccessToken('u1');
      expect(token).toBeNull();
    });

    test('refresh success updates DB and returns token', async () => {
      const nowSec = Math.floor(Date.now() / 1000);
      global.fetch = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ access_token: 'newAT', expires_in: 1800 }) });
      const updateSpy = jest.fn().mockReturnValue({ eq: () => Promise.resolve({ error: null }) });
      supabase.from.mockImplementation((table) => {
        if (table === 'user_google_tokens') {
          return {
            select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { access_token: 'old', expires_at: nowSec - 10, refresh_token: 'rt' }, error: null }) }) }),
            update: updateSpy
          };
        }
        throw new Error('unexpected table ' + table);
      });
      const token = await ensureValidAccessToken('u1');
      expect(global.fetch).toHaveBeenCalled();
      expect(updateSpy).toHaveBeenCalled();
      expect(token).toBe('newAT');
    });

    test('refresh failure returns null', async () => {
      const nowSec = Math.floor(Date.now() / 1000);
      global.fetch = jest.fn().mockResolvedValue({ ok: false, text: () => Promise.resolve('bad') });
      supabase.from.mockImplementation((table) => {
        if (table === 'user_google_tokens') {
          return {
            select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { access_token: 'old', expires_at: nowSec - 10, refresh_token: 'rt' }, error: null }) }) }),
            update: () => ({ eq: () => Promise.resolve({ error: null }) })
          };
        }
        throw new Error('unexpected table ' + table);
      });
      const token = await ensureValidAccessToken('u1');
      expect(token).toBeNull();
    });
  });

  describe('getEventsForUser', () => {
    test('maps events with color/description when normal mode', async () => {
      supabase.from.mockImplementation((table) => {
        if (table === 'calendar') {
          return {
            select: () => ({
              eq: () => Promise.resolve({ data: [ { calendar_id: 'c1', task: 'T', task_date: '2025-01-01', start: '10:00:00', end: '11:00:00', color: '#fff', description: 'D' } ], error: null })
            })
          };
        }
        throw new Error('unexpected table ' + table);
      });
      const events = await getEventsForUser('u1');
      expect(events[0]).toEqual(expect.objectContaining({ id: 'c1', title: 'T', start: '2025-01-01T10:00:00', end: '2025-01-01T11:00:00', color: '#fff', description: 'D' }));
    });

    test('falls back to minimal mode when color column missing', async () => {
      // First select path throws column error, fallback returns minimal fields
      supabase.from.mockImplementation((table) => {
        if (table === 'calendar') {
          return {
            select: (sel) => ({
              eq: () => sel.includes('color')
                ? Promise.reject(new Error('column "color" does not exist'))
                : Promise.resolve({ data: [ { calendar_id: 'c2', task: 'X', task_date: '2025-01-02' } ], error: null })
            })
          };
        }
        throw new Error('unexpected table ' + table);
      });
      const events = await getEventsForUser('u1');
      expect(events[0]).toEqual(expect.objectContaining({ id: 'c2', title: 'X', start: '2025-01-02', end: '2025-01-02', color: null, description: null }));
    });
  });

  describe('saveOrUpdateEventsForUser', () => {
    test('upserts and cleans stale events; handles color fallback', async () => {
      const upsertMock = jest.fn().mockImplementation(() => ({
        select: (sel) => ({
          single: () => sel.includes('color')
            ? Promise.reject(new Error('column "color" does not exist'))
            : Promise.resolve({ data: { calendar_id: 'c1', task: 'A', task_date: '2025-01-01', start: '10:00:00', end: '11:00:00', color: null, description: null }, error: null })
        })
      }));

      const deleteChain = { in: () => Promise.resolve({ error: null }) };

      supabase.from.mockImplementation((table) => {
        if (table === 'calendar') {
          return {
            upsert: () => upsertMock(),
            select: () => ({
              eq: () => ({
                not: () => Promise.resolve({ data: [ { calendar_id: 'stale', google_event_id: 'gOld' } ], error: null })
              })
            }),
            delete: () => deleteChain
          };
        }
        throw new Error('unexpected table ' + table);
      });

      const events = [
        { google_event_id: 'g1', title: 'A', start: '2025-01-01T10:00:00Z', end: '2025-01-01T11:00:00Z' },
      ];
      const res = await saveOrUpdateEventsForUser('u1', events);
      expect(Array.isArray(res)).toBe(true);
      expect(upsertMock).toHaveBeenCalled();
    });
  });

  describe('updateEventForUser', () => {
    test('throws when Google event ID cannot be resolved', async () => {
      supabase.from.mockImplementation((table) => {
        if (table === 'calendar') {
          return {
            select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: new Error('not found') }) }) })
          };
        }
        throw new Error('unexpected table ' + table);
      });
      await expect(updateEventForUser('google-evt-1', { title: 'T' })).rejects.toThrow('Calendar event not found');
    });

  test('updates by UUID and syncs to Google', async () => {
      const nowSec = Math.floor(Date.now() / 1000);
      const updateChain = {
        eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: { calendar_id: 'uuid-1', task: 'T', task_date: '2025-01-01', start: '10:00:00', end: '11:00:00', user_id: 'u1', google_event_id: 'g1', description: null, color: null }, error: null }) }) })
      };
      supabase.from.mockImplementation((table) => {
        if (table === 'calendar') {
          return {
            // For "existing" select
            select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { calendar_id: 'uuid-1', task: 'T', task_date: '2025-01-01', start: '10:00:00', end: '11:00:00', user_id: 'u1', google_event_id: 'g1' }, error: null }) }) }),
            // For updateCalendarEvent
            update: () => updateChain
          };
        }
        if (table === 'user_google_tokens') {
          return {
            select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { access_token: 'at', expires_at: nowSec + 3600 }, error: null }) }) })
          };
        }
        throw new Error('unexpected table ' + table);
      });
      const { google } = jest.requireMock('googleapis');
      // Ensure patch resolves; include other stubs to avoid leaking state
      google.calendar.mockReturnValueOnce({ events: {
        list: jest.fn().mockResolvedValue({ data: { items: [] } }),
        delete: jest.fn().mockResolvedValue({}),
        patch: jest.fn().mockResolvedValue({ data: {} }),
        insert: jest.fn().mockResolvedValue({ data: { id: 'gNew', summary: 'S' } })
      }});
      const res = await updateEventForUser('11111111-1111-1111-1111-111111111111', { title: 'New' });
      expect(res).toEqual(expect.objectContaining({ calendar_id: 'uuid-1' }));
    });
  });

  describe('deleteEventForUser - handles Google 404', () => {
  test('treats 404 as success', async () => {
      const nowSec = Math.floor(Date.now() / 1000);
      supabase.from.mockImplementation((table) => {
        if (table === 'calendar') {
          return {
            select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { calendar_id: 'c1', user_id: 'u1', google_event_id: 'g404' }, error: null }) }) }),
            delete: () => ({ eq: () => Promise.resolve({ error: null }) })
          };
        }
        if (table === 'user_google_tokens') {
          return {
            select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { access_token: 'at', expires_at: nowSec + 3600 }, error: null }) }) })
          };
        }
        throw new Error('unexpected table ' + table);
      });
      const { google } = jest.requireMock('googleapis');
      google.calendar.mockReturnValueOnce({ events: {
        list: jest.fn().mockResolvedValue({ data: { items: [] } }),
        delete: jest.fn().mockRejectedValue({ response: { status: 404 } }),
        patch: jest.fn().mockResolvedValue({ data: {} }),
        insert: jest.fn().mockResolvedValue({ data: { id: 'gNew', summary: 'S' } })
      }});
      const ok = await deleteEventForUser('c1');
      expect(ok).toBe(true);
    });
  });

  describe('saveOrCreateEventForUser', () => {
    test('returns existing duplicate without insert', async () => {
      // Duplicate check returns existing
      const recent = [{ calendar_id: 'cDupe', task: 'Title', created_at: new Date().toISOString() }];
      supabase.from.mockImplementation((table) => {
        if (table === 'calendar') {
          return {
            select: () => ({
              eq: () => ({ eq: () => ({ eq: () => ({ gte: () => ({ limit: () => Promise.resolve({ data: recent, error: null }) }) }) }) })
            })
          };
        }
        throw new Error('unexpected table ' + table);
      });
      const result = await saveOrCreateEventForUser('u1', { title: 'Title', start: '2025-01-01', end: '2025-01-01' });
      expect(result).toEqual(expect.objectContaining({ id: 'cDupe', title: 'Title' }));
    });

  test('inserts local and syncs to Google', async () => {
      const nowSec = Math.floor(Date.now() / 1000);
      const insertedRow = { calendar_id: 'cNew', task: 'Task', task_date: '2025-01-01', start: '10:00:00', end: '11:00:00', user_id: 'u1', google_event_id: null, color: null, description: null };
      const updateChain = { eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: { ...insertedRow, google_event_id: 'gNew' }, error: null }) }) }) };
      supabase.from.mockImplementation((table) => {
        if (table === 'calendar') {
          return {
            // Duplicate check: returns empty
            select: () => ({ eq: () => ({ eq: () => ({ eq: () => ({ gte: () => ({ limit: () => Promise.resolve({ data: [], error: null }) }) }) }) }) }),
            insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: insertedRow, error: null }) }) }),
            update: () => updateChain
          };
        }
        if (table === 'user_google_tokens') {
          return {
            select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { access_token: 'at', expires_at: nowSec + 3600 }, error: null }) }) })
          };
        }
        throw new Error('unexpected table ' + table);
      });
      const { google } = jest.requireMock('googleapis');
      google.calendar.mockReturnValueOnce({ events: {
        list: jest.fn().mockResolvedValue({ data: { items: [] } }),
        delete: jest.fn().mockResolvedValue({}),
        patch: jest.fn().mockResolvedValue({ data: {} }),
        insert: jest.fn().mockResolvedValue({ data: { id: 'gNew', summary: 'Task' } })
      }});
      const result = await saveOrCreateEventForUser('u1', { title: 'Task', start: '2025-01-01T10:00:00Z', end: '2025-01-01T11:00:00Z' });
      expect(result).toEqual(expect.objectContaining({ id: 'cNew', title: 'Task' }));
    });
  });

  describe('exchangeCodeForTokens', () => {
    test('returns token json on 200', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ access_token: 'at' }) });
  const res = await exchangeCodeForTokens('abc');
      expect(res).toEqual({ access_token: 'at' });
      expect(global.fetch).toHaveBeenCalled();
    });

    test('throws on non-ok', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: false });
  await expect(exchangeCodeForTokens('abc')).rejects.toThrow('Token exchange failed');
    });
  });

  describe('fetchGoogleCalendarEvents', () => {
    test('transforms events', async () => {
  const items = await fetchGoogleCalendarEvents('at');
      expect(items).toEqual([
        expect.objectContaining({ google_event_id: 'g1', title: 'S', start: '2025-01-01T10:00:00Z' })
      ]);
    });

    test('throws access token expired on 401', async () => {
      const { google } = jest.requireMock('googleapis');
      google.calendar.mockReturnValueOnce({
        events: {
          list: jest.fn().mockRejectedValue({ response: { status: 401 } })
        }
      });
      await expect(fetchGoogleCalendarEvents('bad')).rejects.toThrow('access token expired');
    });
  });

  describe('deleteEventForUser', () => {
    test('returns true when not existing', async () => {
      supabase.from.mockImplementation((table) => {
        if (table === 'calendar') {
          return {
            select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) })
          };
        }
        throw new Error('unexpected table ' + table);
      });
  const ok = await deleteEventForUser('cal-1');
      expect(ok).toBe(true);
    });

    test('deletes google event and local row when existing', async () => {
      // 1) select existing calendar row
      // 2) tokens select for refreshAccessTokenIfNeeded
      // 3) delete local row
      supabase.from.mockImplementation((table) => {
        if (table === 'calendar') {
          return {
            select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { calendar_id: 'cal-1', user_id: 'u1', google_event_id: 'g1' }, error: null }) }) }),
            delete: () => ({ eq: () => Promise.resolve({ error: null }) })
          };
        }
        if (table === 'user_google_tokens') {
          return {
            select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { access_token: 'at', expires_at: Math.floor(Date.now()/1000)+3600 }, error: null }) }) })
          };
        }
        throw new Error('unexpected table ' + table);
      });

  const ok = await deleteEventForUser('cal-1');
      expect(ok).toBe(true);
    });
  });

  describe('updateAccessTokenForUser', () => {
    test('updates token and returns success', async () => {
      supabase.from.mockImplementation((table) => {
        if (table === 'user_google_tokens') {
          return {
            update: () => ({ eq: () => Promise.resolve({ error: null }) })
          };
        }
        throw new Error('unexpected table ' + table);
      });
  const res = await updateAccessTokenForUser('u1', 'newAT', 3600);
      expect(res).toEqual({ success: true });
    });

    test('throws on supabase error', async () => {
      supabase.from.mockImplementation((table) => {
        if (table === 'user_google_tokens') {
          return {
            update: () => ({ eq: () => Promise.resolve({ error: new Error('db') }) })
          };
        }
        throw new Error('unexpected table ' + table);
      });
  await expect(updateAccessTokenForUser('u1', 'newAT', 3600)).rejects.toThrow();
    });
  });
});
