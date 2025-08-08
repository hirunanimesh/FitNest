# Google Cloud Console OAuth Configuration

## Step-by-Step Configuration

### 1. Authorized JavaScript Origins
Add these domains that can initiate OAuth requests:

**Development:**
```
http://localhost:3010
```

**Production:**
```
https://yourdomain.com
```

### 2. Authorized Redirect URIs
Add these exact URLs:

**Supabase Callback (REQUIRED):**
```
https://your-project-ref.supabase.co/auth/v1/callback
```

**Development Redirects:**
```
http://localhost:3010/auth/login
http://localhost:3010/auth/complete-profile
```

**Production Redirects:**
```
https://yourdomain.com/auth/login
https://yourdomain.com/auth/complete-profile
```

## How to Find Your Supabase Callback URL

1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to **Authentication** → **Providers**
3. Click on **Google** provider
4. The callback URL will be shown as: `https://your-project-ref.supabase.co/auth/v1/callback`
5. Copy this EXACT URL to Google Cloud Console

## Example Configuration

If your Supabase project URL is: `https://abcd1234.supabase.co`

Then your redirect URLs should be:
```
https://abcd1234.supabase.co/auth/v1/callback
http://localhost:3010/auth/login
http://localhost:3010/auth/complete-profile
```

## OAuth Flow Explanation

1. User clicks "Sign up with Google" in your app
2. Supabase redirects to Google OAuth
3. User authorizes your app on Google
4. Google redirects to: `https://your-project.supabase.co/auth/v1/callback`
5. Supabase processes the OAuth response
6. Supabase redirects to: `/auth/complete-profile` (for new users) or `/auth/login` (for existing users)

## Common Mistakes to Avoid

❌ **Wrong:** Using your frontend URL as the primary callback
❌ **Wrong:** `http://localhost:3010/auth/v1/callback`
❌ **Wrong:** Missing the `/auth/v1/callback` path
❌ **Wrong:** Using `http://` for Supabase URLs (should be `https://`)

✅ **Correct:** Using Supabase's callback URL as primary
✅ **Correct:** `https://your-project.supabase.co/auth/v1/callback`
✅ **Correct:** Adding your app URLs for final redirects
✅ **Correct:** Including both development and production URLs
