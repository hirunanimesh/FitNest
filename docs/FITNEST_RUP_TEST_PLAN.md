# FitNest <Iteration/Master> Test Plan

Version 1.0

Date: 09/Oct/2025

---

## Revision History

| Date       | Version | Description        | Author        |
|------------|---------|--------------------|---------------|
| 09/Oct/25  | 1.0     | Initial Document   | FitNest Team  |

---

## Table of Contents

1. Evaluation Mission and Test Motivation
2. Target Test Items
3. Test Approach
   3.1 Testing Techniques and Types
   3.1.1 Data and Database Integrity Testing
   3.1.2 Function Testing
   3.1.3 User Interface Testing
   3.1.4 Performance Profiling
   3.1.5 Load Testing
   3.1.6 Security and Access Control Testing
   3.1.7 Failover and Recovery Testing
   3.1.8 Configuration Testing
4. Deliverables
   4.1 Test Evaluation Summaries
   4.2 Reporting on Test Coverage
5. Risks, Dependencies, Assumptions, and Constraints
6. References

---

## 1. Evaluation Mission and Test Motivation

FitNest is a microservices-based fitness platform with a Next.js frontend. Backend services (API Gateway, AuthService, UserService, PaymentService, GymService, TrainerService, AdminService) integrate with Supabase, Stripe, Kafka, and email providers.

Mission for this iteration:
- Find important bugs early and assess quality risks across services.
- Verify key requirements: authentication, user profile and sessions, trainer/gym flows, payments/webhooks, admin features.
- Validate performance and resilience during peak usage.
 - Enforce security and RBAC; protect sensitive data and external payloads.
- Provide clear, automated feedback to stakeholders via CI (tests, coverage, and smoke checks).

Benefits:
- Faster regression detection with Jest multi-project setup.
- Safer changes via contract/smoke tests between the API Gateway and services.
- Confidence in performance, security posture, and failover readiness.

### Objective breakdown

- Find as many bugs as possible
  - Focus on breadth and depth: unit tests with mocks to quickly hit branches; API integration tests to validate request/response paths; targeted E2E for critical journeys (auth → booking → payment → dashboard). Prioritize areas with complex logic (payments/webhooks, auth flows, trainer schedules) and historically flaky components. Track defects by type and module to guide future hardening.

- Find important problems, assess perceived quality risks
  - Identify issues with highest user/business impact: data loss/duplication, authorization bypasses, payment errors, session booking conflicts, and outage recovery gaps. Use risk-based test design to increase test intensity on high-risk services (Auth, Payment, API Gateway). Maintain a lightweight risk register and update test focus each iteration.

- Advise about perceived project risks
  - Surface schedule, scope, and technical risks early: third-party dependencies (Stripe/Supabase) availability, Kafka event ordering, env parity, and test data management. Provide practical mitigations (mocks by default, sandbox keys for E2E, contract tests, canary smoke runs) and call out contingency plans in the risk table.

- Certify to a standard
  - Aim to align with relevant standards and best practices: OWASP ASVS (auth, session mgmt, input validation), OWASP Top 10, PCI DSS SAQ-A scope for Stripe redirection (no card data stored), GDPR principles for user data (minimization, access, deletion). Use automated checks where feasible (dependency scans, header checks) and document manual verifications.

- Verify a specification (requirements, design or claims)
  - Map tests to requirements and key use cases: registration/login, role-based access, session booking/cancellation, trainer verification, gym plan management, Stripe checkout/webhook reconciliation, admin moderation/notifications. Validate acceptance criteria and non-functionals (performance targets, availability assumptions). Where designs claim idempotency or at-least-once delivery, add explicit tests.

- Advise about product quality, satisfy stakeholders
  - Provide timely signals: CI pass/fail, coverage thresholds, trend charts, flaky test tracking, and concise release readiness notes. For stakeholders, summarize quality status by service and risk area; highlight user-facing impact and any residual risks with planned mitigations.

- Advise about testing
  - Continuously evolve the strategy: keep unit tests fast and isolated; prefer API tests over full E2E for most behaviors; add contract tests to reduce integration surprises; schedule small, reliable E2E happy-paths. Recommend tools/practices (test data seeding, hermetic mocks, env guardrails, idempotency keys) and document runbooks.

- Fulfill process mandates
  - Enforce process via automation: PR gates for tests/coverage, smoke on merge-to-main, periodic security scans, and scheduled load baselines. Keep artifacts (reports, logs) and traceability (link tests to requirements/defects) to satisfy audit/compliance needs.

Architecture summary:
- Node.js microservices (Express) behind an API Gateway.
- Supabase (Postgres) primary data store; Stripe for payments; Kafka for async flows (where applicable).
- Next.js frontend (SSR/CSR), Tailwind, React components and hooks.

---

## 2. Target Test Items

- Backend services (Express APIs):
  - API Gateway: routing, auth, request validation, orchestration.
  - AuthService: register, login, OTP/reset, OAuth callbacks, profile.
  - UserService: user profile, weights, sessions, feedback, reports.
  - PaymentService: Stripe sessions, plans, webhooks, revenue.
  - GymService: plans, bookings, search.
  - TrainerService: verification, schedules, sessions.
  - AdminService: moderation, notifications, embeddings/search.
- Frontend (Next.js): pages, components, hooks, API routes, protected routes.
- Integrations: Supabase (DB), Stripe, email provider, Kafka.
- CI workflows: Jest, coverage, optional Newman smoke, optional k6 checks.

---

## 3. Test Approach

We layer tests to catch defects early and keep feedback fast. Unit tests mock external systems; API integration tests exercise routes with Supertest; selected E2E and smoke/contract tests protect cross-service behaviors. Performance, load, security, failover, and configuration testing round out quality attributes.

### 3.1 Testing Techniques and Types

#### 3.1.1 Data and Database Integrity Testing
- Technique Objective:
  - Exercise database access methods and processes independent of the UI to observe incorrect behavior or data corruption.
  - Verify CRUD operations, constraints (PK/FK/unique), RLS/policies, and cross-service invariants (e.g., no double booking of sessions).
- Technique:
  1) Invoke each data access method with valid and invalid inputs (including boundary values and nulls).
  2) Seed deterministic fixtures; execute read/write flows (e.g., create session -> list sessions -> cancel -> verify state).
  3) Inspect DB state via queries (row counts, joins, constraints) and validate returned payloads from services.
  4) Exercise error paths: simulate DB errors (mock Supabase to return `error`) and confirm correct 4xx/5xx mapping and messages.
  5) Where necessary, run against a dedicated test DB (separate Supabase project/schema) and clean up with transactions/rollbacks or TRUNCATE.
- Oracles:
  - Query-based assertions (counts, shape, referential integrity), service responses, and error codes.
  - Self-verifying tests (Jest) assert on both HTTP payloads and underlying repository calls.
- Required Tools:
  - Jest, Supertest, Supabase JS client.
  - Optional: Testcontainers/Supabase local, SQL clients/Studio for manual inspection.
- Success Criteria:
  - All key data flows are correct; constraints and policies enforced; no data loss/duplication.
  - Error handling surfaces actionable messages without leaking sensitive details.
- Special Considerations:
  - Never run against production; use `.env.test` and guardrails.
  - Keep integrity tests focused; mock by default for speed and determinism.

#### 3.1.2 Function Testing
- Technique Objective:
  - Verify target functionality (navigation, data entry, processing, retrieval) meets business rules and use cases.
- Technique:
  1) Unit test controllers/services with mocks for Supabase/Stripe/Kafka/email; assert on branching logic and side-effects.
  2) API tests with Supertest hitting the Express app (no server listen). Cover success (200), validation errors (4xx), not-found (404), and internal errors (500).
  3) Validate schemas/DTOs, required fields, and sanitization; ensure business rules (e.g., booked=true filtering) are applied.
  4) For destructive actions, confirm confirmation/authorization checks and idempotency where applicable.
- Oracles:
  - HTTP status codes, JSON payload shape, headers; spies on service/repo calls to verify expected interactions.
- Required Tools:
  - Jest, Supertest, Babel/ts-jest per service; optional schema validators.
- Success Criteria:
  - All key use-case scenarios and features tested; invalid inputs produce clear errors; coverage thresholds met.
- Special Considerations:
  - Auth middleware and RBAC must be exercised (or safely mocked) to avoid bypassing protections.

#### 3.1.3 User Interface Testing
- Technique Objective:
  - Ensure the UI provides correct access/navigation and responsive layouts; components behave per design and HCI principles.
- Technique:
  1) Component tests (RTL): render forms, seat/session selectors, dashboards; validate labels, ARIA roles, and form validations.
  2) Route/protection tests: assert redirects for unauthenticated users and role-restricted pages.
  3) E2E (Playwright/Cypress): simulate key flows (login → book trainer session → Stripe redirect → success page → dashboard update).
  4) Responsiveness: test across mobile/tablet/desktop viewports; verify no layout breakages.
- Oracles:
  - Testing-library queries, accessibility roles, visible text; E2E assertions on navigation, URL, and final state.
- Required Tools:
  - Jest, React Testing Library, Playwright/Cypress; optional Lighthouse for perf/a11y.
- Success Criteria:
  - Pages render correctly across devices; no routing errors; protected routes enforced; good UX feedback on errors.
- Special Considerations:
  - Not every UI can be automated; use targeted manual checks for complex maps/drag-drop if any.

#### 3.1.4 Performance Profiling
- Technique Objective:
  - Profile response times, transaction rates, and server resource usage for key transactions under normal and worst-case loads.
- Technique:
  1) Define transactions (e.g., Stripe session creation, sessions listing, weight latest, search) and targets (p95 ≤ 300–600ms depending on path).
  2) Use clinic.js/Node profiler or PM2 to capture CPU/memory; run autocannon/k6 probes at controlled RPS.
  3) Identify slow DB queries (logs/EXPLAIN) and optimize; re-profile to confirm improvements.
- Oracles:
  - Collected latency distributions (p50/p95/p99), CPU/memory trends, GC activity; absence of leaks under sustained load.
- Required Tools:
  - clinic.js/Node profiler, PM2, autocannon/k6; optional Netdata/metrics.
- Success Criteria:
  - SLOs met; hotspots documented and mitigated; no regressions on re-run.
- Special Considerations:
  - Use an isolated window/environment for consistent measurements.

#### 3.1.5 Load Testing
- Technique Objective:
  - Evaluate system behavior under varying workloads to ensure it functions beyond expected maximum load.
- Technique:
  1) Build k6/JMeter scenarios from real user flows; remove artificial client delays.
  2) Execute average, peak, and sustained-peak workloads; include burst traffic and webhook spikes.
  3) Increase concurrency progressively to discover saturation points; simulate component failures to observe resilience.
- Oracles:
  - Response times, throughput, error rates, saturation signals; compare pre/post baselines.
- Required Tools:
  - k6 (preferred), JMeter/Artillery (alternate), Prometheus/Grafana (optional), Postman for quick checks.
- Success Criteria:
  - Workload emulation completes without crashes due to test harness; acceptable error rates and latencies maintained.
- Special Considerations:
  - Run on dedicated env; DB sized appropriately (or scaled consistently); prepare rollback plans if env destabilizes.

#### 3.1.6 Security and Access Control Testing
- Technique Objective:
  - Application-level: actors can access only the functions/data permitted by their role; inputs are validated/sanitized.
  - System-level: only authorized actors can access the system/apps through approved gateways.
- Technique:
  - Application-level: enumerate roles (customer, trainer, admin); for each, verify allowed endpoints and forbidden ones (expect 403).
  - Modify roles and re-run to confirm permissions updates; fuzz inputs; attempt IDOR and injection patterns.
  - System-level: verify auth flows (login/refresh/expiry), secure headers (CSP, HSTS, CORS), and secret handling.
- Oracles:
  - Automated assertions for RBAC, plus manual review of security scan findings.
- Required Tools:
  - Jest, OWASP ZAP Baseline/Burp Suite, dependency scanners; optional sqlmap for exploratory checks.
- Success Criteria:
  - Only permitted functions/data are accessible; unauthorized attempts blocked; no critical vulnerabilities.
- Special Considerations:
  - Coordinate with admins for system-level testing; never test against production.

#### 3.1.7 Failover and Recovery Testing
- Technique Objective:
  - Simulate failures (client/server power loss, network partitions, storage unavailability, third-party outages) and verify recovery with no data loss.
- Technique:
  1) Client power loss: interrupt mid-checkout; ensure transaction halts safely and can resume or be retried without double charge.
  2) Server crash: kill service mid-transaction; on restart, verify idempotency and reconciliation.
  3) Network loss: sever connectivity to Stripe/Supabase; confirm timeouts/backoff and safe aborts; resume correctly after restoration.
  4) Webhook retry: simulate Stripe webhook failure, then re-delivery; ensure idempotent processing.
- Oracles:
  - Logs/metrics showing retries/backoff; persisted state consistent; no duplicates or lost updates.
- Required Tools:
  - Jest with fault injection, Toxiproxy (optional), log inspection.
- Success Criteria:
  - Successful simulated disasters and recoveries to a known good state.
- Special Considerations:
  - Intrusive by nature—run in isolated windows; coordinate with ops/DB/network teams.

#### 3.1.8 Configuration Testing
- Technique Objective:
  - Verify operation on required hardware/software/browser configurations and under varying network conditions.
- Technique:
  1) Execute function test scripts across OS/browser matrix (Chrome/Firefox/Safari).
  2) Open common productivity apps alongside to observe resource contention (optional).
  3) Throttle network to 3G/slow-4G and verify acceptable response.
- Oracles:
  - Behavior and performance across configurations; CPU/memory usage; routing stability.
- Required Tools:
  - Playwright/Cypress, BrowserStack/Sauce (optional), network throttling tools.
- Success Criteria:
  - Supported combinations operate without blocking issues; transactions remain accurate.
- Special Considerations:
  - Document supported matrix and any exceptions; include a11y checks where feasible.

---

## 4. Deliverables
- Per-service Jest test suites and coverage reports.
- API integration (Supertest) suites covering critical endpoints.
- Optional Postman collection + Newman smoke results.
- Contract test reports (Pact/OpenAPI validation) if adopted.
- Load/perf reports (k6 outputs).
- Security scan summaries (ZAP/Burp) and remediations.
- CI status badges/logs for unit/integration and smoke.

### 4.1 Test Evaluation Summaries
- Frequency: On each PR (CI summary) and weekly roll-ups.
- Content: Suites run/pass/fail, flaky tests, key defects found/resolved, trends.

### 4.2 Reporting on Test Coverage
- Coverage recorded via Jest (statements/branches/functions/lines) per service and frontend.
- Thresholds enforced in jest.config to prevent regressions.
- Reported in CI for every PR and as part of weekly summaries.

#### 4.1.1 Test Logs
- Automated test outputs per job (CI artifacts) including failing snapshots, console logs, and coverage summaries.

#### 4.1.2 Code Inspections
- Periodic code reviews and static analysis to improve readability, spot defects early, and suggest refactors.

#### 4.1.3 Database Performance Statistics
- Basic metrics (slow queries, row counts, indexes touched) captured during integrity/perf runs, used to guide tuning.

#### 4.1.4 Browser Performance Statistics
- For rich pages, gather browser perf stats (timings, layout shifts) to ensure smooth UX under realistic conditions.

---

## 5. Risks, Dependencies, Assumptions, and Constraints

| Risk                                      | Mitigation                                                      | Contingency                                  |
|-------------------------------------------|-----------------------------------------------------------------|----------------------------------------------|
| Prerequisite entry criteria not met        | Define clear test readiness; checklist per service              | Defer/skip scenario; mark as TODO            |
| Test data inadequate                       | Provide seed fixtures; unique test IDs/emails                   | Redefine data; refresh seeds                 |
| Database requires refresh                  | Scheduled refresh for test DB; rollback transactions            | Restore snapshot and rerun                   |
| External API (Stripe) outage               | Mock by default; sandbox keys for E2E                           | Skip E2E; run mocks; retry later             |
| Secrets exposure in CI                     | Use CI secrets; .env.test; scanning; least-privilege keys        | Revoke/rotate; audit logs                    |
| Flaky network-dependent tests              | Prefer mocks; isolate E2E; increase timeouts only when needed    | Quarantine flaky tests; root-cause           |
| Cross-service contract drift               | Pact/OpenAPI validation in CI                                   | Block merge; patch or version API            |
| Requirement changes during testing         | Freeze scope before load/security; track changes in tickets      | Reassess test scope; adjust plan/schedules   |

Assumptions: Dedicated test DB/env, non-prod keys, CI available. Constraints: Load/security tests run on isolated windows/environments.

---

## 6. References
- Jest: https://jestjs.io/docs
- Supertest: https://github.com/ladjs/supertest
- Newman (Postman CLI): https://www.npmjs.com/package/newman
- k6: https://k6.io
- OWASP ZAP: https://www.zaproxy.org
- Pact: https://docs.pact.io
- Playwright: https://playwright.dev
- Supabase: https://supabase.com/docs
- Stripe: https://stripe.com/docs
- Apache Kafka: https://kafka.apache.org/documentation/

---

## How to Run (Windows PowerShell examples)

```powershell
# Run all Jest projects
npm test

# Run specific service tests (examples)
npm run test:gateway
npm run test:auth
npm run test:user
npm run test:payment
npm run test:gym
npm run test:trainer
npm run test:admin

# Run with test env (if using a dedicated .env.test)
$env:NODE_ENV="test"; $env:DOTENV_CONFIG_PATH=".env.test"; npm run test:user

# Optional: run Postman smoke with Newman
npx newman run .\postman\FitNest-Gateway.postman_collection.json -e .\postman\local.postman_environment.json

# Optional: k6 baseline (after adding scripts under ./perf/k6)
k6 run .\perf\k6\gateway-smoke.js
```
