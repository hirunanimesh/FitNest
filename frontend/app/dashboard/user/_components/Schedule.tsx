"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext'
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
  color?: string;
}

const Schedule: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [taskColor, setTaskColor] = useState('#ef4444');
  const [taskDescription, setTaskDescription] = useState('');
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [googleConnected, setGoogleConnected] = useState<boolean | null>(null);
  const [loadingSync, setLoadingSync] = useState(false);
  const { user } = useAuth()
  // ...existing code...

  useEffect(() => {
    // Check connection status and load server-backed events on mount.
    // Assumption: backend exposes `/api/calendar/status` and `/api/calendar/events`.
    (async () => {
      try {
  const base = process.env.NEXT_PUBLIC_USERSERVICE_URL?.trim() ? process.env.NEXT_PUBLIC_USERSERVICE_URL : 'http://localhost:3004'
        const userId = user?.id
        if (!userId) {
          setGoogleConnected(false)
          return
        }

        const statusRes = await fetch(`${base}/calendar/status/${userId}`)
        if (statusRes.ok) {
          const json = await statusRes.json();
          setGoogleConnected(Boolean(json.connected));
        } else {
          setGoogleConnected(false);
        }

        const eventsRes = await fetch(`${base}/calendar/events/${userId}`)
        if (eventsRes.ok) {
          const serverEvents = await eventsRes.json();
          if (Array.isArray(serverEvents)) setEvents(serverEvents.map((ev: any) => ({
            id: String(ev.id || ev.calendar_id || ev.calendarId || ev.calendar_id),
            title: ev.title || ev.task || '',
            start: ev.start || ev.task_date || ev.start_ts || '',
            end: ev.end || ev.end_ts || '',
            backgroundColor: ev.backgroundColor || ev.color || '#ef4444',
            color: ev.color || ev.backgroundColor || '#ef4444'
          })));
        }
      } catch (err) {
        // silent failure — keep client-local events
        console.error('calendar status/events check failed', err)
        setGoogleConnected(false);
      }
    })();
  }, []);

  const connectGoogleCalendar = async () => {
    // Assumption: backend provides an endpoint which returns an OAuth URL to redirect the user.
    // e.g. GET /api/google/oauth-url -> { url: 'https://accounts.google.com/...' }
    try {
  const base = process.env.NEXT_PUBLIC_USERSERVICE_URL?.trim() ? process.env.NEXT_PUBLIC_USERSERVICE_URL : 'http://localhost:3004'
  const userId = user?.id
  if (!userId) return alert('You must be signed in to connect Google Calendar')
  const res = await fetch(`${base}/google/oauth-url/${userId}`)
  if (!res.ok) throw new Error('Failed to get oauth url');
  const { url } = await res.json();
  // Redirect user to Google OAuth consent screen
  window.location.href = url;
    } catch (err) {
      console.error('Google connect failed', err);
      alert('Unable to start Google OAuth. Check console for details.');
    }
  };

  const syncGoogleCalendar = async () => {
    // Triggers a server-side sync which reads Google events and returns merged events.
    setLoadingSync(true);
    try {
  const base = process.env.NEXT_PUBLIC_USERSERVICE_URL?.trim() ? process.env.NEXT_PUBLIC_USERSERVICE_URL : 'http://localhost:3004'
  const userId = user?.id
  if (!userId) return alert('You must be signed in to sync')
      const res = await fetch(`${base}/calendar/sync/${userId}`, { method: 'POST' });
      if (!res.ok) {
        const text = await res.text().catch(() => 'no body')
        console.error('calendar sync failed response:', res.status, text)
        throw new Error(`Sync failed: ${res.status} ${text}`)
      }
      const synced = await res.json();
  if (Array.isArray(synced)) setEvents(synced);
  setGoogleConnected(true);
    } catch (err) {
      console.error('Sync failed', err);
      alert('Sync failed. Check console for details.');
    } finally {
      setLoadingSync(false);
    }
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
  if (taskTitle && taskDate) {
      // Build start/end. If startTime provided, combine date+time. If endTime missing but startTime provided, default to 1 hour duration.
      let startDate = taskDate;
      let endDate = taskDate;
      if (startTime) {
        // HTML time is HH:MM
        const startTimeNormalized = startTime.includes(':') ? `${startTime}:00` : `${startTime}:00`;
        startDate = `${taskDate}T${startTimeNormalized}`;
        if (endTime) {
          const endTimeNormalized = endTime.includes(':') ? `${endTime}:00` : `${endTime}:00`;
          endDate = `${taskDate}T${endTimeNormalized}`;
        } else {
          // default 1 hour duration (simple string-based hour increment)
          const [h, m] = startTime.split(':');
          let endHour = (parseInt(h || '0', 10) + 1).toString().padStart(2, '0');
          endDate = `${taskDate}T${endHour}:${m || '00'}:00`;
        }
      }

      const payload = {
        title: taskTitle,
        start: startDate,
        end: endDate,
        description: taskDescription || '',
        color: taskColor
      };
      // If editingEvent is set, call update endpoint instead of create
      (async () => {
        try {
          const base = process.env.NEXT_PUBLIC_USERSERVICE_URL?.trim() ? process.env.NEXT_PUBLIC_USERSERVICE_URL : 'http://localhost:3004'
          const userId = user?.id
          if (!userId) return alert('You must be signed in to add tasks')
          if (editingEvent) {
            const res = await fetch(`${base}/calendar/${editingEvent.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            })
            if (!res.ok) {
              const txt = await res.text().catch(() => '')
              console.error('update event failed', res.status, txt)
              alert('Failed to update event')
              return
            }
            const updated = await res.json()
            setEvents(prev => prev.map(ev => ev.id === String(editingEvent.id) ? ({
              id: String(updated.id || editingEvent.id),
              title: updated.title || payload.title,
              start: updated.start || payload.start,
              end: updated.end || payload.end,
              backgroundColor: updated.color || payload.color || taskColor
            }) : ev))
            setEditingEvent(null)
          } else {
            const res = await fetch(`${base}/calendar/create/${userId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            })
            if (!res.ok) {
              const txt = await res.text().catch(() => '')
              console.error('create event failed', res.status, txt)
              alert('Failed to save event')
              return
            }
            const saved = await res.json()
            const newEvent: Event = {
              id: String(saved.id || `${Date.now()}`),
              title: saved.title,
              start: saved.start,
              end: saved.end,
              backgroundColor: taskColor,
              color: taskColor
            }
            setEvents(prev => [...prev, newEvent])
          }
        } catch (err) {
          console.error('save task failed', err)
          alert('Failed to save task')
        } finally {
          setTaskTitle('')
          setTaskDate('')
          setStartTime('')
          setEndTime('')
          setTaskDescription('')
          setTaskColor('#ef4444')
          setIsTaskDialogOpen(false)
        }
      })()
    }
  };

  const handleEventClick = (clickInfo: any) => {
    const ev = clickInfo.event;
    const startIso = ev.startStr || '';
    const endIso = ev.endStr || '';
    const splitIso = (iso: string) => {
      if (!iso) return { date: '', time: '' };
      if (iso.length === 10) return { date: iso, time: '' };
      const [d, t] = iso.split('T');
      return { date: d, time: (t || '').slice(0,5) };
    }
    const s = splitIso(startIso);
    const e = splitIso(endIso);
    const viewed: Event = {
      id: String(ev.id),
      title: ev.title,
      start: startIso,
      end: endIso,
      backgroundColor: ev.backgroundColor || taskColor
    }
    setViewingEvent(viewed);
    // populate fields for potential edit but remain in view mode until pencil pressed
    setTaskTitle(ev.title || '');
    setTaskDate(s.date);
    setStartTime(s.time);
    setEndTime(e.time);
    setTaskDescription(ev.extendedProps?.description || '');
    setTaskColor(ev.backgroundColor || taskColor);
    setIsEditing(false);
    setIsTaskDialogOpen(true);
  }

  const enableEditMode = () => {
    if (!viewingEvent) return;
    setEditingEvent(viewingEvent);
    setIsEditing(true);
  }

  const handleDeleteEvent = async () => {
    try {
      const base = process.env.NEXT_PUBLIC_USERSERVICE_URL?.trim() ? process.env.NEXT_PUBLIC_USERSERVICE_URL : 'http://localhost:3004'
      const idToDelete = editingEvent?.id || viewingEvent?.id
      if (!idToDelete) return alert('No event selected to delete')
      const res = await fetch(`${base}/calendar/${idToDelete}`, { method: 'DELETE' })
      if (!res.ok) {
        const txt = await res.text().catch(() => '')
        console.error('delete event failed', res.status, txt)
        alert('Failed to delete event')
        return
      }

      setEvents(prev => prev.filter(ev => ev.id !== String(idToDelete)))
      setEditingEvent(null)
      setViewingEvent(null)
      setIsTaskDialogOpen(false)
    } catch (err) {
      console.error('delete failed', err)
      alert('Failed to delete event')
    }
  }

  // keyboard shortcuts when dialog is open: 'e' to edit, 'Delete' to delete
  useEffect(() => {
    if (!isTaskDialogOpen) return
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'e' || ev.key === 'E') {
        ev.preventDefault()
        enableEditMode()
      }
      if (ev.key === 'Delete') {
        ev.preventDefault()
        handleDeleteEvent()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isTaskDialogOpen, viewingEvent, editingEvent])

  // Ensure dialog state clears viewing/editing when closed; and provide an opener for Add Task
  const handleDialogOpenChange = (open: boolean) => {
    setIsTaskDialogOpen(open)
    if (!open) {
      // clear any selected/viewing state when dialog closes
      setViewingEvent(null)
      setEditingEvent(null)
      setIsEditing(false)
      // reset form fields
      setTaskTitle('')
      setTaskDate('')
      setStartTime('')
      setEndTime('')
      setTaskDescription('')
      setTaskColor('#ef4444')
    }
  }

  const openAddTask = () => {
    // explicit opener triggered by Add Task button: ensure we are in create mode
    setViewingEvent(null)
    setEditingEvent(null)
    setIsEditing(false)
    setTaskTitle('')
    setTaskDate('')
    setStartTime('')
    setEndTime('')
    setTaskDescription('')
    setTaskColor('#ef4444')
    setIsTaskDialogOpen(true)
  }

  // ...existing code...

  return (
    <div>
      <h2>User Schedule</h2>
      <Dialog open={isTaskDialogOpen} onOpenChange={handleDialogOpenChange}>
        <Button type="button" className="bg-red-500 text-white font-semibold ml-12 mb-4" onClick={openAddTask}>
          Add Task
        </Button>
        <DialogContent className="sm:max-w-[425px] bg-gray-900 text-gray-200">
          {viewingEvent && !isEditing ? (
            // VIEW MODE: show details like Google Calendar popup with edit/delete icons
            <div className="py-4">
              <DialogHeader>
                <DialogTitle>{viewingEvent.title}</DialogTitle>
              </DialogHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div style={{ width: 12, height: 12, borderRadius: 4, backgroundColor: viewingEvent.backgroundColor }} />
                    <h3 className="text-lg font-semibold">{viewingEvent.title}</h3>
                  </div>
                  <p className="text-sm text-gray-300 mt-2">{new Date(viewingEvent.start).toLocaleString()} - {viewingEvent.end ? new Date(viewingEvent.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</p>
                  <p className="text-sm text-gray-400 mt-2">{/* recurrence/extra info could go here */}</p>
                  <p className="text-sm text-gray-300 mt-3">{/* description */}{taskDescription}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button
                    type="button"
                    onClick={enableEditMode}
                    title="Edit"
                    aria-label="Edit event"
                    className="p-2 rounded hover:bg-gray-800"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="#cbd5e1" />
                      <path d="M20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" fill="#cbd5e1" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteEvent}
                    title="Delete"
                    aria-label="Delete event"
                    className="p-2 rounded hover:bg-gray-800"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12z" fill="#fecaca" />
                      <path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="#fecaca" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={() => { setIsTaskDialogOpen(false); setViewingEvent(null); }}>Close</Button>
              </div>
            </div>
          ) : (
            // EDIT / CREATE MODE: show form (reuse existing form layout)
            <>
              <DialogHeader>
                <DialogTitle>{editingEvent ? 'Edit Task' : 'Add Task'}</DialogTitle>
                <DialogDescription>
                  {editingEvent ? 'Edit the task details.' : 'Add a new task to your schedule.'}
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
                    <Label htmlFor="start_time">Start Time</Label>
                    <Input
                      className='bg-gray-800'
                      id="start_time"
                      type="time"
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="end_time">End Time</Label>
                    <Input
                      className='bg-gray-800'
                      id="end_time"
                      type="time"
                      value={endTime}
                      onChange={e => setEndTime(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task_description">Description (optional)</Label>
                  <Input
                    className='bg-gray-800'
                    id="task_description"
                    type="text"
                    placeholder="Details about the task"
                    value={taskDescription}
                    onChange={e => setTaskDescription(e.target.value)}
                  />
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
                  <div className="flex items-center gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className='bg-gray-800'
                      onClick={() => { setIsTaskDialogOpen(false); setViewingEvent(null); setEditingEvent(null); setIsEditing(false); }}
                    >
                      Cancel
                    </Button>
                    {/* Delete is available from the view popup (trash icon) or Delete key; hide it in the edit form to avoid accidental deletes */}
                    <Button type="submit">
                      Save Task
                    </Button>
                  </div>
                </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
      <div className="ml-12 mb-4 flex items-center gap-3">
        {googleConnected === null ? (
          <span className="text-sm text-gray-400">Checking Google Calendar connection...</span>
        ) : googleConnected ? (
          <>
            <Button type="button" onClick={syncGoogleCalendar} disabled={loadingSync}>
              {loadingSync ? 'Syncing...' : 'Sync Google Calendar'}
            </Button>
            <span className="text-sm text-gray-300">Connected</span>
          </>
        ) : (
          <Button type="button" onClick={connectGoogleCalendar} className="bg-blue-600 text-white">
            Connect Google Calendar
          </Button>
        )}
      </div>
      <div style={{ height: 600, marginLeft: '2rem', marginRight: '2rem', backgroundColor: '#192024', borderRadius: 8 }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          eventClick={handleEventClick}
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
