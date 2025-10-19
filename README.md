# FitNest - Fitness Management Platform

<div align="center">
  <img src="./frontend/public/assets/logo.png" alt="FitNest Logo" width="200"/>
  
  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
  [![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
  [![Next.js](https://img.shields.io/badge/Next.js-14.0-black)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
</div>

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Features](#-features)
  - [Functional Features](#functional-features)
  - [Non-Functional Features](#non-functional-features)
- [Architecture & Technologies](#-architecture--technologies)
- [System Architecture Diagram](#-system-architecture-diagram)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Non-Functional Requirements](#-non-functional-requirements)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🎯 Project Overview

**FitNest** is an end-to-end fitness management platform designed to digitalize and streamline interactions between gyms, trainers, and users within the fitness industry. The platform addresses inefficiencies in manual and discrete systems by providing an automated, scalable, and secure digital solution for subscription management, progress tracking, and user engagement.

### Key Objectives

- **Digitalize Fitness Operations**: Transform manual gym and trainer management into an automated digital experience
- **Role-Based Access Control**: Provide specialized dashboards for users, trainers, gyms, and administrators
- **Seamless Integration**: Connect payment processing, progress tracking, scheduling, and communication in one platform
- **Scalability & Security**: Built on microservices architecture with robust authentication and data protection

### System Design

FitNest employs a **microservices architecture** with independently deployable services:

- **Authentication Service**: Manages user authentication with Supabase and Google OAuth
- **Gym Management Service**: Handles gym profiles, plans, and trainer assignments
- **Trainer Management Service**: Manages trainer profiles, sessions, and training plans
- **User Management Service**: Handles user profiles, subscriptions, and progress tracking
- **Admin Service**: Oversees platform integrity, verifications, and analytics
- **Payment Service**: Processes secure payments via Stripe integration

The **API Gateway** serves as the single entry point, routing requests and securing inter-service communication. The frontend, built with **Next.js**, delivers a Progressive Web App (PWA) experience with offline capabilities. **Supabase PostgreSQL** manages data storage and authentication, **Stripe** handles payments, and **Cloudinary** optimizes media uploads.

---

## ✨ Features

### Functional Features

#### 🔐 Authentication & User Management
- Secure user registration and login via email or **Google OAuth**
- Role-based access control (User, Trainer, Gym, Admin)
- Profile management with image uploads via Cloudinary
- Password reset and email verification

#### 👤 User Features
- Browse and search gyms and trainers by location (Google Maps integration)
- Subscribe to gym and trainer plans with secure Stripe payments
- Track fitness progress with **weight and BMI charts**
- Integrated **Google Calendar** for scheduling workouts and sessions
- View subscription history and manage active plans
- Real-time chatbot assistance powered by **Gemini AI**

#### 💪 Trainer Features
- Create and manage personalized training plans
- Schedule training sessions with clients
- Track client progress and provide feedback
- Manage trainer profile and certifications
- Receive notifications for new subscriptions
- Stripe integration for payment processing

#### 🏋️ Gym Features
- Create and manage gym profiles with location mapping
- Define subscription plans (monthly, quarterly, annual)
- Assign trainers to plans
- Publish gym content and updates
- Monitor member subscriptions and analytics
- Automated email notifications to members within 10km radius

#### 🛡️ Admin Features
- Verify and approve gym and trainer registrations
- Monitor platform activity and user management
- Manage user feedback and inquiries
- Analytics dashboard for platform metrics
- System health monitoring and logs

#### 📧 Automated Notifications
- Email notifications via SendGrid for:
  - New gym plan creation (notifies gym, trainers, and nearby users within 10km)
  - Gym and trainer verification approvals
  - Subscription confirmations and renewals
  - Session bookings and reminders

### Non-Functional Features

#### ⚡ Performance
- **Pagination** for efficient data loading
- **Debouncing** for optimized search and user interactions
- Lazy loading for images and components
- Server-Side Rendering (SSR) and Static Site Generation (SSG) for optimal performance

#### 📈 Scalability
- Horizontal scaling of stateless microservices
- Data partitioning for improved query performance
- Load balancing via API Gateway
- Containerized services for easy scaling

#### 🛡️ Reliability
- Graceful degradation for service failures
- Comprehensive error handling and logging
- Idempotent payment processing
- Database transaction management

#### 🔒 Security
- Backend-guarded API calls with JWT authentication
- Supabase Authentication with Google OAuth
- HTTPS/TLS encryption for all communications
- Role-based access control (RBAC)
- Input validation and sanitization
- Secure environment variable management

#### 📱 Usability
- Mobile-first responsive design
- Progressive Web App (PWA) with offline capabilities
- Intuitive user interfaces with Tailwind CSS
- Consistent design system with reusable components

#### 🔍 Observability
- Structured logging across all services
- Performance metrics and monitoring
- Distributed tracing for microservices
- Google Cloud Monitoring integration

#### 🔧 Maintainability
- Modular, clean code architecture
- Comprehensive automated tests (Jest, Cypress)
- CI/CD-friendly workflows
- Extensive documentation

#### 🐳 Portability
- Dockerized services for consistent deployment
- Environment-agnostic configuration
- Cross-platform compatibility

---

## 🏗️ Architecture & Technologies

### Frontend Technologies

| Technology | Purpose | Version |
|------------|---------|---------|
| **Next.js** | React framework with SSR/SSG | 14.x |
| **TypeScript** | Type-safe development | 5.x |
| **Tailwind CSS** | Utility-first CSS framework | 3.x |
| **React** | UI component library | 18.x |
| **Chart.js** | Data visualization for progress tracking | Latest |
| **Google Maps API** | Location-based gym search | - |
| **Google Calendar API** | Session scheduling integration | - |
| **Gemini AI** | Chatbot for user assistance | - |
| **PWA (Service Workers)** | Offline capabilities | - |

### Backend Technologies

| Technology | Purpose | Version |
|------------|---------|---------|
| **Node.js** | JavaScript runtime | 18.x |
| **Express.js** | Web framework for microservices | 4.x |
| **Supabase** | PostgreSQL database & authentication | - |
| **Stripe** | Payment processing | Latest |
| **Apache Kafka** | Event streaming for async operations | Latest |
| **SendGrid** | Email service for notifications | - |
| **Cloudinary** | Media storage and optimization | - |
| **Jest** | Testing framework | 29.x |
| **Supertest** | HTTP assertions for API testing | Latest |

### DevOps & Deployment

| Tool | Purpose |
|------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Multi-container orchestration |
| **Google Cloud Platform** | Backend hosting (VM) |
| **Vercel** | Frontend hosting |
| **GitHub** | Version control |
| **VS Code** | Primary IDE |
| **Apache JMeter** | Performance testing |
| **Cypress** | End-to-end testing |

---

## 🔄 System Architecture Diagram



## 📋 Prerequisites

Before setting up FitNest, ensure you have the following installed:

- **Node.js**: v18.x or higher ([Download](https://nodejs.org/))
- **npm**: v9.x or higher (comes with Node.js)
- **Docker**: Latest version ([Download](https://www.docker.com/))
- **Docker Compose**: v2.x or higher
- **Git**: Latest version ([Download](https://git-scm.com/))

### External Accounts Required

- **Supabase Account** ([Sign up](https://supabase.com/))
- **Stripe Account** ([Sign up](https://stripe.com/))
- **Cloudinary Account** ([Sign up](https://cloudinary.com/))
- **SendGrid Account** ([Sign up](https://sendgrid.com/))
- **Google Cloud Account** (for Maps and Calendar APIs) ([Sign up](https://cloud.google.com/))

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/hirunanimesh/FitNest.git
cd FitNest
```

### 2. Install Dependencies

#### Install Frontend Dependencies
```bash
cd frontend
npm install
```

#### Install Backend Dependencies
```bash
# API Gateway
cd ../backend/apigateway
npm install

# Auth Service
cd ../AuthService
npm install

# User Service
cd ../UserService
npm install

# Gym Service
cd ../GymService
npm install

# Trainer Service
cd ../TrainerService
npm install

# Payment Service
cd ../PaymentService
npm install

# Admin Service
cd ../AdminService
npm install
```

### 3. Database Setup

#### Supabase Setup

1. Create a new project on [Supabase](https://supabase.com/)
2. Navigate to the SQL Editor
3. Run the migration script:

```bash
cd supabase/migrations
# Copy the contents of 20250920131100_remote_schema.sql
# and paste it into the Supabase SQL Editor
```

4. Obtain your Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### 4. Environment Variables Setup

Create `.env` files for each service. Use the provided templates below:

#### Frontend `.env.local`

```bash
# Copy .env.example to .env.local
cd frontend
cp .env.example .env.local
```

Edit `frontend/.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# API Gateway
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3010

# Service URLs (for local development)
API_GATEWAY_URL=http://localhost:3000
AUTH_SERVICE_URL=http://localhost:3001
GYM_SERVICE_URL=http://localhost:3002
PAYMENT_SERVICE_URL=http://localhost:3003
USER_SERVICE_URL=http://localhost:3004
TRAINER_SERVICE_URL=http://localhost:3005

# Node Environment
NODE_ENV=development

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_cloudinary_api_key
NEXT_PUBLIC_CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# Google OAuth & Calendar
GOOGLE_AUTH_URL=https://accounts.google.com/o/oauth2/v2/auth
GOOGLE_TOKEN_URL=https://oauth2.googleapis.com/token
CALENDAR_EVENTS_URL=https://www.googleapis.com/calendar/v3/calendars/primary/events
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

#### Backend Services `.env`

Create `.env` files for each backend service in their respective directories:

```bash
# Example for Auth Service (backend/AuthService/.env)
PORT=3001
DATABASE_URL=your_supabase_database_url
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# JWT
JWT_SECRET=your_jwt_secret_key

# Email Service
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@fitnest.com

# Kafka (optional)
KAFKA_BROKERS=localhost:9092
```

**Repeat for all services**: API Gateway, User Service, Gym Service, Trainer Service, Payment Service, and Admin Service.

---

## ⚙️ Configuration

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable **Google+ API** and **Google Calendar API**
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3010/auth/callback`
   - `https://yourdomain.com/auth/callback` (production)
6. Copy the `Client ID` and `Client Secret`

Detailed guide: See [`GOOGLE_OAUTH_SETUP.md`](GOOGLE_OAUTH_SETUP.md)

### Stripe Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get your API keys from **Developers > API keys**
3. Set up webhook endpoints for subscription events
4. Add the following webhooks:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

### Cloudinary Setup

1. Go to [Cloudinary Console](https://cloudinary.com/console)
2. Get your `Cloud Name`, `API Key`, and `API Secret`
3. Create an upload preset:
   - Settings > Upload > Add upload preset
   - Name: `fitnest_uploads`
   - Signing Mode: `Unsigned`

Detailed guide: See [`backend/AuthService/CLOUDINARY_SETUP.md`](backend/AuthService/CLOUDINARY_SETUP.md)

---

## 💻 Usage

### Running Locally (Development)

#### Option 1: Using VS Code Tasks (Recommended)

This project includes pre-configured VS Code tasks for easy startup:

1. Open the project in VS Code
2. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
3. Type "Tasks: Run Task"
4. Select one of the following:
   - **🌟 Start Everything (Backend + Frontend)** - Starts all services
   - **🚀 Start All Microservices** - Starts only backend services
   - **Start Frontend** - Starts only frontend
   - Individual service tasks (Start API Gateway, Start Auth Service, etc.)

#### Option 2: Manual Startup

**Start Backend Services** (in separate terminals):

```bash
# Terminal 1 - API Gateway
cd backend/apigateway
npm start

# Terminal 2 - Auth Service
cd backend/AuthService
npm start

# Terminal 3 - User Service
cd backend/UserService
npm start

# Terminal 4 - Gym Service
cd backend/GymService
npm start

# Terminal 5 - Trainer Service
cd backend/TrainerService
npm start

# Terminal 6 - Payment Service
cd backend/PaymentService
npm start

# Terminal 7 - Admin Service
cd backend/AdminService
npm start
```

**Start Frontend**:

```bash
# Terminal 8 - Frontend
cd frontend
npm run dev
```

#### Option 3: Using Docker Compose

```bash
# Start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Accessing the Application

- **Frontend**: http://localhost:3010
- **API Gateway**: http://localhost:3000
- **Auth Service**: http://localhost:3001
- **Gym Service**: http://localhost:3002
- **Payment Service**: http://localhost:3003
- **User Service**: http://localhost:3004
- **Trainer Service**: http://localhost:3005
- **Admin Service**: http://localhost:3006 (if applicable)

### Default Test Accounts

For testing purposes, you can create accounts or use these test credentials:

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| User | testuser@fitnest.com | Test@123 | Sample user account |
| Trainer | testtrainer@fitnest.com | Test@123 | Sample trainer account |
| Gym | testgym@fitnest.com | Test@123 | Sample gym account |
| Admin | admin@fitnest.com | Admin@123 | Admin account |

> **Note**: These are placeholder credentials. You'll need to create actual accounts through the registration flow.

### Sample Workflows

#### 1. User Subscribes to a Gym Plan

1. Register as a new user
2. Navigate to "Search" or "Browse Gyms"
3. Filter gyms by location (enter your city)
4. Select a gym and view available plans
5. Click "Subscribe" and complete payment via Stripe
6. View subscription in "My Subscriptions"

#### 2. Trainer Creates a Training Plan

1. Register as a trainer
2. Complete profile and verification
3. Navigate to "My Plans"
4. Click "Create New Plan"
5. Fill in plan details (name, duration, price, description)
6. Assign exercises and schedules
7. Publish the plan

#### 3. Gym Assigns Trainer to Plan

1. Log in as gym owner
2. Navigate to "Trainers"
3. Add trainer to your gym
4. Go to "Plans" and create a new plan
5. Assign the trainer to the plan
6. Set pricing and publish

---

## 🧪 Testing

### Test Scripts Summary

#### Backend Testing

Each microservice includes comprehensive tests:

**Data Integrity Tests** (Jest + Supertest):
- CRUD operations validation
- Database constraints verification
- Referential integrity checks
- Transaction management

**Functional Tests**:
- Business logic validation
- Role-based access control
- External API integrations (Stripe, Kafka, SendGrid)
- Error handling scenarios

**Run Backend Tests**:

```bash
# Test all services
npm run test:all

# Test individual service
cd backend/AuthService
npm test

# Test with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

#### Frontend Testing

**Unit Tests** (Jest + React Testing Library):
```bash
cd frontend
npm test
```

**End-to-End Tests** (Cypress):
```bash
# Open Cypress Test Runner
npm run cypress:open

# Run tests headlessly
npm run cypress:run
```

**Component Tests**:
- Authentication flows
- Dashboard interactions
- Form validations
- Chart rendering

#### Performance Testing

**Apache JMeter** is used for load testing:

1. Install JMeter: [Download](https://jmeter.apache.org/download_jmeter.cgi)
2. Load test plans from `tests/performance/`
3. Run tests:
```bash
jmeter -n -t tests/performance/api-load-test.jmx -l results.jtl
```

**Key Metrics Monitored**:
- Response time (< 200ms for 95th percentile)
- Throughput (requests per second)
- Error rate (< 1%)
- CPU and memory usage via Google Cloud Monitoring

#### Security Testing

Tests include:
- SQL injection prevention
- XSS attack prevention
- CSRF token validation
- Rate limiting
- Authentication bypass attempts
- Role-based access violations

#### Test Coverage Goals

- **Backend**: >80% code coverage
- **Frontend**: >75% code coverage
- **Critical Paths**: 100% coverage

### Running All Tests

```bash
# Run all tests (backend + frontend)
npm run test:full

# Generate coverage report
npm run test:coverage

# View coverage report
open coverage/lcov-report/index.html
```

---

## 🚢 Deployment

### Frontend Deployment (Vercel)

1. **Push to GitHub**:
```bash
git push origin main
```

2. **Connect to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/)
   - Import your GitHub repository
   - Configure environment variables (same as `.env.local`)
   - Deploy

3. **Environment Variables in Vercel**:
   - Add all variables from `.env.local`
   - Ensure `NEXT_PUBLIC_API_GATEWAY_URL` points to production backend

4. **Custom Domain** (optional):
   - Add custom domain in Vercel settings
   - Update DNS records

### Backend Deployment (Google Cloud VM)

#### 1. Set Up Google Cloud VM

```bash
# Create VM instance
gcloud compute instances create fitnest-backend \
  --zone=us-central1-a \
  --machine-type=e2-medium \
  --image-family=ubuntu-2004-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=50GB

# SSH into the VM
gcloud compute ssh fitnest-backend --zone=us-central1-a
```

#### 2. Install Docker on VM

```bash
# Update packages
sudo apt-get update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
```

#### 3. Clone Repository and Deploy

```bash
# Clone repository
git clone https://github.com/hirunanimesh/FitNest.git
cd FitNest

# Create production .env files
# (Copy from .env.example and fill with production values)

# Build and start services
docker-compose -f docker-compose.prod.yml up -d --build

# View logs
docker-compose logs -f
```

#### 4. Configure Firewall

```bash
# Allow HTTP traffic
gcloud compute firewall-rules create allow-http \
  --allow tcp:80 \
  --source-ranges 0.0.0.0/0 \
  --target-tags http-server

# Allow HTTPS traffic
gcloud compute firewall-rules create allow-https \
  --allow tcp:443 \
  --source-ranges 0.0.0.0/0 \
  --target-tags https-server

# Allow backend ports
gcloud compute firewall-rules create allow-backend \
  --allow tcp:3000-3006 \
  --source-ranges 0.0.0.0/0
```

### CI/CD Pipeline (Optional)

#### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Google Cloud
        uses: google-github-actions/deploy-cloudrun@v0
        with:
          credentials: ${{ secrets.GCP_CREDENTIALS }}
          # Add deployment configuration
```

### Environment Variables in Production

**Security Best Practices**:

1. **Never commit** `.env` files to Git
2. Use **Vercel Environment Variables** for frontend
3. Use **Google Secret Manager** for backend secrets
4. Rotate API keys regularly
5. Use different keys for production and development

**Production Checklist**:

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] SSL/TLS certificates installed
- [ ] Firewall rules configured
- [ ] Monitoring and logging enabled
- [ ] Backup strategy implemented
- [ ] Rate limiting configured
- [ ] CORS policies set correctly

---

## 📁 Project Structure

```
FitNest/
├── frontend/                    # Next.js Frontend Application
│   ├── app/                     # Next.js App Router
│   │   ├── dashboard/           # Dashboard pages (user, trainer, gym, admin)
│   │   ├── auth/                # Authentication pages (login, register)
│   │   ├── about/               # About page
│   │   ├── contact/             # Contact page
│   │   ├── layout.tsx           # Root layout with AuthProvider
│   │   └── page.tsx             # Home page
│   ├── components/              # Reusable React components
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── ProtectedRoute.tsx   # Route protection HOC
│   │   ├── Chatbot.tsx          # Gemini AI chatbot
│   │   ├── navbar.tsx           # Navigation bar
│   │   └── ...                  # Other components
│   ├── contexts/                # React Context providers
│   │   ├── AuthContext.tsx      # Authentication state management
│   │   └── UserSubscriptionContext.tsx
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Utility libraries
│   │   ├── api.js               # API client functions
│   │   ├── supabase.js          # Supabase client
│   │   └── utils.ts             # Helper functions
│   ├── public/                  # Static assets
│   │   ├── icons/               # PWA icons
│   │   ├── images/              # Images
│   │   ├── manifest.json        # PWA manifest
│   │   └── sw.js                # Service worker
│   ├── styles/                  # Global styles
│   ├── __tests__/               # Frontend tests
│   ├── .env.local               # Environment variables (not committed)
│   ├── .env.example             # Environment variables template
│   ├── Dockerfile               # Frontend Docker image
│   ├── next.config.mjs          # Next.js configuration
│   ├── tailwind.config.ts       # Tailwind CSS configuration
│   ├── jest.config.js           # Jest test configuration
│   └── package.json             # Frontend dependencies
│
├── backend/                     # Backend Microservices
│   ├── apigateway/              # API Gateway Service (Port 3000)
│   │   ├── src/
│   │   │   ├── routes/          # Route definitions
│   │   │   ├── middleware/      # Authentication, rate limiting
│   │   │   └── index.js         # Gateway entry point
│   │   ├── __tests__/           # Gateway tests
│   │   ├── Dockerfile           # Gateway Docker image
│   │   └── package.json
│   │
│   ├── AuthService/             # Authentication Service (Port 3001)
│   │   ├── controllers/         # Auth controllers
│   │   ├── middleware/          # JWT verification
│   │   ├── Routes/              # Auth routes
│   │   ├── model/               # User models
│   │   ├── __tests__/           # Auth service tests
│   │   ├── server.js            # Service entry point
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── GymService/              # Gym Management Service (Port 3002)
│   │   ├── controllers/         # Gym controllers
│   │   ├── services/            # Business logic
│   │   ├── database/            # Database queries
│   │   ├── routes/              # Gym routes
│   │   ├── kafka/               # Kafka producers/consumers
│   │   ├── __tests__/           # Gym service tests
│   │   ├── index.js
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── PaymentService/          # Payment Service (Port 3003)
│   │   ├── controllers/         # Payment controllers
│   │   ├── services/            # Stripe integration
│   │   ├── models/              # Payment models
│   │   ├── lib/                 # Payment utilities
│   │   ├── __tests__/           # Payment tests
│   │   ├── index.js
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── UserService/             # User Management Service (Port 3004)
│   │   ├── controllers/         # User controllers
│   │   ├── services/            # User business logic
│   │   ├── database/            # User database queries
│   │   ├── utils/               # Utility functions
│   │   ├── __tests__/           # User service tests
│   │   ├── index.js
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── TrainerService/          # Trainer Management Service (Port 3005)
│   │   ├── controllers/         # Trainer controllers
│   │   ├── services/            # Trainer business logic
│   │   ├── database/            # Trainer database queries
│   │   ├── kafka/               # Event handling
│   │   ├── __tests__/           # Trainer service tests
│   │   ├── index.js
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── AdminService/            # Admin Service (Port 3006)
│       ├── controllers/         # Admin controllers
│       ├── services/            # Admin business logic
│       ├── database/            # Admin database queries
│       ├── __tests__/           # Admin service tests
│       ├── index.js
│       ├── Dockerfile
│       └── package.json
│
├── supabase/                    # Supabase Configuration
│   ├── migrations/              # Database migration scripts
│   │   └── 20250920131100_remote_schema.sql
│   ├── functions/               # Supabase Edge Functions
│   └── config.toml              # Supabase configuration
│
├── docs/                        # Documentation
│   ├── FITNEST_TESTING_PLAN.md
│   ├── FUNCTIONAL_TESTING_README.md
│   └── integration-testing/
│
├── tests/                       # Additional test files
│   └── performance/             # JMeter test plans
│
├── .github/                     # GitHub configuration
│   └── workflows/               # CI/CD workflows
│       └── ci.yml               # Continuous Integration
│
├── docker-compose.yml           # Docker Compose for development
├── docker-compose.prod.yml      # Docker Compose for production
├── .gitignore                   # Git ignore rules
├── README.md                    # This file
├── DOCKER_README.md             # Docker setup guide
├── TESTING_GUIDE.md             # Testing documentation
└── package.json                 # Root package.json
```

### Service Responsibilities

| Service | Port | Responsibilities |
|---------|------|-----------------|
| **API Gateway** | 3000 | Request routing, authentication, load balancing, rate limiting |
| **Auth Service** | 3001 | User registration, login, Google OAuth, JWT management |
| **Gym Service** | 3002 | Gym CRUD, plan management, trainer assignment, location services |
| **Payment Service** | 3003 | Stripe integration, subscription management, payment processing |
| **User Service** | 3004 | User profiles, subscription tracking, progress monitoring |
| **Trainer Service** | 3005 | Trainer profiles, training plans, session management |
| **Admin Service** | 3006 | Verification, analytics, user management, platform oversight |

---

## 🏆 Non-Functional Requirements

### Performance
- **Response Time**: <200ms for 95th percentile of API requests
- **Throughput**: Handle 1000+ concurrent users
- **Database Queries**: Optimized with indexing and pagination
- **Caching**: Implement Redis for frequently accessed data
- **Image Optimization**: Cloudinary auto-optimization and CDN delivery
- **Code Splitting**: Next.js automatic code splitting
- **Lazy Loading**: Images and components load on demand

### Scalability
- **Horizontal Scaling**: Stateless services can scale independently
- **Load Balancing**: API Gateway distributes traffic
- **Database Sharding**: Data partitioning for improved performance
- **Microservices**: Independent deployment and scaling
- **Containerization**: Docker enables easy scaling

### Reliability
- **Uptime**: 99.9% availability target
- **Graceful Degradation**: Services continue with reduced functionality on failures
- **Error Handling**: Comprehensive try-catch blocks and error responses
- **Data Consistency**: Transaction management and eventual consistency via Kafka
- **Idempotency**: Payment operations are idempotent to prevent duplicate charges
- **Health Checks**: Each service exposes `/health` endpoint

### Security
- **Authentication**: Supabase + Google OAuth 2.0
- **Authorization**: Role-based access control (RBAC)
- **Encryption**: HTTPS/TLS for all communications
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content Security Policy (CSP) headers
- **CSRF Protection**: CSRF tokens for state-changing operations
- **Rate Limiting**: Prevent brute force and DDoS attacks
- **Secure Headers**: Helmet.js for Express apps

### Maintainability
- **Code Quality**: ESLint and Prettier for consistent formatting
- **Documentation**: Comprehensive inline comments and README files
- **Testing**: 80%+ code coverage with unit and integration tests
- **CI/CD**: Automated testing and deployment pipelines
- **Modular Architecture**: Clear separation of concerns
- **Version Control**: Git with meaningful commit messages

### Portability
- **Containerization**: All services run in Docker containers
- **Environment Variables**: Configuration via `.env` files
- **Cross-Platform**: Runs on Windows, macOS, Linux
- **Cloud-Agnostic**: Can deploy to any cloud provider
- **Database Abstraction**: ORM/query builder for database independence

---

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "role": "customer",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

#### Google OAuth
```http
GET /api/auth/google
# Redirects to Google OAuth consent screen
```

### User Endpoints

#### Get User Profile
```http
GET /api/user/profile/:userId
Authorization: Bearer {token}
```

#### Update Profile
```http
PUT /api/user/profile/:userId
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890"
}
```

#### Track Weight
```http
POST /api/user/weight
Authorization: Bearer {token}
Content-Type: application/json

{
  "weight": 75.5,
  "height": 175,
  "date": "2025-10-18"
}
```

### Gym Endpoints

#### Get All Gyms
```http
GET /api/gym?page=1&limit=10&location=New+York
```

#### Get Gym by ID
```http
GET /api/gym/:gymId
```

#### Create Gym Plan
```http
POST /api/gym/:gymId/plans
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Monthly Membership",
  "price": 49.99,
  "duration": "1 month",
  "features": ["Access to all equipment", "Free classes"],
  "trainerId": 123
}
```

### Subscription Endpoints

#### Subscribe to Plan
```http
POST /api/subscription/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "planId": 456,
  "planType": "gym",
  "paymentMethodId": "pm_xxx"
}
```

#### Get User Subscriptions
```http
GET /api/subscription/user/:userId
Authorization: Bearer {token}
```

### Payment Endpoints

#### Create Checkout Session
```http
POST /api/payment/create-checkout-session
Authorization: Bearer {token}
Content-Type: application/json

{
  "planId": 789,
  "priceId": "price_xxx",
  "successUrl": "http://localhost:3010/success",
  "cancelUrl": "http://localhost:3010/cancel"
}
```

### Admin Endpoints

#### Verify Gym
```http
POST /api/admin/verify/gym/:gymId
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "verified"
}
```

#### Get Platform Analytics
```http
GET /api/admin/analytics
Authorization: Bearer {token}
```

For complete API documentation, see individual service README files or import the Postman collection from `/docs/postman/`.

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Contribution Guidelines

1. **Fork the Repository**
```bash
git clone https://github.com/YOUR_USERNAME/FitNest.git
cd FitNest
```

2. **Create a Feature Branch**
```bash
git checkout -b feature/your-feature-name
```

3. **Make Your Changes**
   - Follow the existing code style
   - Write meaningful commit messages
   - Add tests for new features
   - Update documentation as needed

4. **Run Tests**
```bash
npm test
npm run lint
```

5. **Commit Your Changes**
```bash
git add .
git commit -m "feat: add new feature description"
```

**Commit Message Convention**:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

6. **Push to Your Fork**
```bash
git push origin feature/your-feature-name
```

7. **Create a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Provide a clear description of your changes
   - Reference any related issues

### Code Style

- **JavaScript/TypeScript**: Follow [Airbnb Style Guide](https://github.com/airbnb/javascript)
- **React**: Use functional components and hooks
- **File Naming**: Use kebab-case for files, PascalCase for components
- **Indentation**: 2 spaces
- **Quotes**: Single quotes for JavaScript, double quotes for JSX attributes

### Branching Strategy

- `main`: Production-ready code
- `develop`: Development branch
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `hotfix/*`: Urgent production fixes

### Pull Request Process

1. Ensure all tests pass
2. Update documentation if needed
3. Request review from maintainers
4. Address review comments
5. Squash commits before merging (if needed)

### Reporting Issues

When reporting issues, please include:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details (OS, browser, Node version)

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 FitNest Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📞 Contact

For questions, support, or collaboration opportunities:

- **GitHub**: [hirunanimesh/FitNest](https://github.com/hirunanimesh/FitNest)
- **Email**: nimeshhiruna@gmail.com
- **Project Maintainer**: Hiruna Nimesh

### Team

- **Lead Developers**: [Hiruna Nimesh]
- **Backend Team**: [Team Members]
- **Frontend Team**: [Team Members]
- **DevOps**: [Team Members]

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a service
- [Stripe](https://stripe.com/) - Payment processing
- [Cloudinary](https://cloudinary.com/) - Media management
- [Vercel](https://vercel.com/) - Frontend hosting
- [Google Cloud](https://cloud.google.com/) - Backend hosting
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components

---

## 📊 Project Status

| Aspect | Status |
|--------|--------|
| Backend Services | ✅ Completed |
| Frontend | ✅ Completed |
| Testing | ✅ Comprehensive |
| Documentation | ✅ Complete |
| Deployment | ✅ Production Ready |

---

## 🔮 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] AI-powered workout recommendations
- [ ] Social features (friend connections, leaderboards)
- [ ] Video streaming for workout tutorials
- [ ] Integration with fitness wearables
- [ ] Multi-language support
- [ ] Advanced analytics and reporting
- [ ] In-app messaging system
- [ ] Nutrition tracking

---

## 📸 Screenshots

### User Dashboard
![User Dashboard](./docs/screenshots/user-dashboard.png)

### Gym Search
![Gym Search](./docs/screenshots/gym-search.png)

### Trainer Profile
![Trainer Profile](./docs/screenshots/trainer-profile.png)

### Progress Tracking
![Progress Tracking](./docs/screenshots/progress-tracking.png)

### Admin Panel
![Admin Panel](./docs/screenshots/admin-panel.png)

---

<div align="center">
  <p>Made with ❤️ by the FitNest Team</p>
  <p>© 2025 FitNest. All rights reserved.</p>
</div>
