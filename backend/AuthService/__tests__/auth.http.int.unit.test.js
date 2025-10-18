const express = require('express');
const request = require('supertest');

// Mock multer middleware to be a no-op so we can send JSON bodies easily
jest.mock('../config/multer', () => ({
  single: () => (req, res, next) => next(),
  none: () => (req, res, next) => next(),
}));

// Mock cloudinary upload to avoid real calls in customer register
jest.mock('../config/cloudinary', () => ({
  uploadImage: jest.fn().mockResolvedValue({ secure_url: 'https://img.example/test.jpg' }),
}));

// Mock Supabase client connectivity used by /api/auth/health
jest.mock('../superbaseClient', () => ({
  supabase: { auth: {}, from: jest.fn() },
  testConnection: jest.fn().mockResolvedValue(true),
}));

// Mock model to control controller behavior in API tests
jest.mock('../model/authModel', () => ({
  createUser: jest.fn(),
  loginUser: jest.fn(),
  getUserFromToken: jest.fn(),
  completeOAuthCustomerProfile: jest.fn(),
  completeOAuthTrainerProfile: jest.fn(),
  completeOAuthGymProfile: jest.fn(),
  customerRegister: jest.fn(),
  GymRegister: jest.fn(),
  TrainerRegister: jest.fn(),
}));

const authModel = require('../model/authModel');

describe('AuthService HTTP API (controllers via routes)', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    const authRoutes = require('../Routes/authRoutes');
    app.use('/api/auth', authRoutes);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Auth basics', () => {
    test('POST /api/auth/login -> 200 on success', async () => {
      authModel.loginUser.mockResolvedValue({ user: { id: 'u1', user_metadata: { role: 'customer' } }, session: { access_token: 't' } });
      const res = await request(app).post('/api/auth/login').send({ email: 'e@e.com', password: 'p' });
      expect(res.status).toBe(200);
      expect(res.body).toEqual(expect.objectContaining({ success: true, role: 'customer' }));
    });

    test('POST /api/auth/login -> 400 email_not_confirmed', async () => {
      const err = new Error('Please confirm');
      err.code = 'email_not_confirmed';
      authModel.loginUser.mockRejectedValue(err);
      const res = await request(app).post('/api/auth/login').send({ email: 'e@e.com', password: 'p' });
      expect(res.status).toBe(400);
      expect(res.body).toEqual(expect.objectContaining({ code: 'email_not_confirmed' }));
    });

    test('POST /api/auth/login -> 401 on generic error', async () => {
      authModel.loginUser.mockRejectedValue(new Error('bad'));
      const res = await request(app).post('/api/auth/login').send({ email: 'e@e.com', password: 'p' });
      expect(res.status).toBe(401);
    });

    test('GET /api/auth/user -> 401 when missing token', async () => {
      const res = await request(app).get('/api/auth/user');
      expect(res.status).toBe(401);
    });

    test('GET /api/auth/user -> 200 with valid token', async () => {
      authModel.getUserFromToken.mockResolvedValue({ user: { id: 'u2', user_metadata: { role: 'trainer' } } });
      const res = await request(app)
        .get('/api/auth/user')
        .set('Authorization', 'Bearer abc');
      expect(authModel.getUserFromToken).toHaveBeenCalledWith('abc');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(expect.objectContaining({ success: true, role: 'trainer' }));
    });
  });

  describe('Signup', () => {
    test('POST /api/auth/signup -> 201 on success', async () => {
      authModel.createUser.mockResolvedValue({ user: { id: 'u' } });
      const res = await request(app).post('/api/auth/signup').send({ email: 'n@e.com', password: 'p', role: 'customer' });
      expect(res.status).toBe(201);
      expect(res.body).toEqual(expect.objectContaining({ success: true }));
    });

    test('POST /api/auth/signup -> 500 on error', async () => {
      authModel.createUser.mockRejectedValue(new Error('fail'));
      const res = await request(app).post('/api/auth/signup').send({ email: 'n@e.com', password: 'p', role: 'customer' });
      expect(res.status).toBe(500);
    });
  });

  describe('OAuth profile completion', () => {
    test('POST /api/auth/oauth/complete-profile -> 201 on success', async () => {
      authModel.completeOAuthCustomerProfile.mockResolvedValue({ id: 1 });
      const res = await request(app)
        .post('/api/auth/oauth/complete-profile')
        .send({ user_id: 'u1', firstName: 'A', lastName: 'B', userRole: 'customer' });
      expect(res.status).toBe(201);
    });

    test('POST /api/auth/oauth/complete-profile -> 200 when already exists', async () => {
      authModel.completeOAuthCustomerProfile.mockResolvedValue({ alreadyExists: true, customer: { id: 9 } });
      const res = await request(app)
        .post('/api/auth/oauth/complete-profile')
        .send({ user_id: 'u1' });
      expect(res.status).toBe(200);
      expect(res.body).toEqual(expect.objectContaining({ alreadyExists: true }));
    });

    test('POST /api/auth/oauth/complete-profile -> 500 on error', async () => {
      authModel.completeOAuthCustomerProfile.mockRejectedValue(new Error('boom'));
      const res = await request(app)
        .post('/api/auth/oauth/complete-profile')
        .send({ user_id: 'u1' });
      expect(res.status).toBe(500);
    });

    test('POST /api/auth/oauth/complete-profile-trainer -> 400 when missing user_id', async () => {
      const res = await request(app)
        .post('/api/auth/oauth/complete-profile-trainer')
        .send({ nameWithInitials: 'T' });
      expect(res.status).toBe(400);
    });

    test('POST /api/auth/oauth/complete-profile-gym -> 400 when missing user_id', async () => {
      const res = await request(app)
        .post('/api/auth/oauth/complete-profile-gym')
        .send({ gymName: 'G' });
      expect(res.status).toBe(400);
    });
  });

  describe('Registrations', () => {
    test('POST /api/auth/customer/register -> 201 on success', async () => {
      authModel.customerRegister.mockResolvedValue({ id: 1 });
      const res = await request(app)
        .post('/api/auth/customer/register')
        .send({ email: 'e@e.com', password: 'p', role: 'customer', firstName: 'A', lastName: 'B' });
      expect(res.status).toBe(201);
    });

    test('POST /api/auth/customer/register -> 422 when already exists', async () => {
      const err = new Error('User already registered');
      err.code = 'user_already_exists';
      authModel.customerRegister.mockRejectedValue(err);
      const res = await request(app)
        .post('/api/auth/customer/register')
        .send({ email: 'e@e.com', password: 'p' });
      expect(res.status).toBe(422);
    });

    test('POST /api/auth/trainer/register -> 200 when confirmation required', async () => {
      authModel.TrainerRegister.mockResolvedValue({ requiresConfirmation: true, message: 'Confirm your email', user: { id: 'u' } });
      const res = await request(app)
        .post('/api/auth/trainer/register')
        .send({ email: 't@e.com', password: 'p' });
      expect(res.status).toBe(200);
      expect(res.body).toEqual(expect.objectContaining({ requiresConfirmation: true }));
    });

    test('POST /api/auth/gym/register -> 201 on success', async () => {
      authModel.GymRegister.mockResolvedValue({ id: 2 });
      const res = await request(app)
        .post('/api/auth/gym/register')
        .send({ email: 'g@e.com', password: 'p', gymName: 'G' });
      expect(res.status).toBe(201);
    });
  });
});
