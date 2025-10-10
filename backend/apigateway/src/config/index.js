module.exports = {
  port: process.env.PORT || 3000,
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3010'
  },
  services: {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    gym: process.env.GYM_SERVICE_URL || 'http://localhost:3002',
    payment: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3003',
    user: process.env.USER_SERVICE_URL || 'http://localhost:3004',
    trainer: process.env.TRAINER_SERVICE_URL || 'http://localhost:3005',
    admin: process.env.ADMIN_SERVICE_URL || 'http://localhost:3006',
  },
  cors: {
    origin: '*', // Allow all origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS','PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
  }
};
