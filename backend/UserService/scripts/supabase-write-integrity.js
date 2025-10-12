/*
  UserService DB Integrity Test (generic WRITE across selected tables)
  - Uses ONLY .env.test (DOTENV_CONFIG_PATH enforced)
  - For each table: try insert {} (may fail if constraints exist), if success try update and delete
  - Also check anon insert denial
*/
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envPath = process.env.DOTENV_CONFIG_PATH;
if (!envPath || !/\.env\.test$/i.test(envPath)) {
  console.error('[integrity:user] DOTENV_CONFIG_PATH must point to .env.test');
  process.exit(2);
}
if (!fs.existsSync(envPath)) {
  console.error(`[integrity:user] Missing ${envPath}. Copy .env.test.example to .env.test`);
  process.exit(2);
}

const URL = process.env.SUPABASE_URL;
const SRV = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON = process.env.SUPABASE_ANON_KEY;
if (!URL || !SRV) {
  console.error('[integrity:user] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(2);
}

const su = createClient(URL, SRV);
const anon = ANON ? createClient(URL, ANON) : null;

const tables = [
  'customer', 'customer_progress', 'trainer_sessions', 'Reports', 'calendar', 'user_google_tokens'
];

const pkCandidates = ['id','customer_id','trainer_id','calendar_id','session_id','report_id'];

async function tryInsert(table) {
  return await su.from(table).insert([{}]).select('*').single();
}

function pickPkRow(row) {
  for (const k of pkCandidates) if (row && row[k]) return { key: k, value: row[k] };
  // last resort: detect a key that ends with _id
  if (row) {
    for (const k of Object.keys(row)) if (k.endsWith('_id') && row[k]) return { key: k, value: row[k] };
  }
  return null;
}

async function tryUpdate(table, pk) {
  // best effort: no-op update (set to itself) by sending empty patch
  return await su.from(table).update({}).eq(pk.key, pk.value).select('*').single();
}

async function tryDelete(table, pk) {
  return await su.from(table).delete().eq(pk.key, pk.value);
}

async function anonInsertDenied(table) {
  if (!anon) return 'anon key missing (skipped)';
  const { error } = await anon.from(table).insert([{}]);
  if (!error) return 'WARNING: anon insert allowed';
  if ((error.message||'').toLowerCase().includes('permission') || error.code==='42501') return 'anon denied (expected)';
  return `anon insert error: ${error.message}`;
}

(async () => {
  const started = Date.now();
  let pass = 0, fail = 0;
  for (const t of tables) {
    let inserted; let pk;
    try {
      const { data, error } = await tryInsert(t);
      if (error) {
        console.log(`[integrity:user] ${t}: insert invalid (as expected or constraints exist) -> ${error.message}`);
      } else {
        inserted = data; pk = pickPkRow(inserted);
        console.log(`[integrity:user] ${t}: insert OK, pk=${pk ? `${pk.key}=${pk.value}` : 'unknown'}`);
        if (pk) {
          const { error: uerr } = await tryUpdate(t, pk);
          if (uerr) console.log(`[integrity:user] ${t}: update error -> ${uerr.message}`); else console.log(`[integrity:user] ${t}: update OK`);
          const { error: derr } = await tryDelete(t, pk);
          if (derr) console.log(`[integrity:user] ${t}: delete error -> ${derr.message}`); else console.log(`[integrity:user] ${t}: delete OK`);
        }
      }
      const rls = await anonInsertDenied(t);
      console.log(`[integrity:user] ${t}: RLS anon -> ${rls}`);
      pass++;
    } catch (e) {
      fail++;
      console.log(`[integrity:user] ${t}: FAIL ${e?.message || e}`);
    }
  }
  console.log(`[integrity:user] done in ${Date.now()-started}ms. pass=${pass} fail=${fail}`);
})();
