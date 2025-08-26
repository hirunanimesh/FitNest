'use client'
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";
import { useRouter } from 'next/navigation'
import { PublicRoute } from "@/components/PublicRoute"


type UserRole = "user" | "trainer" | "gym" | "";

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("");
  const router = useRouter();

  const handleGoogleSignUp = async () => {
    if (!selectedRole) {
      alert("Please select your role first");
      return;
    }
    try{
      setIsLoading(true);
      console.log("Selected role for Google sign-up:", selectedRole);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/complete-profile/${selectedRole}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      })
      if (error) {
        console.error("Google sign-up error:", error)
        // Handle error
      }

    }catch(error){
       console.error("Error initiating Google sign-up:", error)
    }finally{
      setIsLoading(false)
    }
    
    // Simulate loading
    setTimeout(() => setIsLoading(false), 2000);
  };

  const handleEmailSignup = () => {
    if (!selectedRole) {
      alert("Please select your role first");
      return;
    }
    console.log("Selected role for email signup:", selectedRole);
    try{
      setIsLoading(true);
      if (selectedRole === 'user'){
        router.push('/auth/signup/user')
      }else if (selectedRole === 'trainer'){
        router.push('/auth/signup/trainer')
      }else if (selectedRole === 'gym'){
        router.push('/auth/signup/gym')
      }
    }catch(error){
      console.error("Error during email signup:", error)
    }finally{
      setIsLoading(false)
    }
    console.log(`Navigating to ${selectedRole} signup`);
  };

  const roleOptions = [
    {
      value: "user",
      label: "Member",
      icon: "🏃‍♂️",
      description: "Join to find trainers and gyms",
    },
    {
      value: "trainer",
      label: "Trainer",
      icon: "💪",
      description: "Offer your fitness expertise",
    },
    {
      value: "gym",
      label: "Gym Owner",
      icon: "🏋️‍♀️",
      description: "Manage your fitness facility",
    },
  ];

  return (
    <PublicRoute>
      <div className="h-screen bg-gray-950 relative overflow-hidden pt-16">
      {/* Dark overlay to ensure deep black background */}
      <div className="absolute inset-0 bg-black/80" />
      
      {/* Subtle animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-64 h-64 bg-red-900/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-56 h-56 bg-red-800/3 rounded-full blur-2xl animate-pulse delay-1000" />
      </div>

      {/* Content - Split Layout (Desktop) / Vertical Layout (Mobile) */}
      <div className="relative z-10 h-full flex flex-col lg:flex-row">
        {/* Left Side - Role Selection */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-6">
          <div className="w-full max-w-md space-y-4 lg:space-y-5">
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white via-red-100 to-red-200 bg-clip-text text-transparent">
                Choose Your Role
              </h1>
              <p className="text-base lg:text-lg text-gray-300 font-medium">
                Select how you want to use FitNest
              </p>
            </div>

            {/* Role Selection Cards */}
            <div className="space-y-2 lg:space-y-3">
              {roleOptions.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setSelectedRole(role.value as UserRole)}
                  className={`
                    group relative w-full p-3 lg:p-4 rounded-lg lg:rounded-xl border-2 transition-all duration-300 text-left overflow-hidden
                    ${
                      selectedRole === role.value
                        ? "border-red-500 bg-gradient-to-r from-red-500/20 to-red-600/20 shadow-lg shadow-red-500/20 transform scale-[1.02]"
                        : "border-gray-700 bg-black/40 hover:bg-gray-800/50 hover:border-red-500/50 hover:scale-[1.01]"
                    }
                  `}
                >
                  {/* Selection indicator */}
                  {selectedRole === role.value && (
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent" />
                  )}
                  
                  <div className="relative flex items-center gap-3">
                    <div className="text-xl lg:text-2xl">{role.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-base lg:text-lg group-hover:text-red-100 transition-colors">
                        {role.label}
                      </h3>
                      <p className="text-gray-400 text-xs lg:text-sm mt-1 group-hover:text-gray-300 transition-colors">
                        {role.description}
                      </p>
                    </div>
                    
                    {/* Check indicator */}
                    <div className={`
                      w-5 h-5 lg:w-6 lg:h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300
                      ${
                        selectedRole === role.value
                          ? "border-red-500 bg-red-500"
                          : "border-gray-600 group-hover:border-red-400"
                      }
                    `}>
                      {selectedRole === role.value && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Selected role indicator */}
            {selectedRole && (
              <div className="text-center p-2 lg:p-3 bg-black/50 rounded-lg border border-red-500/30">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-gray-300 text-sm">Selected:</span>
                  <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 rounded-full border border-red-500/40">
                    <span className="text-base lg:text-lg">
                      {roleOptions.find((r) => r.value === selectedRole)?.icon}
                    </span>
                    <span className="font-semibold text-white text-sm lg:text-base">
                      {roleOptions.find((r) => r.value === selectedRole)?.label}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Horizontal Divider (Mobile) / Vertical Divider (Desktop) */}
        <div className="h-px lg:h-auto lg:w-px bg-gradient-to-r lg:bg-gradient-to-b from-transparent via-red-500/30 to-transparent"></div>

        {/* Right Side - Registration Buttons */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-6">
          <div className="w-full max-w-sm space-y-4 lg:space-y-5">
            {/* Header */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white via-red-100 to-red-200 bg-clip-text text-transparent">
                Create Account
              </h2>
              <p className="text-base lg:text-lg text-gray-300 font-medium">
                Choose your preferred signup method
              </p>
            </div>

            {/* Action Buttons */}
            <div
              className={`space-y-3 lg:space-y-4 transition-all duration-500 ${
                selectedRole
                  ? "opacity-100 transform translate-y-0"
                  : "opacity-40 transform translate-y-4 pointer-events-none"
              }`}
            >
              {/* Google Sign Up */}
              <Button
                onClick={handleGoogleSignUp}
                disabled={isLoading || !selectedRole}
                className="w-full h-10 lg:h-12 bg-white hover:bg-gray-100 text-black font-semibold border-0 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-white/20 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed rounded-lg text-sm lg:text-base"
              >
                <div className="flex items-center justify-center gap-3">
                  <svg width="18" height="18" className="lg:w-5 lg:h-5" viewBox="0 0 24 24">
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
                  <span>
                    {isLoading ? "Connecting..." : "Continue with Google"}
                  </span>
                </div>
              </Button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gray-600"></div>
                <span className="text-gray-400 font-medium text-sm">OR</span>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gray-600"></div>
              </div>

              {/* Email Sign Up */}
              <Button
                onClick={handleEmailSignup}
                disabled={!selectedRole}
                className="w-full h-10 lg:h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold border-0 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-red-500/30 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed rounded-lg text-sm lg:text-base"
              >
                <div className="flex items-center justify-center gap-3">
                  <svg
                    width="18"
                    height="18"
                    className="lg:w-5 lg:h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <span>Continue with Email</span>
                </div>
              </Button>

              {/* Profile completion notice */}
              {selectedRole && (
                <div className="text-center p-3 bg-black/50 rounded-lg border border-red-500/30">
                  <p className="text-gray-300 text-sm">
                    Complete your{" "}
                    <span className="font-semibold text-red-400">
                      {selectedRole}
                    </span>{" "}
                    profile after signing up
                  </p>
                </div>
              )}
            </div>

            <Separator className="bg-gradient-to-r from-transparent via-gray-600 to-transparent" />

            {/* Login Link */}
            <div className="text-center">
              <p className="text-gray-400 text-sm lg:text-base">
                Already have an account?{" "}
                <a
                  href="/auth/login"
                  className="text-red-400 hover:text-red-300 transition-colors duration-200 font-semibold underline underline-offset-2 decoration-red-400/50 hover:decoration-red-300"
                >
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
    </div>
    </PublicRoute>
  );
}