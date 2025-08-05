module.exports = {
  port: process.env.PORT || 3000,
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3010'
  },
  services: {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    gym: process.env.GYM_SERVICE_URL || 'http://localhost:3002',
    payment: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3003'
  },
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3010',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
  }
};
