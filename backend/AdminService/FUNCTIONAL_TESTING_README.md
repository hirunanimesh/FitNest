# Functional Testing (AdminService)

Purpose: Document how to run and extend controller-level functional tests for AdminService using Jest and Supertest.

## Technique
- In-memory Express app; wire real controller handlers as in `index.js`.
- Mock service/external integrations (Supabase, SendGrid, Kafka, AI clients) with ESM-friendly mocks.
- Validate 200/400/404/500 paths per route.

## Oracles
- HTTP responses match spec; payload shape as expected.
- When not mocked, DB/state changes match expectations (typically mocked here).

## Tools
- Jest, Supertest.

## Where tests live
- Place functional tests under `__tests__/` with suffix `*.http.int.test.js`.

## Run commands (Windows PowerShell)

- All functional tests:
```powershell
cd "c:\Users\User\Downloads\FitNest\backend\AdminService"
npm test -- --testPathPatterns="__tests__/.*http\.int\.test\.js" --runInBand
```

- Single file:
```powershell
cd "c:\Users\User\Downloads\FitNest\backend\AdminService"
npm test -- --testPathPatterns="__tests__/admin.http.int.test.js" --runInBand
```

- With coverage:
```powershell
cd "c:\Users\User\Downloads\FitNest\backend\AdminService"
npm test -- --testPathPatterns="__tests__/.*http\.int\.test\.js" --coverage --runInBand
```

## ESM mocking notes
- This service uses ESM (`type: module`) and runs Jest via `node --experimental-vm-modules`.
- Prefer `jest.unstable_mockModule` for ESM mocks; align paths with any `moduleNameMapper` if present.

---
See also: `docs/FUNCTIONAL_TESTING_README.md` for repo-wide guidance.
