// Shared helpers for mapping and deduplication between Schedule and AddTask
export const mapServerList = (list: any[] = [], fallbackColor = '#3b82f6') => {
  return (list || []).map((ev: any) => ({
    id: String(ev.id || ev.calendar_id || ev.calendarId || ''),
    title: ev.title || ev.task || '',
    start: ev.start || ev.task_date || ev.start_ts || '',
    end: ev.end || ev.end_ts || ev.task_date || '',
    // mark as allDay when start is a date-only string (no 'T')
    allDay: typeof (ev.start || ev.task_date) === 'string' && !String(ev.start || ev.task_date).includes('T'),
    backgroundColor: ev.backgroundColor || ev.color || fallbackColor,
    color: ev.color || ev.backgroundColor || fallbackColor,
    // include google_event_id when backend returns it
    google_event_id: ev.google_event_id || ev.googleEventId || ev.googleEvent || null,
    description: ev.description || null,
    extendedProps: { description: ev.description || null, rawStart: ev.start || ev.task_date || ev.start_ts || '', rawEnd: ev.end || ev.end_ts || '' }
  }))
}

export const mapUpdatedToEvent = (upd: any, fallbackTitle = '', fallbackColor = '#3b82f6') => {
  const start = upd.start || upd.task_date || ''
  const end = upd.end || upd.task_date || ''
  const color = upd.color || upd.backgroundColor || fallbackColor
  const description = upd.description || ''
  return {
    id: String(upd.id || upd.calendar_id || `${Date.now()}`),
    title: upd.title || upd.task || fallbackTitle,
    start,
    end,
    backgroundColor: color,
    color,
    description,
    google_event_id: upd.google_event_id || null,
    allDay: typeof start === 'string' && !String(start).includes('T'),
    extendedProps: { description, rawStart: start, rawEnd: end }
  }
}

export const dedupeEvents = (list: any[]) => {
  const seen = new Set<string>()
  const out: any[] = []
  for (const ev of list) {
    const idKey = ev && (ev as any).id ? `id:${(ev as any).id}` : ''
    const gidKey = ev && (ev as any).google_event_id ? `gid:${(ev as any).google_event_id}` : ''
    const rawKey = `${(ev as any).extendedProps?.rawStart || ev.start || ''}::${ev.title || ''}`
    const key = idKey || gidKey || `raw:${rawKey}`
    if (!seen.has(key)) {
      seen.add(key)
      out.push(ev)
    }
  }
  return out
}
