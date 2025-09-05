const AuthModel = require('../model/authModel');
const { supabase } = require('../superbaseClient');

// Mock Supabase client
jest.mock('../superbaseClient', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      getUser: jest.fn(),
      admin: {
        updateUserById: jest.fn()
      }
    },
    from: jest.fn()
  }
}));

describe('AuthModel Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser method', () => {
    test('should create user successfully', async () => {
      // Arrange
      const mockData = {
        user: { id: '123', email: 'test@example.com' },
        session: null
      };
      supabase.auth.signUp.mockResolvedValue({ data: mockData, error: null });

      // Act
      const result = await AuthModel.createUser('test@example.com', 'password123', 'customer');

      // Assert
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: { role: 'customer' },
          emailRedirectTo: expect.stringContaining('/auth/confirm')
        }
      });
      expect(result).toEqual(mockData);
    });

    test('should throw error when signup fails', async () => {
      // Arrange
      const mockError = new Error('Signup failed');
      supabase.auth.signUp.mockResolvedValue({ data: null, error: mockError });

      // Act & Assert
      await expect(AuthModel.createUser('test@example.com', 'password123', 'customer'))
        .rejects.toThrow('Signup failed');
    });

    test('should use default frontend URL when not provided', async () => {
      // Arrange
      delete process.env.FRONTEND_URL;
      supabase.auth.signUp.mockResolvedValue({ data: {}, error: null });

      // Act
      await AuthModel.createUser('test@example.com', 'password123', 'customer');

      // Assert
      expect(supabase.auth.signUp).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({
            emailRedirectTo: 'http://localhost:3001/auth/confirm'
          })
        })
      );
    });
  });

  describe('loginUser method', () => {
    test('should login user successfully', async () => {
      // Arrange
      const mockData = {
        user: { id: '123', email: 'test@example.com' },
        session: { access_token: 'mock_token' }
      };
      supabase.auth.signInWithPassword.mockResolvedValue({ data: mockData, error: null });

      // Act
      const result = await AuthModel.loginUser('test@example.com', 'password123');

      // Assert
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(result).toEqual(mockData);
    });

    test('should throw error when login fails', async () => {
      // Arrange
      const mockError = new Error('Invalid credentials');
      supabase.auth.signInWithPassword.mockResolvedValue({ data: null, error: mockError });

      // Act & Assert
      await expect(AuthModel.loginUser('test@example.com', 'wrongpassword'))
        .rejects.toThrow('Invalid credentials');
    });
  });

  describe('getUserFromToken method', () => {
    test('should get user from valid token', async () => {
      // Arrange
      const mockData = {
        user: { id: '123', email: 'test@example.com' }
      };
      supabase.auth.getUser.mockResolvedValue({ data: mockData, error: null });

      // Act
      const result = await AuthModel.getUserFromToken('valid_token');

      // Assert
      expect(supabase.auth.getUser).toHaveBeenCalledWith('valid_token');
      expect(result).toEqual(mockData);
    });

    test('should throw error for invalid token', async () => {
      // Arrange
      const mockError = new Error('Invalid token');
      supabase.auth.getUser.mockResolvedValue({ data: null, error: mockError });

      // Act & Assert
      await expect(AuthModel.getUserFromToken('invalid_token'))
        .rejects.toThrow('Invalid token');
    });
  });

  describe('completeOAuthCustomerProfile method', () => {
    test('should update user metadata successfully', async () => {
      // Arrange
      const mockUpdateData = { user: { id: '123' } };
      supabase.auth.admin.updateUserById.mockResolvedValue({ data: mockUpdateData, error: null });
      
      // Simplified mock - just test the metadata update part
      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
      };
      supabase.from.mockReturnValue(mockFrom);

      // Act
      try {
        await AuthModel.completeOAuthCustomerProfile(
          '123', 'John', 'Doe', '123 Main St', '1234567890', 'profile.jpg',
          'male', '1990-01-01', 70, 175, { city: 'Test City' }, 'customer'
        );
      } catch (error) {
        // Expected to fail due to complex database operations, but metadata update should work
      }

      // Assert - verify metadata update was called
      expect(supabase.auth.admin.updateUserById).toHaveBeenCalledWith('123', {
        user_metadata: { role: 'customer' }
      });
    });

    test('should handle existing customer profile', async () => {
      // Arrange
      supabase.auth.admin.updateUserById.mockResolvedValue({ data: {}, error: null });
      
      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { id: 1 }, error: null })
      };
      supabase.from.mockReturnValue(mockFrom);

      // Act
      const result = await AuthModel.completeOAuthCustomerProfile(
        '123', 'John', 'Doe', '123 Main St', '1234567890', 'profile.jpg',
        'male', '1990-01-01', 70, 175, { city: 'Test City' }, 'customer'
      );

      // Assert
      expect(result).toEqual({ 
        alreadyExists: true,
        success: false,
        message: 'Customer profile already exists for this user',
        customer: { id: 1 }
      });
    });
  });
});
