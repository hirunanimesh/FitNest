// utils/auth.ts
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client (make sure these env vars are set)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Get the current user's session token
 * @returns Promise<string | null> - The access token or null if not authenticated
 */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }
    
    return session?.access_token || null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Get headers with authorization token
 * @returns Promise<Record<string, string>> - Headers object with authorization
 */
export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await getAuthToken();
  
  if (!token) {
    return {};
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

/**
 * Check if user is authenticated
 * @returns Promise<boolean> - Whether user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getAuthToken();
  return !!token;
};

export { supabase };