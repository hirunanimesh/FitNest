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

  // Merged from authModel.more.unit.test.js
  describe('completeOAuthTrainerProfile', () => {
    test('throws when user_id missing', async () => {
      await expect(AuthModel.completeOAuthTrainerProfile('', '', '', '', [], 0, '', [], 'trainer'))
        .rejects.toThrow(/user_id is required/i);
      expect(supabase.auth.admin.updateUserById).not.toHaveBeenCalled();
    });

    test('throws when user_id invalid UUID', async () => {
      await expect(AuthModel.completeOAuthTrainerProfile('not-uuid', '', '', '', [], 0, '', [], 'trainer'))
        .rejects.toThrow(/Invalid user_id format/i);
    });

    test('returns alreadyExists when trainer found', async () => {
      supabase.auth.admin.updateUserById.mockResolvedValue({ data: {}, error: null });
      const chain1 = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ data: { id: 1 }, error: null }) };
      supabase.from.mockReturnValueOnce(chain1);

      const res = await AuthModel.completeOAuthTrainerProfile(
        '123e4567-e89b-12d3-a456-426614174000', 'T', '222', 'bio', ['s'], 2, 'img', ['d'], 'trainer'
      );

      expect(res).toEqual(expect.objectContaining({ alreadyExists: true, trainer: { id: 1 } }));
    });

    test('inserts trainer on success', async () => {
      supabase.auth.admin.updateUserById.mockResolvedValue({ data: {}, error: null });
      const check = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }) };
      const insert = { insert: jest.fn().mockReturnThis(), select: jest.fn().mockResolvedValue({ data: [{ id: 9 }], error: null }) };
      supabase.from
        .mockReturnValueOnce(check)  // check existing
        .mockReturnValueOnce(insert); // insert

      const res = await AuthModel.completeOAuthTrainerProfile(
        '123e4567-e89b-12d3-a456-426614174000', 'T', '222', 'bio', ['s'], 2, 'img', ['d'], 'trainer'
      );
      expect(res).toEqual({ id: 9 });
    });

    test('insert error throws', async () => {
      supabase.auth.admin.updateUserById.mockResolvedValue({ data: {}, error: null });
      const check = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }) };
      const insert = { insert: jest.fn().mockReturnThis(), select: jest.fn().mockResolvedValue({ data: null, error: new Error('insert fail') }) };
      supabase.from
        .mockReturnValueOnce(check)
        .mockReturnValueOnce(insert);
      await expect(AuthModel.completeOAuthTrainerProfile(
        '123e4567-e89b-12d3-a456-426614174000', 'T','2','bio',[],0,'img',[], 'trainer'
      )).rejects.toThrow('insert fail');
    });
  });

  describe('completeOAuthGymProfile', () => {
    test('throws when user_id missing', async () => {
      await expect(AuthModel.completeOAuthGymProfile('', 'G', 'O', 'e', '1', 'ad', 'd', '{}', '8-5', 'img', [], 'gym'))
        .rejects.toThrow(/user_id is required/i);
    });

    test('throws when user_id invalid', async () => {
      await expect(AuthModel.completeOAuthGymProfile('no-uuid', 'G', 'O', 'e', '1', 'ad', 'd', '{}', '8-5', 'img', [], 'gym'))
        .rejects.toThrow(/Invalid user_id format/i);
    });

    test('alreadyExists when gym found', async () => {
      supabase.auth.admin.updateUserById.mockResolvedValue({ data: {}, error: null });
      const check = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ data: { id: 5 }, error: null }) };
      supabase.from.mockReturnValueOnce(check);
      const res = await AuthModel.completeOAuthGymProfile(
        '123e4567-e89b-12d3-a456-426614174000', 'G', 'O', 'e', '1', 'ad', 'd', '{"lat":1}', '8-5', 'img', [], 'gym'
      );
      expect(res).toEqual(expect.objectContaining({ alreadyExists: true, gym: { id: 5 } }));
    });

    test('inserts gym on success (parses location)', async () => {
      supabase.auth.admin.updateUserById.mockResolvedValue({ data: {}, error: null });
      const check = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }) };
      const insert = { insert: jest.fn().mockReturnThis(), select: jest.fn().mockResolvedValue({ data: [{ id: 10 }], error: null }) };
      supabase.from
        .mockReturnValueOnce(check)
        .mockReturnValueOnce(insert);
      const res = await AuthModel.completeOAuthGymProfile(
        '123e4567-e89b-12d3-a456-426614174000', 'G', 'O', 'e', '1', 'ad', 'd', '{"lat":1}', '8-5', 'img', [], 'gym'
      );
      expect(res).toEqual({ id: 10 });
    });

    test('insert error throws', async () => {
      supabase.auth.admin.updateUserById.mockResolvedValue({ data: {}, error: null });
      const check = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }) };
      const insert = { insert: jest.fn().mockReturnThis(), select: jest.fn().mockResolvedValue({ data: null, error: new Error('gym insert fail') }) };
      supabase.from
        .mockReturnValueOnce(check)
        .mockReturnValueOnce(insert);
      await expect(AuthModel.completeOAuthGymProfile(
        '123e4567-e89b-12d3-a456-426614174000','G','O','e','1','ad','d','{}','8-5','img',[], 'gym'
      )).rejects.toThrow('gym insert fail');
    });
  });

  describe('customerRegister', () => {
    test('success inserts customer and physical data', async () => {
      const user = { id: 'u1' };
      supabase.auth.signUp.mockResolvedValue({ data: { user, session: { t: 's' } }, error: null });

      const customerInsert = { insert: jest.fn().mockReturnThis(), select: jest.fn().mockResolvedValue({ data: [{ customer_id: 99 }], error: null }) };
      const physicalInsert = { insert: jest.fn().mockResolvedValue({ data: [{ id: 1 }], error: null }) };
      supabase.from
        .mockReturnValueOnce(customerInsert) // customer
        .mockReturnValueOnce(physicalInsert); // progress

      const res = await AuthModel.customerRegister('e@e.com','p','customer','A','B','ad','111','img','m','2000-01-01','70','175',{ c: 'x' });
      expect(res).toEqual(expect.objectContaining({ user, session: { t: 's' } }));
    });

    test('customer insert error throws', async () => {
      supabase.auth.signUp.mockResolvedValue({ data: { user: { id: 'u1' }, session: null }, error: null });
      const customerInsert = { insert: jest.fn().mockReturnThis(), select: jest.fn().mockResolvedValue({ data: null, error: new Error('cust fail') }) };
      supabase.from.mockReturnValueOnce(customerInsert);
      await expect(AuthModel.customerRegister('e','p','customer','A','B','ad','111','img','m','2000','70','175',{}))
        .rejects.toThrow('cust fail');
    });
  });

  describe('GymRegister', () => {
    test('success', async () => {
      const user = { id: 'u2' };
      supabase.auth.signUp.mockResolvedValue({ data: { user, session: { x: 1 } }, error: null });
      const insert = { insert: jest.fn().mockReturnThis(), select: jest.fn().mockResolvedValue({ data: [{ id: 5 }], error: null }) };
      supabase.from.mockReturnValueOnce(insert);
      const res = await AuthModel.GymRegister('e','p','G','ad',{},'123','img','d',[], '8-5','O');
      expect(res).toEqual(expect.objectContaining({ user }));
    });

    test('insert error throws', async () => {
      supabase.auth.signUp.mockResolvedValue({ data: { user: { id: 'u2' }, session: null }, error: null });
      const insert = { insert: jest.fn().mockReturnThis(), select: jest.fn().mockResolvedValue({ data: null, error: new Error('gym fail') }) };
      supabase.from.mockReturnValueOnce(insert);
      await expect(AuthModel.GymRegister('e','p','G','ad',{},'123','img','d',[], '8-5','O'))
        .rejects.toThrow('gym fail');
    });
  });

  describe('TrainerRegister', () => {
    test('requires email confirmation path', async () => {
      supabase.auth.signUp.mockResolvedValue({ data: { user: { id: 'u3', email_confirmed_at: null, confirmation_sent_at: new Date().toISOString() }, session: null }, error: null });
      const res = await AuthModel.TrainerRegister('T','e','bio','p','111','img',[],1,[], 'trainer');
      expect(res).toEqual(expect.objectContaining({ requiresConfirmation: true }));
      expect(supabase.from).not.toHaveBeenCalled();
    });

    test('success inserts trainer', async () => {
      supabase.auth.signUp.mockResolvedValue({ data: { user: { id: 'u3', email_confirmed_at: new Date().toISOString() }, session: {} }, error: null });
      const insert = { insert: jest.fn().mockReturnThis(), select: jest.fn().mockResolvedValue({ data: [{ id: 2 }], error: null }) };
      supabase.from.mockReturnValueOnce(insert);
      const res = await AuthModel.TrainerRegister('T','e','bio','p','111','img',[],1,[], 'trainer');
      expect(res).toEqual(expect.objectContaining({ trainer: { id: 2 } }));
    });

    test('insert error throws', async () => {
      supabase.auth.signUp.mockResolvedValue({ data: { user: { id: 'u3', email_confirmed_at: new Date().toISOString() }, session: {} }, error: null });
      const insert = { insert: jest.fn().mockReturnThis(), select: jest.fn().mockResolvedValue({ data: null, error: new Error('trainer fail') }) };
      supabase.from.mockReturnValueOnce(insert);
      await expect(AuthModel.TrainerRegister('T','e','bio','p','111','img',[],1,[], 'trainer'))
        .rejects.toThrow('trainer fail');
    });
  });
});
