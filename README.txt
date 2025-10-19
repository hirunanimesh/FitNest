================================================================================
                             FITNEST
                  Fitness Management Platform
================================================================================

SUBMISSION LINKS & ACCESS CREDENTIALS
--------------------------------------------------------------------------------

Google Drive Folder:
   [INSERT YOUR GOOGLE DRIVE LINK HERE]
   (Contains: Source code, documentation, test reports, executable files)

GitHub Repository:
   https://github.com/hirunanimesh/FitNest

Live System URL:
   https://fit-nest.app

TEST ACCOUNTS FOR EVALUATION
--------------------------------------------------------------------------------

Administrator Account:
   Email:    admin@gmail.com
   Password: Password@123
   Role:     Admin
   Access:   Full platform oversight, verification, analytics dashboard

User/Customer Account:
   Email:    member@gmail.com
   Password: Password@123
   Role:     Customer
   Access:   Browse gyms, subscribe to plans, track progress

Trainer Account:
   Email:    trainer2@gmail.com
   Password: trainer@123
   Role:     Trainer
   Access:   Create training plans, manage sessions

Gym Owner Account:
   Email:    gym123@gmail.com
   Password: Password@123
   Role:     Gym Owner
   Access:   Manage gym profile, create plans, assign trainers


================================================================================

PROJECT OVERVIEW
--------------------------------------------------------------------------------
FitNest is an end-to-end fitness management platform designed to digitalize 
and streamline interactions between gyms, trainers, and users. The platform 
provides automated subscription management, progress tracking, and secure 
payment processing through a microservices architecture.

KEY FEATURES
--------------------------------------------------------------------------------
- Secure user authentication (Email & Google OAuth)
- Role-based access control (User, Trainer, Gym, Admin)
- Gym and trainer search with location mapping (Google Maps)
- Subscription management with Stripe payments
- Fitness progress tracking (Weight, BMI charts)
- Google Calendar integration for scheduling
- AI-powered chatbot assistance (Gemini)
- Automated email notifications (SendGrid)
- Progressive Web App (PWA) with offline capabilities
- Admin dashboard for platform management

TECHNOLOGY STACK
--------------------------------------------------------------------------------
Frontend:
  - Next.js 14 (React Framework)
  - TypeScript
  - Tailwind CSS
  - Chart.js for data visualization
  - PWA with Service Workers

Backend:
  - Node.js with Express.js
  - Microservices Architecture (7 services)
  - Supabase PostgreSQL Database
  - Apache Kafka for event streaming
  - Docker & Docker Compose

External Services:
  - Supabase (Authentication & Database)
  - Stripe (Payment Processing)
  - Cloudinary (Media Storage)
  - SendGrid (Email Notifications)
  - Google Maps API
  - Google Calendar API
  - Gemini AI (Chatbot)

SYSTEM ARCHITECTURE
--------------------------------------------------------------------------------
The system consists of the following microservices:

1. API Gateway (Port 3000)
   - Request routing and load balancing
   - Authentication and authorization
   - Rate limiting

2. Auth Service (Port 3001)
   - User registration and login
   - Google OAuth integration
   - JWT token management

3. Gym Service (Port 3002)
   - Gym profile management
   - Plan creation and management
   - Trainer assignments

4. Payment Service (Port 3003)
   - Stripe integration
   - Subscription processing
   - Payment history

5. User Service (Port 3004)
   - User profile management
   - Progress tracking
   - Subscription management

6. Trainer Service (Port 3005)
   - Trainer profile management
   - Training plan creation
   - Session management

7. Admin Service (Port 3006)
   - Platform oversight
   - Gym/Trainer verification
   - Analytics and reporting

Frontend (Port 3010)
   - Next.js Progressive Web App
   - Deployed on Vercel

PREREQUISITES
--------------------------------------------------------------------------------
Required Software:
- Node.js v18.x or higher
- npm v9.x or higher
- Docker (latest version)
- Docker Compose v2.x or higher
- Git

Required Accounts:
- Supabase account (https://supabase.com)
- Stripe account (https://stripe.com)
- Cloudinary account (https://cloudinary.com)
- SendGrid account (https://sendgrid.com)
- Google Cloud account (for Maps & Calendar APIs)

INSTALLATION & SETUP
--------------------------------------------------------------------------------

1. Clone the Repository
   ------------------------
   git clone https://github.com/hirunanimesh/FitNest.git
   cd FitNest

2. Install Dependencies
   ------------------------
   Frontend:
   cd frontend
   npm install

   Backend Services (install for each service):
   cd backend/apigateway && npm install
   cd ../AuthService && npm install
   cd ../UserService && npm install
   cd ../GymService && npm install
   cd ../TrainerService && npm install
   cd ../PaymentService && npm install
   cd ../AdminService && npm install

3. Database Setup
   ------------------------
   - Create a Supabase project at https://supabase.com
   - Run the migration script from: supabase/migrations/20250920131100_remote_schema.sql
   - Copy the SQL content to Supabase SQL Editor and execute

4. Environment Variables Setup
   ------------------------
   Frontend:
   - Navigate to frontend folder
   - Copy .env.example to .env.local
   - Fill in the required values:
     * NEXT_PUBLIC_SUPABASE_URL
     * NEXT_PUBLIC_SUPABASE_ANON_KEY
     * NEXT_PUBLIC_API_GATEWAY_URL
     * NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
     * NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
     * GOOGLE_CLIENT_ID
     * GOOGLE_CLIENT_SECRET

   Backend:
   - Navigate to each service folder
   - Copy backend/.env.example to .env in each service
   - Update service-specific values (PORT, database credentials, API keys)

RUNNING THE APPLICATION
--------------------------------------------------------------------------------

Option 1: Using VS Code Tasks (Recommended)
   ------------------------
   1. Open project in VS Code
   2. Press Ctrl+Shift+P (Windows/Linux) or Cmd+Shift+P (Mac)
   3. Type "Tasks: Run Task"
   4. Select "🌟 Start Everything (Backend + Frontend)"

Option 2: Manual Startup
   ------------------------
   Start each service in separate terminals:

   Terminal 1 - API Gateway:
   cd backend/apigateway
   npm start

   Terminal 2 - Auth Service:
   cd backend/AuthService
   npm start

   Terminal 3 - User Service:
   cd backend/UserService
   npm start

   Terminal 4 - Gym Service:
   cd backend/GymService
   npm start

   Terminal 5 - Trainer Service:
   cd backend/TrainerService
   npm start

   Terminal 6 - Payment Service:
   cd backend/PaymentService
   npm start

   Terminal 7 - Admin Service:
   cd backend/AdminService
   npm start

   Terminal 8 - Frontend:
   cd frontend
   npm run dev

Option 3: Using Docker Compose
   ------------------------
   docker-compose up --build

   To run in detached mode:
   docker-compose up -d --build

   To stop all services:
   docker-compose down

ACCESSING THE APPLICATION
--------------------------------------------------------------------------------
Once all services are running:

- Frontend Application: http://localhost:3010
- API Gateway: http://localhost:3000
- Auth Service: http://localhost:3001
- Gym Service: http://localhost:3002
- Payment Service: http://localhost:3003
- User Service: http://localhost:3004
- Trainer Service: http://localhost:3005
- Admin Service: http://localhost:3006

TESTING
--------------------------------------------------------------------------------

Backend Tests:
   # Run all backend tests
   npm run test:all

   # Test individual service
   cd backend/AuthService
   npm test

   # Generate coverage report
   npm test -- --coverage

Frontend Tests:
   cd frontend
   npm test

End-to-End Tests (Cypress):
   cd frontend
   npm run cypress:open    # Opens test runner
   npm run cypress:run     # Runs tests headlessly

Performance Testing:
   - Use Apache JMeter with test plans in tests/performance/
   - Monitor with Google Cloud Monitoring

DEPLOYMENT
--------------------------------------------------------------------------------

Frontend Deployment (Vercel):
   1. Push code to GitHub
   2. Connect repository to Vercel
   3. Configure environment variables
   4. Deploy automatically on push to main branch

Backend Deployment (Google Cloud VM):
   1. Create Google Cloud VM instance
   2. Install Docker and Docker Compose
   3. Clone repository on VM
   4. Configure production environment variables
   5. Run: docker-compose -f docker-compose.prod.yml up -d

PROJECT STRUCTURE
--------------------------------------------------------------------------------
FitNest/
├── frontend/                 # Next.js Frontend Application
│   ├── app/                  # Next.js App Router (pages)
│   ├── components/           # Reusable React components
│   ├── contexts/             # React Context providers
│   ├── lib/                  # Utility libraries & API clients
│   ├── public/               # Static assets
│   ├── __tests__/            # Frontend tests
│   └── package.json
│
├── backend/                  # Backend Microservices
│   ├── apigateway/           # API Gateway (Port 3000)
│   ├── AuthService/          # Authentication Service (Port 3001)
│   ├── GymService/           # Gym Management (Port 3002)
│   ├── PaymentService/       # Payment Processing (Port 3003)
│   ├── UserService/          # User Management (Port 3004)
│   ├── TrainerService/       # Trainer Management (Port 3005)
│   └── AdminService/         # Admin Service (Port 3006)
│
├── supabase/                 # Database & Migrations
│   ├── migrations/           # SQL migration scripts
│   └── config.toml
│
├── docs/                     # Documentation
├── docker-compose.yml        # Docker orchestration (development)
├── docker-compose.prod.yml   # Docker orchestration (production)
└── README.md                 # Detailed documentation

SERVICE RESPONSIBILITIES
--------------------------------------------------------------------------------
API Gateway:     Routing, authentication, load balancing, rate limiting
Auth Service:    User registration, login, Google OAuth, JWT management
Gym Service:     Gym CRUD, plans, trainer assignments, location services
Payment Service: Stripe integration, subscriptions, payment processing
User Service:    User profiles, progress tracking, subscription management
Trainer Service: Trainer profiles, training plans, session management
Admin Service:   Verification, analytics, platform oversight

TESTING STRATEGY
--------------------------------------------------------------------------------
1. Unit Tests (Jest)
   - Business logic validation
   - Database operations
   - Service functions

2. Integration Tests (Jest + Supertest)
   - API endpoint testing
   - Service interactions
   - Database integrity

3. End-to-End Tests (Cypress)
   - User workflows
   - Complete feature testing
   - UI/UX validation

4. Performance Tests (Apache JMeter)
   - Load testing
   - Stress testing
   - Response time monitoring

5. Security Tests
   - Authentication bypass attempts
   - SQL injection prevention
   - XSS protection
   - CSRF validation

CONFIGURATION FILES
--------------------------------------------------------------------------------
Key configuration files included in the project:

Frontend:
- package.json              (Dependencies and scripts)
- next.config.mjs           (Next.js configuration)
- tailwind.config.ts        (Tailwind CSS settings)
- tsconfig.json             (TypeScript configuration)
- jest.config.js            (Test configuration)
- .env.example              (Environment variables template)
- Dockerfile                (Docker image definition)

Backend (each service):
- package.json              (Dependencies and scripts)
- jest.config.js            (Test configuration)
- .env.example              (Environment variables template)
- Dockerfile                (Docker image definition)

Root:
- docker-compose.yml        (Development orchestration)
- docker-compose.prod.yml   (Production orchestration)
- .gitignore                (Git ignore rules)

SECURITY FEATURES
--------------------------------------------------------------------------------
- JWT-based authentication
- Role-based access control (RBAC)
- Google OAuth integration
- HTTPS/TLS encryption
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF token validation
- Rate limiting
- Secure environment variable management

NON-FUNCTIONAL QUALITIES
--------------------------------------------------------------------------------
Performance:
- Response time <200ms for 95th percentile
- Pagination for efficient data loading
- Debouncing for search operations
- Image optimization via Cloudinary CDN

Scalability:
- Horizontal scaling of stateless services
- Load balancing via API Gateway
- Database partitioning
- Containerized deployment

Reliability:
- Graceful degradation on service failures
- Comprehensive error handling
- Idempotent payment processing
- Transaction management

Maintainability:
- Modular codebase
- 80%+ test coverage
- Extensive documentation
- CI/CD workflows

COMMON ISSUES & TROUBLESHOOTING
--------------------------------------------------------------------------------

1. Port Already in Use
   Solution: Change port in .env file or kill process using the port

2. Database Connection Error
   Solution: Verify Supabase credentials and database URL

3. Google OAuth Not Working
   Solution: Check authorized redirect URIs in Google Cloud Console

4. Stripe Webhook Fails
   Solution: Verify webhook secret and endpoint configuration

5. Services Can't Communicate
   Solution: Ensure all services are running and check API Gateway URL

ENVIRONMENT VARIABLES REFERENCE
--------------------------------------------------------------------------------
Critical variables that must be set:

NEXT_PUBLIC_SUPABASE_URL          # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY     # Supabase anonymous key
SUPABASE_SERVICE_ROLE_KEY         # Supabase service role key
NEXT_PUBLIC_API_GATEWAY_URL       # API Gateway endpoint
STRIPE_SECRET_KEY                 # Stripe secret key
GOOGLE_CLIENT_ID                  # Google OAuth client ID
GOOGLE_CLIENT_SECRET              # Google OAuth client secret
SENDGRID_API_KEY                  # SendGrid API key
CLOUDINARY_CLOUD_NAME             # Cloudinary cloud name
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY   # Google Maps API key

See .env.example files for complete list.

API DOCUMENTATION
--------------------------------------------------------------------------------
Sample API Endpoints:

Authentication:
POST /api/auth/register          - Register new user
POST /api/auth/login             - User login
GET  /api/auth/google            - Google OAuth

User:
GET  /api/user/profile/:id       - Get user profile
PUT  /api/user/profile/:id       - Update profile
POST /api/user/weight            - Track weight

Gym:
GET  /api/gym                    - Get all gyms
GET  /api/gym/:id                - Get gym by ID
POST /api/gym/:id/plans          - Create gym plan

Subscription:
POST /api/subscription/create    - Create subscription
GET  /api/subscription/user/:id  - Get user subscriptions

Payment:
POST /api/payment/checkout       - Create checkout session

For complete API documentation, see individual service README files.

CONTRIBUTING
--------------------------------------------------------------------------------
To contribute to FitNest:

1. Fork the repository
2. Create a feature branch (git checkout -b feature/name)
3. Make your changes
4. Run tests (npm test)
5. Commit changes (git commit -m "feat: description")
6. Push to branch (git push origin feature/name)
7. Create Pull Request

Commit Convention:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting
- refactor: Code restructuring
- test: Tests
- chore: Maintenance

SUPPORT & CONTACT
--------------------------------------------------------------------------------
For questions or issues:

- GitHub Repository: https://github.com/hirunanimesh/FitNest
- Email: nimeshhiruna@gmail.com
- Documentation: See README.md for detailed information

LICENSE
--------------------------------------------------------------------------------
This project is licensed under the MIT License.
See LICENSE file for details.

Copyright (c) 2025 FitNest Team
All rights reserved.

================================================================================
                        END OF README
================================================================================
