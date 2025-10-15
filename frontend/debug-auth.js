// Test the authentication flow
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://cvmxfwmcaxmqnhmsxicu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2bXhmd21jYXhtcW5obXN4aWN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4OTkyNjcsImV4cCI6MjA2OTQ3NTI2N30.upgtFa_ZxotPJcf_X6RQFNMxoyuZTfTniNwSHOwjJCY'
);

async function checkAuth() {
    try {
        console.log('🔍 Checking current auth session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('❌ Error getting session:', error);
            return;
        }
        
        if (session) {
            console.log('✅ User is authenticated');
            console.log('User ID:', session.user.id);
            console.log('Email:', session.user.email);
            console.log('Token expires at:', new Date(session.expires_at * 1000));
            console.log('Token preview:', session.access_token.substring(0, 50) + '...');
        } else {
            console.log('❌ No active session - user is not logged in');
        }
        
        // Check user
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            console.log('✅ User object exists:', user.email);
        } else {
            console.log('❌ No user object');
        }
        
    } catch (error) {
        console.error('❌ Error in auth check:', error);
    }
}

checkAuth();