const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('../config');

const userProxy = createProxyMiddleware({
  target: config.services.user,
  changeOrigin: true,
  pathRewrite: {
    '^/api/user': ''
  },
  parseReqBody: false,
  proxyTimeout: 60000,
  timeout: 60000,
  onError: (err, req, res) => {
    console.error(`[User Proxy Error] ${err.message}`);
    res.status(503).json({
      status: 'error',
      message: 'User service unavailable'
    });
  }
});

module.exports = userProxy;
