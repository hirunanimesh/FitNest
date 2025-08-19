//public profile
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, Dumbbell, FlameIcon as Fire, Heart, MapPin, Target, Trophy, Users, Zap } from "lucide-react"

export default function GymProfilePage() {
  const achievements = [
    { title: "Completed 5K run", date: "2 days ago", icon: Trophy },
    { title: "Lost 3kg this month", date: "1 week ago", icon: Target },
    { title: "10 workouts completed", date: "2 weeks ago", icon: Fire },
  ]

  const workoutStats = [
    { label: "Sessions Attended", value: 47, max: 50, color: "bg-red-500" },
    { label: "Calories Burned", value: 12500, max: 15000, color: "bg-red-400" },
    { label: "Weight Lifted (kg)", value: 2850, max: 3000, color: "bg-red-600" },
  ]

  
  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="w-24 h-24 border-2 border-red-500">
                <AvatarImage src="/fitness-woman-profile.png" alt="Alex Johnson" />
                <AvatarFallback className="bg-gray-800 text-white text-xl">AJ</AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-3">
                <div>
                  <h1 className="text-3xl font-bold text-white">Alex Johnson</h1>
                  <div className="flex items-center gap-4 text-gray-400 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      28 years old
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Downtown Branch
                    </span>
                  </div>
                </div>

                <p className="text-gray-300 max-w-2xl">
                  "Love early morning runs and strength training! Always looking to push my limits and inspire others on
                  their fitness journey. 💪"
                </p>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-red-600 text-white hover:bg-red-700">
                    Weight Loss
                  </Badge>
                  <Badge variant="secondary" className="bg-gray-700 text-white hover:bg-gray-600">
                    Strength Training
                  </Badge>
                  <Badge variant="secondary" className="bg-gray-700 text-white hover:bg-gray-600">
                    Cardio
                  </Badge>
                  <Badge variant="secondary" className="bg-gray-700 text-white hover:bg-gray-600">
                    Morning Workouts
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  <Users className="w-4 h-4 mr-2" />
                  Connect
                </Button>
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent">
                  Message
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Achievements */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Trophy className="w-5 h-5 text-red-500" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {achievements.map((achievement, index) => {
                  const Icon = achievement.icon
                  return (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                      <div className="p-2 bg-red-600 rounded-full">
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white">{achievement.title}</p>
                        <p className="text-sm text-gray-400">{achievement.date}</p>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Workout Stats */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Dumbbell className="w-5 h-5 text-red-500" />
                  Workout Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {workoutStats.map((stat, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">{stat.label}</span>
                      <span className="text-white font-medium">
                        {stat.value.toLocaleString()} / {stat.max.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={(stat.value / stat.max) * 100} className="h-2 bg-gray-800" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Activity Feed */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Zap className="w-5 h-5 text-red-500" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-white">Completed HIIT workout session</p>
                      <p className="text-sm text-gray-400">2 hours ago • Burned 450 calories</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-white">Joined "Morning Warriors" group</p>
                      <p className="text-sm text-gray-400">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-white">Shared workout photo</p>
                      <p className="text-sm text-gray-400">3 days ago • 12 likes</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Fitness Goals */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Target className="w-5 h-5 text-red-500" />
                  Fitness Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="text-gray-300">Lose 5kg by March</span>
                </div>
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-red-500" />
                  <span className="text-gray-300">Bench press 80kg</span>
                </div>
                <div className="flex items-center gap-2">
                  <Fire className="w-4 h-4 text-red-500" />
                  <span className="text-gray-300">Run 10K under 45min</span>
                </div>
              </CardContent>
            </Card>

            {/* Training Schedule */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Clock className="w-5 h-5 text-red-500" />
                  Training Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-gray-300">
                  <p className="font-medium">Preferred Times:</p>
                  <p className="text-sm text-gray-400">6:00 AM - 8:00 AM</p>
                  <p className="text-sm text-gray-400">6:00 PM - 8:00 PM</p>
                </div>
                <Separator className="bg-gray-700" />
                <div className="text-gray-300">
                  <p className="font-medium">Assigned Trainer:</p>
                  <p className="text-sm text-gray-400">Marcus Thompson</p>
                </div>
              </CardContent>
            </Card>

            {/* Group Memberships */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Users className="w-5 h-5 text-red-500" />
                  Groups
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Morning Warriors</span>
                  <Badge variant="secondary" className="bg-red-600 text-white text-xs">
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">HIIT Squad</span>
                  <Badge variant="secondary" className="bg-gray-700 text-white text-xs">
                    Member
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Yoga Flow</span>
                  <Badge variant="secondary" className="bg-gray-700 text-white text-xs">
                    Member
                  </Badge>
                </div>
              </CardContent>
            </Card>

            
          </div>
        </div>
      </div>
    </div>
  )
}
