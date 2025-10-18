# Functional Testing (TrainerService)

Purpose: Document how to run and extend controller-level functional tests for TrainerService using Jest and Supertest.

## Technique
- In-memory Express app; wire controllers as in `index.js`.
- Mock Supabase, Cloudinary, Kafka, and other external calls.
- Validate 200/400/404/500 paths and role-based rules where applicable.

## Oracles
- Responses match spec; side effects (when unmocked) reflect expected changes.

## Tools
- Jest, Supertest.

## Where tests live
- Place functional tests under `__tests__/` with suffix `*.http.int.test.js`.

## Run commands (Windows PowerShell)

- All functional tests:
```powershell
cd "c:\Users\User\Downloads\FitNest\backend\TrainerService"
node --experimental-vm-modules node_modules\jest\bin\jest.js --config=jest.config.cjs --testPathPatterns="__tests__/.*http\.int\.test\.js" --runInBand
```

- Single file:
```powershell
cd "c:\Users\User\Downloads\FitNest\backend\TrainerService"
node --experimental-vm-modules node_modules\jest\bin\jest.js --config=jest.config.cjs --testPathPatterns="__tests__/trainer.http.int.test.js" --runInBand
```

- With coverage:
```powershell
cd "c:\Users\User\Downloads\FitNest\backend\TrainerService"
node --experimental-vm-modules node_modules\jest\bin\jest.js --config=jest.config.cjs --testPathPatterns="__tests__/.*http\.int\.test\.js" --coverage --runInBand
```

## ESM mocking notes
- This service uses ESM with Jest 29; prefer `jest.unstable_mockModule` for ESM.

---
See also: `docs/FUNCTIONAL_TESTING_README.md` for repo-wide guidance.
