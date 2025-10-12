
# Service-by-service functional testing summary (all backends)

This section summarizes how functional (HTTP) tests are implemented across FitNest services and how to run them. Each uses an in‑memory Express app with Supertest and mocks external integrations for deterministic tests.

# AuthService

This doc reflects how functional (HTTP) tests are actually implemented in AuthService using Jest + Supertest with an in‑memory Express app wired to the real routes.

## What we actually do

- In-memory Express app
	- Tests spin up an Express app and mount `Routes/authRoutes` just like `server.js` does.
	- Example: see `__tests__/auth.http.int.test.js`.

- Supertest
	- We issue HTTP requests against the in-memory app (no port binding needed).
	- Validates status codes and minimal response shapes for key endpoints (health, signup, login, etc.).

- Targeted mocking (CommonJS)
	- Controllers are lightly mocked with `jest.mock('../controllers/AuthController', ...)` to focus on route wiring and status codes.
	- Supabase client is mocked in tests: `jest.mock('../superbaseClient', () => ({ supabase: {}, testConnection: jest.fn().mockResolvedValue(true) }))`.
	- This keeps tests fast and isolated from real external services (DB, Cloudinary, email).

## Oracles (what we assert)

- Route wiring works and returns expected HTTP statuses (200/201/4xx/5xx as applicable).
- Response payloads include required fields (e.g., tokens, ids) for the mocked paths.
- For the health endpoint, the mocked `testConnection` returns 200 to confirm the route path.

## Where tests live and naming

- Functional tests live under `backend/AuthService/__tests__/` with the suffix `*.http.int.test.js`.
- Unit tests follow `*.unit.test.js` and are matched by default via `jest.config.js` `testMatch`.
- Because `jest.config.js` is set to unit tests by default, we invoke functional tests by pattern (see commands below).

## Run commands (Windows PowerShell)

- All functional (HTTP) tests for AuthService:
```powershell
cd "c:\Users\User\Downloads\FitNest\backend\AuthService"
npm test -- --testPathPatterns="__tests__/.*http\.int\.test\.js" --runInBand
```

- Single file:
```powershell
cd "c:\Users\User\Downloads\FitNest\backend\AuthService"
npm test -- --testPathPatterns="__tests__/auth.http.int.test.js" --runInBand
```

- With coverage:
```powershell
cd "c:\Users\User\Downloads\FitNest\backend\AuthService"
npm test -- --testPathPatterns="__tests__/.*http\.int\.test\.js" --coverage --runInBand
```

Notes:
- `--runInBand` prevents connection/file descriptor contention in CI.
- Coverage includes controllers/routes based on `collectCoverageFrom` in `jest.config.js` (controllers, model, config; not `server.js`).

## Running against real Supabase (optional)

By default, functional tests mock Supabase and controllers for speed and determinism. If you need to hit a real Supabase test DB:

1) Remove or comment out the `jest.mock('../superbaseClient', ...)` and controller mocks in the specific test.
2) Ensure your test environment is isolated:

```powershell
$env:DOTENV_CONFIG_PATH = ".env.test"
```

3) Provide valid credentials in `backend/AuthService/.env.test` (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`).

4) Re-run the same Jest commands. The health route will call the real `testConnection()`. Controller routes will execute real logic if not mocked.

## Mocking style (CommonJS today)

- Current tests are CommonJS (`require`) and use `jest.mock(modulePath, factory)`.
- If you migrate to ESM, use `jest.unstable_mockModule` and ensure `moduleNameMapper` aligns with imports.

---
See also:
- Repo-wide guidance: `docs/FUNCTIONAL_TESTING_README.md`
- DB integrity testing (seed + smokes + RLS + write): `docs/DATA_DB_INTEGRITY_TESTING.md`

## API Gateway
- Technique: In-memory Express (or the app from `index.js`) + Supertest. Downstream calls mocked with `nock` (Axios stubs) to validate routing, header passthrough, and error propagation.
- Tests live: `backend/apigateway/__tests__/*.http.int.test.js`
- Run (PowerShell):
```powershell
cd "c:\Users\User\Downloads\FitNest\backend\apigateway"
npm test -- --testPathPatterns="__tests__/.*http\.int\.test\.js" --runInBand
```

## AuthService
- Technique: In-memory Express + Supertest. Controllers mocked; Supabase client mocked via `jest.mock('../superbaseClient', ...)`. Validates health, signup, login, etc.
- Tests live: `backend/AuthService/__tests__/auth.http.int.test.js`
- Run (PowerShell):
```powershell
cd "c:\Users\User\Downloads\FitNest\backend\AuthService"
npm test -- --testPathPatterns="__tests__/auth.http.int.test.js" --runInBand
```

## UserService
- Technique: In-memory Express + Supertest. Mock Supabase/service layer, Cloudinary, Email as needed. Check 200/400/404/500 and RBAC if applicable.
- Tests live: `backend/UserService/__tests__/*.http.int.test.js`
- Run (PowerShell):
```powershell
cd "c:\Users\User\Downloads\FitNest\backend\UserService"
npm test -- --testPathPatterns="__tests__/.*http\.int\.test\.js" --runInBand
```

## GymService
- Technique: In-memory Express + Supertest. Service layer mocked. Covers add/get/update gym, trainers, verification requests, etc.
- Tests live: `backend/GymService/__tests__/gym.http.int.test.js`
- Run (PowerShell):
```powershell
cd "c:\Users\User\Downloads\FitNest\backend\GymService"
npm test -- --testPathPatterns="__tests__/gym.http\.int\.test\.js" --runInBand
```

## TrainerService
- Technique: In-memory Express + Supertest. Mock trainer service layer (and external deps) to cover trainer CRUD, plans, sessions, verifications.
- Tests live: `backend/TrainerService/__tests__/*.http.int.test.js` (if present)
- Run (PowerShell):
```powershell
cd "c:\Users\User\Downloads\FitNest\backend\TrainerService"
npm test -- --testPathPatterns="__tests__/.*http\.int\.test\.js" --runInBand
```

## AdminService
- Technique: In-memory Express + Supertest. Mock Supabase/service layer; test inquiries, verification state changes, banned users endpoints.
- Tests live: `backend/AdminService/__tests__/*.http.int.test.js`
- Run (PowerShell):
```powershell
cd "c:\Users\User\Downloads\FitNest\backend\AdminService"
npm test -- --testPathPatterns="__tests__/.*http\.int\.test\.js" --runInBand
```

## Notes for all services
- Mocks: Prefer mocking service/data layer and external integrations (Stripe, Kafka, Email, Supabase) so functional tests remain fast and deterministic.
- Coverage: Add `--coverage` when needed. Some services’ Jest configs focus on unit tests by default; use `--testPathPatterns` to explicitly target functional files.
- Real DB (optional): Remove the Supabase/service mocks and set `$env:DOTENV_CONFIG_PATH = ".env.test"` to hit a real test DB. Prefer the DB integrity suite (`docs/DATA_DB_INTEGRITY_TESTING.md`) for database behavior.
