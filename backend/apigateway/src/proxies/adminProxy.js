const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('../config');
const { serviceHealth } = require('../utils/serviceHealth');

const adminProxy = createProxyMiddleware({
  target: config.services.admin,
  changeOrigin: true,
  pathRewrite: {
    '^/api/admin': '' // Remove /api/admin prefix when forwarding to admin service
  },
  onProxyReq: (proxyReq, req) => {
    console.log(`[Admin Proxy] ${req.method} ${req.originalUrl} -> ${proxyReq.getHeader('host')}${req.url}`);
  },
  onError: (err, req, res) => {
    console.error(`[Admin Proxy Error] ${err.message}`);
    res.status(503).json({
      status: 'error',
      message: 'Admin service unavailable',
      error: 'Service is currently down or unreachable'
    });
  },
  onProxyRes: (proxyRes, req) => {
    // Log successful proxy responses
    console.log(`[Admin Proxy] Response: ${proxyRes.statusCode} for ${req.method} ${req.originalUrl}`);
  },
  // Additional configuration for admin service
  timeout: 60000, // 60 seconds timeout for admin operations
  proxyTimeout: 60000,
  // Handle special cases for admin endpoints
  router: (req) => {
    // Route all admin requests to the admin service
    return config.services.admin;
  }
});

module.exports = adminProxy;
