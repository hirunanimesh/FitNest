# UserService

A comprehensive microservice for managing user/customer operations in the FitNest platform, including user profiles, weight tracking, fitness progress, feedback submission, session management, and Google Calendar integration.

## 🌟 Features

- ✅ **User Profile Management**: Create, update, and retrieve user/customer profiles
- ✅ **Weight Tracking**: Record and monitor weight progress over time
- ✅ **Progress Analytics**: Track fitness goals and achievements
- ✅ **Session Management**: View training sessions with trainers
- ✅ **Feedback System**: Submit feedback for trainers and gyms
- ✅ **Report System**: Submit reports for inappropriate content or behavior
- ✅ **Google Calendar Integration**: Full OAuth2 flow with calendar sync
- ✅ **Calendar Event Management**: Create, read, update, delete calendar events
- ✅ **Cloudinary Integration**: Profile picture storage and management
- ✅ **Aiven PostgreSQL**: Primary database for user data
- ✅ **Supabase Integration**: Secondary data store and real-time capabilities
- ✅ **Comprehensive Testing**: Full unit and integration test coverage with Jest

## 🏗️ Architecture

```
Frontend/API Gateway
    ↓
User Service (Port 3004)
    ↓
    ├─→ Supabase PostgreSQL (User Data & Sessions)
    ├─→ Aiven PostgreSQL (Primary Database)
    ├─→ Cloudinary (Profile Images)
    └─→ Google Calendar API (Calendar Integration)
         ├─→ OAuth2 Authentication
         ├─→ Calendar Events CRUD
         └─→ Token Management
```

## 📋 API Endpoints

### User Profile Management
- `GET /getuserbyid/:userId` - Get user profile by user ID
- `GET /getuserbycustomerid/:customerId` - Get user profile by customer ID
- `PATCH /updateuserdetails/:userId` - Update user profile
  ```json
  {
    "first_name": "John",
    "last_name": "Doe",
    "address": "123 Main St",
    "phone_no": "+1234567890",
    "birthday": "1990-01-01",
    "gender": "male",
    "profile_img": "https://cloudinary.com/...",
    "location": {
      "city": "New York",
      "lat": 40.7128,
      "lng": -74.0060
    }
  }
  ```

### Weight Tracking & Progress
- `POST /addweight` - Add new weight entry
  ```json
  {
    "user_id": "user_123",
    "weight": 75.5,
    "date": "2025-10-19"
  }
  ```
- `GET /getweightbyid/:userId` - Get all weight entries for a user
- `GET /getlatestweightbyid/:userId` - Get latest weight entry

### Session Management
- `GET /mysessions/:customerId` - Get all training sessions for a customer
  - Returns sessions with trainer details
  - Includes past and upcoming sessions

### Feedback & Reports
- `POST /addfeedback` - Submit feedback for a trainer
  ```json
  {
    "trainer_id": "trainer_123",
    "customer_id": "cust_456",
    "rating": 5,
    "comment": "Excellent training session!"
  }
  ```
- `POST /addreport` - Submit a report
  ```json
  {
    "reported_by": "user_123",
    "reported_user": "user_456",
    "reason": "Inappropriate behavior",
    "description": "Details of the incident"
  }
  ```

### Google Calendar Integration

#### OAuth Flow
- `GET /google/oauth-url/:userId` - Get Google OAuth authorization URL
  - Returns URL to redirect user to Google login
  - Initiates OAuth2 flow
- `GET /google/callback` - Handle Google OAuth callback
  - Exchanges authorization code for tokens
  - Saves refresh/access tokens securely
  - Redirects back to frontend dashboard

#### Calendar Status & Events
- `GET /calendar/status/:userId` - Check if user has connected Google Calendar
  ```json
  {
    "connected": true,
    "email": "user@example.com"
  }
  ```
- `GET /calendar/events/:userId` - Get all calendar events for a user
- `POST /calendar/sync/:userId` - Sync Google Calendar events to local database

#### Calendar Event Management
- `POST /calendar/create/:userId` - Create a new calendar event
  ```json
  {
    "summary": "Training Session",
    "description": "Cardio workout with trainer",
    "start": {
      "dateTime": "2025-10-20T10:00:00Z",
      "timeZone": "America/New_York"
    },
    "end": {
      "dateTime": "2025-10-20T11:00:00Z",
      "timeZone": "America/New_York"
    },
    "location": "FitNest Gym"
  }
  ```
- `PATCH /calendar/:calendarId` - Update an existing calendar event
- `DELETE /calendar/:calendarId` - Delete a calendar event

## 🔧 Setup and Installation

### 1. Install Dependencies
```bash
cd backend/UserService
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
PORT=3004
NODE_ENV=development

# Frontend & Services
FRONTEND_URL=http://localhost:3010
AUTH_SERVICE_URL=http://localhost:3001
GYM_SERVICE_URL=http://localhost:3002
PAYMENT_SERVICE_URL=http://localhost:3003
USER_SERVICE_URL=http://localhost:3004
TRAINER_SERVICE_URL=http://localhost:3005

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Supabase
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Aiven PostgreSQL
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google OAuth & Calendar
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_AUTH_URL=https://accounts.google.com/o/oauth2/v2/auth
GOOGLE_TOKEN_URL=https://oauth2.googleapis.com/token
CALENDAR_EVENTS_URL=https://www.googleapis.com/calendar/v3/calendars/primary/events
```

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials:
   - Go to **APIs & Services → Credentials**
   - Click **Create Credentials → OAuth client ID**
   - Application type: **Web application**
   - Authorized redirect URIs: `http://localhost:3004/google/callback`
5. Copy Client ID and Client Secret to `.env`

**Required Scopes:**
- `https://www.googleapis.com/auth/calendar`
- `https://www.googleapis.com/auth/calendar.events`
- `https://www.googleapis.com/auth/userinfo.email`
- `https://www.googleapis.com/auth/userinfo.profile`

### 4. Start the Service

```bash
# Development
npm start

# Production
NODE_ENV=production npm start
```

## 🧪 Testing

This service includes comprehensive unit and integration tests using Jest and Supertest.

### Running Tests

#### From Repository Root (Recommended)
```bash
# Run all UserService tests
npm run test:user

# Run with coverage
npx jest --selectProjects "UserService Tests" --coverage --colors -i

# Run specific test file
npx jest backend/UserService/__tests__/user.service.unit.test.js --colors -i
```

#### From UserService Directory
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

- ✅ **Controllers**: HTTP request/response handling, validation
- ✅ **Services**: Business logic, data transformation
- ✅ **Calendar Integration**: OAuth flow, token management, event CRUD
- ✅ **Error Handling**: Invalid inputs, database errors, API failures

Current coverage: **~65%** (Controllers and core business logic)

### Database Test Scripts

Located in `scripts/`:

#### supabase-tables-smoke.js
Validates that all required tables exist and are accessible.

```bash
DOTENV_CONFIG_PATH=.env.test node --loader dotenv/config scripts/supabase-tables-smoke.js
```

#### supabase-write-integrity.js
Tests CRUD operations and Row-Level Security policies.

```bash
DOTENV_CONFIG_PATH=.env.test node --loader dotenv/config scripts/supabase-write-integrity.js
```

## 📊 Database Schema

### Tables Used

| Table | Purpose | Primary Key |
|-------|---------|-------------|
| `customer` | User/customer profiles | `id` (UUID) |
| `customer_progress` | Weight tracking | `id` (UUID) |
| `feedback` | Trainer/gym feedback | `id` (UUID) |
| `Reports` | User reports | `id` (UUID) |
| `calendar` | Google Calendar events | `id` (UUID) |
| `user_google_tokens` | OAuth tokens | `user_id` (UUID) |
| `trainer_sessions` | Training sessions (read-only) | `session_id` (UUID) |

### user_google_tokens Schema
```sql
CREATE TABLE user_google_tokens (
  user_id UUID PRIMARY KEY,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  scope TEXT,
  token_type TEXT,
  expiry_date BIGINT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

## 🔐 Security Features

- ✅ **OAuth2 Security**: Secure token storage and automatic refresh
- ✅ **Row-Level Security (RLS)**: Supabase RLS policies protect user data
- ✅ **JWT Authentication**: Token-based authentication
- ✅ **Input Validation**: All request bodies validated
- ✅ **Environment Variables**: All secrets in `.env` (never committed)
- ✅ **CORS Protection**: Configured for allowed origins
- ✅ **HTTPS Required**: Google OAuth requires HTTPS in production
- ✅ **Token Encryption**: OAuth tokens encrypted at rest

## 💡 Key Features Explained

### Google Calendar Integration Flow

1. **Authorization Request**:
   ```javascript
   GET /google/oauth-url/:userId
   // Returns: { url: "https://accounts.google.com/o/oauth2/v2/auth?..." }
   ```

2. **User Redirects to Google**: Frontend redirects user to authorization URL

3. **User Grants Permission**: User logs in and approves calendar access

4. **OAuth Callback**:
   ```javascript
   GET /google/callback?code=abc123&state=user_456
   // Exchanges code for tokens
   // Saves tokens to database
   // Redirects to dashboard
   ```

5. **Access Calendar**:
   ```javascript
   GET /calendar/events/:userId
   // Uses stored tokens
   // Auto-refreshes if expired
   ```

### Token Refresh Mechanism

- Access tokens expire after 1 hour
- Service automatically refreshes using refresh token
- New access token saved to database
- Transparent to frontend - no re-authentication needed

### Weight Tracking System

- Records weight entries with timestamps
- Calculates BMI automatically
- Tracks progress over time
- Latest weight endpoint for dashboard display

## 🐛 Troubleshooting

### Common Issues

**1. Supabase Connection Error**
```
Error: fetch failed
```
**Solution**: Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env`

**2. Google OAuth Error: redirect_uri_mismatch**
```
Error: redirect_uri_mismatch
```
**Solution**: 
- Add `http://localhost:3004/google/callback` to authorized redirect URIs in Google Cloud Console
- For production, use HTTPS URL

**3. Google Calendar API Error: invalid_grant**
```
Error: Token has been expired or revoked
```
**Solution**: 
- Refresh token may be invalid
- Re-authorize: Call `/google/oauth-url/:userId` again
- User needs to re-grant permission

**4. Cloudinary Upload Failed**
```
Error: Upload failed
```
**Solution**: Check Cloudinary credentials in `.env`

**5. Test Failures**
```
Error: SUPABASE_URL is not defined
```
**Solution**: Run tests from repository root: `npm run test:user`

## 🔄 Integration with Other Services

### AuthService Integration
- Validates JWT tokens
- User authentication and session management

### TrainerService Integration
- Reads trainer information for sessions
- Submits feedback to trainers

### GymService Integration
- Reads gym information for membership
- Submits feedback to gyms

### PaymentService Integration
- Payment confirmation for sessions
- Subscription status checks

## 📚 Additional Resources

- [Google Calendar API Documentation](https://developers.google.com/calendar/api/guides/overview)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Documentation](https://supabase.com/docs)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Jest Testing Framework](https://jestjs.io/)

## 📄 License

This service is part of the FitNest platform. See the main project README for license information.

## 👥 Support

For issues or questions:
- Check the main FitNest README
- Review test files for usage examples
- Check Google Calendar API quotas and limits
- Contact the development team

## 🚀 Deployment

### Docker Deployment

Build and run with Docker:
```bash
docker build -t fitnest-user-service .
docker run -p 3004:3004 --env-file .env fitnest-user-service
```

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use production Supabase credentials
- [ ] Enable RLS policies on all tables
- [ ] Configure production Cloudinary account
- [ ] Set up production Google OAuth credentials with HTTPS redirect URIs
- [ ] Enable HTTPS/TLS for all communications
- [ ] Set up monitoring and alerting
- [ ] Configure rate limiting for API endpoints
- [ ] Set up log aggregation
- [ ] Enable backup and disaster recovery
- [ ] Configure CORS for production frontend domain
- [ ] Review and test OAuth flow end-to-end
- [ ] Set up Google Calendar API quota monitoring

