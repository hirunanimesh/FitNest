describe('Admin Proxy callbacks', () => {
  let capturedOpts;
  beforeEach(() => {
    jest.resetModules();
    jest.doMock('http-proxy-middleware', () => ({
      createProxyMiddleware: (opts) => {
        capturedOpts = opts;
        return (req, res, next) => next && next();
      }
    }));
  });

  test('invokes onProxyReq, onProxyRes and onError', () => {
    require('../proxies/adminProxy');
    expect(typeof capturedOpts.onProxyReq).toBe('function');
    expect(typeof capturedOpts.onProxyRes).toBe('function');
    expect(typeof capturedOpts.onError).toBe('function');
    expect(typeof capturedOpts.router).toBe('function');

    const proxyReq = { getHeader: jest.fn().mockReturnValue('admin-host'), url: '/health' };
    const req = { method: 'GET', originalUrl: '/api/admin/health' };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const err = new Error('down');

    capturedOpts.onProxyReq(proxyReq, req);
    const proxyRes = { statusCode: 200 };
    capturedOpts.onProxyRes(proxyRes, req);
    capturedOpts.onError(err, req, res);
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalled();
  });
});
