const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('../config');
const { serviceHealth } = require('../utils/serviceHealth');

const gymProxy = createProxyMiddleware({
  target: config.services.gym,
  changeOrigin: true,
  pathRewrite: {
    '^/api/gym': '' // Remove /api/gym prefix when forwarding
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[Gym Proxy] ${req.method} ${req.originalUrl} -> ${proxyReq.getHeader('host')}${req.url}`);
  },
  onError: (err, req, res) => {
    console.error(`[Gym Proxy Error] ${err.message}`);
    res.status(503).json({
      status: 'error',
      message: 'Gym service unavailable',
      error: 'Service is currently down or unreachable'
    });
  },
  onProxyRes: (proxyRes, req, res) => {
    // Log successful proxy responses
    console.log(`[Gym Proxy] Response: ${proxyRes.statusCode} for ${req.method} ${req.originalUrl}`);
  }
});

module.exports = gymProxy;
