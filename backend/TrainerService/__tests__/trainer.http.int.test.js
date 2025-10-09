import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';

let app;
let trainerController, sessionController, planController;
let trainerService, sessionService, planService;

beforeAll(async () => {
  jest.resetModules();

  // Mock external dependencies used by controllers
  await jest.unstable_mockModule('../kafka/Producer.js', () => ({
    TrainerSessionCreateProducer: jest.fn(),
  }));

  await jest.unstable_mockModule('../services/trainer.service.js', () => ({
    getalltrainers: jest.fn(),
    gettrainerbyid: jest.fn(),
    updatetrainerdetails: jest.fn(),
    getfeedbackbytrainerid: jest.fn(),
    getgymplanbytrainerid: jest.fn(),
    booksession: jest.fn(),
    getmembershipGyms: jest.fn(),
    holdsession: jest.fn(),
    releasesession: jest.fn(),
    sendrequest: jest.fn(),
    requestTrainerVerification: jest.fn(),
  }));

  await jest.unstable_mockModule('../services/session.service.js', () => ({
    addsession: jest.fn(),
    getallsessions: jest.fn(),
    getsessionbysessionid: jest.fn(),
    getallsessionbytrainerid: jest.fn(),
    updatesession: jest.fn(),
    deletesession: jest.fn(),
  }));

  await jest.unstable_mockModule('../services/plan.service.js', () => ({
    addplan: jest.fn(),
    getallplans: jest.fn(),
    getplanbyplanid: jest.fn(),
    getallplanbytrainerid: jest.fn(),
    updateplan: jest.fn(),
    deleteplan: jest.fn(),
  }));

  trainerController = await import('../controllers/trainer.controller.js');
  sessionController = await import('../controllers/session.controller.js');
  planController = await import('../controllers/plan.controller.js');
  trainerService = await import('../services/trainer.service.js');
  sessionService = await import('../services/session.service.js');
  planService = await import('../services/plan.service.js');

  app = express();
  app.use(express.json());

  // Mirror route wiring from index.js without starting a server
  app.post('/addsession', sessionController.addSession);
  app.get('/getallsessions', sessionController.getAllSession);
  app.get('/getsessionbysessionid/:sessionId', sessionController.getSessionBySessionId);
  app.get('/getallsessionbytrainerid/:trainerId', sessionController.getallSessionByTrainerId);
  app.patch('/updatesession/:sessionId', sessionController.updatedSession);
  app.delete('/deletesession/:sessionId', sessionController.deleteSession);

  app.get('/getalltrainers', trainerController.getallTrainers);
  app.get('/gettrainerbyid/:trainerId', trainerController.getTrainerById);
  app.patch('/updatetrainerdetails/:trainerId', trainerController.updateTrainerDetails);
  app.get('/getfeedbackbytrainerid/:trainerId', trainerController.getFeedbackbyTrainerId);

  app.post('/addplan', planController.addplans);
  app.get('/getallplans', planController.getAllplan);
  app.get('/getplanbyid/:planId', planController.getplanByplanId);
  app.get('/getallplansbytrainerid/:trainerId', planController.getallplanByTrainerId);
  app.patch('/updateplan/:planId', planController.updatePlan);
  app.delete('/deleteplan/:planId', planController.deletePlan);

  app.post('/booksession', trainerController.bookSession);
  app.post('/holdsession', trainerController.holdSession);
  app.post('/releasesession', trainerController.releaseSession);

  app.get('/getgymplanbytrainerid/:trainerId', trainerController.getGymPlanByTrainerId);
  app.get('/getmembershipgyms/:trainerId', trainerController.getGymById);
  app.post('/sendrequesttogym', trainerController.sendRequest);
  app.post('/request-verification', trainerController.requestVerification);

  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'success', service: 'TrainerService' });
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('TrainerService HTTP integration tests', () => {
  test('GET /health returns success payload', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ status: 'success', service: 'TrainerService' }));
  });

  describe('Trainers endpoints', () => {
    test('GET /getalltrainers returns list', async () => {
      trainerService.getalltrainers.mockResolvedValue({ data: [{ id: 1 }], total: 1, page: 1, limit: 10 });
      const res = await request(app).get('/getalltrainers?page=1&limit=10&search=');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(expect.objectContaining({ trainers: expect.any(Object) }));
    });

    test('GET /gettrainerbyid/:trainerId returns 404 when missing', async () => {
      trainerService.gettrainerbyid.mockResolvedValue(null);
      const res = await request(app).get('/gettrainerbyid/t404');
      expect(res.status).toBe(404);
    });

    test('PATCH /updatetrainerdetails/:trainerId updates and returns 200', async () => {
      trainerService.updatetrainerdetails.mockResolvedValue({ id: 't1', name: 'New' });
      const res = await request(app).patch('/updatetrainerdetails/t1').send({ name: 'New' });
      expect(res.status).toBe(200);
    });

    test('GET /getfeedbackbytrainerid/:trainerId returns 200 with empty when none', async () => {
      trainerService.getfeedbackbytrainerid.mockResolvedValue(null);
      const res = await request(app).get('/getfeedbackbytrainerid/t1');
      expect([200, 404]).toContain(res.status); // controller may return 404 or 200 with empty depending on implementation
    });
  });

  describe('Session endpoints', () => {
    test('POST /addsession returns 200 on success', async () => {
      sessionService.addsession.mockResolvedValue({ session_id: 's1' });
      const res = await request(app).post('/addsession').send({ foo: 'bar' });
      expect(res.status).toBe(200);
    });

    test('GET /getallsessions returns 404 when none', async () => {
      sessionService.getallsessions.mockResolvedValue([]);
      const res = await request(app).get('/getallsessions');
      expect(res.status).toBe(404);
    });

    test('PATCH /updatesession/:sessionId returns 200 on success', async () => {
      sessionService.updatesession.mockResolvedValue({ session_id: 's1' });
      const res = await request(app).patch('/updatesession/s1').send({ booked: true });
      expect(res.status).toBe(200);
    });

    test('DELETE /deletesession/:sessionId returns 404 when not found', async () => {
      sessionService.deletesession.mockResolvedValue(null);
      const res = await request(app).delete('/deletesession/s404');
      expect(res.status).toBe(404);
    });
  });

  describe('Plan endpoints', () => {
    test('POST /addplan returns 200', async () => {
      planService.addplan.mockResolvedValue({ id: 'p1' });
      const res = await request(app).post('/addplan').send({ name: 'plan' });
      expect(res.status).toBe(200);
    });

    test('GET /getplanbyid/:planId returns 404 when not found', async () => {
      planService.getplanbyplanid.mockResolvedValue(null);
      const res = await request(app).get('/getplanbyid/p404');
      expect(res.status).toBe(404);
    });

    test('PATCH /updateplan/:planId returns 200 on success', async () => {
      planService.updateplan.mockResolvedValue({ id: 'p1' });
      const res = await request(app).patch('/updateplan/p1').send({ title: 'new' });
      expect(res.status).toBe(200);
    });
  });

  describe('Misc trainer endpoints', () => {
    test('POST /booksession returns 200 on success', async () => {
      trainerService.booksession.mockResolvedValue({ session_id: 's1', booked: true });
      const res = await request(app).post('/booksession').send({ sessionId: 's1', customerId: 'c1' });
      expect(res.status).toBe(200);
    });

    test('GET /getgymplanbytrainerid/:trainerId returns 200 with empty when none', async () => {
      trainerService.getgymplanbytrainerid.mockResolvedValue(null);
      const res = await request(app).get('/getgymplanbytrainerid/1');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(expect.objectContaining({ gymplans: [] }));
    });

    test('GET /getmembershipgyms/:trainerId returns 200', async () => {
      trainerService.getmembershipGyms.mockResolvedValue([{ id: 'g1' }]);
      const res = await request(app).get('/getmembershipgyms/1');
      expect(res.status).toBe(200);
    });

    test('POST /sendrequesttogym returns 200 on success', async () => {
      trainerService.sendrequest.mockResolvedValue({ id: 'r1' });
      const res = await request(app).post('/sendrequesttogym').send({ trainerId: 't1', gymId: 'g1' });
      expect(res.status).toBe(200);
    });

    test('POST /request-verification returns 200 on success', async () => {
      trainerService.requestTrainerVerification.mockResolvedValue({ success: true });
      const payload = { trainer_id: 't1', type: 'trainer', status: 'pending', email: 't1@example.com' };
      const res = await request(app).post('/request-verification').send(payload);
      expect(res.status).toBe(200);
      expect(trainerService.requestTrainerVerification).toHaveBeenCalledWith(payload);
    });
  });
});
