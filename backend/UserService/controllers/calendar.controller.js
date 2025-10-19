import {
  buildOauthUrl,
  exchangeCodeForTokens,
  saveTokensForUser,
  getTokensForUser,
  fetchGoogleCalendarEvents,
  saveOrUpdateEventsForUser,
  saveOrCreateEventForUser,
  getEventsForUser,
  updateEventForUser,
  deleteEventForUser,
  refreshAccessToken,
  updateAccessTokenForUser
} from '../services/calendar.service.js';
import { supabase } from '../database/supabase.js'

export const getGoogleOauthUrl = async (req, res) => {
  const { userId } = req.params;
  try {
    const url = buildOauthUrl(userId);
  console.log('[oauth] built url:', url);
    res.json({ url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to build oauth url' });
  }
}

export const googleCallback = async (req, res) => {
  // Handles redirect from Google with code
  const { code, state } = req.query;
  try {
  console.log('[oauth] callback received. query:', req.query);
    // state contains userId
    const userId = state;
    if (!code) return res.status(400).send('Missing code');
    const tokens = await exchangeCodeForTokens(String(code));
    await saveTokensForUser(String(userId), tokens);
    // Redirect user back to frontend dashboard
    const frontendUrl = process.env.FRONTEND_URL || 'https://www.fit-nest.app';
    const dashboardUrl = `${frontendUrl}/dashboard/user`;
    console.log('[oauth] redirecting to:', dashboardUrl);
    res.redirect(dashboardUrl);
  } catch (err) {
    console.error('Callback error', err);
    res.status(500).send('OAuth callback failed');
  }
}

export const calendarStatus = async (req, res) => {
  const { userId } = req.params;
  try {
    const tokens = await getTokensForUser(String(userId));
    if (!tokens) return res.json({ connected: false });

    const now = Math.floor(Date.now() / 1000);
    // If we have an expires_at and it's in the future, consider connected
    if (tokens.expires_at && Number(tokens.expires_at) > now) {
      return res.json({ connected: true });
    }

    // If token is expired but we have a refresh token, try to refresh once
    if (tokens.refresh_token) {
      try {
        const refreshed = await refreshAccessToken(tokens.refresh_token);
        // store updated access token/expires
        await updateAccessTokenForUser(String(userId), refreshed.access_token, refreshed.expires_in);
        return res.json({ connected: true });
      } catch (refreshErr) {
        console.warn('[oauth] calendarStatus refresh failed', refreshErr);
        return res.json({ connected: false });
      }
    }

    // Fallback: if there is an access_token but no refresh token or expiry, treat as connected
    if (tokens.access_token) return res.json({ connected: true });

    return res.json({ connected: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ connected: false });
  }
}

export const getCalendarEvents = async (req, res) => {
  const { userId } = req.params;
  try {
  // Read events from calendar table via service helper
  const events = await getEventsForUser(String(userId))
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
}

export const syncCalendar = async (req, res) => {
  const { userId } = req.params;
  try {
    const tokens = await getTokensForUser(String(userId));
    if (!tokens || !tokens.refresh_token) return res.status(400).json({ error: 'user not connected' });
    // Ensure we have a valid access token; refresh if needed
    let accessToken = tokens.access_token
    try {
      // Try to fetch events with current access token
      var events = await fetchGoogleCalendarEvents(accessToken)
    } catch (err) {
      if (String(err.message).toLowerCase().includes('access token expired') || String(err.message).includes('401')) {
        // Attempt refresh
        const refreshed = await refreshAccessToken(tokens.refresh_token)
        accessToken = refreshed.access_token
        await updateAccessTokenForUser(String(userId), accessToken, refreshed.expires_in)
        events = await fetchGoogleCalendarEvents(accessToken)
      } else {
        throw err
      }
    }
    const merged = await saveOrUpdateEventsForUser(String(userId), events);
    res.json(merged);
  } catch (err) {
    console.error('syncCalendar error', err);
    const payload = { error: 'sync failed' };
    if (process.env.NODE_ENV !== 'production') {
      payload.message = err.message;
      payload.stack = err.stack;
    }
    res.status(500).json(payload);
  }
}

export const createCalendarEvent = async (req, res) => {
  const { userId } = req.params;
  const payload = req.body;
  
  console.log(`📝 [calendar.controller] Creating calendar event for user ${userId}`, { 
    timestamp: new Date().toISOString(),
    title: payload.title,
    start: payload.start,
    end: payload.end 
  });
  
  try {
    // payload expected: { title, start, end, description }
    const created = await saveOrCreateEventForUser(String(userId), payload)
    console.log(`✅ [calendar.controller] Calendar event created successfully`, { 
      eventId: created.id,
      title: created.title 
    });
    res.json(created)
  } catch (err) {
    console.error('❌ [calendar.controller] createCalendarEvent error', err);
    res.status(500).json({ error: 'create failed', message: err.message })
  }
}

export const updateCalendarEvent = async (req, res) => {
  const { calendarId } = req.params
  const payload = req.body

  console.log(`[calendar.controller] Updating calendar event`, {
    timestamp: new Date().toISOString(),
    calendarId,
    payload,
    method: req.method,
    url: req.url
  });
  
  try {
    // Check if caller passed a Google event id instead of UUID calendar_id
    // Calendar IDs are UUIDs, Google event IDs are different format
    let idToUse = String(calendarId)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idToUse)
    
    if (!isUUID) {
      // This might be a Google event ID, try to resolve it
      console.log(`🔍 [calendar.controller] Resolving Google event ID to calendar ID`, { googleEventId: idToUse });
      try {
        const { data, error } = await supabase.from('calendar').select('calendar_id').eq('google_event_id', idToUse).single()
        if (error || !data) {
          console.log(`❌ [calendar.controller] Calendar event not found for Google ID`, { googleEventId: idToUse, error });
          return res.status(404).json({ error: 'not_found', message: 'calendar row not found for id' })
        }
        idToUse = String(data.calendar_id)
        console.log(`✅ [calendar.controller] Resolved calendar ID`, { googleEventId: calendarId, calendarId: idToUse });
      } catch (e) {
        console.error('❌ [calendar.controller] failed to resolve google_event_id to calendar_id', e)
        return res.status(500).json({ error: 'resolve_failed', message: e.message })
      }
    } else {
      console.log(`✅ [calendar.controller] Using UUID as calendar_id`, { calendarId: idToUse });
    }
    
    console.log(`🔄 [calendar.controller] Calling updateEventForUser`, { calendarId: idToUse });
    const updated = await updateEventForUser(String(idToUse), payload)
    
    console.log(`✅ [calendar.controller] Event updated successfully`, { 
      eventId: updated.calendar_id,
      title: updated.task 
    });
    
    res.json(updated)
  } catch (err) {
    console.error('❌ [calendar.controller] updateCalendarEvent error', err)
    if (err && (err.code === 'GOOGLE_AUTH_REQUIRED' || String(err.message).toLowerCase().includes('google_auth_required'))) {
      return res.status(401).json({ error: 'google_auth_required' })
    }
    res.status(500).json({ error: 'update failed', message: err.message })
  }
}

export const deleteCalendarEvent = async (req, res) => {
  const { calendarId } = req.params
  try {
    const result = await deleteEventForUser(String(calendarId))
    res.json({ success: true, result })
  } catch (err) {
    console.error('deleteCalendarEvent error', err)
    res.status(500).json({ error: 'delete failed', message: err.message })
  }
}
