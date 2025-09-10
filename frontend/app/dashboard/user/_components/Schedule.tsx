"use client";
import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import './calendar-overrides.css';
import './color-picker.css';


// Custom event rendering for color
function renderEventContent(eventInfo: any) {
  const color = eventInfo.event.backgroundColor || '#ef4444';
  return (
    <div
      style={{
        backgroundColor: color,
        borderRadius: 4,
        color: '#fff',
        border: `2px solid ${color}`,
        fontWeight: 500,
        boxShadow: `0 2px 8px ${color}55`,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0
      }}
    >
      {eventInfo.event.title}
    </div>
  );
}

interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
}

const Schedule: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [taskTime, setTaskTime] = useState('');
  const [taskColor, setTaskColor] = useState('#ef4444');
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  // ...existing code...

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskTitle && taskDate) {
      let startDate = taskDate;
      let endDate = taskDate;
      if (taskTime) {
        startDate += `T${taskTime}`;
        endDate += `T${taskTime}`;
      }
      const newEvent: Event = {
        id: `${Date.now()}`,
        title: taskTitle,
        start: startDate,
        end: endDate,
        backgroundColor: taskColor,
      };
      setEvents([...events, newEvent]);
      setTaskTitle('');
      setTaskDate('');
      setTaskTime('');
      setTaskColor('')
      setIsTaskDialogOpen(false);
    }
  };

  // ...existing code...

  return (
    <div>
      
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogTrigger asChild>
          <Button type="button" className="bg-red-500 text-white font-semibold ml-12 mb-4" onClick={() => setIsTaskDialogOpen(true)}>
            Add Task
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-gray-900 text-gray-200">
          <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
            <DialogDescription>
              Add a new task to your schedule.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveTask} className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="task_title">Title</Label>
              <Input
                className='bg-gray-800'
                id="task_title"
                type="text"
                placeholder="Task Title"
                value={taskTitle}
                onChange={e => setTaskTitle(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-4">
              <div className="space-y-2 flex-1">
                <Label htmlFor="task_date">Date</Label>
                <Input
                  className='bg-gray-800'
                  id="task_date"
                  type="date"
                  value={taskDate}
                  onChange={e => setTaskDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2 flex-1">
                <Label htmlFor="task_time">Time</Label>
                <Input
                  className='bg-gray-800'
                  id="task_time"
                  type="time"
                  value={taskTime}
                  onChange={e => setTaskTime(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="task_color" className="whitespace-nowrap">Color</Label>
              <input
                id="task_color"
                type="color"
                value={taskColor}
                onChange={e => setTaskColor(e.target.value)}
                className="color-picker w-8 h-8 p-0 rounded-full border-none"
                style={{ boxShadow: `0 0 0 4px ${taskColor}33` }}
                title="Choose event color"
              />
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                className='bg-gray-800'
                onClick={() => setIsTaskDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Save Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <div style={{ height: 600, marginLeft: '2rem', marginRight: '2rem', backgroundColor: '#192024', borderRadius: 8 }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          eventContent={renderEventContent}
          height="100%"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
        />
      </div>
    </div>
  );
};

export default Schedule;
