"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CalendarIcon, Save } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface WeightInputModalProps {
  isOpen: boolean
  onClose: () => void
}

export function WeightInputModal({ isOpen, onClose }: WeightInputModalProps) {
  const [weight, setWeight] = useState("")
  const [date, setDate] = useState<Date>(new Date())
  const [notes, setNotes] = useState("")

  const handleSave = () => {
    // Here you would typically save to backend
    console.log("Saving weight entry:", { weight, date, notes })
    onClose()
    setWeight("")
    setNotes("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-white">Log Your Weight</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Track your weight progress by adding a new entry with date and optional notes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="weight" className="text-white">
              Weight (kg)
            </Label>
            <Input
              id="weight"
              type="number"
              placeholder="75.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="bg-background border-border text-white"
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-background border-border text-white",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card border-border">
                <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-white">
              Notes (Optional)
            </Label>
            <Input
              id="notes"
              placeholder="Feeling great after workout..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-background border-border text-white"
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary/90" disabled={!weight}>
              <Save className="mr-2 h-4 w-4" />
              Save Entry
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent border-border text-white hover:bg-accent"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
