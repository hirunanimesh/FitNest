import { supabase } from './supabase';

// After successful Google login
const handleGoogleLogin = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      scopes: 'email profile https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events'
    }
  });

  if (error) {
    console.error('Login error:', error);
    return;
  }

  // Wait for session to be established
  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session) {
    const { access_token, refresh_token, expires_at } = sessionData.session.provider_token; // Adjust based on Supabase structure
    const userId = sessionData.session.user.id;

    // Send tokens to backend
    await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/userservice/store-google-tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: new Date(expires_at * 1000).toISOString()
      })
    });
  }
};

export { handleGoogleLogin };
