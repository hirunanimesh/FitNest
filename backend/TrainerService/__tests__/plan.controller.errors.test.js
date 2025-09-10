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

describe('PlanController negative and error-path tests', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = { params: {}, body: {} };
    mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
    jest.clearAllMocks();
  });

  test('addplans - service error returns 500', async () => {
    mockReq.body = { name: 'p' };
    planService.addplan.mockRejectedValue(new Error('insert fail'));
    await planController.addplans(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
  });

  test('getAllplan - service error returns 500', async () => {
    planService.getallplans.mockRejectedValue(new Error('read fail'));
    await planController.getAllplan(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
  });

  test('getplanByplanId - returns 404 when not found', async () => {
    mockReq.params.planId = 'p1';
    planService.getplanbyplanid.mockResolvedValue(null);
    await planController.getplanByplanId(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(404);
  });

  test('getplanByplanId - service error returns 500', async () => {
    mockReq.params.planId = 'p1';
    planService.getplanbyplanid.mockRejectedValue(new Error('db'));
    await planController.getplanByplanId(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
  });

  test('getallplanByTrainerId - returns 404 when none', async () => {
    mockReq.params.trainerId = '1';
    // return an object with null plans so controller can destructure safely and take the 404 branch
    planService.getallplanbytrainerid.mockResolvedValue({ plans: null, totalCount: 0 });
    await planController.getallplanByTrainerId(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(404);
  });

  test('getallplanByTrainerId - service error returns 500', async () => {
    mockReq.params.trainerId = '1';
    planService.getallplanbytrainerid.mockRejectedValue(new Error('fail'));
    await planController.getallplanByTrainerId(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
  });

  test('updatePlan - returns 404 when not found', async () => {
    mockReq.params.planId = 'p1';
    mockReq.body = { title: 'new' };
    planService.updateplan.mockResolvedValue(null);
    await planController.updatePlan(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(404);
  });

  test('updatePlan - service error returns 500', async () => {
    mockReq.params.planId = 'p1';
    planService.updateplan.mockRejectedValue(new Error('update fail'));
    await planController.updatePlan(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
  });

  test('deletePlan - returns 404 when not found', async () => {
    mockReq.params.planId = 'p1';
    planService.deleteplan.mockResolvedValue(null);
    await planController.deletePlan(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(404);
  });

  test('deletePlan - service error returns 500', async () => {
    mockReq.params.planId = 'p1';
    planService.deleteplan.mockRejectedValue(new Error('delete fail'));
    await planController.deletePlan(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
  });
});
