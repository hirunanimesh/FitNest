import { jest } from '@jest/globals';

let trainerController;
let trainerService;

beforeAll(async () => {
  jest.resetModules();
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
        requestTrainerVerification: jest.fn(),
        sendrequest: jest.fn(),
  }));

  trainerController = await import('../controllers/trainer.controller.js');
  trainerService = await import('../services/trainer.service.js');
});

describe('TrainerController Unit Tests (AuthService style)', () => {
  let mockReq, mockRes;

  beforeEach(() => {
  mockReq = { params: {}, query: {}, body: {} };
  mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis(), cookie: jest.fn().mockReturnThis(), send: jest.fn().mockReturnThis() };
  jest.clearAllMocks();
  });

  test('getallTrainers returns 200', async () => {
    mockReq.query = { page: '1', limit: '10', search: '' };
    const result = { data: [{ id: 1 }], total: 1, page: 1, limit: 10 };
    trainerService.getalltrainers.mockResolvedValue(result);

    await trainerController.getallTrainers(mockReq, mockRes);

    expect(trainerService.getalltrainers).toHaveBeenCalledWith(1, 10, '');
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});
