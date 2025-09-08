import { supabase } from '../database/supabase.js';

// Mock supabase
jest.mock('../database/supabase.js');

import {
  addgymplan,
  getallgymplans,
  getgymplanbyplanid,
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

describe('Plans Service Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addgymplan', () => {
    test('should create gym plan successfully', async () => {
      const planData = {
        title: 'Premium Plan',
        price: 99.99,
        duration: '1 month',
        gym_id: 'gym123'
      };
      const mockResponse = {
        data: [{ plan_id: 'plan123', ...planData }],
        error: null
      };

      supabase.from.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue(mockResponse)
      });

      const result = await addgymplan(planData);

      expect(supabase.from).toHaveBeenCalledWith('Gym_plans');
      expect(result).toEqual(mockResponse.data[0]);
    });

    test('should handle trainers in plan data', async () => {
      const planData = {
        title: 'Premium Plan',
        price: 99.99,
        duration: '1 month',
        gym_id: 'gym123',
        trainers: ['trainer1', 'trainer2']
      };
      const expectedPlanData = {
        title: 'Premium Plan',
        price: 99.99,
        duration: '1 month',
        gym_id: 'gym123'
      };
      const mockResponse = {
        data: [{ plan_id: 'plan123', ...expectedPlanData }],
        error: null
      };

      supabase.from.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue(mockResponse)
      });

      const result = await addgymplan(planData);

      expect(supabase.from).toHaveBeenCalledWith('Gym_plans');
      expect(result).toEqual(mockResponse.data[0]);
    });

    test('should throw error when creation fails', async () => {
      const planData = { title: 'Test Plan' };
      const mockError = new Error('Database error');

      supabase.from.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({
          data: null,
          error: mockError
        })
      });

      await expect(addgymplan(planData)).rejects.toThrow('Database error');
    });
  });

  describe('getallgymplans', () => {
    test('should return all gym plans with gym details', async () => {
      const mockPlans = [
        {
          plan_id: 'plan1',
          title: 'Basic Plan',
          gym: { gym_name: 'Test Gym', address: '123 St' }
        }
      ];
      const mockResponse = {
        data: mockPlans,
        error: null
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue(mockResponse)
      });

      const result = await getallgymplans();

      expect(result).toEqual(mockPlans);
    });

    test('should return null when no data', async () => {
      const mockResponse = {
        data: null,
        error: null
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue(mockResponse)
      });

      const result = await getallgymplans();

      expect(result).toBeNull();
    });
  });

  describe('getgymplanbyplanid', () => {
    test('should return gym plan by ID', async () => {
      const planId = 'plan123';
      const mockPlan = { plan_id: planId, title: 'Test Plan' };
      const mockResponse = {
        data: mockPlan,
        error: null
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue(mockResponse)
      });

      const result = await getgymplanbyplanid(planId);

      expect(result).toEqual(mockPlan);
    });

    test('should return null when plan not found', async () => {
      const planId = 'nonexistent';
      const mockResponse = {
        data: null,
        error: null
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue(mockResponse)
      });

      const result = await getgymplanbyplanid(planId);

      expect(result).toBeNull();
    });
  });

  describe('getgymplanbygymid', () => {
    test('should return gym plans by gym ID', async () => {
      const gymId = 'gym123';
      const mockPlans = [{ plan_id: 'plan1', gym_id: gymId }];

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: mockPlans,
          error: null
        })
      });

      const result = await getgymplanbygymid(gymId);

      expect(result).toEqual(mockPlans);
    });

    test('should return null when no plans found', async () => {
      const gymId = 'gym123';

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: null
        })
      });

      const result = await getgymplanbygymid(gymId);

      expect(result).toBeNull();
    });
  });

  describe('updategymplan', () => {
    test('should update gym plan successfully', async () => {
      const planId = 'plan123';
      const updateData = { title: 'Updated Plan' };
      const mockUpdatedPlan = { plan_id: planId, ...updateData };

      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({
          data: [mockUpdatedPlan],
          error: null
        })
      });

      const result = await updategymplan(planId, updateData);

      expect(result).toEqual(mockUpdatedPlan);
    });

    test('should handle trainers in update data', async () => {
      const planId = 'plan123';
      const updateData = {
        title: 'Updated Plan',
        trainers: ['trainer1']
      };
      const expectedUpdateData = { title: 'Updated Plan' };
      const mockUpdatedPlan = { plan_id: planId, ...expectedUpdateData };

      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({
          data: [mockUpdatedPlan],
          error: null
        })
      });

      const result = await updategymplan(planId, updateData);

      expect(result).toEqual(mockUpdatedPlan);
    });
  });

  describe('deletegymplan', () => {
    test('should delete gym plan successfully', async () => {
      const planId = 'plan123';
      const mockDeletedPlan = { plan_id: planId };

      supabase.from.mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({
          data: [mockDeletedPlan],
          error: null
        })
      });

      const result = await deletegymplan(planId);

      expect(result).toEqual(mockDeletedPlan);
    });
  });

  describe('getplanmembercount', () => {
    test('should return member count for plan', async () => {
      const planId = 'plan123';
      const mockResponse = {
        data: [{ total_members: 15 }],
        error: null
      };

      supabase.rpc.mockResolvedValue(mockResponse);

      const result = await getplanmembercount(planId);

      expect(supabase.rpc).toHaveBeenCalledWith('member_count_per_plan', { plan_id_param: planId });
      expect(result).toBe(15);
    });

    test('should return 0 for null result', async () => {
      const planId = 'plan123';
      const mockResponse = {
        data: null,
        error: null
      };

      supabase.rpc.mockResolvedValue(mockResponse);

      const result = await getplanmembercount(planId);

      expect(result).toBe(0);
    });

    test('should return total_members from result', async () => {
      const planId = 'plan123';
      const mockResponse = {
        data: [{ total_members: 10 }],
        error: null
      };

      supabase.rpc.mockResolvedValue(mockResponse);

      const result = await getplanmembercount(planId);

      expect(result).toBe(10);
    });
  });

  describe('assigntrainerstoplan', () => {
    test('should assign trainers to plan successfully', async () => {
      const planId = 'plan123';
      const trainerIds = ['trainer1', 'trainer2'];
      const mockAssignments = [
        { gym_plan_id: planId, trainer_id: 'trainer1' },
        { gym_plan_id: planId, trainer_id: 'trainer2' }
      ];

      // Mock delete operation
      const mockDeleteQuery = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null })
      };

      // Mock insert operation
      const mockInsertQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({
          data: mockAssignments,
          error: null
        })
      };

      supabase.from
        .mockReturnValueOnce(mockDeleteQuery) // First call for delete
        .mockReturnValueOnce(mockInsertQuery); // Second call for insert

      const result = await assigntrainerstoplan(planId, trainerIds);

      expect(result).toEqual(mockAssignments);
    });

    test('should handle empty trainer list', async () => {
      const planId = 'plan123';
      const trainerIds = [];

      const mockDeleteQuery = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null })
      };

      supabase.from.mockReturnValue(mockDeleteQuery);

      const result = await assigntrainerstoplan(planId, trainerIds);

      expect(result).toEqual([]);
    });

    test('should throw error when delete fails', async () => {
      const planId = 'plan123';
      const trainerIds = ['trainer1'];
      const mockError = new Error('Delete failed');

      const mockDeleteQuery = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: mockError })
      };

      supabase.from.mockReturnValue(mockDeleteQuery);

      await expect(assigntrainerstoplan(planId, trainerIds)).rejects.toThrow('Delete failed');
    });
  });

  describe('getplantrainers', () => {
    test('should return trainers for plan', async () => {
      const planId = 'plan123';
      const mockTrainers = [
        {
          trainer_id: 'trainer1',
          trainer: { trainer_name: 'John', rating: 4.5 }
        }
      ];

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: mockTrainers,
          error: null
        })
      });

      const result = await getplantrainers(planId);

      expect(result).toEqual(mockTrainers);
    });

    test('should throw error when query fails', async () => {
      const planId = 'plan123';
      const mockError = new Error('Query failed');

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: mockError
        })
      });

      await expect(getplantrainers(planId)).rejects.toThrow('Query failed');
    });
  });

  describe('updateplantrainers', () => {
    test('should call assigntrainerstoplan', async () => {
      const planId = 'plan123';
      const trainerIds = ['trainer1', 'trainer2'];
      const mockResult = [{ gym_plan_id: planId, trainer_id: 'trainer1' }];

      assigntrainerstoplan.mockResolvedValue(mockResult);

      const result = await updateplantrainers(planId, trainerIds);

      expect(assigntrainerstoplan).toHaveBeenCalledWith(planId, trainerIds);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getOneDayGyms', () => {
    test('should return one day gyms', async () => {
      const mockGyms = [
        {
          plan_id: 'plan1',
          duration: '1 day',
          gym: { gym_name: 'Day Gym' }
        }
      ];
      const mockResponse = {
        data: mockGyms,
        error: null
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue(mockResponse)
      });

      const result = await getOneDayGyms();

      expect(result).toEqual(mockResponse);
    });

    test('should throw error when query fails', async () => {
      const mockError = new Error('Query failed');

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockRejectedValue(mockError)
      });

      await expect(getOneDayGyms()).rejects.toThrow('Query failed');
    });
  });

  describe('getOtherGyms', () => {
    test('should return gyms with duration not equal to 1 day', async () => {
      const mockGyms = [
        {
          plan_id: 'plan1',
          duration: '1 month',
          gym: { gym_name: 'Monthly Gym' }
        }
      ];
      const mockResponse = {
        data: mockGyms,
        error: null
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        neq: jest.fn().mockResolvedValue(mockResponse)
      });

      const result = await getOtherGyms();

      expect(result).toEqual(mockResponse);
    });
  });

  describe('getgymplandetails', () => {
    test('should return gym plan details for given plan IDs', async () => {
      const planIds = ['plan1', 'plan2'];
      const mockDetails = [
        {
          plan_id: 'plan1',
          title: 'Plan 1',
          gym_plan_trainers: [
            {
              trainer: {
                trainer_name: 'John',
                trainer_plans: [{ title: 'Workout A' }]
              }
            }
          ]
        }
      ];

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({
          data: mockDetails,
          error: null
        })
      });

      const result = await getgymplandetails(planIds);

      expect(result).toEqual(mockDetails);
    });

    test('should return empty array when error occurs', async () => {
      const planIds = ['plan1'];
      const mockError = new Error('Query failed');

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockRejectedValue(mockError)
      });

      const result = await getgymplandetails(planIds);

      expect(result).toEqual([]);
    });
  });
});