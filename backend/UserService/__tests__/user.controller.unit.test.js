const userController = require('../controllers/user.controller');
const userService = require('../services/user.service');
const feedbackService = require('../services/feedback.service');

// Mock the dependencies
jest.mock('../services/user.service');
jest.mock('../services/feedback.service');

describe('UserController Unit Tests (AuthService style)', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = { params: {}, body: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    jest.clearAllMocks();
  });

  describe('updateuserdetails', () => {
    test('should update user successfully and return 200', async () => {
      mockReq.params.userId = '123';
      mockReq.body = { name: 'Alice' };
      const updated = { id: '123', name: 'Alice' };
      userService.updateUserDetails.mockResolvedValue(updated);

      await userController.updateuserdetails(mockReq, mockRes);

      expect(userService.updateUserDetails).toHaveBeenCalledWith('123', mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'User updated successfully', updatedUser: updated });
    });

    test('should return 404 when user not found', async () => {
      mockReq.params.userId = '404';
      userService.updateUserDetails.mockResolvedValue(null);

      await userController.updateuserdetails(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    test('should return 500 on service error', async () => {
      mockReq.params.userId = 'err';
      userService.updateUserDetails.mockRejectedValue(new Error('DB error'));

      await userController.updateuserdetails(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Internal server error' }));
    });
  });

  describe('getuserbyid', () => {
    test('should return user when found', async () => {
      mockReq.params.userId = 'u1';
      const user = { id: 'u1', email: 'a@b.com' };
      userService.getUserById.mockResolvedValue(user);

      await userController.getuserbyid(mockReq, mockRes);

      expect(userService.getUserById).toHaveBeenCalledWith('u1');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'User retrieved successfully', user });
    });

    test('should return 404 when not found', async () => {
      mockReq.params.userId = 'missing';
      userService.getUserById.mockResolvedValue(null);

      await userController.getuserbyid(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    test('should return 500 on error', async () => {
      mockReq.params.userId = 'err';
      userService.getUserById.mockRejectedValue(new Error('fail'));

      await userController.getuserbyid(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Internal server error' }));
    });
  });

  describe('addweight', () => {
    test('should add weight successfully', async () => {
      mockReq.body = { customer_id: 'u1', weight: 70 };
      const weight = { id: 'w1', weight: 70 };
      userService.addWeight.mockResolvedValue(weight);

      await userController.addweight(mockReq, mockRes);

      expect(userService.addWeight).toHaveBeenCalledWith(mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Weight add successfully', weight });
    });

    test('should return 500 on service error', async () => {
      mockReq.body = {};
      userService.addWeight.mockRejectedValue(new Error('insert fail'));

      await userController.addweight(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Internal server error' }));
    });
  });

  describe('getweightbyid', () => {
    test('should return weights list when found', async () => {
      mockReq.params.userId = 'u1';
      const weights = [{ weight: 70 }];
      userService.getWeightById.mockResolvedValue(weights);

      await userController.getweightbyid(mockReq, mockRes);

      expect(userService.getWeightById).toHaveBeenCalledWith('u1');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Weight retrieved successfully', weight: weights });
    });

    test('should return 404 when not found', async () => {
      mockReq.params.userId = 'none';
      userService.getWeightById.mockResolvedValue(null);

      await userController.getweightbyid(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Weight plan not found' });
    });

    test('should return 500 on error', async () => {
      mockReq.params.userId = 'err';
      userService.getWeightById.mockRejectedValue(new Error('fail'));

      await userController.getweightbyid(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Internal server error' }));
    });
  });

  describe('getlatestweightbyid', () => {
    test('should return latest weight when found', async () => {
      mockReq.params.userId = 'u1';
      const latest = { height: 170, weight: 70 };
      userService.getLatestWeightById.mockResolvedValue(latest);

      await userController.getlatestweightbyid(mockReq, mockRes);

      expect(userService.getLatestWeightById).toHaveBeenCalledWith('u1');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Weight retrieved successfully', weight: latest });
    });

    test('should return 404 when not found', async () => {
      mockReq.params.userId = 'none';
      userService.getLatestWeightById.mockResolvedValue(null);

      await userController.getlatestweightbyid(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Weight  not found' });
    });

    test('should return 500 on error', async () => {
      mockReq.params.userId = 'err';
      userService.getLatestWeightById.mockRejectedValue(new Error('fail'));

      await userController.getlatestweightbyid(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Internal server error' }));
    });
  });

  describe('addfeedback', () => {
    test('should add feedback successfully', async () => {
      mockReq.body = { customer_id: 'u1', comment: 'Great' };
      const fb = { id: 'f1', comment: 'Great' };
      feedbackService.addFeedback.mockResolvedValue(fb);

      await userController.addfeedback(mockReq, mockRes);

      expect(feedbackService.addFeedback).toHaveBeenCalledWith(mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'feedback add successfully', feedback: fb });
    });

    test('should return 500 on feedback error', async () => {
      mockReq.body = {};
      feedbackService.addFeedback.mockRejectedValue(new Error('fail'));

      await userController.addfeedback(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Internal server error' }));
    });
  });
});
