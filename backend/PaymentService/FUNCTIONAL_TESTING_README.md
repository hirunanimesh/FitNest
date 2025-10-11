# Functional Testing (PaymentService)

Purpose: Document how to run and extend controller-level functional tests for PaymentService using Jest and Supertest.

## Technique
- In-memory Express app; wire controllers as in `index.js`.
- Mock external calls (Stripe, Kafka, Mongoose/DB) for independence and determinism.
- Validate 200/400/404/409/422/500 paths depending on payment session/flow cases.

## Oracles
- Responses match spec; when using a test DB, state changes match expectations.

## Tools
- Jest, Supertest.

## Where tests live
- Place functional tests under `__tests__/` with suffix `*.http.int.test.js`.

## Run commands (Windows PowerShell)

- All functional tests:
```powershell
cd "c:\Users\User\Downloads\FitNest\backend\PaymentService"
npm test -- --testPathPatterns="__tests__/.*http\.int\.test\.js" --runInBand
```

- Single file:
```powershell
cd "c:\Users\User\Downloads\FitNest\backend\PaymentService"
npm test -- --testPathPatterns="__tests__/payments.http.int.test.js" --runInBand
```

- With coverage:
```powershell
cd "c:\Users\User\Downloads\FitNest\backend\PaymentService"
npm test -- --testPathPatterns="__tests__/.*http\.int\.test\.js" --coverage --runInBand
```

## ESM mocking notes
- This service uses ESM (`type: module`) with Jest 30 + babel-jest.
- Prefer `jest.unstable_mockModule` for ESM mocks (Stripe, Kafka, Mongoose models).

---
See also: `docs/FUNCTIONAL_TESTING_README.md` for repo-wide guidance.
