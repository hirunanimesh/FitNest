import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Smartphone,
  Monitor,
  Users,
  MapPin,
  Calendar,
  TrendingUp,
  Target,
  Bell,
  CreditCard,
  Shield,
  Search,
  MessageCircle,
} from "lucide-react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">How FitNest Works</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Discover how our comprehensive fitness platform connects you with the best gyms, trainers, and tools to
            achieve your fitness goals through both web and mobile applications.
          </p>
        </div>
      </section>

      {/* Platform Overview */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">Available on All Platforms</h2>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Web App */}
            <Card className="bg-card border-border">
              <CardHeader className="text-center">
                <Monitor className="h-16 w-16 mx-auto text-primary mb-4" />
                <CardTitle className="text-white text-2xl">Web Application</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Full-featured desktop experience with comprehensive dashboard and analytics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative h-64 overflow-hidden rounded-lg">
                  <img
                    src="/images/web-app-dashboard.png"
                    alt="FitNest Web Dashboard"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span>Advanced analytics and progress tracking</span>
                  </div>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>Comprehensive scheduling system</span>
                  </div>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Search className="h-4 w-4 text-primary" />
                    <span>Advanced gym and trainer search</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mobile App */}
            <Card className="bg-card border-border">
              <CardHeader className="text-center">
                <Smartphone className="h-16 w-16 mx-auto text-primary mb-4" />
                <CardTitle className="text-white text-2xl">Mobile Application</CardTitle>
                <CardDescription className="text-muted-foreground">
                  On-the-go fitness tracking with real-time notifications and quick access
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative h-64 overflow-hidden rounded-lg">
                  <img
                    src="/images/mobile-app-screens.png"
                    alt="FitNest Mobile App"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Bell className="h-4 w-4 text-primary" />
                    <span>Real-time workout reminders</span>
                  </div>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>GPS-based gym finder</span>
                  </div>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Target className="h-4 w-4 text-primary" />
                    <span>Quick workout logging</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Steps */}
      <section className="py-20 px-4 bg-accent/30">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">Your Fitness Journey in 4 Steps</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <Card className="text-center bg-card border-border">
              <CardHeader>
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <CardTitle className="text-white">Sign Up & Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src="/images/step-signup.png"
                  alt="Sign up process"
                  className="w-full h-32 object-cover rounded-lg mb-4"
                />
                <CardDescription className="text-muted-foreground">
                  Create your account, set fitness goals, and complete your profile with health metrics.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="text-center bg-card border-border">
              <CardHeader>
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <CardTitle className="text-white">Find & Connect</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src="/images/step-search.png"
                  alt="Search gyms and trainers"
                  className="w-full h-32 object-cover rounded-lg mb-4"
                />
                <CardDescription className="text-muted-foreground">
                  Search for gyms and trainers near you, compare plans, and book your first session.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="text-center bg-card border-border">
              <CardHeader>
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <CardTitle className="text-white">Start Training</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src="/images/step-training.png"
                  alt="Start training"
                  className="w-full h-32 object-cover rounded-lg mb-4"
                />
                <CardDescription className="text-muted-foreground">
                  Begin your fitness journey with personalized workouts and professional guidance.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Step 4 */}
            <Card className="text-center bg-card border-border">
              <CardHeader>
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">4</span>
                </div>
                <CardTitle className="text-white">Track Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src="/images/step-progress.png"
                  alt="Track progress"
                  className="w-full h-32 object-cover rounded-lg mb-4"
                />
                <CardDescription className="text-muted-foreground">
                  Monitor your progress with detailed analytics, BMI tracking, and achievement milestones.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Dashboard Features Preview */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-white">Your Personal Dashboard</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            After logging in, access your comprehensive dashboard with all the tools you need for your fitness journey.
          </p>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <Badge className="bg-primary text-white">Dashboard Features</Badge>
                <h3 className="text-2xl font-bold text-white">Everything You Need in One Place</h3>
                <p className="text-muted-foreground">
                  Your dashboard provides a complete overview of your fitness journey with motivational content,
                  subscription management, progress tracking, and scheduling tools.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Target className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold text-white">Motivation Hub</h4>
                    <p className="text-sm text-muted-foreground">
                      Daily motivation, progress celebrations, and goal tracking to keep you inspired.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CreditCard className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold text-white">Active Subscriptions</h4>
                    <p className="text-sm text-muted-foreground">
                      View and manage your gym memberships and personal training plans in one place.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <TrendingUp className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold text-white">Progress Analytics</h4>
                    <p className="text-sm text-muted-foreground">
                      Interactive charts showing weight changes, BMI variations, and fitness milestones.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Calendar className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold text-white">Smart Scheduling</h4>
                    <p className="text-sm text-muted-foreground">
                      Plan workouts, book trainer sessions, and set fitness reminders with our integrated calendar.
                    </p>
                  </div>
                </div>
              </div>

              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <Link href="/auth/signup">Start Your Journey</Link>
              </Button>
            </div>

            <div className="relative">
              <img
                src="/images/dashboard-preview.png"
                alt="FitNest Dashboard Preview"
                className="w-full rounded-lg shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 px-4 bg-accent/30">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">Why Choose FitNest?</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-card border-border">
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-white">Verified Partners</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  All gyms and trainers are thoroughly verified and certified to ensure quality and safety.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <MessageCircle className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-white">24/7 Support</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  Get help whenever you need it with our round-the-clock customer support team.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-white">Community Driven</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  Join a thriving community of 125,000+ fitness enthusiasts supporting each other.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
