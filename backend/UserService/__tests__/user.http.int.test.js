import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';

let app;
let userController;

beforeAll(async () => {
  jest.resetModules();

  await jest.unstable_mockModule('../services/user.service.js', () => ({
    updateUserDetails: jest.fn().mockResolvedValue({ id: 'u1' }),
    getUserById: jest.fn().mockResolvedValue({ id: 'u1' }),
    addWeight: jest.fn().mockResolvedValue({ id: 'w1' }),
    getWeightById: jest.fn().mockResolvedValue([]),
    getLatestWeightById: jest.fn().mockResolvedValue({ id: 'w2' }),
    getUserSessions: jest.fn().mockResolvedValue([]),
    addReport: jest.fn().mockResolvedValue({ id: 'r1' }),
  }));

  await jest.unstable_mockModule('../services/feedback.service.js', () => ({
    addFeedback: jest.fn().mockResolvedValue({ id: 'f1' })
  }));

  userController = await import('../controllers/user.controller.js');

  app = express();
  app.use(express.json());

  app.get('/getuserbyid/:userId', userController.getuserbyid);
  app.patch('/updateuserdetails/:userId', userController.updateuserdetails);
  app.post('/addfeedback', userController.addfeedback);
});

afterEach(() => jest.clearAllMocks());

describe('UserService HTTP routes', () => {
  test('GET /getuserbyid/:userId → 200', async () => {
    const res = await request(app).get('/getuserbyid/u1');
    expect(res.status).toBe(200);
  });

  test('PATCH /updateuserdetails/:userId → 200', async () => {
    const res = await request(app).patch('/updateuserdetails/u1').send({ name: 'New' });
    expect(res.status).toBe(200);
  });

  test('POST /addfeedback → 200', async () => {
    const res = await request(app).post('/addfeedback').send({ text: 'ok' });
    expect(res.status).toBe(200);
  });
});
