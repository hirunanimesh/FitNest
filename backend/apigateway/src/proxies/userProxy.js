const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('../config');
const { serviceHealth } = require('../utils/serviceHealth');

const userProxy = createProxyMiddleware({
  target: config.services.user,
  changeOrigin: true,
  pathRewrite: {
    '^/api/user': '' // Remove /api/user prefix when forwarding
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[User Proxy] ${req.method} ${req.originalUrl} -> ${proxyReq.getHeader('host')}${req.url}`);
  },
  onError: (err, req, res) => {
    console.error(`[User Proxy Error] ${err.message}`);
    res.status(503).json({
      status: 'error',
      message: 'User service unavailable',
      error: 'Service is currently down or unreachable'
    });
  },
  onProxyRes: (proxyRes, req, res) => {
    // Log successful proxy responses
    console.log(`[User Proxy] Response: ${proxyRes.statusCode} for ${req.method} ${req.originalUrl}`);
  }
});

module.exports = userProxy;
