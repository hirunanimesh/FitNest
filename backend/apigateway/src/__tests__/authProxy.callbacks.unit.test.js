describe('Auth Proxy callbacks', () => {
  let capturedOpts;
  beforeEach(() => {
    jest.resetModules();
    jest.doMock('http-proxy-middleware', () => ({
      createProxyMiddleware: (opts) => {
        capturedOpts = opts;
        // Return a noop middleware
        return (req, res, next) => next && next();
      }
    }));
  });

  test('invokes onProxyReq, onProxyRes and onError', () => {
    const proxy = require('../proxies/authProxy');
    expect(typeof capturedOpts.onProxyReq).toBe('function');
    expect(typeof capturedOpts.onProxyRes).toBe('function');
    expect(typeof capturedOpts.onError).toBe('function');

    const proxyReq = { getHeader: jest.fn().mockReturnValue('auth-host'), url: '/login' };
    const req = { method: 'POST', originalUrl: '/api/auth/login' };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const err = new Error('down');

    // onProxyReq(proxyReq, req)
    capturedOpts.onProxyReq(proxyReq, req);
    expect(proxyReq.getHeader).toHaveBeenCalledWith('host');

    // onProxyRes(proxyRes, req)
    const proxyRes = { statusCode: 200 };
    capturedOpts.onProxyRes(proxyRes, req);

    // onError(err, res) -- auth proxy defines two-arg signature
    capturedOpts.onError(err, res);
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalled();
  });
});
