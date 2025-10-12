/* Read-only Supabase tables probe for UserService (ESM) */
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envPath = process.env.DOTENV_CONFIG_PATH;
if (!envPath || !/\.env\.test$/i.test(envPath)) {
  console.error('[tables-smoke:user] DOTENV_CONFIG_PATH must point to .env.test');
  process.exit(2);
}
if (!fs.existsSync(envPath)) {
  console.error(`[tables-smoke:user] Missing ${envPath}. Copy .env.test.example to .env.test`);
  process.exit(2);
}

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error('[tables-smoke:user] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(2);
}

const supabase = createClient(url, serviceKey);
const tables = [
  'customer',
  'customer_progress',
  'trainer_sessions',
  'Reports',
  'calendar',
  'user_google_tokens'
];

async function probe(name) {
  try {
    const { error, count } = await supabase.from(name).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`[tables-smoke:user] ${name}: ERROR ${error.code || ''} ${error.message}`);
      return false;
    }
    console.log(`[tables-smoke:user] ${name}: OK count=${typeof count === 'number' ? count : 'unknown'}`);
    return true;
  } catch (e) {
    console.log(`[tables-smoke:user] ${name}: FAIL ${e?.message || e}`);
    return false;
  }
}

(async () => {
  const started = Date.now();
  let ok = 0;
  for (const t of tables) {
    // eslint-disable-next-line no-await-in-loop
    if (await probe(t)) ok++;
  }
  console.log(`[tables-smoke:user] done in ${Date.now() - started}ms. ok=${ok} fail=${tables.length - ok}`);
})();
