jest.mock('../utils/serviceHealth', () => ({
  serviceHealth: { auth: true, gym: true, payment: true, user: true, trainer: true, admin: true },
  startHealthChecks: jest.fn()
}));

const request = require('supertest');
const nock = require('nock');
const config = require('../config');
const app = require('../../index');

describe('Gateway -> Gym proxy', () => {
  afterEach(() => nock.cleanAll());

  it('proxies GET /api/gym/list to GymService /list', async () => {
    const scope = nock(config.services.gym).get(/\/list$/).reply(200, { gyms: [] });
    const res = await request(app).get('/api/gym/list').expect(200);
    expect(res.body).toEqual({ gyms: [] });
    expect(scope.isDone()).toBe(true);
  });

  it('returns 503 when GymService is unavailable', async () => {
    nock(config.services.gym).get(/.*/).reply(503, { error: 'down' });
    await request(app).get('/api/gym/list').expect(503);
  });
});
