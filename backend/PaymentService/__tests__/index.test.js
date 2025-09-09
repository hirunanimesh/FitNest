import express from 'express';

// Mock all the imported modules
jest.mock('express', () => {
  const mockApp = {
    use: jest.fn(),
    listen: jest.fn(),
    get: jest.fn(),
  };
  const mockExpress = jest.fn(() => mockApp);
  mockExpress.json = jest.fn(() => 'json middleware');
  return mockExpress;
});

jest.mock('cors', () => jest.fn(() => 'cors middleware'));
jest.mock('dotenv', () => ({ config: jest.fn() }));

// Mock all controller imports
jest.mock('../controllers/stripeController/create-plan.js', () => ({ default: 'createPlan' }));
jest.mock('../controllers/stripeController/create-account.js', () => ({ default: 'createAccount' }));
jest.mock('../controllers/stripeController/subscribe.js', () => ({ default: 'subscribe' }));
jest.mock('../controllers/stripeController/get-invoices.js', () => ({ default: 'getInvoices' }));
jest.mock('../controllers/stripeController/get-subscription.js', () => ({ default: 'getSubscriptions' }));
jest.mock('../controllers/stripeController/dashboard.js', () => ({ default: 'getDashboardLink' }));
jest.mock('../controllers/stripeController/get-payments.js', () => ({ default: 'getPaymentList' }));
jest.mock('../database/mongo.js', () => jest.fn());
jest.mock('../controllers/stripeController/get-connected-account-payments.js', () => ({ default: 'getConnectedAccountPayments' }));
jest.mock('../controllers/stripeController/one-time-payment.js', () => ({ default: 'oneTimePayment' }));
jest.mock('../controllers/stripeController/get-monthly-revenue.js', () => ({ default: 'getCurrentMonthRevenue' }));
jest.mock('../kafka/Consumer.js', () => ({
  GymPlanCreatedConsumer: jest.fn(),
  GymPlanDeletedConsumer: jest.fn(),
  GymPlanPriceUpdatedConsumer: jest.fn(),
}));
jest.mock('../controllers/stripeController/cancel-subscription.js', () => ({ default: 'cancelSubscription' }));
jest.mock('../controllers/stripeController/get-customer-ids.js', () => ({ default: 'getCustomersByGymPlans' }));

// Import after mocking
import connectDatabase from '../database/mongo.js';
import { GymPlanCreatedConsumer, GymPlanDeletedConsumer, GymPlanPriceUpdatedConsumer } from '../kafka/Consumer.js';

describe('index.js', () => {
  let mockApp;

  beforeEach(() => {
    jest.clearAllMocks();
    // Get the mock app instance
    mockApp = express();
  });

  it('should configure the Express app correctly', () => {
    // Import the module to trigger the setup
    require('../index.js');

    // Check that express was called
    expect(express).toHaveBeenCalled();

    // Check middleware setup
    expect(mockApp.use).toHaveBeenCalledWith(express.json());
    expect(mockApp.use).toHaveBeenCalledWith('cors middleware');

    // Check route setup
    expect(mockApp.use).toHaveBeenCalledWith('/create-plan', { default: 'createPlan' });
    expect(mockApp.use).toHaveBeenCalledWith('/create-account/:user_id', { default: 'createAccount' });
    expect(mockApp.use).toHaveBeenCalledWith('/subscribe', { default: 'subscribe' });
    expect(mockApp.use).toHaveBeenCalledWith('/cancel-subscription', { default: 'cancelSubscription' });
    expect(mockApp.use).toHaveBeenCalledWith('/getinvoices', { default: 'getInvoices' });
    expect(mockApp.use).toHaveBeenCalledWith('/getsubscription/:customerId', { default: 'getSubscriptions' });
    expect(mockApp.use).toHaveBeenCalledWith('/getpayments', { default: 'getPaymentList' });
    expect(mockApp.use).toHaveBeenCalledWith('/connectedaccountpayments/:userId', { default: 'getConnectedAccountPayments' });
    expect(mockApp.use).toHaveBeenCalledWith('/onetimepayment', { default: 'oneTimePayment' });
    expect(mockApp.use).toHaveBeenCalledWith('/monthlyrevenue/:userId', { default: 'getCurrentMonthRevenue' });
    expect(mockApp.use).toHaveBeenCalledWith('/getgymcustomerids', { default: 'getCustomersByGymPlans' });

    // Check GET route
    expect(mockApp.get).toHaveBeenCalledWith('/stripedashboard/:user_id', { default: 'getDashboardLink' });

    // Check database connection
    expect(connectDatabase).toHaveBeenCalled();

    // Check Kafka consumers
    expect(GymPlanCreatedConsumer).toHaveBeenCalled();
    expect(GymPlanDeletedConsumer).toHaveBeenCalled();
    expect(GymPlanPriceUpdatedConsumer).toHaveBeenCalled();
  });

});