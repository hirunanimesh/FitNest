import express from 'express';
import request from 'supertest';

// Mock env
process.env.DOMAIN = process.env.DOMAIN || 'http://localhost:3000';

// Mock external modules using jest.mock (CJS-compatible via babel-jest)
jest.mock('../database/mongo.js', () => jest.fn());
jest.mock('../kafka/Consumer.js', () => ({
  GymPlanCreatedConsumer: jest.fn(),
  GymPlanDeletedConsumer: jest.fn(),
  GymPlanPriceUpdatedConsumer: jest.fn(),
  TrainerSessionCreatedConsumer: jest.fn(),
}));

jest.mock('../lib/stripe.js', () => ({
  products: { create: jest.fn(async () => ({ id: 'prod_1' })) },
  prices: {
    create: jest.fn(async () => ({ id: 'price_1' })),
    retrieve: jest.fn(async () => ({ unit_amount: 1000 })),
  },
  customers: { create: jest.fn(async () => ({ id: 'cus_1' })) },
  accounts: { create: jest.fn(async () => ({ id: 'acct_1' })) },
  accountLinks: { create: jest.fn(async () => ({ url: 'http://stripe.link' })) },
  checkout: { sessions: { create: jest.fn(async () => ({ url: 'http://checkout', subscription: 'sub_1' })) } },
}));

jest.mock('../controllers/mongoController/add-plan-data.js', () => ({
  addPlanData: jest.fn(async () => true),
  addStripeCustomer: jest.fn(async () => true),
  addStripeAccount: jest.fn(async () => true),
  addSession: jest.fn(async () => true),
  findStripeCustomerId: jest.fn(async () => null),
  findStripePriceId: jest.fn(async () => ({ price_id: 'price_1' })),
  findStripeAccount: jest.fn(async () => ({ account_id: 'acct_1' })),
  findstripeSessionPriceId: jest.fn(async () => ({ price_id: 'price_1' })),
}));

// Import controllers after mocks
import createPlan from '../controllers/stripeController/create-plan.js';
import createAccount from '../controllers/stripeController/create-account.js';
import subscribe from '../controllers/stripeController/subscribe.js';
import SessionPayment from '../controllers/stripeController/session-payment.js';

let app;

beforeEach(() => {
  app = express();
  app.use(express.json());

  // Wrap function-style controllers, mount middleware-style directly
  app.post('/create-plan', async (req, res) => {
    try {
      const { name, price, interval, plan_id } = req.body || {};
      const result = await createPlan(name, price, interval, plan_id);
      res.status(200).json(result);
    } catch (e) {
      res.status(500).json({ error: 'failed', message: e.message });
    }
  });
  app.get('/create-account/:user_id', createAccount);
  app.post('/subscribe', subscribe);
  app.post('/sessionpayment', SessionPayment);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('PaymentService HTTP (Stripe routes)', () => {
  test('POST /create-plan returns 200 and ids', async () => {
    const res = await request(app).post('/create-plan').send({ name: 'Gold', price: 10, interval: '1 month', plan_id: 'p1' });
    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty('productId');
    expect(res.body).toHaveProperty('priceId');
  });

  test('POST /subscribe returns url', async () => {
    const res = await request(app).post('/subscribe').send({ planId: 'p1', customer_id: 'c1', user_id: 'u1', email: 'c@example.com' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('url');
  });

  test('GET /create-account/:user_id returns url', async () => {
    const res = await request(app).get('/create-account/u1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('url');
  });

  test('POST /sessionpayment creates checkout session', async () => {
    // Mock global fetch for hold/release in session-payment controller
    const okJson = async () => ({ message: 'ok' });
    const fetchMock = jest.fn()
      // holdsession
      .mockResolvedValueOnce({ ok: true, status: 200, json: okJson })
      // releasesession (not used on happy path)
      .mockResolvedValueOnce({ ok: true, status: 200, json: okJson });
    global.fetch = fetchMock;

    const res = await request(app).post('/sessionpayment').send({ sessionId: 's1', customer_id: 'c1', user_id: 'u1', email: 'c@example.com' });
    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty('url');
  });
});
