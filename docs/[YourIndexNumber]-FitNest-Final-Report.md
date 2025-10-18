Title: FitNest – A Microservices-Based Fitness Management Platform
Index Number: [Replace with your index number]
Document Name: [YourIndexNumber]-FitNest-Final-Report
Date: 14 October 2025

# Abstract / Executive Summary

FitNest is a modular, microservices-based fitness management platform designed to streamline authentication, user management, trainer onboarding, gym and plan discovery, subscription payments, and administrative operations. The system adopts an API Gateway pattern to unify and secure access to backend microservices, and a Next.js frontend to deliver a responsive, progressive web application experience. Supabase Postgres provides the primary data store and authentication integration, while Cloudinary manages media assets. The system places strong emphasis on robustness, scalability, and developer productivity through containerization, automated testing, and structured CI-friendly test harnesses. Key outcomes include a decoupled service architecture, secure OAuth-based login, a cohesive subscription flow integrating payment processing, and a conversational assistant interface to support discovery and help functions. This report presents the architectural approach, design, database model, implementation strategies, testing analysis, and a roadmap for future improvements.

# Table of Contents

1. Introduction  
1.1 Background  
1.2 Motivation  
1.3 Importance and Purpose  
1.4 System Overview and Approach  
2. Literature Review  
3. System Models  
3.1 System Requirements  
3.2 Use Case Model  
4. System Design  
4.1 Architecture  
4.2 Logical View (Class Diagram)  
4.3 Process View (Sequence Diagram)  
5. Database Design  
5.1 ER Diagram  
5.2 Schema Description  
6. System Implementation  
6.1 Implementation Procedure  
6.2 Materials  
6.3 The Algorithm  
6.4 Main Interfaces  
7. System Testing and Analysis  
8. Conclusion and Future Work  
9. References  
10. Appendix

# 1. Introduction

## 1.1 Background

Digital platforms for fitness management have evolved from monolithic portals into distributed, cloud-native applications. Contemporary offerings must manage identity, present varied content from multiple stakeholders (gyms, trainers), handle complex commerce flows (plans, subscriptions, payments), and operate across desktop and mobile. The microservices architectural style and API Gateway pattern have emerged as dominant approaches for building such systems at scale due to their modularity and deployment agility [1], [2].

## 1.2 Motivation

A central motivation for FitNest is to provide an extensible platform that enables rapid addition of new fitness workflows (e.g., plan bundles, trainer marketplaces, class scheduling) without destabilizing existing capabilities. Decoupling concerns into services (Auth, User, Trainer, Gym, Payment, Admin) reduces coordination overhead and allows heterogeneous teams to evolve independently. Standardized authentication (OAuth 2.0 and OpenID Connect) and token-based authorization (JWT) respond to modern security expectations while easing integration with third-party identity providers [3]–[5].

## 1.3 Importance and Purpose

The system’s primary purpose is to unify stakeholders—end users, trainers, gym operators, and administrators—within a coherent experience that supports discovery, subscription, and ongoing engagement. For the client, the approach lowers long-term total cost of ownership by isolating change, enabling focused scaling, and facilitating targeted observability and testability. For users, the platform provides reliable access across devices and a payment-secure environment with clear ownership of data and media assets.

## 1.4 System Overview and Approach

FitNest implements a microservices architecture orchestrated via an API Gateway, a Next.js-based frontend, Supabase Postgres for data and auth integration, and Cloudinary for media. Services are packaged in containers to support parity from local development to production. Automated tests (Jest) are baked into the repository with coverage instrumentation to underpin refactoring and continuous delivery. A progressive web application (PWA) profile ensures responsive performance and offline-friendly behavior where feasible [8], [11], [12].

# 2. Literature Review

Microservices architecture promotes independent deployability, bounded contexts, and resilience patterns such as bulkheads and circuit breakers, leading to maintainable systems at scale [1]. The API Gateway pattern consolidates cross-cutting concerns—routing, rate limiting, authentication, and composition—while shielding services from external coupling and accommodating edge transformations [2].

Authentication and authorization standards—OAuth 2.0 and OpenID Connect—deliver federated identity flows and token-based session management. Their adoption enables seamless sign-in with providers like Google, and helps enforce secure, short-lived access tokens augmented by refresh tokens where appropriate [3], [4]. JWTs then provide compact, verifiable claims for backend services [5].

On the frontend, Next.js supports hybrid rendering (SSR/SSG) for performance and SEO, combined with React’s component model for maintainability [8]. Progressive Web App characteristics—service workers, manifest, and caching strategies—can improve perceived performance and resilience under transient network conditions [12]. On the backend, Node.js with Express or similar frameworks is a well-established stack for concise service implementations and rich NPM ecosystem leverage [9]. Containerization with Docker yields consistent runtime environments and reproducible builds [11]. Cloud media management with providers such as Cloudinary simplifies responsive image/video transformation and CDN delivery [7]. Supabase offers a managed Postgres, auth integration, and developer-friendly tooling with migrations to sustain schema evolution [6]. Event-driven integration (e.g., Kafka) is frequently adopted in microservices for decoupled communication and eventual consistency across domains [14]. Testing at unit and integration layers with Jest and HTTP testing libraries promotes confidence and safety during iteration [10].

This system advances over common benchmarks by combining a service-per-domain layout, an API Gateway enforcing identity, a modern PWA frontend for UX responsiveness, and a clean DevEx with tests and container orchestration. The resulting platform is structured for incremental feature growth and operational scalability.

# 3. System Models

## 3.1 System Requirements

Functional requirements (summary):
- Authentication and authorization: Support user registration and sign-in, including social login via OAuth providers; issue and validate JWT for API access [3]–[5].
- User domain: Manage profiles, preferences, and subscription status.  
- Trainer domain: Manage trainer verification, availability calendars, profiles, and plan associations.
- Gym domain: Manage gym profiles, locations, and available plans/classes.
- Payment domain: Enable plan purchases and subscription renewals; handle payment webhooks and update entitlements.
- Admin domain: Provide oversight for user/trainer verification, content moderation, and operational metrics.
- API Gateway: Route and protect requests, apply rate limiting, and unify error semantics [2].
- Frontend: Offer responsive PWA experience for browsing, purchasing, managing subscriptions, and interacting with support/chat.

Non-functional requirements (summary):
- Scalability: Horizontal scaling of stateless services; data partitioning strategies for growth.
- Reliability: Graceful degradation, clear error semantics, and idempotent payment processing.
- Security and privacy: Enforce OAuth/OIDC, JWT validation, transport security (HTTPS), input validation, and secrets isolation.
- Observability: Structured logs, metrics, and traces for incident triage and performance tuning.
- Maintainability: Modular codebase, comprehensive tests, and CI-friendly workflows.
- Portability: Containerized services for consistent environments [11].

## 3.2 Use Case Model

Fig. 1. Main use case diagram of FitNest (Actors: User, Trainer, Gym Admin, System Admin; Use cases: Register/Login, Browse Plans, Subscribe/Pay, Manage Profile, Verify Trainer, Manage Gyms, Handle Payments, Moderate Content).

Description: The “User” actor registers/logs in, searches gyms/plans, subscribes, and manages the account. “Trainer” applies for verification, manages availability and plans. “Gym Admin” maintains gym data and plan offerings. “System Admin” oversees verification, content moderation, and system configurations. The Payment Service executes checkout and webhook handling; the API Gateway coordinates all external requests.

# 4. System Design

## 4.1 Architecture

Fig. 2. System architecture with API Gateway fronting microservices (Auth, User, Trainer, Gym, Payment, Admin), a Next.js PWA frontend, Supabase Postgres for data/auth integration, and Cloudinary for media.

Description: External clients (web/PWA) communicate through the API Gateway, which performs authentication, routing, and policy enforcement [2]. Auth Service integrates OAuth/OIDC and issues tokens. Domain services (User, Trainer, Gym, Payment, Admin) expose RESTful endpoints. Supabase Postgres provides durable storage and migrations [6]. Cloudinary stores and transforms media assets [7]. Docker orchestrates local development and deployment parity [11]. An optional event bus (e.g., Kafka) may propagate domain events (e.g., “SubscriptionActivated”) across services to maintain eventual consistency [14].

## 4.2 Logical View (Class Diagram)

Fig. 3. Logical class diagram (key classes and associations): User, Trainer, Gym, Plan, Subscription, Payment, Admin, MediaAsset, AvailabilitySlot.

Description:
- User: id, email, name, role, profile fields; associations with Subscription and MediaAsset.
- Trainer: id, userId (1–1 with User), verificationStatus, expertise, rates; associations with Plan and AvailabilitySlot.
- Gym: id, name, location, metadata; associations with Plan.
- Plan: id, gymId or trainerId, title, description, price, duration; associations with Subscription.
- Subscription: id, userId, planId, status (active, canceled), start/end, renewal.
- Payment: id, subscriptionId, amount, currency, providerRef, status, timestamps.
- Admin: id, userId; privileges to moderate/verify.
- MediaAsset: id, ownerId, url, type, transformations (Cloudinary).
- AvailabilitySlot: id, trainerId, start/end, recurrence, capacity.

## 4.3 Process View (Sequence Diagram)

Fig. 4. Sequence diagram: “User subscribes to a plan.”
- User selects Plan on frontend → API Gateway routes to Auth for JWT validation.
- Frontend initiates checkout → API Gateway → Payment Service creates payment intent.
- Payment provider confirms → webhook to Payment Service → validates signature → updates Payment and Subscription status → emits “SubscriptionActivated” event.
- User Service updates entitlements; Frontend refreshes subscription state.

The process enforces idempotency in webhook processing and emits domain events to keep subsystems synchronized.

# 5. Database Design

## 5.1 ER Diagram

Fig. 5. ER diagram: User(1)–(1)Trainer; User(1)–(M)Subscription; Plan(1)–(M)Subscription; Payment(1)–(1)Subscription; Gym(1)–(M)Plan; Trainer(1)–(M)Plan; Trainer(1)–(M)AvailabilitySlot; User(1)–(M)MediaAsset.

## 5.2 Schema Description

- users(id PK, email unique, name, role, created_at)  
- trainers(id PK, user_id FK users.id unique, status, bio, skills, rate)  
- gyms(id PK, name, lat, lng, address, owner_user_id FK users.id)  
- plans(id PK, gym_id FK gyms.id nullable, trainer_id FK trainers.id nullable, title, description, price, currency, duration_days, is_active)  
- subscriptions(id PK, user_id FK users.id, plan_id FK plans.id, status, start_at, end_at, auto_renew)  
- payments(id PK, subscription_id FK subscriptions.id unique, provider, provider_ref, amount_cents, currency, status, created_at)  
- availability_slots(id PK, trainer_id FK trainers.id, starts_at, ends_at, recurrence_rule)  
- media_assets(id PK, owner_user_id FK users.id, url, kind, created_at)

Indexes:
- users(email), payments(provider_ref), plans(gym_id, trainer_id, is_active), subscriptions(user_id, status), availability_slots(trainer_id, starts_at).

# 6. System Implementation

## 6.1 Implementation Procedure

Technologies and tools:
- Frontend: Next.js (React), TypeScript, Tailwind CSS, PWA configuration (manifest, service worker). SSR/SSG for selected routes [8], [12], [13].
- API Gateway: Node.js gateway for routing, auth enforcement, and request aggregation [2], [9].
- Backend services: Node.js microservices (Auth, User, Trainer, Gym, Payment, Admin). Auth integrates OAuth 2.0/OIDC and issues JWTs [3]–[5].
- Data: Supabase Postgres with migrations to manage schema evolution [6].
- Media: Cloudinary SDK for secure uploads, transformations, and CDN delivery [7].
- Containerization: Docker and compose files for dev/prod orchestration [11].
- Testing: Jest for unit and integration tests with coverage reporting [10].

Methodology:
- Service-first decomposition with explicit API contracts.
- Gateway as single ingress; RESTful internal APIs and optional domain events [14].
- Environment parity via containers; CI-friendly tests and coverage.

## 6.2 Materials

The platform primarily captures operational data (users, trainers, gyms, plans, payments). Development used seed fixtures for gyms, trainers, and plans. Media assets are stored in Cloudinary, with secure URLs and transformation presets. OAuth test accounts were used for sandboxed flows [3], [7].

## 6.3 The Algorithm

Fig. 6. Pseudocode for hybrid plan/trainer recommendation.

```
function recommendPlans(user, plans, trainers, k):
    prefs = extractPreferences(user)  // goals, budget, location, time windows
    // Step 1: pre-filter by hard constraints
    candidates = []
    for plan in plans:
        if plan.is_active == false: continue
        if prefs.maxBudget and plan.price > prefs.maxBudget: continue
        if prefs.location and not withinRadius(plan.location, prefs.location, prefs.maxRadius): continue
        candidates.append(plan)

    // Step 2: compute scores
    scored = []
    for plan in candidates:
        base = normalizePrice(plan.price, prefs.maxBudget) * w_price
        fit  = tagOverlap(plan.tags, prefs.goalTags) * w_goal
        time = scheduleCompatibility(plan, user.calendar) * w_time
        trust = trainerReputation(trainers[plan.trainerId]) * w_trust
        // Optional: semantic similarity if embeddings available
        sem = 0
        if plan.embedding and prefs.profileEmbedding:
            sem = cosineSimilarity(plan.embedding, prefs.profileEmbedding) * w_sem

        total = fit + trust + time - base + sem
        scored.append((plan, total))

    // Step 3: sort and return top-k
    scored.sort(by = score desc)
    return topK(scored, k)
```

Explanation: The algorithm filters via constraints, then scores candidates by goal alignment, schedule compatibility, trainer reputation, and optional semantic similarity. Weights are tunable and can be learned in future iterations.

## 6.4 Main Interfaces

Fig. 7. Authentication and onboarding screens.  
Fig. 8. Catalog and discovery with filters and plan details.  
Fig. 9. Subscription checkout and confirmation.  
Fig. 10. Account dashboard and trainer verification view.

# 7. System Testing and Analysis

Testing approach:
- Unit tests on utilities and controllers using Jest. External dependencies are mocked [10].
- Integration tests for API routes behind the gateway to validate authentication and payload schemas.
- Frontend component tests and routing smoke tests.
- Contract checks to keep gateway-service interfaces consistent.

Results and analysis:
- Auth flows verified for valid/invalid tokens and expiry [3]–[5].
- Subscription lifecycle tested including idempotent webhook handling and entitlement updates.
- Performance: SSR/SSG minimized TTFB; PWA caching improved repeat navigations [8], [12].
- Security: Role-based access, JWT validation, signed webhooks, and input validation address common risks; guidance aligned with OWASP ASVS [15].
- Failure handling: Consistent error mapping at gateway, retries/backoff for webhooks, and health endpoints for readiness.

Limitations:
- Eventual consistency across services yields short-lived transient states.
- Observability to be extended with distributed tracing.
- Recommendation scoring weights static.

# 8. Conclusion and Future Work

FitNest demonstrates an extensible, microservices-based solution for fitness management that unifies identity, discovery, subscriptions, and administration. The architecture—anchored by an API Gateway, services partitioned by domain, and a PWA frontend—supports independent evolution and operational scaling while preserving a cohesive user experience. Security is integral through OAuth/OIDC, JWT, and disciplined webhook processing. Automated testing and containerization underpin maintainability and delivery speed.

Future work:
- Learned-to-rank recommendations with A/B testing.
- Distributed tracing and SLO-based alerting.
- Enhanced offline capabilities via PWA background sync.
- Broader domain events for decoupled workflows [14].
- Accessibility and internationalization improvements.

# 9. References

[1] S. Newman, “Building Microservices: Designing Fine-Grained Systems,” O’Reilly Media, 2015.  
[2] C. Richardson, “Microservices Patterns: With examples in Java,” Chapter: API Gateway Pattern, Manning Publications, 2018.  
[3] D. Hardt, “The OAuth 2.0 Authorization Framework,” RFC 6749, IETF, 2012. Available: https://www.rfc-editor.org/rfc/rfc6749. Accessed: Oct. 14, 2025.  
[4] OpenID Foundation, “OpenID Connect Core 1.0,” 2014. Available: https://openid.net/specs/openid-connect-core-1_0.html. Accessed: Oct. 14, 2025.  
[5] M. Jones, J. Bradley, N. Sakimura, “JSON Web Token (JWT),” RFC 7519, IETF, 2015. Available: https://www.rfc-editor.org/rfc/rfc7519. Accessed: Oct. 14, 2025.  
[6] Supabase, “Introduction to Supabase,” Documentation. Available: https://supabase.com/docs. Accessed: Oct. 14, 2025.  
[7] Cloudinary, “Image and Video API Reference,” Documentation. Available: https://cloudinary.com/documentation. Accessed: Oct. 14, 2025.  
[8] Vercel, “Next.js Documentation,” Available: https://nextjs.org/docs. Accessed: Oct. 14, 2025.  
[9] Node.js Foundation, “Node.js v20 Documentation,” Available: https://nodejs.org/en/docs. Accessed: Oct. 14, 2025.  
[10] Jest, “Jest: Delightful JavaScript Testing,” Available: https://jestjs.io/docs. Accessed: Oct. 14, 2025.  
[11] Docker, “Docker Overview,” Documentation. Available: https://docs.docker.com/get-started/overview. Accessed: Oct. 14, 2025.  
[12] W3C, “Progressive Web Apps,” Web application concepts. Available: https://www.w3.org/TR/appmanifest. Accessed: Oct. 14, 2025.  
[13] Tailwind Labs, “Tailwind CSS Documentation,” Available: https://tailwindcss.com/docs. Accessed: Oct. 14, 2025.  
[14] Apache Kafka, “Kafka Documentation,” Available: https://kafka.apache.org/documentation. Accessed: Oct. 14, 2025.  
[15] OWASP, “Application Security Verification Standard (ASVS),” Available: https://owasp.org/www-project-application-security-verification-standard. Accessed: Oct. 14, 2025.

# 10. Appendix

Appendix A — Project Schedule (Indicative)  
Appendix B — Selected API Endpoints  
Appendix C — Test Coverage Summary (Indicative)  
Appendix D — Data Dictionary (Extract)  
Appendix E — Figures (High-Resolution Notes)
