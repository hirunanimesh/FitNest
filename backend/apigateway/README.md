# FitNest API Gateway

This is the API Gateway for the FitNest application that routes requests to appropriate microservices.

## Architecture

```
Frontend (localhost:3000) 
    ↓
API Gateway (localhost:5000) 
    ↓
Auth Service (localhost:3001)
```

## How it works

1. Frontend makes requests to `http://localhost:5000/api/auth/*`
2. API Gateway receives the request and proxies it to the Auth Service
3. Auth Service processes the request and sends response back through the gateway
4. Gateway forwards the response to the frontend

## Setup and Running

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Make sure your `.env` file has the correct configuration:
```
API_GATEWAY_PORT=5000
AUTH_SERVICE_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Start the Services

#### Start Auth Service first:
```bash
cd ../AuthService
npm run dev
```

#### Then start API Gateway:
```bash
cd ../apigateway
npm run dev
```

## Available Endpoints

### API Gateway Health Check
- **GET** `http://localhost:5000/health`

### Authentication Endpoints (Proxied to Auth Service)
- **POST** `http://localhost:5000/api/auth/signup`
- **POST** `http://localhost:5000/api/auth/login`
- **GET** `http://localhost:5000/api/auth/health`

## Frontend Integration

From your frontend (Next.js), you can now make requests to:

```javascript
// Signup
const response = await fetch('http://localhost:5000/api/auth/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Important for cookies
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    role: 'user'
  })
});

// Login
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Important for cookies
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});
```

## Adding New Services

To add new microservices, follow this pattern in `index.js`:

```javascript
// New Service Proxy
const newServiceProxy = createProxyMiddleware({
  target: 'http://localhost:3002', // Your service port
  changeOrigin: true,
  pathRewrite: {
    '^/api/newservice': '/api/newservice'
  }
});

app.use('/api/newservice', newServiceProxy);
```
