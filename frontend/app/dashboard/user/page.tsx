"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import {
  TrendingUp,
  Target,
  CalendarIcon,
  Search,
  User,
  Dumbbell,
  Plus,
  Trophy,
  FlameIcon as Fire,
  CheckCircle,
  Clock,
  MapPin,
  Activity,
  Heart,
  Zap,
  Award,
  Users,
} from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { UserNavbar } from "@/components/user-navbar"
import { BMIChart } from "@/components/bmi-chart"
import { WeightChart } from "@/components/weight-chart"
import { WeightInputModal } from "@/components/weight-input-modal"

export default function UserDashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [showWeightModal, setShowWeightModal] = useState(false)

  // Enhanced mock user data
  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    memberSince: "January 2024",
    bmi: 24.2,
    currentWeight: 75,
    targetWeight: 70,
    weeklyGoal: 5,
    completedWorkouts: 4,
    totalWorkouts: 47,
    caloriesBurned: 2340,
    weeklyCalorieGoal: 3000,
    currentStreak: 7,
    longestStreak: 21,
    level: "Intermediate",
    points: 1250,
    nextLevelPoints: 1500,
    subscriptions: [
      {
        name: "FitZone Premium",
        type: "Gym",
        status: "Active",
        expiresIn: "15 days",
        image: "/images/gym-fitzone.png",
        plan: "Monthly Premium",
        price: "$49/month",
      },
      {
        name: "Personal Training with Sarah",
        type: "Trainer",
        status: "Active",
        expiresIn: "8 days",
        image: "/images/trainer-sarah.png",
        plan: "8 Sessions Package",
        price: "$600/package",
      },
    ],
    recentActivities: [
      { date: "Today", activity: "Chest & Triceps", duration: "45 min", calories: 320, gym: "FitZone Premium" },
      { date: "Yesterday", activity: "Cardio HIIT", duration: "30 min", calories: 280, gym: "FitZone Premium" },
      { date: "2 days ago", activity: "Back & Biceps", duration: "50 min", calories: 350, gym: "FitZone Premium" },
      { date: "3 days ago", activity: "Leg Day", duration: "60 min", calories: 420, gym: "FitZone Premium" },
    ],
    upcomingSessions: [
      {
        date: "Tomorrow",
        time: "10:00 AM",
        trainer: "Sarah Johnson",
        type: "Personal Training",
        location: "FitZone Premium",
        focus: "Upper Body Strength",
      },
      {
        date: "Friday",
        time: "6:00 PM",
        trainer: "Mike Rodriguez",
        type: "Powerlifting Session",
        location: "Iron Paradise",
        focus: "Deadlift Technique",
      },
    ],
    achievements: [
      { title: "7-Day Streak", icon: Fire, earned: "Today", description: "Worked out 7 days in a row" },
      {
        title: "Weight Loss Milestone",
        icon: Target,
        earned: "3 days ago",
        description: "Lost 5kg from starting weight",
      },
      { title: "Strength Gains", icon: Dumbbell, earned: "1 week ago", description: "Increased bench press by 10kg" },
    ],
    todaysTasks: [
      { id: 1, task: "Morning cardio session", completed: true },
      { id: 2, task: "Log today's weight", completed: false },
      { id: 3, task: "Drink 8 glasses of water", completed: false },
      { id: 4, task: "Evening strength training", completed: false },
      { id: 5, task: "Take progress photos", completed: false },
    ],
    nutritionGoals: {
      calories: { current: 1850, target: 2200 },
      protein: { current: 120, target: 150 },
      carbs: { current: 180, target: 220 },
      fats: { current: 65, target: 80 },
    },
  }

  const motivationalQuotes = [
    "You're stronger than you think! 💪",
    "Every workout counts towards your goal! 🎯",
    "Consistency is the key to success! 🔥",
    "Your body can do it. It's your mind you need to convince! 🧠",
    "Progress, not perfection! 🌟",
  ]

  const [currentQuote] = useState(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)])

  return (
    <div className="min-h-screen bg-background">
      <UserNavbar />

      <div className="container mx-auto p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-white">Welcome back, {user.name}!</h1>
              <p className="text-muted-foreground">Ready to crush your fitness goals today?</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-primary/20 text-primary">
                Level {user.level}
              </Badge>
              <Badge variant="outline" className="border-primary text-primary">
                {user.points} / {user.nextLevelPoints} XP
              </Badge>
            </div>
          </div>
        </div>

        {/* Motivation Phase - Full Width */}
        <Card className="mb-8 bg-gradient-to-r from-primary/20 to-secondary/20 border-primary/30 overflow-hidden">
          <div className="relative">
            <img
              src="/images/motivation-bg.png"
              alt="Motivation background"
              className="absolute inset-0 w-full h-full object-cover opacity-20"
            />
            <CardContent className="relative p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Fire className="h-8 w-8 text-primary" />
                    <h2 className="text-3xl font-bold text-white">{currentQuote}</h2>
                  </div>
                  <p className="text-muted-foreground text-lg">
                    You've completed {user.completedWorkouts} workouts this week. Keep up the great work!
                  </p>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      <span className="text-white font-semibold">Weekly Goal: {user.weeklyGoal} workouts</span>
                    </div>
                    <Progress value={(user.completedWorkouts / user.weeklyGoal) * 100} className="w-40" />
                    <span className="text-white font-semibold">
                      {user.completedWorkouts}/{user.weeklyGoal}
                    </span>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-5 w-5 text-orange-500" />
                      <span className="text-white font-semibold">Current Streak: {user.currentStreak} days</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Award className="h-5 w-5 text-purple-500" />
                      <span className="text-white font-semibold">Best Streak: {user.longestStreak} days</span>
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <Button className="bg-primary hover:bg-primary/90">
                      <Plus className="mr-2 h-4 w-4" />
                      Log Workout
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-transparent border-white text-white hover:bg-white hover:text-black"
                    >
                      View Achievements
                    </Button>
                  </div>
                </div>
                <div className="text-8xl opacity-50">🎯</div>
              </div>
            </CardContent>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Current BMI</p>
                      <p className="text-2xl font-bold text-white">{user.bmi}</p>
                      <Badge variant="secondary" className="mt-1">
                        Normal
                      </Badge>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Weight</p>
                      <p className="text-2xl font-bold text-white">{user.currentWeight}kg</p>
                      <p className="text-sm text-muted-foreground">Goal: {user.targetWeight}kg</p>
                    </div>
                    <Target className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Workouts</p>
                      <p className="text-2xl font-bold text-white">{user.totalWorkouts}</p>
                      <p className="text-sm text-muted-foreground">Total completed</p>
                    </div>
                    <Dumbbell className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Calories</p>
                      <p className="text-2xl font-bold text-white">{user.caloriesBurned}</p>
                      <p className="text-sm text-muted-foreground">This week</p>
                    </div>
                    <Fire className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Weight and BMI Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <WeightChart />
                <Button
                  size="sm"
                  className="absolute top-4 right-4 bg-primary hover:bg-primary/90"
                  onClick={() => setShowWeightModal(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Weight
                </Button>
              </div>
              <BMIChart />
            </div>

            {/* Recent Activities */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Activity className="mr-2 h-5 w-5" />
                  Recent Activities
                </CardTitle>
                <CardDescription className="text-muted-foreground">Your latest workout sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user.recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-primary/20 rounded-lg">
                          <Dumbbell className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{activity.activity}</p>
                          <p className="text-sm text-muted-foreground">
                            {activity.date} • {activity.gym}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-white">{activity.duration}</p>
                        <p className="text-sm text-muted-foreground">{activity.calories} cal</p>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full bg-transparent border-border text-white hover:bg-accent">
                    View All Activities
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Active Subscriptions */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-white">Active Subscriptions</CardTitle>
                <CardDescription className="text-muted-foreground">Your current gym and training plans</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user.subscriptions.map((subscription, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <img
                            src={subscription.image || "/placeholder.svg"}
                            alt={subscription.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{subscription.name}</p>
                          <p className="text-sm text-muted-foreground">{subscription.plan}</p>
                          <p className="text-sm text-primary">{subscription.price}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">{subscription.status}</Badge>
                        <p className="text-sm text-muted-foreground mt-1">Expires in {subscription.expiresIn}</p>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full bg-transparent border-border text-white hover:bg-accent">
                    <Plus className="mr-2 h-4 w-4" />
                    Browse More Plans
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Nutrition Tracking */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Heart className="mr-2 h-5 w-5" />
                  Nutrition Goals
                </CardTitle>
                <CardDescription className="text-muted-foreground">Track your daily nutrition intake</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-white">Calories</span>
                      <span className="text-sm text-muted-foreground">
                        {user.nutritionGoals.calories.current}/{user.nutritionGoals.calories.target}
                      </span>
                    </div>
                    <Progress
                      value={(user.nutritionGoals.calories.current / user.nutritionGoals.calories.target) * 100}
                      className="h-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-white">Protein</span>
                      <span className="text-sm text-muted-foreground">
                        {user.nutritionGoals.protein.current}g/{user.nutritionGoals.protein.target}g
                      </span>
                    </div>
                    <Progress
                      value={(user.nutritionGoals.protein.current / user.nutritionGoals.protein.target) * 100}
                      className="h-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-white">Carbs</span>
                      <span className="text-sm text-muted-foreground">
                        {user.nutritionGoals.carbs.current}g/{user.nutritionGoals.carbs.target}g
                      </span>
                    </div>
                    <Progress
                      value={(user.nutritionGoals.carbs.current / user.nutritionGoals.carbs.target) * 100}
                      className="h-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-white">Fats</span>
                      <span className="text-sm text-muted-foreground">
                        {user.nutritionGoals.fats.current}g/{user.nutritionGoals.fats.target}g
                      </span>
                    </div>
                    <Progress
                      value={(user.nutritionGoals.fats.current / user.nutritionGoals.fats.target) * 100}
                      className="h-2"
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4 bg-transparent border-border text-white hover:bg-accent"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Log Food
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Calendar for Task Scheduling */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <CalendarIcon className="mr-2 h-5 w-5" />
                  Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border border-border"
                />
                <div className="mt-4 space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <span className="text-muted-foreground">Workout Sessions</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-muted-foreground">Trainer Appointments</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-muted-foreground">Rest Days</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Sessions */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Clock className="mr-2 h-5 w-5" />
                  Upcoming Sessions
                </CardTitle>
                <CardDescription className="text-muted-foreground">Your scheduled training sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user.upcomingSessions.map((session, index) => (
                    <div key={index} className="p-4 border border-border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-white">{session.date}</p>
                          <p className="text-sm text-muted-foreground">{session.time}</p>
                        </div>
                        <Badge variant="outline" className="text-primary border-primary">
                          {session.type}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-white">with {session.trainer}</p>
                        <p className="text-sm text-muted-foreground">{session.focus}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-1" />
                          {session.location}
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full bg-transparent border-border text-white hover:bg-accent">
                    <Plus className="mr-2 h-4 w-4" />
                    Book Session
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Today's Tasks */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-white">Today's Tasks</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {user.todaysTasks.filter((t) => t.completed).length} of {user.todaysTasks.length} completed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {user.todaysTasks.map((task) => (
                    <div key={task.id} className="flex items-center space-x-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          task.completed ? "bg-primary border-primary" : "border-muted-foreground"
                        }`}
                      >
                        {task.completed && <CheckCircle className="h-3 w-3 text-white" />}
                      </div>
                      <span
                        className={`text-sm ${task.completed ? "text-muted-foreground line-through" : "text-white"}`}
                      >
                        {task.task}
                      </span>
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-4 bg-transparent border-border text-white hover:bg-accent"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Task
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Trophy className="mr-2 h-5 w-5" />
                  Recent Achievements
                </CardTitle>
                <CardDescription className="text-muted-foreground">Your latest milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="p-2 bg-primary/20 rounded-lg">
                        <achievement.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white text-sm">{achievement.title}</p>
                        <p className="text-xs text-muted-foreground">{achievement.description}</p>
                        <p className="text-xs text-primary mt-1">{achievement.earned}</p>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full bg-transparent border-border text-white hover:bg-accent">
                    View All Achievements
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full justify-start bg-primary hover:bg-primary/90">
                  <Link href="/search">
                    <Search className="mr-2 h-4 w-4" />
                    Find Gyms & Trainers
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start bg-transparent border-border text-white hover:bg-accent"
                >
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Update Profile
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent border-border text-white hover:bg-accent"
                  onClick={() => setShowWeightModal(true)}
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Log Weight
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start bg-transparent border-border text-white hover:bg-accent"
                >
                  <Link href="/trainers">
                    <Users className="mr-2 h-4 w-4" />
                    Browse Trainers
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Weight Input Modal */}
      <WeightInputModal isOpen={showWeightModal} onClose={() => setShowWeightModal(false)} />
    </div>
  )
}
