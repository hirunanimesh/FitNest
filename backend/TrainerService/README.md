````markdown
TrainerService — how to run tests locally

This file documents the exact commands to run the TrainerService unit tests and reproduce coverage on Windows (PowerShell examples).

Prerequisites
- Node.js (16 or 18+ recommended)
- npm (bundled with Node)
- Run commands from the repository root (C:\Users\User\Downloads\FitNest) unless noted otherwise.

Recommended (quick) commands

Run all TrainerService tests (recommended)
```powershell
# from repository root
npm run test:trainer
```

Run the same directly with Jest
```powershell
npx jest --selectProjects "TrainerService Tests" --colors -i
```

Run TrainerService tests with coverage
```powershell
npx jest --selectProjects "TrainerService Tests" --coverage --colors -i
```

Run a single test file (example)
```powershell
npx jest backend/TrainerService/__tests__/trainer.service.test.js --colors -i
```

Running from inside the service folder
```powershell
# optional: if you `cd` into `backend/TrainerService`, set SUPABASE env values first
$env:SUPABASE_URL = 'http://localhost'
$env:SUPABASE_SERVICE_ROLE_KEY = 'test'
npx jest --colors -i
```

Why run from repo root?
- The repository uses a root-level `jest.config.js` with multiple projects. Running from the root (or using `--selectProjects "TrainerService Tests"`) ensures the service's `setupFiles` and config are applied and avoids unrelated tests failing.

Test-trainer npm script
- A convenience script can be added to the repo root `package.json` (recommended):
	- `npm run test:trainer`
	- This should run `jest --selectProjects "TrainerService Tests"` and acts as a single-command shortcut.

Environment & common issues
- Supabase client is often created at module import time and requires env vars. Tests include a setup file (`backend/TrainerService/test-setup.js`) which injects minimal SUPABASE env vars when the Jest project is run from root. If you run tests directly inside `backend/TrainerService`, set the env vars manually (see example above).

- Babel transform errors: If Jest complains about missing presets like `@babel/preset-env`, install these dev dependencies at the repo root:
```powershell
npm install --save-dev @babel/core @babel/preset-env babel-jest
```

- If you see dotenv console messages during tests, that's normal (tests may load `.env`).

Isolating failures
- If you run `npx jest --coverage` for the whole repo and see unrelated failures (for example proxy tests that expect external services), re-run only the TrainerService project with the commands above to isolate problems.

If a TrainerService test fails
1. Run the single test file with `--runTestsByPath` to get focused output:
```powershell
npx jest --selectProjects "TrainerService Tests" --runTestsByPath backend/TrainerService/__tests__/<failing-file>.js --colors -i
```
2. Copy the failing test name and stack trace into an issue if you need help.

Want help automating this?
- I can add a short script inside `backend/TrainerService/package.json` or create a GitHub Actions job that runs `npm run test:trainer` on push/PR. Tell me which and I'll implement it.

That's it — run `npm run test:trainer` from the repo root to execute and reproduce the TrainerService tests and coverage.

````
