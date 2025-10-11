# Functional Testing (Backend)

This document explains how we perform backend functional testing in FitNest using Jest and Supertest, with concrete examples from the GymService. It focuses on validating controller/route behavior end-to-end within the process (no network), while isolating external integrations with mocks.

## Technique Objective

- Verify that each backend function and service behavior meets functional and business requirements.
- Ensure proper data exchange, role-based access, and validation logic at the HTTP boundary (controller level).
- Confirm both success and failure paths (including 4xx/5xx) behave as specified.

## Technique

We use Jest and Supertest to test individual Express routes and controller logic:

- Spin up an in-memory Express app inside the test (no real server binds).
- Wire routes to actual controller handlers as in the service `index.js`.
- Mock the service layer and any external integrations (Stripe, Kafka, Email, Supabase) so tests are deterministic and independent.
- Use Supertest to send HTTP requests and assert on status codes and minimal response shapes.

In this repo, we use ESM modules. For mocking ESM modules, we rely on `jest.unstable_mockModule` and map extensionless imports via `moduleNameMapper`. See `backend/GymService/jest.config.cjs`.

## Example: GymService functional tests

- Test file: `backend/GymService/__tests__/gym.http.int.test.js`
- Controllers under test: `backend/GymService/controllers/gym.controller.js`
- Service mocked: `backend/GymService/services/gym.service.js`

Covered routes and cases:
- POST `/addGym` → 200 (success), 500 (service error)
- GET `/getallgyms` → 200, 500
- GET `/getgymbyid/:gymId` → 200, 404, 500
- GET `/getgymbyuserid/:userId` → 200, 404, 500
- PUT `/updategymdetails/:gymId` → 200, 404, 500
- POST `/getallgymusers` → 400 (invalid payload), 404 (none), 200 (success), 500
- GET `/gettotalmembercount/:gymId` → 200 (non-null), 404 (null), 500
- GET `/gettrainers/:gymId` → 200 (data), 404 (null), 500
- PUT `/approvetrainer/:request_id` → 200, 404, 500
- GET `/getstatistics/:gymId` → 200, 500
- POST `/request-verification` → 400 (missing fields), 200 (ok), 500

These tests ensure functional coverage across happy-path, validation errors, not-found, and internal error handling (4xx/5xx).

## Oracles

- API responses and returned payloads match defined specifications (status codes and minimal body assertions where relevant).
- When testing with a real or a test DB, the database state reflects expected changes after each operation. In the current functional tests, we mock the service layer (and thus DB) to focus on controller behavior; integration tests with a real test DB can be added separately.

## Required Tools

- Jest
- Supertest

Already declared in the respective service `package.json` (e.g., `backend/GymService/package.json`).

## Success Criteria

- All functional test cases for major use cases pass without error.
- Invalid data is handled gracefully with appropriate error messages and correct HTTP status codes.

## Special Considerations

- Maintain test independence by mocking external calls:
  - Stripe payments
  - Kafka producers/consumers
  - Email providers (e.g., SendGrid)
  - Supabase client/database access
- For ESM compatibility in this repo:
  - Use `jest.unstable_mockModule`.
  - Keep `moduleNameMapper` in sync with import patterns.
  - Prefer `--testPathPatterns` (Jest v30) and, when needed, `--runInBand` to avoid parallel test interference between ESM module mocks.

## How to run (Windows PowerShell)

Run only the Gym HTTP functional tests (fastest):

```powershell
cd "c:\Users\User\Downloads\FitNest\backend\GymService"
npm test -- --testPathPatterns="__tests__/gym.http.int.test.js" --runInBand
```

With coverage:

```powershell
cd "c:\Users\User\Downloads\FitNest\backend\GymService"
npm test -- --testPathPatterns="__tests__/gym.http.int.test.js" --coverage --runInBand
```

Run all functional HTTP tests (if you add more `*.http.int.test.js` files):

```powershell
cd "c:\Users\User\Downloads\FitNest\backend\GymService"
npm test -- --testPathPatterns="__tests__/.*http\.int\.test\.js" --runInBand
```

Note: Running the entire GymService test suite may fail if some unit tests still use CommonJS-style mocking (`require`, `jest.mock` without ESM support). The functional tests above are ESM-compatible.

## Test structure and patterns

- Naming convention: `*.http.int.test.js` for controller-level functional tests.
- Arrange-Act-Assert inside each test:
  - Arrange: Configure mock return values (e.g., `mockResolvedValueOnce`, `mockRejectedValueOnce`).
  - Act: Send request via Supertest.
  - Assert: Check the status code and, when appropriate, selected fields in the JSON body.
- Keep tests isolated: clear mocks after each test (`afterEach(() => jest.clearAllMocks())`).

## Adding new functional tests

1. Create a new `*.http.int.test.js` file under the service’s `__tests__` directory.
2. Use `jest.unstable_mockModule` to mock the service layer and any external clients used by the controller.
3. Create an Express app instance and wire the routes to the controller exports exactly as in the service `index.js`.
4. Add test cases to cover:
   - Success (200) for the primary flow.
   - Validation errors (400) for missing/invalid inputs.
   - Not found (404) where applicable.
   - Internal errors (500) by making service mocks reject with an Error.
5. Run with the commands above and ensure tests pass.

## CI suggestions (optional)

- Add a job that runs functional tests per service (e.g., `backend/GymService`) using the focused `--testPathPatterns` to keep CI fast and stable.
- Collect coverage for controllers; track thresholds to prevent regressions.

---

For deeper integration tests with real databases or external services, set up isolated test environments and test schemas, and ensure teardown cleans up all created resources. The functional tests described here are designed to be fast, deterministic, and independent by using mocks.
