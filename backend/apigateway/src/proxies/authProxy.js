const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('../config');
const { serviceHealth } = require('../utils/serviceHealth');

const authProxy = createProxyMiddleware({
  target: config.services.auth,
  changeOrigin: true,
  pathRewrite: {
    '^/': 'api/auth/' // Remove /api/auth prefix when forwarding
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[Auth Proxy] ${req.method} ${req.originalUrl} -> ${proxyReq.getHeader('host')}${req.url}`);
  },
  onError: (err, req, res) => {
    console.error(`[Auth Proxy Error] ${err.message}`);
    res.status(503).json({
      status: 'error',
      message: 'Auth service unavailable',
      error: 'Service is currently down or unreachable'
    });
  },
  onProxyRes: (proxyRes, req, res) => {
    // Log successful proxy responses
    console.log(`[Auth Proxy] Response: ${proxyRes.statusCode} for ${req.method} ${req.originalUrl}`);
  }
});

module.exports = authProxy;
