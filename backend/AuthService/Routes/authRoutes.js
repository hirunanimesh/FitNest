const express = require('express');
const router = express.Router();
const { supabase, testConnection } = require('../superbaseClient');
const AuthController = require('../controllers/AuthController');

// Health check endpoint to test database connection

router.get('/health', async (req, res) => {
  // Ensure we don't try to parse any body for this GET request
  
  try {
    const isConnected = await testConnection();
    
    if (isConnected) {
      return res.status(200).json({
        status: 'success',
        message: 'Supabase database is connected to the Auth service',
        timestamp: new Date().toISOString(),
        service: 'AuthService'
      });
    } else {
      return res.status(500).json({
        status: 'error',
        message: 'Supabase database connection failed',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Database connection test failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Register user
router.post('/signup', AuthController.createUser);

// Login user
router.post('/login', AuthController.login);
router.post('/customer/register', AuthController.customerRegister);
router.post('/gym/register', AuthController.GymRegister);
router.post('/trainer/register', AuthController.TrainerRegister);

module.exports = router;
