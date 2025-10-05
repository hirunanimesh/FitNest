"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext'
import { mapServerList as mapServerListUtil, mapUpdatedToEvent as mapUpdatedToEventUtil, dedupeEvents as dedupeEventsUtil } from './calendarUtils'
import { fetchEvents, createEvent, updateEventWithChanges, deleteEvent as deleteEventAPI } from '@/api/calendar/route'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface EventShape {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  color?: string;
  description?: string | null;
  extendedProps?: { description?: string | null, rawStart?: string, rawEnd?: string };
  google_event_id?: string | null;
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
  const mapServerList = (list: any[], fallbackColor = '#28375cff') => mapServerListUtil(list, fallbackColor)
  const mapUpdatedToEvent = (upd: any): EventShape => mapUpdatedToEventUtil(upd, taskTitle, taskColor)
  const dedupeEvents = (list: EventShape[]) => dedupeEventsUtil(list)
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [taskColor, setTaskColor] = useState('#28375cff');
  const [taskDescription, setTaskDescription] = useState('');

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
      setTaskColor(editingEvent.backgroundColor || '#28375cff')
    } else if (viewingEvent) {
      const { start, end } = pickRaw(viewingEvent as any)
      setTaskTitle(viewingEvent.title || '')
      setTaskDate(start ? start.split('T')[0] : '')
      setStartTime(start && start.includes('T') ? start.split('T')[1].slice(0,5) : '')
      setEndTime(end && end.includes('T') ? end.split('T')[1].slice(0,5) : '')
      setTaskDescription(viewingEvent.description || viewingEvent.extendedProps?.description || '')
      setTaskColor(viewingEvent.backgroundColor || '#28375cff')
    } else if (!isTaskDialogOpen) {
      setTaskTitle('')
      setTaskDate('')
      setStartTime('')
      setEndTime('')
      setTaskDescription('')
      setTaskColor('#28375cff')
    }
  }, [editingEvent, viewingEvent, isTaskDialogOpen])

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle || !taskDate) return

    const normalizeTime = (t: string) => t ? (t.includes(':') ? `${t}:00` : `${t}:00`) : null
    const startTimeNormalized = normalizeTime(startTime)
    const endTimeNormalized = normalizeTime(endTime)

    let startIso: string
    let endIso: string | null

    if (startTimeNormalized) {
      startIso = `${taskDate}T${startTimeNormalized}`
      if (endTimeNormalized) {
        endIso = `${taskDate}T${endTimeNormalized}`
      } else {
        const startLocal = new Date(`${taskDate}T${startTimeNormalized}`)
        const endLocal = new Date(startLocal.getTime() + 60 * 60 * 1000)
        const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:00`
        endIso = fmt(endLocal)
      }
    } else {
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
      const userId = user?.id
      if (!userId) return alert('You must be signed in to add tasks')

      if (editingEvent) {
        if (!editingEvent.id) {
          alert('Cannot update this event because it has no local id. Please sync your calendar or create the event instead.')
          return
        }

        const existingStart = editingEvent.extendedProps?.rawStart || editingEvent.start || ''
        const existingEnd = editingEvent.extendedProps?.rawEnd || editingEvent.end || ''
        const changed: any = {}
        if ((payload.title || '') !== (editingEvent.title || '')) changed.title = payload.title
        if ((payload.description || '') !== (editingEvent.description || editingEvent.extendedProps?.description || '')) changed.description = payload.description
        if ((payload.color || '') !== (editingEvent.backgroundColor || editingEvent.color || '')) changed.color = payload.color
        if ((payload.start || '') !== existingStart) changed.start = payload.start
        // treat null/undefined end as removal; include when differing
        if ((payload.end || '') !== (existingEnd || '')) changed.end = payload.end

        try {
          const parsed = await updateEventWithChanges(editingEvent.id, changed, userId, editingEvent)
          
          if (parsed && parsed.events && Array.isArray(parsed.events)) {
            setEvents(mapServerList(parsed.events, '#3b82f6'))
            setEditingEvent(null)
          } else {
            // Always refresh from server after update to ensure consistency
            try {
              const refreshedEvents = await fetchEvents(userId)
              setEvents(refreshedEvents)
              console.log('[AddTask] Calendar refreshed after update')
              setEditingEvent(null)
            } catch (e) { 
              console.error('Failed to refresh calendar after update', e)
              // Fallback: try to update local state if server refresh fails
              const updated = parsed && parsed.updated ? parsed.updated : parsed
              const mapped = mapUpdatedToEvent(updated)
              if (mapped) {
                setEvents(prev => {
                  const mappedId = String(mapped.id || '')
                  const editingId = String(editingEvent?.id || '')
                  const filtered = prev.filter(ev => String((ev as any).id || '') !== mappedId && String((ev as any).id || '') !== editingId)
                  return dedupeEvents([...filtered, mapped])
                })
              }
              setEditingEvent(null)
            }
          }
        } catch (error: any) {
          // Refresh events on error
          try {
            const refreshedEvents = await fetchEvents(userId)
            setEvents(refreshedEvents)
          } catch (e) { /* ignore refetch errors */ }
          alert('Update failed: ' + (error.message || String(error)))
          return
        }
      } else {
        try {
          const saved = await createEvent(userId, payload)
          
          // Always refresh from server after create to ensure consistency and get latest IDs
          try {
            const refreshedEvents = await fetchEvents(userId)
            setEvents(refreshedEvents)
            console.log('[AddTask] Calendar refreshed after create')
          } catch (e) { 
            console.error('Failed to refresh calendar after create, using fallback', e)
            // Fallback: create local event if server refresh fails
            if (saved && saved.id) {
              const newEvent: EventShape = {
                id: String(saved.id || `${Date.now()}`),
                title: saved.title || payload.title,
                start: saved.start || payload.start,
                end: saved.end || payload.end,
                backgroundColor: taskColor,
                color: taskColor,
                description: saved.description || payload.description || '',
                google_event_id: saved.google_event_id || null,
                allDay: typeof (saved.start || payload.start) === 'string' && !String(saved.start || payload.start).includes('T'),
                extendedProps: { description: saved.description || payload.description || '', rawStart: saved.start || payload.start, rawEnd: saved.end || payload.end }
              }
              setEvents(prev => dedupeEvents([...prev, newEvent]))
            }
          }
        } catch (error: any) {
          console.error('create event failed', error)
          throw new Error(`create failed: ${error.message || String(error)}`)
        }
      }
    } catch (err: any) {
      console.error('save task failed', err)
      alert('Failed to save task: ' + (err && err.message ? err.message : String(err)))
    } finally {
      setTaskTitle('')
      setTaskDate('')
      setStartTime('')
      setEndTime('')
      setTaskDescription('')
      setTaskColor('#28375cff')
      setIsTaskDialogOpen(false)
      setViewingEvent(null)
    }
  }

  const handleDeleteEvent = async () => {
    try {
      const userId = user?.id
      const idToDelete = editingEvent?.id || viewingEvent?.id
      if (!idToDelete) return alert('No event selected to delete')
      
      await deleteEventAPI(idToDelete)
      
      // Auto-refresh calendar after successful delete
      try {
        if (userId) {
          const refreshedEvents = await fetchEvents(userId)
          setEvents(refreshedEvents)
          console.log('[AddTask] Calendar refreshed after delete')
        } else {
          setEvents(prev => prev.filter(ev => ev.id !== String(idToDelete)))
        }
      } catch (e) {
        console.error('Failed to refresh calendar after delete', e)
        // Fallback: remove from local state
        setEvents(prev => prev.filter(ev => ev.id !== String(idToDelete)))
      }
      
      setEditingEvent(null)
      setViewingEvent(null)
      setIsTaskDialogOpen(false)
    } catch (err: any) {
      console.error('delete failed', err)
      alert('Failed to delete event: ' + (err && err.message ? err.message : String(err)))
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
    setTaskColor('#28375cff')
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
              <div className="text-sm text-gray-300 whitespace-pre-wrap">{viewingEvent.description || viewingEvent.extendedProps?.description || 'No description'}</div>
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
                    <Button type="submit">{editingEvent ? 'Update Task' : 'Save Task'}</Button>
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
