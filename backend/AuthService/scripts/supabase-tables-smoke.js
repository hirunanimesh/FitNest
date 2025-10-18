/*
  Supabase tables smoke (read-only)
  - Uses only .env.test via DOTENV_CONFIG_PATH with dotenv/config
  - Performs head-only count selects on known tables to validate accessibility
  - Does NOT modify schema or data
*/

const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Enforce .env.test only
const envPath = process.env.DOTENV_CONFIG_PATH;
if (!envPath || !/\.env\.test$/i.test(envPath)) {
  console.error('[tables-smoke] DOTENV_CONFIG_PATH must point to .env.test (refusing to read .env)');
  process.exit(2);
}
if (!fs.existsSync(envPath)) {
  console.error(`[tables-smoke] Missing ${envPath}. Copy .env.test.example to .env.test and fill test creds.`);
  process.exit(2);
}

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('[tables-smoke] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set in .env.test');
  process.exit(2);
}

const supabase = createClient(url, serviceKey);

// Candidate tables found in codebase; this script will probe them read-only
const tables = [
  'customer',
  'customer_progress',
  'trainer',
  'gym',
  'trainer_sessions',
  'Gym_plans',
  'verifications',
  'documents',
  'Reports',
  'banned',
  'calendar',
  'user_google_tokens',
  'gym_plan_trainers',
  'trainer_requests',
  'trainer_plans'
];

async function probeTable(name) {
  try {
    const { error, count } = await supabase
      .from(name)
      .select('*', { count: 'exact', head: true });

    if (error) {
      // Common error codes: 42P01 (relation does not exist), 42501 (insufficient_privilege)
      console.log(`[tables-smoke] ${name}: ERROR ${error.code || ''} ${error.message}`);
      return { name, ok: false, error: error.message, code: error.code };
    }
    console.log(`[tables-smoke] ${name}: OK count=${typeof count === 'number' ? count : 'unknown'}`);
    return { name, ok: true, count: count ?? null };
  } catch (e) {
    console.log(`[tables-smoke] ${name}: FAIL ${e?.message || e}`);
    return { name, ok: false, error: e?.message || String(e) };
  }
}

async function main() {
  const started = Date.now();
  const results = [];
  for (const t of tables) {
    // eslint-disable-next-line no-await-in-loop
    results.push(await probeTable(t));
  }

  const ok = results.filter(r => r.ok).length;
  const fail = results.length - ok;
  console.log(`[tables-smoke] done in ${Date.now() - started}ms. ok=${ok} fail=${fail}`);
  process.exit(0);
}

main();
