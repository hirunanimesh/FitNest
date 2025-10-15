/* Seed Supabase auth.users and link user_id on customer/trainer/gym */
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envPath = process.env.DOTENV_CONFIG_PATH;
if (!envPath || !/\.env\.test$/i.test(envPath)) { console.error('[seed-auth] DOTENV_CONFIG_PATH must point to .env.test'); process.exit(2); }
if (!fs.existsSync(envPath)) { console.error(`[seed-auth] Missing ${envPath}`); process.exit(2); }

const URL = process.env.SUPABASE_URL; const SRV = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !SRV) { console.error('[seed-auth] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'); process.exit(2); }
const su = createClient(URL, SRV);

async function createUsers(role, count) {
  const users = [];
  for (let i = 1; i <= count; i++) {
    const email = `${role}${i}.${Date.now()}@example.com`;
    const password = 'Test1234!';
    const { data, error } = await su.auth.admin.createUser({
      email,
      password,
      user_metadata: { role },
      email_confirm: true
    });
    if (error) throw error;
    users.push(data.user);
  }
  return users;
}

async function linkUsersToTable(users, table, idCol = 'id') {
  // Get 5 rows to link; prefer rows with NULL user_id when possible
  let { data: rows, error } = await su.from(table).select(`${idCol}, user_id`).is('user_id', null).limit(users.length).order(idCol, { ascending: true });
  if (error) throw error;
  if (!rows || rows.length < users.length) {
    // Fallback: take first N rows
    const { data: anyRows, error: e2 } = await su.from(table).select(`${idCol}, user_id`).limit(users.length).order(idCol, { ascending: true });
    if (e2) throw e2;
    rows = anyRows || [];
  }
  const updates = [];
  for (let i = 0; i < users.length && i < rows.length; i++) {
    const u = users[i];
    const r = rows[i];
    updates.push(su.from(table).update({ user_id: u.id }).eq(idCol, r[idCol]));
  }
  for (const p of updates) {
    const { error: ue } = await p;
    if (ue) throw ue;
  }
}

(async () => {
  try {
    console.log('[seed-auth] creating users');
    const customerUsers = await createUsers('customer', 5);
    const trainerUsers = await createUsers('trainer', 5);
    const gymUsers = await createUsers('gym', 5);

    console.log('[seed-auth] linking users to public tables');
    await linkUsersToTable(customerUsers, 'customer', 'id');
    await linkUsersToTable(trainerUsers, 'trainer', 'id');
    await linkUsersToTable(gymUsers, 'gym', 'gym_id');

    console.log('[seed-auth] done');
  } catch (e) {
    console.error('[seed-auth] failed:', e.message || e);
    process.exit(1);
  }
})();
