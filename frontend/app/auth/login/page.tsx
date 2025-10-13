"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { AppLogo } from "@/components/AppLogo"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getBaseUrl } from "@/lib/config"
import { LoginUser } from "@/lib/api"
import { PublicRoute } from "@/components/PublicRoute"
import { useToast } from "@/components/ui/use-toast"
// Removed unused TIMEOUT import

export default function LoginPage() {
  const router = useRouter();
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is coming back from OAuth
    const checkOAuthSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log("OAuth session data:", session);
      console.log("OAuth session user metadata:", session?.user.user_metadata.role);
      if (session) {
        // Check if user has completed their profile
        await handleOAuthSuccess(session);
      }
    };

    checkOAuthSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change event:", event, session);
      
      if (event === 'SIGNED_IN' && session) {
        console.log("User signed in, redirecting...");
        await handleOAuthSuccess(session);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleOAuthSuccess = async (session: any) => {
     // If no role present yet, fetch latest auth user (could have been just updated) and decide.
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error("Error fetching user for role:", userError);
          return;
        }
        
        let refreshedRole = user?.user_metadata?.role;
        console.log("Refreshed user role:", refreshedRole);
        
        // If no role in metadata, check database tables
        if (!refreshedRole && user) {
          console.log("No role in metadata for OAuth user, checking database tables...");
          refreshedRole = await determineUserRole(user.id);
          console.log("Determined role from database for OAuth user:", refreshedRole);
        }
        
        if (refreshedRole) {
          redirectBasedOnRole(refreshedRole);
          return;
        }
        
        // If still no role found, default to customer
        console.log("No role found for OAuth user, defaulting to customer");
        redirectBasedOnRole("customer");
      } catch (error) {
        console.error("Error determining role from auth metadata:", error);
        // Fallback to customer dashboard on error
        redirectBasedOnRole("customer");
      }
  };

  const redirectBasedOnRole = (role: string) => {
    switch (role) {
      case "admin":
        router.push("/dashboard/admin");
        break;
      case "trainer":
        router.push("/dashboard/trainer");
        break;
      case "gym":
        router.push("/dashboard/gym");
        break;
      default:
        router.push("/dashboard/user");
    }
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Helper function to determine user role from database
  const determineUserRole = async (userId: string): Promise<string> => {
    try {
      // Check if user is a customer
      const { data: customerData, error: customerError } = await supabase
        .from('customer')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (customerData && !customerError) return 'customer';

      // Check if user is a trainer
      const { data: trainerData, error: trainerError } = await supabase
        .from('trainer')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (trainerData && !trainerError) return 'trainer';

      // Check if user is a gym
      const { data: gymData, error: gymError } = await supabase
        .from('gym')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (gymData && !gymError) return 'gym';

      // Default to customer if no specific role found
      return 'customer';
    } catch (error) {
      console.error('Error determining user role:', error);
      return 'customer'; // Default fallback
    }
  };
  //signing with email and password
  const handleLogin = async () => {
    setIsLoading(true);
    setError(null); // Clear any previous errors

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        console.error("Login failed:", error);
        setError(error.message);
        return;
      }

      console.log("Login successful");

      if (data.session && data.user) {
        // Store session data if needed
        localStorage.setItem('fitnes_session', JSON.stringify(data.session));

        // Get user role from metadata or determine from database
        let userRole = data.user?.user_metadata?.role;
        
        if (!userRole) {
          console.log("No role in metadata, checking database tables...");
          userRole = await determineUserRole(data.user.id);
          console.log("Determined role from database:", userRole);
        }
        toast({
          title: "Login Successful",
          description: "You have successfully logged in.\nRedirecting to your dashboard...",
          duration: 3000,
        });

        // Redirect based on user role
        redirectBasedOnRole(userRole);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      // Request Google Calendar scopes here so user grants calendar access during sign-in.
      // NOTE: adjust scopes as needed; include offline access and prompt=consent to request a refresh token.
      console.log("baseurl:", getBaseUrl());
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${getBaseUrl()}/auth/login`,
          // request calendar events scope in addition to basic openid/profile/email
          scopes: 'openid profile email https://www.googleapis.com/auth/calendar.events',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      if (error) {
        console.error("Google sign-in error:", error);
        // Handle error
      }
    } catch (error) {
      console.error("Error initiating Google sign-in:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PublicRoute>
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-slate-950 to-red-950/30"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-red-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl"></div>
      
      <div className="absolute top-4 left-4 z-10">
        <AppLogo />
      </div>
      
      <Card className="w-full max-w-md bg-slate-900/80 border-slate-800 shadow-2xl backdrop-blur-sm relative z-10">
        <CardHeader className="text-center space-y-3">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white to-red-100 bg-clip-text text-transparent">
            Welcome Back to FitNest
          </CardTitle>
          <CardDescription className="text-slate-400 text-base">
            Sign in to your FitNest account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200 font-medium">
                Email
              </Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="your@email.com" 
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null); // Clear error when user types
                }}
                required 
                disabled={isLoading}
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-red-500 focus:ring-red-500/20 h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200 font-medium">
                Password
              </Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null); // Clear error when user types
                }}
                required 
                disabled={isLoading}
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-red-500 focus:ring-red-500/20 h-11"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  disabled={isLoading}
                  className="border-slate-600 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                />
                <Label htmlFor="remember" className="text-sm font-normal cursor-pointer text-slate-300">
                  Remember me
                </Label>
              </div>
              <Link 
                href="/auth/forgot-password" 
                className="text-sm text-red-400 hover:text-red-300 hover:underline transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className="p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <Button 
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold h-12 shadow-lg hover:shadow-red-900/25 transition-all duration-200" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing In...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </div>

          <div className="relative">
            <Separator className="bg-slate-700" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-slate-900 px-3 text-slate-400 text-sm">or</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full bg-slate-800/30 border-slate-700 hover:bg-slate-800/50 text-white flex items-center justify-center gap-3 h-12 transition-all duration-200"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Connecting...
                </div>
              ) : (
                "Continue with Google"
              )}
            </Button>
          </div>

          <div className="text-center pt-4">
            <p className="text-sm text-slate-400">
              Don't have an account?{" "}
              <Link 
                href="/auth/signup" 
                className="text-red-400 hover:text-red-300 hover:underline font-medium transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
    </PublicRoute>
  )
}