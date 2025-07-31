const express = require('express');
const cors = require('cors');
const http = require('http');
const { URL } = require('url');
require('dotenv').config();

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Global middleware
app.use(express.json());

// Health check endpoint for the API Gateway
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API Gateway is running',
    timestamp: new Date().toISOString(),
    service: 'APIGateway'
  });
});

// Manual Auth Service Proxy - This will definitely work
app.use('/api/auth', (req, res) => {
  const targetUrl = new URL(`http://localhost:3001${req.originalUrl}`);
  
  console.log(`[Manual Proxy] ${req.method} ${req.originalUrl} -> ${targetUrl.href}`);
  
  const options = {
    hostname: targetUrl.hostname,
    port: targetUrl.port,
    path: targetUrl.pathname + targetUrl.search,
    method: req.method,
    headers: {
      ...req.headers,
      host: targetUrl.host
    }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    console.log(`[Manual Proxy] Response: ${proxyRes.statusCode} for ${req.originalUrl}`);
    
    // Set response headers
    res.status(proxyRes.statusCode);
    Object.keys(proxyRes.headers).forEach(key => {
      res.setHeader(key, proxyRes.headers[key]);
    });

    // Pipe the response
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('[Manual Proxy] Error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({
        status: 'error',
        message: 'Auth service unavailable',
        error: err.message
      });
    }
  });

  // Pipe the request body if it exists
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    req.pipe(proxyReq);
  } else {
    proxyReq.end();
  }
});

// Future service proxies can be added here
// Example:
// app.use('/api/users', userServiceProxy);
// app.use('/api/workouts', workoutServiceProxy);

// Catch-all route for undefined endpoints
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('[API Gateway] Error:', error);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

const PORT = process.env.API_GATEWAY_PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth/*`);
  console.log(`🎯 Auth service target: http://localhost:3001`);
  console.log(`📝 Using manual HTTP proxy (no external dependencies)`);
});
