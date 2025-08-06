"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
    <div className="p-6 space-y-6">
      {/* Top Bar */}
      <header className="flex items-center justify-between p-4 bg-red-800 text-white shadow-md">
        <div className="flex items-center gap-2">
          <img
            src="/placeholder-logo.svg"
            alt="Gym Logo"
            className="w-10 h-10"
          />
          <h1 className="text-2xl font-bold">FitNest Gym</h1>
        </div>
      </header>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-800 to-red-500 text-white">
          <CardHeader>
            <CardTitle>Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {mockAnalytics.totalMembers}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-800 to-red-500 text-white">
          <CardHeader>
            <CardTitle>Total Trainers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {mockAnalytics.totalTrainers}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-800 to-red-500 text-white">
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {mockAnalytics.monthlyRevenue}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-800 to-red-500 text-white">
          <CardHeader>
            <CardTitle>Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {mockAnalytics.activeSubscriptions}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Members</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Profile</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProfiles
              .filter((profile) => profile.role === "Member")
              .map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell>
                    <img
                      src="/placeholder-user.jpg"
                      alt="Profile Icon"
                      className="w-8 h-8 rounded-full"
                    />
                  </TableCell>
                  <TableCell>{profile.name}</TableCell>
                  <TableCell>{profile.email}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Trainers</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Profile</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProfiles
              .filter((profile) => profile.role === "Trainer")
              .map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell>
                    <img
                      src="/placeholder-user.jpg"
                      alt="Profile Icon"
                      className="w-8 h-8 rounded-full"
                    />
                  </TableCell>
                  <TableCell>{profile.name}</TableCell>
                  <TableCell>{profile.email}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {/* Gym Plans Section */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Gym Plans</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockPlans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell>{plan.name}</TableCell>
                <TableCell>{plan.price}</TableCell>
                <TableCell>{plan.description}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleEditPlan(plan)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeletePlan(plan.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button
          className="mt-4"
          onClick={() => setIsPlanDialogOpen(true)}
        >
          Add New Plan
        </Button>

        <Dialog
          open={isPlanDialogOpen}
          onOpenChange={setIsPlanDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {currentPlan.id ? "Edit Plan" : "Add New Plan"}
              </DialogTitle>
            </DialogHeader>
            <form
              onSubmit={handlePlanSubmit}
              className="space-y-4"
            >
              <Input
                placeholder="Plan Name"
                value={currentPlan.name}
                onChange={(e) =>
                  setCurrentPlan((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                required
              />
              <Input
                placeholder="Price"
                value={currentPlan.price}
                onChange={(e) =>
                  setCurrentPlan((prev) => ({
                    ...prev,
                    price: e.target.value,
                  }))
                }
                required
              />
              <Input
                placeholder="Description"
                value={currentPlan.description}
                onChange={(e) =>
                  setCurrentPlan((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                required
              />
              <DialogFooter>
                <Button type="submit">
                  {currentPlan.id ? "Update" : "Add"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
