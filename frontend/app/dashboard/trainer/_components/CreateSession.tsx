import React from 'react'
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from 'lucide-react';

interface Plan {
    id: number;
    title: string;
    description: string;
    timeSlots: string;
    duration: string;
    zoomLink: string;
    users: string[]; // Array of user IDs or names
  }

const CreatePlan = () => {
    const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [planForm, setPlanForm] = useState({
        title: "",
        description: "",
        timeSlots: "",
        duration: "",
        zoomLink: "",
      });

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

  return (
    <div>
       <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" /> Create New Session
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
    </div>
  )
}

export default CreatePlan
