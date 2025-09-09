UserService — how to run tests locally

This file documents the exact commands to run the UserService unit tests and reproduce coverage on Windows (PowerShell examples).

Prerequisites
- Node.js (16 or 18+ recommended)
- npm (bundled with Node)
- Run commands from the repository root (C:\Users\User\Downloads\FitNest) unless noted otherwise.

Recommended (quick) commands

Run all UserService tests (recommended)
```powershell
# from repository root
npm run test:user
```

Run the same directly with Jest
```powershell
npx jest --selectProjects "UserService Tests" --colors -i
```

Run UserService tests with coverage
```powershell
npx jest --selectProjects "UserService Tests" --coverage --colors -i
```

Run a single test file (example)
```powershell
npx jest backend/UserService/__tests__/user.service.unit.test.js --colors -i
```

Running from inside the service folder
```powershell
# optional: if you `cd` into backend/UserService`, set SUPABASE env values first
$env:SUPABASE_URL = 'http://localhost'
$env:SUPABASE_SERVICE_ROLE_KEY = 'test'
npx jest --colors -i
```

Why run from repo root?
- The repository uses a root-level `jest.config.js` with multiple projects. Running from the root (or using `--selectProjects "UserService Tests"`) ensures the service's `setupFiles` and config are applied and avoids unrelated tests failing.

Test-user npm script
- A convenience script was added to the repo root `package.json`:
	- `npm run test:user`
	- This runs `jest --selectProjects "UserService Tests"` and is the recommended single-command shortcut.

Environment & common issues
- Supabase client is created at module import time and requires env vars. Tests include a setup file (`backend/UserService/test-setup.js`) which injects minimal SUPABASE env vars when the Jest project is run from root. If you run tests directly inside `backend/UserService`, set the env vars manually (see example above).

- Babel transform errors: If Jest complains about missing presets like `@babel/preset-env`, install these dev dependencies at the repo root:
```powershell
npm install --save-dev @babel/core @babel/preset-env babel-jest
```

- If you see dotenv console messages during tests, that's normal (tests may load `.env`).

Isolating failures
- If you run `npx jest --coverage` for the whole repo and see unrelated failures (for example proxy tests that expect external services), re-run only the UserService project with the commands above to isolate problems.

If a UserService test fails
1. Run the single test file with `--runTestsByPath` to get focused output:
```powershell
npx jest --selectProjects "UserService Tests" --runTestsByPath backend/UserService/__tests__/<failing-file>.js --colors -i
```
2. Copy the failing test name and stack trace into an issue if you need help.

Want help automating this?
- I can add a short script inside `backend/UserService/package.json` or create a GitHub Actions job that runs `npm run test:user` on push/PR. Tell me which and I'll implement it.

That's it — run `npm run test:user` from the repo root to execute and reproduce the UserService tests and coverage.

