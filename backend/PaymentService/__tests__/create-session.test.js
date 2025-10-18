import createSession from '../controllers/stripeController/create-session.js';

// Mock the stripe library
jest.mock('../lib/stripe.js', () => ({
  products: {
    create: jest.fn(),
  },
  prices: {
    create: jest.fn(),
  },
}));

// Mock the addSession helper
jest.mock('../controllers/mongoController/add-plan-data.js', () => ({
  addSession: jest.fn(),
}));

import stripe from '../lib/stripe.js';
import { addSession } from '../controllers/mongoController/add-plan-data.js';

describe('createSession', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates product, price and persists session successfully', async () => {
    const mockProduct = { id: 'prod_sess_1' };
    const mockPrice = { id: 'price_sess_1' };

    stripe.products.create.mockResolvedValue(mockProduct);
    stripe.prices.create.mockResolvedValue(mockPrice);
    addSession.mockResolvedValue?.();

    const result = await createSession(25, 'sess_123');

    expect(stripe.products.create).toHaveBeenCalledWith({ name: 'trainer session' });
    expect(stripe.prices.create).toHaveBeenCalledWith({
      unit_amount: 2500,
      currency: 'usd',
      product: 'prod_sess_1',
    });
    expect(addSession).toHaveBeenCalledWith({
      session_id: 'sess_123',
      price_id: 'price_sess_1',
      product_id: 'prod_sess_1',
    });
    expect(result).toEqual({ productId: 'prod_sess_1', priceId: 'price_sess_1' });
  });

  it('throws when product creation returns null', async () => {
    stripe.products.create.mockResolvedValue(null);

    await expect(createSession(10, 'sess_x'))
      .rejects
      .toThrow('Failed to create product in Stripe');
    expect(stripe.prices.create).not.toHaveBeenCalled();
    expect(addSession).not.toHaveBeenCalled();
  });

  it('throws when price creation returns null', async () => {
    const mockProduct = { id: 'prod_ok' };
    stripe.products.create.mockResolvedValue(mockProduct);
    stripe.prices.create.mockResolvedValue(null);

    await expect(createSession(10, 'sess_y'))
      .rejects
      .toThrow('Failed to create price in Stripe');
    expect(addSession).not.toHaveBeenCalled();
  });

  it('propagates Stripe API errors (product.create rejects)', async () => {
    const err = new Error('Stripe API error');
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    stripe.products.create.mockRejectedValue(err);

    await expect(createSession(10, 'sess_err'))
      .rejects
      .toThrow('Stripe API error');

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
