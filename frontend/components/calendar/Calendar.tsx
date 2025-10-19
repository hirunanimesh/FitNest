"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext'
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import AddTask from './AddTask'
import styles from '../Schedule.styles'
import calendarStyles from './Calendar.styles'
import { dedupeEvents as dedupeEventsUtil } from './calendarUtils'
import { Button } from "@/components/ui/button";
import {fetchEvents,checkGoogleCalendarStatus,connectGoogleCalendar,syncGoogleCalendar,updateEvent,deleteEvent,formatEventIso} from '@/api/calendar/route';

interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  color?: string;
  description?: string | null;
  extendedProps?: { description?: string | null; rawStart?: string; rawEnd?: string; google_event_id?: string };
  google_event_id?: string | null;
  allDay?: boolean;
}

const Schedule: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [taskColor, setTaskColor] = useState('#3b2aa5ff');
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
  const [googleConnected, setGoogleConnected] = useState<boolean | null>(null);
  const [loadingSync, setLoadingSync] = useState(false);
  const { user } = useAuth()

  const dedupeEvents = (list: Event[]) => dedupeEventsUtil(list)

  // Load events for a date range (start/end are ISO strings)
const loadEventsForMonth = async (startIso: string, endIso: string) => {
    const userId = user?.id;
    if (!userId) return;
    try {
      // fetchEvents backend should accept (userId, start, end) and filter by range
      const mappedServer = await fetchEvents(userId, startIso, endIso);
      if (Array.isArray(mappedServer)) {
        setEvents(() => dedupeEvents(mappedServer));
      }
    } catch (err) {
      console.error('Failed to load events for month', err);
    }
  }

  // Detect small screens (Pixel 7 ~ 412px width). Adjust rendering accordingly.
  const [isSmallScreen, setIsSmallScreen] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 430px)')
    const apply = (m: MediaQueryList | MediaQueryListEvent) => setIsSmallScreen(Boolean((m as any).matches))
    apply(mq)
    if (mq.addEventListener) mq.addEventListener('change', apply)
    else mq.addListener(apply)
    return () => { if (mq.removeEventListener) mq.removeEventListener('change', apply); else mq.removeListener(apply) }
  }, [])

  useEffect(() => {
    // Only run when user ID changes, not on every user object change
    const userId = user?.id;
    if (!userId) {
      setGoogleConnected(false);
      return;
    }

    // Simple fetch without caching complications
    (async () => {
      try {
        const connected = await checkGoogleCalendarStatus(userId);
        setGoogleConnected(connected);

      const today = new Date();
        const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
        const lastOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString();
        await loadEventsForMonth(firstOfMonth, lastOfMonth);
      } catch (err) {
        console.error('calendar status/events check failed', err)
        setGoogleConnected(false);
      }
    })();
  }, [user?.id]); // Only depend on user.id to prevent excessive re-renders

  const handleConnectGoogleCalendar = async () => {
    try {
      const userId = user?.id;
      if (!userId) return alert('You must be signed in to connect Google Calendar');
      await connectGoogleCalendar(userId);
    } catch (err) {
      alert('Unable to start Google OAuth. Check console for details.');
    }
  };

  const handleSyncGoogleCalendar = async () => {
    const userId = user?.id;
    if (!userId) {
      alert('You must be signed in to sync');
      return;
    }

    setLoadingSync(true);
    try {
      const mapped = await syncGoogleCalendar(userId);

      // Merge synced server events with any existing local events conservatively
      setEvents(prev => {
        const serverIds = new Set(mapped.map((s: any) => String(s.id || '')));
        const serverGids = new Set(mapped.map((s: any) => String(s.google_event_id || '')));
        const leftover = prev.filter(p => {
          const pid = String((p as any).id || '');
          const pgid = String((p as any).google_event_id || '');
          const raw = (p as any).extendedProps?.rawStart || p.start || '';
          const title = p.title || '';
          if (pid && serverIds.has(pid)) return false;
          if (pgid && serverGids.has(pgid)) return false;
          const matchesServer = mapped.find((s: any) => {
            const sRaw = (s as any).extendedProps?.rawStart || s.start || '';
            const sTitle = s.title || '';
            return sRaw && sTitle && sRaw === raw && sTitle === title;
          });
          if (matchesServer) return false;
          return true;
        });
        return dedupeEvents([...mapped, ...leftover]);
      });

      setGoogleConnected(true);
    } catch (err) {
      console.error('Sync failed', err);
      alert('Sync failed. Check console for details.');
    } finally {
      setLoadingSync(false);
    }
  };

  // Save handling moved to `AddTask` component. The dialog UI in this component
  // delegates create/update/delete to `AddTask` to keep the logic in one place.

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
      backgroundColor: ev.backgroundColor || '#28375cff',
      description: ev.extendedProps?.description || ''
    }
    setViewingEvent(viewed);
    setTaskColor(ev.backgroundColor || taskColor);
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

  // Persist drag/drop changes to server
  const handleEventDrop = async (dropInfo: any) => {
    const ev = dropInfo.event;
    const id = ev.id || (ev.extendedProps && ev.extendedProps.calendar_id);
    if (!id) {
      // no local id to update; open edit modal as fallback
      setViewingEvent({ id: String(ev.id), title: ev.title, start: ev.startStr || '', end: ev.endStr || '', backgroundColor: ev.backgroundColor || taskColor } as Event);
      setIsTaskDialogOpen(true);
      return;
    }
    const { start, end } = formatEventIso(ev);
    try {
      await updateEvent(String(id), { start, end });
      // update local event in state
      setEvents(prev => prev.map(ev0 => ev0.id === String(id) ? ({ ...ev0, start: start || ev0.start, end: end || ev0.end }) : ev0));
    } catch (e) {
      dropInfo.revert();
      alert('Failed to move event. See console for details.');
    }
  };

  // Persist resize changes to server
  const handleEventResize = async (resizeInfo: any) => {
    const ev = resizeInfo.event;
    const id = ev.id || (ev.extendedProps && ev.extendedProps.calendar_id);
    if (!id) {
      setViewingEvent({ id: String(ev.id), title: ev.title, start: ev.startStr || '', end: ev.endStr || '', backgroundColor: ev.backgroundColor || taskColor } as Event);
      setIsTaskDialogOpen(true);
      return;
    }
    const { start, end } = formatEventIso(ev);
    try {
      await updateEvent(String(id), { start, end });
      setEvents(prev => prev.map(ev0 => ev0.id === String(id) ? ({ ...ev0, start: start || ev0.start, end: end || ev0.end }) : ev0));
    } catch (e) {
      resizeInfo.revert();
      alert('Failed to resize event. See console for details.');
    }
  };

  const enableEditMode = () => {
    if (!viewingEvent) return;
    setEditingEvent(viewingEvent);
  }

  const handleDeleteEvent = async () => {
    try {
      const idToDelete = editingEvent?.id || viewingEvent?.id;
      if (!idToDelete) return alert('No event selected to delete');
      
      await deleteEvent(idToDelete);
      
      setEvents(prev => prev.filter(ev => ev.id !== String(idToDelete)));
      setEditingEvent(null);
      setViewingEvent(null);
      setIsTaskDialogOpen(false);
    } catch (err) {
      alert('Failed to delete event');
    }
  };

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

  useEffect(() => {
    const observer = new MutationObserver(mutations => {
      for (const m of mutations) {
        for (const node of Array.from(m.addedNodes)) {
          try {
            const el = node as HTMLElement
            if (!el || !el.querySelector) continue
            const pop = el.matches && el.matches('.fc-popover') ? el : el.querySelector('.fc-popover') as HTMLElement
            if (pop) {
              const title = pop.querySelector('.fc-popover-title') as HTMLElement | null
              if (!title) continue

              const shortenTitle = () => {
                try {
                  const txt = title.innerText || ''
                  const mday = txt.match(/(\d{1,2})/) || []
                  if (mday && mday[1] && title.innerText !== mday[1]) {
                    // replace with the day number only
                    title.innerText = mday[1]
                  }
                } catch (e) { /* ignore */ }
              }

              // Apply immediately
              shortenTitle()

              if (!(title as any).__shortenObserver) {
                try {
                  const tObs = new MutationObserver(() => {
                    // schedule a microtask so we don't fight FC's updates
                    setTimeout(shortenTitle, 0)
                  })
                  tObs.observe(title, { characterData: true, childList: true, subtree: true })
                  ;(title as any).__shortenObserver = tObs
                } catch (e) { /* ignore */ }
              }
            }
          } catch (e) { /* ignore */ }
        }
      }
    })

    observer.observe(document.body, { childList: true, subtree: true })
    return () => {
      try { observer.disconnect() } catch (e) { /* ignore */ }
      // also disconnect any per-title observers to avoid leaks
      try {
        document.querySelectorAll('.fc-popover .fc-popover-title').forEach(t => {
          const el = t as any
          if (el && el.__shortenObserver && typeof el.__shortenObserver.disconnect === 'function') {
            try { el.__shortenObserver.disconnect() } catch (e) { /* ignore */ }
            delete el.__shortenObserver
          }
        })
      } catch (e) { /* ignore */ }
    }
  }, [])



  // Render events with responsive styles
  const renderEventContent = (eventInfo: any) => {
    const color = eventInfo.event.backgroundColor || '#28375cff'
    const fontSize = isSmallScreen ? '0.64rem' : '0.72rem'
    const padding = isSmallScreen ? '2px 6px' : '3px 6px'
    const titleClass = isSmallScreen ? 'calendar-event-title--small' : 'calendar-event-title--regular'
    
    return (
      <div
        className="calendar-event-container"
        style={{
          backgroundColor: color,
          border: `1px solid ${color}`,
          boxShadow: `0 2px 6px ${color}55`,
          padding
        }}
      >
        <div 
          className={`calendar-event-title ${titleClass}`}
          style={{ fontSize }}
        >
          {eventInfo.event.title}
        </div>
      </div>
    )
  }

  return (
    <div>
  {/* Rely on FullCalendar's built-in small popover for "more" links */}
      <style jsx global>{`
        ${styles}
        ${calendarStyles}
      `}</style>
      

            <h2 className="text-4xl md:text-5xl font-black text-center mb-10 text-gray-300">My Calendar</h2>
          
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
            <Button type="button" onClick={handleSyncGoogleCalendar} disabled={loadingSync}>
              {loadingSync ? 'Syncing...' : 'Sync Google Calendar'}
            </Button>
            <span className="text-sm text-gray-300">Connected</span>
          </>
        ) : (
          <Button type="button" onClick={handleConnectGoogleCalendar} className="bg-blue-600 text-white">
            Connect Google Calendar
          </Button>
        )}
      </div>
  <div className="calendar-shell mx-4 sm:mx-16 bg-[#211f1dff] rounded-lg">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
           // fetch events when visible date range changes (month navigation / view change)
        datesSet={(arg) => {
          const start = arg.startStr;
         const end = arg.endStr;
         loadEventsForMonth(start, end);
      }}
          events={events}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          eventContent={renderEventContent}
          editable={!isSmallScreen}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          // limit number of visible events per day cell; on small screens show fewer rows
          dayMaxEventRows={isSmallScreen ? 1 : 2}
          contentHeight="auto"
          headerToolbar={{
            left: isSmallScreen ? 'prev,next' : 'prev,next today',
            center: 'title',
            right: isSmallScreen ? 'dayGridMonth' : 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
        />
      </div>
    </div>
  );
};

export default Schedule;
