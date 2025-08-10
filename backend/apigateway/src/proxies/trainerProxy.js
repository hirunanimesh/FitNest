const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('../config');
const { serviceHealth } = require('../utils/serviceHealth');

const trainerProxy = createProxyMiddleware({
  target: config.services.trainer,
  changeOrigin: true,
  pathRewrite: {
    '^/api/trainer': '' // Remove /api/trainer prefix when forwarding
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[Trainer Proxy] ${req.method} ${req.originalUrl} -> ${proxyReq.getHeader('host')}${req.url}`);
  },
  onError: (err, req, res) => {
    console.error(`[Trainer Proxy Error] ${err.message}`);
    res.status(503).json({
      status: 'error',
      message: 'Trainer service unavailable',
      error: 'Service is currently down or unreachable'
    });
  },
  onProxyRes: (proxyRes, req, res) => {
    // Log successful proxy responses
    console.log(`[Trainer Proxy] Response: ${proxyRes.statusCode} for ${req.method} ${req.originalUrl}`);
  }
});

module.exports = trainerProxy;
