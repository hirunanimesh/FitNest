"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Bell, CalendarIcon, Plus, Edit, Trash } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarUI } from "@/components/ui/calendar";

// Define the Plan type
interface Plan {
  id: number;
  title: string;
  description: string;
  timeSlots: string;
  duration: string;
  zoomLink: string;
  users: string[]; // Array of user IDs or names
}

const mockTrainer = {
  name: "John Doe",
  email: "john@fitnest.com",
};

const TrainerDashboard = () => {
  const [mounted, setMounted] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [planForm, setPlanForm] = useState({
    title: "",
    description: "",
    timeSlots: "",
    duration: "",
    zoomLink: "",
  });
  // Add content management functionality
  const [contentForm, setContentForm] = useState<{
    title: string;
    description: string;
    file: File | null;
  }>({
    title: "",
    description: "",
    file: null,
  });
  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);
  // Improve calendar visibility and add task functionality
  const [calendarTasks, setCalendarTasks] = useState<{ task: string; date: Date }[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handlePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPlan: Plan = {
      id: Date.now(),
      ...planForm,
      users: [],
    };
    setPlans((prev) => [...prev, newPlan]);
    setPlanForm({ title: "", description: "", timeSlots: "", duration: "", zoomLink: "" });
    setIsPlanDialogOpen(false);
  };

  const handleDeletePlan = (id: number) => {
    setPlans((prev) => prev.filter((plan) => plan.id !== id));
  };

  const handleContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    // Ensure the file is only appended if it exists
    if (contentForm.file) {
      formData.append("file", contentForm.file);
    }
    formData.append("upload_preset", "your_upload_preset"); // Replace with your Cloudinary upload preset

    const response = await fetch("https://api.cloudinary.com/v1_1/your_cloud_name/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    console.log("Uploaded content URL:", data.secure_url);
    setContentForm({ title: "", description: "", file: null });
    setIsContentDialogOpen(false);
  };

  const handleAddTask = (task: string, date: Date) => {
    setCalendarTasks((prev) => [...prev, { task, date }]);
  };

  const today = format(new Date(), "EEEE, MMMM do, yyyy");

  return (
    <SidebarProvider>
      <Sidebar className="bg-gradient-to-br from-blue-600 via-blue-700 to-black">
        <SidebarHeader className="bg-transparent">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" className="text-white hover:bg-white/10">
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold text-white">Trainer Dashboard</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="bg-transparent">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton className="text-white hover:bg-white/10">
                    <span>Dashboard</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="bg-transparent">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="text-white hover:bg-white/10">
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset className="flex">
        <div className="flex-1">
          <header className="flex h-16 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex flex-1 items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold">Hi, {mockTrainer.name}</h1>
                <p className="text-sm text-muted-foreground">{today}</p>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon">
                  <Bell className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          <div className="flex-1 space-y-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Total Plans</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{plans.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Total Users Connected</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{plans.reduce((acc, plan) => acc + plan.users.length, 0)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Last Month Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$0</div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Ongoing Plans</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <Card key={plan.id}>
                    <CardHeader>
                      <CardTitle>{plan.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{plan.description}</p>
                      <p>Duration: {plan.duration}</p>
                      <p>Time Slots: {plan.timeSlots}</p>
                      <p>Zoom Link: {plan.zoomLink}</p>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" /> Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeletePlan(plan.id)}>
                          <Trash className="h-4 w-4" /> Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" /> Create New Plan
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Plan</DialogTitle>
                </DialogHeader>
                <form onSubmit={handlePlanSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right">
                        Title
                      </Label>
                      <Input
                        id="title"
                        value={planForm.title}
                        onChange={(e) => setPlanForm((prev) => ({ ...prev, title: e.target.value }))}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Description
                      </Label>
                      <Input
                        id="description"
                        value={planForm.description}
                        onChange={(e) => setPlanForm((prev) => ({ ...prev, description: e.target.value }))}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="timeSlots" className="text-right">
                        Time Slots
                      </Label>
                      <Input
                        id="timeSlots"
                        value={planForm.timeSlots}
                        onChange={(e) => setPlanForm((prev) => ({ ...prev, timeSlots: e.target.value }))}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="duration" className="text-right">
                        Duration
                      </Label>
                      <Input
                        id="duration"
                        value={planForm.duration}
                        onChange={(e) => setPlanForm((prev) => ({ ...prev, duration: e.target.value }))}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="zoomLink" className="text-right">
                        Zoom Link
                      </Label>
                      <Input
                        id="zoomLink"
                        value={planForm.zoomLink}
                        onChange={(e) => setPlanForm((prev) => ({ ...prev, zoomLink: e.target.value }))}
                        className="col-span-3"
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Create Plan</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isContentDialogOpen} onOpenChange={setIsContentDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" /> Upload Content
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Content</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleContentSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right">
                        Title
                      </Label>
                      <Input
                        id="title"
                        value={contentForm.title}
                        onChange={(e) => setContentForm((prev) => ({ ...prev, title: e.target.value }))}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Description
                      </Label>
                      <Input
                        id="description"
                        value={contentForm.description}
                        onChange={(e) => setContentForm((prev) => ({ ...prev, description: e.target.value }))}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="file" className="text-right">
                        File
                      </Label>
                      <Input
                        id="file"
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setContentForm((prev) => ({ ...prev, file }));
                        }}
                        className="col-span-3"
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Upload Content</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <div>
              <h2 className="text-xl font-semibold mb-4">Calendar</h2>
              <CalendarUI className="rounded-md border border-border" />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default TrainerDashboard;
