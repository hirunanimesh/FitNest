# Google OAuth Setup Guide for FitNest

## ⚠️ IMPORTANT: Setup Order

**You MUST complete these steps in order:**
1. Google Cloud Console setup (create credentials)
2. Supabase OAuth configuration (use Google credentials)
3. Frontend environment configuration
4. Test the OAuth flow

**Without Google Cloud Console credentials, OAuth will NOT work!**

## Prerequisites

- Google account (free)
- Supabase project (free tier available)
- Basic understanding of OAuth flow

---

## 1. Frontend Environment Setup

Create a `.env.local` file in the `frontend` directory with these variables:

```bash
# Copy from .env.local.example and fill in your values

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Maps API Key (for location selection)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# API Gateway URL
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:3000
```

## 2. Supabase OAuth Configuration

### Step 1: Enable Google Provider in Supabase (AFTER Google Cloud Setup)

**Prerequisites:** Complete Google Cloud Console setup first to get Client ID and Secret.

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** in the list and toggle it **ON**
4. Enter your Google OAuth credentials:
   - **Client ID:** (from Google Cloud Console)
   - **Client Secret:** (from Google Cloud Console)
5. Click **Save**

**Important:** The redirect URL shown in Supabase (something like `https://your-project.supabase.co/auth/v1/callback`) must be added to your Google Cloud Console OAuth client.

### Step 2: Configure Google OAuth Redirect URLs
Add these URLs to your Google Cloud Console OAuth2 client:

**Authorized redirect URIs:**
- `https://your-supabase-project.supabase.co/auth/v1/callback`
- `http://localhost:3010/auth/login` (for development)
- `http://localhost:3010/auth/complete-profile` (for development)

### Step 3: Set up Google Cloud Console (REQUIRED)

**⚠️ Important:** You MUST create Google Cloud Console credentials before Google OAuth will work with Supabase.

#### 3.1 Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Click "Select a project" → "New Project"
4. Enter project name (e.g., "FitNest OAuth")
5. Click "Create"

#### 3.2 Enable Required APIs
1. In your project, go to **APIs & Services** → **Library**
2. Search and enable these APIs:
   - **Google+ API** (for OAuth user info)
   - **Google Maps JavaScript API** (for location features)

#### 3.3 Create OAuth 2.0 Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth 2.0 Client IDs"**
3. If prompted, configure the OAuth consent screen first:
   - Choose **External** user type
   - Fill in app name: "FitNest"
   - Add your email as developer contact
   - Save and continue through the steps

#### 3.4 Configure OAuth Client
1. Application type: **Web application**
2. Name: "FitNest Web Client"
3. **Authorized JavaScript origins:**
   - `http://localhost:3010` (development)
   - `https://your-domain.com` (production)
4. **Authorized redirect URIs** (ADD ALL OF THESE):
   
   **Primary Supabase Callback (MOST IMPORTANT):**
   - `https://your-supabase-project.supabase.co/auth/v1/callback`
   
   **Development URLs:**
   - `http://localhost:3010/auth/login`
   - `http://localhost:3010/auth/complete-profile`
   
   **Production URLs (add when deploying):**
   - `https://your-domain.com/auth/login`
   - `https://your-domain.com/auth/complete-profile`

5. Click **Create**

**⚠️ Critical:** The Supabase callback URL is found in your Supabase dashboard under **Authentication** → **Providers** → **Google**. Copy it exactly!

#### 3.5 Get Your Credentials
After creation, you'll get:
- **Client ID** (e.g., `123456789-abc123.apps.googleusercontent.com`)
- **Client Secret** (e.g., `GOCSPX-abc123def456`)

**Keep these secure!** You'll need them for Supabase configuration.

## 3. Backend Environment Setup

Ensure your backend `.env` file has:

```bash
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## 4. Database Schema Requirements

Ensure your Supabase database has these tables:

### `auth.users` table
- Should have `user_metadata` JSONB field to store role information

### `customer` table
```sql
CREATE TABLE customer (
  customer_id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  address TEXT,
  phone_no VARCHAR(20),
  profile_img TEXT,
  gender VARCHAR(10),
  birthday DATE,
  location JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### `customer_progress` table
```sql
CREATE TABLE customer_progress (
  progress_id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customer(customer_id),
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  recorded_at TIMESTAMP DEFAULT NOW()
);
```

## 5. How the OAuth Flow Works

### New User Flow:
1. User clicks "Sign up with Google"
2. Redirected to Google OAuth
3. After Google auth, user is redirected to `/auth/complete-profile`
4. User fills additional required fields
5. Profile is saved to `customer` table linked by `user_id`
6. User is redirected to `/dashboard/user`

### Returning User Flow:
1. User clicks "Continue with Google" on login
2. After Google auth, system checks if customer profile exists
3. If profile exists: redirect to appropriate dashboard based on role
4. If no profile: redirect to `/auth/complete-profile`

## 6. Role-Based Access Control

Users can have these roles stored in `user_metadata.role`:
- `customer` - Regular users (default for OAuth)
- `trainer` - Fitness trainers
- `gym` - Gym owners
- `admin` - System administrators

## 7. Testing the Implementation

1. Start your backend services
2. Start the frontend: `npm run dev`
3. Navigate to `/auth/signup` or `/auth/login`
4. Test Google OAuth flow
5. Complete profile form should appear for new OAuth users
6. Existing users should be redirected based on their role

## 8. Security Considerations

- OAuth users don't have passwords in your system
- All authentication is handled by Supabase + Google
- User roles are stored securely in Supabase auth metadata
- Profile images are uploaded to Cloudinary for OAuth users
- Location data is stored as JSONB for flexibility

## API Endpoints Added

- `POST /api/auth/oauth/complete-profile` - Complete OAuth user profile
- `GET /api/auth/user` - Get user info from token
- Updated `POST /api/auth/login` - Now returns user role

## Frontend Pages Added/Updated

- `/auth/signup` - Main signup page with Google option
- `/auth/signup/user` - Enhanced with Google signup option  
- `/auth/login` - Enhanced with Google login and role-based routing
- `/auth/complete-profile` - New page for OAuth profile completion

## 9. Troubleshooting Common Issues

### "OAuth Error: Invalid Client ID"
- Check that your Google Cloud Console Client ID is correctly entered in Supabase
- Ensure the Client ID format is correct (ends with `.apps.googleusercontent.com`)

### "Redirect URI Mismatch"
- Verify that ALL redirect URIs are added to Google Cloud Console
- Check that the Supabase callback URL matches exactly
- Don't forget to add development URLs (`localhost:3010`)

### "Access Blocked: This app's request is invalid"
- Complete the OAuth consent screen configuration in Google Cloud Console
- Add test users if app is in testing mode
- Verify app domains are configured correctly

### "Google OAuth Not Working in Development"
- Ensure `http://localhost:3010` is in authorized origins
- Check that environment variables are loaded correctly
- Verify frontend is running on port 3010

### "Profile Completion Page Not Loading"
- Check that `/auth/complete-profile` redirect URI is configured
- Verify the complete profile page exists and routes correctly
- Ensure user session is properly maintained

### "Role-Based Redirection Not Working"
- Check that user metadata contains the `role` field
- Verify login function returns the correct role
- Ensure dashboard routes exist for each role

## 10. Cost Considerations

### Google Cloud Console:
- **Free tier includes:** 100,000 OAuth requests/month
- **Maps API:** $200 free credit monthly (usually sufficient for small apps)
- **Additional usage:** Pay-per-use beyond free limits

### Supabase:
- **Free tier includes:** 50,000 monthly active users
- **OAuth providers:** No additional cost for Google OAuth
- **Database/Storage:** Standard Supabase pricing applies

## 11. Production Checklist

Before going live:
- [ ] Replace all `localhost` URLs with production domains
- [ ] Configure production environment variables
- [ ] Set up proper error handling for OAuth failures
- [ ] Add privacy policy and terms of service links
- [ ] Test OAuth flow thoroughly on production domain
- [ ] Set up monitoring for authentication errors
- [ ] Configure proper CORS settings
- [ ] Implement rate limiting for auth endpoints

**Remember:** OAuth setup requires both Google Cloud Console AND Supabase configuration to work!
