// Test setup for UserService tests
// Provide required SUPABASE env vars so modules that create the client don't throw at import time.
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'service-role-key';

// Optionally disable dotenv logs if dotenv is loaded
process.env.DOTENV_CONFIG_VERBOSITY = 'silent';
