import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';

let app;
let plansController;
let plansService;

beforeAll(async () => {
  jest.resetModules();

  // Mock Kafka producers
  await jest.unstable_mockModule('../kafka/Producer.js', () => ({
    GymPlanCreateProducer: jest.fn(),
    GymPlanDeleteProducer: jest.fn(),
    GymPlanPriceUpdateProducer: jest.fn(),
  }));

  // Mock email service class
  class MockEmailService {
    getGymOwnerDetails = jest.fn().mockResolvedValue({ ownerEmail: 'o@g.com', ownerName: 'Owner', gymName: 'GymX' });
    getTrainerDetails = jest.fn().mockResolvedValue([{ trainerEmail: 't@g.com', trainerName: 'T' }]);
    sendPlanCreationEmail = jest.fn().mockResolvedValue(true);
    sendPromotionalEmail = jest.fn().mockResolvedValue(true);
    sendTrainerAssignmentEmail = jest.fn().mockResolvedValue(true);
  }

  await jest.unstable_mockModule('../services/GymPlanEmailService.js', () => ({
    default: MockEmailService,
  }));

  await jest.unstable_mockModule('../services/plans.service.js', () => ({
    addgymplan: jest.fn(),
    getallgymplans: jest.fn(),
    getgymplanbygymid: jest.fn(),
    updategymplan: jest.fn(),
    deletegymplan: jest.fn(),
    getplanmembercount: jest.fn(),
    assigntrainerstoplan: jest.fn(),
    getplantrainers: jest.fn(),
    updateplantrainers: jest.fn(),
    getOneDayGyms: jest.fn(),
    getOtherGyms: jest.fn(),
    getgymplanbyplanid: jest.fn(),
    getgymplandetails: jest.fn(),
    getcustomersnearGym: jest.fn().mockResolvedValue([{ user_email: 'c@g.com', customer_name: 'C', distance_km: 1.2 }]),
  }));

  plansController = await import('../controllers/plans.controller.js');
  plansService = await import('../services/plans.service.js');

  app = express();
  app.use(express.json());

  // Wire plan routes
  app.post('/addgymplan', plansController.addGymPlan);
  app.get('/getallgymplans', plansController.getAllGymPlans);
  app.get('/getgymplanbygymid/:gymId', plansController.getGymPlanByGymId);
  app.put('/updategymplan/:gymPlanId', plansController.updateGymPlan);
  app.delete('/deletegymplan/:gymPlanId', plansController.deleteGymPlan);
  app.post('/getgymplandetails', plansController.GetGymPlanDetails);
  app.post('/assign-trainers-to-plan', plansController.assignTrainersToPlan);
  app.get('/get-plan-trainers/:planId', plansController.getPlanTrainers);
  app.put('/update-plan-trainers/:planId', plansController.updatePlanTrainers);
  app.get('/one-day', plansController.GetOneDayGyms);
  app.get('/other', plansController.GetOtherGyms);
});

afterEach(() => jest.clearAllMocks());

describe('GymService HTTP (plans controller routes)', () => {
  test('POST /addgymplan → 200 on success', async () => {
    plansService.addgymplan.mockResolvedValue({ plan_id: 'p1', gym_id: 'g1', title: 'P', price: 10, duration: '1m' });
    const res = await request(app).post('/addgymplan').send({ title: 'P' });
    expect(res.status).toBe(200);
  });

  test('GET /getallgymplans → 200/404', async () => {
    plansService.getallgymplans.mockResolvedValueOnce([{ id: 'p1' }]);
    let res = await request(app).get('/getallgymplans');
    expect(res.status).toBe(200);
    plansService.getallgymplans.mockResolvedValueOnce(null);
    res = await request(app).get('/getallgymplans');
    expect(res.status).toBe(404);
  });

  test('GET /getgymplanbygymid/:gymId → 200/404', async () => {
    plansService.getgymplanbygymid.mockResolvedValueOnce({ id: 'p1' });
    let res = await request(app).get('/getgymplanbygymid/g1');
    expect(res.status).toBe(200);
    plansService.getgymplanbygymid.mockResolvedValueOnce(null);
    res = await request(app).get('/getgymplanbygymid/g1');
    expect(res.status).toBe(404);
  });

  test('PUT /updategymplan/:gymPlanId → 200 with price change', async () => {
    plansService.getgymplanbyplanid.mockResolvedValueOnce({ price: 5, duration: '1m' });
    plansService.updategymplan.mockResolvedValueOnce({ price: 6, duration: '1m' });
    const res = await request(app).put('/updategymplan/p1').send({ price: 6 });
    expect(res.status).toBe(200);
  });

  test('DELETE /deletegymplan/:gymPlanId → 200/404', async () => {
    plansService.deletegymplan.mockResolvedValueOnce(true);
    let res = await request(app).delete('/deletegymplan/p1');
    expect(res.status).toBe(200);
    plansService.deletegymplan.mockResolvedValueOnce(false);
    res = await request(app).delete('/deletegymplan/p1');
    expect(res.status).toBe(404);
  });

  test('POST /getgymplandetails → 200', async () => {
    plansService.getgymplandetails.mockResolvedValueOnce([{ id: 'p1' }]);
    const res = await request(app).post('/getgymplandetails').send({ planIds: { planIds: ['p1'] } });
    expect(res.status).toBe(200);
  });

  test('POST /assign-trainers-to-plan → 200 success + emails mocked', async () => {
    plansService.assigntrainerstoplan.mockResolvedValueOnce({ ok: true });
    plansService.getgymplanbyplanid.mockResolvedValueOnce({ gym_id: 'g1', title: 'P', price: 10, duration: '1m' });
    const res = await request(app).post('/assign-trainers-to-plan').send({ plan_id: 'p1', trainer_ids: ['t1'] });
    expect(res.status).toBe(200);
  });

  test('GET /get-plan-trainers/:planId → 200', async () => {
    plansService.getplantrainers.mockResolvedValueOnce([{ id: 't1' }]);
    const res = await request(app).get('/get-plan-trainers/p1');
    expect(res.status).toBe(200);
  });

  test('PUT /update-plan-trainers/:planId → 200', async () => {
    plansService.updateplantrainers.mockResolvedValueOnce({ ok: true });
    const res = await request(app).put('/update-plan-trainers/p1').send({ trainer_ids: ['t1'] });
    expect(res.status).toBe(200);
  });

  test('GET /one-day and /other → 200', async () => {
    plansService.getOneDayGyms.mockResolvedValueOnce([]);
    plansService.getOtherGyms.mockResolvedValueOnce([]);
    let res = await request(app).get('/one-day');
    expect(res.status).toBe(200);
    res = await request(app).get('/other');
    expect(res.status).toBe(200);
  });
});
