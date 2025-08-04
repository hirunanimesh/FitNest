const express = require('express');
const cors = require('cors');
const config = require('./src/config');
const loggingMiddleware = require('./src/middleware/logging');
const authProxy = require('./src/proxies/authProxy');
const gymProxy = require('./src/proxies/gymProxy');
const { serviceHealth, startHealthChecks } = require('./src/utils/serviceHealth');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors(config.cors));
app.use(loggingMiddleware);

// Start service health monitoring
startHealthChecks();

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API Gateway is running',
    timestamp: new Date().toISOString(),
    service: 'APIGateway',
    version: process.env.npm_package_version || '1.0.0',
    services: serviceHealth
  });
});

// Service routes
app.use('/api/auth', authProxy);
app.use('/api/gym', gymProxy);

// 404 handler for unmatched routes
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    path: req.originalUrl,
    availableRoutes: ['/health', '/api/auth/*', '/api/gym/*']
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[API Gateway Error]', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 API Gateway is running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Proxying to services:`, config.services);
  console.log(`🌐 CORS enabled for: ${config.cors.origin}`);
});