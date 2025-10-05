import { supabase } from '../database/supabase.js'
import qs from 'querystring'
import { google } from 'googleapis'

// ========== HELPER UTILITIES ==========

// Centralized logging utility
const logError = (msg, error) => {
  console.error(`❌ [calendar.service] ${msg}:`, error?.message || error)
}

const logInfo = (msg, data = null) => {
  console.log(`ℹ️ [calendar.service] ${msg}`, data || '')
}

// Helper: Extract date and time from ISO-like string
function extractDateAndTime(s) {
  if (!s) return { date: null, time: null }
  const str = String(s)
  if (str.includes('T')) {
    const [d, t] = str.split('T')
    const timeOnly = (t || '').split(/[Z+-]/)[0]
    const parts = timeOnly.split(':')
    const hh = String(parts[0] || '0').padStart(2, '0')
    const mm = String(parts[1] || '0').padStart(2, '0')
    const ss = String(parts[2] || '00').padStart(2, '0')
    return { date: d, time: `${hh}:${mm}:${ss}` }
  }
  return { date: str, time: null }
}

// ========== SUPABASE HELPERS ==========

// Centralized calendar operations
async function upsertCalendarEvent(eventData) {
  try {
    const { data, error } = await supabase
      .from('calendar')
      .upsert(eventData, { onConflict: 'google_event_id' })
      .select('calendar_id, task, task_date, start, "end", user_id, google_event_id, color, description')
      .single()
    
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    // Handle color column missing gracefully
    if (String(error.message).toLowerCase().includes('column') && String(error.message).toLowerCase().includes('color')) {
      const { color, ...eventDataNoColor } = eventData
      const { data, error: retryError } = await supabase
        .from('calendar')
        .upsert(eventDataNoColor, { onConflict: 'google_event_id' })
        .select('calendar_id, task, task_date, start, "end", user_id, google_event_id, description')
        .single()
      
      if (retryError) throw retryError
      return { success: true, data }
    }
    throw error
  }
}

async function getCalendarEvents(userId, options = {}) {
  try {
    let query = supabase.from('calendar').select(
      options.minimal 
        ? 'calendar_id, task, task_date' 
        : 'calendar_id, task, task_date, start, "end", color, description'
    )
    
    if (userId) {
      query = query.eq('user_id', userId)
    }
    
    const { data, error } = await query
    if (error) throw error
    
    return { success: true, data: data || [] }
  } catch (error) {
    // Fallback to minimal select if column issues
    if (String(error.message).toLowerCase().includes('column')) {
      const { data, error: fallbackError } = await supabase
        .from('calendar')
        .select('calendar_id, task, task_date')
        .eq('user_id', userId)
      
      if (fallbackError) throw fallbackError
      return { success: true, data: data || [], minimal: true }
    }
    throw error
  }
}

async function deleteCalendarEvent(calendarId) {
  const { error } = await supabase
    .from('calendar')
    .delete()
    .eq('calendar_id', calendarId)
  
  if (error) throw error
  return { success: true }
}

async function updateCalendarEvent(calendarId, updates) {
  try {
    const { data, error } = await supabase
      .from('calendar')
      .update(updates)
      .eq('calendar_id', calendarId)
      .select('calendar_id, task, task_date, start, "end", user_id, google_event_id, color, description')
      .single()
    
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    // Handle color column missing gracefully
    if (String(error.message).toLowerCase().includes('column') && String(error.message).toLowerCase().includes('color')) {
      const { color, ...updatesNoColor } = updates
      const { data, error: retryError } = await supabase
        .from('calendar')
        .update(updatesNoColor)
        .eq('calendar_id', calendarId)
        .select('calendar_id, task, task_date, start, "end", user_id, google_event_id, description')
        .single()
      
      if (retryError) throw retryError
      return { success: true, data }
    }
    throw error
  }
}

// ========== TOKEN MANAGEMENT ==========

// Centralized token operations
async function getTokensForUser(userId) {
  const { data, error } = await supabase
    .from('user_google_tokens')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error) return null
  return data
}

async function saveTokensForUser(userId, tokens) {
  const nowSec = Math.floor(Date.now() / 1000)
  let expires_at = null

  try {
    if (tokens?.expires_in != null) {
      const v = Number(tokens.expires_in)
      if (Number.isFinite(v)) {
        expires_at = nowSec + Math.floor(v)
      }
    } else if (tokens?.expires_at != null) {
      const v2 = Number(tokens.expires_at)
      if (Number.isFinite(v2)) {
        expires_at = v2 > 1e12 ? Math.floor(v2 / 1000) : Math.floor(v2)
      }
    }
  } catch (e) {
    logError('Failed to normalize expires value', e)
    expires_at = null
  }

  const payload = {
    user_id: userId,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at,
    scope: tokens.scope
  }

  const { data, error } = await supabase
    .from('user_google_tokens')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) throw error
  return data
}

// Optimized token refresh with error handling
async function refreshAccessTokenIfNeeded(userId) {
  const tokens = await getTokensForUser(userId)
  if (!tokens) return null

  const nowSec = Math.floor(Date.now() / 1000)
  
  // Return current token if valid for more than 60 seconds
  if (tokens.expires_at && Number(tokens.expires_at) - nowSec > 60 && tokens.access_token) {
    return tokens.access_token
  }

  // Refresh token if needed
  if (!tokens.refresh_token) {
    logError('No refresh token available for user', userId)
    return null
  }

  try {
    const refreshed = await refreshAccessToken(tokens.refresh_token)
    
    // Update stored tokens
    const newExpiresAt = nowSec + Math.floor(Number(refreshed.expires_in) || 3600)
    await supabase
      .from('user_google_tokens')
      .update({
        access_token: refreshed.access_token,
        refresh_token: refreshed.refresh_token || tokens.refresh_token,
        expires_at: newExpiresAt
      })
      .eq('user_id', userId)

    return refreshed.access_token
  } catch (error) {
    logError('Failed to refresh access token', error)
    return null
  }
}

async function refreshAccessToken(refreshToken) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  
  const body = {
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token'
  }

  const res = await fetch(process.env.GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: qs.stringify(body)
  })

  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Token refresh failed: ${res.status} ${txt}`)
  }

  return res.json()
}

// ========== GOOGLE CALENDAR API HELPERS ==========

// Centralized Google Calendar operations
async function createGoogleAuthClient(accessToken) {
  const authClient = new google.auth.OAuth2()
  authClient.setCredentials({ access_token: accessToken })
  return authClient
}

async function fetchGoogleCalendarEvents(accessToken) {
  try {
    const authClient = await createGoogleAuthClient(accessToken)
    const calendar = google.calendar({ version: 'v3', auth: authClient })
    
    const response = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      timeMin: new Date().toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    })

    return (response.data.items || []).map(event => ({
      google_event_id: event.id,
      title: event.summary || 'No title',
      start: event.start?.dateTime || event.start?.date || null,
      end: event.end?.dateTime || event.end?.date || null,
      description: event.description || null
    }))
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('access token expired')
    }
    throw error
  }
}

async function createGoogleEvent(accessToken, eventData) {
  const authClient = await createGoogleAuthClient(accessToken)
  const calendar = google.calendar({ version: 'v3', auth: authClient })
  
  // Construct proper datetime strings from task_date and time components
  const startDateTime = eventData.start && eventData.task_date 
    ? `${eventData.task_date}T${eventData.start}` 
    : null
  const endDateTime = eventData.end && eventData.task_date 
    ? `${eventData.task_date}T${eventData.end}` 
    : null
  
  // Validate dates before creating ISO strings
  let startValue, endValue
  
  if (startDateTime) {
    const startDate = new Date(startDateTime)
    startValue = !isNaN(startDate.getTime()) 
      ? { dateTime: startDate.toISOString() }
      : { date: eventData.task_date }
  } else {
    startValue = { date: eventData.task_date }
  }
  
  if (endDateTime) {
    const endDate = new Date(endDateTime)
    endValue = !isNaN(endDate.getTime()) 
      ? { dateTime: endDate.toISOString() }
      : { date: eventData.task_date }
  } else {
    endValue = { date: eventData.task_date }
  }
  
  const googleEvent = {
    summary: eventData.title || eventData.task,
    description: eventData.description || null,
    start: startValue,
    end: endValue
  }

  const response = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
    requestBody: googleEvent
  })

  return response.data
}

async function updateGoogleEvent(accessToken, googleEventId, eventData) {
  const authClient = await createGoogleAuthClient(accessToken)
  const calendar = google.calendar({ version: 'v3', auth: authClient })
  
  const updates = {}
  if (eventData.title) updates.summary = eventData.title
  if (eventData.description !== undefined) updates.description = eventData.description
  if (eventData.start) {
    const startStr = String(eventData.start)
    if (startStr.includes('T')) {
      const startDate = new Date(startStr)
      if (!isNaN(startDate.getTime())) {
        updates.start = { dateTime: startDate.toISOString() }
      }
    } else {
      updates.start = { date: startStr }
    }
  }
  if (eventData.end) {
    const endStr = String(eventData.end)
    if (endStr.includes('T')) {
      const endDate = new Date(endStr)
      if (!isNaN(endDate.getTime())) {
        updates.end = { dateTime: endDate.toISOString() }
      }
    } else {
      updates.end = { date: endStr }
    }
  }

  const response = await calendar.events.patch({
    calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
    eventId: googleEventId,
    requestBody: updates
  })

  return response.data
}

async function deleteGoogleEvent(accessToken, googleEventId) {
  const authClient = await createGoogleAuthClient(accessToken)
  const calendar = google.calendar({ version: 'v3', auth: authClient })
  
  try {
    await calendar.events.delete({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      eventId: googleEventId
    })
    return { success: true }
  } catch (error) {
    // Treat 404 as success (already deleted)
    if (error.response?.status === 404) {
      logInfo('Google event already deleted', googleEventId)
      return { success: true, wasDeleted: false }
    }
    throw error
  }
}

// ========== PUBLIC API FUNCTIONS ==========

export function buildOauthUrl(userId) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = `${process.env.BACKEND_URL || ''}/google/callback`
  const scope = [
    'openid',
    'profile', 
    'email',
    'https://www.googleapis.com/auth/calendar.events'
  ].join(' ')
  
  const params = {
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope,
    access_type: 'offline',
    prompt: 'consent',
    state: String(userId)
  }
  
  return `${process.env.GOOGLE_AUTH_URL}?${qs.stringify(params)}`
}

export async function exchangeCodeForTokens(code) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = `${process.env.BACKEND_URL || ''}/google/callback`

  const body = {
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code'
  }

  const res = await fetch(process.env.GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: qs.stringify(body)
  })

  if (!res.ok) throw new Error('Token exchange failed')
  return res.json()
}

// Optimized main sync function
export async function saveOrUpdateEventsForUser(userId, events) {
  if (!userId) throw new Error('Missing userId')
  if (!Array.isArray(events)) return []

  logInfo('Starting event sync', { userId, eventCount: events.length })
  
  const userIdForCalendar = String(userId)
  const results = []

  // Process events in batches for better performance
  const batchSize = 10
  for (let i = 0; i < events.length; i += batchSize) {
    const batch = events.slice(i, i + batchSize)
    const batchResults = await Promise.allSettled(
      batch.map(async (event) => {
        const { date: taskDate, time: startTime } = extractDateAndTime(event.start)
        const { time: endTime } = extractDateAndTime(event.end)
        
        const eventData = {
          google_event_id: event.google_event_id,
          task_date: taskDate,
          start: startTime,
          end: endTime,
          task: event.title,
          user_id: userIdForCalendar,
          description: event.description || null,
          color: event.color || null
        }

        return upsertCalendarEvent(eventData)
      })
    )

    results.push(...batchResults.map(result => 
      result.status === 'fulfilled' ? result.value.data : null
    ).filter(Boolean))
  }

  // Clean up stale events (events that exist locally but not in the new batch)
  try {
    const incomingGoogleIds = events.map(e => e.google_event_id).filter(Boolean)
    if (incomingGoogleIds.length > 0) {
      const { data: existingEvents } = await supabase
        .from('calendar')
        .select('calendar_id, google_event_id')
        .eq('user_id', userIdForCalendar)
        .not('google_event_id', 'is', null)

      const toDelete = (existingEvents || [])
        .filter(e => e.google_event_id && !incomingGoogleIds.includes(e.google_event_id))
        .map(e => e.calendar_id)

      if (toDelete.length > 0) {
        await supabase.from('calendar').delete().in('calendar_id', toDelete)
        logInfo('Cleaned up stale events', { count: toDelete.length })
      }
    }
  } catch (error) {
    logError('Failed to clean up stale events', error)
  }

  // Return formatted events
  const formattedEvents = results.map(event => ({
    id: event.calendar_id,
    title: event.task,
    start: event.start ? `${event.task_date}T${event.start}` : event.task_date,
    end: event.end ? `${event.task_date}T${event.end}` : event.task_date,
    color: event.color,
    description: event.description
  }))

  logInfo('Event sync completed', { userId, processedCount: formattedEvents.length })
  return formattedEvents
}

export async function getEventsForUser(userId) {
  if (!userId) throw new Error('Missing userId')
  
  const userIdForCalendar = String(userId)
  const result = await getCalendarEvents(userIdForCalendar)
  
  if (!result.success) return []
  
  return result.data.map(event => ({
    id: event.calendar_id,
    title: event.task,
    start: event.start ? `${event.task_date}T${event.start}` : event.task_date,
    end: event.end ? `${event.task_date}T${event.end}` : event.task_date,
    color: result.minimal ? null : event.color,
    description: result.minimal ? null : event.description
  }))
}

export async function saveOrCreateEventForUser(userId, payload) {
  if (!userId) throw new Error('Missing userId')
  
  const userIdForCalendar = String(userId)
  const { date: taskDate, time: startTime } = extractDateAndTime(payload.start)
  const { time: endTime } = extractDateAndTime(payload.end)
  
  const eventData = {
    task_date: taskDate,
    start: startTime,
    end: endTime,
    task: payload.title || payload.summary || 'No title',
    user_id: userIdForCalendar,
    description: payload.description || null,
    google_event_id: null,
    color: payload.color || null
  }

  const result = await upsertCalendarEvent(eventData)
  
  // Optionally sync to Google Calendar if user has tokens
  try {
    const accessToken = await refreshAccessTokenIfNeeded(userIdForCalendar)
    if (accessToken) {
      const googleEvent = await createGoogleEvent(accessToken, eventData)
      // Update local event with Google event ID
      await updateCalendarEvent(result.data.calendar_id, { 
        google_event_id: googleEvent.id 
      })
    }
  } catch (error) {
    logError('Failed to sync new event to Google', error)
  }

  return {
    id: result.data.calendar_id,
    title: result.data.task,
    start: result.data.start ? `${result.data.task_date}T${result.data.start}` : result.data.task_date,
    end: result.data.end ? `${result.data.task_date}T${result.data.end}` : result.data.task_date,
    color: result.data.color,
    description: result.data.description
  }
}

export async function updateEventForUser(calendarIdOrGoogleId, payload) {
  let calendarId = String(calendarIdOrGoogleId || '')
  
  // Resolve Google event ID to calendar ID if needed
  if (!/^\d+$/.test(calendarId)) {
    const { data: resolved } = await supabase
      .from('calendar')
      .select('calendar_id')
      .eq('google_event_id', calendarId)
      .single()
    
    if (!resolved) {
      throw new Error('Calendar event not found')
    }
    calendarId = String(resolved.calendar_id)
  }

  // Get existing event
  const { data: existing } = await supabase
    .from('calendar')
    .select('*')
    .eq('calendar_id', calendarId)
    .single()
  
  if (!existing) {
    throw new Error('Calendar event not found')
  }

  // Prepare updates
  const updates = {}
  if (payload.title) updates.task = payload.title
  if (payload.description !== undefined) updates.description = payload.description
  if (payload.color !== undefined) updates.color = payload.color
  
  if (payload.start) {
    const { date, time } = extractDateAndTime(payload.start)
    updates.task_date = date
    updates.start = time
  }
  
  if (payload.end) {
    const { time } = extractDateAndTime(payload.end)
    updates.end = time
  }

  // Update local event
  const result = await updateCalendarEvent(calendarId, updates)
  
  // Sync to Google if event has google_event_id
  if (existing.google_event_id) {
    try {
      const accessToken = await refreshAccessTokenIfNeeded(existing.user_id)
      if (accessToken) {
        await updateGoogleEvent(accessToken, existing.google_event_id, payload)
      }
    } catch (error) {
      logError('Failed to sync event update to Google', error)
    }
  }

  return result.data
}

export async function deleteEventForUser(calendarId) {
  // Get existing event details
  const { data: existing } = await supabase
    .from('calendar')
    .select('*')
    .eq('calendar_id', calendarId)
    .single()
  
  if (!existing) {
    return true // Already deleted
  }

  // Delete from Google Calendar if needed
  if (existing.google_event_id) {
    try {
      const accessToken = await refreshAccessTokenIfNeeded(existing.user_id)
      if (accessToken) {
        await deleteGoogleEvent(accessToken, existing.google_event_id)
      }
    } catch (error) {
      logError('Failed to delete Google event', error)
    }
  }

  // Delete local event
  await deleteCalendarEvent(calendarId)
  return true
}

// Re-export token functions for backward compatibility
export { 
  getTokensForUser,
  saveTokensForUser, 
  refreshAccessTokenIfNeeded as ensureValidAccessToken,
  refreshAccessToken,
  fetchGoogleCalendarEvents
}

// Update access token (simplified wrapper)
export async function updateAccessTokenForUser(userId, accessToken, expiresIn) {
  const nowSec = Math.floor(Date.now() / 1000)
  const expires_at = Number.isFinite(Number(expiresIn)) 
    ? nowSec + Math.floor(Number(expiresIn)) 
    : null

  const { error } = await supabase
    .from('user_google_tokens')
    .update({ access_token: accessToken, expires_at })
    .eq('user_id', userId)

  if (error) throw error
  return { success: true }
}