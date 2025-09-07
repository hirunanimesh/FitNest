import {
  addGym,
  getAllGyms,
  getGymById,
  getGymByUserId,
  updateGymDetails,
  getTotalGymMemberCount,
  getTrainers,
  approveTrainer,
  getGymTrainerCount,
  getAllGymUsers
} from '../controllers/gym.controller.js';

// Mock the gym service
jest.mock('../services/gym.service.js');

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

describe('Gym Controller Unit Tests', () => {
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

  describe('addGym controller', () => {
    test('should create gym successfully', async () => {
      const gymData = {
        gym_name: 'Test Gym',
        address: '123 Test St',
        user_id: 'user123'
      };
      const mockGym = { gym_id: 'gym123', ...gymData };

      req.body = gymData;
      createGym.mockResolvedValue(mockGym);

      await addGym(req, res);

      expect(createGym).toHaveBeenCalledWith(gymData);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Gym created successfully",
        gym: mockGym
      });
    });

    test('should handle gym creation error', async () => {
      const gymData = { gym_name: 'Test Gym' };
      const error = new Error('Database error');

      req.body = gymData;
      createGym.mockRejectedValue(error);

      await addGym(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
        error: error.message
      });
    });
  });

  describe('getAllGyms controller', () => {
    test('should return gyms successfully with default pagination', async () => {
      const mockGyms = {
        data: [{ gym_id: 'gym1', gym_name: 'Gym 1' }],
        total: 1,
        page: 1,
        limit: 12,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      };

      getallgyms.mockResolvedValue(mockGyms);

      await getAllGyms(req, res);

      expect(getallgyms).toHaveBeenCalledWith(1, 12, '', '');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Gyms retrieved successfully",
        gyms: mockGyms
      });
    });

    test('should handle search and location filters', async () => {
      req.query = { page: '2', limit: '6', search: 'fitness', location: 'NYC' };

      const mockGyms = {
        data: [],
        total: 0,
        page: 2,
        limit: 6,
        totalPages: 0,
        hasNext: false,
        hasPrev: true
      };

      getallgyms.mockResolvedValue(mockGyms);

      await getAllGyms(req, res);

      expect(getallgyms).toHaveBeenCalledWith(2, 6, 'fitness', 'NYC');
    });

    test('should handle service error', async () => {
      const error = new Error('Database connection failed');
      getallgyms.mockRejectedValue(error);

      await getAllGyms(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
        error: error.message
      });
    });
  });

  describe('getGymById controller', () => {
    test('should return gym successfully', async () => {
      const gymId = 'gym123';
      const mockGym = { gym_id: gymId, gym_name: 'Test Gym' };

      req.params.gymId = gymId;
      getgymbyid.mockResolvedValue(mockGym);

      await getGymById(req, res);

      expect(getgymbyid).toHaveBeenCalledWith(gymId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Gym retrieved successfully",
        gym: mockGym
      });
    });

    test('should return 404 when gym not found', async () => {
      const gymId = 'nonexistent';

      req.params.gymId = gymId;
      getgymbyid.mockResolvedValue(null);

      await getGymById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Gym not found"
      });
    });

    test('should handle service error', async () => {
      const gymId = 'gym123';
      const error = new Error('Database error');

      req.params.gymId = gymId;
      getgymbyid.mockRejectedValue(error);

      await getGymById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
        error: error.message
      });
    });
  });

  describe('getGymByUserId controller', () => {
    test('should return gym successfully', async () => {
      const userId = 'user123';
      const mockGym = { gym_id: 'gym123', user_id: userId };

      req.params.userId = userId;
      getgymbyuserid.mockResolvedValue(mockGym);

      await getGymByUserId(req, res);

      expect(getgymbyuserid).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Gym retrieved successfully",
        gym: mockGym
      });
    });

    test('should return 404 when gym not found', async () => {
      const userId = 'nonexistent';

      req.params.userId = userId;
      getgymbyuserid.mockResolvedValue(null);

      await getGymByUserId(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Gym not found"
      });
    });
  });

  describe('updateGymDetails controller', () => {
    test('should update gym successfully', async () => {
      const gymId = 'gym123';
      const updateData = { gym_name: 'Updated Gym' };
      const mockUpdatedGym = { gym_id: gymId, ...updateData };

      req.params.gymId = gymId;
      req.body = updateData;
      updategymdetails.mockResolvedValue(mockUpdatedGym);

      await updateGymDetails(req, res);

      expect(updategymdetails).toHaveBeenCalledWith(gymId, updateData);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Gym updated successfully",
        updatedGym: mockUpdatedGym
      });
    });

    test('should return 404 when gym not found', async () => {
      const gymId = 'nonexistent';
      const updateData = { gym_name: 'Updated Gym' };

      req.params.gymId = gymId;
      req.body = updateData;
      updategymdetails.mockResolvedValue(null);

      await updateGymDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Gym not found"
      });
    });
  });

  describe('getTotalGymMemberCount controller', () => {
    test('should return member count successfully', async () => {
      const gymId = 'gym123';
      const memberCount = 25;

      req.params.gymId = gymId;
      gettotalmembercount.mockResolvedValue(memberCount);

      await getTotalGymMemberCount(req, res);

      expect(gettotalmembercount).toHaveBeenCalledWith(gymId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Member count retrieved successfully",
        member_count: memberCount
      });
    });

    test('should return 404 when gym not found', async () => {
      const gymId = 'nonexistent';

      req.params.gymId = gymId;
      gettotalmembercount.mockResolvedValue(null);

      await getTotalGymMemberCount(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Gym not found or no members"
      });
    });
  });

  describe('getTrainers controller', () => {
    test('should return trainers successfully', async () => {
      const gymId = 'gym123';
      const mockTrainers = [{ trainer_id: 't1', trainer_name: 'John Doe' }];

      req.params.gymId = gymId;
      getgymtrainers.mockResolvedValue(mockTrainers);

      await getTrainers(req, res);

      expect(getgymtrainers).toHaveBeenCalledWith(gymId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Trainers retrive successfully",
        trainers_data: mockTrainers
      });
    });

    test('should return 404 when no trainers found', async () => {
      const gymId = 'gym123';

      req.params.gymId = gymId;
      getgymtrainers.mockResolvedValue(null);

      await getTrainers(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "fetching trainers error"
      });
    });
  });

  describe('approveTrainer controller', () => {
    test('should approve trainer successfully', async () => {
      const requestId = 'req123';
      const mockResult = [{ request_id: requestId, approved: true }];

      req.params.request_id = requestId;
      approvetrainer.mockResolvedValue(mockResult);

      await approveTrainer(req, res);

      expect(approvetrainer).toHaveBeenCalledWith(requestId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Approved trainer request",
        approve: mockResult,
        success: true
      });
    });

    test('should return 404 when approval fails', async () => {
      const requestId = 'req123';

      req.params.request_id = requestId;
      approvetrainer.mockResolvedValue(null);

      await approveTrainer(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Not approved request!",
        success: false
      });
    });
  });

  describe('getGymTrainerCount controller', () => {
    test('should return trainer count successfully', async () => {
      const gymId = 'gym123';
      const trainerCount = 5;

      req.params.gymId = gymId;
      getgymtrainercount.mockResolvedValue(trainerCount);

      await getGymTrainerCount(req, res);

      expect(getgymtrainercount).toHaveBeenCalledWith(gymId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Trainers count retrive successfully",
        trainers_count: trainerCount
      });
    });

    test('should handle zero trainer count', async () => {
      const gymId = 'gym123';

      req.params.gymId = gymId;
      getgymtrainercount.mockResolvedValue(0);

      await getGymTrainerCount(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "No trainers found",
        trainers_count: 0
      });
    });
  });

  describe('getAllGymUsers controller', () => {
    test('should return users successfully', async () => {
      const customerIds = ['user1', 'user2'];
      const mockUsers = [
        { id: 'user1', name: 'John' },
        { id: 'user2', name: 'Jane' }
      ];

      req.body.customerIds = customerIds;
      getAllGymUsersByIds.mockResolvedValue(mockUsers);

      await getAllGymUsers(req, res);

      expect(getAllGymUsersByIds).toHaveBeenCalledWith(customerIds);
      expect(res.json).toHaveBeenCalledWith({
        customers: mockUsers
      });
    });

    test('should return 400 for missing customerIds', async () => {
      req.body = {};

      await getAllGymUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "customerIds must be a non-empty array"
      });
    });

    test('should return 400 for empty customerIds array', async () => {
      req.body.customerIds = [];

      await getAllGymUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "customerIds must be a non-empty array"
      });
    });

    test('should return 400 for non-array customerIds', async () => {
      req.body.customerIds = 'not-an-array';

      await getAllGymUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "customerIds must be a non-empty array"
      });
    });

    test('should return 404 when no customers found', async () => {
      const customerIds = ['user1'];

      req.body.customerIds = customerIds;
      getAllGymUsersByIds.mockResolvedValue([]);

      await getAllGymUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "No customers found for given IDs"
      });
    });
  });
});