const AuthController = require('../controllers/AuthController');
const authModel = require('../model/authModel');
const { uploadImage } = require('../config/cloudinary');

// Mock the dependencies
jest.mock('../model/authModel');
jest.mock('../config/cloudinary');

describe('AuthController Unit Tests', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      body: {},
      headers: {},
      file: null
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis()
    };

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('login method', () => {
    test('should login user successfully with valid credentials', async () => {
      // Arrange
      mockReq.body = { email: 'test@example.com', password: 'password123' };
      const mockUserData = {
        user: { id: '123', email: 'test@example.com', user_metadata: { role: 'customer' } },
        session: { access_token: 'mock_token' }
      };
      authModel.loginUser.mockResolvedValue(mockUserData);

      // Act
      await AuthController.login(mockReq, mockRes);

      // Assert
      expect(authModel.loginUser).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Login successful',
        user: mockUserData.user,
        role: 'customer',
        session: mockUserData.session
      });
    });

    test('should handle login failure with invalid credentials', async () => {
      // Arrange
      mockReq.body = { email: 'test@example.com', password: 'wrongpassword' };
      authModel.loginUser.mockRejectedValue(new Error('Invalid credentials'));

      // Act
      await AuthController.login(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Login failed',
        error: 'Invalid credentials'
      });
    });

    test('should handle email not confirmed error', async () => {
      // Arrange
      mockReq.body = { email: 'test@example.com', password: 'password123' };
      const error = new Error('Email not confirmed');
      error.code = 'email_not_confirmed';
      authModel.loginUser.mockRejectedValue(error);

      // Act
      await AuthController.login(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Please check your email and click the confirmation link before logging in',
        error: 'Email not confirmed',
        code: 'email_not_confirmed'
      });
    });

    test('should use default role when user role is not provided', async () => {
      // Arrange
      mockReq.body = { email: 'test@example.com', password: 'password123' };
      const mockUserData = {
        user: { id: '123', email: 'test@example.com', user_metadata: {} },
        session: { access_token: 'mock_token' }
      };
      authModel.loginUser.mockResolvedValue(mockUserData);

      // Act
      await AuthController.login(mockReq, mockRes);

      // Assert
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'customer' })
      );
    });
  });

  describe('getUserInfo method', () => {
    test('should return user info with valid token', async () => {
      // Arrange
      mockReq.headers.authorization = 'Bearer valid_token';
      const mockUserData = {
        user: { id: '123', email: 'test@example.com', user_metadata: { role: 'trainer' } }
      };
      authModel.getUserFromToken.mockResolvedValue(mockUserData);

      // Act
      await AuthController.getUserInfo(mockReq, mockRes);

      // Assert
      expect(authModel.getUserFromToken).toHaveBeenCalledWith('valid_token');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        user: mockUserData.user,
        role: 'trainer'
      });
    });

    test('should handle missing authorization header', async () => {
      // Arrange
      mockReq.headers = {};

      // Act
      await AuthController.getUserInfo(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authorization token required'
      });
    });

    test('should handle invalid authorization header format', async () => {
      // Arrange
      mockReq.headers.authorization = 'InvalidFormat token';

      // Act
      await AuthController.getUserInfo(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authorization token required'
      });
    });

    test('should handle invalid token error', async () => {
      // Arrange
      mockReq.headers.authorization = 'Bearer invalid_token';
      authModel.getUserFromToken.mockRejectedValue(new Error('Invalid token'));

      // Act
      await AuthController.getUserInfo(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token',
        error: 'Invalid token'
      });
    });
  });

  describe('createUser method', () => {
    test('should create user successfully with valid data', async () => {
      // Arrange
      mockReq.body = { email: 'newuser@example.com', password: 'password123', role: 'customer' };
      const mockCreateResult = {
        user: { id: '456', email: 'newuser@example.com' },
        session: null
      };
      authModel.createUser.mockResolvedValue(mockCreateResult);

      // Act
      await AuthController.createUser(mockReq, mockRes);

      // Assert
      expect(authModel.createUser).toHaveBeenCalledWith('newuser@example.com', 'password123', 'customer');
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'User created successfully',
        user: mockCreateResult.user
      });
    });

    test('should handle user creation failure', async () => {
      // Arrange
      mockReq.body = { email: 'existing@example.com', password: 'password123', role: 'customer' };
      authModel.createUser.mockRejectedValue(new Error('User already exists'));

      // Act
      await AuthController.createUser(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to create user',
        error: 'User already exists'
      });
    });
  });

  // Additional controller coverage merged from authController.more.unit.test.js
  describe('completeOAuthProfile', () => {
    test('handles location as JSON string and returns created profile', async () => {
      const req = global.createMockRequest({
        body: {
          user_id: 'u1',
          firstName: 'A',
          lastName: 'B',
          address: 'addr',
          phoneNo: '111',
          gender: 'male',
          birthday: '2000-01-01',
          weight: 70,
          height: 175,
          userRole: 'customer',
          location: '{"city":"X"}',
          profileImage: 'url'
        }
      });
      const res = global.createMockResponse();
      authModel.completeOAuthCustomerProfile.mockResolvedValue({ id: 9 });

      await AuthController.completeOAuthProfile(req, res);

      expect(authModel.completeOAuthCustomerProfile).toHaveBeenCalledWith(
        'u1', 'A', 'B', 'addr', '111', 'url', 'male', '2000-01-01', 70, 175, { city: 'X' }, 'customer'
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    test('returns alreadyExists=true path', async () => {
      const req = global.createMockRequest({ body: { user_id: 'u1' } });
      const res = global.createMockResponse();
      authModel.completeOAuthCustomerProfile.mockResolvedValue({ alreadyExists: true, customer: { id: 1 } });

      await AuthController.completeOAuthProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ alreadyExists: true }));
    });

    test('handles model error -> 500', async () => {
      const req = global.createMockRequest({ body: { user_id: 'u1' } });
      const res = global.createMockResponse();
      authModel.completeOAuthCustomerProfile.mockRejectedValue(new Error('boom'));
      await AuthController.completeOAuthProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('completeOAuthTrainerProfile', () => {
    test('missing user_id returns 400', async () => {
      const req = global.createMockRequest({ body: { nameWithInitials: 'T' } });
      const res = global.createMockResponse();
      await AuthController.completeOAuthTrainerProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('parses documents JSON string and returns created trainer', async () => {
      const req = global.createMockRequest({
        body: {
          user_id: 'uuid-1',
          nameWithInitials: 'T',
          contactNo: '222',
          bio: 'bio',
          skills: ['s'],
          experience: 2,
          profileImage: 'img',
          documents: '["a","b"]',
          userRole: 'trainer'
        }
      });
      const res = global.createMockResponse();
      authModel.completeOAuthTrainerProfile.mockResolvedValue({ id: 7 });
      await AuthController.completeOAuthTrainerProfile(req, res);
      expect(authModel.completeOAuthTrainerProfile).toHaveBeenCalledWith(
        'uuid-1', 'T', '222', 'bio', ['s'], 2, 'img', ['a', 'b'], 'trainer'
      );
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('alreadyExists path', async () => {
      const req = global.createMockRequest({ body: { user_id: 'uuid-1' } });
      const res = global.createMockResponse();
      authModel.completeOAuthTrainerProfile.mockResolvedValue({ alreadyExists: true, trainer: { id: 2 } });
      await AuthController.completeOAuthTrainerProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('error -> 500', async () => {
      const req = global.createMockRequest({ body: { user_id: 'uuid-1' } });
      const res = global.createMockResponse();
      authModel.completeOAuthTrainerProfile.mockRejectedValue(new Error('bad'));
      await AuthController.completeOAuthTrainerProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('completeOAuthGymProfile', () => {
    test('missing user_id returns 400', async () => {
      const req = global.createMockRequest({ body: {} });
      const res = global.createMockResponse();
      await AuthController.completeOAuthGymProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('parses documents and returns created gym', async () => {
      const req = global.createMockRequest({
        body: {
          user_id: 'uuid-2', gymName: 'G', ownerName: 'O', email: 'g@e.com', contactNo: '333', address: 'ad',
          description: 'd', location: '{"lat":1}', operatingHours: '8-5', profileImage: 'img', documents: '["doc1"]', userRole: 'gym'
        }
      });
      const res = global.createMockResponse();
      authModel.completeOAuthGymProfile.mockResolvedValue({ id: 11 });
      await AuthController.completeOAuthGymProfile(req, res);
      expect(authModel.completeOAuthGymProfile).toHaveBeenCalledWith(
        'uuid-2','G','O','g@e.com','333','ad','d','{"lat":1}','8-5','img',['doc1'],'gym'
      );
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('alreadyExists path', async () => {
      const req = global.createMockRequest({ body: { user_id: 'uuid-2' } });
      const res = global.createMockResponse();
      authModel.completeOAuthGymProfile.mockResolvedValue({ alreadyExists: true, gym: { id: 4 } });
      await AuthController.completeOAuthGymProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('error -> 500', async () => {
      const req = global.createMockRequest({ body: { user_id: 'uuid-2' } });
      const res = global.createMockResponse();
      authModel.completeOAuthGymProfile.mockRejectedValue(new Error('err'));
      await AuthController.completeOAuthGymProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('customerRegister', () => {
    test('uploads file and proceeds when upload succeeds', async () => {
      const req = global.createMockRequest({
        body: {
          email: 'e@e.com', password: 'p', role: 'customer', firstName: 'A', lastName: 'B', address: 'ad', phoneNo: '444',
          gender: 'm', birthday: '2000-01-01', weight: '70', height: '175', location: '{"c":"x"}'
        },
        file: { buffer: Buffer.from('x') }
      });
      const res = global.createMockResponse();
      uploadImage.mockResolvedValue({ secure_url: 'https://img' });
      authModel.customerRegister.mockResolvedValue({ id: 1 });

      await AuthController.customerRegister(req, res);
      expect(uploadImage).toHaveBeenCalled();
      expect(authModel.customerRegister).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('continues when upload fails', async () => {
      const req = global.createMockRequest({ body: { email: 'e@e.com' }, file: { buffer: Buffer.from('x') } });
      const res = global.createMockResponse();
      uploadImage.mockRejectedValue(new Error('upload fail'));
      authModel.customerRegister.mockResolvedValue({ id: 2 });
      await AuthController.customerRegister(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('handles user already exists -> 422', async () => {
      const req = global.createMockRequest({ body: {} });
      const res = global.createMockResponse();
      const err = new Error('User already registered');
      err.code = 'user_already_exists';
      authModel.customerRegister.mockRejectedValue(err);
      await AuthController.customerRegister(req, res);
      expect(res.status).toHaveBeenCalledWith(422);
    });

    test('general error -> 500', async () => {
      const req = global.createMockRequest({ body: {} });
      const res = global.createMockResponse();
      authModel.customerRegister.mockRejectedValue(new Error('db down'));
      await AuthController.customerRegister(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('GymRegister', () => {
    test('success', async () => {
      const req = global.createMockRequest({ body: { email: 'g@e.com' } });
      const res = global.createMockResponse();
      authModel.GymRegister.mockResolvedValue({ id: 3 });
      await AuthController.GymRegister(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('already exists -> 422', async () => {
      const req = global.createMockRequest({ body: {} });
      const res = global.createMockResponse();
      const err = new Error('User already registered');
      err.code = 'user_already_exists';
      authModel.GymRegister.mockRejectedValue(err);
      await AuthController.GymRegister(req, res);
      expect(res.status).toHaveBeenCalledWith(422);
    });

    test('general error -> 500', async () => {
      const req = global.createMockRequest({ body: {} });
      const res = global.createMockResponse();
      authModel.GymRegister.mockRejectedValue(new Error('boom'));
      await AuthController.GymRegister(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('TrainerRegister', () => {
    test('requires email confirmation path', async () => {
      const req = global.createMockRequest({ body: { email: 't@e.com' } });
      const res = global.createMockResponse();
      authModel.TrainerRegister.mockResolvedValue({ requiresConfirmation: true, message: 'Please confirm', user: { id: 'u' } });
      await AuthController.TrainerRegister(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ requiresConfirmation: true }));
    });

    test('success normal', async () => {
      const req = global.createMockRequest({ body: { email: 't@e.com' } });
      const res = global.createMockResponse();
      authModel.TrainerRegister.mockResolvedValue({ id: 5 });
      await AuthController.TrainerRegister(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('already exists -> 422', async () => {
      const req = global.createMockRequest({ body: {} });
      const res = global.createMockResponse();
      const err = new Error('User already registered');
      err.code = 'user_already_exists';
      authModel.TrainerRegister.mockRejectedValue(err);
      await AuthController.TrainerRegister(req, res);
      expect(res.status).toHaveBeenCalledWith(422);
    });

    test('general error -> 500', async () => {
      const req = global.createMockRequest({ body: {} });
      const res = global.createMockResponse();
      authModel.TrainerRegister.mockRejectedValue(new Error('xx'));
      await AuthController.TrainerRegister(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
