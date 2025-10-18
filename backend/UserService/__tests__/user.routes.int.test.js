import express from 'express';
import request from 'supertest';

// Import controllers (integration at HTTP layer), mock services beneath
import {
  updateuserdetails,
  getuserbyid,
  addweight,
  getweightbyid,
  getlatestweightbyid,
  addfeedback,
  getMySessions,
  addreport,
} from '../controllers/user.controller.js';

import * as userService from '../services/user.service.js';
import * as feedbackService from '../services/feedback.service.js';

jest.mock('../services/user.service.js');
jest.mock('../services/feedback.service.js');

// Build a minimal Express app that mounts the same routes as index.js
function createApp() {
  const app = express();
  app.use(express.json());

  app.get('/getuserbyid/:userId', getuserbyid);
  app.patch('/updateuserdetails/:userId', updateuserdetails);
  app.post('/addweight', addweight);
  app.get('/getweightbyid/:userId', getweightbyid);
  app.get('/getlatestweightbyid/:userId', getlatestweightbyid);
  app.post('/addfeedback', addfeedback);
  app.get('/mysessions/:customerId', getMySessions);
  app.post('/addreport', addreport);

  return app;
}

describe('UserService HTTP integration (controllers + routes)', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PATCH /updateuserdetails/:userId', () => {
    test('200 when updated user returned', async () => {
      userService.updateUserDetails.mockResolvedValue({ id: 'u1', name: 'A' });

      const res = await request(app)
        .patch('/updateuserdetails/u1')
        .send({ name: 'A' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual(
        expect.objectContaining({ message: 'User updated successfully', updatedUser: { id: 'u1', name: 'A' } })
      );
      expect(userService.updateUserDetails).toHaveBeenCalledWith('u1', { name: 'A' });
    });

    test('404 when user not found', async () => {
      userService.updateUserDetails.mockResolvedValue(null);

      const res = await request(app)
        .patch('/updateuserdetails/missing')
        .send({ name: 'X' });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: 'User not found' });
    });

    test('500 on service error', async () => {
      userService.updateUserDetails.mockRejectedValue(new Error('DB fail'));

      const res = await request(app)
        .patch('/updateuserdetails/u1')
        .send({ name: 'A' });

      expect(res.status).toBe(500);
      expect(res.body).toEqual(expect.objectContaining({ message: 'Internal server error' }));
    });
  });

  describe('GET /getuserbyid/:userId', () => {
    test('200 when found', async () => {
      userService.getUserById.mockResolvedValue({ id: 'u1' });

      const res = await request(app).get('/getuserbyid/u1');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'User retrieved successfully', user: { id: 'u1' } });
    });

    test('404 when not found', async () => {
      userService.getUserById.mockResolvedValue(null);

      const res = await request(app).get('/getuserbyid/missing');
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: 'User not found' });
    });

    test('500 on error', async () => {
      userService.getUserById.mockRejectedValue(new Error('boom'));

      const res = await request(app).get('/getuserbyid/u1');
      expect(res.status).toBe(500);
      expect(res.body).toEqual(expect.objectContaining({ message: 'Internal server error' }));
    });
  });

  describe('POST /addweight', () => {
    test('200 on success', async () => {
      userService.addWeight.mockResolvedValue({ id: 'w1', weight: 70 });

      const res = await request(app)
        .post('/addweight')
        .send({ weight: 70, customer_id: 'u1' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Weight add successfully', weight: { id: 'w1', weight: 70 } });
    });

    test('500 on error', async () => {
      userService.addWeight.mockRejectedValue(new Error('insert fail'));

      const res = await request(app)
        .post('/addweight')
        .send({ weight: 70, customer_id: 'u1' });

      expect(res.status).toBe(500);
      expect(res.body).toEqual(expect.objectContaining({ message: 'Internal server error' }));
    });
  });

  describe('GET /getweightbyid/:userId', () => {
    test('200 returns weight list', async () => {
      userService.getWeightById.mockResolvedValue([{ date: '2024-01-01', weight: 70 }]);

      const res = await request(app).get('/getweightbyid/u1');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Weight retrieved successfully', weight: [{ date: '2024-01-01', weight: 70 }] });
    });

    test('404 when not found', async () => {
      userService.getWeightById.mockResolvedValue(null);

      const res = await request(app).get('/getweightbyid/u1');
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: 'Weight plan not found' });
    });

    test('500 on error', async () => {
      userService.getWeightById.mockRejectedValue(new Error('fail'));
      const res = await request(app).get('/getweightbyid/u1');
      expect(res.status).toBe(500);
      expect(res.body).toEqual(expect.objectContaining({ message: 'Internal server error' }));
    });
  });

  describe('GET /getlatestweightbyid/:userId', () => {
    test('200 returns latest weight', async () => {
      userService.getLatestWeightById.mockResolvedValue({ weight: 70 });
      const res = await request(app).get('/getlatestweightbyid/u1');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Weight retrieved successfully', weight: { weight: 70 } });
    });

    test('404 when not found', async () => {
      userService.getLatestWeightById.mockResolvedValue(null);
      const res = await request(app).get('/getlatestweightbyid/u1');
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: 'Weight  not found' });
    });

    test('500 on error', async () => {
      userService.getLatestWeightById.mockRejectedValue(new Error('fail'));
      const res = await request(app).get('/getlatestweightbyid/u1');
      expect(res.status).toBe(500);
      expect(res.body).toEqual(expect.objectContaining({ message: 'Internal server error' }));
    });
  });

  describe('POST /addfeedback', () => {
    test('200 on success', async () => {
      feedbackService.addFeedback.mockResolvedValue({ id: 'f1', stars: 5 });
      const res = await request(app).post('/addfeedback').send({ stars: 5 });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'feedback add successfully', feedback: { id: 'f1', stars: 5 } });
    });

    test('500 on error', async () => {
      feedbackService.addFeedback.mockRejectedValue(new Error('fail'));
      const res = await request(app).post('/addfeedback').send({ stars: 5 });
      expect(res.status).toBe(500);
      expect(res.body).toEqual(expect.objectContaining({ message: 'Internal server error' }));
    });
  });

  describe('GET /mysessions/:customerId', () => {
    test('200 with sessions when found', async () => {
      userService.getUserSessions.mockResolvedValue([{ session_id: 's1' }]);
      const res = await request(app).get('/mysessions/u1');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Sessions retrieved successfully', sessions: [{ session_id: 's1' }] });
    });

    test('200 with message when none found', async () => {
      userService.getUserSessions.mockResolvedValue(null);
      const res = await request(app).get('/mysessions/u1');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'No sessions found' });
    });

    test('500 on error', async () => {
      userService.getUserSessions.mockRejectedValue(new Error('db'));
      const res = await request(app).get('/mysessions/u1');
      expect(res.status).toBe(500);
      expect(res.body).toEqual(expect.objectContaining({ message: 'Internal server error' }));
    });
  });

  describe('POST /addreport', () => {
    test('200 on success', async () => {
      userService.addReport.mockResolvedValue({ id: 'r1' });
      const res = await request(app).post('/addreport').send({ a: 1 });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Report added successfully', report: { id: 'r1' } });
    });

    test('500 on error', async () => {
      userService.addReport.mockRejectedValue(new Error('fail'));
      const res = await request(app).post('/addreport').send({ a: 1 });
      expect(res.status).toBe(500);
      expect(res.body).toEqual(expect.objectContaining({ message: 'Internal server error' }));
    });
  });
});
