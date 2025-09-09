import createPlan from '../controllers/stripeController/create-plan.js';

// Mock the stripe library
jest.mock('../lib/stripe.js', () => ({
  products: {
    create: jest.fn(),
  },
  prices: {
    create: jest.fn(),
  },
}));

// Mock the addPlanData function
jest.mock('../controllers/mongoController/add-plan-data.js', () => ({
  addPlanData: jest.fn(),
}));

import stripe from '../lib/stripe.js';
import { addPlanData } from '../controllers/mongoController/add-plan-data.js';

describe('createPlan', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a plan with valid inputs', async () => {
    // Mock Stripe responses
    const mockProduct = { id: 'prod_123' };
    const mockPrice = { id: 'price_123' };

    stripe.products.create.mockResolvedValue(mockProduct);
    stripe.prices.create.mockResolvedValue(mockPrice);
    addPlanData.mockResolvedValue();

    const result = await createPlan('Test Plan', 10, '1 month', 'plan_123');

    expect(stripe.products.create).toHaveBeenCalledWith({ name: 'Test Plan' });
    expect(stripe.prices.create).toHaveBeenCalledWith({
      unit_amount: 1000, // 10 * 100
      currency: 'usd',
      recurring: { interval: 'month' },
      product: 'prod_123',
    });
    expect(addPlanData).toHaveBeenCalledWith({
      plan_id: 'plan_123',
      product_id: 'prod_123',
      price_id: 'price_123',
    });
    expect(result).toEqual({ productId: 'prod_123', priceId: 'price_123' });
  });

  it('should handle interval conversion for year', async () => {
    const mockProduct = { id: 'prod_456' };
    const mockPrice = { id: 'price_456' };

    stripe.products.create.mockResolvedValue(mockProduct);
    stripe.prices.create.mockResolvedValue(mockPrice);
    addPlanData.mockResolvedValue();

    await createPlan('Yearly Plan', 20, '1 year', 'plan_456');

    expect(stripe.prices.create).toHaveBeenCalledWith({
      unit_amount: 2000,
      currency: 'usd',
      recurring: { interval: 'year' },
      product: 'prod_456',
    });
  });

  it('should handle interval conversion for week', async () => {
    const mockProduct = { id: 'prod_789' };
    const mockPrice = { id: 'price_789' };

    stripe.products.create.mockResolvedValue(mockProduct);
    stripe.prices.create.mockResolvedValue(mockPrice);
    addPlanData.mockResolvedValue();

    await createPlan('Weekly Plan', 5, '1 week', 'plan_789');

    expect(stripe.prices.create).toHaveBeenCalledWith({
      unit_amount: 500,
      currency: 'usd',
      recurring: { interval: 'week' },
      product: 'prod_789',
    });
  });

  it('should handle interval conversion for day', async () => {
    const mockProduct = { id: 'prod_101' };
    const mockPrice = { id: 'price_101' };

    stripe.products.create.mockResolvedValue(mockProduct);
    stripe.prices.create.mockResolvedValue(mockPrice);
    addPlanData.mockResolvedValue();

    await createPlan('Daily Plan', 1, '1 day', 'plan_101');

    expect(stripe.prices.create).toHaveBeenCalledWith({
      unit_amount: 100,
      currency: 'usd',
      recurring: { interval: 'day' },
      product: 'prod_101',
    });
  });

  it('should throw error if product creation fails', async () => {
    stripe.products.create.mockResolvedValue(null);

    await expect(createPlan('Test Plan', 10, '1 month', 'plan_123'))
      .rejects
      .toThrow();
  });

  it('should throw error if price creation fails', async () => {
    const mockProduct = { id: 'prod_123' };

    stripe.products.create.mockResolvedValue(mockProduct);
    stripe.prices.create.mockResolvedValue(null);

    await expect(createPlan('Test Plan', 10, '1 month', 'plan_123'))
      .rejects
      .toThrow('Failed to create product or price in Stripe');
  });

  it('should throw error if Stripe API fails', async () => {
    const mockError = new Error('Stripe API error');
    stripe.products.create.mockRejectedValue(mockError);

    await expect(createPlan('Test Plan', 10, '1 month', 'plan_123'))
      .rejects
      .toThrow('Stripe API error');
  });
});