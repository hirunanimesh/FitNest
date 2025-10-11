// Mock all the imported modules
jest.mock('express', () => {
  const mockApp = {
    use: jest.fn(),
    listen: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
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
jest.mock('../controllers/stripeController/get-monthly-members.js', () => ({ default: 'getMonthlyMembers' }));
jest.mock('../controllers/stripeController/session-payment.js', () => ({ default: 'sessionPayment' }));
jest.mock('../controllers/stripeController/release-session.js', () => ({ default: 'releaseSessionHandler' }));
jest.mock('../controllers/stripeController/webhook.js', () => ({ default: 'stripeWebhook' }));
jest.mock('../controllers/stripeController/success-session.js', () => ({ default: 'successSessionHandler' }));
jest.mock('../controllers/stripeController/system-revenue.js', () => ({ default: 'systemRevenue' }));
jest.mock('../kafka/Consumer.js', () => ({
  GymPlanCreatedConsumer: jest.fn(),
  GymPlanDeletedConsumer: jest.fn(),
  GymPlanPriceUpdatedConsumer: jest.fn(),
  TrainerSessionCreatedConsumer: jest.fn(),
}));
jest.mock('../controllers/stripeController/cancel-subscription.js', () => ({ default: 'cancelSubscription' }));
jest.mock('../controllers/stripeController/get-customer-ids.js', () => ({ default: 'getCustomersByGymPlans' }));

// Import after mocking
import connectDatabase from '../database/mongo.js';
import { GymPlanCreatedConsumer, GymPlanDeletedConsumer, GymPlanPriceUpdatedConsumer } from '../kafka/Consumer.js';

describe('index.js', () => {
  const ORIGINAL_PORT = process.env.PORT;
  // no direct import of express; we'll get the active mock instance via jest.requireMock

  beforeEach(() => {
    // do not reset modules here; resetting would create a different express mock instance
    jest.clearAllMocks();
    // ensure PORT branch defaults unless a test sets it
    delete process.env.PORT;
  });

  afterAll(() => {
    process.env.PORT = ORIGINAL_PORT;
  });

  it('should configure the Express app correctly', () => {
    // Import the module to trigger the setup
    require('../index.js');

    const expressMock = jest.requireMock('express');
    const mockApp = expressMock();

    // Check that express was called
    expect(expressMock).toHaveBeenCalled();

    // Check middleware setup
    expect(mockApp.use).toHaveBeenCalledWith(expressMock.json());
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

  it('listens on default port when PORT is not set and runs callback', () => {
    // Import within isolated module registry to evaluate fresh branches
    jest.isolateModules(() => {
      const expressMock = jest.requireMock('express');
      require('../index.js');
      const mockApp = expressMock();

      // Verify listen called with default 3003
      expect(mockApp.listen).toHaveBeenCalled();
      const [port, cb] = mockApp.listen.mock.calls[0];
      expect(port).toBe(3003);

      // Execute the callback to cover the function body (console.log)
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      cb();
      expect(logSpy).toHaveBeenCalledWith('Payment Service is running on port 3003');
      logSpy.mockRestore();
    });
  });

  it('listens on env PORT when set and runs callback', () => {
    process.env.PORT = '4000';

    jest.isolateModules(() => {
      const expressMock = jest.requireMock('express');
      require('../index.js');
      const mockApp = expressMock();

      expect(mockApp.listen).toHaveBeenCalled();
      const [port, cb] = mockApp.listen.mock.calls[0];
      // Express accepts string port; ensure we used env value
      expect(port).toBe('4000');

      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      cb();
      expect(logSpy).toHaveBeenCalledWith('Payment Service is running on port 4000');
      logSpy.mockRestore();
    });
  });

});