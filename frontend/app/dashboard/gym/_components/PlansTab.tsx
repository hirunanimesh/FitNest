import React from 'react'
import { useState,useEffect } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Edit, Trash2, Plus } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Search } from 'lucide-react';

const PlansTab = () => {

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
    <div> <Card className='bg-gray-800 text-white'>
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle>Gym Plans Management</CardTitle>
          <CardDescription className='text-gray-300'> Manage subscription plans and pricing</CardDescription>
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
            <TableHead className='text-gray-300'>Plan Name</TableHead>
            <TableHead className='text-gray-300'>Price</TableHead>
            <TableHead className='text-gray-300'>Description</TableHead>
            <TableHead className='text-gray-300'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockPlans.map((plan) => (
            <TableRow key={plan.id}>
              <TableCell className="font-medium">{plan.name}</TableCell>
              <TableCell>
                <Badge variant="outline" className='text-white'>{plan.price}</Badge>
              </TableCell>
              <TableCell>{plan.description}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className='text-black '
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

  <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
          <DialogContent className='bg-gray-900 text-white border border-gray-900'>
            <DialogHeader>
              <DialogTitle>
                {currentPlan.id ? "Edit Plan" : "Add New Plan"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handlePlanSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Plan Name</label>
                <Input
                  className='text-gray-600'
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
                  className='text-gray-600'
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
                  className='text-gray-600'
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
                <Button type="button" className='text-black' variant="outline" onClick={() => setIsPlanDialogOpen(false)}>
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
  )
}

export default PlansTab
