import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';

let app;
let gymController;
let gymService;

beforeAll(async () => {
  jest.resetModules();

  // Mock with .js extension (original import in controller)
  await jest.unstable_mockModule('../services/gym.service.js', () => ({
    createGym: jest.fn(),
    getallgyms: jest.fn(),
    getgymbyid: jest.fn(),
    getgymbyuserid: jest.fn(),
    updategymdetails: jest.fn(),
    gettotalmembercount: jest.fn(),
    getgymtrainers: jest.fn(),
    approvetrainer: jest.fn(),
    getgymtrainercount: jest.fn(),
    getAllGymUsersByIds: jest.fn(),
    requestGymVerification: jest.fn(),
  }));

  // Also mock without extension to match moduleNameMapper mapping
  await jest.unstable_mockModule('../services/gym.service', () => ({
    createGym: jest.fn(),
    getallgyms: jest.fn(),
    getgymbyid: jest.fn(),
    getgymbyuserid: jest.fn(),
    updategymdetails: jest.fn(),
    gettotalmembercount: jest.fn(),
    getgymtrainers: jest.fn(),
    approvetrainer: jest.fn(),
    getgymtrainercount: jest.fn(),
    getAllGymUsersByIds: jest.fn(),
    requestGymVerification: jest.fn(),
  }));

  gymController = await import('../controllers/gym.controller.js');
  gymService = await import('../services/gym.service.js');

  app = express();
  app.use(express.json());

  // Wire routes like index.js
  app.post('/addGym', gymController.addGym);
  app.get('/getallgyms', gymController.getAllGyms);
  app.get('/getgymbyid/:gymId', gymController.getGymById);
  app.get('/getgymbyuserid/:userId', gymController.getGymByUserId);
  app.put('/updategymdetails/:gymId', gymController.updateGymDetails);
  app.post('/getallgymusers', gymController.getAllGymUsers);
  app.get('/gettotalmembercount/:gymId', gymController.getTotalGymMemberCount);
  app.get('/gettrainers/:gymId', gymController.getTrainers);
  app.put('/approvetrainer/:request_id', gymController.approveTrainer);
  app.get('/getstatistics/:gymId', gymController.getGymTrainerCount);
  app.post('/request-verification', gymController.requestVerification);
});

afterEach(() => jest.clearAllMocks());

describe('GymService HTTP (gym controller routes)', () => {
  test('POST /addGym → 200 on success', async () => {
    gymService.createGym.mockResolvedValue({ gym_id: 'g1' });
    const res = await request(app).post('/addGym').send({ gym_name: 'X' });
    expect(res.status).toBe(200);
  });

  test('POST /addGym → 500 on error', async () => {
    gymService.createGym.mockRejectedValue(new Error('fail'));
    const res = await request(app).post('/addGym').send({ gym_name: 'X' });
    expect(res.status).toBe(500);
  });

  test('GET /getallgyms returns list with pagination', async () => {
    gymService.getallgyms.mockResolvedValue({ data: [], total: 0, page: 1, limit: 12 });
    const res = await request(app).get('/getallgyms?page=1&limit=12&search=&location=');
    expect(res.status).toBe(200);
  });

  test('GET /getallgyms → 500 on error', async () => {
    gymService.getallgyms.mockRejectedValueOnce(new Error('boom'));
    const res = await request(app).get('/getallgyms?page=1&limit=12');
    expect(res.status).toBe(500);
  });

  test('GET /getgymbyid/:gymId → 200 when found, 404 when not', async () => {
    gymService.getgymbyid.mockResolvedValueOnce({ gym_id: 'g1' });
    let res = await request(app).get('/getgymbyid/g1');
    expect(res.status).toBe(200);
    gymService.getgymbyid.mockResolvedValueOnce(null);
    res = await request(app).get('/getgymbyid/missing');
    expect(res.status).toBe(404);
  });

  test('GET /getgymbyid/:gymId → 500 on error', async () => {
    gymService.getgymbyid.mockRejectedValueOnce(new Error('boom'));
    const res = await request(app).get('/getgymbyid/g1');
    expect(res.status).toBe(500);
  });

  test('GET /getgymbyuserid/:userId → 200/404', async () => {
    gymService.getgymbyuserid.mockResolvedValueOnce({ gym_id: 'g1' });
    let res = await request(app).get('/getgymbyuserid/u1');
    expect(res.status).toBe(200);
    gymService.getgymbyuserid.mockResolvedValueOnce(null);
    res = await request(app).get('/getgymbyuserid/none');
    expect(res.status).toBe(404);
  });

  test('GET /getgymbyuserid/:userId → 500 on error', async () => {
    gymService.getgymbyuserid.mockRejectedValueOnce(new Error('boom'));
    const res = await request(app).get('/getgymbyuserid/u1');
    expect(res.status).toBe(500);
  });

  test('PUT /updategymdetails/:gymId → 200/404', async () => {
    gymService.updategymdetails.mockResolvedValueOnce({ gym_id: 'g1', name: 'New' });
    let res = await request(app).put('/updategymdetails/g1').send({ name: 'New' });
    expect(res.status).toBe(200);
    gymService.updategymdetails.mockResolvedValueOnce(null);
    res = await request(app).put('/updategymdetails/missing').send({ name: 'X' });
    expect(res.status).toBe(404);
  });

  test('PUT /updategymdetails/:gymId → 500 on error', async () => {
    gymService.updategymdetails.mockRejectedValueOnce(new Error('boom'));
    const res = await request(app).put('/updategymdetails/g1').send({ name: 'New' });
    expect(res.status).toBe(500);
  });

  test('POST /getallgymusers → 400 invalid, 404 none, 200 success', async () => {
    // 400
    let res = await request(app).post('/getallgymusers').send({});
    expect(res.status).toBe(400);
    // 404
    gymService.getAllGymUsersByIds.mockResolvedValueOnce([]);
    res = await request(app).post('/getallgymusers').send({ customerIds: ['c1'] });
    expect(res.status).toBe(404);
    // 200
    gymService.getAllGymUsersByIds.mockResolvedValueOnce([{ id: 'c1' }]);
    res = await request(app).post('/getallgymusers').send({ customerIds: ['c1'] });
    expect(res.status).toBe(200);
  });

  test('POST /getallgymusers → 500 on error', async () => {
    gymService.getAllGymUsersByIds.mockRejectedValueOnce(new Error('boom'));
    const res = await request(app).post('/getallgymusers').send({ customerIds: ['c1'] });
    expect(res.status).toBe(500);
  });

  test('GET /gettotalmembercount/:gymId → 200 non-null, 404 null', async () => {
    gymService.gettotalmembercount.mockResolvedValueOnce(3);
    let res = await request(app).get('/gettotalmembercount/g1');
    expect(res.status).toBe(200);
    gymService.gettotalmembercount.mockResolvedValueOnce(null);
    res = await request(app).get('/gettotalmembercount/g1');
    expect(res.status).toBe(404);
  });

  test('GET /gettotalmembercount/:gymId → 500 on error', async () => {
    gymService.gettotalmembercount.mockRejectedValueOnce(new Error('boom'));
    const res = await request(app).get('/gettotalmembercount/g1');
    expect(res.status).toBe(500);
  });

  test('GET /gettrainers/:gymId → 200 when data, 404 when null', async () => {
    gymService.getgymtrainers.mockResolvedValueOnce([{ id: 't1' }]);
    let res = await request(app).get('/gettrainers/g1');
    expect(res.status).toBe(200);
    gymService.getgymtrainers.mockResolvedValueOnce(null);
    res = await request(app).get('/gettrainers/g1');
    expect(res.status).toBe(404);
  });

  test('GET /gettrainers/:gymId → 500 on error', async () => {
    gymService.getgymtrainers.mockRejectedValueOnce(new Error('boom'));
    const res = await request(app).get('/gettrainers/g1');
    expect(res.status).toBe(500);
  });

  test('PUT /approvetrainer/:request_id → 200/404', async () => {
    gymService.approvetrainer.mockResolvedValueOnce({ ok: true });
    let res = await request(app).put('/approvetrainer/r1');
    expect(res.status).toBe(200);
    gymService.approvetrainer.mockResolvedValueOnce(null);
    res = await request(app).put('/approvetrainer/r1');
    expect(res.status).toBe(404);
  });

  test('PUT /approvetrainer/:request_id → 500 on error', async () => {
    gymService.approvetrainer.mockRejectedValueOnce(new Error('boom'));
    const res = await request(app).put('/approvetrainer/r1');
    expect(res.status).toBe(500);
  });

  test('GET /getstatistics/:gymId → 200', async () => {
    gymService.getgymtrainercount.mockResolvedValueOnce(0);
    const res = await request(app).get('/getstatistics/g1');
    expect(res.status).toBe(200);
  });

  test('GET /getstatistics/:gymId → 500 on error', async () => {
    gymService.getgymtrainercount.mockRejectedValueOnce(new Error('boom'));
    const res = await request(app).get('/getstatistics/g1');
    expect(res.status).toBe(500);
  });

  test('POST /request-verification → 200 on success, 400 when missing fields', async () => {
    // 400
    let res = await request(app).post('/request-verification').send({ gym_id: 'g1', type: 'gym' });
    expect(res.status).toBe(400);
    // 200
    gymService.requestGymVerification.mockResolvedValueOnce({ success: true });
    const payload = { gym_id: 'g1', type: 'gym', status: 'pending', email: 'g1@example.com' };
    res = await request(app).post('/request-verification').send(payload);
    expect(res.status).toBe(200);
  });

  test('POST /request-verification → 500 on error', async () => {
    gymService.requestGymVerification.mockRejectedValueOnce(new Error('boom'));
    const payload = { gym_id: 'g1', type: 'gym', status: 'pending', email: 'g1@example.com' };
    const res = await request(app).post('/request-verification').send(payload);
    expect(res.status).toBe(500);
  });
});
