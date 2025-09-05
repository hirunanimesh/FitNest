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
// CSS previously in separate files has been inlined below inside a <style jsx global> block


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
    padding: '3px 6px',
        overflow: 'hidden'
      }}
    >
          <div style={{
            width: '100%',
            // allow up to 2 lines then clamp
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'normal',
            textAlign: 'center',
      lineHeight: '0.95rem',
      fontSize: '0.72rem',
      letterSpacing: '-0.25px',
            fontWeight: 400
          }}>{eventInfo.event.title}</div>
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
  description?: string | null;
  extendedProps?: { description?: string | null };
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
            backgroundColor: ev.backgroundColor || ev.color || '#28375cff',
            color: ev.color || ev.backgroundColor || '#1a2e84ff',
            extendedProps: { description: ev.description || null }
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
              backgroundColor: updated.color || payload.color || taskColor,
              description: updated.description || payload.description || '',
              extendedProps: { description: updated.description || payload.description || '' }
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
              color: taskColor,
              description: saved.description || payload.description || '',
              extendedProps: { description: saved.description || payload.description || '' }
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
      backgroundColor: ev.backgroundColor || taskColor,
    description: ev.extendedProps?.description || ''
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

  // highlight the clicked date cell with a persistent selected class
  const handleDateClick = (dateClickInfo: any) => {
    try {
      // remove previously selected
      document.querySelectorAll('.fc-day-selected').forEach(el => el.classList.remove('fc-day-selected'));
      // dayEl is provided by FullCalendar; fallback to finding nearest .fc-daygrid-day
      const dayEl = dateClickInfo.dayEl || (dateClickInfo.jsEvent && (dateClickInfo.jsEvent.target as HTMLElement).closest('.fc-daygrid-day'));
      if (dayEl) {
        dayEl.classList.add('fc-day-selected');
      }
    } catch (e) {
      // ignore
    }
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
  // Ignore shortcuts when focus is inside an input/textarea/contentEditable element so typing is not blocked.
  useEffect(() => {
    if (!isTaskDialogOpen) return
    const onKey = (ev: KeyboardEvent) => {
      try {
        const target = ev.target as HTMLElement | null
        const tag = target && target.tagName ? target.tagName.toLowerCase() : ''
        const isEditable = tag === 'input' || tag === 'textarea' || (target && target.isContentEditable)
        if (isEditable) return // allow normal typing inside form fields
      } catch (e) {
        // ignore
      }

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
      <style jsx global>{`
/* Base color tweaks */
.fc-timegrid-slot-label,
.fc-list-event-time,
.fc-daygrid-event .fc-event-time,
.fc-timegrid-axis-cushion {
  color: #bdbdbd !important;
}

/* Full calendar background: pure black to reveal gutters between tiles */
.calendar-shell { background: black; padding: 1rem 1.25rem; border-radius: 14px; border: 1px solid rgba(255,255,255,0.03); box-shadow: 0 8px 30px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.02); }
.fc { background: transparent; }

/* Remove default table borders so gutters show as black */
.fc .fc-scrollgrid, .fc .fc-scrollgrid-section, .fc .fc-daygrid-body, .fc .fc-daygrid-body td, .fc-daygrid-day {
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
}
.fc .fc-scrollgrid td, .fc .fc-scrollgrid th { border-color: transparent !important; }

/* Header day pills (tighter) */
.fc .fc-col-header-cell-cushion {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #666161ff;
  color: #cfcfcf !important;
  padding: 6px 12px;
  border-radius: 999px;
  margin: 4px 6px;
  font-weight: 600;
  font-size: 0.92rem;
}

/* Each day cell shows a rounded tile; remove internal gutter so tiles touch */
.fc-daygrid-day-frame { position: relative; padding: 0; }
.fc-daygrid-day-frame::before {
  content: '';
  position: absolute;
  /* expand slightly to cover tiny seams between adjacent cells */
  left: -1px;
  right: -1px;
  top: -1px;
  bottom: -1px;
  background: linear-gradient(180deg,  #696b6bff 0%, #696b6bff 100%); /* tile color gradient */
  border-radius: 12px;
  border: 1px solid rgba(206, 201, 201, 0.03); /* subtle gray shine border */
  box-shadow: 0 6px 16px rgba(0,0,0,0.55) inset, 0 4px 12px rgba(0,0,0,0.5);
  z-index: 0;
}

/* subtle top-left sheen to give glossy rounded look */
.fc-daygrid-day-frame::after {
  content: '';
  position: absolute;
  left: 14px;
  right: auto;
  top: 14px;
  height: 76%;
  width: calc(100% - 10px);
  background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.00));
  border-top-left-radius: 10px;
  border-bottom-right-radius: 18px;
  pointer-events: none;
  z-index: 1;
}

/* Contents above tile */
.fc-daygrid-day-number,
.fc-daygrid-day-events,
.fc-daygrid-day-top { position: relative; z-index: 2; }

/* Center day number inside small area at vertical center of tile */
.fc-daygrid-day-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin: 6px auto 4px auto;
  font-size: 0.78rem;
  color: #cfcfcf !important;
}

/* Events remain as colored pills; tighten margins, padding and letter-spacing */
.fc-daygrid-event {
  margin: 0 !important; /* remove default small gaps */
  border-radius: 6px;
  padding: 1px 1px !important;
  font-size: 0.74rem;
  letter-spacing: -0.5px;
  line-height: 1rem;
  box-shadow: none !important;
}

/* ensure event title text is tighter */
.fc-daygrid-event .fc-event-title,
.fc-daygrid-dot-event .fc-event-title {
  letter-spacing: -0.5px;
  padding: 0;
  margin: 0;
}

/* small per-event indicator removed */

/* Remove cell borders entirely */
.fc-daygrid-body td { border: none !important; }

/* make toolbar title lighter */
.fc-toolbar-title { color: #e6e6e6 !important; }

/* Color picker styles (inlined) */
.color-picker { -webkit-appearance: none; -moz-appearance: none; appearance: none; border: none; width: 32px; height: 32px; border-radius: 50%; padding: 0; cursor: pointer; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.12); transition: transform 0.15s, box-shadow 0.15s; }
.color-picker:hover { transform: scale(1.1); box-shadow: 0 4px 16px rgba(0,0,0,0.18); }
.color-picker::-webkit-color-swatch-wrapper { padding: 0; }
.color-picker::-webkit-color-swatch { border: none; border-radius: 50%; }
.color-picker::-moz-color-swatch { border: none; border-radius: 50%; }

/* Make event pills match the inner tile width and respect gutters */
.fc-daygrid-day .fc-daygrid-day-events {
  /* inset the event area from tile edges so pills line up with visual gutter */
  padding: 2px 2px 1px 2px; /* remove bottom padding so stacked items touch */
  display: block;
}
.fc-daygrid-day .fc-daygrid-day-events > * {
  display: block !important;
  /* limit width so pills don't overflow the rounded tile inset (0px left+right) */
  width: calc(100% - 2px) !important;
  max-width: calc(100% - 10px) !important;
  margin: 0 !important; /* remove vertical gap between stacked items */
  box-sizing: border-box !important;
  padding: 1px !important;
}
.fc-daygrid-day .fc-daygrid-event {
  /* tighten pill padding so it visually matches the tile and keep pill within width */
  padding: 1px 1px !important;
  border-radius: 8px;
  width: calc(100% - 8px) !important;
  max-width: calc(100% - 8px) !important;
  margin: 0 !important; /* ensure no gap */
}
.fc-daygrid-event .fc-event-main-frame,
.fc-daygrid-event .fc-event-title {
  width: 60% !important;
  box-sizing: border-box !important;
  display: block !important;
  text-align: center;
}

/* nudge day-number spacing slightly so events have more room */
.fc-daygrid-day-number { margin: 4px auto 6px auto; }

      `}</style>
      <h2>User Schedule</h2>
      <Dialog open={isTaskDialogOpen} onOpenChange={handleDialogOpenChange}>
  <Button type="button" className="bg-red-500 text-white font-semibold ml-16 mb-4" onClick={openAddTask}>
          Add Task
        </Button>
        <DialogContent className="w-[92vw] max-w-[520px] bg-gray-900 text-gray-200 p-6">
          {viewingEvent && !isEditing ? (
            <div>
              <DialogHeader className="mb-4 p-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div style={{ width: 12, height: 12, borderRadius: 4, backgroundColor: viewingEvent.backgroundColor, marginTop: 6 }} />
                    <div>
                      <DialogTitle className="text-lg font-semibold leading-tight">{viewingEvent.title}</DialogTitle>
                      <div className="text-sm text-gray-300 mt-1">{new Date(viewingEvent.start).toLocaleString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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
              </DialogHeader>

              <div className="text-sm text-gray-300 whitespace-pre-wrap">
                {taskDescription || 'No description'}
              </div>
            </div>
          ) : (
            <>
              <DialogHeader className="mb-2 p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-lg font-semibold">{editingEvent ? 'Edit Task' : 'Add Task'}</DialogTitle>
                    <DialogDescription className="text-sm text-gray-400">{editingEvent ? 'Edit the task details.' : 'Add a new task to your schedule.'}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <form onSubmit={handleSaveTask} className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="task_title">Title</Label>
                  <Input
                    className='bg-gray-800 h-10'
                    id="task_title"
                    type="text"
                    placeholder="Task Title"
                    value={taskTitle}
                    onChange={e => setTaskTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="task_date">Date</Label>
                    <Input
                       className="col-span-3 bg-gray-800 border-gray-700 text-white focus:border-red-500 focus:ring-red-500 [color-scheme:dark]"
                      id="task_date"
                      type="date"
                      value={taskDate}
                      onChange={e => setTaskDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Start Time</Label>
                    <Input
                       className="col-span-3 bg-gray-800 border-gray-700 text-white focus:border-red-500 focus:ring-red-500 [color-scheme:dark]"
                      id="start_time"
                      type="time"
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_time">End Time</Label>
                    <Input
                       className="col-span-3 bg-gray-800 border-gray-700 text-white focus:border-red-500 focus:ring-red-500 [color-scheme:dark]"
                      id="end_time"
                      type="time"
                      value={endTime}
                      onChange={e => setEndTime(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task_description">Description (optional)</Label>
                  <textarea
                    id="task_description"
                    className="bg-gray-800 w-full rounded-md p-2 text-sm h-24 resize-none"
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
                <DialogFooter className="p-0 mt-2">
                  <div className="flex items-center justify-end gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className='bg-gray-800'
                      onClick={() => { setIsTaskDialogOpen(false); setViewingEvent(null); setEditingEvent(null); setIsEditing(false); }}
                    >
                      Cancel
                    </Button>
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
  <div className="ml-16 mb-4 flex items-center gap-3">
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
  <div className="calendar-shell" style={{ marginLeft: '2rem', marginRight: '2rem', backgroundColor: '#211f1dff', borderRadius: 8 }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          eventContent={renderEventContent}
          // Let calendar size itself to content so the page grows instead of internal scrolling
          contentHeight="auto"
          // optional: also enable dayMaxEventRows if you want compact multi-day display
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
