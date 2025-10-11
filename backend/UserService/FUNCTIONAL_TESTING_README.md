# Functional Testing (UserService)

Purpose: Document how to run and extend controller-level functional tests for UserService using Jest and Supertest.

## Technique
- In-memory Express app; wire controllers as in `index.js`.
- Mock external calls (Supabase, Cloudinary, Email) for independence.
- Validate 200/400/404/500 paths and RBAC where applicable.

## Oracles
- Responses match spec; when using a test DB, state changes match expectations.

## Tools
- Jest, Supertest.

## Where tests live
- Place functional tests under `__tests__/` with suffix `*.http.int.test.js`.

## Run commands (Windows PowerShell)

- All functional tests:
```powershell
cd "c:\Users\User\Downloads\FitNest\backend\UserService"
npm test -- --testPathPatterns="__tests__/.*http\.int\.test\.js" --runInBand
```

- Single file:
```powershell
cd "c:\Users\User\Downloads\FitNest\backend\UserService"
npm test -- --testPathPatterns="__tests__/user.http.int.test.js" --runInBand
```

- With coverage:
```powershell
cd "c:\Users\User\Downloads\FitNest\backend\UserService"
npm test -- --testPathPatterns="__tests__/.*http\.int\.test\.js" --coverage --runInBand
```

## ESM mocking notes
- If `type: module`, use `jest.unstable_mockModule`.
- Otherwise adjust Jest config or convert tests to ESM-compatible mocks.

---
See also: `docs/FUNCTIONAL_TESTING_README.md` for repo-wide guidance.
