import {
  addGymPlan,
  getAllGymPlans,
  getGymPlanByGymId,
  updateGymPlan,
  deleteGymPlan,
  getMemberCountPerPlan,
  assignTrainersToPlan,
  getPlanTrainers,
  updatePlanTrainers,
  GetOneDayGyms,
  GetOtherGyms,
  GetGymPlanDetails
} from '../controllers/plans.controller.js';

// Mock the plans service
jest.mock('../services/plans.service.js');

import {
  addgymplan,
  getallgymplans,
  getgymplanbygymid,
  updategymplan,
  deletegymplan,
  getplanmembercount,
  assigntrainerstoplan,
  getplantrainers,
  updateplantrainers,
  getOneDayGyms,
  getOtherGyms,
  getgymplandetails
} from '../services/plans.service.js';

// Mock Kafka producers
jest.mock('../kafka/Producer.js');

import {
  GymPlanCreateProducer,
  GymPlanDeleteProducer,
  GymPlanPriceUpdateProducer
} from '../kafka/Producer.js';

describe('Plans Controller Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock request and response objects
    req = {
      body: {},
      params: {},
      query: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('addGymPlan controller', () => {
    test('should create gym plan successfully', async () => {
      const planData = {
        title: 'Premium Plan',
        price: 99.99,
        duration: '1 month',
        gym_id: 'gym123'
      };
      const mockPlan = { plan_id: 'plan123', ...planData };

      req.body = planData;
      addgymplan.mockResolvedValue(mockPlan);
      GymPlanCreateProducer.mockResolvedValue();

      await addGymPlan(req, res);

      expect(addgymplan).toHaveBeenCalledWith(planData);
      expect(GymPlanCreateProducer).toHaveBeenCalledWith('plan123', 'Premium Plan', 99.99, '1 month');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Gym plan created successfully",
        gymPlan: mockPlan
      });
    });

    test('should handle gym plan creation error', async () => {
      const planData = { title: 'Test Plan' };
      const error = new Error('Database error');

      req.body = planData;
      addgymplan.mockRejectedValue(error);

      await addGymPlan(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
        error: error.message
      });
    });
  });

  describe('getAllGymPlans controller', () => {
    test('should return all gym plans successfully', async () => {
      const mockPlans = [
        { plan_id: 'plan1', title: 'Basic Plan' },
        { plan_id: 'plan2', title: 'Premium Plan' }
      ];

      getallgymplans.mockResolvedValue(mockPlans);

      await getAllGymPlans(req, res);

      expect(getallgymplans).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Gym plans retrieved successfully",
        gymPlans: mockPlans
      });
    });

    test('should return 404 when no gym plans found', async () => {
      getallgymplans.mockResolvedValue(null);

      await getAllGymPlans(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "No gym plans found"
      });
    });
  });

  describe('getGymPlanByGymId controller', () => {
    test('should return gym plans by gym ID successfully', async () => {
      const gymId = 'gym123';
      const mockPlans = [{ plan_id: 'plan1', gym_id: gymId }];

      req.params.gymId = gymId;
      getgymplanbygymid.mockResolvedValue(mockPlans);

      await getGymPlanByGymId(req, res);

      expect(getgymplanbygymid).toHaveBeenCalledWith(gymId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Gym plan retrieved successfully",
        gymPlan: mockPlans
      });
    });

    test('should return 404 when no gym plans found for gym', async () => {
      const gymId = 'gym123';

      req.params.gymId = gymId;
      getgymplanbygymid.mockResolvedValue(null);

      await getGymPlanByGymId(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Gym plan not found"
      });
    });
  });

  describe('updateGymPlan controller', () => {
    test('should update gym plan successfully without price change', async () => {
      const gymPlanId = 'plan123';
      const updateData = { title: 'Updated Plan' };
      const mockOldPlan = { plan_id: gymPlanId, price: 50 };
      const mockUpdatedPlan = { plan_id: gymPlanId, ...updateData, price: 50 };

      req.params.gymPlanId = gymPlanId;
      req.body = updateData;
      updategymplan.mockResolvedValue(mockUpdatedPlan);

      // Mock the getgymplanbyplanid function
      const { getgymplanbyplanid } = await import('../services/plans.service.js');
      getgymplanbyplanid.mockResolvedValue(mockOldPlan);

      await updateGymPlan(req, res);

      expect(updategymplan).toHaveBeenCalledWith(gymPlanId, updateData);
      expect(GymPlanPriceUpdateProducer).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Gym plan updated successfully",
        updatedGymPlan: mockUpdatedPlan
      });
    });

    test('should update gym plan successfully with price change', async () => {
      const gymPlanId = 'plan123';
      const updateData = { price: 75 };
      const mockOldPlan = { plan_id: gymPlanId, price: 50, duration: '1 month' };
      const mockUpdatedPlan = { plan_id: gymPlanId, price: 75, duration: '1 month' };

      req.params.gymPlanId = gymPlanId;
      req.body = updateData;
      updategymplan.mockResolvedValue(mockUpdatedPlan);
      GymPlanPriceUpdateProducer.mockResolvedValue();

      // Mock the getgymplanbyplanid function
      const { getgymplanbyplanid } = await import('../services/plans.service.js');
      getgymplanbyplanid.mockResolvedValue(mockOldPlan);

      await updateGymPlan(req, res);

      expect(GymPlanPriceUpdateProducer).toHaveBeenCalledWith(gymPlanId, 75, '1 month');
    });

    test('should return 404 when gym plan not found', async () => {
      const gymPlanId = 'nonexistent';

      req.params.gymPlanId = gymPlanId;
      req.body = { title: 'Updated' };
      updategymplan.mockResolvedValue(null);

      await updateGymPlan(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Gym plan not found"
      });
    });
  });

  describe('deleteGymPlan controller', () => {
    test('should delete gym plan successfully', async () => {
      const gymPlanId = 'plan123';
      const mockDeletedPlan = { plan_id: gymPlanId };

      req.params.gymPlanId = gymPlanId;
      deletegymplan.mockResolvedValue(mockDeletedPlan);
      GymPlanDeleteProducer.mockResolvedValue();

      await deleteGymPlan(req, res);

      expect(deletegymplan).toHaveBeenCalledWith(gymPlanId);
      expect(GymPlanDeleteProducer).toHaveBeenCalledWith(gymPlanId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Gym plan deleted successfully"
      });
    });

    test('should return 404 when gym plan not found', async () => {
      const gymPlanId = 'nonexistent';

      req.params.gymPlanId = gymPlanId;
      deletegymplan.mockResolvedValue(null);

      await deleteGymPlan(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Gym plan not found"
      });
    });
  });

  describe('getMemberCountPerPlan controller', () => {
    test('should return member count successfully', async () => {
      const planId = 'plan123';
      const memberCount = { total_members: 15 };

      req.params.plan_id = planId;
      getplanmembercount.mockResolvedValue(memberCount);

      await getMemberCountPerPlan(req, res);

      expect(getplanmembercount).toHaveBeenCalledWith(planId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Member count retrieved successfully",
        count: memberCount
      });
    });

    test('should return 404 when plan not found', async () => {
      const planId = 'nonexistent';

      req.params.plan_id = planId;
      getplanmembercount.mockResolvedValue(null);

      await getMemberCountPerPlan(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Plan not found or no members"
      });
    });
  });

  describe('assignTrainersToPlan controller', () => {
    test('should assign trainers successfully', async () => {
      const planId = 'plan123';
      const trainerIds = ['trainer1', 'trainer2'];
      const mockResult = [{ gym_plan_id: planId, trainer_id: 'trainer1' }];

      req.body = { plan_id: planId, trainer_ids: trainerIds };
      assigntrainerstoplan.mockResolvedValue(mockResult);

      await assignTrainersToPlan(req, res);

      expect(assigntrainerstoplan).toHaveBeenCalledWith(planId, trainerIds);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Trainers assigned to plan successfully",
        data: mockResult
      });
    });

    test('should handle assignment error', async () => {
      const planId = 'plan123';
      const trainerIds = ['trainer1'];
      const error = new Error('Assignment failed');

      req.body = { plan_id: planId, trainer_ids: trainerIds };
      assigntrainerstoplan.mockRejectedValue(error);

      await assignTrainersToPlan(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
        error: error.message
      });
    });
  });

  describe('getPlanTrainers controller', () => {
    test('should return plan trainers successfully', async () => {
      const planId = 'plan123';
      const mockTrainers = [{ trainer_id: 't1', trainer_name: 'John' }];

      req.params.planId = planId;
      getplantrainers.mockResolvedValue(mockTrainers);

      await getPlanTrainers(req, res);

      expect(getplantrainers).toHaveBeenCalledWith(planId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Plan trainers retrieved successfully",
        data: mockTrainers
      });
    });

    test('should handle retrieval error', async () => {
      const planId = 'plan123';
      const error = new Error('Database error');

      req.params.planId = planId;
      getplantrainers.mockRejectedValue(error);

      await getPlanTrainers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
        error: error.message
      });
    });
  });

  describe('updatePlanTrainers controller', () => {
    test('should update plan trainers successfully', async () => {
      const planId = 'plan123';
      const trainerIds = ['trainer1', 'trainer3'];
      const mockResult = [{ gym_plan_id: planId, trainer_id: 'trainer1' }];

      req.params.planId = planId;
      req.body.trainer_ids = trainerIds;
      updateplantrainers.mockResolvedValue(mockResult);

      await updatePlanTrainers(req, res);

      expect(updateplantrainers).toHaveBeenCalledWith(planId, trainerIds);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Plan trainers updated successfully",
        data: mockResult
      });
    });
  });

  describe('GetOneDayGyms controller', () => {
    test('should return one day gyms successfully', async () => {
      const mockGyms = [{ gym_id: 'gym1', duration: '1 day' }];

      getOneDayGyms.mockResolvedValue({ data: mockGyms });

      await GetOneDayGyms(req, res);

      expect(getOneDayGyms).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "One day gyms retrieved successfully",
        gyms: { data: mockGyms }
      });
    });

    test('should handle error retrieving one day gyms', async () => {
      const error = new Error('Database error');

      getOneDayGyms.mockRejectedValue(error);

      await GetOneDayGyms(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
        error: error.message
      });
    });
  });

  describe('GetOtherGyms controller', () => {
    test('should return other gyms successfully', async () => {
      const mockGyms = [{ gym_id: 'gym1', duration: '1 month' }];

      getOtherGyms.mockResolvedValue({ data: mockGyms });

      await GetOtherGyms(req, res);

      expect(getOtherGyms).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Other gyms retrieved successfully",
        gyms: { data: mockGyms }
      });
    });
  });

  describe('GetGymPlanDetails controller', () => {
    test('should return gym plan details successfully', async () => {
      const planIds = { planIds: { planIds: ['plan1', 'plan2'] } };
      const mockDetails = [
        { plan_id: 'plan1', title: 'Plan 1' },
        { plan_id: 'plan2', title: 'Plan 2' }
      ];

      req.body = planIds;
      getgymplandetails.mockResolvedValue(mockDetails);

      await GetGymPlanDetails(req, res);

      expect(getgymplandetails).toHaveBeenCalledWith(['plan1', 'plan2']);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Gym plan details retrieved successfully",
        planDetails: mockDetails
      });
    });

    test('should handle error retrieving gym plan details', async () => {
      const planIds = { planIds: { planIds: ['plan1'] } };
      const error = new Error('Database error');

      req.body = planIds;
      getgymplandetails.mockRejectedValue(error);

      await GetGymPlanDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
        error: error.message
      });
    });
  });
});