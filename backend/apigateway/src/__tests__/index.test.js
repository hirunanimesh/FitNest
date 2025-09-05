const request = require('supertest');

// Mock the service health utility to prevent async operations
jest.mock('../utils/serviceHealth', () => ({
  serviceHealth: {
    auth: true,
    gym: true,
    payment: true,
    user: true,
    trainer: true
  },
  startHealthChecks: jest.fn()
}));

// Mock all the proxy modules to avoid actual HTTP calls during testing
jest.mock('../proxies/authProxy', () => {
  const express = require('express');
  const router = express.Router();
  
  router.get('/health', (req, res) => {
    res.json({ service: 'auth', status: 'healthy' });
  });
  
  router.post('/login', (req, res) => {
    res.json({ token: 'mock-token', user: { id: 1, email: 'test@test.com' } });
  });
  
  return router;
});

jest.mock('../proxies/gymProxy', () => {
  const express = require('express');
  const router = express.Router();
  
  router.get('/health', (req, res) => {
    res.json({ service: 'gym', status: 'healthy' });
  });
  
  router.get('/gyms', (req, res) => {
    res.json({ gyms: [{ id: 1, name: 'Test Gym' }] });
  });
  
  return router;
});

jest.mock('../proxies/userProxy', () => {
  const express = require('express');
  const router = express.Router();
  
  router.get('/profile', (req, res) => {
    res.json({ user: { id: 1, name: 'Test User' } });
  });
  
  return router;
});

jest.mock('../proxies/paymentProxy', () => {
  const express = require('express');
  const router = express.Router();
  
  router.post('/create-payment', (req, res) => {
    res.json({ paymentId: 'payment_123', status: 'success' });
  });
  
  return router;
});

jest.mock('../proxies/trainerProxy', () => {
  const express = require('express');
  const router = express.Router();
  
  router.get('/trainers', (req, res) => {
    res.json({ trainers: [{ id: 1, name: 'Test Trainer' }] });
  });
  
  return router;
});

// Import the app after all mocks are set up
const app = require('../../index');

describe('API Gateway', () => {
  // Clean up any timers/intervals after all tests
  afterAll(async () => {
    // Give a moment for any pending operations to complete
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  describe('Health Check', () => {
    test('GET /health should return 200 with service info', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('message', 'API Gateway is running');
      expect(response.body).toHaveProperty('service', 'APIGateway');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('services');
    });
  });

  describe('Proxy Routing', () => {
    test('Auth proxy - GET /api/auth/health should work', async () => {
      const response = await request(app).get('/api/auth/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('service', 'auth');
      expect(response.body).toHaveProperty('status', 'healthy');
    });

    test('Auth proxy - POST /api/auth/login should work', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'password' });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token', 'mock-token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id', 1);
      expect(response.body.user).toHaveProperty('email', 'test@test.com');
    });

    test('Gym proxy - GET /api/gym/health should work', async () => {
      const response = await request(app).get('/api/gym/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('service', 'gym');
    });

    test('Gym proxy - GET /api/gym/gyms should work', async () => {
      const response = await request(app).get('/api/gym/gyms');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('gyms');
      expect(Array.isArray(response.body.gyms)).toBe(true);
      expect(response.body.gyms).toHaveLength(1);
      expect(response.body.gyms[0]).toHaveProperty('id', 1);
      expect(response.body.gyms[0]).toHaveProperty('name', 'Test Gym');
    });

    test('User proxy - GET /api/user/profile should work', async () => {
      const response = await request(app).get('/api/user/profile');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id', 1);
      expect(response.body.user).toHaveProperty('name', 'Test User');
    });

    test('Payment proxy - POST /api/payment/create-payment should work', async () => {
      const response = await request(app)
        .post('/api/payment/create-payment')
        .send({ amount: 100, currency: 'USD' });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('paymentId', 'payment_123');
      expect(response.body).toHaveProperty('status', 'success');
    });

    test('Trainer proxy - GET /api/trainer/trainers should work', async () => {
      const response = await request(app).get('/api/trainer/trainers');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('trainers');
      expect(Array.isArray(response.body.trainers)).toBe(true);
      expect(response.body.trainers).toHaveLength(1);
      expect(response.body.trainers[0]).toHaveProperty('id', 1);
      expect(response.body.trainers[0]).toHaveProperty('name', 'Test Trainer');
    });
  });

  describe('Error Handling', () => {
    test('GET /api/nonexistent should return 404', async () => {
      const response = await request(app).get('/api/nonexistent');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Route not found');
      expect(response.body).toHaveProperty('path', '/api/nonexistent');
    });

    test('GET unknown route should return 404 with available routes', async () => {
      const response = await request(app).get('/unknown');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('availableRoutes');
      expect(response.body.availableRoutes).toContain('/health');
      expect(response.body.availableRoutes).toContain('/api/auth/*');
      expect(response.body.availableRoutes).toContain('/api/gym/*');
      expect(response.body.availableRoutes).toContain('/api/payment/*');
      expect(response.body.availableRoutes).toContain('/api/user/*');
      expect(response.body.availableRoutes).toContain('/api/trainer/*');
    });

    test('POST to unknown route should also return 404', async () => {
      const response = await request(app)
        .post('/api/unknown-endpoint')
        .send({ data: 'test' });
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('status', 'error');
    });
  });
});