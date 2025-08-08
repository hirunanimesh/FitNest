"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  Building,
  DollarSign,
  UserCheck,
  Search,
  Plus,
  Edit,
  Trash2
} from "lucide-react";

const mockAnalytics = {
  totalMembers: 120,
  totalTrainers: 15,
  monthlyRevenue: "$12,000",
  activeSubscriptions: 95,
};

const mockProfiles = [
  { id: 1, name: "John Doe", role: "Member", email: "john@example.com" },
  { id: 2, name: "Jane Smith", role: "Trainer", email: "jane@example.com" },
  { id: 3, name: "Alice Johnson", role: "Member", email: "alice@example.com" },
];

export default function GymDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProfiles, setFilteredProfiles] = useState(mockProfiles);
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [mockPlans, setMockPlans] = useState<{ id: number; name: string; price: string; description: string }[]>(
    [
      { id: 1, name: "Basic Plan", price: "$20/month", description: "Access to gym equipment" },
      { id: 2, name: "Premium Plan", price: "$50/month", description: "Includes personal trainer sessions" },
      { id: 3, name: "Family Plan", price: "$80/month", description: "Access for up to 4 family members" },
    ]
  );
  const [currentPlan, setCurrentPlan] = useState<{ id: number | null; name: string; price: string; description: string }>(
    { id: null, name: "", price: "", description: "" }
  );

  useEffect(() => {
    setFilteredProfiles(
      mockProfiles.filter((profile) =>
        profile.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery]);

  const handleEditPlan = (plan: { id: number; name: string; price: string; description: string }) => {
    setCurrentPlan(plan);
    setIsPlanDialogOpen(true);
  };

  const handleDeletePlan = (planId: number) => {
    setMockPlans((prev) => prev.filter((plan) => plan.id !== planId));
  };

  const handlePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPlan.id) {
      setMockPlans((prev) => prev.map((plan) => (plan.id === currentPlan.id ? { ...currentPlan, id: currentPlan.id! } : plan)));
    } else {
      setMockPlans((prev) => [...prev, { ...currentPlan, id: Date.now() }]);
    }
    setCurrentPlan({ id: null, name: "", price: "", description: "" });
    setIsPlanDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="border-b bg-background">
        <div className="container mx-auto flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Building className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">FitNest Gym</h1>
              <p className="text-sm text-muted-foreground">Gym Management Dashboard</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Gym Dashboard</h1>
          <p className="text-muted-foreground">Manage your gym operations and monitor performance</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Members</p>
                  <p className="text-2xl font-bold">{mockAnalytics.totalMembers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Trainers</p>
                  <p className="text-2xl font-bold">{mockAnalytics.totalTrainers}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                  <p className="text-2xl font-bold">{mockAnalytics.monthlyRevenue}</p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                  <p className="text-2xl font-bold">{mockAnalytics.activeSubscriptions}</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="members" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="trainers">Trainers</TabsTrigger>
            <TabsTrigger value="plans">Gym Plans</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Members Management</CardTitle>
                <CardDescription>View and manage gym members</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-4">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Profile</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProfiles
                      .filter((profile) => profile.role === "Member")
                      .map((profile) => (
                        <TableRow key={profile.id}>
                          <TableCell>
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          </TableCell>
                          <TableCell className="font-medium">{profile.name}</TableCell>
                          <TableCell>{profile.email}</TableCell>
                          <TableCell>
                            <Badge variant="default">Active</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trainers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Trainers Management</CardTitle>
                <CardDescription>View and manage gym trainers</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Profile</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Specialization</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProfiles
                      .filter((profile) => profile.role === "Trainer")
                      .map((profile) => (
                        <TableRow key={profile.id}>
                          <TableCell>
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          </TableCell>
                          <TableCell className="font-medium">{profile.name}</TableCell>
                          <TableCell>{profile.email}</TableCell>
                          <TableCell>
                            <Badge variant="default">Active</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">Personal Training</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plans" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Gym Plans Management</CardTitle>
                    <CardDescription>Manage subscription plans and pricing</CardDescription>
                  </div>
                  <Button
                    onClick={() => {
                      setCurrentPlan({ id: null, name: "", price: "", description: "" });
                      setIsPlanDialogOpen(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Plan
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plan Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockPlans.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell className="font-medium">{plan.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{plan.price}</Badge>
                        </TableCell>
                        <TableCell>{plan.description}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditPlan(plan)}
                            >
                              <Edit className="mr-1 h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeletePlan(plan.id)}
                            >
                              <Trash2 className="mr-1 h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {currentPlan.id ? "Edit Plan" : "Add New Plan"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handlePlanSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Plan Name</label>
                <Input
                  placeholder="Enter plan name"
                  value={currentPlan.name}
                  onChange={(e) =>
                    setCurrentPlan((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Price</label>
                <Input
                  placeholder="e.g., $20/month"
                  value={currentPlan.price}
                  onChange={(e) =>
                    setCurrentPlan((prev) => ({
                      ...prev,
                      price: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Input
                  placeholder="Enter plan description"
                  value={currentPlan.description}
                  onChange={(e) =>
                    setCurrentPlan((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsPlanDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {currentPlan.id ? "Update Plan" : "Add Plan"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}