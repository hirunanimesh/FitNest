import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';

let app;
let trainerController;

beforeAll(async () => {
  jest.resetModules();

  await jest.unstable_mockModule('../services/trainer.service.js', () => ({
    getalltrainers: jest.fn().mockResolvedValue({ data: [], total: 0, page: 1, limit: 12 }),
    gettrainerbyid: jest.fn().mockResolvedValue({ id: 't1' }),
    updatetrainerdetails: jest.fn().mockResolvedValue({ id: 't1', name: 'New' }),
    getfeedbackbytrainerid: jest.fn().mockResolvedValue([]),
    getgymplanbytrainerid: jest.fn().mockResolvedValue([]),
    getmembershipGyms: jest.fn().mockResolvedValue([]),
    booksession: jest.fn().mockResolvedValue({ id: 's1' }),
    sendrequest: jest.fn().mockResolvedValue({ ok: true }),
    requestTrainerVerification: jest.fn().mockResolvedValue({ ok: true }),
    holdsession: jest.fn().mockResolvedValue({ id: 's1' }),
    releasesession: jest.fn().mockResolvedValue({ id: 's1' }),
  }));

  trainerController = await import('../controllers/trainer.controller.js');

  app = express();
  app.use(express.json());
  app.get('/getalltrainers', trainerController.getallTrainers);
  app.get('/gettrainerbyid/:trainerId', trainerController.getTrainerById);
  app.post('/holdsession', trainerController.holdSession);
});

afterEach(() => jest.clearAllMocks());

describe('TrainerService HTTP routes', () => {
  test('GET /getalltrainers → 200', async () => {
    const res = await request(app).get('/getalltrainers?page=1&limit=12');
    expect(res.status).toBe(200);
  });

  test('GET /gettrainerbyid/:trainerId → 200', async () => {
    const res = await request(app).get('/gettrainerbyid/t1');
    expect(res.status).toBe(200);
  });

  test('POST /holdsession → 400 missing, 200 ok', async () => {
    let res = await request(app).post('/holdsession').send({});
    expect(res.status).toBe(400);
    res = await request(app).post('/holdsession').send({ sessionId: 's1', customerId: 'c1' });
    expect(res.status).toBe(200);
  });
});
 
