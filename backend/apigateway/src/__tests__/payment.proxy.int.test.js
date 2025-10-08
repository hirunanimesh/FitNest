jest.mock('../utils/serviceHealth', () => ({
  serviceHealth: { auth: true, gym: true, payment: true, user: true, trainer: true, admin: true },
  startHealthChecks: jest.fn()
}));

const request = require('supertest');
const nock = require('nock');
const config = require('../config');
const app = require('../../index');

describe('Gateway -> Payment proxy', () => {
  afterEach(() => nock.cleanAll());

  it('proxies POST /api/payment/create-payment to PaymentService', async () => {
    const scope = nock(config.services.payment)
      .post(/\/create-payment$/)
      .reply(200, { paymentId: 'p_1' });

    const res = await request(app)
      .post('/api/payment/create-payment')
      .send({ amount: 100 })
      .expect(200);

    expect(res.body).toEqual({ paymentId: 'p_1' });
    expect(scope.isDone()).toBe(true);
  });

  it('returns 503 when PaymentService is unavailable', async () => {
    nock(config.services.payment).post(/.*/).reply(503, { error: 'down' });
    await request(app)
      .post('/api/payment/create-payment')
      .send({ amount: 100 })
      .expect(503);
  });
});
