const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const authRoutes = require('./Routes/authRoutes');
const { testConnection } = require('./superbaseClient');
require('dotenv').config();

// JSON parsing middleware - simplified
app.use(express.json());

app.use(cookieParser());

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`🚀 Auth service running on port ${PORT}`);
  
  // Test Supabase connection on startup
  console.log('Testing Supabase database connection...');
  await testConnection();
});
