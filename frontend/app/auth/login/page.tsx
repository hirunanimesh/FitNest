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
import { LoginUser, GetUserInfo } from "@/lib/api"
import { PublicRoute } from "@/components/PublicRoute"

export default function LoginPage() {
  const router = useRouter();
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user is coming back from OAuth
    const checkOAuthSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check if user has completed their profile
        await handleOAuthSuccess(session);
      }
    };

    checkOAuthSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await handleOAuthSuccess(session);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleOAuthSuccess = async (session: any) => {
    try {
      const userRole = session.user.user_metadata?.role;
      
      // If user has a role, redirect based on role
      if (userRole) {
        redirectBasedOnRole(userRole);
        return;
      }

      // If no role, this is a Google OAuth user - check if they have a customer profile
      try {
        const { data, error } = await supabase
          .from('customer')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (data) {
          // Profile exists, redirect to user dashboard
          router.push("/dashboard/user");
        } else {
          // No profile exists, redirect to complete profile
          router.push("/auth/complete-profile");
        }
      } catch (error) {
        console.error("Error checking customer profile:", error);
        // If error, assume they need to complete profile
        router.push("/auth/complete-profile");
      }
    } catch (error) {
      console.error("Error handling OAuth success:", error);
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

  const handleLogin = async () => {
    setIsLoading(true);

    try {
      const response = await LoginUser(email, password);

      if (response.success) {
        console.log("Login successful");
        
        // Store session data if needed
        if (response.session) {
          // You can store additional session data in localStorage if needed
          localStorage.setItem('fitnes_session', JSON.stringify(response.session));
        }

        // Redirect based on user role
        const userRole = response.role || response.user?.user_metadata?.role || "customer";
        redirectBasedOnRole(userRole);
      } else {
        console.error("Login failed:", response.message);
        // Handle login failure (show error message)
      }
    } catch (error: any) {
      console.error("Login error:", error);
      // Handle error (show error message)
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/login`,
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
                onChange={(e) => setEmail(e.target.value)}
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
                onChange={(e) => setPassword(e.target.value)}
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