import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, UserPlus, Lock, Mail } from "lucide-react"
import Link from "next/link"

export default function AdminSignupInfo() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Admin Access</CardTitle>
          <CardDescription>Administrator accounts are managed internally for security purposes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Lock className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium">Secure Access</p>
                <p className="text-sm text-muted-foreground">
                  Admin accounts are created manually by existing administrators to ensure platform security.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <UserPlus className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium">Invitation Only</p>
                <p className="text-sm text-muted-foreground">
                  New admin accounts require approval and setup by current system administrators.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium">Contact Required</p>
                <p className="text-sm text-muted-foreground">
                  Please contact an existing administrator to request admin access.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full bg-red-600 hover:bg-red-700">
              <Link href="mailto:admin@fitnest.com">Contact Administrator</Link>
            </Button>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/auth/login">Back to Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
