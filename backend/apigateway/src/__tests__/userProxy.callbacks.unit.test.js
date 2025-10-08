describe('User Proxy callbacks', () => {
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

  test('invokes onError when upstream fails', () => {
    require('../proxies/userProxy');
    expect(typeof capturedOpts.onError).toBe('function');

    const req = { method: 'GET', originalUrl: '/api/user/profile' };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const err = new Error('down');

    capturedOpts.onError(err, req, res);
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
  });
});
