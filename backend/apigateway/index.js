const express = require('express');
const cors = require('cors');
const config = require('./src/config');
const loggingMiddleware = require('./src/middleware/logging');
const { authenticationMiddleware } = require('./src/middleware/authentication');
const authProxy = require('./src/proxies/authProxy');
const gymProxy = require('./src/proxies/gymProxy');
const paymentProxy = require('./src/proxies/paymentProxy');
const userProxy = require('./src/proxies/userProxy');
const trainerProxy = require('./src/proxies/trainerProxy');
const adminProxy = require('./src/proxies/adminProxy');
const { serviceHealth, startHealthChecks } = require('./src/utils/serviceHealth');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors(config.cors));
app.use(express.json()); // Parse JSON bodies
app.use(loggingMiddleware);

// Authentication middleware - verify tokens before routing to services
app.use(authenticationMiddleware);

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
app.use('/api/payment',paymentProxy);
app.use('/api/user', userProxy);
app.use('/api/trainer', trainerProxy);
app.use('/api/admin', adminProxy);

// 404 handler for unmatched routes
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    path: req.originalUrl,
    availableRoutes: ['/health', '/api/auth/*', '/api/gym/*', '/api/payment/*','/api/user/*','/api/trainer/*', '/api/admin/*'],
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

// Start server only if this file is run directly, not when imported
if (require.main === module) {
  const PORT = config.port;
  app.listen(PORT, () => {
    console.log(`🚀 API Gateway is running on port ${PORT}`);
    console.log('new change here to check cicd');
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 Proxying to services:`, config.services);
    console.log(`🌐 CORS enabled for: ${config.cors.origin}`);
  });
}

// Export the app for testing
module.exports = app;