'use client'

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Plus } from 'lucide-react';
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

// Extend Plan interface
interface Plan {
  id: number;
  title: string;
  category: 'workout' | 'diet';
  description: string;
  instructionPdf?: string;
  img_url: string;
}

// Mock data
const initialPlans: Plan[] = [
  {
    id: 1,
    title: 'Strength Training',
    category: 'workout',
    description: 'Full-body strength training program for beginners.',
    instructionPdf: '/pdfs/strength-training.pdf',
    
    img_url: 
      'https://pouch.jumpshare.com/preview/7fNgZZyybniUasB_-ns5Skgh7SXfV2MMyNfU5nLNVQgJx8bzUomVql7lWleexm0DJrkPb3zbhBKz3JSBYuJ-wZ8a64vhw-G6H-eGKkN8mrw',
  },
  {
    id: 2,
    title: 'Keto Diet Plan',
    category: 'diet',
    description: 'Low-carb, high-fat diet plan for weight loss.',
    instructionPdf: '/pdfs/keto-diet.pdf',
   
    img_url:
      'https://pouch.jumpshare.com/preview/EE2dMW8FIBEZxMEsuVb6vgUqcVfEA-3lSQX9QFJtJPTrdSrH35W2raQSA542ZZepJrkPb3zbhBKz3JSBYuJ-weaiEIW5e8c61vYWyozgPsQ',
  },
  {
    id: 3,
    title: 'HIIT Workout',
    category: 'workout',
    description: 'High-intensity interval training for advanced users.',
    instructionPdf: '/pdfs/hiit-workout.pdf',
    
    img_url: 'https://i.postimg.cc/HWwQf6f7/20-minute-hiit-workout.jpg',
  },
  {
    id: 4,
    title: 'Vegan Meal Plan',
    category: 'diet',
    description: 'Plant-based meal plan for balanced nutrition.',
    instructionPdf: '/pdfs/vegan-meal-plan.pdf',
    
    img_url: 'https://i.postimg.cc/bJXt5ngT/images-2.jpg',
  },
];

// EditPlan component
const EditPlan = ({ plan, onUpdatePlan }: { plan: Plan; onUpdatePlan: (updatedPlan: Plan) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: plan.title,
    category: plan.category,
    description: plan.description,
    instructionPdf: null as File | null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedPlan: Plan = {
      ...plan,
      title: formData.title,
      category: formData.category,
      description: formData.description,
      instructionPdf: formData.instructionPdf
        ? URL.createObjectURL(formData.instructionPdf)
        : plan.instructionPdf,
    };
    onUpdatePlan(updatedPlan);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700">
          <Edit className="h-4 w-4 mr-1" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] text-white bg-gray-800">
        <DialogHeader>
          <DialogTitle>Edit Plan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                className="bg-gray-800 text-white border-gray-600 min-h-[60px] flex-1"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                  
                }
                placeholder="Enter plan title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select
              value={formData.category}
              onValueChange={(value: 'workout' | 'diet') =>
                setFormData({ ...formData, category: value })
              }
              >
              <SelectTrigger className="bg-gray-800 text-white border-gray-600  flex-1">
                <SelectValue
                placeholder="Select category"
                className="bg-gray-800 text-white border-gray-600  flex-1"
                />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-white border-gray-600 flex-1">
                <SelectItem value="workout">Workout</SelectItem>
                <SelectItem value="diet">Diet</SelectItem>
              </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                className="bg-gray-800 text-white border-gray-600 min-h-[60px] flex-1"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter plan description"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-instructionPdf">Instruction PDF (optional)</Label>
              <Input
                id="edit-instructionPdf"
                type="file"
                className="bg-gray-800 text-white border-gray-600 min-h-[60px] flex-1"
                accept="application/pdf"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    instructionPdf: e.target.files?.[0] || null,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              className="bg-gray-800 text-white border-gray-600"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Update Plan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
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
      id: Date.now(),
      title: formData.title,
      category: formData.category,
      description: formData.description,
      instructionPdf: formData.instructionPdf
        ? URL.createObjectURL(formData.instructionPdf)
        : undefined,
     
      image: '/images/default.jpg',
    };
    onAddPlan(newPlan);
    setFormData({
      title: '',
      category: 'workout',
      description: '',
      instructionPdf: null,
    });
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
      <DialogContent className="sm:max-w-[500px] bg-gray-800 text-white border-gray-600 flex-1">
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
                className="bg-gray-800 text-white border-gray-600 flex-1"
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter plan title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                
                onValueChange={(value: 'workout' | 'diet') =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger className="bg-gray-800 text-white border-gray-600 flex-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 text-white border-gray-600 flex-1">
                  <SelectItem value="workout">Workout</SelectItem>
                  <SelectItem value="diet">Diet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                className="bg-gray-800 text-white border-gray-600 flex-1"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter plan description"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instructionPdf">Instruction PDF</Label>
              <Input
                id="instructionPdf"
                type="file"
                className="bg-gray-800 text-white border-gray-600 flex-1"
                accept="application/pdf"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    instructionPdf: e.target.files?.[0] || null,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              className="bg-gray-800 text-white border-gray-600 "
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Add Plan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Main component
const WorkoutAndDietPlans = () => {
  const [plans, setPlans] = useState<Plan[]>(initialPlans);

  const handleAddPlan = (newPlan: Plan) => {
    setPlans((prev) => [...prev, newPlan]);
  };

  const handleUpdatePlan = (updatedPlan: Plan) => {
    setPlans((prev) => prev.map((plan) => plan.id === updatedPlan.id ? updatedPlan : plan));
  };

  const handleDeletePlan = (planId: number) => {
    console.log(`Deleting plan with ID: ${planId}`);
    setPlans((prev) => prev.filter((plan) => plan.id !== planId));
  };

  const handleEditPlan = (planId: number) => {
    console.log(`Editing plan with ID: ${planId}`);
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-row justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-white">Workout & Diet Plans</h2>
          <CreatePlan onAddPlan={handleAddPlan} />
        </div>

        <div className="space-y-4">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className="flex items-center bg-gray-800 rounded-2xl shadow-md overflow-hidden"
            >
              <img
                src={plan.image}
                alt={plan.title}
                className="w-32 h-24 object-cover"
              />
              <div className="flex justify-between items-center w-full px-4 py-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {plan.title}{' '}
                    <span className="text-xs text-gray-400">
                      ({plan.category})
                    </span>
                  </h3>
                  <p className="text-sm text-gray-400">{plan.description}</p>
                  {plan.instructionPdf && (
                    <a
                      href={plan.instructionPdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 text-sm underline hover:text-blue-300"
                    >
                      View Instructions (PDF)
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <EditPlan plan={plan} onUpdatePlan={handleUpdatePlan} />
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 "
                    onClick={() => handleDeletePlan(plan.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
              </div>
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
