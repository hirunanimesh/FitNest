/* Seed Supabase test DB with >=30 rows per table (idempotent-ish: skips if table already has >=TARGET) */
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envPath = process.env.DOTENV_CONFIG_PATH;
if (!envPath || !/\.env\.test$/i.test(envPath)) {
  console.error('[seed] DOTENV_CONFIG_PATH must point to .env.test');
  process.exit(2);
}
if (!fs.existsSync(envPath)) {
  console.error(`[seed] Missing ${envPath}`);
  process.exit(2);
}

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error('[seed] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set');
  process.exit(2);
}
const db = createClient(url, serviceKey);
const TARGET = 30;

async function countRows(table) {
  const { error, count } = await db.from(table).select('*', { head: true, count: 'exact' });
  if (error) return { ok: false, code: error.code, msg: error.message };
  return { ok: true, count: count || 0 };
}

async function createAuthUsers(n, role) {
  const ids = [];
  for (let i = 0; i < n; i++) {
    const email = `${role}.${Date.now()}.${i}@seed.fitnest.local`;
    const password = 'Test1234!';
    const { data, error } = await db.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role }
    });
    if (error) throw error;
    ids.push(data.user.id);
  }
  return ids;
}

async function ensureFiveGyms() {
  const c = await countRows('gym');
  if (!c.ok) throw new Error(`gym count: ${c.msg}`);
  if (c.count >= TARGET) return (await db.from('gym').select('gym_id').limit(TARGET)).data.map(r=>r.gym_id);
  const deficit = TARGET - c.count;
  const userIds = await createAuthUsers(deficit, 'gym');
  const rows = Array.from({length: deficit}, (_,i)=>({
    user_id: userIds[i],
    address: `${i+1} Main St, District ${((i%5)+1)}`,
    location: `City ${((i%10)+1)}`,
    contact_no: `+10000000${(i+1).toString().padStart(3,'0')}`,
    gym_name: `Gym ${i+1} FitNest`,
    profile_img: null,
    documents: { seeded: true, business_reg: `BR-${1000+i}` },
    description: `Test gym ${i+1} description`,
    operating_Hours: 'Mon-Fri 09:00-17:00',
    owner_name: `Owner ${i+1}`,
  }));
  const { data, error } = await db.from('gym').insert(rows).select('gym_id');
  if (error) throw error;
  const { data: all } = await db.from('gym').select('gym_id').limit(TARGET);
  return all.map(r=>r.gym_id);
}

async function ensureFiveTrainers() {
  const c = await countRows('trainer');
  if (!c.ok) throw new Error(`trainer count: ${c.msg}`);
  if (c.count >= TARGET) return (await db.from('trainer').select('id').limit(TARGET)).data.map(r=>r.id);
  const deficit = TARGET - c.count;
  const userIds = await createAuthUsers(deficit, 'trainer');
  const rows = Array.from({length: deficit}, (_,i)=>({
    user_id: userIds[i],
    trainer_name: `Trainer ${i+1} TN`,
    contact_no: `+20000000${(i+1).toString().padStart(3,'0')}`,
    bio: `Certified trainer level ${((i%3)+1)}`,
    skills: 'fitness, cardio',
    years_of_experience: (i % 10) + 1,
    profile_img: null,
    verified: false,
    documents: { seeded: true, cert: `CERT-${2000+i}` },
  }));
  const { error } = await db.from('trainer').insert(rows).select('id');
  if (error) throw error;
  const { data: all } = await db.from('trainer').select('id').limit(TARGET);
  return all.map(r=>r.id);
}

async function ensureFiveCustomers() {
  const c = await countRows('customer');
  if (!c.ok) throw new Error(`customer count: ${c.msg}`);
  if (c.count >= TARGET) return (await db.from('customer').select('id').limit(TARGET)).data.map(r=>r.id);
  const deficit = TARGET - c.count;
  const userIds = await createAuthUsers(deficit, 'customer');
  const rows = Array.from({length: deficit}, (_,i)=>({
    user_id: userIds[i],
    first_name: `First${i+1}`,
    last_name: `Last${i+1}`,
    address: `${i+1} River Rd, Block ${((i%7)+1)}`,
    phone_no: `+30000000${(i+1).toString().padStart(3,'0')}`,
    birthday: '1990-01-01',
    gender: 'other',
    profile_img: null,
    location: { city: `City${i+1}`, lat: 7.0 + i/100, lng: 80.0 + i/100 },
  }));
  const { error } = await db.from('customer').insert(rows).select('id');
  if (error) throw error;
  const { data: all } = await db.from('customer').select('id').limit(TARGET);
  return all.map(r=>r.id);
}

async function ensureFiveGymPlans(gymIds) {
  const c = await countRows('Gym_plans');
  if (!c.ok) throw new Error(`Gym_plans count: ${c.msg}`);
  if (c.count >= TARGET) return (await db.from('Gym_plans').select('plan_id').limit(TARGET)).data.map(r=>r.plan_id);
  const durations = ['1 month','1 year','1 day'];
  const rows = Array.from({length: TARGET - c.count}, (_,i)=>({
    gym_id: gymIds[i % gymIds.length],
    price: (10 + i) * 5,
    title: `Plan ${i+1}`,
    duration: durations[i % durations.length],
    description: `Test plan ${i+1}`,
  }));
  const { error } = await db.from('Gym_plans').insert(rows).select('plan_id');
  if (error) throw error;
  const { data: all } = await db.from('Gym_plans').select('plan_id').limit(TARGET);
  return all.map(r=>r.plan_id);
}

async function ensureFiveTrainerPlans(trainerIds) {
  const c = await countRows('trainer_plans');
  if (!c.ok) throw new Error(`trainer_plans count: ${c.msg}`);
  if (c.count >= TARGET) return (await db.from('trainer_plans').select('id').limit(TARGET)).data.map(r=>r.id);
  const rows = Array.from({length: TARGET - c.count}, (_,i)=>({
    trainer_id: trainerIds[i % trainerIds.length],
    title: `TrainerPlan ${i+1}`,
    description: `TP Desc ${i+1}`,
    img_url: null,
    instruction_pdf: { seeded: true },
  }));
  const { error } = await db.from('trainer_plans').insert(rows).select('id');
  if (error) throw error;
  const { data: all } = await db.from('trainer_plans').select('id').limit(TARGET);
  return all.map(r=>r.id);
}

async function ensureFiveTrainerRequests(trainerIds, gymIds) {
  const c = await countRows('trainer_requests');
  if (!c.ok) throw new Error(`trainer_requests count: ${c.msg}`);
  if (c.count >= TARGET) return true;
  const rows = Array.from({length: TARGET - c.count}, (_,i)=>({
    trainer_id: trainerIds[i % trainerIds.length],
    gym_id: gymIds[i % gymIds.length],
    approved: i % 2 === 0,
  }));
  const { error } = await db.from('trainer_requests').insert(rows);
  if (error) throw error;
}

async function ensureFiveTrainerSessions(trainerIds, customerIds) {
  const c = await countRows('trainer_sessions');
  if (!c.ok) throw new Error(`trainer_sessions count: ${c.msg}`);
  if (c.count >= TARGET) return true;
  const durations = ['30 min','45 min','1 hr','1 hr 30 min','2 hr'];
  const rows = Array.from({length: TARGET - c.count}, (_,i)=>({
    trainer_id: trainerIds[i % trainerIds.length],
    price: 20 + i,
    date: '2025-10-12',
    time: '10:00',
    booked: i % 3 === 0,
    duration: durations[i % durations.length],
    customer_id: customerIds[i % customerIds.length],
    lock: i % 5 === 0,
    zoom_link: `https://zoom.us/j/${10000000+i}`,
  }));
  const { error } = await db.from('trainer_sessions').insert(rows).select('session_id');
  if (error) throw error;
}

async function ensureFiveCustomerProgress(customerIds) {
  const c = await countRows('customer_progress');
  if (!c.ok) throw new Error(`customer_progress count: ${c.msg}`);
  if (c.count >= TARGET) return true;
  const rows = Array.from({length: TARGET - c.count}, (_,i)=>({
    customer_id: customerIds[i % customerIds.length],
    height: 160 + i,
    weight: 60 + i,
    date: '2025-10-12',
    BMI: 20 + i/10,
  }));
  const { error } = await db.from('customer_progress').insert(rows);
  if (error) throw error;
}

async function ensureFiveCalendar(customerIds) {
  const c = await countRows('calendar');
  if (!c.ok) throw new Error(`calendar count: ${c.msg}`);
  if (c.count >= TARGET) return true;
  const rows = Array.from({length: TARGET - c.count}, (_,i)=>({
    task_date: '2025-10-12',
    task: `Task ${i+1}`,
    description: `Desc ${i+1}`,
    color: '#ff0000',
    start: '09:00',
    end: '10:00',
  }));
  const { error } = await db.from('calendar').insert(rows);
  if (error) throw error;
}

async function ensureFiveFeedback(trainerIds, customerIds) {
  const c = await countRows('feedback');
  if (!c.ok) throw new Error(`feedback count: ${c.msg}`);
  if (c.count >= TARGET) return true;
  const rows = Array.from({length: TARGET - c.count}, (_,i)=>({
    feedback: `Great ${i+1}`,
    trainer_id: trainerIds[i % trainerIds.length],
    user_id: customerIds[i % customerIds.length],
  }));
  const { error } = await db.from('feedback').insert(rows);
  if (error) throw error;
}

async function ensureFiveUserGoogleTokens() {
  const c = await countRows('user_google_tokens');
  if (!c.ok) throw new Error(`user_google_tokens count: ${c.msg}`);
  if (c.count >= TARGET) return true;
  const rows = Array.from({length: TARGET - c.count}, (_,i)=>({
    user_id: `google-${10000+i}`,
    access_token: `ya29.a0Af${i}`,
    refresh_token: `1//0g${i}`,
    expires_at: Date.now() + 3600 * 1000,
    scope: 'calendar',
  }));
  const { error } = await db.from('user_google_tokens').insert(rows);
  if (error) throw error;
}

async function ensureFiveDocuments() {
  const c = await countRows('documents');
  if (!c.ok) throw new Error(`documents count: ${c.msg}`);
  if (c.count >= TARGET) return true;
  const rows = Array.from({length: TARGET - c.count}, (_,i)=>({
    content: `Doc ${i+1} content about fitness and training`,
    metadata: { seeded: true, idx: i+1, topic: 'fitness' },
  }));
  const { error } = await db.from('documents').insert(rows);
  if (error) throw error;
}

async function ensureFiveGymPlanTrainers(planIds, trainerIds) {
  const c = await countRows('gym_plan_trainers');
  if (!c.ok) throw new Error(`gym_plan_trainers count: ${c.msg}`);
  if (c.count >= TARGET) return true;
  const rows = Array.from({length: TARGET - c.count}, (_,i)=>({
    gym_plan_id: planIds[i % planIds.length],
    trainer_id: trainerIds[i % trainerIds.length],
  }));
  const { error } = await db.from('gym_plan_trainers').insert(rows);
  if (error) throw error;
}

async function ensureFiveSubscriptions(customerIds, planIds) {
  const c = await countRows('Subscription');
  if (!c.ok) throw new Error(`Subscription count: ${c.msg}`);
  if (c.count >= TARGET) return true;
  const rows = Array.from({length: TARGET - c.count}, (_,i)=>({
    customer_id: customerIds[i % customerIds.length],
    plan_id: planIds[i % planIds.length],
    subscription_date: '2025-10-12',
    status: i % 4 === 0 ? 'deact' : 'active',
  }));
  const { error } = await db.from('Subscription').insert(rows);
  if (error) throw error;
}

async function ensureFiveVerifications(trainerIds, gymIds, customerIds) {
  const c = await countRows('verifications');
  if (!c.ok) throw new Error(`verifications count: ${c.msg}`);
  if (c.count >= TARGET) return true;
  const states = ['Pending','Approved','Rejected'];
  const rows = [];
  for (let i=0;i<(TARGET - c.count);i++) {
    // To satisfy possible FK to customer(id) across environments, always use a valid customer_id
    const cid = customerIds[i % customerIds.length];
    const t = (i % 2 === 0) ? 'gym' : 'trainer';
    rows.push({ customer_id: cid, type: t, verification_state: states[i % states.length], email: `${t}${i+1}@test.fitnest.local` });
  }
  const { error } = await db.from('verifications').insert(rows);
  if (error) throw error;
}

// Seed Reports table if it exists; otherwise, skip gracefully
async function ensureReports(customerIds, trainerIds, gymIds) {
  const c = await countRows('Reports');
  if (!c.ok) {
    if (c.code === '42P01') {
      console.log('[seed] skip Reports (missing)');
      return;
    }
    throw new Error(`Reports count: ${c.msg}`);
  }
  if (c.count >= TARGET) return;
  const reportTypes = ['Harassment','Spam','Fraud','Inappropriate Content','Something Else'];
  const rows = [];
  for (let i = 0; i < (TARGET - c.count); i++) {
    const targetIsTrainer = i % 2 === 0;
    const target_id = targetIsTrainer
      ? trainerIds[i % trainerIds.length]
      : gymIds[i % gymIds.length];
    rows.push({
      reporter_id: customerIds[i % customerIds.length],
      target_id,
      target_type: targetIsTrainer ? 'trainer' : 'gym',
      report_type: reportTypes[i % reportTypes.length],
      subject: `Test report ${i+1}`,
      description: `Auto-seeded report ${i+1} for ${targetIsTrainer ? 'trainer' : 'gym'} ${target_id}`,
      status: i % 3 === 0 ? 'pending' : (i % 3 === 1 ? 'reviewed' : 'resolved'),
      banned: false,
      created_at: new Date().toISOString(),
    });
  }
  const { error } = await db.from('Reports').insert(rows);
  if (error) console.log('[seed] Reports insert error:', error.message);
}

// Seed banned table with unique user_id entries pulled from gym/trainer user_id values
async function ensureBanned() {
  const c = await countRows('banned');
  if (!c.ok) {
    if (c.code === '42P01') {
      console.log('[seed] skip banned (missing)');
      return;
    }
    throw new Error(`banned count: ${c.msg}`);
  }
  if (c.count >= TARGET) return;
  // collect candidate user_ids from trainer and gym tables
  const { data: trainerUsers, error: tErr } = await db.from('trainer').select('user_id');
  const { data: gymUsers, error: gErr } = await db.from('gym').select('user_id');
  if (tErr) throw tErr;
  if (gErr) throw gErr;
  const candidates = [...(trainerUsers||[]), ...(gymUsers||[])]
    .map(r => r.user_id)
    .filter(Boolean);
  // Ensure uniqueness and enough entries
  const unique = Array.from(new Set(candidates));
  if (unique.length === 0) return; // nothing to do
  const toAdd = Math.min(TARGET - c.count, unique.length);
  const reasons = ['spam','fraud','violation','abuse','other'];
  const rows = [];
  for (let i = 0; i < toAdd; i++) {
    rows.push({
      user_id: unique[i],
      reason: reasons[i % reasons.length],
    });
  }
  // Insert but ignore duplicates by catching unique violations
  const { error } = await db.from('banned').insert(rows);
  if (error) console.log('[seed] banned insert error:', error.message);
}

async function main() {
  try {
    console.log('[seed] starting');
    const gymIds = await ensureFiveGyms();
    const trainerIds = await ensureFiveTrainers();
    const customerIds = await ensureFiveCustomers();
    const planIds = await ensureFiveGymPlans(gymIds);
    await ensureFiveTrainerPlans(trainerIds);
    await ensureFiveTrainerRequests(trainerIds, gymIds);
    await ensureFiveTrainerSessions(trainerIds, customerIds);
    await ensureFiveCustomerProgress(customerIds);
    await ensureFiveCalendar(customerIds);
    await ensureFiveFeedback(trainerIds, customerIds);
    await ensureFiveUserGoogleTokens();
    await ensureFiveDocuments();
    await ensureFiveGymPlanTrainers(planIds, trainerIds);
    await ensureFiveSubscriptions(customerIds, planIds);
  await ensureFiveVerifications(trainerIds, gymIds, customerIds);
    // Seed Reports and banned with realistic data if tables exist
    await ensureReports(customerIds, trainerIds, gymIds);
    await ensureBanned();
    console.log('[seed] done');
  } catch (e) {
    console.error('[seed] failed:', e.message || e);
    process.exit(1);
  }
}

main();
