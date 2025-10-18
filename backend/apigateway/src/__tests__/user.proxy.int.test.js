jest.mock('../utils/serviceHealth', () => ({
  serviceHealth: { auth: true, gym: true, payment: true, user: true, trainer: true, admin: true },
  startHealthChecks: jest.fn()
}));

const request = require('supertest');
const nock = require('nock');
const config = require('../config');
const app = require('../../index');

describe('Gateway -> User proxy', () => {
  afterEach(() => nock.cleanAll());

  it('proxies GET /api/user/profile to UserService /profile', async () => {
    const scope = nock(config.services.user).get(/\/profile$/).reply(200, { id: 'u1' });
    const res = await request(app).get('/api/user/profile').expect(200);
    expect(res.body).toEqual({ id: 'u1' });
    expect(scope.isDone()).toBe(true);
  });

  it('returns 503 when UserService is unavailable', async () => {
    nock(config.services.user).get(/.*/).reply(503, { error: 'down' });
    await request(app).get('/api/user/profile').expect(503);
  });
});
