# FitNest Master Test Plan (v1.0)

Adapted for the FitNest platform (Node.js microservices + Next.js frontend) by referencing a similar master test plan. This document outlines what to test, how to test it, tools to use, and success criteria across services and the web app.

- Date: 2025-10-09
- Scope: Backend microservices (API Gateway, AuthService, UserService, PaymentService, GymService, TrainerService, AdminService), Frontend (Next.js)
- Goals: Reliability, functional correctness, performance, security, and great UX

---

## 1. Mission and Test Motivation

Ensure FitNest delivers a seamless experience to customers, trainers, admins, and gym managers by validating:

- Reliability and Functionality: Core flows (auth, user profile, trainer sessions, payments, admin features) work consistently, including error/failure paths.
- Performance and Scalability: System remains responsive under peak load (e.g., popular class times, promotions).
- Data Integrity and Consistency: Supabase and service data is accurate and resilient across microservices.
- Security and Access Control: Role-based access is enforced; sensitive data is protected (auth tokens, Stripe payloads).
- UI/HCI: Frontend UX is intuitive, accessible, responsive, and error-tolerant.

---

## 2. Target Test Items

- API Gateway: Routing, request validation, auth middleware, service orchestration.
- Microservices:
  - AuthService: Registration, login, OTP/reset, OAuth callbacks, profile management.
  - UserService: Profile updates, weight tracking, sessions, feedback/reports.
  - PaymentService: Stripe session creation, webhooks, revenue endpoints, plan creation.
  - GymService: Plans, trainers, bookings, search.
  - TrainerService: Verification, schedules, sessions.
  - AdminService: Moderation, email notifications, embeddings/document search.
- Frontend (Next.js): Pages, API routes, components, hooks, protected routes.
- Cross-cutting: Supabase integration, Stripe integration, Kafka messaging (if used), email notifications.

---

## 3. Test Approach

Layer tests to catch defects early and keep feedback fast.

### 3.1 Data and Database Integrity Testing

- Objective: Verify integrity and accuracy of data stored in Supabase (Postgres) and any service-specific stores.
- Technique:
  - Prefer unit/integration tests with mocked Supabase clients for determinism.
  - For deeper integration, use a disposable test schema/DB (or Testcontainers) and assert constraints, cascades, and duplicates prevention (e.g., no double booking/session duplication).
- Oracles: Query results, row counts, error codes; downstream service consistency.
- Tools: Jest, Testcontainers (optional), Supabase JS client mocks, MySQL/Mongo tools if relevant.
- Success: CRUD operations correct; constraints enforced; errors handled gracefully.

### 3.2 Function Testing (Unit)

- Objective: Verify each function in services meets requirements, including validation and error handling.
- Technique:
  - Unit test controllers/services with mocks for Supabase, Stripe, Kafka, email.
  - Cover happy paths and error branches (nulls, timeouts, exceptions).
- Oracles: Status codes, payloads, and side effects (e.g., addSession called) match expectations.
- Tools: Jest, Supertest (for HTTP-level), React Testing Library (frontend components).
- Success: High coverage (≥ 90–100% where feasible), including branches.

### 3.3 User Interface Testing

- Objective: Validate UX flows and correctness of UI state updates.
- Technique:
  - Component tests: React Testing Library for form validation, routing, auth guards.
  - E2E: Playwright or Cypress for end-to-end booking, payment redirect, and dashboard flows across browsers/devices.
- Oracles: Elements rendered, navigation correct, protected routes enforced, inputs validated.
- Tools: Jest, React Testing Library, Playwright/Cypress.
- Success: Critical flows pass on Chromium/WebKit/Firefox for key viewports.

### 3.4 Performance Profiling

- Objective: Profile system performance under normal and worst-case workloads for key transactions (session creation, search, listing, payment).
- Technique:
  - Measure p95 latency/throughput for hot endpoints; identify bottlenecks (DB queries, N+1 calls).
  - Use PM2/clinic.js profiling locally; autocannon/k6 for quick API latency checks.
- Oracles: p95 latency under targets; stable CPU/memory; no leaks.
- Tools: Node profiler/clinic.js, PM2, autocannon/k6.
- Success: Meets SLOs; documented hotspots and fixes.

### 3.5 Load Testing

- Objective: Ensure the system handles real-world peak loads without crashes or severe degradation.
- Technique: k6 scenarios for concurrent API calls (listing trainers, creating sessions, webhook bursts).
- Oracles: Response times, error rates, saturation signals; Stripe and Supabase limits not exceeded.
- Tools: k6 (preferred), Artillery/JMeter (optional), Prometheus/Grafana if available.
- Success: No crashes; graceful degradation/back-pressure; acceptable error rate.

### 3.6 Security and Access Control Testing

- Objective: Validate RBAC and protect sensitive data.
- Technique:
  - Unit/integration tests for authorization (403 on forbidden routes, proper scoping).
  - Security scans: OWASP ZAP Baseline or Burp for injection/XSS/headers.
  - Stripe payload checks: Only seat/price/session metadata sent; no PII.
- Oracles: Unauthorized attempts blocked; tokens expire/refresh correctly; secure headers present.
- Tools: Jest, OWASP ZAP/Burp Suite, dependency scanning.
- Success: No critical findings; RBAC and auth flows correct.

### 3.7 Failover and Recovery Testing

- Objective: Validate resilience when network/services fail.
- Technique:
  - Simulate network loss mid-payment; ensure no double charges and clear user messaging.
  - Crash/restart services: check idempotency and retry behavior (especially for webhooks).
  - Use Toxiproxy (optional) for fault injection.
- Oracles: Transactions recover or abort safely; consistent state across services.
- Tools: Jest fault injection/mocks, Toxiproxy (optional).
- Success: No data loss/duplication; retries/idempotency work as designed.

### 3.8 Configuration and Compatibility Testing

- Objective: Verify app behavior across OS/browsers/devices and network conditions.
- Technique: Playwright grid/Browserslist; BrowserStack/Sauce (optional); throttle network.
- Oracles: No routing errors; responsive layouts; PWA offline (if applicable) works.
- Tools: Playwright/Cypress, BrowserStack (optional).
- Success: No blocking issues across Chrome/Firefox/Safari; mobile-friendly.

### 3.9 Contract Testing (Microservice boundaries)

- Objective: Prevent breaking changes between API Gateway and downstream services.
- Technique: Pact (consumer-driven contracts) or OpenAPI schema tests with Dredd/Schemathesis.
- Oracles: Contract mismatches flagged in CI.
- Tools: Pact, OpenAPI, Dredd/Schemathesis.
- Success: Contracts verified on PRs.

### 3.10 API Collections (Manual + CI Smoke)

- Objective: Exploratory testing and environment smoke checks.
- Technique: Postman or Thunder Client for manual; Newman in CI for smoke.
- Oracles: 200/4xx/5xx codes as expected; auth flows and main paths green.
- Tools: Postman/Thunder Client; Newman for CI.
- Success: Green smoke runs per deploy/environment.

---

## 4. Deliverables

- Test Evaluation Summary: Pass/fail by service and frontend.
- Coverage Report: Statements/Branches/Lines/Functions (Jest output) with targets.
- Contract Test Reports: Pact or schema validation outcomes.
- Load/Perf Reports: k6 outputs; latency graphs if available.
- Security Summary: ZAP/Burp findings and remediations.
- CI Status: Per-PR checks for unit/integration, smoke (Newman), optional perf/security.

---

## 5. Risks, Dependencies, Assumptions, Constraints

- External APIs (Stripe, email) can be flaky—mock/stub in unit/integration and use sandbox keys for E2E.
- Secrets: Use .env.test and CI secrets; do not commit real keys.
- Data coupling: Use contracts and idempotency to avoid cascade failures.
- Test data: Seed fixtures; ensure repeatable runs.

---

## 6. How to Run (Quickstart)

Windows PowerShell examples (run from repo root):

```powershell
# Run all Jest projects
npm test

# Run a single backend service (if scripts exist)
npm run test:gateway
npm run test:auth
npm run test:user
npm run test:payment
npm run test:gym
npm run test:trainer
npm run test:admin

# Frontend unit/integration
npm run test:frontend
```

Start services (VS Code Tasks):

- Tasks > "🌟 Start Everything (Backend + Frontend)"
- Or run individual tasks for API Gateway and each service, plus Frontend.

Optional Postman smoke (after adding collection files):

```powershell
npx newman run .\postman\FitNest-Gateway.postman_collection.json -e .\postman\local.postman_environment.json
```

Optional k6 baseline (after adding k6 scripts under `perf/k6`):

```powershell
k6 run .\perf\k6\gateway-smoke.js
```

---

## 7. Acceptance & Success Criteria

- Unit/Integration Coverage: ≥ 90% (100% for critical modules where feasible).
- API Stability: Green Supertest suites on PRs; smoke collection green.
- Performance: Meet p95 latency SLOs on hot paths; no crashes under stress.
- Security: RBAC tests green; no critical ZAP/Burp findings.
- UX: E2E flows pass; responsive layouts verified; no critical accessibility blockers.

---

## 8. References

- Jest: https://jestjs.io/docs
- Supertest: https://github.com/ladjs/supertest
- Newman: https://www.npmjs.com/package/newman
- k6: https://k6.io
- OWASP ZAP: https://www.zaproxy.org
- Pact: https://docs.pact.io
- Playwright: https://playwright.dev
- React Testing Library: https://testing-library.com/docs/react-testing-library/intro

---

## 9. Notes for FitNest

- Keep tests deterministic: mock Supabase, Stripe, Kafka, Email.
- Use per-service test-setup files to seed env and silence noisy logs.
- Consider adding OpenAPI specs and validate them in CI.
- Use app-factory patterns to mount routes for Supertest without starting servers.
- Enforce coverage thresholds in Jest config to avoid regressions.
