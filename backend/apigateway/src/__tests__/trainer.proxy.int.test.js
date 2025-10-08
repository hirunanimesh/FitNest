jest.mock('../utils/serviceHealth', () => ({
  serviceHealth: { auth: true, gym: true, payment: true, user: true, trainer: true, admin: true },
  startHealthChecks: jest.fn()
}));

const request = require('supertest');
const nock = require('nock');
const config = require('../config');
const app = require('../../index');

describe('Gateway -> Trainer proxy', () => {
  afterEach(() => nock.cleanAll());

  it('proxies GET /api/trainer/trainers to TrainerService', async () => {
    const scope = nock(config.services.trainer).get(/\/trainers$/).reply(200, { trainers: [] });
    const res = await request(app).get('/api/trainer/trainers').expect(200);
    expect(res.body).toEqual({ trainers: [] });
    expect(scope.isDone()).toBe(true);
  });

  it('returns 503 when TrainerService is unavailable', async () => {
    nock(config.services.trainer).get(/.*/).reply(503, { error: 'down' });
    await request(app).get('/api/trainer/trainers').expect(503);
  });
});
