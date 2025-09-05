import { supabase } from '../database/supabase.js'
import qs from 'querystring'

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const CALENDAR_EVENTS_URL = 'https://www.googleapis.com/calendar/v3/calendars/primary/events'

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
  return `${GOOGLE_AUTH_URL}?${qs.stringify(params)}`
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

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: qs.stringify(body)
  })
  if (!res.ok) throw new Error('token exchange failed')
  return res.json()
}

export async function saveTokensForUser(userId, tokens) {
  // tokens contains access_token, refresh_token, expires_in, scope, token_type, id_token
  // We'll upsert into a user_google_tokens table in Supabase. Create table if not present.
  const payload = {
    user_id: userId,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: tokens.expires_in ? Math.floor(Date.now()/1000) + tokens.expires_in : null,
    scope: tokens.scope
  }
  const { data, error } = await supabase.from('user_google_tokens').upsert(payload, { onConflict: 'user_id' }).select().single()
  if (error) throw error
  return data
}

export async function getTokensForUser(userId) {
  const { data, error } = await supabase.from('user_google_tokens').select('*').eq('user_id', userId).single()
  if (error) return null
  return data
}

export async function refreshAccessToken(refreshToken) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const body = {
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token'
  }

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: qs.stringify(body)
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`refresh token failed: ${res.status} ${txt}`)
  }
  return res.json()
}

export async function updateAccessTokenForUser(userId, accessToken, expiresIn) {
  const expires_at = expiresIn ? Math.floor(Date.now() / 1000) + expiresIn : null
  const { data, error } = await supabase.from('user_google_tokens').upsert({ user_id: userId, access_token: accessToken, expires_at }, { onConflict: 'user_id' }).select().single()
  if (error) throw error
  return data
}

export async function fetchGoogleCalendarEvents(accessToken) {
  const url = `${CALENDAR_EVENTS_URL}?singleEvents=true&orderBy=startTime&timeMin=${new Date().toISOString()}`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } })
  if (res.status === 401) {
    throw new Error('access token expired')
  }
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`failed to fetch events: ${res.status} ${txt}`)
  }
  const json = await res.json()
  // Map Google events to server event shape
  const items = (json.items || []).map(ev => ({
    google_event_id: ev.id,
    title: ev.summary || 'No title',
  start: ev.start?.dateTime || ev.start?.date || null,
  end: ev.end?.dateTime || ev.end?.date || null,
    description: ev.description || null
  }))
  return items
}

export async function saveOrUpdateEventsForUser(userId, events) {
  // events: array with google_event_id, title, start, end, description
  // Map to calendar table fields: task_date, task, customer_id, note, google_event_id
  // Resolve numeric customer_id when a Supabase user_id (UUID) is provided
  if (!userId) throw new Error('missing userId')
  let customerId
  if (/^\d+$/.test(String(userId))) {
    customerId = Number(userId)
  } else {
  const { data: cust, error: custErr } = await supabase.from('customer').select('id').eq('user_id', userId).single()
    if (custErr) throw custErr
    if (!cust) throw new Error('no customer profile found for user')
  customerId = cust.id
  }

  const results = []
  for (const ev of events) {
    const taskDate = ev.start ? ev.start.split('T')[0] : null
    const payload = {
      google_event_id: ev.google_event_id,
      task_date: taskDate,
      task: ev.title,
      customer_id: customerId,
      description: ev.description || null,
      color: ev.color || null
    }
    // Upsert by google_event_id. If color column missing, retry without color.
    try {
      const { data, error } = await supabase.from('calendar').upsert(payload, { onConflict: 'google_event_id' })
      if (error) {
        // if it's a column-not-found, retry without color
        if (String(error.message).toLowerCase().includes('column') && String(error.message).toLowerCase().includes('color')) {
          delete payload.color
          const { data: d2, error: e2 } = await supabase.from('calendar').upsert(payload, { onConflict: 'google_event_id' })
          if (e2) console.error('upsert retry failed', e2)
          results.push(d2)
        } else {
          console.error('upsert error', error)
          results.push(null)
        }
      } else results.push(data)
    } catch (err) {
      console.error('upsert threw', err)
      // push null to keep array length
      results.push(null)
    }
  }
  // Delete any local rows that were previously created from Google but are no longer present in the fetched events.
  try {
    const incomingIds = events.map(e => e.google_event_id).filter(Boolean)
    if (incomingIds.length > 0) {
      const { error: delErr } = await supabase
        .from('calendar')
        .delete()
        .eq('customer_id', customerId)
        .not('google_event_id', 'in', `(${incomingIds.map(id => `'${id.replace(/'/g, "''")}'`).join(',')})`)
        .is('google_event_id', null)
      if (delErr) console.error('delete stale google events failed', delErr)
    } else {
      // No incoming google events: remove any local rows that have a google_event_id (they were deleted in Google)
      const { error: e3 } = await supabase.from('calendar').delete().eq('customer_id', customerId).not('google_event_id', 'is', null)
      if (e3) console.error('delete all stale google events failed', e3)
    }
  } catch (err) {
    console.error('cleanup stale google events failed', err)
  }
  // Return events for the user
  // Attempt to select including color; if column doesn't exist, fall back to select without color
    try {
    const { data: all, error } = await supabase.from('calendar').select('calendar_id, task, task_date, color, description').eq('customer_id', customerId)
    if (error) throw error
    return (all || []).map(r => ({ id: r.calendar_id, title: r.task, start: r.task_date, end: r.task_date, color: r.color, description: r.description }))
  } catch (err) {
    // if color/description column missing, retry without them
    if (String(err.message).toLowerCase().includes('column') && (String(err.message).toLowerCase().includes('color') || String(err.message).toLowerCase().includes('description'))) {
      const { data: all2, error: e2 } = await supabase.from('calendar').select('calendar_id, task, task_date').eq('customer_id', customerId)
      if (e2) throw e2
      return (all2 || []).map(r => ({ id: r.calendar_id, title: r.task, start: r.task_date, end: r.task_date, color: null, description: null }))
    }
    throw err
  }
}

export async function getEventsForUser(userId) {
  if (!userId) throw new Error('missing userId')
  let customerId
  if (/^\d+$/.test(String(userId))) {
    customerId = Number(userId)
  } else {
  const { data: cust, error: custErr } = await supabase.from('customer').select('id').eq('user_id', userId).single()
    if (custErr) throw custErr
    if (!cust) return []
  customerId = cust.id
  }
  try {
    const { data, error } = await supabase.from('calendar').select('calendar_id, task, task_date, color').eq('customer_id', customerId)
    if (error) throw error
    return (data || []).map(r => ({ id: r.calendar_id, title: r.task, start: r.task_date, end: r.task_date, color: r.color }))
  } catch (err) {
    if (String(err.message).toLowerCase().includes('column') && String(err.message).toLowerCase().includes('color')) {
      const { data, error } = await supabase.from('calendar').select('calendar_id, task, task_date').eq('customer_id', customerId)
      if (error) throw error
      return (data || []).map(r => ({ id: r.calendar_id, title: r.task, start: r.task_date, end: r.task_date, color: null }))
    }
    throw err
  }
}

export async function saveOrCreateEventForUser(userId, payload) {
  // payload: { title, start, end, description }
  if (!userId) throw new Error('missing userId')
  // resolve customer id
  let customerId
  if (/^\d+$/.test(String(userId))) {
    customerId = Number(userId)
  } else {
    const { data: cust, error: custErr } = await supabase.from('customer').select('id').eq('user_id', userId).single()
    if (custErr) throw custErr
    if (!cust) throw new Error('no customer profile found for user')
    customerId = cust.id
  }

  // Insert into local calendar table
  // Store task_date as ISO date or full ISO datetime if time provided so we can return precise start times
  const taskDate = payload.start ? (String(payload.start).includes('T') ? new Date(String(payload.start)).toISOString() : String(payload.start)) : null
  const row = {
    task_date: taskDate,
    task: payload.title || payload.summary || 'No title',
    customer_id: customerId,
    description: payload.description || null,
    google_event_id: null,
    color: payload.color || null
  }
  // Insert, but if color column missing, retry without color
  let inserted
  try {
    // Select only known columns to avoid schema-cache/wildcard issues
    const r = await supabase.from('calendar').insert([row]).select('calendar_id, task, task_date, customer_id, google_event_id, color, description').single()
    if (r.error) throw r.error
    inserted = r.data
  } catch (err) {
    if (String(err.message).toLowerCase().includes('column') && String(err.message).toLowerCase().includes('color')) {
      delete row.color
      const r2 = await supabase.from('calendar').insert([row]).select('calendar_id, task, task_date, customer_id, google_event_id, description').single()
      if (r2.error) throw r2.error
      inserted = r2.data
    } else throw err
  }

  // If user has Google connected, create event on Google Calendar and update local row with google_event_id
  try {
    const tokens = await getTokensForUser(String(userId))
    if (tokens && tokens.refresh_token) {
      let accessToken = tokens.access_token
      // create event body
      // Build a robust event body for Google Calendar API
      let eventBody = { summary: payload.title, description: payload.description }
      try {
        if (payload.start && payload.start.includes('T')) {
          // dateTime event - ensure ISO with timezone and a valid end
          const startDt = new Date(String(payload.start))
          const endDt = payload.end && payload.end.includes('T') ? new Date(String(payload.end)) : new Date(startDt.getTime() + 60 * 60 * 1000)
          eventBody.start = { dateTime: startDt.toISOString() }
          eventBody.end = { dateTime: endDt.toISOString() }
        } else if (payload.start) {
          // all-day event (date). Google expects end to be exclusive (next day)
          const s = new Date(String(payload.start))
          const e = new Date(s.getTime() + 24 * 60 * 60 * 1000)
          const fmt = (d) => d.toISOString().slice(0, 10)
          eventBody.start = { date: fmt(s) }
          eventBody.end = { date: fmt(e) }
        }
      } catch (err) {
        console.error('failed to normalize event times', err, payload)
      }

      // attempt to create, refresh token if 401. Log request/response bodies for debugging.
      const tryCreate = async (token) => {
        console.log('[google] creating event, body=', JSON.stringify(eventBody))
        const r = await fetch(CALENDAR_EVENTS_URL, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(eventBody)
        })
        const text = await r.text().catch(() => '')
        let parsed = null
        try { parsed = JSON.parse(text) } catch (e) {}
        if (!r.ok) console.error('[google] create event response', r.status, parsed || text)
        // return both response and parsed body for caller
        return { res: r, bodyText: text, bodyJson: parsed }
      }
      let attempt = await tryCreate(accessToken)
      if (attempt.res.status === 401) {
        try {
          const refreshed = await refreshAccessToken(tokens.refresh_token)
          accessToken = refreshed.access_token
          await updateAccessTokenForUser(String(userId), accessToken, refreshed.expires_in)
          attempt = await tryCreate(accessToken)
        } catch (err) {
          console.error('failed to refresh access token', err)
        }
      }
      if (!attempt.res.ok) {
        // Already logged inside tryCreate. Surface minimal info.
        console.error('google create event resulted in non-ok status', attempt.res.status)
      } else {
        let json = attempt.bodyJson
        if (!json) {
          try { json = JSON.parse(attempt.bodyText) } catch (e) { json = null }
        }
        if (json && json.id) {
          // update local row with google_event_id (explicit select)
          const { data: upd, error: updErr } = await supabase.from('calendar').update({ google_event_id: json.id }).eq('calendar_id', inserted.calendar_id).select('calendar_id, task, task_date, customer_id, google_event_id, color, description').single()
          if (updErr) console.error('failed update google_event_id', updErr)
          inserted.google_event_id = json.id
        } else {
          console.error('google returned no id for created event', attempt.res.status, attempt.bodyJson || attempt.bodyText)
        }
      }
    }
  } catch (err) {
    console.error('create event google error', err)
  }

  // Normalize start/end for the client response. If the payload included time (dateTime), return ISO strings
  const normalizedStart = payload.start
    ? (String(payload.start).includes('T') ? new Date(String(payload.start)).toISOString() : String(payload.start))
    : null
  const normalizedEnd = payload.end
    ? (String(payload.end).includes('T') ? new Date(String(payload.end)).toISOString() : String(payload.end))
    : (payload.start && String(payload.start).includes('T') ? new Date(new Date(String(payload.start)).getTime() + 60 * 60 * 1000).toISOString() : (payload.start ? String(payload.start) : null))

  return {
    id: inserted.calendar_id,
    title: inserted.task,
    start: normalizedStart || inserted.task_date,
    end: normalizedEnd || inserted.task_date,
  google_event_id: inserted.google_event_id || null,
  color: inserted.color || null,
  description: inserted.description || null
  }
}

export async function updateEventForUser(calendarId, payload) {
  // payload: { title?, start?, end?, description?, color? }
  // update local row and, if it has google_event_id, patch Google event
  // Avoid wildcard select to prevent schema cache mismatch; list known columns
  const { data: existing, error: selErr } = await supabase.from('calendar').select('calendar_id, task, task_date, customer_id, google_event_id, color, description').eq('calendar_id', calendarId).single()
  if (selErr) throw selErr

  const updates = {}
  if (payload.title) updates.task = payload.title
  if (payload.description !== undefined) updates.description = payload.description
  if (payload.color !== undefined) updates.color = payload.color
  if (payload.start) {
    updates.task_date = String(payload.start).includes('T') ? new Date(String(payload.start)).toISOString() : String(payload.start)
  }

  const { data: upd, error: updErr } = await supabase.from('calendar').update(updates).eq('calendar_id', calendarId).select('calendar_id, task, task_date, customer_id, google_event_id, color, description').single()
  if (updErr) {
    // If update failed because color column missing, retry without color
    if (String(updErr.message).toLowerCase().includes('column') && String(updErr.message).toLowerCase().includes('color')) {
      delete updates.color
      const { data: upd2, error: updErr2 } = await supabase.from('calendar').update(updates).eq('calendar_id', calendarId).select('calendar_id, task, task_date, customer_id, google_event_id, description').single()
      if (updErr2) throw updErr2
      return upd2
    }
    throw updErr
  }

  // If it has google_event_id and user tokens exist, attempt to patch Google event
  if (existing && existing.google_event_id) {
    try {
      // find the user_id for tokens
      const { data: cust, error: cErr } = await supabase.from('customer').select('user_id').eq('id', existing.customer_id).single()
      if (cErr || !cust) throw cErr || new Error('no customer')
      const tokens = await getTokensForUser(String(cust.user_id))
      if (!tokens) return upd
      let accessToken = tokens.access_token
      const buildBody = () => {
        const body = {}
        if (payload.title) body.summary = payload.title
        if (payload.description !== undefined) body.description = payload.description
        if (payload.start && payload.start.includes('T')) body.start = { dateTime: new Date(String(payload.start)).toISOString() }
        if (payload.end && payload.end.includes('T')) body.end = { dateTime: new Date(String(payload.end)).toISOString() }
        return body
      }
      const tryPatch = async (token) => {
        const url = `${CALENDAR_EVENTS_URL}/${existing.google_event_id}`
        const r = await fetch(url, { method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(buildBody()) })
        const text = await r.text().catch(() => '')
        let parsed = null
        try { parsed = JSON.parse(text) } catch (e) {}
        if (!r.ok) console.error('[google] patch event response', r.status, parsed || text)
        return { res: r, bodyJson: parsed, bodyText: text }
      }
      let attempt = await tryPatch(accessToken)
      if (attempt.res.status === 401) {
        const refreshed = await refreshAccessToken(tokens.refresh_token)
        accessToken = refreshed.access_token
        await updateAccessTokenForUser(String(cust.user_id), accessToken, refreshed.expires_in)
        attempt = await tryPatch(accessToken)
      }
      if (!attempt.res.ok) console.error('google patch event failed', attempt.res.status)
    } catch (err) {
      console.error('failed to patch google event', err)
    }
  }

  return upd
}

export async function deleteEventForUser(calendarId) {
  // delete local row and delete Google event if present
  // Use maybeSingle so missing rows don't throw — delete should be idempotent
  // Use explicit column list to avoid wildcard-related schema cache lookups
  const { data: existing, error: selErr } = await supabase.from('calendar').select('calendar_id, task, task_date, customer_id, google_event_id, color, description').eq('calendar_id', calendarId).maybeSingle()
  if (selErr) throw selErr
  if (!existing) {
    // Nothing to delete locally — treat as success (idempotent)
    return true
  }

  // If google_event_id exists, try deleting from Google
  if (existing.google_event_id) {
    try {
      const { data: cust, error: cErr } = await supabase.from('customer').select('user_id').eq('id', existing.customer_id).single()
      if (cErr || !cust) throw cErr || new Error('no customer')
      const tokens = await getTokensForUser(String(cust.user_id))
      if (tokens) {
        let accessToken = tokens.access_token
        const tryDel = async (token) => {
          const url = `${CALENDAR_EVENTS_URL}/${existing.google_event_id}`
          const r = await fetch(url, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
          if (!r.ok) {
            const text = await r.text().catch(() => '')
            console.error('[google] delete event response', r.status, text)
          }
          return r
        }
        let r = await tryDel(accessToken)
        if (r.status === 401) {
          const refreshed = await refreshAccessToken(tokens.refresh_token)
          accessToken = refreshed.access_token
          await updateAccessTokenForUser(String(cust.user_id), accessToken, refreshed.expires_in)
          r = await tryDel(accessToken)
        }
      }
    } catch (err) {
      console.error('failed to delete google event', err)
    }
  }

  // Delete local row
  const { error: delErr } = await supabase.from('calendar').delete().eq('calendar_id', calendarId)
  if (delErr) throw delErr
  return true
}
