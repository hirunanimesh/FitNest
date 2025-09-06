"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext'
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import AddTask from './AddTask'
import styles from './Schedule.styles'
import { Button } from "@/components/ui/button";

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
        fontWeight: 400,
        boxShadow: `0 2px 8px ${color}55`,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3px 3px',
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
  allDay?: boolean;
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

  useEffect(() => {
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
            end: ev.end || ev.end_ts || ev.task_date || '',
            // mark as allDay when start is a date-only string (no 'T')
            allDay: typeof (ev.start || ev.task_date) === 'string' && !String(ev.start || ev.task_date).includes('T'),
            backgroundColor: ev.backgroundColor || ev.color || '#28375cff',
            color: ev.color || ev.backgroundColor || '#1a2e84ff',
            extendedProps: { description: ev.description || null, rawStart: ev.start || ev.task_date || ev.start_ts || '', rawEnd: ev.end || ev.end_ts || '' }
          })));
        }
      } catch (err) {
        console.error('calendar status/events check failed', err)
        setGoogleConnected(false);
      }
    })();
  }, []);

  const connectGoogleCalendar = async () => {
    try {
      const base = process.env.NEXT_PUBLIC_USERSERVICE_URL?.trim() ? process.env.NEXT_PUBLIC_USERSERVICE_URL : 'http://localhost:3004'
      const userId = user?.id
      if (!userId) return alert('You must be signed in to connect Google Calendar')
      const res = await fetch(`${base}/google/oauth-url/${userId}`)
      if (!res.ok) throw new Error('Failed to get oauth url');
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      console.error('Google connect failed', err);
      alert('Unable to start Google OAuth. Check console for details.');
    }
  };

  const syncGoogleCalendar = async () => {
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
    if (Array.isArray(synced)) {
          const mapped = synced.map((ev: any) => ({
          id: String(ev.id || ev.calendar_id || ev.calendarId || ''),
          title: ev.title || ev.task || '',
      start: ev.start || ev.task_date || ev.start_ts || '',
      end: ev.end || ev.end_ts || ev.task_date || '',
      allDay: typeof (ev.start || ev.task_date) === 'string' && !String(ev.start || ev.task_date).includes('T'),
          backgroundColor: ev.backgroundColor || ev.color || '#28375cff',
          color: ev.color || ev.backgroundColor || '#1a2e84ff',
          extendedProps: { description: ev.description || null, rawStart: ev.start || ev.task_date || ev.start_ts || '', rawEnd: ev.end || ev.end_ts || '' }
        }))
        setEvents(mapped);
      }
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
      let startDate = taskDate;
      let endDate = taskDate;
      if (startTime) {
        const startTimeNormalized = startTime.includes(':') ? `${startTime}:00` : `${startTime}:00`;
        startDate = `${taskDate}T${startTimeNormalized}`;
        if (endTime) {
          const endTimeNormalized = endTime.includes(':') ? `${endTime}:00` : `${endTime}:00`;
          endDate = `${taskDate}T${endTimeNormalized}`;
        } else {
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
              extendedProps: { description: updated.description || payload.description || '', rawStart: updated.start || payload.start, rawEnd: updated.end || payload.end }
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
              allDay: typeof (saved.start || payload.start) === 'string' && !String(saved.start || payload.start).includes('T'),
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
    // Prefer original rawStart/rawEnd if available (we store these in extendedProps)
    const rawStart = (ev.extendedProps && (ev.extendedProps as any).rawStart) || ev.startStr || ''
    const rawEnd = (ev.extendedProps && (ev.extendedProps as any).rawEnd) || ev.endStr || ''

    const splitIso = (iso: string) => {
      if (!iso) return { date: '', time: '' }
      if (iso.length === 10) return { date: iso, time: '' }
      // If iso contains timezone marker (Z or +/-) rely on Date parsing for accurate local time
      if (/[zZ]|[+-]\d{2}:?\d{2}$/.test(iso)) {
        try {
          const d = new Date(iso)
          const date = d.toISOString().slice(0,10)
          const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          return { date, time }
        } catch (e) { return { date: '', time: '' } }
      }
      // No timezone info: treat as local wall-clock (YYYY-MM-DDTHH:MM(:SS)?)
      const [d, t] = iso.split('T')
      const time = (t || '').slice(0,5)
      return { date: d || '', time }
    }
    const s = splitIso(rawStart)
    const e = splitIso(rawEnd)
    const viewed: Event = {
      id: String(ev.id),
      title: ev.title,
      start: rawStart || ev.startStr || '',
      end: rawEnd || ev.endStr || '',
      backgroundColor: ev.backgroundColor || taskColor,
      description: ev.extendedProps?.description || ''
    }
    setViewingEvent(viewed);
    setTaskTitle(ev.title || '');
    setTaskDate(s.date);
    setStartTime(s.time);
    setEndTime(e.time);
    setTaskDescription(ev.extendedProps?.description || '');
    setTaskColor(ev.backgroundColor || taskColor);
    setIsEditing(false);
    setIsTaskDialogOpen(true);
  }

  const handleDateClick = (dateClickInfo: any) => {
    try {
      document.querySelectorAll('.fc-day-selected').forEach(el => el.classList.remove('fc-day-selected'));
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

  useEffect(() => {
    if (!isTaskDialogOpen) return
    const onKey = (ev: KeyboardEvent) => {
      try {
        const target = ev.target as HTMLElement | null
        const tag = target && target.tagName ? target.tagName.toLowerCase() : ''
        const isEditable = tag === 'input' || tag === 'textarea' || (target && target.isContentEditable)
        if (isEditable) return
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

  const handleDialogOpenChange = (open: boolean) => {
    setIsTaskDialogOpen(open)
    if (!open) {
      setViewingEvent(null)
      setEditingEvent(null)
      setIsEditing(false)
      setTaskTitle('')
      setTaskDate('')
      setStartTime('')
      setEndTime('')
      setTaskDescription('')
      setTaskColor('#ef4444')
    }
  }

  const openAddTask = () => {
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

  return (
    <div>
      <style jsx global>{styles}</style>
      <h2>User Schedule</h2>
      <AddTask
        isTaskDialogOpen={isTaskDialogOpen}
        setIsTaskDialogOpen={setIsTaskDialogOpen}
        viewingEvent={viewingEvent}
        setViewingEvent={setViewingEvent}
        editingEvent={editingEvent}
        setEditingEvent={setEditingEvent}
        setEvents={setEvents}
      />
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
          contentHeight="auto"
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
