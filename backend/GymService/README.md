# GymService

A comprehensive microservice for managing gym operations in the FitNest platform, including gym profiles, membership plans, trainer assignments, member analytics, and email notifications.

## 🌟 Features

- ✅ **Gym Management**: Create, update, and retrieve gym information with location-based search
- ✅ **Plan Management**: Create and manage gym membership plans with flexible pricing
- ✅ **Trainer Management**: Handle trainer approvals, assignments, and plan associations
- ✅ **Member Analytics**: Track member counts, statistics, and engagement metrics
- ✅ **Kafka Integration**: Real-time event streaming for plan updates and notifications
- ✅ **Email Notifications**: Automated emails for subscriptions, plan creation, and trainer assignments (SendGrid)
- ✅ **Cloudinary Integration**: Image and document storage for gym profiles and plans
- ✅ **Verification System**: Gym verification and approval workflow
- ✅ **Comprehensive Testing**: Full unit and integration test coverage with Jest

## 🏗️ Architecture

```
Frontend/API Gateway
    ↓
Gym Service (Port 3002)
    ↓
    ├─→ Supabase PostgreSQL (Database)
    ├─→ Kafka (Event Streaming)
    ├─→ SendGrid (Email Service)
    └─→ Cloudinary (Media Storage)
```

## 📋 API Endpoints

### Gym Management
- `POST /addGym` - Create a new gym
- `GET /getallgyms` - Get all gyms (with pagination, search, location filters)
- `GET /getgymbyid/:gymId` - Get gym by ID
- `GET /getgymbyuserid/:userId` - Get gym by user ID
- `PUT /updategymdetails/:gymId` - Update gym details
- `GET /gettotalmembercount/:gymId` - Get total member count for gym
- `GET /gettrainers/:gymId` - Get trainers for gym
- `PUT /approvetrainer/:request_id` - Approve trainer request
- `GET /getstatistics/:gymId` - Get gym trainer count and statistics
- `POST /getallgymusers` - Get all gym users by IDs
- `POST /request-verification` - Request gym verification

### Plan Management
- `POST /addgymplan` - Create a new gym plan
- `GET /getallgymplans` - Get all gym plans
- `GET /getgymplanbygymid/:gymId` - Get plans by gym ID
- `GET /getgymplanbyplanid/:planId` - Get plan details by plan ID
- `PUT /updategymplan/:gymPlanId` - Update gym plan
- `DELETE /deletegymplan/:gymPlanId` - Delete gym plan
- `GET /getplanmembercount/:plan_id` - Get member count per plan
- `POST /getgymplandetails` - Get gym plan details by plan IDs (bulk)
- `GET /one-day` - Get one-day gym plans
- `GET /other` - Get non one-day gym plans

### Trainer-Plan Assignment
- `POST /assign-trainers-to-plan` - Assign trainers to a gym plan
- `GET /get-plan-trainers/:planId` - Get trainers assigned to a plan
- `PUT /update-plan-trainers/:planId` - Update trainer assignments for a plan

### Email Notifications
- `POST /send-subscription-email` - Send subscription confirmation email to customer

## 🧪 Testing

This service includes comprehensive unit and integration tests using Jest and Supertest.

### Test Structure

```
__tests__/
├── gym.controller.test.js      # Unit tests for gym controller functions
├── gym.http.int.test.js        # HTTP integration tests for gym endpoints
├── gym.service.test.js         # Unit tests for gym service layer
├── plans.controller.test.js    # Unit tests for plans controller functions
├── plans.http.int.test.js      # HTTP integration tests for plans endpoints
└── plans.service.test.js       # Unit tests for plans service layer
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test gym.controller.test.js
```

### Test Coverage

The test suite covers:

- ✅ **Controllers**: HTTP request/response handling, validation, error scenarios
- ✅ **Services**: Database operations, business logic, error handling
- ✅ **Integration Tests**: Full HTTP endpoint testing with mocked dependencies
- ✅ **External Services**: Mocked Supabase, Kafka, SendGrid, and Cloudinary

### Test Categories

#### Gym Controller Tests
- Gym creation and validation
- Gym retrieval with pagination, search, and location filters
- Gym updates and error handling
- Member count operations
- Trainer management and approval
- User retrieval by IDs
- Verification request handling

#### Plans Controller Tests
- Plan CRUD operations (Create, Read, Update, Delete)
- Trainer assignment to plans
- Kafka event publishing for plan updates
- Plan categorization (one-day vs. other)
- Bulk plan details retrieval
- Member count per plan

#### Service Layer Tests
- Database query validation
- Business logic correctness
- Error handling and edge cases
- Data transformation and formatting

### Mocking Strategy

- **Supabase**: Mocked for database operations using jest.mock()
- **Kafka Producers**: Mocked to avoid actual message publishing during tests
- **SendGrid**: Mocked email sending functionality
- **Cloudinary**: Mocked image upload operations
- **Request/Response**: Mocked Express req/res objects for controller testing

### Test Data

Tests use realistic mock data that mirrors production scenarios:
- Valid gym profiles with location data
- Membership plans with various durations and pricing
- Trainer assignments and approval workflows
- Error conditions and edge cases
- Pagination and filtering scenarios

## 🚀 Development

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Supabase account (for database)
- Kafka instance (Aiven recommended)
- SendGrid account (for emails)
- Cloudinary account (for media storage)

### Installation

```bash
# Navigate to the service directory
cd backend/GymService

# Install dependencies
npm install
```

### Environment Configuration

1. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Configure the following variables in `.env`:**

   **Database (Supabase):**
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
   Get these from: Supabase Dashboard → Settings → API

   **Kafka (Aiven):**
   ```env
   KAFKA_BROKER=your-kafka-instance.aivencloud.com:20377
   KAFKA_PASSWORD=your-kafka-password
   ```
   - Download `ca.pem` certificate from Aiven Kafka dashboard
   - Place it in: `backend/GymService/ca.pem`

   **SendGrid (Email):**
   ```env
   SENDGRID_API_KEY=your-sendgrid-api-key
   FROM_EMAIL=noreply@yourdomain.com
   ```
   - Create account at https://sendgrid.com
   - Verify sender email address
   - Generate API key with "Mail Send" permissions

   **Cloudinary (Media Storage):**
   ```env
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```
   Get from: https://cloudinary.com/console

   **Service Configuration:**
   ```env
   NODE_ENV=development
   GYM_SERVICE_PORT=3002
   FRONTEND_URL=http://localhost:3010
   ```

### Required Supabase Tables

Ensure these tables exist in your Supabase database:

- `gym` - Gym profiles and information
- `Gym_plans` - Membership plans
- `gym_plan_trainers` - Trainer assignments to plans
- `trainer_requests` - Trainer approval workflow
- `trainer` - Trainer profiles
- `customer` - Customer/member profiles
- `verifications` - Gym verification requests

### Running the Service

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm start

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Docker Support

```bash
# Build Docker image
docker build -t fitnest-gym-service .

# Run Docker container
docker run -p 3002:3002 --env-file .env fitnest-gym-service
```

## 📧 Email Notifications

The service sends automated emails for:

1. **Subscription Confirmation** - When a customer subscribes to a gym plan
2. **Plan Creation** - When a gym owner creates a new plan
3. **Trainer Assignment** - When trainers are assigned to plans

### Email Templates

All emails use HTML templates with:
- Responsive design
- FitNest branding
- Call-to-action buttons
- Plan/subscription details

### Email Service Class

`GymPlanEmailService.js` provides methods:
- `sendSubscriptionConfirmationEmail()` - For customers
- `sendPlanCreationEmail()` - For gym owners
- `sendTrainerAssignmentEmail()` - For trainers

## 📊 Kafka Events

The service publishes events to Kafka topics:

### Plan Events
- **Topic**: `gym-plans`
- **Events**: 
  - Plan created
  - Plan updated
  - Plan deleted
  - Trainers assigned to plan

### Event Schema
```json
{
  "eventType": "PLAN_CREATED",
  "timestamp": "2025-10-19T10:30:00Z",
  "data": {
    "planId": "123",
    "gymId": "456",
    "planName": "Premium Membership",
    "price": 5000,
    "duration": "1 month"
  }
}
```

## 🛠️ Scripts

The service includes utility scripts:

### Database Integrity Tests
```bash
# Run table smoke tests
node scripts/supabase-tables-smoke.js

# Run write integrity tests
node scripts/supabase-write-integrity.js
```

These scripts verify:
- Table accessibility
- CRUD operations
- Data constraints
- RLS policies

## 📁 Architecture

### Directory Structure

```
backend/GymService/
├── controllers/                 # Request handlers
│   ├── gym.controller.js       # Gym CRUD operations
│   ├── plans.controller.js     # Plan management
│   └── subscription.email.controller.js  # Email notifications
├── services/                   # Business logic layer
│   ├── gym.service.js         # Gym service logic
│   ├── plans.service.js       # Plan service logic
│   └── GymPlanEmailService.js # Email service with SendGrid
├── database/                   # Database configuration
│   └── supabase.js            # Supabase client setup
├── kafka/                      # Message queue
│   └── Producer.js            # Kafka producer for events
├── config/                     # Configuration files
│   └── Kafka.js               # Kafka connection config
├── routes/                     # Route definitions
│   └── subscription.email.routes.js
├── scripts/                    # Utility scripts
│   ├── supabase-tables-smoke.js      # Table accessibility tests
│   └── supabase-write-integrity.js   # CRUD integrity tests
├── __tests__/                  # Test files
│   ├── gym.controller.test.js
│   ├── gym.http.int.test.js
│   ├── gym.service.test.js
│   ├── plans.controller.test.js
│   ├── plans.http.int.test.js
│   └── plans.service.test.js
├── index.js                    # Application entry point
├── jest.config.cjs             # Jest test configuration
├── babel.config.json           # Babel transpiler config
├── test-setup.js               # Test environment setup
├── ca.pem                      # Kafka SSL certificate
├── Dockerfile                  # Docker containerization
├── .env.example                # Environment template
├── .gitignore                  # Git ignore rules
├── package.json                # Dependencies and scripts
└── README.md                   # This file
```

### Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: Supabase PostgreSQL
- **Message Queue**: Apache Kafka (Aiven)
- **Email Service**: SendGrid
- **Media Storage**: Cloudinary
- **Testing**: Jest, Supertest
- **Transpiler**: Babel (ES6+ support)

### Key Components

1. **Controllers**: Handle HTTP requests, validate input, call services
2. **Services**: Implement business logic, interact with database
3. **Database**: Supabase client for PostgreSQL operations
4. **Kafka**: Event-driven communication with other services
5. **Email Service**: Automated notifications via SendGrid
6. **Tests**: Comprehensive unit and integration test coverage

## 🔒 Security

- ✅ **Environment Variables**: Sensitive data stored in `.env` (not committed)
- ✅ **Service Role Key**: Admin database access (keep secure)
- ✅ **Kafka SSL**: Encrypted communication with certificate authentication
- ✅ **Input Validation**: Request data validation in controllers
- ✅ **Error Handling**: Graceful error responses without exposing internals

## 🐛 Troubleshooting

### Common Issues

**1. Kafka Connection Failed**
```
Error: connect ECONNREFUSED
```
**Solution**: 
- Verify `KAFKA_BROKER` URL and port
- Ensure `ca.pem` certificate is in the root directory
- Check `KAFKA_PASSWORD` is correct

**2. SendGrid Email Not Sent**
```
Error: Unauthorized
```
**Solution**:
- Verify `SENDGRID_API_KEY` is valid
- Ensure `FROM_EMAIL` is verified in SendGrid
- Check API key has "Mail Send" permissions

**3. Supabase Connection Error**
```
Error: Invalid API key
```
**Solution**:
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Check network connectivity
- Ensure Supabase project is active

**4. Cloudinary Upload Failed**
```
Error: Invalid credentials
```
**Solution**:
- Verify `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`
- Check account is active

## 📈 Performance

- **Pagination**: Implemented for large data sets (gyms, plans)
- **Indexing**: Database indexes on frequently queried fields
- **Caching**: Consider implementing Redis for frequent queries
- **Async Operations**: Non-blocking I/O for database and external services

## 🤝 Contributing

1. Write tests for new features (maintain >80% coverage)
2. Follow existing code patterns and conventions
3. Update documentation for API changes
4. Use meaningful commit messages
5. Test email notifications in staging before production

## 📚 Related Documentation

- [Supabase Documentation](https://supabase.com/docs)
- [Apache Kafka](https://kafka.apache.org/documentation/)
- [SendGrid API](https://docs.sendgrid.com/)
- [Cloudinary API](https://cloudinary.com/documentation)
- [Jest Testing](https://jestjs.io/docs/getting-started)

## 📄 License

ISC