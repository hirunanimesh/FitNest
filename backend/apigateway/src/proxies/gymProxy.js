const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('../config');
const { serviceHealth } = require('../utils/serviceHealth');

const gymProxy = createProxyMiddleware({
  target: config.services.gym,
  changeOrigin: true,
  timeout: 30000, // 30 second timeout
  proxyTimeout: 30000,
  pathRewrite: {
    '^/api/gym': '' // Remove /api/gym prefix when forwarding
  },
  onProxyReq: (proxyReq, req, res) => {
    const startTime = Date.now();
    req.proxyStartTime = startTime;
    console.log(`[Gym Proxy] ${req.method} ${req.originalUrl} -> ${config.services.gym}${req.url}`);
    
    // Set timeout for the proxy request
    proxyReq.setTimeout(25000, () => {
      console.error(`[Gym Proxy] Request timeout for ${req.method} ${req.originalUrl}`);
      proxyReq.destroy();
    });
  },
  onError: (err, req, res) => {
    const duration = req.proxyStartTime ? Date.now() - req.proxyStartTime : 0;
    console.error(`[Gym Proxy Error] ${err.message} after ${duration}ms for ${req.method} ${req.originalUrl}`);
    
    if (!res.headersSent) {
      res.status(503).json({
        status: 'error',
        message: 'Gym service unavailable',
        error: err.code === 'ECONNREFUSED' ? 'Service is down' : 'Request timeout or network error'
      });
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    const duration = req.proxyStartTime ? Date.now() - req.proxyStartTime : 0;
    console.log(`[Gym Proxy] Response: ${proxyRes.statusCode} for ${req.method} ${req.originalUrl} (${duration}ms)`);
  }
});

module.exports = gymProxy;
