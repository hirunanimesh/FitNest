# GymService

A microservice for managing gym operations, including gym profiles, plans, trainers, and member management.

## Features

- **Gym Management**: Create, update, and retrieve gym information
- **Plan Management**: Create and manage gym membership plans
- **Trainer Management**: Handle trainer approvals and assignments
- **Member Analytics**: Track member counts and statistics
- **Kafka Integration**: Real-time messaging for plan updates

## API Endpoints

### Gym Management
- `POST /gyms` - Create a new gym
- `GET /gyms` - Get all gyms (with pagination, search, location filters)
- `GET /gyms/:gymId` - Get gym by ID
- `GET /gyms/user/:userId` - Get gym by user ID
- `PUT /gyms/:gymId` - Update gym details
- `GET /gyms/:gymId/members/count` - Get total member count for gym
- `GET /gyms/:gymId/trainers` - Get trainers for gym
- `POST /gyms/trainers/:request_id/approve` - Approve trainer request
- `GET /gyms/:gymId/trainers/count` - Get trainer count for gym
- `POST /gyms/users` - Get all gym users by IDs

### Plan Management
- `POST /plans` - Create a new gym plan
- `GET /plans` - Get all gym plans
- `GET /plans/gym/:gymId` - Get plans by gym ID
- `PUT /plans/:planId` - Update gym plan
- `DELETE /plans/:planId` - Delete gym plan
- `GET /plans/:planId/members/count` - Get member count per plan
- `POST /plans/:planId/trainers` - Assign trainers to plan
- `GET /plans/:planId/trainers` - Get plan trainers
- `PUT /plans/:planId/trainers` - Update plan trainers
- `GET /plans/one-day` - Get one-day gym plans
- `GET /plans/other` - Get non one-day gym plans
- `POST /plans/details` - Get gym plan details by plan IDs

## Testing

This service includes comprehensive unit tests using Jest.

### Test Structure

```
__tests__/
├── gym.controller.test.js      # Tests for gym controller functions
├── plans.controller.test.js    # Tests for plans controller functions
├── gym.service.test.js         # Tests for gym service functions
└── plans.service.test.js       # Tests for plans service functions
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run gym-specific tests
npm run test:gym

# Run plans-specific tests
npm run test:plans

# Run tests in watch mode
npm run test:watch
```

### Test Coverage

The test suite covers:

- **Controllers**: HTTP request/response handling, error scenarios, validation
- **Services**: Database operations, business logic, error handling
- **Integration**: Mocked external dependencies (Supabase, Kafka)

### Test Categories

#### Gym Controller Tests
<<<<<<< Updated upstream
- Gym CRUD operations (create, read, update, delete)
- Member count operations
- Trainer management and approval
- User retrieval by IDs
- Error handling and validation
=======
- Gym creation and validation
- Gym retrieval with various filters
- Gym updates and error handling
- Member count operations
- Trainer management
- User retrieval by IDs
>>>>>>> Stashed changes

#### Plans Controller Tests
- Plan CRUD operations
- Trainer assignment to plans
- Kafka producer integration
- One-day and other gym categorization
- Plan details retrieval

#### Service Layer Tests
- Database query mocking
<<<<<<< Updated upstream
- Business logic validation
- Error handling and edge cases
=======
- Error handling and edge cases
- Business logic validation
>>>>>>> Stashed changes
- External service integration

### Mocking Strategy

- **Supabase**: Mocked for database operations
- **Kafka Producers**: Mocked for message publishing
- **Request/Response**: Mocked Express objects for controller testing

### Test Data

Tests use realistic mock data that mirrors production scenarios:
- Valid gym and plan objects
- Error conditions and edge cases
- Pagination and filtering scenarios
- Trainer and member relationships

## Development

### Prerequisites

- Node.js 20+
- npm or yarn
- Supabase account
- Kafka (for message queuing)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file with:

```env
PORT=3002
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
KAFKA_BROKERS=localhost:9092
```

### Running the Service

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Architecture

### Directory Structure

```
backend/GymService/
├── controllers/          # Request handlers
├── services/            # Business logic
├── database/            # Database configuration
├── kafka/              # Message queue producers
├── __tests__/          # Unit tests
├── index.js            # Application entry point
├── jest.config.js      # Test configuration
├── babel.config.json   # Babel configuration
└── package.json        # Dependencies and scripts
```

### Key Components

- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic and database operations
- **Database**: Supabase client configuration
- **Kafka**: Producers for real-time messaging
- **Tests**: Comprehensive unit test coverage

## Contributing

1. Write tests for new features
2. Ensure test coverage remains above 80%
3. Follow existing code patterns
4. Update documentation as needed

## License

ISC