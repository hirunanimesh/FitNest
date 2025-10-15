const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Create Supabase client for API Gateway token verification
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = { supabase };