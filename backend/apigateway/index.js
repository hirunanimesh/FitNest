const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`[API Gateway] ${req.method} ${req.url}`);
  next();
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API Gateway is running',
    timestamp: new Date().toISOString(),
    service: 'APIGateway'
  });
});



// Proxy for auth service - proxy all requests starting with /api/auth
const authProxy = createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  changeOrigin: true,
pathRewrite: {
  '^/api/auth': '/api/auth'  // Keep the full path when forwarding
},
onProxyReq: (proxyReq, req, res) => {
  console.log(`[Proxy] ${req.method} ${req.originalUrl} -> ${proxyReq.getHeader('host')}${req.url}`);
}
});

app.use('/api/auth', authProxy);
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 API Gateway is running on port ${PORT}`);
  console.log(`📡 Health check available at: http://localhost:${PORT}/health`);
});

