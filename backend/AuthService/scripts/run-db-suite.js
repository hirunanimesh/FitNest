#!/usr/bin/env node
// Run seed + all DB integrity tests with .env.test and print a concise summary
const { spawn } = require('child_process');

function runCmd(cmd, args, options = {}) {
  return new Promise((resolve) => {
    const started = Date.now();
    const child = spawn(cmd, args, { shell: process.platform === 'win32', ...options });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => { stdout += d.toString(); });
    child.stderr.on('data', (d) => { stderr += d.toString(); });
    child.on('close', (code) => {
      resolve({ code, stdout, stderr, ms: Date.now() - started });
    });
  });
}

function tailLines(text, n = 10) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  return lines.slice(-n).join('\n');
}

async function main() {
  if (!process.env.DOTENV_CONFIG_PATH || !/\.env\.test$/i.test(process.env.DOTENV_CONFIG_PATH)) {
    console.error('[all-db-tests] DOTENV_CONFIG_PATH must point to .env.test');
    process.exit(2);
  }

  const steps = [
    { id: 'seed', name: 'Seed database', args: ['-r','dotenv/config','scripts/seed-all-tables.js'] },
    { id: 'smokeTables', name: 'Tables smoke (counts)', args: ['-r','dotenv/config','scripts/supabase-tables-smoke.js'] },
    { id: 'smokeConn', name: 'Connectivity smoke', args: ['-r','dotenv/config','scripts/supabase-smoke.js'] },
    { id: 'smokeRls', name: 'RLS smoke (anon policy)', args: ['-r','dotenv/config','scripts/supabase-rls-smoke.js'] },
    { id: 'write', name: 'Write integrity (CRUD/constraints)', args: ['-r','dotenv/config','scripts/supabase-write-integrity.js'] },
  ];

  const results = [];
  for (const step of steps) {
    console.log(`\n=== ${step.name} ===`);
    const res = await runCmd('node', step.args, { cwd: process.cwd(), env: process.env });
    results.push({ step, res });
    process.stdout.write(res.stdout);
    if (res.code !== 0) {
      process.stderr.write(res.stderr);
      console.error(`[${step.id}] exited with code ${res.code}`);
    }
  }

  // Summary
  console.log('\n===== DB TEST SUMMARY =====');
  for (const { step, res } of results) {
    const status = res.code === 0 ? 'PASS' : 'FAIL';
    console.log(`- ${step.name}: ${status} (${(res.ms/1000).toFixed(1)}s)`);
    const snippet = tailLines(res.stdout || res.stderr, 5);
    if (snippet) {
      console.log(`  last lines:\n  ${snippet.split('\n').map(l=>l.trim()).join('\n  ')}`);
    }
  }

  const failed = results.filter(r => r.res.code !== 0);
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  console.error('[all-db-tests] unexpected error:', e && e.stack || e);
  process.exit(1);
});
