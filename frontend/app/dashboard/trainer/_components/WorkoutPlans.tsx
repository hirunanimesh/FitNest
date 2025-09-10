"use client"

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Plus } from 'lucide-react';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogTrigger,DialogFooter} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '@/components/ui/select';
import { useTrainerData } from '@/app/dashboard/trainer/context/TrainerContext';
import { AddPlan, UpdatePlan, DeletePlan,uploadToCloudinary } from '@/lib/api';

// Extend Plan interface
interface Plan {
  id: number;
  title: string;
  category: 'workout' | 'diet';
  description: string;
  instructionPdf?: string;
  image: string;
}

// Fallback/mock for local dev, used only when TrainerContext has no plans
const fallbackPlans: Plan[] = [
  {
    id: 1,
    title: "Beginner Strength Training",
    category: "workout",
    description: "Perfect for beginners looking to build foundational strength with compound movements and proper form. Includes squats, deadlifts, bench press, and rows.",
    instructionPdf: "https://example.com/beginner-strength.pdf",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"
  },
  {
    id: 2,
    title: "High-Intensity Cardio Blast",
    category: "workout",
    description: "Intense 30-minute cardio workout designed to maximize calorie burn and improve cardiovascular endurance. Features burpees, mountain climbers, and jump squats.",
    instructionPdf: "https://example.com/cardio-blast.pdf",
    image: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400&h=300&fit=crop"
  },
  {
    id: 3,
    title: "Balanced Nutrition Plan",
    category: "diet",
    description: "Comprehensive 7-day meal plan focusing on balanced macronutrients for optimal health and performance. Includes breakfast, lunch, dinner, and snack options.",
    instructionPdf: "https://example.com/balanced-nutrition.pdf",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop"
  },
  {
    id: 4,
    title: "Advanced Muscle Building",
    category: "workout",
    description: "Advanced 12-week training program for experienced lifters aiming to maximize muscle growth and strength gains. Progressive overload with periodization.",
    instructionPdf: "https://example.com/advanced-muscle.pdf",
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=300&fit=crop"
  },
  {
    id: 5,
    title: "Weight Loss Accelerator",
    category: "diet",
    description: "Strategic calorie deficit plan combined with nutrient-dense foods to accelerate fat loss while preserving muscle. Includes meal prep guides and recipes.",
    instructionPdf: "https://example.com/weight-loss.pdf",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop"
  },
  {
    id: 6,
    title: "Flexibility & Mobility",
    category: "workout",
    description: "Comprehensive stretching and mobility routine to improve flexibility, reduce injury risk, and enhance recovery. Perfect for active recovery days.",
    instructionPdf: "https://example.com/flexibility.pdf",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop"
  }
];

// EditPlan component
const EditPlan = ({
  plan,
  onUpdatePlan,
}: {
  plan: Plan;
  onUpdatePlan: (payload: any, planId: number) => Promise<void>;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { trainerData } = useTrainerData();
  const [formState, setFormState] = useState({
    title: plan.title,
    category: (plan.category || 'workout') as 'workout' | 'diet',
    description: plan.description || '',
    image: null as File | null,
    instructionPdf: null as File | null,
  uploadedImageUrl: (plan.image as unknown as string) || '',
  uploadedPdfUrl: (plan.instructionPdf as unknown as string) || '',
  });

  const [imageUploadStatus, setImageUploadStatus] = useState<'idle'|'uploading'|'success'|'error'>('idle');
  const [imageUploadMessage, setImageUploadMessage] = useState<string>('');
  const [pdfUploadStatus, setPdfUploadStatus] = useState<'idle'|'uploading'|'success'|'error'>('idle');
  const [pdfUploadMessage, setPdfUploadMessage] = useState<string>('');

  const handleUploadImage = async () => {
    if (!formState.image) {
      setImageUploadStatus('error');
      setImageUploadMessage('No image selected');
      return;
    }
    setImageUploadStatus('uploading');
    setImageUploadMessage('Uploading image...');
    try {
      const url = await uploadToCloudinary(formState.image);
      setFormState((s) => ({ ...s, uploadedImageUrl: url }));
      setImageUploadStatus('success');
      setImageUploadMessage('Image uploaded successfully');
    } catch (err: any) {
      setImageUploadStatus('error');
      setImageUploadMessage(err?.message || 'Image upload failed');
    }
  };

  const handleUploadPdf = async () => {
    if (!formState.instructionPdf) {
      setPdfUploadStatus('error');
      setPdfUploadMessage('No PDF selected');
      return;
    }
    setPdfUploadStatus('uploading');
    setPdfUploadMessage('Uploading PDF...');
    try {
      const url = await uploadToCloudinary(formState.instructionPdf);
      setFormState((s) => ({ ...s, uploadedPdfUrl: url }));
      setPdfUploadStatus('success');
      setPdfUploadMessage('PDF uploaded successfully');
    } catch (err: any) {
      setPdfUploadStatus('error');
      setPdfUploadMessage(err?.message || 'PDF upload failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      title: formState.title,
      category: formState.category,
      description: formState.description,
    };

    // Prefer already uploaded URLs; otherwise upload now
    if (formState.uploadedImageUrl) {
      payload.img_url = formState.uploadedImageUrl;
    } else if (formState.image) {
      try {
        const url = await uploadToCloudinary(formState.image);
        payload.img_url = url;
      } catch (err) {
        console.error('Image upload failed:', err);
      }
    }

    if (formState.uploadedPdfUrl) {
      payload.instruction_pdf = formState.uploadedPdfUrl;
    } else if (formState.instructionPdf) {
      try {
        const pdfUrl = await uploadToCloudinary(formState.instructionPdf);
        payload.instruction_pdf = pdfUrl;
      } catch (err) {
        console.error('PDF upload failed:', err);
      }
    }

  // attach trainer id from context so backend receives ownership info
  const trainerId = (trainerData as any)?.profile?.id ?? (trainerData as any)?.id ?? (trainerData as any)?.trainer_id;
  if (trainerId) payload.trainer_id = trainerId;

  await onUpdatePlan(payload, plan.id);
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
                value={formState.title}
                onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                placeholder="Enter plan title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select value={formState.category} onValueChange={(value: 'workout' | 'diet') => setFormState({ ...formState, category: value })}>
                <SelectTrigger className="bg-gray-800 text-white border-gray-600  flex-1">
                  <SelectValue placeholder="Select category" />
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
                value={formState.description}
                onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                placeholder="Enter plan description"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-image">Image</Label>
              <div className="flex gap-2 items-center">
                <Input id="edit-image" type="file" accept="image/*" onChange={(e) => setFormState({ ...formState, image: e.target.files?.[0] || null })} />
                <Button type="button" size="sm" onClick={handleUploadImage}>Upload</Button>
              </div>
              {imageUploadStatus === 'uploading' && <p className="text-sm text-yellow-300">{imageUploadMessage}</p>}
              {imageUploadStatus === 'success' && <p className="text-sm text-green-400">{imageUploadMessage}</p>}
              {imageUploadStatus === 'error' && <p className="text-sm text-red-400">{imageUploadMessage}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-instructionPdf">Instruction PDF</Label>
              <div className="flex gap-2 items-center">
                <Input id="edit-instructionPdf" type="file" accept="application/pdf" onChange={(e) => setFormState({ ...formState, instructionPdf: e.target.files?.[0] || null })} />
                <Button type="button" size="sm" onClick={handleUploadPdf}>Upload</Button>
              </div>
              {pdfUploadStatus === 'uploading' && <p className="text-sm text-yellow-300">{pdfUploadMessage}</p>}
              {pdfUploadStatus === 'success' && <p className="text-sm text-green-400">{pdfUploadMessage}</p>}
              {pdfUploadStatus === 'error' && <p className="text-sm text-red-400">{pdfUploadMessage}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" className="bg-gray-800 text-white border-gray-600" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Plan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
const CreatePlan = ({ onAddPlan }: { onAddPlan: (payload: any) => Promise<void> }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { trainerData } = useTrainerData();
  const [formState, setFormState] = useState({
    title: '',
    category: 'workout' as 'workout' | 'diet',
    description: '',
    image: null as File | null,
    instructionPdf: null as File | null,
    uploadedImageUrl: '',
    uploadedPdfUrl: '',
  });

  const [imageUploadStatus, setImageUploadStatus] = useState<'idle'|'uploading'|'success'|'error'>('idle');
  const [imageUploadMessage, setImageUploadMessage] = useState<string>('');
  const [pdfUploadStatus, setPdfUploadStatus] = useState<'idle'|'uploading'|'success'|'error'>('idle');
  const [pdfUploadMessage, setPdfUploadMessage] = useState<string>('');

  const handleUploadImage = async () => {
    if (!formState.image) {
      setImageUploadStatus('error');
      setImageUploadMessage('No image selected');
      return;
    }
    setImageUploadStatus('uploading');
    setImageUploadMessage('Uploading image...');
    try {
      const url = await uploadToCloudinary(formState.image);
      setFormState((s) => ({ ...s, uploadedImageUrl: url }));
      setImageUploadStatus('success');
      setImageUploadMessage('Image uploaded successfully');
    } catch (err: any) {
      setImageUploadStatus('error');
      setImageUploadMessage(err?.message || 'Image upload failed');
    }
  };

  const handleUploadPdf = async () => {
    if (!formState.instructionPdf) {
      setPdfUploadStatus('error');
      setPdfUploadMessage('No PDF selected');
      return;
    }
    setPdfUploadStatus('uploading');
    setPdfUploadMessage('Uploading PDF...');
    try {
      const url = await uploadToCloudinary(formState.instructionPdf);
      setFormState((s) => ({ ...s, uploadedPdfUrl: url }));
      setPdfUploadStatus('success');
      setPdfUploadMessage('PDF uploaded successfully');
    } catch (err: any) {
      setPdfUploadStatus('error');
      setPdfUploadMessage(err?.message || 'PDF upload failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      title: formState.title,
      category: formState.category,
      description: formState.description,
    };

    if (formState.image) {
      try {
        const url = await uploadToCloudinary(formState.image);
        payload.img_url = url;
      } catch (err) {
        console.error('Image upload failed:', err);
      }
    }

    if (formState.instructionPdf) {
      try {
        const pdfUrl = await uploadToCloudinary(formState.instructionPdf);
        payload.instruction_pdf = pdfUrl;
      } catch (err) {
        console.error('PDF upload failed:', err);
      }
    }

  // attach trainer id from context
  const trainerId = (trainerData as any)?.profile?.id ?? (trainerData as any)?.id ?? (trainerData as any)?.trainer_id;
  if (trainerId) payload.trainer_id = trainerId;

  await onAddPlan(payload);

  setFormState({ title: '', category: 'workout', description: '', image: null, instructionPdf: null, uploadedImageUrl: '', uploadedPdfUrl: '' });
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
              <Input id="title" value={formState.title} className="bg-gray-800 text-white border-gray-600 flex-1" onChange={(e) => setFormState({ ...formState, title: e.target.value })} placeholder="Enter plan title" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formState.category} onValueChange={(value: 'workout' | 'diet') => setFormState({ ...formState, category: value })}>
                <SelectTrigger className="bg-gray-800 text-white border-gray-600 flex-1"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent className="bg-gray-800 text-white border-gray-600 flex-1"><SelectItem value="workout">Workout</SelectItem><SelectItem value="diet">Diet</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" className="bg-gray-800 text-white border-gray-600 flex-1" value={formState.description} onChange={(e) => setFormState({ ...formState, description: e.target.value })} placeholder="Enter plan description" rows={4} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Image</Label>
              <div className="flex gap-2 items-center">
                <Input id="image" type="file" accept="image/*" onChange={(e) => setFormState({ ...formState, image: e.target.files?.[0] || null })} />
                <Button type="button" size="sm" onClick={handleUploadImage}>Upload</Button>
              </div>
              {imageUploadStatus === 'uploading' && <p className="text-sm text-yellow-300">{imageUploadMessage}</p>}
              {imageUploadStatus === 'success' && <p className="text-sm text-green-400">{imageUploadMessage}</p>}
              {imageUploadStatus === 'error' && <p className="text-sm text-red-400">{imageUploadMessage}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="instructionPdf">Instruction PDF</Label>
              <div className="flex gap-2 items-center">
                <Input id="instructionPdf" type="file" className="bg-gray-800 text-white border-gray-600 flex-1" accept="application/pdf" onChange={(e) => setFormState({ ...formState, instructionPdf: e.target.files?.[0] || null })} />
                <Button type="button" size="sm" onClick={handleUploadPdf}>Upload</Button>
              </div>
              {pdfUploadStatus === 'uploading' && <p className="text-sm text-yellow-300">{pdfUploadMessage}</p>}
              {pdfUploadStatus === 'success' && <p className="text-sm text-green-400">{pdfUploadMessage}</p>}
              {pdfUploadStatus === 'error' && <p className="text-sm text-red-400">{pdfUploadMessage}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" className="bg-gray-800 text-white border-gray-600 " variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit">Add Plan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Main component
const WorkoutAndDietPlans = () => {
  const { trainerData, refreshTrainerData, isLoading } = useTrainerData();

  // For now, always use fallback plans for demo purposes
  // Later: const plans: Plan[] = (trainerData && (trainerData as any).plans) || fallbackPlans;
  const plans: Plan[] = fallbackPlans;

  const handleAddPlan = async (payload: any) => {
    try {
      await AddPlan(payload);
      await refreshTrainerData();
    } catch (err) {
      console.error('Error adding plan:', err);
    }
  };

  const handleUpdatePlan = async (payload: any, planId: number) => {
    try {
      await UpdatePlan(planId, payload);
      await refreshTrainerData();
    } catch (err) {
      console.error('Error updating plan:', err);
    }
  };

  const handleDeletePlan = async (planId: number) => {
    try {
      await DeletePlan(planId);
      await refreshTrainerData();
    } catch (err) {
      console.error('Error deleting plan:', err);
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-transparent min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header section - responsive like Plans.tsx */}
        <div className='flex flex-row justify-between items-center'>
          <div className="flex-1 flex justify-center items-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white text-center mb-6 md:mb-10">
              Workout & Diet Plans
            </h2>
          </div>
          <div className="ml-4 hidden sm:block">
            <CreatePlan onAddPlan={handleAddPlan} />
          </div>
        </div>
        
        {/* Mobile create button - shows below heading on small screens */}
        <div className="flex justify-center mb-6 sm:hidden">
          <CreatePlan onAddPlan={handleAddPlan} />
        </div>

        {/* Grid layout for better responsiveness */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {plans && plans.length > 0 ? (
          plans.map((plan: any) => {
            const planId = plan.id || plan.plan_id || 0;
            const title = plan.title || plan.name || '';
            const category = plan.category || 'workout';
            const description = plan.description || plan.desc || '';
            const imageSrc = plan.img_url || plan.image || '/placeholder.svg';
            const pdfUrl = plan.instruction_pdf || plan.instructionPdf || null;

            return (
              <div key={planId} className="relative rounded-2xl p-2 group h-fit">
                {/* Enhanced glow effect with red tint */}
                <div className="absolute inset-0 -m-1 rounded-2xl bg-red-900/70 blur-lg opacity-60 transition-opacity duration-300 group-hover:opacity-100 z-0" aria-hidden />

                <Card className="relative z-10 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-red-500/20 group-hover:border-red-500/50 group-hover:ring-2 group-hover:ring-red-500/20 backdrop-blur-sm h-full flex flex-col">
                  {/* Image container - fixed aspect ratio */}
                  <div className="relative w-full h-48 flex-shrink-0 overflow-hidden">
                    <img
                      src={imageSrc}
                      alt={title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                    {/* Category badge */}
                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold text-white shadow-lg ${
                      category === 'workout'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                        : 'bg-gradient-to-r from-green-500 to-green-600'
                    }`}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </div>
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Content section - flexible layout */}
                  <div className="flex flex-col flex-1 p-4 sm:p-5">
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-3 line-clamp-2 leading-tight">
                        {title}
                      </h3>
                      <p className="text-sm text-gray-300 mb-4 line-clamp-3 leading-relaxed">
                        {description}
                      </p>
                      {pdfUrl && (
                        <a
                          href={pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-400 text-sm underline hover:text-red-300 transition-colors inline-flex items-center gap-1 mb-4"
                        >
                          <span>View Instructions</span>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>

                    {/* Action buttons - always at bottom */}
                    <div className="flex flex-col sm:flex-row gap-2 mt-auto pt-2">
                      <EditPlan plan={plan} onUpdatePlan={handleUpdatePlan} />
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 transition-all duration-200 flex-1 sm:flex-none"
                        onClick={() => handleDeletePlan(planId)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>{isLoading ? 'Loading plans...' : 'No plans available'}</p>
            <p className="text-sm">Click "Add New Plan" to get started</p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutAndDietPlans;
