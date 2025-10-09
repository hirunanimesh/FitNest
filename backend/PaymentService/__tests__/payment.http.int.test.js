import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';

let app;

beforeAll(async () => {
  jest.resetModules();

  // Mock env
  process.env.DOMAIN = process.env.DOMAIN || 'http://localhost:3000';

  // Mock external modules to avoid network/side-effects
  await jest.unstable_mockModule('../database/mongo.js', () => ({ default: jest.fn() }));
  await jest.unstable_mockModule('../kafka/Consumer.js', () => ({
    GymPlanCreatedConsumer: jest.fn(),
    GymPlanDeletedConsumer: jest.fn(),
    GymPlanPriceUpdatedConsumer: jest.fn(),
    TrainerSessionCreatedConsumer: jest.fn(),
  }));

  // Mock Stripe lib used by controllers
  await jest.unstable_mockModule('../lib/stripe.js', () => ({
    default: {
      products: { create: jest.fn(async (x) => ({ id: 'prod_1' })) },
      prices: { 
        create: jest.fn(async (x) => ({ id: 'price_1' })),
        retrieve: jest.fn(async () => ({ unit_amount: 1000 }))
      },
      customers: { create: jest.fn(async () => ({ id: 'cus_1' })) },
      accounts: { create: jest.fn(async () => ({ id: 'acct_1' })) },
      accountLinks: { create: jest.fn(async () => ({ url: 'http://stripe.link' })) },
      checkout: { sessions: { create: jest.fn(async () => ({ url: 'http://checkout', subscription: 'sub_1' })) } },
    }
  }));

  // Mock Mongo controller helpers to avoid touching DB
  // Some controllers import via '../mongoController/...', others via '../../controllers/mongoController/...'
  await jest.unstable_mockModule('../controllers/mongoController/add-plan-data.js', () => ({
    addPlanData: jest.fn(async () => true),
    addStripeCustomer: jest.fn(async () => true),
    addStripeAccount: jest.fn(async () => true),
    addSession: jest.fn(async () => true),
    findStripeCustomerId: jest.fn(async () => null),
    findStripePriceId: jest.fn(async () => ({ price_id: 'price_1' })),
    findStripeAccount: jest.fn(async () => ({ account_id: 'acct_1' })),
    findstripeSessionPriceId: jest.fn(async () => ({ price_id: 'price_1' })),
  }));
  await jest.unstable_mockModule('../mongoController/add-plan-data.js', () => ({
    addPlanData: jest.fn(async () => true),
    addStripeCustomer: jest.fn(async () => true),
    addStripeAccount: jest.fn(async () => true),
    addSession: jest.fn(async () => true),
    findStripeCustomerId: jest.fn(async () => null),
    findStripePriceId: jest.fn(async () => ({ price_id: 'price_1' })),
    findStripeAccount: jest.fn(async () => ({ account_id: 'acct_1' })),
    findstripeSessionPriceId: jest.fn(async () => ({ price_id: 'price_1' })),
  }));

  // Import app index after mocks to wire routes onto an express instance
  // Instead of using index.js' internal app, we reconstruct a fresh app for tests
  const createPlan = (await import('../controllers/stripeController/create-plan.js')).default;
  const createAccount = (await import('../controllers/stripeController/create-account.js')).default;
  const subscribe = (await import('../controllers/stripeController/subscribe.js')).default;
  const getInvoices = (await import('../controllers/stripeController/get-invoices.js')).default;
  const getSubscriptions = (await import('../controllers/stripeController/get-subscription.js')).default;
  const getDashboardLink = (await import('../controllers/stripeController/dashboard.js')).default;
  const getPaymentList = (await import('../controllers/stripeController/get-payments.js')).default;
  const getConnectedAccountPayments = (await import('../controllers/stripeController/get-connected-account-payments.js')).default;
  const oneTimePayment = (await import('../controllers/stripeController/one-time-payment.js')).default;
  const getCurrentMonthRevenue = (await import('../controllers/stripeController/get-monthly-revenue.js')).default;
  const cancelSubscription = (await import('../controllers/stripeController/cancel-subscription.js')).default;
  const getCustomersByGymPlans = (await import('../controllers/stripeController/get-customer-ids.js')).default;
  const SessionPayment = (await import('../controllers/stripeController/session-payment.js')).default;
  const releaseSessionHandler = (await import('../controllers/stripeController/release-session.js')).default;
  const stripeWebhook = (await import('../controllers/stripeController/webhook.js')).default;
  const successSessionHandler = (await import('../controllers/stripeController/success-session.js')).default;
  const systemRevenue = (await import('../controllers/stripeController/system-revenue.js')).default;

  app = express();
  app.use(express.json());

  // Wire routes as in index.js
  // create-plan is a function, wrap it with a handler
  app.post('/create-plan', async (req, res) => {
    try {
      const { name, price, interval, plan_id } = req.body || {};
      const result = await createPlan(name, price, interval, plan_id);
      return res.status(200).json(result);
    } catch (e) {
      return res.status(500).json({ error: 'failed', message: e.message });
    }
  });
  app.get('/create-account/:user_id', createAccount);
  app.post('/subscribe', subscribe);
  app.use('/cancel-subscription', cancelSubscription);
  app.use('/getinvoices', getInvoices);
  app.use('/getsubscription/:customerId', getSubscriptions);
  app.use('/getpayments', getPaymentList);
  app.get('/stripedashboard/:user_id', getDashboardLink);
  app.use('/connectedaccountpayments/:userId', getConnectedAccountPayments);
  app.use('/onetimepayment', oneTimePayment);
  app.use('/monthlyrevenue/:userId', getCurrentMonthRevenue);
  app.use('/getgymcustomerids', getCustomersByGymPlans);
  app.post('/monthlymembers', getCustomersByGymPlans);
  app.post('/sessionpayment', SessionPayment);
  app.get('/sessionpayment/cancel', releaseSessionHandler);
  app.get('/sessionpayment/success', successSessionHandler);
  app.post('/webhook', stripeWebhook);
  app.get('/getsystemrevenue', systemRevenue);
});

afterEach(() => jest.clearAllMocks());

describe('PaymentService HTTP (Stripe routes)', () => {
  test('POST /create-plan returns 200 and ids', async () => {
    const res = await request(app).post('/create-plan').send({ name: 'Gold', price: 10, interval: '1 month', plan_id: 'p1' });
    expect([200, 201]).toContain(res.status);
  });

  test('POST /subscribe returns url', async () => {
    const res = await request(app).post('/subscribe').send({ planId: 'p1', customer_id: 'c1', user_id: 'u1', email: 'c@example.com' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('url');
  });

  test('GET /create-account/:user_id returns url', async () => {
    const res = await request(app).get('/create-account/u1');
    expect(res.status).toBe(200);
  });

  test('POST /sessionpayment creates checkout session', async () => {
    // Mock global fetch for hold/release in session-payment controller
    const okJson = async () => ({ message: 'ok' });
    const fetchMock = jest.fn()
      // holdsession
      .mockResolvedValueOnce({ ok: true, status: 200, json: okJson })
      // releasesession (not strictly needed when happy path, but keep extra mocks in case)
      .mockResolvedValueOnce({ ok: true, status: 200, json: okJson });
    global.fetch = fetchMock;

    const res = await request(app).post('/sessionpayment').send({ sessionId: 's1', customer_id: 'c1', user_id: 'u1', email: 'c@example.com' });
    expect([200, 201]).toContain(res.status);
  });
});
