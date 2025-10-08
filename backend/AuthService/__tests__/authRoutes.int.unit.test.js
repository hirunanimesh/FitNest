const express = require('express');
const request = require('supertest');

// Mock Supabase client and connection test to avoid real network calls
jest.mock('../superbaseClient', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      getUser: jest.fn(),
      admin: { updateUserById: jest.fn() }
    },
    from: jest.fn()
  },
  testConnection: jest.fn().mockResolvedValue(true)
}));

// Mock AuthController handlers to isolate routing behavior
jest.mock('../controllers/AuthController', () => ({
  createUser: jest.fn((req, res) => res.status(201).json({ success: true, route: 'signup' })),
  login: jest.fn((req, res) => res.status(200).json({ success: true, route: 'login' })),
  getUserInfo: jest.fn((req, res) => res.status(200).json({ success: true, route: 'user' })),
  completeOAuthProfile: jest.fn((req, res) => res.status(200).json({ success: true, route: 'oauth-profile' })),
  completeOAuthTrainerProfile: jest.fn((req, res) => res.status(200).json({ success: true, route: 'oauth-trainer' })),
  completeOAuthGymProfile: jest.fn((req, res) => res.status(200).json({ success: true, route: 'oauth-gym' })),
  customerRegister: jest.fn((req, res) => res.status(201).json({ success: true, route: 'customer-register' })),
  GymRegister: jest.fn((req, res) => res.status(201).json({ success: true, route: 'gym-register' })),
  TrainerRegister: jest.fn((req, res) => res.status(201).json({ success: true, route: 'trainer-register' }))
}));

describe('AuthService Router Integration (isolated)', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    const authRoutes = require('../Routes/authRoutes');
    app.use('/api/auth', authRoutes);
  });

  test('GET /api/auth/health returns successful status', async () => {
    const res = await request(app).get('/api/auth/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({ status: 'success', service: 'AuthService' })
    );
  });

  test('POST /api/auth/login routes to controller', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'secret' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, route: 'login' });
  });

  test('POST /api/auth/signup routes to controller', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'new@example.com', password: 'secret', role: 'customer' });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ success: true, route: 'signup' });
  });
});
