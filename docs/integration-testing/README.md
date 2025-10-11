# FitNest Integration Testing – Tool Guide and Comparison

This folder provides step-by-step guides for running integration tests in FitNest using three approaches:

- Jest + Supertest (Node.js-native) – API and service-level integration
- Selenium (UI) – Browser-driven end-to-end flows against the Next.js frontend
- Rest Assured (API) – Java-based API integration testing against the API Gateway/services

Quick links:
- Jest guide: ./README.jest.md
- Selenium guide: ./README.selenium.md
- Rest Assured guide: ./README.rest-assured.md

## Which tool should I pick?

- If you want fast, repo-native API tests with minimal setup: choose Jest + Supertest.
- If you need full browser UI validation or end-to-end user flows: choose Selenium.
- If your QA team already uses Java tooling or you need rich API test reporting outside Node: choose Rest Assured.

### High-level comparison

- Language/runtime: 
  - Jest: JavaScript/Node (same as services) – simplest to adopt here.
  - Selenium: Tests in JS (or any language); runs real browser – highest fidelity.
  - Rest Assured: Java/Maven – great for API contract suites and separate QA pipelines.
- Speed and stability:
  - Jest: very fast, unit + integration in one runner.
  - Selenium: slower, flaky risk if environment isn’t controlled.
  - Rest Assured: fast API-only; requires Java setup.
- FitNest alignment:
  - Jest: directly imports Express apps or calls running services.
  - Selenium: hits `frontend` in dev mode; exercises API via UI.
  - Rest Assured: targets API Gateway endpoints, great for black-box testing.

Before running any integration tests, ensure the relevant services are running. In VS Code, you can use Tasks under the FitNest workspace:
- "🚀 Start All Microservices" (backend only)
- "🌟 Start Everything (Backend + Frontend)" (backend + frontend)

Alternatively, start individual services from their folders or via docker-compose.