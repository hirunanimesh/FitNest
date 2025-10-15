import express from 'express';
import request from 'supertest';
import { jest } from '@jest/globals';

// Mock the underlying service methods used by trainer.controller
const mockSvc = {
  holdsession: jest.fn(),
  releasesession: jest.fn(),
};

// Use ESM unstable_mockModule to replace service module with our mocks
let trainerController;
beforeAll(async () => {
  await jest.unstable_mockModule('../services/trainer.service.js', () => ({
    getmembershipGyms: jest.fn(),
    getgymplanbytrainerid: jest.fn(),
    getfeedbackbytrainerid: jest.fn(),
    getalltrainers: jest.fn(),
    gettrainerbyid: jest.fn(),
    updatetrainerdetails: jest.fn(),
    booksession: jest.fn(),
    sendrequest: jest.fn(),
    requestTrainerVerification: jest.fn(),
    holdsession: mockSvc.holdsession,
    releasesession: mockSvc.releasesession,
  }));
  trainerController = await import('../controllers/trainer.controller.js');
});

describe('TrainerService HTTP - holdsession conflict', () => {
  let app;
  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.post('/holdsession', trainerController.holdSession);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('returns 409 when session already held/booked', async () => {
    // First attempt succeeds => returns a truthy lock object
    mockSvc.holdsession.mockResolvedValueOnce({ id: 'sess1', heldBy: 'cust1' });
    // Second attempt fails => service indicates already booked
    mockSvc.holdsession.mockResolvedValueOnce(null);

    const first = await request(app)
      .post('/holdsession')
      .send({ sessionId: 'sess1', customerId: 'cust1' });
    expect(first.status).toBe(200);

    const second = await request(app)
      .post('/holdsession')
      .send({ sessionId: 'sess1', customerId: 'cust2' });
    expect(second.status).toBe(409);
    expect(second.body).toEqual(expect.objectContaining({ success: false }));
  });
});
