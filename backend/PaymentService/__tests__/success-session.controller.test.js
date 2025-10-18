import successSessionHandler from '../controllers/stripeController/success-session.js';

// Mock Stripe client
jest.mock('../lib/stripe.js', () => ({
  checkout: { sessions: { retrieve: jest.fn() } },
  paymentIntents: { retrieve: jest.fn() },
}));

describe('PaymentService success-session controller', () => {
  const originalFetch = global.fetch;
  beforeEach(() => {
    global.fetch = jest.fn(async () => ({ ok: true, status: 200, json: async () => ({ ok: true }) }));
  });
  afterEach(() => {
    jest.clearAllMocks();
    global.fetch = originalFetch;
  });

  const makeRes = () => {
    const chunks = { status: undefined, headers: undefined, ended: false };
    const res = {};
    res.status = jest.fn((s) => { chunks.status = s; return res; });
    res.json = jest.fn((b) => { chunks.body = b; return res; });
    res.writeHead = jest.fn((code, headers) => { chunks.status = code; chunks.headers = headers; });
    res.end = jest.fn(() => { chunks.ended = true; return res; });
    res._chunks = chunks;
    return res;
  };

  test('400 when cs missing', async () => {
    const req = { query: {} };
    const res = makeRes();
    await successSessionHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('redirects without booking when not paid', async () => {
    const stripe = (await import('../lib/stripe.js')).default || (await import('../lib/stripe.js'));
    stripe.checkout.sessions.retrieve.mockResolvedValue({ payment_status: 'unpaid', status: 'open' });

    const req = { query: { cs: 'cs_123', redirect: 'http://app' } };
    const res = makeRes();
    await successSessionHandler(req, res);
    expect(res.writeHead).toHaveBeenCalledWith(302, expect.objectContaining({ Location: 'http://app' }));
    expect(global.fetch).not.toHaveBeenCalled();
    expect(res._chunks.ended).toBe(true);
  });

  test('paid session triggers booking and redirects', async () => {
    const stripe = (await import('../lib/stripe.js')).default || (await import('../lib/stripe.js'));
    stripe.checkout.sessions.retrieve.mockResolvedValue({
      payment_status: 'paid',
      status: 'complete',
      metadata: { trainer_session_id: 'sess1', app_customer_id: 'cust1' },
    });

    const req = { query: { cs: 'cs_123', redirect: 'http://app' } };
    const res = makeRes();
    await successSessionHandler(req, res);
    expect(global.fetch).toHaveBeenCalledWith(expect.stringMatching(/\/booksession$/), expect.any(Object));
    expect(res.writeHead).toHaveBeenCalledWith(302, expect.objectContaining({ Location: 'http://app' }));
    expect(res._chunks.ended).toBe(true);
  });
});
