const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('../config');
const { serviceHealth } = require('../utils/serviceHealth');

const userProxy = createProxyMiddleware({
  target: config.services.user,
  changeOrigin: true,
  pathRewrite: {
    '^/api/user': '' // Remove /api/user prefix when forwarding
  },
  // Important: Don't parse body for file uploads
  parseReqBody: false,
  // Increase timeouts for file uploads
  proxyTimeout: 60000, // 60 seconds
  timeout: 60000,
  // Buffer settings for file uploads
  buffer: null,
  // Keep original headers for multipart data
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[User Proxy] ${req.method} ${req.originalUrl} -> ${proxyReq.getHeader('host')}${req.url}`);
    
    // For file uploads, ensure proper headers are maintained
    if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
      
      // Ensure content-length is properly set
      if (req.headers['content-length']) {
        proxyReq.setHeader('content-length', req.headers['content-length']);
      }
    }
  },
  onError: (err, req, res) => {
    console.error(`[User Proxy Error] ${err.message}`);
    res.status(503).json({
      status: 'error',
      message: 'User service unavailable',
      error: 'Service is currently down or unreachable'
    });
  },
  
});

module.exports = userProxy;
