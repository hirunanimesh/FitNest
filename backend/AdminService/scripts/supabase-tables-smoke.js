/* Read-only Supabase tables probe for AdminService (ESM) */
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envPath = process.env.DOTENV_CONFIG_PATH;
if (!envPath || !/\.env\.test$/i.test(envPath)) {
  console.error('[tables-smoke:admin] DOTENV_CONFIG_PATH must point to .env.test');
  process.exit(2);
}
if (!fs.existsSync(envPath)) {
  console.error(`[tables-smoke:admin] Missing ${envPath}. Copy .env.test.example to .env.test`);
  process.exit(2);
}

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error('[tables-smoke:admin] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(2);
}

const supabase = createClient(url, serviceKey);
const tables = [
  'documents',
  'verifications',
  'trainer',
  'gym',
  'Reports',
  'banned'
];

async function probe(name) {
  try {
    const { error, count } = await supabase.from(name).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`[tables-smoke:admin] ${name}: ERROR ${error.code || ''} ${error.message}`);
      return false;
    }
    console.log(`[tables-smoke:admin] ${name}: OK count=${typeof count === 'number' ? count : 'unknown'}`);
    return true;
  } catch (e) {
    console.log(`[tables-smoke:admin] ${name}: FAIL ${e?.message || e}`);
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
  console.log(`[tables-smoke:admin] done in ${Date.now() - started}ms. ok=${ok} fail=${tables.length - ok}`);
})();
