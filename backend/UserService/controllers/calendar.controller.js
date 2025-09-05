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
    res.redirect(process.env.FRONTEND_URL || '/');
  } catch (err) {
    console.error('Callback error', err);
    res.status(500).send('OAuth callback failed');
  }
}

export const calendarStatus = async (req, res) => {
  const { userId } = req.params;
  try {
    const tokens = await getTokensForUser(String(userId));
    res.json({ connected: Boolean(tokens && tokens.refresh_token) });
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
  try {
    // payload expected: { title, start, end, description }
    const created = await saveOrCreateEventForUser(String(userId), payload)
    res.json(created)
  } catch (err) {
    console.error('createCalendarEvent error', err);
    res.status(500).json({ error: 'create failed', message: err.message })
  }
}

export const updateCalendarEvent = async (req, res) => {
  const { calendarId } = req.params
  const payload = req.body
  try {
    const updated = await updateEventForUser(String(calendarId), payload)
    res.json(updated)
  } catch (err) {
    console.error('updateCalendarEvent error', err)
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
