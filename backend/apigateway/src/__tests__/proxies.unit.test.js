jest.mock('../utils/serviceHealth', () => ({
  serviceHealth: { auth: true, gym: true, payment: true, user: true, trainer: true, admin: true },
  startHealthChecks: jest.fn()
}));

const request = require('supertest');
const nock = require('nock');
const app = require('../../index');
const config = require('../config');

describe('Proxies basic behavior', () => {
  afterEach(() => nock.cleanAll());

  test('auth proxy forwards and logs success', async () => {
    const scope = nock(config.services.auth)
      .post(uri => /\/login$/.test(uri))
      .reply(200, { ok: true });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'x@y.com', password: 'pw' })
      .expect(200);

    expect(res.body).toMatchObject({ ok: true });
    expect(scope.isDone()).toBe(true);
  });

  test('auth proxy returns 503 on upstream error', async () => {
    nock(config.services.auth).post(uri => /\/login$/.test(uri)).reply(503, { error: 'down' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'x@y.com', password: 'pw' })
      .expect(503);
    expect(res.body).toBeDefined();
  });

  test('gym proxy strips /api/gym prefix', async () => {
    const scope = nock(config.services.gym)
      .get('/list')
      .reply(200, { gyms: [] });

    const res = await request(app).get('/api/gym/list').expect(200);
    expect(res.body).toEqual({ gyms: [] });
    expect(scope.isDone()).toBe(true);
  });
});
