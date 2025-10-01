import React from 'react'
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from 'lucide-react';
import VerifiedActions from '@/components/VerifiedActions';

const UploadContent = () => {
    const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
    const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);

    const [contentForm, setContentForm] = useState<{
        title: string;
        description: string;
        file: File | null;
      }>({
        title: "",
        description: "",
        file: null,
      });

    const handleContentSubmit = (e: React.FormEvent) => {
        // logic
    }
  return (
    <div>
      <Dialog open={isContentDialogOpen} onOpenChange={setIsContentDialogOpen}>
              <VerifiedActions fallbackMessage="You need to be a verified trainer to upload content.">
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" /> Upload Content
                  </Button>
                </DialogTrigger>
              </VerifiedActions>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Content</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleContentSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right">
                        Title
                      </Label>
                      <Input
                        id="title"
                        value={contentForm.title}
                        onChange={(e) => setContentForm((prev) => ({ ...prev, title: e.target.value }))}
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
                        value={contentForm.description}
                        onChange={(e) => setContentForm((prev) => ({ ...prev, description: e.target.value }))}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="file" className="text-right">
                        File
                      </Label>
                      <Input
                        id="file"
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setContentForm((prev) => ({ ...prev, file }));
                        }}
                        className="col-span-3"
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Upload Content</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
    </div>
  )
}

export default UploadContent
