/**
 * Calendar API functions
 * Contains all API calls extracted from Calendar.tsx component
 */

import { mapServerList as mapServerListUtil } from '@/components/calendar/calendarUtils';

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

const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_USERSERVICE_URL?.trim() 
    ? process.env.NEXT_PUBLIC_USERSERVICE_URL 
    : 'http://localhost:3004';
};

/**
 * Fetch events from the server
 * @param userId - User ID to fetch events for
 * @returns Promise<Event[]> - Array of mapped events
 */
export const fetchEvents = async (userId: string): Promise<Event[]> => {
  const base = getBaseUrl();
  try {
    const response = await fetch(`${base}/calendar/events/${userId}`);
    if (!response.ok) {
      throw new Error('fetch events failed: ' + response.status);
    }
    const serverEvents = await response.json();
    return mapServerListUtil(serverEvents, '#28375cff');
  } catch (error) {
    console.error('failed to fetch events', error);
    return [];
  }
};

/**
 * Check Google Calendar connection status
 * @param userId - User ID to check status for
 * @returns Promise<boolean> - Connection status
 */
export const checkGoogleCalendarStatus = async (userId: string): Promise<boolean> => {
  const base = getBaseUrl();
  try {
    const statusRes = await fetch(`${base}/calendar/status/${userId}`);
    if (statusRes.ok) {
      const json = await statusRes.json();
      return Boolean(json.connected);
    } else {
      console.warn('calendar status check returned non-ok', statusRes.status);
      return false;
    }
  } catch (error) {
    console.error('calendar status check failed', error);
    return false;
  }
};

/**
 * Connect Google Calendar - redirect to OAuth URL
 * @param userId - User ID to connect calendar for
 */
export const connectGoogleCalendar = async (userId: string): Promise<void> => {
  const base = getBaseUrl();
  try {
    const response = await fetch(`${base}/google/oauth-url/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to get oauth url');
    }
    const { url } = await response.json();
    window.location.href = url;
  } catch (error) {
    console.error('Google connect failed', error);
    throw new Error('Unable to start Google OAuth. Check console for details.');
  }
};

/**
 * Sync Google Calendar events
 * @param userId - User ID to sync calendar for
 * @returns Promise<Event[]> - Array of synced events
 */
export const syncGoogleCalendar = async (userId: string): Promise<Event[]> => {
  const base = getBaseUrl();
  try {
    const response = await fetch(`${base}/calendar/sync/${userId}`, { method: 'POST' });
    if (!response.ok) {
      const text = await response.text().catch(() => 'no body');
      console.error('calendar sync failed response:', response.status, text);
      throw new Error(`Sync failed: ${response.status} ${text}`);
    }

    const synced = await response.json().catch(() => null);
    // Accept either a direct array or a wrapped object like { events: [...] }
    const items = Array.isArray(synced) ? synced : (synced && Array.isArray(synced.events) ? synced.events : null);
    if (!items) {
      console.warn('sync returned unexpected shape', synced);
      throw new Error('Sync returned unexpected response shape');
    }

    const mapped = mapServerListUtil(items, '#28375cff');

    // Attempt to persist any items that lack a DB id but include a google_event_id
    try {
      const toPersist = mapped.filter((m: any) => !m.id && m.google_event_id);
      if (toPersist.length > 0) {
        // POST each item (best-effort). Include google_event_id to help server dedupe/upsert.
        await Promise.allSettled(toPersist.map((item: any) => {
          const body = {
            title: item.title,
            start: item.start,
            end: item.end,
            description: item.description || null,
            color: item.backgroundColor || item.color || '#ef4444',
            google_event_id: item.google_event_id
          };
          return fetch(`${base}/calendar/create/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
        }));

        // Refresh authoritative events from server after persistence attempts
        try {
          const fresh = await fetch(`${base}/calendar/events/${userId}`);
          if (fresh.ok) {
            const all = await fresh.json();
            return mapServerListUtil(all, '#28375cff');
          }
        } catch (e) { 
          console.warn('refresh after persistence failed', e);
        }
      }
    } catch (e) {
      console.warn('persistence fallback after sync failed', e);
    }

    return mapped;
  } catch (error) {
    console.error('Sync failed', error);
    throw error;
  }
};

/**
 * Update event (used for drag/drop and resize operations)
 * @param eventId - Event ID to update
 * @param updates - Object containing start and/or end times
 * @returns Promise<boolean> - Success status
 */
export const updateEvent = async (eventId: string, updates: { start?: string | null; end?: string | null }): Promise<boolean> => {
  const base = getBaseUrl();
  try {
    const response = await fetch(`${base}/calendar/${eventId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('update event failed', response.status, text);
      throw new Error(`Failed to update event: ${response.status} ${text}`);
    }
    
    return true;
  } catch (error) {
    console.error('failed to update event', error);
    throw error;
  }
};

/**
 * Delete an event
 * @param eventId - Event ID to delete
 * @returns Promise<boolean> - Success status
 */
export const deleteEvent = async (eventId: string): Promise<boolean> => {
  const base = getBaseUrl();
  try {
    const response = await fetch(`${base}/calendar/${eventId}`, { method: 'DELETE' });
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('delete event failed', response.status, text);
      throw new Error(`Failed to delete event: ${response.status} ${text}`);
    }
    return true;
  } catch (error) {
    console.error('delete failed', error);
    throw error;
  }
};

/**
 * Helper to format event start/end into server-friendly ISO strings
 * @param ev - Event object with start/end properties
 * @returns Object with formatted start and end times
 */
export const formatEventIso = (ev: any) => {
  const start = ev.start;
  const end = ev.end;
  const fmt = (d: Date) => {
    const iso = d.toISOString();
    return iso;
  };
  return {
    start: start ? fmt(new Date(start)) : null,
    end: end ? fmt(new Date(end)) : null
  };
};