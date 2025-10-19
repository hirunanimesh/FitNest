# PaymentService

A comprehensive microservice for managing all payment operations in the FitNest platform, including Stripe integration, subscription management, one-time payments, trainer session payments, and financial analytics.

## 🌟 Features

- ✅ **Stripe Integration**: Complete Stripe API integration for payments and subscriptions
- ✅ **Stripe Connect**: Multi-tenant payment platform for gyms and trainers
- ✅ **Subscription Management**: Create, manage, and cancel recurring subscriptions
- ✅ **One-Time Payments**: Handle single payment transactions for gym plans
- ✅ **Session Payments**: Trainer session booking with payment holds and confirmations
- ✅ **Webhook Handling**: Real-time Stripe webhook event processing
- ✅ **Kafka Integration**: Event-driven architecture for plan and session updates
- ✅ **MongoDB Storage**: Persistent storage for payment records and Stripe metadata
- ✅ **Financial Analytics**: Revenue tracking, member statistics, and payment reports
- ✅ **Connected Accounts**: Stripe Connected Account management for gym owners and trainers
- ✅ **Invoice Management**: Retrieve and manage customer invoices
- ✅ **Comprehensive Testing**: Full unit and integration test coverage with Jest

## 🏗️ Architecture

```
Frontend/API Gateway
    ↓
Payment Service (Port 3003)
    ↓
    ├─→ Stripe API (Payment Processing)
    ├─→ MongoDB (Payment Records & Metadata)
    ├─→ Supabase PostgreSQL (User & Plan Data)
    └─→ Kafka (Event Streaming)
         ├─→ gym_plan_created (Subscribe)
         ├─→ gym_plan_deleted (Subscribe)
         ├─→ gym_plan_price_updated (Subscribe)
         └─→ trainer_session_created (Subscribe)
```

## 📋 API Endpoints

### Stripe Account Management
- `POST /create-account/:user_id` - Create a Stripe Connected Account for gym/trainer
- `GET /stripedashboard/:user_id` - Get Stripe Dashboard login link

### Plan Management
- `POST /create-plan` - Create a Stripe product and price for a gym plan
  - Supports recurring subscriptions (monthly, yearly, weekly)
  - Supports one-time payments (1-day plans)

### Subscription Management
- `POST /subscribe` - Create a subscription checkout session
  ```json
  {
    "planId": "plan_123",
    "customer_id": "cust_456",
    "user_id": "user_789",
    "email": "customer@example.com"
  }
  ```
- `POST /cancel-subscription` - Cancel an active subscription
- `GET /getsubscription/:customerId` - Get all subscriptions for a customer
- `GET /getinvoices` - Get customer invoices

### One-Time Payments
- `POST /onetimepayment` - Create checkout session for one-time payment (1-day gym plans)

### Trainer Session Payments
- `POST /sessionpayment` - Create payment session for trainer booking with authorization hold
  ```json
  {
    "session_id": "sess_123",
    "customer_id": "cust_456",
    "trainer_id": "trainer_789",
    "amount": 5000,
    "email": "customer@example.com"
  }
  ```
- `GET /sessionpayment/success` - Handle successful session payment (capture funds)
- `GET /sessionpayment/cancel` - Handle cancelled session payment (release hold)

### Payment Analytics
- `POST /getpayments` - Get all payments for gym owners
- `GET /connectedaccountpayments/:userId` - Get payments for connected account
- `GET /monthlyrevenue/:userId` - Get current month revenue for a gym/trainer
- `GET /getsystemrevenue` - Get total platform revenue (admin)
- `POST /monthlymembers` - Get monthly member count per gym plan

### Customer Management
- `POST /getgymcustomerids` - Get all customer IDs by gym plan IDs (bulk query)

### Webhooks
- `POST /webhook` - Stripe webhook endpoint for real-time event processing
  - Handles: `payment_intent.succeeded`, `payment_intent.payment_failed`
  - Handles: `checkout.session.completed`, `invoice.payment_succeeded`
  - Handles: `customer.subscription.created`, `customer.subscription.deleted`

## 🔧 Setup and Installation

### 1. Install Dependencies
```bash
cd backend/PaymentService
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
PORT=3003
NODE_ENV=development

# Stripe (Get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# MongoDB (Get from https://cloud.mongodb.com/)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority

# Supabase (Get from https://app.supabase.com/project/_/settings/api)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Kafka
KAFKA_BROKER=your-kafka-broker.com:20377
KAFKA_PASSWORD=your_kafka_password

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend Domain
DOMAIN=http://localhost:3010
```

### 3. Stripe Setup

#### Create Stripe Account
1. Sign up at [stripe.com](https://stripe.com)
2. Get your API keys from [Dashboard → API Keys](https://dashboard.stripe.com/test/apikeys)
3. Use **test mode** for development

#### Configure Webhooks
1. Go to [Dashboard → Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Add endpoint: `http://your-domain.com/webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.created`
   - `customer.subscription.deleted`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

#### Enable Stripe Connect
1. Go to [Dashboard → Connect → Settings](https://dashboard.stripe.com/test/connect/accounts/overview)
2. Enable **Standard** or **Express** accounts
3. Configure branding and business information

### 4. MongoDB Setup

1. Create a free cluster at [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a database user with read/write permissions
3. Whitelist your IP address (or use `0.0.0.0/0` for development)
4. Get connection string and update `MONGO_URI`

### 5. Start the Service

```bash
# Development
npm start

# Development with auto-reload
npm run dev

# Production
NODE_ENV=production npm start
```

### 6. Enable Kafka Consumers (Optional)

Uncomment in `index.js`:
```javascript
GymPlanCreatedConsumer()
GymPlanDeletedConsumer()
GymPlanPriceUpdatedConsumer()
TrainerSessionCreatedConsumer()
```

## 🧪 Testing

This service includes comprehensive unit and integration tests using Jest and Supertest.

### Test Structure

```
__tests__/
├── Consumer.test.js                    # Kafka consumer unit tests
├── create-plan.test.js                 # Plan creation logic tests
├── create-session.test.js              # Session payment tests
├── index.test.js                       # Server initialization tests
├── mongo.test.js                       # MongoDB connection tests
├── payment.http.int.test.js            # Payment endpoint integration tests
├── payments.http.int.test.js           # Multiple payment scenarios tests
├── success-session.controller.test.js  # Session success handler tests
└── webhook.controller.test.js          # Stripe webhook tests
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
npm test create-plan.test.js
```

### Test Coverage

The test suite covers:

- ✅ **Controllers**: HTTP request/response handling, validation, error scenarios
- ✅ **Stripe Integration**: Plan creation, subscription, payments, webhooks
- ✅ **Kafka Consumers**: Event processing for gym plans and trainer sessions
- ✅ **MongoDB Operations**: CRUD operations, data integrity
- ✅ **Session Payments**: Authorization holds, captures, cancellations
- ✅ **Error Handling**: Invalid inputs, failed payments, network errors

Current coverage: **~75%** (Controllers and core business logic)

### Mock Testing

Tests use mock implementations for:
- Stripe API calls
- MongoDB operations
- Kafka producers/consumers
- External service calls

See `test-setup.js` for mock configurations.

## 📊 Database Models

### MongoDB Collections

#### 1. stripe_accounts
Stores Stripe Connected Account information for gyms and trainers.
```javascript
{
  user_id: String,           // FitNest user ID
  account_id: String,        // Stripe account ID
  created_at: Date
}
```

#### 2. stripe_customers
Maps FitNest customers to Stripe customer IDs.
```javascript
{
  customer_id: String,       // FitNest customer ID
  stripe_customer_id: String, // Stripe customer ID
  created_at: Date
}
```

#### 3. stripe_plan_data
Maps gym plans to Stripe products and prices.
```javascript
{
  plan_id: String,           // FitNest plan ID
  product_id: String,        // Stripe product ID
  price_id: String,          // Stripe price ID
  created_at: Date
}
```

#### 4. stripe_sessions
Stores trainer session payment information.
```javascript
{
  session_id: String,        // FitNest session ID
  stripe_session_id: String, // Stripe checkout session ID
  stripe_payment_intent: String, // Stripe payment intent ID
  amount: Number,
  status: String,            // 'pending', 'completed', 'cancelled'
  created_at: Date
}
```

## 🔄 Kafka Event Handling

### Subscribed Topics

#### gym_plan_created
Triggered when a new gym plan is created.
```json
{
  "planId": "plan_123",
  "title": "Monthly Membership",
  "price": 50,
  "duration": "1 month"
}
```
**Action**: Creates Stripe product and price, stores mapping in MongoDB.

#### gym_plan_deleted
Triggered when a gym plan is deleted.
```json
{
  "planId": "plan_123"
}
```
**Action**: Archives or deletes Stripe product and removes from MongoDB.

#### gym_plan_price_updated
Triggered when a gym plan price changes.
```json
{
  "planId": "plan_123",
  "newPrice": 60
}
```
**Action**: Creates new Stripe price, updates MongoDB mapping.

#### trainer_session_created
Triggered when a trainer session is booked.
```json
{
  "sessionId": "sess_123",
  "trainerId": "trainer_456",
  "customerId": "cust_789",
  "amount": 5000
}
```
**Action**: Creates payment intent for session booking.

## 💰 Payment Flow

### Subscription Flow
1. Customer selects gym plan on frontend
2. Frontend calls `/subscribe` with plan and customer details
3. PaymentService creates Stripe checkout session
4. Customer redirected to Stripe hosted checkout page
5. After successful payment, Stripe redirects to success URL
6. Stripe webhook notifies PaymentService of subscription creation
7. PaymentService updates database and triggers notifications

### One-Time Payment Flow (1-Day Plans)
1. Customer selects 1-day gym plan
2. Frontend calls `/onetimepayment`
3. PaymentService creates checkout session without subscription
4. Customer completes payment on Stripe
5. Webhook confirms payment
6. Customer granted immediate access

### Trainer Session Payment Flow
1. Customer books trainer session
2. Frontend calls `/sessionpayment`
3. PaymentService creates authorization hold (not captured)
4. If session completed: Call `/sessionpayment/success` to capture funds
5. If session cancelled: Call `/sessionpayment/cancel` to release hold

## 🔐 Security Features

- ✅ **Webhook Signature Verification**: Validates all Stripe webhook requests
- ✅ **Stripe Connect Security**: Isolated payment processing per gym/trainer
- ✅ **Environment Variables**: All secrets stored in `.env` (never committed)
- ✅ **MongoDB Security**: Connection string with authentication
- ✅ **CORS Protection**: Configured for allowed origins
- ✅ **Input Validation**: All request bodies validated before processing
- ✅ **Error Handling**: Sensitive information not exposed in error messages

## 🐛 Troubleshooting

### Common Issues

**1. Stripe API Error: Invalid API Key**
```
Error: Invalid API key provided
```
**Solution**: Verify `STRIPE_SECRET_KEY` in `.env` starts with `sk_test_` (development) or `sk_live_` (production)

**2. MongoDB Connection Failed**
```
MongooseError: connect ECONNREFUSED
```
**Solution**: 
- Check `MONGO_URI` format in `.env`
- Verify IP address is whitelisted in MongoDB Atlas
- Ensure database user credentials are correct

**3. Webhook Signature Verification Failed**
```
Error: No signatures found matching the expected signature for payload
```
**Solution**: 
- Verify `STRIPE_WEBHOOK_SECRET` matches the secret from Stripe Dashboard
- Ensure webhook endpoint receives raw body (before JSON parsing)

**4. Kafka Connection Error**
```
Error: Connection to Kafka broker failed
```
**Solution**:
- Check `KAFKA_BROKER` and `KAFKA_PASSWORD` in `.env`
- Verify Kafka cluster is running
- Comment out Kafka consumers if not needed for development

**5. Connected Account Not Found**
```
Error: Stripe Account not found for the given user_id
```
**Solution**: Create a connected account first using `/create-account/:user_id`

### Debug Mode

Enable detailed Stripe logging:
```javascript
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
  telemetry: false,
  maxNetworkRetries: 2,
  timeout: 30000,
  appInfo: {
    name: 'FitNest Payment Service',
    version: '1.0.0'
  }
});
```

## 📈 Analytics & Reporting

### Available Metrics

- **Monthly Revenue**: Track revenue per gym/trainer per month
- **System Revenue**: Total platform revenue across all accounts
- **Member Count**: Active members per plan
- **Payment Success Rate**: Track failed vs successful payments
- **Subscription Churn**: Track subscription cancellations
- **Connected Account Payments**: Individual payment reports per gym/trainer

### Example Usage

Get monthly revenue for a gym:
```javascript
GET /monthlyrevenue/gym_user_123
```

Response:
```json
{
  "month": "2025-10",
  "revenue": 15000,
  "currency": "usd",
  "payment_count": 30,
  "new_subscriptions": 10,
  "cancelled_subscriptions": 2
}
```

## 🔄 Integration with Other Services

### GymService Integration
- Receives gym plan events via Kafka
- Creates/updates Stripe products when plans are created/modified
- Validates plan existence before creating subscriptions

### UserService Integration
- Fetches customer details from Supabase
- Links Stripe customers to FitNest user accounts

### TrainerService Integration
- Receives trainer session events via Kafka
- Handles session payment authorization and capture

### AdminService Integration
- Provides platform-wide financial analytics
- Exposes system revenue endpoint for admin dashboard

## 📚 Additional Resources

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe Connect Guide](https://stripe.com/docs/connect)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/current/)
- [KafkaJS Documentation](https://kafka.js.org/)

## 📄 License

This service is part of the FitNest platform. See the main project README for license information.

## 👥 Support

For issues or questions:
- Check the main FitNest README
- Review Stripe documentation for payment-related issues
- Check MongoDB Atlas logs for database issues
- Review Kafka broker logs for event streaming issues
- Contact the development team

## 🚀 Deployment

### Docker Deployment

Build and run with Docker:
```bash
docker build -t fitnest-payment-service .
docker run -p 3003:3003 --env-file .env fitnest-payment-service
```

### Production Checklist

- [ ] Use live Stripe API keys (`sk_live_` and `pk_live_`)
- [ ] Configure production webhook endpoint with HTTPS
- [ ] Set up MongoDB production cluster with backups
- [ ] Enable MongoDB Atlas encryption at rest
- [ ] Configure Kafka production brokers
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS/TLS for all communications
- [ ] Set up monitoring and alerting (e.g., Stripe Dashboard, MongoDB Atlas alerts)
- [ ] Configure rate limiting for API endpoints
- [ ] Set up log aggregation (e.g., ELK stack, CloudWatch)
- [ ] Enable Stripe fraud detection rules
- [ ] Configure backup and disaster recovery procedures
