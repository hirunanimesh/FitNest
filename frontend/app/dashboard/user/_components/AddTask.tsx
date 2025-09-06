"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Save, X, ImagePlus } from "lucide-react";
interface EventShape {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  color?: string;
  description?: string | null;
  extendedProps?: { description?: string | null, rawStart?: string, rawEnd?: string };
  // google_event_id stores the Google event id when the row is synced
  google_event_id?: string | null;
  // whether the event is an all-day event (start is date-only)
  allDay?: boolean;
}

interface Props {
  isTaskDialogOpen: boolean;
  setIsTaskDialogOpen: (v: boolean) => void;
  viewingEvent: EventShape | null;
  setViewingEvent: (e: EventShape | null) => void;
  editingEvent: EventShape | null;
  setEditingEvent: (e: EventShape | null) => void;
  setEvents: React.Dispatch<React.SetStateAction<EventShape[]>>;
}

const AddTask: React.FC<Props> = ({
  isTaskDialogOpen,
  setIsTaskDialogOpen,
  viewingEvent,
  setViewingEvent,
  editingEvent,
  setEditingEvent,
  setEvents,
}) => {
  const { user } = useAuth()

  const [taskTitle, setTaskTitle] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [taskColor, setTaskColor] = useState('#ef4444');
  const [taskDescription, setTaskDescription] = useState('');

  // populate fields when viewing or editing an event
  useEffect(() => {
    const pickRaw = (ev?: any) => {
      if (!ev) return { start: '', end: '' }
      const rawStart = (ev.extendedProps && ev.extendedProps.rawStart) || ev.start || ''
      const rawEnd = (ev.extendedProps && ev.extendedProps.rawEnd) || ev.end || ''
      return { start: rawStart, end: rawEnd }
    }

    if (editingEvent) {
      const { start, end } = pickRaw(editingEvent as any)
      setTaskTitle(editingEvent.title || '')
      setTaskDate(start ? start.split('T')[0] : '')
      setStartTime(start && start.includes('T') ? start.split('T')[1].slice(0,5) : '')
      setEndTime(end && end.includes('T') ? end.split('T')[1].slice(0,5) : '')
      setTaskDescription(editingEvent.description || editingEvent.extendedProps?.description || '')
      setTaskColor(editingEvent.backgroundColor || '#ef4444')
    } else if (viewingEvent) {
      // when viewing, populate for read-only display
      const { start, end } = pickRaw(viewingEvent as any)
      setTaskTitle(viewingEvent.title || '')
      setTaskDate(start ? start.split('T')[0] : '')
      setStartTime(start && start.includes('T') ? start.split('T')[1].slice(0,5) : '')
      setEndTime(end && end.includes('T') ? end.split('T')[1].slice(0,5) : '')
      setTaskDescription(viewingEvent.description || viewingEvent.extendedProps?.description || '')
      setTaskColor(viewingEvent.backgroundColor || '#ef4444')
    } else if (!isTaskDialogOpen) {
      // ensure cleared when dialog closed
      setTaskTitle('')
      setTaskDate('')
      setStartTime('')
      setEndTime('')
      setTaskDescription('')
      setTaskColor('#ef4444')
    }
  }, [editingEvent, viewingEvent, isTaskDialogOpen])

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle || !taskDate) return

    // Build ISO instants from date + time (convert local wall-clock time to UTC ISO string)
    let startIso: string | null = null
    let endIso: string | null = null

    if (startTime) {
      const startTimeNormalized = startTime.includes(':') ? `${startTime}:00` : `${startTime}:00`;
      // Preserve the exact local wall-clock string the user entered.
      startIso = `${taskDate}T${startTimeNormalized}`

      if (endTime) {
        const endTimeNormalized = endTime.includes(':') ? `${endTime}:00` : `${endTime}:00`;
        endIso = `${taskDate}T${endTimeNormalized}`
      } else {
        // default 1 hour duration calculated using the client's local clock,
        // then formatted back to a local YYYY-MM-DDTHH:mm:00 string so we keep
        // the user's wall-clock times rather than converting to UTC.
        const startLocal = new Date(`${taskDate}T${startTimeNormalized}`)
        const endLocal = new Date(startLocal.getTime() + 60 * 60 * 1000)
        const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:00`
        endIso = fmt(endLocal)
      }
    } else {
      // no time provided: treat as an all-day event and send a date-only string
      // Sending an ISO midnight (toISOString) can shift the day when the browser/server
      // interprets it in UTC vs local timezone. Use the plain YYYY-MM-DD date to avoid
      // timezone shifts for all-day events.
      startIso = taskDate
      endIso = null
    }

    const payload = {
      title: taskTitle,
      start: startIso,
      end: endIso,
      description: taskDescription || '',
      color: taskColor,
    }

    try {
      const base = process.env.NEXT_PUBLIC_USERSERVICE_URL?.trim() ? process.env.NEXT_PUBLIC_USERSERVICE_URL : 'http://localhost:3004'
      const userId = user?.id
      if (!userId) return alert('You must be signed in to add tasks')

      if (editingEvent) {
        const res = await fetch(`${base}/calendar/${editingEvent.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('update failed')
        const updated = await res.json()
        // Defensive mapping: backend may return different shapes (normalized or raw supabase row).
        const mapUpdatedToEvent = (upd: any) => {
          if (!upd) return null
          const id = String(upd.id || upd.calendar_id || editingEvent.id)
          const title = upd.title || upd.task || payload.title
          const start = upd.start || upd.task_date || payload.start
          const end = upd.end || upd.task_date || payload.end
          const color = upd.color || upd.backgroundColor || payload.color || taskColor
          const description = (upd.description !== undefined ? upd.description : payload.description) || ''
          return {
            id,
            title,
            start,
            end,
            backgroundColor: color,
            color,
            description,
            // keep google_event_id if the backend returns it so clients can match
            google_event_id: upd.google_event_id || null,
            // mark as all-day if start is a date-only string -> prevents timezone shifts
            allDay: typeof start === 'string' && !String(start).includes('T'),
            extendedProps: { description, rawStart: start, rawEnd: end }
          }
        }

        const mapped = mapUpdatedToEvent(updated)
        if (mapped) {
          // Replace the matching event. Match by calendar id OR google_event_id OR the editingEvent id
          setEvents(prev => {
            let replaced = false
            const mappedId = String(mapped.id || '')
            const mappedGoogleId = String(mapped.google_event_id || '')
            const updated = prev.map(ev => {
              const evId = String((ev as any).id || '')
              const evGoogleId = String((ev as any).google_event_id || '')
              const matchesCalendarId = evId === mappedId
              const matchesGoogleId = mappedGoogleId ? evGoogleId === mappedGoogleId : false
              const matchesEditingId = editingEvent ? evId === String(editingEvent.id) : false
              if (matchesCalendarId || matchesGoogleId || matchesEditingId) {
                replaced = true
                return mapped
              }
              return ev
            })
            if (!replaced) {
              // If nothing matched, append the updated event to avoid losing it
              updated.push(mapped)
            }
            return updated
          })
          setEditingEvent(null)
        } else {
          // Fallback: refetch all events for the user to avoid accidental deletion
          try {
            const userId = user?.id
            if (userId) {
              const r = await fetch(`${base}/calendar/events/${userId}`)
              if (r.ok) {
                const all = await r.json()
                // Map server shape to EventShape used in frontend
                const mappedAll = (all || []).map((it: any) => ({
                  id: String(it.id || it.calendar_id),
                  title: it.title || it.task,
                  start: it.start || it.task_date,
                  end: it.end || it.task_date,
                  backgroundColor: it.color || it.backgroundColor || taskColor,
                  color: it.color || taskColor,
                  description: it.description || '' ,
                  extendedProps: { description: it.description || '' }
                }))
                setEvents(mappedAll)
              }
            }
          } catch (e) { console.error('failed to refetch events after update', e) }
        }
      } else {
        const res = await fetch(`${base}/calendar/create/${userId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('create failed')
        const saved = await res.json()
        const newEvent: EventShape = {
          id: String(saved.id || `${Date.now()}`),
          title: saved.title || payload.title,
          start: saved.start || payload.start,
          end: saved.end || payload.end,
          backgroundColor: taskColor,
          color: taskColor,
          description: saved.description || payload.description || '',
          google_event_id: saved.google_event_id || null,
          // allDay true when start is date-only
          allDay: typeof (saved.start || payload.start) === 'string' && !String(saved.start || payload.start).includes('T'),
          extendedProps: { description: saved.description || payload.description || '', rawStart: saved.start || payload.start, rawEnd: saved.end || payload.end }
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
      setViewingEvent(null)
    }
  }

  const handleDeleteEvent = async () => {
    try {
      const base = process.env.NEXT_PUBLIC_USERSERVICE_URL?.trim() ? process.env.NEXT_PUBLIC_USERSERVICE_URL : 'http://localhost:3004'
      const idToDelete = editingEvent?.id || viewingEvent?.id
      if (!idToDelete) return alert('No event selected to delete')
      const res = await fetch(`${base}/calendar/${idToDelete}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('delete failed')
      setEvents(prev => prev.filter(ev => ev.id !== String(idToDelete)))
      setEditingEvent(null)
      setViewingEvent(null)
      setIsTaskDialogOpen(false)
    } catch (err) {
      console.error('delete failed', err)
      alert('Failed to delete event')
    }
  }

  const openAddTask = () => {
    setViewingEvent(null)
    setEditingEvent(null)
    setTaskTitle('')
    setTaskDate('')
    setStartTime('')
    setEndTime('')
    setTaskDescription('')
    setTaskColor('#ef4444')
    setIsTaskDialogOpen(true)
  }

  // keyboard shortcuts inside dialog
  useEffect(() => {
    if (!isTaskDialogOpen) return
    const onKey = (ev: KeyboardEvent) => {
      try {
        const target = ev.target as HTMLElement | null
        const tag = target && target.tagName ? target.tagName.toLowerCase() : ''
        const isEditable = tag === 'input' || tag === 'textarea' || (target && target.isContentEditable)
        if (isEditable) return
      } catch (e) {}

      if (ev.key === 'e' || ev.key === 'E') {
        ev.preventDefault()
        if (viewingEvent) setEditingEvent(viewingEvent)
      }
      if (ev.key === 'Delete') {
        ev.preventDefault()
        handleDeleteEvent()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isTaskDialogOpen, viewingEvent, editingEvent])

  // helpers to format date/time for the details card
  // Parse an ISO-like string into a local Date object without applying
  // unintended timezone conversions when the string lacks an explicit
  // timezone marker. If the string includes Z or +HH:MM, fall back to
  // Date(iso) which is timezone-aware.
  const parseToLocalDate = (iso?: string): Date | null => {
    if (!iso) return null
    // If it contains timezone info (Z or +HH or -HH), let Date handle it
    if (/[zZ]|[+-]\d{2}:?\d{2}$/.test(iso)) {
      try { return new Date(iso) } catch (e) { return null }
    }
    // If it's a date-only string YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
      const [y, m, d] = iso.split('-').map(Number)
      return new Date(y, m - 1, d)
    }
    // If it's YYYY-MM-DDTHH:MM(:SS)? treat as local wall-clock
    const m = iso.split('T')
    if (m.length === 2) {
      const [y, mo, da] = m[0].split('-').map(Number)
      const timeParts = (m[1] || '').split(':').map(Number)
      const hh = timeParts[0] || 0
      const mm = timeParts[1] || 0
      const ss = Math.floor(timeParts[2] || 0)
      return new Date(y, (mo || 1) - 1, da || 1, hh, mm, ss)
    }
    // Fallback to Date parsing
    try { return new Date(iso) } catch (e) { return null }
  }

  const formatDateLong = (iso?: string) => {
    const d = parseToLocalDate(iso)
    if (!d) return ''
    try { return d.toLocaleString(undefined, { weekday: 'long', day: 'numeric', month: 'long' }) } catch (e) { return iso || '' }
  }

  const formatTimeOnly = (iso?: string) => {
    const d = parseToLocalDate(iso)
    if (!d) return ''
    try { return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) } catch (e) { return '' }
  }

  return (
    <div>
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <Button type="button" className="bg-red-500 text-white font-semibold ml-16 mb-4" onClick={openAddTask}>
          Add Task
        </Button>
        <DialogContent className="w-[92vw] max-w-[520px] bg-gray-900 text-gray-200 p-6">
          {viewingEvent && !editingEvent ? (
            <div>
              <DialogHeader className="mb-4 p-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div style={{ width: 12, height: 12, borderRadius: 4, backgroundColor: viewingEvent.backgroundColor, marginTop: 6 }} />
                    <div>
                      <DialogTitle className="text-lg font-semibold leading-tight">{viewingEvent.title}</DialogTitle>
                      <div className="text-sm text-gray-300 mt-1">
                        <div>{formatDateLong(viewingEvent.start)}</div>
                        {/* Only show times when the stored start/end include a time portion (contain 'T').
                           Date-only strings (YYYY-MM-DD) are treated as all-day events and should
                           not render a time of 12:00 AM. */}
                        {(viewingEvent.start && String(viewingEvent.start).includes('T')) ? (
                          <div className="text-sm text-gray-300 mt-1">{formatTimeOnly(viewingEvent.start)}{(viewingEvent.end && String(viewingEvent.end).includes('T')) ? ` — ${formatTimeOnly(viewingEvent.end)}` : ''}</div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setEditingEvent(viewingEvent)} title="Edit" aria-label="Edit event" className="p-2 rounded hover:bg-gray-800"><Edit className="w-4 h-4 mr-2" /></button>
                    <button type="button" onClick={handleDeleteEvent} title="Delete" aria-label="Delete event" className="p-2 rounded hover:bg-gray-800"><Trash2 className="w-4 h-4 mr-2" /></button>
                  </div>
                </div>
              </DialogHeader>
              <div className="text-sm text-gray-300 whitespace-pre-wrap">{taskDescription || 'No description'}</div>
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
                  <Input className='bg-gray-800 h-10' id="task_title" type="text" placeholder="Task Title" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="task_date">Date</Label>
                    <Input className="col-span-3 bg-gray-800 border-gray-700 text-white focus:border-red-500 focus:ring-red-500 [color-scheme:dark]" id="task_date" type="date" value={taskDate} onChange={e => setTaskDate(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Start Time</Label>
                    <Input className="col-span-3 bg-gray-800 border-gray-700 text-white focus:border-red-500 focus:ring-red-500 [color-scheme:dark]" id="start_time" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_time">End Time</Label>
                    <Input className="col-span-3 bg-gray-800 border-gray-700 text-white focus:border-red-500 focus:ring-red-500 [color-scheme:dark]" id="end_time" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task_description">Description (optional)</Label>
                  <textarea id="task_description" className="bg-gray-800 w-full rounded-md p-2 text-sm h-24 resize-none" placeholder="Details about the task" value={taskDescription} onChange={e => setTaskDescription(e.target.value)} />
                </div>
                <div className="flex items-center gap-3">
                  <Label htmlFor="task_color" className="whitespace-nowrap">Color</Label>
                  <input id="task_color" type="color" value={taskColor} onChange={e => setTaskColor(e.target.value)} className="color-picker w-8 h-8 p-0 rounded-full border-none" style={{ boxShadow: `0 0 0 4px ${taskColor}33` }} title="Choose event color" />
                </div>
                <DialogFooter className="p-0 mt-2">
                  <div className="flex items-center justify-end gap-3">
                    <Button type="button" variant="outline" className='bg-gray-800' onClick={() => { setIsTaskDialogOpen(false); setViewingEvent(null); setEditingEvent(null); }} >Cancel</Button>
                    <Button type="submit">Save Task</Button>
                  </div>
                </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AddTask;
