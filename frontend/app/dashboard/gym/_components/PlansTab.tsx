import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Edit, Trash2, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Define interfaces for TypeScript
interface Trainer {
  id: number;
  name: string;
  role: string;
  email: string;
}

interface Plan {
  id: number;
  name: string;
  price: string;
  description: string;
  duration: string;
  trainers: number[];
}

// Mock trainers data
const mockTrainers: Trainer[] = [
  { id: 1, name: 'John Doe', role: 'Trainer', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', role: 'Trainer', email: 'jane@example.com' },
  { id: 3, name: 'Alice Johnson', role: 'Trainer', email: 'alice@example.com' },
];

const PlansTab: React.FC = () => {
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState<boolean>(false);
  const [mockPlans, setMockPlans] = useState<Plan[]>([
    {
      id: 1,
      name: 'Basic Plan',
      price: '$20',
      description: 'Access to gym equipment',
      duration: 'Monthly Plan',
      trainers: [1],
    },
    {
      id: 2,
      name: 'Premium Plan',
      price: '$50',
      description: 'Includes personal trainer sessions',
      duration: 'Monthly Plan',
      trainers: [1, 2],
    },
    {
      id: 3,
      name: 'Family Plan',
      price: '$80',
      description: 'Access for up to 4 family members',
      duration: 'Yearly Plan',
      trainers: [3],
    },
  ]);
  const [currentPlan, setCurrentPlan] = useState<{
    id: number | null;
    name: string;
    price: string;
    description: string;
    duration: string;
    trainers: number[];
  }>({
    id: null,
    name: '',
    price: '',
    description: '',
    duration: 'Monthly Plan',
    trainers: [],
  });

  const handleEditPlan = (plan: Plan) => {
    setCurrentPlan(plan);
    setIsPlanDialogOpen(true);
  };

  const handleDeletePlan = (planId: number) => {
    setMockPlans((prev) => prev.filter((plan) => plan.id !== planId));
  };

  const handlePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPlan.id) {
      setMockPlans((prev) =>
        prev.map((plan) => (plan.id === currentPlan.id ? { ...currentPlan, id: currentPlan.id! } : plan))
      );
    } else {
      setMockPlans((prev) => [...prev, { ...currentPlan, id: Date.now() }]);
    }
    setCurrentPlan({ id: null, name: '', price: '', description: '', duration: 'Monthly Plan', trainers: [] });
    setIsPlanDialogOpen(false);
  };

  const toggleTrainer = (trainerId: number) => {
    setCurrentPlan((prev) => ({
      ...prev,
      trainers: prev.trainers.includes(trainerId)
        ? prev.trainers.filter((id) => id !== trainerId)
        : [...prev.trainers, trainerId],
    }));
  };

  return (
    <div>
      <Card className="bg-gray-800 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gym Plans Management</CardTitle>
              <CardDescription className="text-gray-300">Manage subscription plans and pricing</CardDescription>
            </div>
            <Button
              onClick={() => {
                setCurrentPlan({ id: null, name: '', price: '', description: '', duration: 'Monthly Plan', trainers: [] });
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
                <TableHead className="text-gray-300">Plan Name</TableHead>
                <TableHead className="text-gray-300">Price</TableHead>
                <TableHead className="text-gray-300">Description</TableHead>
                <TableHead className="text-gray-300">Duration</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPlans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-white">
                      {plan.price}
                    </Badge>
                  </TableCell>
                  <TableCell>{plan.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-white">
                      {plan.duration}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-black"
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
        <DialogContent className="bg-gray-900 text-white border border-gray-900">
          <DialogHeader>
            <DialogTitle>{currentPlan.id ? 'Edit Plan' : 'Add New Plan'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePlanSubmit} className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Title</Label>
              <Input
                className="text-gray-600"
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
              <Label className="text-sm font-medium mb-2 block">Price</Label>
              <Input
                className="text-gray-600"
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
              <Label className="text-sm font-medium mb-2 block">Description</Label>
              <Input
                className="text-gray-600"
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
            <div>
              <Label className="text-sm font-medium mb-2 block">Duration</Label>
              <Select
                value={currentPlan.duration}
                onValueChange={(value) =>
                  setCurrentPlan((prev) => ({
                    ...prev,
                    duration: value,
                  }))
                }
              >
                <SelectTrigger className="w-full text-gray-600">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="One Day Plan">One Day Plan</SelectItem>
                  <SelectItem value="Monthly Plan">Monthly Plan</SelectItem>
                  <SelectItem value="Yearly Plan">Yearly Plan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Assign Trainers</Label>
              <div className="space-y-2">
                {mockTrainers.map((trainer) => (
                  <div key={trainer.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`trainer-${trainer.id}`}
                      checked={currentPlan.trainers.includes(trainer.id)}
                      onCheckedChange={() => toggleTrainer(trainer.id)}
                    />
                    <Label htmlFor={`trainer-${trainer.id}`}>{trainer.name}</Label>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                className="text-black"
                variant="outline"
                onClick={() => setIsPlanDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">{currentPlan.id ? 'Update Plan' : 'Add Plan'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlansTab;