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
const fallbackPlans: Plan[] = [];

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

  // Use plans from TrainerContext when present, otherwise fallback
  const plans: Plan[] = (trainerData && (trainerData as any).plans) || fallbackPlans;

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
    <div className="p-6 bg-transparent min-h-screen">
      <div className="max-w-5xl mx-auto px-4 ">
        <h2 className="text-4xl md:text-5xl font-black text-white text-center  mt-12">
          <span className="bg-gradient-to-r from-dark-700 via-rose-400 to-dark-700 bg-clip-text text-transparent mt-16">
            Workout & Diet Plans
          </span>
        </h2>
      </div>
      <div className="flex justify-end mt-4 mb-4 ">
        <CreatePlan onAddPlan={handleAddPlan} />
      </div>

      <div className="space-y-4">
        {plans && plans.length > 0 ? (
          plans.map((plan: any) => {
            const planId = plan.id || plan.plan_id || 0;
            const title = plan.title || plan.name || '';
            const category = plan.category || 'workout';
            const description = plan.description || plan.desc || '';
            const imageSrc = plan.img_url || '/images/default.jpg';
            const pdfUrl = plan.instruction_pdf || plan.instructionPdf || null;

            return (
              <div key={planId} className="relative rounded-2xl p-2 group">
                <div className="absolute inset-0 -m-1 rounded-2xl bg-gray-800/60 blur-lg opacity-80 transition-opacity duration-300 group-hover:opacity-100 z-0" aria-hidden />
                <Card className="relative z-10 flex items-center bg-gray-800 rounded-2xl shadow-md overflow-hidden transform transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:ring-2 group-hover:ring-gray-500">
                  <img src={imageSrc || '/images/default.jpg'} alt={title} className="w-56 h-24  object-cover" />
                  <div className="flex justify-between items-center w-full px-4 py-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {title}{' '}
                        <span className="text-xs text-gray-400">({category})</span>
                      </h3>
                      <p className="text-sm text-gray-400">{description}</p>
                      {pdfUrl && (
                        <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-sm underline hover:text-blue-300">View Instructions (PDF)</a>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <EditPlan plan={plan} onUpdatePlan={handleUpdatePlan} />
                      <Button size="sm" variant="outline" className="flex-1 bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 " onClick={() => handleDeletePlan(planId)}>
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
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
  );
};

export default WorkoutAndDietPlans;
