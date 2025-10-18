/* AuthService DB Integrity Test (generic WRITE) */
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envPath = process.env.DOTENV_CONFIG_PATH;
if (!envPath || !/\.env\.test$/i.test(envPath)) { console.error('[integrity:auth] DOTENV_CONFIG_PATH must point to .env.test'); process.exit(2); }
if (!fs.existsSync(envPath)) { console.error(`[integrity:auth] Missing ${envPath}.`); process.exit(2); }

const URL = process.env.SUPABASE_URL; const SRV = process.env.SUPABASE_SERVICE_ROLE_KEY; const ANON = process.env.SUPABASE_ANON_KEY;
if (!URL || !SRV) { console.error('[integrity:auth] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'); process.exit(2); }
const su = createClient(URL, SRV); const anon = ANON ? createClient(URL, ANON) : null;

const tables = [
  'customer','customer_progress','trainer','gym','trainer_sessions','Gym_plans','verifications',
  'documents','Reports','banned','calendar','user_google_tokens','gym_plan_trainers','trainer_requests','trainer_plans'
];
const pkCandidates = ['id','trainer_id','session_id','plan_id','request_id'];

function pickPkRow(row){ for(const k of pkCandidates) if(row&&row[k]) return {key:k,value:row[k]}; for(const k in (row||{})) if(k.endsWith('_id')&&row[k]) return {key:k,value:row[k]}; return null; }

async function tryInsert(t){ return await su.from(t).insert([{}]).select('*').single(); }
async function tryUpdate(t,pk){ return await su.from(t).update({}).eq(pk.key, pk.value).select('*').single(); }
async function tryDelete(t,pk){ return await su.from(t).delete().eq(pk.key, pk.value); }
async function anonInsertDenied(t){ if(!anon) return 'anon missing'; const {error}=await anon.from(t).insert([{}]); if(!error) return 'WARNING: anon insert allowed'; if((error.message||'').toLowerCase().includes('permission')||error.code==='42501') return 'anon denied (expected)'; return `anon insert error: ${error.message}`; }

(async()=>{ const started=Date.now(); let pass=0,fail=0; for(const t of tables){ let pk; try{ const {data,error}=await tryInsert(t); if(error){ console.log(`[integrity:auth] ${t}: insert invalid -> ${error.message}`);} else { pk=pickPkRow(data); console.log(`[integrity:auth] ${t}: insert OK pk=${pk?`${pk.key}=${pk.value}`:'unknown'}`); if(pk){ const {error:u}=await tryUpdate(t,pk); console.log(u?`[integrity:auth] ${t}: update error -> ${u.message}`:`[integrity:auth] ${t}: update OK`); const {error:d}=await tryDelete(t,pk); console.log(d?`[integrity:auth] ${t}: delete error -> ${d.message}`:`[integrity:auth] ${t}: delete OK`);} }
 const rls=await anonInsertDenied(t); console.log(`[integrity:auth] ${t}: RLS anon -> ${rls}`); pass++; } catch(e){ fail++; console.log(`[integrity:auth] ${t}: FAIL ${e?.message||e}`); } } console.log(`[integrity:auth] done in ${Date.now()-started}ms. pass=${pass} fail=${fail}`); })();
