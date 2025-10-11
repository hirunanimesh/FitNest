# Functional Testing (API Gateway)

Purpose: Document how to run and extend functional tests for the API Gateway using Jest and Supertest.

## Technique
- In-memory Express app (or use the actual `index.js` app) and Supertest.
- Mock downstream microservice calls (Axios + nock) to assert gateway behavior without network.
- Validate routing, headers preservation, error propagation (4xx/5xx), and CORS.

## Oracles
- Responses match the proxied contract.
- Proper status codes and error body passthrough from downstream.

## Tools
- Jest, Supertest, Nock.

## Where tests live
- Place functional tests under `__tests__/` with suffix `*.http.int.test.js`.

## Run commands (Windows PowerShell)

- All functional tests:
```powershell
cd "c:\Users\User\Downloads\FitNest\backend\apigateway"
npm test -- --testPathPatterns="__tests__/.*http\.int\.test\.js" --runInBand
```

- Single file:
```powershell
cd "c:\Users\User\Downloads\FitNest\backend\apigateway"
npm test -- --testPathPatterns="__tests__/gateway.http.int.test.js" --runInBand
```

- With coverage:
```powershell
cd "c:\Users\User\Downloads\FitNest\backend\apigateway"
npm test -- --testPathPatterns="__tests__/.*http\.int\.test\.js" --coverage --runInBand
```

## Notes
- This service uses Jest v30; prefer `--testPathPatterns`.
- Use `nock` to stub downstream HTTP calls.

---
See also: `docs/FUNCTIONAL_TESTING_README.md` for repo-wide guidance.
