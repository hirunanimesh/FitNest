const request = require('supertest');
const nock = require('nock');
const app = require('..');

// Helper to get base origin for a service env var or default
function baseOrigin(envKey, def) {
  const url = process.env[envKey] || def;
  const { URL } = require('url');
  return new URL(url).origin;
}

describe('API Gateway HTTP', () => {
  afterEach(() => nock.cleanAll());

  test('GET /health → 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });

  // AUTH proxy (note: current pathRewrite forwards /api/auth/* as /api/auth/*)
  describe('Auth proxy', () => {
    const origin = baseOrigin('AUTH_SERVICE_URL', 'http://localhost:3001');

    test('200 passthrough', async () => {
      nock(origin).get('/api/auth/health').reply(200, { ok: true });
      const res = await request(app).get('/api/auth/health');
      expect(res.status).toBe(200);
    });

    test('500 passthrough', async () => {
      nock(origin).get('/api/auth/health').reply(500, { error: 'down' });
      const res = await request(app).get('/api/auth/health');
      expect(res.status).toBe(500);
    });

    test('timeout/network error → 503', async () => {
      nock(origin).get('/api/auth/health').replyWithError({ code: 'ETIMEDOUT' });
      const res = await request(app).get('/api/auth/health');
      expect(res.status).toBe(503);
    });
  });

  // GYM proxy
  describe('Gym proxy', () => {
    const origin = baseOrigin('GYM_SERVICE_URL', 'http://localhost:3002');

    test('200 passthrough', async () => {
      nock(origin).get('/health').reply(200, { ok: true });
      const res = await request(app).get('/api/gym/health');
      expect(res.status).toBe(200);
    });

    test('404 passthrough', async () => {
      nock(origin).get('/missing').reply(404, { error: 'not found' });
      const res = await request(app).get('/api/gym/missing');
      expect(res.status).toBe(404);
    });

    test('500 passthrough', async () => {
      nock(origin).get('/health').reply(500, { error: 'down' });
      const res = await request(app).get('/api/gym/health');
      expect(res.status).toBe(500);
    });

    test('timeout/network error → 503', async () => {
      nock(origin).get('/health').replyWithError({ code: 'ETIMEDOUT' });
      const res = await request(app).get('/api/gym/health');
      expect(res.status).toBe(503);
    });
  });

  // PAYMENT proxy
  describe('Payment proxy', () => {
    const origin = baseOrigin('PAYMENT_SERVICE_URL', 'http://localhost:3003');

    test('200 passthrough', async () => {
      nock(origin).get('/getinvoices').reply(200, []);
      const res = await request(app).get('/api/payment/getinvoices');
      expect(res.status).toBe(200);
    });

    test('500 passthrough', async () => {
      nock(origin).get('/getinvoices').reply(500, { error: 'down' });
      const res = await request(app).get('/api/payment/getinvoices');
      expect(res.status).toBe(500);
    });

    test('timeout/network error → 503', async () => {
      nock(origin).get('/getinvoices').replyWithError({ code: 'ETIMEDOUT' });
      const res = await request(app).get('/api/payment/getinvoices');
      expect(res.status).toBe(503);
    });
  });

  // USER proxy
  describe('User proxy', () => {
    const origin = baseOrigin('USER_SERVICE_URL', 'http://localhost:3004');

    test('200 passthrough', async () => {
      nock(origin).get('/getuserbyid/u1').reply(200, { id: 'u1' });
      const res = await request(app).get('/api/user/getuserbyid/u1');
      expect(res.status).toBe(200);
    });

    test('timeout/network error → 503', async () => {
      nock(origin).get('/getuserbyid/u1').replyWithError({ code: 'ETIMEDOUT' });
      const res = await request(app).get('/api/user/getuserbyid/u1');
      expect(res.status).toBe(503);
    });
  });

  // TRAINER proxy
  describe('Trainer proxy', () => {
    const origin = baseOrigin('TRAINER_SERVICE_URL', 'http://localhost:3005');

    test('200 passthrough', async () => {
      nock(origin).get('/health').reply(200, { ok: true });
      const res = await request(app).get('/api/trainer/health');
      expect(res.status).toBe(200);
    });

    test('timeout/network error → 503', async () => {
      nock(origin).get('/health').replyWithError({ code: 'ETIMEDOUT' });
      const res = await request(app).get('/api/trainer/health');
      expect(res.status).toBe(503);
    });
  });

  // ADMIN proxy
  describe('Admin proxy', () => {
    const origin = baseOrigin('ADMIN_SERVICE_URL', 'http://localhost:3006');

    test('200 passthrough', async () => {
      nock(origin).get('/health').reply(200, { ok: true });
      const res = await request(app).get('/api/admin/health');
      expect(res.status).toBe(200);
    });

    test('timeout/network error → 503', async () => {
      nock(origin).get('/health').replyWithError({ code: 'ETIMEDOUT' });
      const res = await request(app).get('/api/admin/health');
      expect(res.status).toBe(503);
    });
  });
});
