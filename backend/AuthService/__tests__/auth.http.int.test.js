const express = require('express');
const request = require('supertest');

let app;
let routes;

beforeAll(() => {
  jest.resetModules();

  // Mock controllers lightly
  jest.mock('../controllers/AuthController', () => ({
    createUser: (req, res) => res.status(201).json({ ok: true }),
    login: (req, res) => res.status(200).json({ token: 't' }),
    getUserInfo: (req, res) => res.status(200).json({ id: 'u1' }),
    completeOAuthProfile: (req, res) => res.status(200).json({ ok: true }),
    completeOAuthTrainerProfile: (req, res) => res.status(200).json({ ok: true }),
    completeOAuthGymProfile: (req, res) => res.status(200).json({ ok: true }),
    customerRegister: (req, res) => res.status(201).json({ ok: true }),
    GymRegister: (req, res) => res.status(201).json({ ok: true }),
    TrainerRegister: (req, res) => res.status(201).json({ ok: true }),
  }));

  // Mock testConnection used in /health
  jest.mock('../superbaseClient', () => ({
    supabase: {},
    testConnection: jest.fn().mockResolvedValue(true)
  }));

  routes = require('../Routes/authRoutes');
  app = express();
  app.use(express.json());
  app.use('/api/auth', routes);
});

afterEach(() => jest.clearAllMocks());

describe('AuthService HTTP routes', () => {
  test('GET /api/auth/health → 200', async () => {
    const res = await request(app).get('/api/auth/health');
    expect(res.status).toBe(200);
  });

  test('POST /api/auth/signup → 201', async () => {
    const res = await request(app).post('/api/auth/signup').send({ email: 'e', password: 'p' });
    expect(res.status).toBe(201);
  });

  test('POST /api/auth/login → 200', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'e', password: 'p' });
    expect(res.status).toBe(200);
  });
});
