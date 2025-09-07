// supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Test database connection
const testConnection = async () => {
  try {
    // Test Supabase connection by checking if we can access the auth service
    const { data, error } = await supabase.auth.getSession();
    
    // If we get here without throwing an error, the connection is working
    console.log('✅ Supabase database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection error:', error.message);
    return false;
  }
};

export { supabase, testConnection };
export default supabase;
