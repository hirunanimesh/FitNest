# Functional Testing (AuthService)

Purpose: Document how to run and extend controller-level functional tests for AuthService using Jest and Supertest.

## Technique
- In-memory Express app; wire real routes/controllers as in `server.js`.
- Mock external services (Supabase, Cloudinary, Email) with ESM-friendly mocks.
- Validate 200/400/401/403/404/500 paths per route, focusing on auth flows and validations.

## Oracles
- HTTP responses match spec; tokens and payloads in expected formats.
- When not mocked, DB changes reflect expectations (commonly mocked in functional tests).

## Tools
- Jest, Supertest.

## Where tests live
- Place functional tests under `__tests__/` with suffix `*.http.int.test.js`.

## Run commands (Windows PowerShell)

- All functional tests:
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

## ESM mocking notes
- If using ESM, prefer `jest.unstable_mockModule` and align imports with any `moduleNameMapper`.
- If tests are CommonJS, update to ESM mocking patterns, or run Jest with `node --experimental-vm-modules`.

---
See also: `docs/FUNCTIONAL_TESTING_README.md` for repo-wide guidance.
