const request = require('supertest');

// Disable background health checks
jest.mock('../utils/serviceHealth', () => ({
  serviceHealth: { auth: true, gym: true, payment: true, user: true, trainer: true, admin: true },
  startHealthChecks: jest.fn()
}));

describe('API Gateway 404 handler', () => {
  test('returns 404 JSON for unknown routes', async () => {
    const app = require('../../index');
    const res = await request(app).get('/totally-unknown');
    expect(res.status).toBe(404);
    expect(res.body).toEqual(expect.objectContaining({
      status: 'error',
      message: 'Route not found',
    }));
    expect(Array.isArray(res.body.availableRoutes)).toBe(true);
  });
});
