const express = require('express');
const router = express.Router();
const { supabase, testConnection } = require('../superbaseClient');

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
router.post('/signup', async (req, res) => {
  console.log('[Auth Service] Signup request received');
  console.log('[Auth Service] Request body:', req.body);
  console.log('[Auth Service] Request headers:', req.headers);
  
  const { email, password, role } = req.body;
  
  // Validate required fields
  if (!email || !password) {
    console.log('[Auth Service] Missing required fields');
    return res.status(400).json({ 
      status: 'error',
      message: 'Email and password are required',
      received: { email: !!email, password: !!password, role }
    });
  }
  
  console.log('[Auth Service] Creating user with Supabase...');

  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: role || 'user'
      }
    });

    if (error) {
      console.log('[Auth Service] Supabase error:', error);
      return res.status(400).json({ 
        status: 'error',
        error: error.message 
      });
    }

    console.log('[Auth Service] User created successfully');
    return res.status(201).json({ 
      status: 'success',
      message: 'User created successfully', 
      user: data.user 
    });
  } catch (err) {
    console.error('[Auth Service] Unexpected error:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: err.message
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return res.status(401).json({ error: error.message });
  }

  // Store token in httpOnly cookie (or return as JSON)
  res.cookie('token', data.session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 1000 // 1 hour
  });

  return res.status(200).json({ user: data.user });
});

module.exports = router;
