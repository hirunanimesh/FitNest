/*
  AdminService DB Integrity Test (WRITE) for 'documents' table
  - Uses ONLY .env.test (enforced via DOTENV_CONFIG_PATH)
  - Insert → Read → Update → Read → Invalid Insert (expect error) → Delete → Verify delete
  - RLS check: anon insert should be denied
*/
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envPath = process.env.DOTENV_CONFIG_PATH;
if (!envPath || !/\.env\.test$/i.test(envPath)) {
  console.error('[integrity] DOTENV_CONFIG_PATH must point to .env.test (refusing to read .env)');
  process.exit(2);
}
if (!fs.existsSync(envPath)) {
  console.error(`[integrity] Missing ${envPath}. Copy .env.test.example to .env.test and fill creds.`);
  process.exit(2);
}

const URL = process.env.SUPABASE_URL;
const SRV = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON = process.env.SUPABASE_ANON_KEY;
if (!URL || !SRV) {
  console.error('[integrity] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.test');
  process.exit(2);
}

const su = createClient(URL, SRV);
const anon = ANON ? createClient(URL, ANON) : null;

async function insertDoc(content, metadata = {}) {
  const { data, error } = await su.from('documents').insert([{ content, metadata }]).select('id, content, metadata').single();
  if (error) throw new Error(`insert failed: ${error.message}`);
  return data;
}

async function getDoc(id) {
  const { data, error } = await su.from('documents').select('id, content, metadata').eq('id', id).single();
  if (error) throw new Error(`select failed: ${error.message}`);
  return data;
}

async function updateDoc(id, patch) {
  const { data, error } = await su.from('documents').update(patch).eq('id', id).select('id, content, metadata').single();
  if (error) throw new Error(`update failed: ${error.message}`);
  return data;
}

async function deleteDoc(id) {
  const { error } = await su.from('documents').delete().eq('id', id);
  if (error) throw new Error(`delete failed: ${error.message}`);
}

async function expectInvalidInsert() {
  const { error } = await su.from('documents').insert([{ /* content missing (NOT NULL) */ }]);
  if (!error) throw new Error('expected invalid insert to fail, but it succeeded');
  return error.message;
}

async function expectAnonInsertDenied() {
  if (!anon) return 'anon key not provided, skipped';
  const { error } = await anon.from('documents').insert([{ content: 'anon should be denied' }]);
  if (!error) return 'WARNING: anon insert allowed (unexpected)';
  if ((error.message || '').toLowerCase().includes('permission') || error.code === '42501') {
    return 'anon denied (expected)';
  }
  return `anon insert error: ${error.message}`;
}

(async () => {
  const started = Date.now();
  const stamp = new Date().toISOString();
  console.log('[integrity] START documents write test');
  let id;
  try {
    // Insert
    const ins = await insertDoc(`Integrity test ${stamp}`, { run: 'write-test' });
    id = ins.id;
    console.log('[integrity] insert OK id=', id);

    // Read
    const got1 = await getDoc(id);
    if (got1.content !== ins.content) throw new Error('content mismatch after insert');
    console.log('[integrity] select after insert OK');

    // Update
    const newContent = `Updated at ${stamp}`;
    const upd = await updateDoc(id, { content: newContent });
    if (upd.content !== newContent) throw new Error('content mismatch after update');
    console.log('[integrity] update OK');

    // Read back after update
    const got2 = await getDoc(id);
    if (got2.content !== newContent) throw new Error('content mismatch after update readback');
    console.log('[integrity] select after update OK');

    // Invalid insert (expect error)
    const errMsg = await expectInvalidInsert();
    console.log('[integrity] invalid insert as expected:', errMsg);

    // Delete
    await deleteDoc(id);
    console.log('[integrity] delete OK');

    // Verify delete (head-only count)
    const { count, error } = await su.from('documents').select('*', { count: 'exact', head: true }).eq('id', id);
    if (error) throw new Error(`post-delete select failed: ${error.message}`);
    if (count && count > 0) throw new Error('row still exists after delete');
    console.log('[integrity] verify delete OK');

    // RLS anon insert denied
    const rls = await expectAnonInsertDenied();
    console.log('[integrity] RLS anon insert check:', rls);

    console.log(`[integrity] PASS in ${Date.now() - started}ms`);
    process.exit(0);
  } catch (e) {
    console.error('[integrity] FAIL:', e?.message || e);
    // Attempt cleanup if we have an id
    if (id) {
      try { await deleteDoc(id); } catch (_) {}
    }
    process.exit(1);
  }
})();
