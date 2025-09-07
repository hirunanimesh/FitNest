import { supabase } from '../database/supabase.js';

// Mock supabase
jest.mock('../database/supabase.js');

import {
  createGym,
  getallgyms,
  getgymbyid,
  getgymbyuserid,
  updategymdetails,
  gettotalmembercount,
  getgymtrainers,
  approvetrainer,
  getgymtrainercount,
  getAllGymUsersByIds
} from '../services/gym.service.js';

describe('Gym Service Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createGym', () => {
    test('should create gym successfully', async () => {
      const gymData = {
        gym_name: 'Test Gym',
        address: '123 Test St',
        user_id: 'user123'
      };
      const mockResponse = {
        data: [{ gym_id: 'gym123', ...gymData }],
        error: null
      };

      supabase.from.mockReturnValue({

        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(mockResponse)
        })
      });

      const result = await createGym(gymData);

      expect(supabase.from).toHaveBeenCalledWith('gym');
      expect(result).toEqual(mockResponse.data[0]);
    });

    test('should throw error when creation fails', async () => {
      const gymData = { gym_name: 'Test Gym' };
      const mockError = new Error('Database error');

      supabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: null,
            error: mockError
          })
        })
      });

      await expect(createGym(gymData)).rejects.toThrow('Database error');
    });
  });

  describe('getallgyms', () => {
    test('should retrieve gyms with default parameters', async () => {
      const mockData = [
        { gym_id: 'gym1', gym_name: 'Gym 1' },
        { gym_id: 'gym2', gym_name: 'Gym 2' }
      ];
      const mockResponse = {
        data: mockData,
        error: null,
        count: 2
      };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue(mockResponse)
      };

      supabase.from.mockReturnValue(mockQuery);

      const result = await getallgyms();

      expect(result).toEqual({
        data: mockData,
        total: 2,
        page: 1,
        limit: 12,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      });
    });

    test('should apply search filter', async () => {
      const mockResponse = {
        data: [{ gym_id: 'gym1', gym_name: 'Fitness Center' }],
        error: null,
        count: 1
      };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue(mockResponse)
      };

      supabase.from.mockReturnValue(mockQuery);

      await getallgyms(1, 12, 'fitness', '');

      expect(mockQuery.ilike).toHaveBeenCalledWith('gym_name', '%fitness%');
    });

    test('should apply location filter', async () => {
      const mockResponse = {
        data: [{ gym_id: 'gym1', address: 'NYC' }],
        error: null,
        count: 1
      };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue(mockResponse)
      };

      supabase.from.mockReturnValue(mockQuery);

      await getallgyms(1, 12, '', 'NYC');

      expect(mockQuery.or).toHaveBeenCalledWith(`address.ilike.%NYC%,location.ilike.%NYC%`);
    });

    test('should handle pagination', async () => {
      const mockResponse = {
        data: [{ gym_id: 'gym1' }],
        error: null,
        count: 25
      };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue(mockResponse)
      };

      supabase.from.mockReturnValue(mockQuery);

      const result = await getallgyms(2, 10);

      expect(mockQuery.range).toHaveBeenCalledWith(10, 19);
      expect(result.totalPages).toBe(3);
      expect(result.hasNext).toBe(true);
      expect(result.hasPrev).toBe(true);
    });
  });

  describe('getgymbyid', () => {
    test('should return gym when found', async () => {
      const gymId = 'gym123';
      const mockGym = { gym_id: gymId, gym_name: 'Test Gym' };
      const mockResponse = {
        data: mockGym,
        error: null
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue(mockResponse)
      });

      const result = await getgymbyid(gymId);

      expect(result).toEqual(mockGym);
    });

    test('should return null when gym not found', async () => {
      const gymId = 'nonexistent';
      const mockResponse = {
        data: null,
        error: null
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue(mockResponse)
      });

      const result = await getgymbyid(gymId);

      expect(result).toBeNull();
    });

    test('should throw error when query fails', async () => {
      const gymId = 'gym123';
      const mockError = new Error('Database error');

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: mockError
        })
      });

      await expect(getgymbyid(gymId)).rejects.toThrow('Database error');
    });
  });

  describe('getgymbyuserid', () => {
    test('should return gym for user', async () => {
      const userId = 'user123';
      const mockGym = { gym_id: 'gym123', user_id: userId };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockGym,
          error: null
        })
      });

      const result = await getgymbyuserid(userId);

      expect(result).toEqual(mockGym);
    });

    test('should return null when no gym found for user', async () => {
      const userId = 'user123';

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: null
        })
      });

      const result = await getgymbyuserid(userId);

      expect(result).toBeNull();
    });
  });

  describe('updategymdetails', () => {
    test('should update gym successfully', async () => {
      const gymId = 'gym123';
      const updateData = { gym_name: 'Updated Gym' };
      const mockUpdatedGym = { gym_id: gymId, ...updateData };

      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({
          data: [mockUpdatedGym],
          error: null
        })
      });

      const result = await updategymdetails(gymId, updateData);

      expect(result).toEqual(mockUpdatedGym);
    });

    test('should throw error when update fails', async () => {
      const gymId = 'gym123';
      const updateData = { gym_name: 'Updated Gym' };
      const mockError = new Error('Update failed');

      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({
          data: null,
          error: mockError
        })
      });

      await expect(updategymdetails(gymId, updateData)).rejects.toThrow('Update failed');
    });
  });

  describe('gettotalmembercount', () => {
    test('should return member count', async () => {
      const gymId = 'gym123';
      const mockResponse = {
        data: { total_members: 25 },
        error: null
      };

      supabase.rpc.mockResolvedValue(mockResponse);

      const result = await gettotalmembercount(gymId);

      expect(supabase.rpc).toHaveBeenCalledWith('get_gym_member_count', { gym_id_param: gymId });
      expect(result).toBe(25);
    });

    test('should return 0 for null result', async () => {
      const gymId = 'gym123';
      const mockResponse = {
        data: null,
        error: null
      };

      supabase.rpc.mockResolvedValue(mockResponse);

      const result = await gettotalmembercount(gymId);

      expect(result).toBe(0);
    });

    test('should return 0 for zero result', async () => {
      const gymId = 'gym123';
      const mockResponse = {
        data: { total_members: 0 },
        error: null
      };

      supabase.rpc.mockResolvedValue(mockResponse);

      const result = await gettotalmembercount(gymId);

      expect(result).toBe(0);
    });

    test('should throw error when RPC fails', async () => {
      const gymId = 'gym123';
      const mockError = new Error('RPC error');

      supabase.rpc.mockRejectedValue(mockError);

      await expect(gettotalmembercount(gymId)).rejects.toThrow('RPC error');
    });
  });

  describe('getgymtrainers', () => {
    test('should return trainers for gym', async () => {
      const gymId = 'gym123';
      const mockTrainers = [
        { request_id: 'req1', trainer: { trainer_name: 'John' } }
      ];

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: mockTrainers,
          error: null
        })
      });

      const result = await getgymtrainers(gymId);

      expect(result).toEqual(mockTrainers);
    });

    test('should return 0 for null data', async () => {
      const gymId = 'gym123';

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: null
        })
      });

      const result = await getgymtrainers(gymId);

      expect(result).toBe(0);
    });

    test('should return 0 for zero data', async () => {
      const gymId = 'gym123';

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: 0,
          error: null
        })
      });

      const result = await getgymtrainers(gymId);

      expect(result).toBe(0);
    });
  });

  describe('approvetrainer', () => {
    test('should approve trainer successfully', async () => {
      const requestId = 'req123';
      const mockResult = [{ request_id: requestId, approved: true }];

      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({
          data: mockResult,
          error: null
        })
      });

      const result = await approvetrainer(requestId);

      expect(result).toEqual(mockResult);
    });
  });

  describe('getgymtrainercount', () => {
    test('should return trainer count', async () => {
      const gymId = 'gym123';
      const mockResponse = {
        data: { trainer_count: 5 },
        error: null
      };

      supabase.rpc.mockResolvedValue(mockResponse);

      const result = await getgymtrainercount(gymId);

      expect(supabase.rpc).toHaveBeenCalledWith('get_gym_trainer_count', { gym_id_input: gymId });
      expect(result).toBe(5);
    });

    test('should return 0 for null result', async () => {
      const gymId = 'gym123';
      const mockResponse = {
        data: null,
        error: null
      };

      supabase.rpc.mockResolvedValue(mockResponse);

      const result = await getgymtrainercount(gymId);

      expect(result).toBe(0);
    });
  });

  describe('getAllGymUsersByIds', () => {
    test('should return users for given IDs', async () => {
      const customerIds = ['user1', 'user2'];
      const mockUsers = [
        { id: 'user1', name: 'John' },
        { id: 'user2', name: 'Jane' }
      ];

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({
          data: mockUsers,
          error: null
        })
      });

      const result = await getAllGymUsersByIds(customerIds);

      expect(result).toEqual(mockUsers);
    });

    test('should throw error when query fails', async () => {
      const customerIds = ['user1'];
      const mockError = new Error('Query failed');

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({
          data: null,
          error: mockError
        })
      });

      await expect(getAllGymUsersByIds(customerIds)).rejects.toThrow('Query failed');
    });
  });
});