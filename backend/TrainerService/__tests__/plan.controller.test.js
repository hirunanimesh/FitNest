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

describe('PlanController Unit Tests', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = { params: {}, body: {} };
    mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
    jest.clearAllMocks();
  });

  test('addplans success', async () => {
    mockReq.body = { name: 'plan' };
    planService.addplan.mockResolvedValue({ id: 'p1' });
    await planController.addplans(mockReq, mockRes);
    expect(planService.addplan).toHaveBeenCalledWith(mockReq.body);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  test('getAllplan returns 404 when none', async () => {
    planService.getallplans.mockResolvedValue([]);
    await planController.getAllplan(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(404);
  });

  test('getplanByplanId found', async () => {
    mockReq.params.planId = 'p1';
    planService.getplanbyplanid.mockResolvedValue([{ id: 'p1' }]);
    await planController.getplanByplanId(mockReq, mockRes);
    expect(planService.getplanbyplanid).toHaveBeenCalledWith('p1');
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  test('getallplanByTrainerId returns plans', async () => {
    mockReq.params.trainerId = '1';
    planService.getallplanbytrainerid.mockResolvedValue({ plans: [{ id: 'p1' }], totalCount: 1});
    await planController.getallplanByTrainerId(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  test('updatePlan success', async () => {
    mockReq.params.planId = 'p1';
    mockReq.body = { title: 'new' };
    planService.updateplan.mockResolvedValue({ id: 'p1' });
    await planController.updatePlan(mockReq, mockRes);
    expect(planService.updateplan).toHaveBeenCalledWith('p1', mockReq.body);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  test('deletePlan success', async () => {
    mockReq.params.planId = 'p1';
    planService.deleteplan.mockResolvedValue({ id: 'p1' });
    await planController.deletePlan(mockReq, mockRes);
    expect(planService.deleteplan).toHaveBeenCalledWith('p1');
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});
