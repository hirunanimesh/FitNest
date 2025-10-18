import webhook from '../controllers/stripeController/webhook.js';

// Ensure no real network/Stripe calls
jest.mock('../lib/stripe.js', () => ({
  paymentIntents: { retrieve: jest.fn(async () => ({ metadata: { trainer_session_id: 'sess_pi', app_customer_id: 'cust_pi' } })) }
}));

describe('PaymentService webhook controller', () => {
  const originalFetch = global.fetch;
  beforeEach(() => {
    global.fetch = jest.fn(async () => ({ ok: true, status: 200, json: async () => ({ ok: true }) }));
  });
  afterEach(() => {
    jest.clearAllMocks();
    global.fetch = originalFetch;
  });

  const makeRes = () => {
    const res = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    return res;
  };

  test('checkout.session.completed triggers booking via booksession', async () => {
    const req = {
      body: {
        type: 'checkout.session.completed',
        data: { object: { metadata: { trainer_session_id: 'sess1', app_customer_id: 'cust1' } } }
      },
      headers: {}
    };
    const res = makeRes();

    await webhook(req, res);

    expect(global.fetch).toHaveBeenCalledWith(expect.stringMatching(/\/booksession$/), expect.objectContaining({ method: 'POST' }));
    expect(res.json).toHaveBeenCalledWith({ received: true });
  });

  test('failure/expired events trigger releasesession', async () => {
    const req = {
      body: {
        type: 'payment_intent.payment_failed',
        data: { object: { metadata: { trainer_session_id: 'sess2' } } }
      },
      headers: {}
    };
    const res = makeRes();

    await webhook(req, res);

    expect(global.fetch).toHaveBeenCalledWith(expect.stringMatching(/\/releasesession$/), expect.objectContaining({ method: 'POST' }));
    expect(res.json).toHaveBeenCalledWith({ received: true });
  });

  test('uses paymentIntent metadata fallback when session lacks metadata', async () => {
    const req = {
      body: {
        type: 'checkout.session.completed',
        data: { object: { payment_intent: 'pi_123' } }
      },
      headers: {}
    };
    const res = makeRes();

    await webhook(req, res);

    // Should have called booksession using fallback metadata
    expect(global.fetch).toHaveBeenCalledWith(expect.stringMatching(/\/booksession$/), expect.any(Object));
    expect(res.json).toHaveBeenCalledWith({ received: true });
  });
});
