require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { testConnection } = require('./config/db');

const app = express();

// Built-in Express middleware (replaces body-parser)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());


// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Auth Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    error: {
      message: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message,
      status: err.status || 500
    }
  });
});


// Handle 404 for unmatched routes
app.all('*', (req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404,
      path: req.originalUrl
    }
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`🚀 Auth Service running on port ${PORT}`);
  
  // Test database connection
  try {
    const connected = await testConnection();
    if (connected) {
      console.log('✅ Database connection successful');
    } else {
      console.error('❌ Database connection failed');
    }
  } catch (error) {
    console.error('❌ Error testing database connection:', error.message);
  }
});


