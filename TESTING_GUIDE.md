# FitNest Backend Testing Guide

## Overview
This document provides a comprehensive guide to the Jest testing setup implemented for the FitNest microservices architecture. It covers the configuration, file structure, and best practices for testing different types of functions.

## Table of Contents
1. [Testing Setup and Configuration](#testing-setup-and-configuration)
2. [File Structure](#file-structure)
3. [How It Works](#how-it-works)
4. [Testing Guidelines](#testing-guidelines)
5. [Testing Patterns](#testing-patterns)
6. [Running Tests](#running-tests)
7. [Examples](#examples)
8. [Best Practices](#best-practices)

## Testing Setup and Configuration

### Dependencies Installed
```json
{
  "devDependencies": {
    "@babel/core": "^7.28.3",
    "@babel/preset-env": "^7.28.3",
    "@types/jest": "^30.0.0",
    "babel-jest": "^30.1.2",
    "jest": "^30.1.3",
    "supertest": "^7.1.4"
  }
}
```

### Configuration Files

#### 1. `jest.config.js` (Root Configuration)
```javascript
module.exports = {
  projects: [
    {
      displayName: "Backend Services",
      testMatch: ["<rootDir>/backend/**/__tests__/**/*.test.js"],
      testEnvironment: "node",
      testTimeout: 30000,
      transform: {
        "^.+\\.jsx?$": "babel-jest"
      },
      setupFilesAfterEnv: ["<rootDir>/test-setup.js"],
      collectCoverageFrom: [
        "backend/**/*.js",
        "!backend/**/node_modules/**",
        "!backend/**/__tests__/**",
        "!backend/**/jest.config.js"
      ]
    }
  ],
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  coverageReporters: ["text", "lcov", "html"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  moduleFileExtensions: ["js", "jsx", "ts", "tsx", "json", "node"],
  verbose: true
};
```

**Key Features:**
- **Multi-project setup**: Supports testing multiple microservices
- **Coverage reporting**: Generates HTML, LCOV, and text reports
- **Babel transformation**: Handles ES6+ syntax
- **Test timeout**: 30 seconds for database operations
- **Environment mocking**: Loads test-setup.js before each test

#### 2. `babel.config.json` (Babel Configuration)
```json
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "targets": {
          "node": "current"
        }
      }
    ]
  ]
}
```

#### 3. `test-setup.js` (Environment Mocking)
```javascript
// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'https://test-project.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.STRIPE_SECRET_KEY = 'sk_test_123456789';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
```

## File Structure
```
FitNest/
├── jest.config.js                    # Root Jest configuration
├── babel.config.json                 # Babel configuration
├── test-setup.js                     # Global test setup and mocks
├── package.json                      # Dependencies and scripts
└── backend/
    ├── AuthService/
    │   └── __tests__/
    │       ├── auth.controller.test.js      # Mock tests (working)
    │       └── AuthController.test.js       # Integration tests (needs fixing)
    ├── GymService/
    │   └── __tests__/
    │       ├── gym.service.mock.test.js     # Mock tests (working)
    │       └── gym.controller.test.js       # Integration tests (needs fixing)
    ├── UserService/
    │   └── __tests__/
    │       ├── user.service.mock.test.js    # Mock tests (working)
    │       └── user.controller.test.js      # Integration tests (needs fixing)
    └── ... (other services)
```

## How It Works

### 1. Test Discovery
- Jest automatically finds files matching the pattern: `backend/**/__tests__/**/*.test.js`
- Tests are organized by service in their respective `__tests__` directories

### 2. Environment Setup
- `test-setup.js` runs before each test suite
- Environment variables are mocked to prevent actual API calls
- Console methods are mocked to reduce test output noise

### 3. Code Transformation
- Babel transforms ES6+ syntax to CommonJS for Jest compatibility
- Handles `import/export` statements in your controllers

### 4. Coverage Collection
- Tracks code coverage across all backend services
- Excludes test files, node_modules, and configuration files
- Generates reports in multiple formats

## Testing Guidelines

### 1. Testing Logical Functions

**For Pure Functions (no side effects):**
```javascript
// Example: Testing a validation function
describe('User Validation', () => {
  test('should validate email format', () => {
    const validateEmail = (email) => {
      return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
    };

    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('invalid-email')).toBe(false);
  });

  test('should calculate BMI correctly', () => {
    const calculateBMI = (weight, height) => {
      return weight / (height * height);
    };

    const bmi = calculateBMI(70, 1.75); // 70kg, 1.75m
    expect(bmi).toBeCloseTo(22.86, 2);
  });
});
```

**For Business Logic Functions:**
```javascript
// Example: Testing gym membership logic
describe('Membership Logic', () => {
  test('should calculate membership fee with discount', () => {
    const calculateFee = (basePrice, membershipType, hasDiscount) => {
      let fee = basePrice;
      
      if (membershipType === 'premium') {
        fee *= 1.5;
      }
      
      if (hasDiscount) {
        fee *= 0.9; // 10% discount
      }
      
      return fee;
    };

    expect(calculateFee(100, 'basic', false)).toBe(100);
    expect(calculateFee(100, 'premium', false)).toBe(150);
    expect(calculateFee(100, 'premium', true)).toBe(135);
  });
});
```

### 2. Testing Database Functions

**Using Mocks (Recommended for Unit Tests):**
```javascript
// Mock the database module
jest.mock('../database/supabase.js', () => ({
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({
        data: [{ id: 1, name: 'Test Gym', location: 'Test Location' }],
        error: null
      }))
    })),
    insert: jest.fn(() => Promise.resolve({
      data: [{ id: 1, name: 'New Gym' }],
      error: null
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({
        data: [{ id: 1, name: 'Updated Gym' }],
        error: null
      }))
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({
        data: [],
        error: null
      }))
    }))
  }))
}));

describe('Gym Database Operations', () => {
  test('should fetch gym by id', async () => {
    const { getGymById } = require('../services/gym.service');
    
    const result = await getGymById(1);
    
    expect(result).toEqual(
      expect.objectContaining({
        id: 1,
        name: 'Test Gym',
        location: 'Test Location'
      })
    );
  });

  test('should handle database errors', async () => {
    // Mock a database error
    const supabase = require('../database/supabase.js');
    supabase.from.mockReturnValueOnce({
      select: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({
          data: null,
          error: { message: 'Database connection failed' }
        }))
      }))
    });

    const { getGymById } = require('../services/gym.service');
    
    await expect(getGymById(1)).rejects.toThrow('Database connection failed');
  });
});
```

**Using Test Database (For Integration Tests):**
```javascript
// Example with a test database setup
describe('Gym Service Integration Tests', () => {
  let testDb;

  beforeAll(async () => {
    // Setup test database connection
    testDb = await createTestDatabaseConnection();
    await testDb.migrate.latest();
  });

  afterAll(async () => {
    // Cleanup
    await testDb.migrate.rollback();
    await testDb.destroy();
  });

  beforeEach(async () => {
    // Clean and seed test data
    await testDb('gyms').del();
    await testDb('gyms').insert([
      { id: 1, name: 'Test Gym', location: 'Test Location' }
    ]);
  });

  test('should create a new gym', async () => {
    const gymData = {
      name: 'New Gym',
      location: 'New Location',
      facilities: ['Cardio', 'Weights']
    };

    const result = await createGym(gymData);

    expect(result.id).toBeDefined();
    expect(result.name).toBe('New Gym');

    // Verify in database
    const saved = await testDb('gyms').where({ id: result.id }).first();
    expect(saved).toBeTruthy();
    expect(saved.name).toBe('New Gym');
  });
});
```

### 3. Testing API Endpoints

**Using Supertest:**
```javascript
const request = require('supertest');
const app = require('../index'); // Your Express app

describe('Gym API Endpoints', () => {
  test('GET /api/gyms should return list of gyms', async () => {
    const response = await request(app)
      .get('/api/gyms')
      .expect(200);

    expect(response.body).toHaveProperty('gyms');
    expect(Array.isArray(response.body.gyms)).toBe(true);
  });

  test('POST /api/gyms should create a new gym', async () => {
    const gymData = {
      name: 'Test Gym',
      location: 'Test Location',
      facilities: ['Cardio', 'Weights']
    };

    const response = await request(app)
      .post('/api/gyms')
      .send(gymData)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('Test Gym');
  });

  test('POST /api/gyms should return 400 for invalid data', async () => {
    const invalidData = {
      name: '', // Empty name
      location: 'Test Location'
    };

    const response = await request(app)
      .post('/api/gyms')
      .send(invalidData)
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });
});
```

### 4. Testing Authentication Functions

```javascript
// Mock JWT and bcrypt
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mocked-jwt-token'),
  verify: jest.fn(() => ({ userId: 1, email: 'test@example.com' }))
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(() => Promise.resolve('hashed-password')),
  compare: jest.fn(() => Promise.resolve(true))
}));

describe('Authentication Service', () => {
  test('should generate JWT token for valid user', async () => {
    const { generateToken } = require('../services/auth.service');
    
    const user = { id: 1, email: 'test@example.com' };
    const token = await generateToken(user);
    
    expect(token).toBe('mocked-jwt-token');
  });

  test('should hash password correctly', async () => {
    const { hashPassword } = require('../services/auth.service');
    
    const hashedPassword = await hashPassword('plainpassword');
    
    expect(hashedPassword).toBe('hashed-password');
  });
});
```

## Testing Patterns

### 1. Arrange-Act-Assert Pattern
```javascript
test('should calculate total price with tax', () => {
  // Arrange
  const basePrice = 100;
  const taxRate = 0.1;
  
  // Act
  const totalPrice = calculateTotalPrice(basePrice, taxRate);
  
  // Assert
  expect(totalPrice).toBe(110);
});
```

### 2. Testing Async Functions
```javascript
test('should fetch user data', async () => {
  const userData = await fetchUserById(1);
  expect(userData).toEqual(
    expect.objectContaining({
      id: 1,
      email: expect.any(String)
    })
  );
});
```

### 3. Testing Error Handling
```javascript
test('should throw error for invalid input', async () => {
  await expect(createUser(null)).rejects.toThrow('User data is required');
});
```

### 4. Using Test Data Builders
```javascript
const createTestUser = (overrides = {}) => ({
  id: 1,
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  ...overrides
});

test('should update user profile', () => {
  const user = createTestUser({ firstName: 'Jane' });
  expect(user.firstName).toBe('Jane');
});
```

## Running Tests

### Commands
```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests for a specific service
npm test -- backend/GymService

# Run a specific test file
npm test -- gym.service.mock.test.js

# Run tests matching a pattern
npm test -- --testNamePattern="should validate"
```

### Test Output
```bash
# Example output
 PASS  Backend Services  backend/GymService/__tests__/gym.service.mock.test.js
  GymService Unit Tests
    ✓ should pass basic test (15 ms)
    ✓ should validate gym data structure (2 ms)
    ✓ should mock gym creation functionality (4 ms)
    ✓ should mock gym search functionality (4 ms)
    ✓ should handle async operations (1 ms)

Test Suites: 3 passed, 3 total
Tests:       14 passed, 14 total
Snapshots:   0 total
Time:        2.5s
```

## Examples

### Complete Service Test Example
```javascript
// backend/PaymentService/__tests__/payment.service.test.js
const PaymentService = require('../services/payment.service');

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn(() => ({
    charges: {
      create: jest.fn()
    },
    customers: {
      create: jest.fn()
    }
  }));
});

describe('Payment Service', () => {
  let paymentService;

  beforeEach(() => {
    paymentService = new PaymentService();
    jest.clearAllMocks();
  });

  describe('processPayment', () => {
    test('should process payment successfully', async () => {
      // Mock successful Stripe charge
      const mockCharge = {
        id: 'ch_123',
        amount: 5000,
        status: 'succeeded'
      };
      
      paymentService.stripe.charges.create.mockResolvedValue(mockCharge);

      const paymentData = {
        amount: 5000,
        currency: 'usd',
        source: 'tok_visa'
      };

      const result = await paymentService.processPayment(paymentData);

      expect(result).toEqual({
        success: true,
        chargeId: 'ch_123',
        amount: 5000
      });

      expect(paymentService.stripe.charges.create).toHaveBeenCalledWith({
        amount: 5000,
        currency: 'usd',
        source: 'tok_visa'
      });
    });

    test('should handle payment failure', async () => {
      const mockError = new Error('Your card was declined');
      paymentService.stripe.charges.create.mockRejectedValue(mockError);

      const paymentData = {
        amount: 5000,
        currency: 'usd',
        source: 'tok_chargeDeclined'
      };

      await expect(paymentService.processPayment(paymentData))
        .rejects.toThrow('Your card was declined');
    });
  });

  describe('validatePaymentData', () => {
    test('should validate required fields', () => {
      const invalidData = { amount: 0 };
      
      expect(() => paymentService.validatePaymentData(invalidData))
        .toThrow('Amount must be greater than 0');
    });

    test('should pass validation for valid data', () => {
      const validData = {
        amount: 5000,
        currency: 'usd',
        source: 'tok_visa'
      };

      expect(() => paymentService.validatePaymentData(validData))
        .not.toThrow();
    });
  });
});
```

## Best Practices

### 1. Test Organization
- **Group related tests**: Use `describe` blocks to organize tests by functionality
- **Clear test names**: Use descriptive names that explain what is being tested
- **One assertion per test**: Keep tests focused and specific

### 2. Mocking Strategy
- **Mock external dependencies**: APIs, databases, third-party services
- **Use dependency injection**: Makes testing easier by allowing mock injection
- **Mock at the right level**: Mock close to the boundary (database, HTTP calls)

### 3. Test Data Management
- **Use factories**: Create test data builders for consistent test objects
- **Isolate tests**: Each test should be independent and not affect others
- **Clean up**: Use `beforeEach` and `afterEach` to reset state

### 4. Coverage Guidelines
- **Aim for 80%+ coverage**: Focus on critical business logic
- **Don't chase 100%**: Focus on meaningful tests, not just coverage numbers
- **Test edge cases**: Include error conditions and boundary values

### 5. Performance
- **Keep tests fast**: Mock slow operations (database, network calls)
- **Run tests in parallel**: Jest runs tests concurrently by default
- **Use test databases**: Separate test data from development data

### 6. Maintenance
- **Refactor test code**: Apply same quality standards as production code
- **Update tests with code changes**: Keep tests synchronized with implementation
- **Review test failures**: Understand why tests fail before fixing them

This testing setup provides a solid foundation for maintaining high-quality code in your FitNest application. Start with simple unit tests and gradually add more complex integration tests as your application grows.
