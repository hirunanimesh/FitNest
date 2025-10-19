# FitNest API Gateway

The API Gateway serves as the single entry point for all client requests in the FitNest microservices architecture. It handles request routing, load balancing, authentication, rate limiting, and provides a unified interface for all backend services.

## 🏗️ Architecture

```
Frontend (localhost:3010)
    ↓
API Gateway (localhost:3000)
    ↓
    ├─→ Auth Service (localhost:3001)
    ├─→ Gym Service (localhost:3002)
    ├─→ Payment Service (localhost:3003)
    ├─→ User Service (localhost:3004)
    ├─→ Trainer Service (localhost:3005)
    └─→ Admin Service (localhost:3006)
```

## 📋 Features

- ✅ **Centralized Routing**: Single entry point for all microservices
- ✅ **Request Proxying**: Routes requests to appropriate backend services
- ✅ **CORS Handling**: Manages cross-origin resource sharing
- ✅ **Rate Limiting**: Protects services from abuse and DDoS
- ✅ **Health Monitoring**: Tracks health status of all services
- ✅ **Error Handling**: Unified error responses
- ✅ **Request Logging**: Comprehensive logging for debugging
- ✅ **Authentication Middleware**: JWT token validation
- ✅ **Load Balancing**: Distributes traffic across service instances

## 🚀 How It Works

1. **Frontend** makes a request to `http://localhost:3000/api/auth/login`
2. **API Gateway** receives the request
3. **Gateway** validates the request and applies middleware (CORS, rate limiting, etc.)
4. **Gateway** proxies the request to **Auth Service** at `http://localhost:3001`
5. **Auth Service** processes the request and returns a response
6. **Gateway** forwards the response back to the **Frontend**
7. **Logging middleware** records the transaction

## 📦 Setup and Installation

### 1. Install Dependencies
```bash
cd backend/apigateway
npm install
```

### 2. Environment Configuration

Create a `.env` file from the template:
```bash
cp .env.example .env
```

Configure the following variables in `.env`:

```env
# API Gateway Configuration
PORT=3000
NODE_ENV=development

# Microservice URLs (Development)
AUTH_SERVICE_URL=http://localhost:3001
GYM_SERVICE_URL=http://localhost:3002
PAYMENT_SERVICE_URL=http://localhost:3003
USER_SERVICE_URL=http://localhost:3004
TRAINER_SERVICE_URL=http://localhost:3005
ADMIN_SERVICE_URL=http://localhost:3006

# Frontend URL
FRONTEND_URL=http://localhost:3010

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000    # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100    # Max requests per window

# CORS Configuration
CORS_ORIGINS=http://localhost:3010,http://localhost:3000
```

### 3. Start the Services

#### Option 1: Start All Services Individually

```bash
# Terminal 1 - Auth Service
cd backend/AuthService
npm start

# Terminal 2 - Gym Service
cd backend/GymService
npm start

# Terminal 3 - Payment Service
cd backend/PaymentService
npm start

# Terminal 4 - User Service
cd backend/UserService
npm start

# Terminal 5 - Trainer Service
cd backend/TrainerService
npm start

# Terminal 6 - Admin Service
cd backend/AdminService
npm start

# Terminal 7 - API Gateway (Start this last)
cd backend/apigateway
npm start
```

#### Option 2: Using Docker Compose

```bash
# From project root
docker-compose up --build
```

#### Option 3: Using VS Code Tasks

1. Open the project in VS Code
2. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
3. Type "Tasks: Run Task"
4. Select "🚀 Start All Microservices"

## 🔗 Available Endpoints

### Gateway Health Check
- **GET** `http://localhost:3000/health`
  - Returns health status of API Gateway and all connected services

### Authentication Service (`/api/auth/*`)
All requests to `/api/auth/*` are proxied to Auth Service (Port 3001)

- **POST** `/api/auth/signup` - User registration
- **POST** `/api/auth/login` - User login
- **POST** `/api/auth/logout` - User logout
- **POST** `/api/auth/refresh` - Refresh JWT token
- **GET** `/api/auth/profile/:id` - Get user profile
- **PUT** `/api/auth/profile/:id` - Update user profile
- **POST** `/api/auth/google` - Google OAuth authentication
- **GET** `/api/auth/health` - Auth service health check

### User Service (`/api/user/*`)
All requests to `/api/user/*` are proxied to User Service (Port 3004)

- **GET** `/api/user/profile/:id` - Get user profile
- **PUT** `/api/user/profile/:id` - Update user profile
- **GET** `/api/user/subscriptions/:userId` - Get user subscriptions
- **POST** `/api/user/weight` - Track weight entry
- **GET** `/api/user/weight/:userId` - Get weight history
- **GET** `/api/user/weight/latest/:userId` - Get latest weight
- **DELETE** `/api/user/weight/:id` - Delete weight entry

### Gym Service (`/api/gym/*`)
All requests to `/api/gym/*` are proxied to Gym Service (Port 3002)

- **GET** `/api/gym` - Get all gyms (with filters)
- **GET** `/api/gym/:id` - Get gym by ID
- **POST** `/api/gym` - Create new gym (Auth required)
- **PUT** `/api/gym/:id` - Update gym (Auth required)
- **DELETE** `/api/gym/:id` - Delete gym (Auth required)
- **GET** `/api/gym/:id/plans` - Get gym plans
- **POST** `/api/gym/:id/plans` - Create gym plan (Auth required)
- **GET** `/api/gym/:id/trainers` - Get gym trainers
- **POST** `/api/gym/:id/trainers` - Assign trainer to gym

### Trainer Service (`/api/trainer/*`)
All requests to `/api/trainer/*` are proxied to Trainer Service (Port 3005)

- **GET** `/api/trainer` - Get all trainers
- **GET** `/api/trainer/:id` - Get trainer by ID
- **POST** `/api/trainer` - Create trainer profile (Auth required)
- **PUT** `/api/trainer/:id` - Update trainer profile (Auth required)
- **GET** `/api/trainer/:id/plans` - Get trainer plans
- **POST** `/api/trainer/:id/plans` - Create training plan (Auth required)
- **GET** `/api/trainer/:id/sessions` - Get trainer sessions
- **POST** `/api/trainer/:id/sessions` - Create session (Auth required)

### Payment Service (`/api/payment/*`)
All requests to `/api/payment/*` are proxied to Payment Service (Port 3003)

- **POST** `/api/payment/create-checkout-session` - Create Stripe checkout
- **POST** `/api/payment/webhook` - Stripe webhook handler
- **GET** `/api/payment/subscription/:id` - Get subscription details
- **POST** `/api/payment/cancel-subscription` - Cancel subscription
- **GET** `/api/payment/history/:userId` - Get payment history

### Admin Service (`/api/admin/*`)
All requests to `/api/admin/*` are proxied to Admin Service (Port 3006)

- **GET** `/api/admin/users` - Get all users (Admin only)
- **GET** `/api/admin/gyms/pending` - Get pending gym verifications
- **POST** `/api/admin/gyms/verify/:id` - Verify gym (Admin only)
- **GET** `/api/admin/trainers/pending` - Get pending trainer verifications
- **POST** `/api/admin/trainers/verify/:id` - Verify trainer (Admin only)
- **GET** `/api/admin/analytics` - Get platform analytics
- **GET** `/api/admin/reports` - Get user reports
- **POST** `/api/admin/chat` - Admin chatbot interaction

## 💻 Frontend Integration

### Using Fetch API

```javascript
// Base URL
const API_BASE_URL = 'http://localhost:3000';

// Authentication - Signup
const signup = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Important for cookies
    body: JSON.stringify({
      email: userData.email,
      password: userData.password,
      role: userData.role,
      firstName: userData.firstName,
      lastName: userData.lastName
    })
  });
  return await response.json();
};

// Authentication - Login
const login = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password
    })
  });
  return await response.json();
};

// Get Gyms with Authentication
const getGyms = async (token) => {
  const response = await fetch(`${API_BASE_URL}/api/gym`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  });
  return await response.json();
};

// Create Subscription
const createSubscription = async (subscriptionData, token) => {
  const response = await fetch(`${API_BASE_URL}/api/payment/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(subscriptionData)
  });
  return await response.json();
};
```

### Using Axios

```javascript
import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Example: Get user profile
const getUserProfile = async (userId) => {
  try {
    const response = await api.get(`/api/user/profile/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};
```

## 🔧 Adding New Services

To add a new microservice to the API Gateway:

### 1. Create Proxy Configuration

Create a new proxy file in `src/proxies/` (e.g., `newServiceProxy.js`):

```javascript
import { createProxyMiddleware } from 'http-proxy-middleware';
import config from '../config/index.js';

const newServiceProxy = createProxyMiddleware({
  target: config.services.newService, // http://localhost:3007
  changeOrigin: true,
  pathRewrite: {
    '^/api/newservice': '' // Remove /api/newservice prefix
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[Proxy] ${req.method} ${req.url} -> ${config.services.newService}`);
  },
  onError: (err, req, res) => {
    console.error('[Proxy Error]', err);
    res.status(502).json({
      error: 'Service Unavailable',
      message: 'New Service is currently unavailable'
    });
  }
});

export default newServiceProxy;
```

### 2. Update Configuration

Add the service URL to `src/config/index.js`:

```javascript
const config = {
  port: process.env.PORT || 3000,
  services: {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    gym: process.env.GYM_SERVICE_URL || 'http://localhost:3002',
    payment: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3003',
    user: process.env.USER_SERVICE_URL || 'http://localhost:3004',
    trainer: process.env.TRAINER_SERVICE_URL || 'http://localhost:3005',
    admin: process.env.ADMIN_SERVICE_URL || 'http://localhost:3006',
    newService: process.env.NEW_SERVICE_URL || 'http://localhost:3007' // Add this
  }
};
```

### 3. Register Route in Main File

Add the route in `index.js`:

```javascript
import newServiceProxy from './src/proxies/newServiceProxy.js';

// ... other proxies ...

app.use('/api/newservice', newServiceProxy);
```

### 4. Update Environment Variables

Add to `.env`:
```env
NEW_SERVICE_URL=http://localhost:3007
```

### 5. Update Health Check (Optional)

Add service to health monitoring in `src/utils/serviceHealth.js`:

```javascript
const services = [
  { name: 'Auth', url: config.services.auth },
  { name: 'Gym', url: config.services.gym },
  // ... other services ...
  { name: 'NewService', url: config.services.newService }
];
```

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Test Types

1. **Unit Tests**: Test individual proxy configurations and middleware
2. **Integration Tests**: Test end-to-end request routing through gateway
3. **Health Check Tests**: Verify service health monitoring

### Example Test

```javascript
import request from 'supertest';
import app from '../index.js';

describe('API Gateway', () => {
  test('should proxy auth requests', async () => {
    const response = await request(app)
      .get('/api/auth/health')
      .expect(200);
    
    expect(response.body).toHaveProperty('status');
  });
});
```

## 🛡️ Middleware

### CORS Middleware
Configured to allow requests from specified origins:

```javascript
const corsOptions = {
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3010'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

### Rate Limiting
Protects against DDoS and brute force attacks:

```javascript
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 900000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
```

### Request Logging
Logs all requests for debugging and monitoring:

```javascript
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
```

### Error Handling
Centralized error handling for all services:

```javascript
app.use((err, req, res, next) => {
  console.error('[Error]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    path: req.url,
    timestamp: new Date().toISOString()
  });
});
```

## 📊 Monitoring & Health Checks

### Gateway Health Endpoint

```bash
GET http://localhost:3000/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-19T10:30:00.000Z",
  "services": {
    "auth": "healthy",
    "gym": "healthy",
    "payment": "healthy",
    "user": "healthy",
    "trainer": "healthy",
    "admin": "healthy"
  },
  "uptime": 3600
}
```

### Service Health Monitoring

The gateway periodically checks the health of all connected services:

```javascript
// Health check every 30 seconds
setInterval(async () => {
  const healthStatus = await checkAllServices();
  console.log('Service Health:', healthStatus);
}, 30000);
```

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Docker Deployment

**Build Docker Image:**
```bash
docker build -t fitnest-api-gateway .
```

**Run Docker Container:**
```bash
docker run -p 3000:3000 \
  -e AUTH_SERVICE_URL=http://auth-service:3001 \
  -e GYM_SERVICE_URL=http://gym-service:3002 \
  -e PAYMENT_SERVICE_URL=http://payment-service:3003 \
  -e USER_SERVICE_URL=http://user-service:3004 \
  -e TRAINER_SERVICE_URL=http://trainer-service:3005 \
  -e ADMIN_SERVICE_URL=http://admin-service:3006 \
  fitnest-api-gateway
```

### Docker Compose

```yaml
version: '3.8'
services:
  api-gateway:
    build: ./backend/apigateway
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - AUTH_SERVICE_URL=http://auth-service:3001
      - GYM_SERVICE_URL=http://gym-service:3002
      - PAYMENT_SERVICE_URL=http://payment-service:3003
      - USER_SERVICE_URL=http://user-service:3004
      - TRAINER_SERVICE_URL=http://trainer-service:3005
      - ADMIN_SERVICE_URL=http://admin-service:3006
    depends_on:
      - auth-service
      - gym-service
      - payment-service
      - user-service
      - trainer-service
      - admin-service
```

### Environment-Specific Configuration

**Production `.env`:**
```env
PORT=3000
NODE_ENV=production
AUTH_SERVICE_URL=https://auth.fitnest.com
GYM_SERVICE_URL=https://gym.fitnest.com
PAYMENT_SERVICE_URL=https://payment.fitnest.com
USER_SERVICE_URL=https://user.fitnest.com
TRAINER_SERVICE_URL=https://trainer.fitnest.com
ADMIN_SERVICE_URL=https://admin.fitnest.com
FRONTEND_URL=https://fitnest.com
CORS_ORIGINS=https://fitnest.com,https://www.fitnest.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📁 Project Structure

```
apigateway/
├── index.js                    # Main application entry point
├── package.json                # Dependencies and scripts
├── .env                        # Environment variables (not committed)
├── .env.example                # Environment template
├── Dockerfile                  # Docker configuration
├── jest.config.js              # Jest test configuration
├── README.md                   # This file
├── src/
│   ├── config/
│   │   └── index.js           # Configuration management
│   ├── middleware/
│   │   └── logging.js         # Request logging middleware
│   ├── proxies/
│   │   ├── authProxy.js       # Auth service proxy
│   │   ├── gymProxy.js        # Gym service proxy
│   │   ├── paymentProxy.js    # Payment service proxy
│   │   ├── userProxy.js       # User service proxy
│   │   ├── trainerProxy.js    # Trainer service proxy
│   │   └── adminProxy.js      # Admin service proxy
│   ├── utils/
│   │   └── serviceHealth.js   # Service health monitoring
│   └── __tests__/              # Test files
│       ├── auth.proxy.int.test.js
│       ├── gym.proxy.int.test.js
│       └── ...
└── coverage/                   # Test coverage reports
```

## 🔐 Security Features

- ✅ **CORS Protection**: Restricts origins that can access the API
- ✅ **Rate Limiting**: Prevents brute force and DDoS attacks
- ✅ **Helmet**: Adds security headers
- ✅ **JWT Validation**: Verifies authentication tokens
- ✅ **Input Sanitization**: Cleans incoming requests
- ✅ **HTTPS**: Enforced in production
- ✅ **Environment Variables**: Sensitive data not hardcoded

## ⚙️ Configuration Options

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Gateway server port |
| `NODE_ENV` | development | Environment mode |
| `AUTH_SERVICE_URL` | http://localhost:3001 | Auth service endpoint |
| `GYM_SERVICE_URL` | http://localhost:3002 | Gym service endpoint |
| `PAYMENT_SERVICE_URL` | http://localhost:3003 | Payment service endpoint |
| `USER_SERVICE_URL` | http://localhost:3004 | User service endpoint |
| `TRAINER_SERVICE_URL` | http://localhost:3005 | Trainer service endpoint |
| `ADMIN_SERVICE_URL` | http://localhost:3006 | Admin service endpoint |
| `FRONTEND_URL` | http://localhost:3010 | Frontend application URL |
| `CORS_ORIGINS` | http://localhost:3010 | Allowed CORS origins (comma-separated) |
| `RATE_LIMIT_WINDOW_MS` | 900000 | Rate limit window (15 minutes) |
| `RATE_LIMIT_MAX_REQUESTS` | 100 | Max requests per window |
| `JWT_SECRET` | - | Secret key for JWT validation |

## 🐛 Troubleshooting

### Common Issues

**1. Service Unavailable Errors**
```
Error: connect ECONNREFUSED 127.0.0.1:3001
```
**Solution**: Ensure all backend services are running before starting the gateway.

**2. CORS Errors**
```
Access to fetch blocked by CORS policy
```
**Solution**: Add your frontend URL to `CORS_ORIGINS` in `.env`

**3. Rate Limit Exceeded**
```
Too many requests from this IP
```
**Solution**: Wait for the rate limit window to reset or increase `RATE_LIMIT_MAX_REQUESTS`

**4. Port Already in Use**
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution**: Change `PORT` in `.env` or kill the process using port 3000

### Debug Mode

Enable detailed logging:
```env
NODE_ENV=development
LOG_LEVEL=debug
```

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware)
- [Microservices Architecture](https://microservices.io/)
- [API Gateway Pattern](https://microservices.io/patterns/apigateway.html)

## 📄 License

This project is part of the FitNest platform. See the main project README for license information.

## 👥 Support

For issues or questions:
- Check the main FitNest README
- Review service-specific documentation
- Contact the development team
