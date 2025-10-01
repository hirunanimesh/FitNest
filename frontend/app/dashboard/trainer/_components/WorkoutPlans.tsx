"use client"

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Plus, Dumbbell } from 'lucide-react';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogTrigger,DialogFooter} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '@/components/ui/select';
import { useTrainerData } from '@/app/dashboard/trainer/context/TrainerContext';
import { AddPlan, UpdatePlan, DeletePlan,uploadToCloudinary } from '@/lib/api';
import VerifiedActions from '@/components/VerifiedActions';

// Extend Plan interface
interface Plan {
  id: number;
  title: string;
  category: 'workout' | 'diet';
  description: string;
  instructionPdf?: string;
  image: string;
}

// Skeleton loader component
const PlanSkeleton = () => (
  <div className="relative rounded-2xl p-2 group h-fit">
    <div className="absolute inset-0 -m-1 rounded-2xl bg-gray-800/50 blur-lg opacity-60 z-0" aria-hidden />
    <Card className="relative z-10 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-2xl shadow-lg overflow-hidden backdrop-blur-sm h-full flex flex-col">
      {/* Image skeleton */}
      <div className="relative w-full h-48 flex-shrink-0 bg-gray-700 animate-pulse">
        <div className="absolute top-3 right-3 w-20 h-6 bg-gray-600 rounded-full animate-pulse" />
      </div>
      
      {/* Content skeleton */}
      <div className="flex flex-col flex-1 p-4 sm:p-5">
        <div className="flex-1">
          {/* Title skeleton */}
          <div className="h-6 bg-gray-600 rounded animate-pulse mb-3" />
          <div className="h-4 bg-gray-600 rounded animate-pulse mb-2 w-3/4" />
          
          {/* Description skeleton */}
          <div className="space-y-2 mb-4">
            <div className="h-3 bg-gray-700 rounded animate-pulse" />
            <div className="h-3 bg-gray-700 rounded animate-pulse w-5/6" />
            <div className="h-3 bg-gray-700 rounded animate-pulse w-2/3" />
          </div>
        </div>
        
        {/* Action buttons skeleton */}
        <div className="flex flex-col sm:flex-row gap-2 mt-auto pt-2">
          <div className="h-8 bg-gray-600 rounded animate-pulse flex-1" />
          <div className="h-8 bg-gray-600 rounded animate-pulse w-20" />
        </div>
      </div>
    </Card>
  </div>
);

// Loading state component
const LoadingState = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
    {Array.from({ length: 6 }).map((_, index) => (
      <PlanSkeleton key={index} />
    ))}
  </div>
);

// Empty state component
const EmptyState = () => (
  <div className="col-span-full flex flex-col items-center justify-center py-16 px-8">
    <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center shadow-xl mb-6">
      <Dumbbell className="w-12 h-12 text-white" />
    </div>
    <h3 className="text-2xl font-bold text-red-400 mb-4">No Plans Available</h3>
    <p className="text-red-300 text-center max-w-md leading-relaxed mb-6">
      You haven't created any workout or diet plans yet. Start building your training programs to help your clients achieve their fitness goals.
    </p>
    <p className="text-sm text-gray-400">Click "Add New Plan" to get started</p>
  </div>
);

// Fallback/mock for local dev, used only when TrainerContext has no plans


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
        <VerifiedActions fallbackMessage="You need to be a verified trainer to edit plans.">
          <Button size="sm" variant="outline" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700">
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
        </VerifiedActions>
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
        <VerifiedActions fallbackMessage="You need to be a verified trainer to create workout and diet plans.">
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add New Plan
          </Button>
        </VerifiedActions>
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
  // Use plans from TrainerContext when available, otherwise show empty array while loading
  const plans: Plan[] = (trainerData && (trainerData as any).plans) || [];

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

        {/* Content section with loading, empty, and data states */}
        {isLoading ? (
          <LoadingState />
        ) : plans && plans.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {plans.map((plan: any) => {
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
                      <VerifiedActions fallbackMessage="You need to be a verified trainer to delete plans.">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 transition-all duration-200 flex-1 sm:flex-none"
                          onClick={() => handleDeletePlan(planId)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </VerifiedActions>
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
};

export default WorkoutAndDietPlans;
