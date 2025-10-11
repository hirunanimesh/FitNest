const request = require('supertest');
const nock = require('nock');
const app = require('..');
const config = require('../src/config');

describe('API Gateway HTTP', () => {
  afterEach(() => nock.cleanAll());

  test('GET /health → 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ status: 'success', service: 'APIGateway' }));
  });

  // Cover 404 handler
  test('GET /non-existent → 404 with available routes', async () => {
    const res = await request(app).get('/non-existent');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('availableRoutes');
  });

  // Cover global error handler by registering a test route that throws
  test('Global error handler catches thrown error → 500', async () => {
    // Register a one-off route on the imported app
    app.get('/cause-error', (req, res) => {
      throw new Error('boom');
    });
    const res = await request(app).get('/cause-error');
    expect(res.status).toBe(500);
  });

  // Table of routes and their downstream base URLs
  const proxies = [
    { route: '/api/auth/health', base: new URL(config.services.auth).origin },
    { route: '/api/gym/health', base: new URL(config.services.gym).origin },
    { route: '/api/payment/health', base: new URL(config.services.payment).origin },
    { route: '/api/user/health', base: new URL(config.services.user).origin },
    { route: '/api/trainer/health', base: new URL(config.services.trainer).origin },
    { route: '/api/admin/health', base: new URL(config.services.admin).origin },
  ];

  proxies.forEach(({ route, base }) => {
    describe(`Proxy ${route}`, () => {
      test('proxies 200 from downstream', async () => {
        nock(base).get(/.*/).reply(200, { ok: true });
        const res = await request(app).get(route);
        expect(res.status).toBe(200);
      });

      test('proxies 404 from downstream', async () => {
        nock(base).get(/.*/).reply(404, { error: 'not found' });
        const res = await request(app).get(route);
        expect(res.status).toBe(404);
      });

      test('proxies 500 from downstream', async () => {
        nock(base).get(/.*/).reply(500, { error: 'fail' });
        const res = await request(app).get(route);
        expect(res.status).toBe(500);
      });

      test('handles network errors via onError → 503', async () => {
        nock(base).get(/.*/).replyWithError({ code: 'ETIMEDOUT', message: 'timeout' });
        const res = await request(app).get(route);
        expect(res.status).toBe(503);
      });
    });
  });

  // One POST proxy test to exercise body forwarding (use user service)
  test('POST /api/user/echo → 200 downstream with body', async () => {
    const base = new URL(config.services.user).origin;
    nock(base).post(/.*/).reply(200, { ok: true });
    const res = await request(app).post('/api/user/echo').send({ a: 1 });
    expect(res.status).toBe(200);
  });
});
