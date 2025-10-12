/*
  Supabase RLS smoke (read-only, anon key)
  - Uses ONLY .env.test via DOTENV_CONFIG_PATH
  - Attempts head-only selects with anon key to verify public access is denied for sensitive tables
  - Does not modify schema or data
*/
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envPath = process.env.DOTENV_CONFIG_PATH;
if (!envPath || !/\.env\.test$/i.test(envPath)) {
  console.error('[rls-smoke] DOTENV_CONFIG_PATH must point to .env.test');
  process.exit(2);
}
if (!fs.existsSync(envPath)) {
  console.error(`[rls-smoke] Missing ${envPath}. Copy .env.test.example to .env.test`);
  process.exit(2);
}

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
if (!url || !anonKey) {
  console.error('[rls-smoke] Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env.test');
  process.exit(2);
}

const supabase = createClient(url, anonKey);
// Likely restricted tables
const tables = [
  'customer','customer_progress','trainer','gym','trainer_sessions','Gym_plans','verifications','documents','Reports','banned','calendar','user_google_tokens','gym_plan_trainers','trainer_requests','trainer_plans'
];

async function probe(name) {
  try {
    const { error, count } = await supabase.from(name).select('*', { count: 'exact', head: true });
    if (error) {
      // Permission denied is expected for restricted tables
      if ((error.message || '').toLowerCase().includes('permission') || error.code === '42501') {
        console.log(`[rls-smoke] ${name}: DENIED (expected)`);
        return { name, status: 'denied' };
      }
      console.log(`[rls-smoke] ${name}: ERROR ${error.code || ''} ${error.message}`);
      return { name, status: 'error', error: error.message };
    }
    console.log(`[rls-smoke] ${name}: ALLOWED (public can read) count=${typeof count==='number'?count:'unknown'}`);
    return { name, status: 'allowed', count: count ?? null };
  } catch (e) {
    console.log(`[rls-smoke] ${name}: FAIL ${e?.message || e}`);
    return { name, status: 'fail', error: e?.message || String(e) };
  }
}

(async () => {
  const started = Date.now();
  const results = [];
  for (const t of tables) {
    // eslint-disable-next-line no-await-in-loop
    results.push(await probe(t));
  }
  const denied = results.filter(r=>r.status==='denied').length;
  const allowed = results.filter(r=>r.status==='allowed').length;
  const errored = results.filter(r=>r.status==='error'||r.status==='fail').length;
  console.log(`[rls-smoke] done in ${Date.now()-started}ms. denied=${denied} allowed=${allowed} other=${errored}`);
})();
