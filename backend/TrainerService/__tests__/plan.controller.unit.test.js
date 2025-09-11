import { jest } from '@jest/globals';

let planController;
let planService;

beforeAll(async () => {
  await jest.unstable_mockModule('../services/plan.service.js', () => ({
    addplan: jest.fn(),
    getallplans: jest.fn(),
    getplanbyplanid: jest.fn(),
    getallplanbytrainerid: jest.fn(),
    updateplan: jest.fn(),
    deleteplan: jest.fn(),
  }));

  planController = await import('../controllers/plan.controller.js');
  planService = await import('../services/plan.service.js');
});

describe('PlanController Unit Tests (unit)', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = { params: {}, body: {}, query: {} };
    mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
    jest.clearAllMocks();
  });

  test('addplans - success', async () => {
    mockReq.body = { title: 'p' };
    planService.addplan.mockResolvedValue({ id: 'p1' });
    await planController.addplans(mockReq, mockRes);
    expect(planService.addplan).toHaveBeenCalledWith(mockReq.body);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  test('addplans - service error returns 500', async () => {
    planService.addplan.mockRejectedValue(new Error('insert fail'));
    await planController.addplans(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
  });

  test('getAllplan - returns 404 when none', async () => {
    planService.getallplans.mockResolvedValue([]);
    await planController.getAllplan(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(404);
  });

  test('getAllplan - service error returns 500', async () => {
    planService.getallplans.mockRejectedValue(new Error('fail'));
    await planController.getAllplan(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
  });
});
