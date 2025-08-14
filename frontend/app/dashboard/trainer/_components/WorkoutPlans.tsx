'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash, Plus } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Define the Plan interface
interface Plan {
  id: number;
  title: string;
  category: 'workout' | 'diet';
  description: string;
  instructionPdf?: string; // URL or path to the PDF (optional)
}

// Mock data for workout and diet plans
const initialPlans: Plan[] = [
  {
    id: 1,
    title: 'Strength Training',
    category: 'workout',
    description: 'Full-body strength training program for beginners.',
    instructionPdf: '/pdfs/strength-training.pdf',
  },
  {
    id: 2,
    title: 'Keto Diet Plan',
    category: 'diet',
    description: 'Low-carb, high-fat diet plan for weight loss.',
    instructionPdf: '/pdfs/keto-diet.pdf',
  },
  {
    id: 3,
    title: 'HIIT Workout',
    category: 'workout',
    description: 'High-intensity interval training for advanced users.',
    instructionPdf: '/pdfs/hiit-workout.pdf',
  },
  {
    id: 4,
    title: 'Vegan Meal Plan',
    category: 'diet',
    description: 'Plant-based meal plan for balanced nutrition.',
    instructionPdf: '/pdfs/vegan-meal-plan.pdf',
  },
];

// CreatePlan component for adding new plans
const CreatePlan = ({ onAddPlan }: { onAddPlan: (plan: Plan) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'workout' as 'workout' | 'diet',
    description: '',
    instructionPdf: null as File | null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPlan: Plan = {
      id: Date.now(), // Temporary ID; replace with backend-generated ID in production
      title: formData.title,
      category: formData.category,
      description: formData.description,
      instructionPdf: formData.instructionPdf ? URL.createObjectURL(formData.instructionPdf) : undefined,
    };
    onAddPlan(newPlan);
    setFormData({ title: '', category: 'workout', description: '', instructionPdf: null });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add New Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Plan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter plan title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value: 'workout' | 'diet') => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="workout">Workout</SelectItem>
                  <SelectItem value="diet">Diet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter plan description"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instructionPdf">Instruction PDF</Label>
              <Input
                id="instructionPdf"
                type="file"
                accept="application/pdf"
                onChange={(e) => setFormData({ ...formData, instructionPdf: e.target.files?.[0] || null })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Plan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Main WorkoutAndDietPlans component
const WorkoutAndDietPlans = () => {
  const [plans, setPlans] = useState<Plan[]>(initialPlans);

  const handleAddPlan = (newPlan: Plan) => {
    setPlans((prev) => [...prev, newPlan]);
  };

  const handleDeletePlan = (planId: number) => {
    console.log(`Deleting plan with ID: ${planId}`);
    setPlans((prev) => prev.filter((plan) => plan.id !== planId));
  };

  const handleEditPlan = (planId: number) => {
    console.log(`Editing plan with ID: ${planId}`);
    // Implement edit logic here (e.g., open a dialog with pre-filled data)
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-row justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-white">Workout & Diet Plans</h2>
          <CreatePlan onAddPlan={handleAddPlan} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card key={plan.id} className="bg-gray-800">
              <CardHeader>
                <CardTitle className="text-md text-white">
                  {plan.title} <span className="text-xs text-gray-400">({plan.category})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-gray-300">
                <p>{plan.description}</p>
                {plan.instructionPdf ? (
                  <p>
                    Instruction PDF:{' '}
                    <Link className="text-blue-700 underline" href={plan.instructionPdf}>
                      View PDF
                    </Link>
                  </p>
                ) : (
                  <p>No PDF uploaded</p>
                )}
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-black"
                    onClick={() => handleEditPlan(plan.id)}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button size="sm" onClick={() => handleDeletePlan(plan.id)}>
                    <Trash className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {plans.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No plans available</p>
            <p className="text-sm">Click "Add New Plan" to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutAndDietPlans;