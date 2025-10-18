/*
  Supabase smoke query (AuthService)
  - Uses only .env.test via DOTENV_CONFIG_PATH with dotenv/config
  - Runs a minimal auth admin query to validate connectivity
*/

const fs = require('fs');

// Enforce using .env.test only
const envPath = process.env.DOTENV_CONFIG_PATH;
if (!envPath || !/\.env\.test$/i.test(envPath)) {
  console.error('[smoke] DOTENV_CONFIG_PATH must point to .env.test (refusing to read .env)');
  process.exit(2);
}
if (!fs.existsSync(envPath)) {
  console.error(`[smoke] Missing ${envPath}. Copy .env.test.example to .env.test and fill test creds.`);
  process.exit(2);
}

const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('[smoke] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set in .env.test');
  process.exit(2);
}

const supabase = createClient(url, serviceKey);

async function main() {
  const started = Date.now();
  try {
    // Minimal admin query: list first page with 1 user
    const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (error) {
      console.error('[smoke] Supabase error:', error);
      process.exit(1);
    }
    const count = Array.isArray(data?.users) ? data.users.length : 0;
    console.log(`[smoke] OK: connected. users(sample)=${count} in ${Date.now() - started}ms`);
    process.exit(0);
  } catch (e) {
    console.error('[smoke] Unexpected failure:', e?.message || e);
    process.exit(1);
  }
}

main();
