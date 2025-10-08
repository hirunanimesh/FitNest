// Disable background health checks for this integration test
jest.mock('../utils/serviceHealth', () => ({
  serviceHealth: { auth: true, gym: true, payment: true, user: true, trainer: true, admin: true },
  startHealthChecks: jest.fn()
}));

const request = require('supertest');
const app = require('../../index');

describe('API Gateway /health (integration)', () => {
  it('returns 200 with service info', async () => {
    const res = await request(app).get('/health').expect(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        status: 'success',
        service: 'APIGateway',
        services: expect.any(Object),
      })
    );
    expect(typeof res.body.timestamp).toBe('string');
  });
});
