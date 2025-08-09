"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Bell, CalendarIcon, Dumbbell, Home, LogOut, Moon, Sun, User, Users, MapPin, Phone, TrendingUp, Weight, Ruler, Activity, Plus } from 'lucide-react'
import axios from "axios"
import { supabase } from "@/lib/supabase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {Sidebar,SidebarContent,SidebarFooter,SidebarGroup,SidebarGroupContent,SidebarHeader,SidebarInset,SidebarMenu,SidebarMenuButton,SidebarMenuItem,SidebarProvider,SidebarRail,SidebarTrigger,} from "@/components/ui/sidebar"
import { useTheme } from "next-themes"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from "recharts"
import { Calendar as CalendarUI } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import SideBar from "./_components/SideBar"
import TopBar from "./_components/TopBar"
import Progress from "./_components/Progress"
import TodaySessions from "./_components/TodaySessions"
import UpcomingSessions from "./_components/UpcomingSessions"
import KPI from "./_components/KPI"

const motivationQuotes = [
  "Every workout counts towards your goal!",
  "Consistency is the key to success!",
  "Your only limit is your mind!",
  "Push yourself because no one else will!"
]

const sidebarItems = [
  { title: "Home", icon: Home, url: "/", isActive: true },
  { title: "Profile", icon: User, url: "user/profile/1" },
  { title: "Search", icon: Users, url: "user/search" },
  { title: "Contacts", icon: Phone, url: "#" }
]

function AnimatedQuote({ quote }: { quote: string }) {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < quote.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + quote[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, 100)
      return () => clearTimeout(timeout)
    }
  }, [currentIndex, quote])

  useEffect(() => {
    setDisplayedText("")
    setCurrentIndex(0)
  }, [quote])

  return <p className="text-2xl font-bold text-primary italic">{displayedText}</p>
}

// function AppSidebar() {
//   const { theme, setTheme } = useTheme()

//   return (
//     <Sidebar className="bg-gradient-to-br from-red-600 via-red-700 to-black dark:from-red-600 dark:via-red-700 dark:to-black">
//       <SidebarHeader className="bg-transparent">
//         <SidebarMenu>
//           <SidebarMenuItem>
//             <SidebarMenuButton size="lg" className="data-[state=open]:bg-white/10 text-white hover:bg-white/10 text-xl">
//               <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-white/20 text-white-xl">
//                 <Dumbbell className="size-9" />
//               </div>
//               <div className="flex flex-col gap-0.5 leading-none">
//                 <span className="font-semibold text-white">FitNest</span>
//                 <span className="text-xs text-white/80">Fitness Dashboard</span>
//               </div>
//             </SidebarMenuButton>
//           </SidebarMenuItem>
//         </SidebarMenu>
//       </SidebarHeader>
//       <SidebarContent className="bg-transparent">
//         <SidebarGroup>
//           <SidebarGroupContent>
//             <SidebarMenu>
//               {sidebarItems.map((item) => (
//                 <SidebarMenuItem key={item.title}>
//                   <SidebarMenuButton asChild isActive={item.isActive} className="text-lg">
//                     <a href={item.url} className={`text-white hover:bg-white/10 ${item.isActive ? "bg-white/20 text-white font-semibold" : ""}`}>
//                       <item.icon className="text-white" />
//                       <span>{item.title}</span>
//                     </a>
//                   </SidebarMenuButton>
//                 </SidebarMenuItem>
//               ))}
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>
//       </SidebarContent>
//       <SidebarFooter className="bg-transparent">
//         <SidebarMenu>
//           <SidebarMenuItem>
//             <SidebarMenuButton className="text-white hover:bg-white/10">
//               <LogOut className="text-white" />
//               <span>Logout</span>
//             </SidebarMenuButton>
//           </SidebarMenuItem>
//         </SidebarMenu>
//       </SidebarFooter>
//       <SidebarRail />
//     </Sidebar>
//   )
// }

// Define or import the missing types
interface User {
  id: number;
  name: string;
  avatar?: string;
}

interface Session {
  id: number;
  title: string;
  trainer: string;
  date: string;
  time: string;
  amount: string;
  description: string;
  image?: string;
}

interface ProgressEntry {
  date: string;
  weight: number;
  height: number;
}

export default function UserDashboard() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [currentQuote, setCurrentQuote] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isWeightDialogOpen, setIsWeightDialogOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    task_date: format(new Date(), "yyyy-MM-dd"),
    task: "",
    note: "",
    customer_id: 1 // Use fetched user ID or fallback
  });
  const [weightForm, setWeightForm] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    weight: ""
  });
  const [tasks, setTasks] = useState([
    { id: 1, task_date: format(new Date(), "yyyy-MM-dd"), task: "Morning workout", note: "HIIT session", type: "workout" },
    { id: 2, task_date: format(new Date(), "yyyy-MM-dd"), task: "Nutrition consultation", note: "Diet planning", type: "appointment" },
    { id: 3, task_date: format(new Date(), "yyyy-MM-dd"), task: "Rest day", note: "Recovery", type: "rest" }
  ]);
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorr] = useState(null);
  const [bmiData, setBmiData] = useState<{ day: string; bmi: number }[]>([]);
  const [weightData, setWeightData] = useState<{ day: string; weight: number }[]>([]);

  useEffect(() => {
    const fetchUserAndSessions = async () => {
      try {
        const userResponse = await axios.get<User>(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/customer`);
        setUser(userResponse.data);

        const sessionsResponse = await axios.get<Session[]>(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/gym/subscribe`, {
          params: { userId: userResponse.data.id },
        });
        setSessions(sessionsResponse.data);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setLoading(false);
      }
    };

    fetchUserAndSessions();
  }, []);

  useEffect(() => {
    const fetchBmiData = async () => {
      try {
        const response = await axios.get<ProgressEntry[]>(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/user/progress`, {
          params: { userId: user?.id },
        });

        const bmiValues = response.data.map((entry) => {
          const heightInMeters = entry.height / 100; // Convert height to meters
          const bmi = entry.weight / (heightInMeters * heightInMeters);
          return { day: entry.date, bmi: parseFloat(bmi.toFixed(1)) }; // Round BMI to 1 decimal place
        });

        setBmiData(bmiValues);
      } catch (err) {
        console.error("Error fetching BMI data:", err);
      }
    };

    if (user?.id) {
      fetchBmiData();
    }
  }, [user]);

  useEffect(() => {
    const fetchWeightData = async () => {
      try {
        const response = await axios.get<ProgressEntry[]>(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/user/progress`, {
          params: { userId: user?.id },
        });

        const weightValues = response.data.map((entry) => ({
          day: entry.date,
          weight: entry.weight,
        }));

        setWeightData(weightValues);
      } catch (err) {
        console.error("Error fetching weight data:", err);
      }
    };

    if (user?.id) {
      fetchWeightData();
    }
  }, [user]);

  // Ensure the theme is properly initialized and debug the toggle functionality
  useEffect(() => {
    if (!mounted) {
      setMounted(true);
    }
  }, [mounted]);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % motivationQuotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted || loading) return <p>Loading...</p>;

  const today = format(new Date(), "EEEE, MMMM do, yyyy");

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTask = {
      id: Date.now(),
      ...taskForm,
      type: "workout" // Default type
    };
    setTasks((prev) => [...prev, newTask]);
    setTaskForm({
      task_date: format(new Date(), "yyyy-MM-dd"),
      task: "",
      note: "",
      customer_id: 1
    });
    setIsTaskDialogOpen(false);
  };

  const handleWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically update the weight data
    console.log("Weight added:", weightForm);
    setWeightForm({
      date: format(new Date(), "yyyy-MM-dd"),
      weight: ""
    });
    setIsWeightDialogOpen(false);
  };

  return (
    <SidebarProvider>
      <SideBar/>
      <SidebarInset className="flex">
        <div className="flex-1">
          {/* Header */}
          <TopBar/>

          {/* Main Content */}
          <div className="flex-1 space-y-6 p-6">
            {/* Motivation Quote */}
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <AnimatedQuote quote={motivationQuotes[currentQuote]} />
              </CardContent>
            </Card>

            {/* Streak Card */}
            <Progress/>

            {/* Today's Sessions */}
            <TodaySessions/>

            {/* Upcoming Sessions */}
            {/* <Card>
              <CardHeader>
                <CardTitle>Upcoming Sessions</CardTitle>
                <CardDescription>Your scheduled sessions for the coming days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sessions.map((session) => (
                      <Card key={session.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-2">
                        <img 
                          src={session.image || "/placeholder.svg"} 
                          alt={session.title}
                          className="w-full h-24 object-cover rounded-md mb-2"
                        />
                        <CardTitle className="text-lg">{session.title}</CardTitle>
                        <CardDescription>with {session.trainer}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Date:</span>
                            <Badge variant="outline">{session.date}</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Time:</span>
                            <Badge variant="outline">{session.time}</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Amount:</span>
                            <Badge variant="default" className="bg-green-500">{session.amount}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">{session.description}</p>
                          <Button size="sm" className="w-full mt-3" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card> */}
            <UpcomingSessions/>

            {/* KPI Results */}
              <KPI/>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>BMI Variation</CardTitle>
                  <CardDescription>Weekly BMI tracking</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart data={bmiData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis domain={["dataMin - 0.5", "dataMax + 0.5"]} />
                      <Tooltip />
                      <Scatter dataKey="bmi" fill="#3b82f6" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Weight Variation</CardTitle>
                    <CardDescription>Weekly weight tracking</CardDescription>
                  </div>
                  <Dialog open={isWeightDialogOpen} onOpenChange={setIsWeightDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Weight
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Add Weight Entry</DialogTitle>
                        <DialogDescription>
                          Record your current weight for tracking.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleWeightSubmit}>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="weight_date" className="text-right">
                              Date
                            </Label>
                            <Input
                              id="weight_date"
                              type="date"
                              value={weightForm.date}
                              onChange={(e) => setWeightForm(prev => ({ ...prev, date: e.target.value }))}
                              className="col-span-3"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="weight" className="text-right">
                              Weight (kg)
                            </Label>
                            <Input
                              id="weight"
                              type="number"
                              step="0.1"
                              min="0"
                              value={weightForm.weight}
                              onChange={(e) => setWeightForm(prev => ({ ...prev, weight: e.target.value }))}
                              className="col-span-3"
                              placeholder="Enter weight"
                              required
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit">Add Weight</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={weightData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis domain={["dataMin - 1", "dataMax + 1"]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 border-l bg-muted/20 p-4 space-y-6">
          {/* Google Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5" />
                Schedule
              </CardTitle>
              <CardDescription>Manage your workout schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <CalendarUI
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
              <div className="mt-4 space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
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
              <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Task</DialogTitle>
                    <DialogDescription>
                      Create a new task for your fitness schedule.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleTaskSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="task_date" className="text-right">
                          Date
                        </Label>
                        <Input
                          id="task_date"
                          type="date"
                          value={taskForm.task_date}
                          onChange={(e) => setTaskForm(prev => ({ ...prev, task_date: e.target.value }))}
                          className="col-span-3"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="task" className="text-right">
                          Task
                        </Label>
                        <Input
                          id="task"
                          value={taskForm.task}
                          onChange={(e) => setTaskForm(prev => ({ ...prev, task: e.target.value }))}
                          className="col-span-3"
                          placeholder="Enter task title"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="note" className="text-right">
                          Note
                        </Label>
                        <Textarea
                          id="note"
                          value={taskForm.note}
                          onChange={(e) => setTaskForm(prev => ({ ...prev, note: e.target.value }))}
                          className="col-span-3"
                          placeholder="Add additional notes"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Add Task</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              
              <div className="mt-4 space-y-3">
                <h4 className="text-sm font-medium">Recent Tasks</h4>
                <div className="space-y-2">
                  {tasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-start gap-2 p-2 rounded border">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        task.type === 'workout' ? 'bg-red-500' : 
                        task.type === 'appointment' ? 'bg-blue-500' : 'bg-green-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{task.task}</p>
                        <p className="text-xs text-muted-foreground">{task.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}