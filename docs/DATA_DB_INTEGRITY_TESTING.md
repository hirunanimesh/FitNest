## Data & Database Integrity Testing (Supabase, .env.test only)

This README documents the exact way we run data/database integrity testing for the FitNest backend using a dedicated Supabase test database. We never use `.env` during testing—only `.env.test` loaded via `DOTENV_CONFIG_PATH`.


## we use Node.js scripts with the Supabase JavaScript client and Jest.

- Supabase client: @supabase/supabase-js (service-role for writes and anon for RLS checks)
- Test runner: Jest (invoked via npm scripts)
- Env isolation: dotenv/config with DOTENV_CONFIG_PATH pointing to .env.test
- Where it lives: backend/AuthService/scripts (seed-all-tables.js, supabase-smoke.js, supabase-tables-smoke.js, supabase-rls-smoke.js,  supabase-write-integrity.js)


Updated: 2025-10-12

## What this covers

- Supabase Postgres only (Mongo is intentionally out of scope here)
- Environment isolation with `.env.test`
- Seeding realistic data (≥ 30 rows per table) including auth users
- Smoke checks (connectivity and table counts)
- RLS checks (anon client)
- Write integrity tests (CRUD and constraint checks)

## Prerequisites

- Supabase test project credentials in `backend/AuthService/.env.test`:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_ANON_KEY`

Other services can also have `.env.test`, but `AuthService` is the orchestration point for seeding and global smokes.

## Environment isolation

Every script enforces `.env.test` usage and exits if `DOTENV_CONFIG_PATH` is not set to `.env.test`.

PowerShell (session-local):

```powershell
$env:DOTENV_CONFIG_PATH = ".env.test"
```

## Seeding the database (idempotent)

Run from `backend/AuthService` to seed all core tables and create auth users. The seeder inserts up to a target count (TARGET = 30) and reuses existing rows when present.

```powershell
cd backend/AuthService
$env:DOTENV_CONFIG_PATH = ".env.test"
npm run db:seed
```

Populated tables (linked correctly by FKs):

- Core: `customer`, `trainer`, `gym`, `Gym_plans`, `trainer_plans`, `trainer_requests`, `trainer_sessions`, `customer_progress`, `calendar`, `feedback`, `user_google_tokens`, `documents`, `gym_plan_trainers`, `Subscription`, `verifications`
- Optional/admin: `Reports`, `banned` (skipped if missing)

Notes:

- Creates auth users with role metadata and assigns `user_id` in `trainer`/`gym`/`customer` rows.
- `Reports.report_type` uses enum values: `Harassment | Spam | Fraud | Inappropriate Content | Something Else`.

## Smoke checks

Verify connectivity and table counts.

```powershell
cd backend/AuthService
$env:DOTENV_CONFIG_PATH = ".env.test"
npm run smoke:tables    # per-table counts
npm run smoke:supabase  # basic connectivity
```

Expected output includes all core tables with count ≥ 30, plus `Reports` and `banned` if they exist.

## RLS checks (anon access)

Ensure anon reads/writes behave as intended by RLS policies.

```powershell
cd backend/AuthService
$env:DOTENV_CONFIG_PATH = ".env.test"
npm run smoke:rls
```

Review the output for any unexpected anon insert/update access.

## Write integrity tests (CRUD & constraints)

Run CRUD-oriented checks, including NOT NULLs, FKs, and RLS denial of anon writes.

```powershell
cd backend/AuthService
$env:DOTENV_CONFIG_PATH = ".env.test"
npm run test:db:write
```

These validate typical sequences: insert → select → update → delete, as well as expected failures for invalid inputs.

## Typical workflow (fast path)

```powershell
cd backend/AuthService
$env:DOTENV_CONFIG_PATH = ".env.test"

# 1) Seed everything
npm run db:seed

# 2) Quick health
npm run smoke:tables
npm run smoke:supabase

# 3) RLS behavior
npm run smoke:rls

# 4) Write integrity
npm run test:db:write
```

## Troubleshooting

- “DOTENV_CONFIG_PATH must point to .env.test”: set it in the same PowerShell session before running.
- Enum errors on `Reports.report_type`: ensure enum in DB includes `Harassment | Spam | Fraud | Inappropriate Content | Something Else`.
- Missing optional tables: seeder will log and skip; create them if required.
- Re-seed idempotency: seeder tops-up to 30 rows; if unique constraints differ from assumptions, you may need to truncate or adjust payloads.

## Script references

- Central (AuthService): `backend/AuthService/scripts/`
  - `seed-all-tables.js`, `supabase-smoke.js`, `supabase-tables-smoke.js`, `supabase-rls-smoke.js`, `supabase-write-integrity.js`
- Supplemental (others): `backend/*Service/scripts/`

## Scope note

- This guide intentionally excludes MongoDB/PaymentService. Add a separate Mongo testing guide if needed.
