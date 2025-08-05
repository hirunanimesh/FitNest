const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('../config');
const { serviceHealth } = require('../utils/serviceHealth');

const paymentProxy = createProxyMiddleware({
  target: config.services.payment,
  changeOrigin: true,
  pathRewrite: {
    '^/api/payment': '' // Remove /api/gym prefix when forwarding
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[Payment Proxy] ${req.method} ${req.originalUrl} -> ${proxyReq.getHeader('host')}${req.url}`);
  },
  onError: (err, req, res) => {
    console.error(`[Payment Proxy Error] ${err.message}`);
    res.status(503).json({
      status: 'error',
      message: 'Payment service unavailable',
      error: 'Service is currently down or unreachable'
    });
  },
  onProxyRes: (proxyRes, req, res) => {
    // Log successful proxy responses
    console.log(`[Payment Proxy] Response: ${proxyRes.statusCode} for ${req.method} ${req.originalUrl}`);
  }
});

module.exports = paymentProxy;
