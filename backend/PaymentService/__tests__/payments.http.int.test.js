import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';

let app;

beforeAll(async () => {
  jest.resetModules();

  // Mock Stripe, Kafka, and DB-facing modules as needed inside controllers
  await jest.unstable_mockModule('../controllers/stripeController/get-customer-ids.js', () => ({
    default: (req, res) => res.status(200).json({ ids: [] })
  }));
  await jest.unstable_mockModule('../controllers/stripeController/get-subscription.js', () => ({
    default: (req, res) => res.status(200).json({ subscription: {} })
  }));

  const getCustomersByGymPlans = (await import('../controllers/stripeController/get-customer-ids.js')).default;
  const getSubscriptions = (await import('../controllers/stripeController/get-subscription.js')).default;

  app = express();
  app.use(express.json());
  app.use('/getgymcustomerids', getCustomersByGymPlans);
  app.use('/getsubscription/:customerId', getSubscriptions);
});

describe('PaymentService HTTP routes', () => {
  test('POST /getgymcustomerids → 200', async () => {
    const res = await request(app).post('/getgymcustomerids').send({ gymPlanIds: ['p1'] });
    expect(res.status).toBe(200);
  });

  test('GET /getsubscription/:customerId → 200', async () => {
    const res = await request(app).get('/getsubscription/c1');
    expect(res.status).toBe(200);
  });
});
