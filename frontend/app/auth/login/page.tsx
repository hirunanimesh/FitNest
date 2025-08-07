"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { AppLogo } from "@/components/AppLogo";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { LoginUser, GetUserInfo } from "@/lib/api";

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

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 left-4">
        <AppLogo />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome Back to FitNest</CardTitle>
          <CardDescription>Sign in to your FitNest account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="your@email.com" required disabled={isLoading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required disabled={isLoading} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  disabled={isLoading}
                />
                <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                  Remember me
                </Label>
              </div>
              <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <Separator />

          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full bg-transparent flex items-center justify-center gap-3"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
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
              {isLoading ? "Connecting..." : "Continue with Google"}
            </Button>
            <Button variant="outline" className="w-full bg-transparent flex items-center justify-center gap-3" disabled={isLoading}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#1877F2"
                  d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                />
              </svg>
              Continue with Facebook
            </Button>
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
