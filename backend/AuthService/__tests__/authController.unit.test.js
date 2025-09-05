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
});
