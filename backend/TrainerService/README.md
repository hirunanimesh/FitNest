# TrainerService

A comprehensive microservice for managing trainer operations in the FitNest platform, including trainer profiles, training sessions, training plans, gym requests, verification, and customer feedback.

## 🌟 Features

- ✅ **Trainer Management**: Create, update, and retrieve trainer profiles with search and pagination
- ✅ **Session Management**: Handle training sessions between trainers and customers
- ✅ **Plan Management**: Create and manage trainer-specific training plans
- ✅ **Session Booking**: Book, hold, and release training sessions with conflict detection
- ✅ **Gym Integration**: Manage trainer requests to join gyms and gym plan assignments
- ✅ **Verification System**: Trainer verification and approval workflow
- ✅ **Feedback System**: Collect and manage customer feedback for trainers
- ✅ **Kafka Integration**: Real-time event streaming for session creation
- ✅ **Cloudinary Integration**: Image and document storage for trainer profiles and plans
- ✅ **Comprehensive Testing**: Full unit and integration test coverage with Jest

## 🏗️ Architecture

```
Frontend/API Gateway
    ↓
Trainer Service (Port 3005)
    ↓
    ├─→ Supabase PostgreSQL (Trainer Data)
    ├─→ Cloudinary (Profile Images & Documents)
    └─→ Kafka (Event Streaming)
         └─→ trainer_session_created (Publish)
              → Consumed by PaymentService
```

## 📋 API Endpoints

### Trainer Management
- `GET /getalltrainers` - Get all trainers with pagination and search
  - Query params: `page`, `limit`, `search`
  - Example: `GET /getalltrainers?page=1&limit=12&search=yoga`
- `GET /gettrainerbyid/:trainerId` - Get trainer by ID
- `PATCH /updatetrainerdetails/:trainerId` - Update trainer profile
- `GET /getfeedbackbytrainerid/:trainerId` - Get all feedback for a trainer
- `POST /request-verification` - Request trainer verification

### Session Management
- `POST /addsession` - Create a new training session
  ```json
  {
    "trainer_id": "trainer_123",
    "customer_id": "cust_456",
    "session_date": "2025-10-20T10:00:00Z",
    "duration": 60,
    "price": 50
  }
  ```
- `GET /getallsessions` - Get all sessions
- `GET /getsessionbysessionid/:sessionId` - Get session by ID
- `GET /getallsessionbytrainerid/:trainerId` - Get all sessions for a trainer
- `PATCH /updatesession/:sessionId` - Update session details
- `DELETE /deletesession/:sessionId` - Delete a session

### Session Booking
- `POST /booksession` - Book a training session (creates session + triggers payment)
- `POST /holdsession` - Hold a session slot (prevents double booking)
- `POST /releasesession` - Release a held session slot

### Plan Management
- `POST /addplan` - Create a new training plan
  ```json
  {
    "trainer_id": "trainer_123",
    "title": "Weight Loss Program",
    "description": "12-week transformation program",
    "img_url": "https://cloudinary.com/...",
    "instruction_pdf": "https://cloudinary.com/..."
  }
  ```
- `GET /getallplans` - Get all training plans
- `GET /getplanbyid/:planId` - Get plan by ID
- `GET /getallplansbytrainerid/:trainerId` - Get all plans for a trainer
- `PATCH /updateplan/:planId` - Update a training plan
- `DELETE /deleteplan/:planId` - Delete a training plan

### Gym Integration
- `GET /getgymplanbytrainerid/:trainerId` - Get gym plans associated with a trainer
- `GET /getmembershipgyms/:trainerId` - Get gyms where trainer has membership
- `POST /sendrequesttogym` - Send request to join a gym as a trainer
  ```json
  {
    "trainer_id": "trainer_123",
    "gym_id": "gym_456",
    "message": "I would like to join your gym as a fitness trainer"
  }
  ```

### Health Check
- `GET /health` - Service health status
  ```json
  {
    "status": "success",
    "message": "Trainer Service is running",
    "timestamp": "2025-10-19T10:30:00.000Z",
    "service": "TrainerService",
    "version": "1.0.0"
  }
  ```

## 🔧 Setup and Installation

### 1. Install Dependencies
```bash
cd backend/TrainerService
npm install
```

### 2. Environment Configuration

Create a `.env` file from the template:
```bash
cp .env.example .env
```

Configure the following variables in `.env`:

```env
# Server
PORT=3005
NODE_ENV=development

# Supabase (Get from https://app.supabase.com/project/_/settings/api)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Cloudinary (Get from https://cloudinary.com/console)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Kafka
KAFKA_BROKER=your-kafka-broker.com:20377
KAFKA_PASSWORD=your_kafka_password
```

### 3. Start the Service

```bash
# Development
npm start

# Production
NODE_ENV=production npm start
```

## 🧪 Testing

This service includes comprehensive unit and integration tests using Jest and Supertest.

### Test Structure

```
__tests__/
├── trainer.controller.test.js          # Trainer controller integration tests
├── trainer.controller.unit.test.js     # Trainer controller unit tests
├── trainer.service.test.js             # Trainer service business logic tests
├── trainer.http.int.test.js            # HTTP endpoint integration tests
├── session.controller.test.js          # Session controller integration tests
├── session.controller.unit.test.js     # Session controller unit tests
├── session.controller.errors.test.js   # Session error handling tests
├── session.service.test.js             # Session service business logic tests
├── holdsession.conflict.http.test.js   # Session hold conflict detection tests
├── plan.controller.test.js             # Plan controller integration tests
├── plan.controller.unit.test.js        # Plan controller unit tests
├── plan.controller.errors.test.js      # Plan error handling tests
└── plan.service.test.js                # Plan service business logic tests
```

### Running Tests

#### From Repository Root (Recommended)
```bash
# Run all TrainerService tests
npm run test:trainer

# Run with coverage
npx jest --selectProjects "TrainerService Tests" --coverage --colors -i

# Run specific test file
npx jest backend/TrainerService/__tests__/trainer.service.test.js --colors -i
```

#### From TrainerService Directory
```powershell
# Set environment variables first (PowerShell)
$env:SUPABASE_URL = 'http://localhost'
$env:SUPABASE_SERVICE_ROLE_KEY = 'test'

# Run tests
npm test

# Run with coverage
npm run test:coverage
```

### Test Coverage

The test suite covers:

- ✅ **Controllers**: HTTP request/response handling, validation, error scenarios
- ✅ **Services**: Business logic, data transformation, Supabase queries
- ✅ **Session Booking**: Conflict detection, hold/release mechanisms
- ✅ **Error Handling**: Invalid inputs, database errors, missing resources
- ✅ **Kafka Integration**: Event publishing for session creation

Current coverage: **~70%** (Controllers and core business logic)

### Database Test Scripts

Located in `scripts/`:

#### supabase-tables-smoke.js
Validates that all required tables exist and are accessible.

```bash
DOTENV_CONFIG_PATH=.env.test node --loader dotenv/config scripts/supabase-tables-smoke.js
```

**What it tests:**
- Table existence and accessibility
- Row count validation
- Database connectivity

**Expected output:**
```
[tables-smoke:trainer] trainer: OK count=38
[tables-smoke:trainer] trainer_sessions: OK count=52
[tables-smoke:trainer] trainer_plans: OK count=45
[tables-smoke:trainer] trainer_requests: OK count=23
[tables-smoke:trainer] verifications: OK count=15
[tables-smoke:trainer] feedback: OK count=67
[tables-smoke:trainer] done in 342ms. ok=6 fail=0
```

#### supabase-write-integrity.js
Tests CRUD operations and Row-Level Security policies.

```bash
DOTENV_CONFIG_PATH=.env.test node --loader dotenv/config scripts/supabase-write-integrity.js
```

**What it tests:**
- Insert operations with constraint validation
- Update and delete operations
- RLS policies (anonymous access should be denied)
- Data integrity

## 🔄 Kafka Event Publishing

### Published Topics

#### trainer_session_created
Published when a training session is booked.

**Event Payload:**
```json
{
  "session_id": "sess_123",
  "price": 50,
  "createdAt": "2025-10-19T10:30:00.000Z"
}
```

**Consumed by:**
- **PaymentService**: Creates payment intent for the session

## 🔐 Security Features

- ✅ **Row-Level Security (RLS)**: Supabase RLS policies protect trainer data
- ✅ **Input Validation**: All request bodies validated before processing
- ✅ **Environment Variables**: All secrets stored in `.env` (never committed)
- ✅ **CORS Protection**: Configured for allowed origins
- ✅ **Error Handling**: Sensitive information not exposed in error messages
- ✅ **Session Conflict Detection**: Prevents double-booking of trainer sessions

## 💡 Key Features Explained

### Session Hold Mechanism
Prevents double-booking during payment processing:

1. **Hold Session**: When customer initiates booking, session is marked as "held"
2. **Payment Processing**: Customer redirected to payment gateway
3. **Release Session**: If payment fails/cancelled, session released automatically
4. **Confirm Session**: If payment succeeds, session status updated to "confirmed"

### Trainer Verification Flow

1. Trainer requests verification: `POST /request-verification`
2. Admin reviews credentials and documents
3. Admin approves/rejects via AdminService
4. Trainer `verified` status updated in database
5. Only verified trainers can create sessions and plans

## 🐛 Troubleshooting

### Common Issues

**1. Supabase Connection Error**
```
Error: fetch failed
```
**Solution**: Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env`

**2. Cloudinary Upload Failed**
```
Error: Upload failed
```
**Solution**: Check Cloudinary credentials in `.env`

**3. Kafka Connection Error**
```
Error: Connection to Kafka broker failed
```
**Solution**: Verify `KAFKA_BROKER` and `KAFKA_PASSWORD` in `.env`

**4. Session Conflict Error**
```
Error: Trainer already has a session at this time
```
**Solution**: This is expected behavior. Choose a different time slot.

**5. Test Failures**
```
Error: SUPABASE_URL is not defined
```
**Solution**: Run tests from repository root: `npm run test:trainer`

## 🔄 Integration with Other Services

### GymService Integration
- Trainers can request to join gyms
- Gym owners can assign trainers to gym plans
- Reads gym information for trainer dashboard

### PaymentService Integration
- Publishes session creation events via Kafka
- PaymentService creates payment intents for sessions
- Session status updated after payment confirmation

### UserService Integration
- Reads customer information for session booking
- Links feedback to customer accounts

### AdminService Integration
- Verification requests processed by admin
- Admin can approve/reject trainer verifications

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [KafkaJS Documentation](https://kafka.js.org/)
- [Jest Testing Framework](https://jestjs.io/)

## 📄 License

This service is part of the FitNest platform. See the main project README for license information.

## 👥 Support

For issues or questions:
- Check the main FitNest README
- Review test files for usage examples
- Contact the development team

## 🚀 Deployment

### Docker Deployment

Build and run with Docker:
```bash
docker build -t fitnest-trainer-service .
docker run -p 3005:3005 --env-file .env fitnest-trainer-service
```

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use production Supabase credentials
- [ ] Enable RLS policies on all tables
- [ ] Configure production Cloudinary account
- [ ] Set up production Kafka cluster
- [ ] Enable HTTPS/TLS for all communications
- [ ] Set up monitoring and alerting
- [ ] Configure rate limiting for API endpoints
- [ ] Enable backup and disaster recovery
- [ ] Configure CORS for production frontend domain
