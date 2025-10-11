// Disable background health checks in tests
jest.mock('../utils/serviceHealth', () => ({
  serviceHealth: { auth: true, gym: true, payment: true, user: true, trainer: true, admin: true },
  startHealthChecks: jest.fn()
}));

const request = require('supertest');
const nock = require('nock');
const app = require('../../index');

// Respect configured base URL; default matches src/config
const AUTH_BASE = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

describe('Gateway -> Auth proxy (integration)', () => {
  afterEach(() => nock.cleanAll());

  it('proxies /api/auth/login to AuthService /login', async () => {
    // Accept any path ending with /login to avoid coupling to pathRewrite specifics
    const scope = nock(AUTH_BASE)
      .post(uri => /\/login$/.test(uri))
      .reply(200, { success: true, user: { id: 'u1' } });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'a@b.com', password: 'pw' })
      .expect(200);

    expect(res.body).toMatchObject({ success: true });
    expect(scope.isDone()).toBe(true);
  });

  it('returns 503 when AuthService is unavailable', async () => {
    nock(AUTH_BASE).post(uri => /\/login$/.test(uri)).reply(503, { error: 'down' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'a@b.com', password: 'pw' })
      .expect(503);

    // Current proxy error shape when upstream returns 503 via nock
    expect(res.body).toEqual(expect.any(Object));
  });
});
