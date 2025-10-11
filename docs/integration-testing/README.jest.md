# Integration Testing with Jest + Supertest (FitNest)

This guide explains how to write and run API/service integration tests in FitNest using Jest + Supertest. It fits our Node.js microservices and API Gateway.

## What you can test
- Express endpoints via Supertest against the exported app (no real server needed)
- Gateway proxy behavior to upstream services (mock with Nock)
- Error propagation and validation failures
- Optional: DB-backed integration (e.g., Mongo, Supabase) gated by an env flag

## Prerequisites
- Node.js installed
- Repo already includes: `jest`, `supertest`, `nock`, root/project Jest configs
- Ensure env values for tests (root `test-setup.js` and per-service `test-setup.js`)

## Patterns

1) Hitting routes without starting the server

```js
// backend/apigateway/src/__tests__/health.int.test.js
const request = require('supertest');
const app = require('../../index'); // exports Express app

describe('API Gateway /health (integration)', () => {
  it('returns 200 and service info', async () => {
    const res = await request(app).get('/health').expect(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('services');
  });
});
```

2) Mocking upstream HTTP calls with Nock

```js
// backend/apigateway/src/__tests__/auth.proxy.int.test.js
const request = require('supertest');
const nock = require('nock');
const app = require('../../index');

const AUTH_BASE = process.env.AUTH_SERVICE_URL || 'http://localhost:4001';

describe('Gateway -> Auth proxy', () => {
  afterEach(() => nock.cleanAll());

  it('proxies login to AuthService', async () => {
    nock(AUTH_BASE).post('/login').reply(200, { success: true });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'a@b.com', password: 'pw' })
      .expect(200);

    expect(res.body).toMatchObject({ success: true });
  });
});
```

3) Optional: real DB integration (gated)

```js
// backend/PaymentService/__tests__/stripe.int.test.js
const request = require('supertest');
const app = require('../index');

(process.env.RUN_DB_INT_TESTS === 'true' ? describe : describe.skip)('PaymentService DB integration', () => {
  it('creates a session (mock Stripe; real Mongo)', async () => {
    // connect to test Mongo via MONGO_URI_TEST
    // create and fetch a record
  });
});
```

## How to run (Windows PowerShell)

All backend projects (from repo root):
```powershell
npm test
```

Per service:
```powershell
cd backend\apigateway; npm test
cd ..\AuthService; npm test
cd ..\GymService; npm test
cd ..\PaymentService; npm test
```

Run only files ending with `.int.test.js`:
```powershell
npx jest --testMatch "**/*.int.test.js"
```

## Tips
- Use service-local `test-setup.js` to mock env and silence logs
- Prefer Supertest with in-memory app for speed and isolation
- Use Nock for HTTP dependencies; avoid hitting other services unless doing a full system test

## Pros / Cons
- Pros: Fast, repo-native, works great in CI; easy mocks
- Cons: Not a real browser (pair with Selenium for UI E2E)
