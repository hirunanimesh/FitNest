import { supabase } from '../database/supabase.js'
import qs from 'querystring'
import { google } from 'googleapis'

// Helper: given an ISO-like string, return { date: 'YYYY-MM-DD', time: 'HH:MM:SS' }
function extractDateAndTime(s) {
  if (!s) return { date: null, time: null }
  const str = String(s)
  if (str.includes('T')) {
    const [d, t] = str.split('T')
    // strip timezone offsets (Z, +hh:mm, -hh:mm)
    const timeOnly = (t || '').split(/[Z+-]/)[0]
    const parts = timeOnly.split(':')
    const hh = String(parts[0] || '0').padStart(2, '0')
    const mm = String(parts[1] || '0').padStart(2, '0')
    const ss = String(parts[2] || '00').padStart(2, '0')
    return { date: d, time: `${hh}:${mm}:${ss}` }
  }
  // date-only
  return { date: str, time: null }
}

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
  if (!res.ok) throw new Error('token exchange failed')
  return res.json()
}

export async function saveTokensForUser(userId, tokens) {
  // tokens contains access_token, refresh_token, expires_in, scope, token_type, id_token
  // We'll upsert into a user_google_tokens table in Supabase. Create table if not present.
  // Normalize expires_at to a UNIX timestamp in seconds. Google returns expires_in (seconds)
  // but callers sometimes pass absolute timestamps or milliseconds; be defensive.
  const nowSec = Math.floor(Date.now() / 1000)
  let expires_at = null
  try {
    // Prefer expires_in (relative seconds) when present. Google returns expires_in as
    // a relative number of seconds until the access token expires.
    if (tokens && tokens.expires_in != null) {
      const v = Number(tokens.expires_in)
      if (Number.isFinite(v)) {
        expires_at = nowSec + Math.floor(v)
      }
    } else if (tokens && tokens.expires_at != null) {
      // If an absolute expires_at is provided, accept it. Convert milliseconds -> seconds
      // when necessary (simple defensive check for very large values).
      const v2 = Number(tokens.expires_at)
      if (Number.isFinite(v2)) {
        expires_at = v2 > 1e12 ? Math.floor(v2 / 1000) : Math.floor(v2)
      }
    }
  } catch (e) {
    console.warn('[oauth] failed to normalize expires value', e)
    expires_at = null
  }
  const payload = {
    user_id: userId,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: expires_at,
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

// Refresh tokens for a user using the stored refresh_token and persist the
// updated access_token (and refresh_token if returned) with a correct expires_at.
export async function refreshTokensForUser(userId) {
  if (!userId) throw new Error('missing userId')
  const tokens = await getTokensForUser(String(userId))
  if (!tokens || !tokens.refresh_token) {
    const e = new Error('no_refresh_token')
    e.code = 'NO_REFRESH_TOKEN'
    throw e
  }

  // Call Google's token endpoint to refresh
  const refreshed = await refreshAccessToken(tokens.refresh_token)

  // Build values to persist. Google may not return refresh_token on refresh.
  const accessToken = refreshed.access_token
  const expiresIn = refreshed.expires_in
  const refreshToken = refreshed.refresh_token || tokens.refresh_token

  // Compute expires_at as now + expires_in seconds (defensive)
  const nowSec = Math.floor(Date.now() / 1000)
  const expires_at = Number.isFinite(Number(expiresIn)) ? nowSec + Math.floor(Number(expiresIn)) : null

  // Persist both access_token and refresh_token (if available) and expires_at
  const payload = {
    user_id: String(userId),
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_at
  }

  const { data, error } = await supabase.from('user_google_tokens').upsert(payload, { onConflict: 'user_id' }).select().single()
  if (error) throw error
  return data
}

// Ensure a valid access token is available for the given user. Returns the
// access token string or null if none available. Will attempt a refresh when
// the token is missing or expires within 60 seconds.
export async function ensureValidAccessToken(userId) {
  if (!userId) return null
  const tokens = await getTokensForUser(String(userId))
  if (!tokens) return null

  const nowSec = Math.floor(Date.now() / 1000)
  // If expires_at present and comfortably in the future, return current token
  if (tokens.expires_at && Number(tokens.expires_at) - nowSec > 60 && tokens.access_token) {
    return tokens.access_token
  }

  // Otherwise attempt refresh
  try {
    const updated = await refreshTokensForUser(String(userId))
    return updated.access_token || null
  } catch (err) {
    console.error('[oauth] failed to refresh tokens for user', { userId, error: err })
    return null
  }
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

  const res = await fetch(process.env.GOOGLE_TOKEN_URL, {
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
  // expiresIn may be seconds (relative) or an absolute timestamp in seconds or ms. Normalize to unix seconds.
  const nowSec = Math.floor(Date.now() / 1000)
  let expires_at = null
  try {
    // Treat expiresIn as relative seconds when provided (Google's typical response).
    if (expiresIn != null) {
      const v = Number(expiresIn)
      if (Number.isFinite(v)) {
        expires_at = nowSec + Math.floor(v)
      }
    }
  } catch (e) {
    console.warn('[oauth] failed to normalize expiresIn', e)
    expires_at = null
  }
  const { data, error } = await supabase.from('user_google_tokens').upsert({ user_id: userId, access_token: accessToken, expires_at }, { onConflict: 'user_id' }).select().single()
  if (error) throw error
  return data
}

export async function fetchGoogleCalendarEvents(accessToken) {
  const url = `${process.env.CALENDAR_EVENTS_URL}?singleEvents=true&orderBy=startTime&timeMin=${new Date().toISOString()}`
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
  console.log('[calendar.service] saveOrUpdateEventsForUser called', { userId, incomingCount: Array.isArray(events) ? events.length : 0 })
  let customerId
  if (/^\d+$/.test(String(userId))) {
    customerId = Number(userId)
  } else {
    const { data: cust, error: custErr } = await supabase.from('customer').select('id').eq('user_id', userId).single()
    if (custErr) {
      console.error('[calendar.service] failed to resolve customer for user', { userId, error: custErr })
      throw custErr
    }
    if (!cust) {
      console.error('[calendar.service] no customer profile found for user', { userId })
      throw new Error('no customer profile found for user')
    }
    customerId = cust.id
  }

  console.log('[calendar.service] resolved customerId for user', { userId, customerId })

  const results = []
  let upsertedGoogleIds = []
  let upsertErrors = 0

  // Build rows for bulk upsert to avoid per-row race conditions and to
  // receive all inserted/updated rows from Supabase in one call.
  const rows = (events || []).map(ev => {
    const { date: taskDate, time: startTime } = extractDateAndTime(ev.start)
    const { time: endTime } = extractDateAndTime(ev.end)
    return {
      google_event_id: ev.google_event_id,
      task_date: taskDate,
      start: startTime,
      end: endTime,
      task: ev.title,
      customer_id: customerId,
      description: ev.description || null,
      color: ev.color || null
    }
  })

  if (rows.length > 0) {
    try {
      console.log('[calendar.service] attempting bulk upsert rows', { count: rows.length })
      const { data, error } = await supabase.from('calendar').upsert(rows, { onConflict: 'google_event_id' }).select('calendar_id, google_event_id')
      if (error) {
        // If error indicates unknown column (color), retry without color column
        if (String(error.message).toLowerCase().includes('column') && String(error.message).toLowerCase().includes('color')) {
          console.warn('[calendar.service] bulk upsert failed due to color column; retrying without color for all rows')
          const rowsNoColor = rows.map(r => {
            const copy = { ...r }
            delete copy.color
            return copy
          })
          const { data: d2, error: e2 } = await supabase.from('calendar').upsert(rowsNoColor, { onConflict: 'google_event_id' }).select('calendar_id, google_event_id')
          if (e2) {
            console.error('[calendar.service] bulk upsert retry failed', e2)
            upsertErrors = rows.length
          } else {
            upsertedGoogleIds = Array.isArray(d2) ? d2.map(r => r.google_event_id).filter(Boolean) : []
            console.log('[calendar.service] bulk upsert retry succeeded', { upserted: upsertedGoogleIds.length })
          }
        } else {
          console.error('[calendar.service] bulk upsert error', error)
          upsertErrors = rows.length
        }
      } else {
        upsertedGoogleIds = Array.isArray(data) ? data.map(r => r.google_event_id).filter(Boolean) : []
        console.log('[calendar.service] bulk upsert succeeded', { upserted: upsertedGoogleIds.length })
      }
    } catch (err) {
      console.error('[calendar.service] bulk upsert threw', err)
      upsertErrors = rows.length
    }
  }
  // Summarize upsert results so we can tell if writes succeeded
  try {
    const uniqueUpserted = Array.from(new Set(upsertedGoogleIds.filter(Boolean)))
    console.log('[calendar.service] upsert summary', { attempted: (events || []).length, upsertErrors, upserted: upsertedGoogleIds.length, uniqueUpsertedCount: uniqueUpserted.length })
    if (uniqueUpserted.length > 0) {
      console.log('[calendar.service] sample upserted google ids', uniqueUpserted.slice(0, 10))
    }
  } catch (e) {
    console.warn('[calendar.service] failed to log upsert summary', e)
  }

  // Delete any local rows that were previously created from Google but are no longer present in the fetched events.
  try {
    const incomingIds = (events || []).map(e => e.google_event_id).filter(Boolean)
    console.log('[calendar.service] cleanup stale google events - decision', { customerId, incomingCount: incomingIds.length, upserted: upsertedGoogleIds.length, upsertErrors })

    if (incomingIds.length > 0) {
      // Safer strategy: fetch existing google_event_id rows for the customer,
      // compute the difference client-side, and delete by numeric calendar_id in batches.
      // This avoids building a very long PostgREST `not.in` filter which expects
      // parentheses and can fail for long lists.
      try {
        const { data: existingRows, error: existingErr } = await supabase
          .from('calendar')
          .select('calendar_id, google_event_id')
          .eq('customer_id', customerId)
          .not('google_event_id', 'is', null)

        if (existingErr) {
          console.error('[calendar.service] failed to fetch existing google rows for cleanup', existingErr)
        } else {
          const incomingSet = new Set(incomingIds)
          const toDeleteCalendarIds = (existingRows || []).filter(r => r.google_event_id && !incomingSet.has(r.google_event_id)).map(r => r.calendar_id)
          console.log('[calendar.service] rows that would be deleted count', { count: toDeleteCalendarIds.length, sample: (toDeleteCalendarIds || []).slice(0,10) })

          if (toDeleteCalendarIds.length > 0) {
            const batchSize = 100
            const deletedSamples = []
            for (let i = 0; i < toDeleteCalendarIds.length; i += batchSize) {
              const chunk = toDeleteCalendarIds.slice(i, i + batchSize)
              try {
                const { data: deletedRows, error: delErr } = await supabase.from('calendar').delete().in('calendar_id', chunk).select('calendar_id, google_event_id')
                if (delErr) {
                  console.error('[calendar.service] batch delete failed', { chunkSize: chunk.length, error: delErr })
                } else {
                  if (Array.isArray(deletedRows)) deletedSamples.push(...deletedRows.slice(0,5))
                }
              } catch (delEx) {
                console.error('[calendar.service] batch delete threw', delEx)
              }
            }
            console.log('[calendar.service] deleted stale google events count', { count: toDeleteCalendarIds.length, sample: deletedSamples.slice(0,10) })
          }
        }
      } catch (previewEx) {
        console.error('[calendar.service] cleanup preview/select threw', previewEx)
      }
    } else {
      // No incoming google events: remove any local rows that have a google_event_id (they were deleted in Google)
      const { data: deletedAllRows, error: e3 } = await supabase.from('calendar').delete().eq('customer_id', customerId).not('google_event_id', 'is', null).select('calendar_id, google_event_id')
      if (e3) console.error('[calendar.service] delete all stale google events failed', e3)
      else console.log('[calendar.service] deleted all stale google events count', { count: (deletedAllRows || []).length, sample: (deletedAllRows || []).slice(0,10) })
    }
  } catch (err) {
    console.error('[calendar.service] cleanup stale google events failed', err)
  }

  // Return events for the user
  // Attempt to select including color; if column doesn't exist, fall back to select without color
  try {
    console.log('[calendar.service] selecting calendar rows for customer', { customerId })
    const { data: all, error } = await supabase.from('calendar').select('calendar_id, task, task_date, start, "end", color, description').eq('customer_id', customerId)
    if (error) throw error
    const mapped = (all || []).map(r => {
      // reconstruct a client-friendly start/end (prefer full ISO-like string when time exists)
      const start = r.start ? `${r.task_date}T${r.start}` : r.task_date
      const end = r.end ? `${r.task_date}T${r.end}` : r.task_date
      return ({ id: r.calendar_id, title: r.task, start, end, color: r.color, description: r.description })
    })
    console.log('[calendar.service] returning events count', { count: mapped.length })
    return mapped
  } catch (err) {
    // if color/description/start/end column missing, retry with minimal set
    if (String(err.message).toLowerCase().includes('column')) {
      console.warn('[calendar.service] select failed due to missing column; retrying minimal select', { err: String(err.message) })
      const { data: all2, error: e2 } = await supabase.from('calendar').select('calendar_id, task, task_date').eq('customer_id', customerId)
      if (e2) throw e2
      const mapped = (all2 || []).map(r => ({ id: r.calendar_id, title: r.task, start: r.task_date, end: r.task_date, color: null, description: null }))
      console.log('[calendar.service] returning minimal events count', { count: mapped.length })
      return mapped
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
    const { data, error } = await supabase.from('calendar').select('calendar_id, task, task_date, start, "end", color, description').eq('customer_id', customerId)
    if (error) throw error
    return (data || []).map(r => {
      const start = r.start ? `${r.task_date}T${r.start}` : r.task_date
      const end = r.end ? `${r.task_date}T${r.end}` : r.task_date
      return { id: r.calendar_id, title: r.task, start, end, color: r.color, description: r.description }
    })
  } catch (err) {
    if (String(err.message).toLowerCase().includes('column')) {
      const { data, error } = await supabase.from('calendar').select('calendar_id, task, task_date').eq('customer_id', customerId)
      if (error) throw error
      return (data || []).map(r => ({ id: r.calendar_id, title: r.task, start: r.task_date, end: r.task_date, color: null, description: null }))
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
  // Store task_date using the exact string provided by client. This preserves the
  // wall-clock time the user entered (e.g. '2025-09-03T13:00') and prevents
  // unintended timezone shifts when the client re-renders the event.
  const { date: taskDate, time: startTime } = extractDateAndTime(payload.start)
  const { time: endTime } = extractDateAndTime(payload.end)
  const row = {
    task_date: taskDate,
    start: startTime,
    end: endTime,
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
  const r = await supabase.from('calendar').insert([row]).select('calendar_id, task, task_date, start, "end", customer_id, google_event_id, color, description').single()
    if (r.error) throw r.error
    inserted = r.data
    console.log('[calendar] inserted local row', { calendar_id: inserted?.calendar_id, task_date: inserted?.task_date })
  } catch (err) {
    if (String(err.message).toLowerCase().includes('column') && String(err.message).toLowerCase().includes('color')) {
      delete row.color
  const r2 = await supabase.from('calendar').insert([row]).select('calendar_id, task, task_date, start, "end", customer_id, google_event_id, description').single()
      if (r2.error) throw r2.error
      inserted = r2.data
      console.log('[calendar] inserted local row (retry no-color)', { calendar_id: inserted?.calendar_id, task_date: inserted?.task_date })
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
        const r = await fetch(process.env.CALENDAR_EVENTS_URL, {
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
          try {
            if (inserted && inserted.calendar_id) {
              const { data: upd, error: updErr } = await supabase.from('calendar').update({ google_event_id: json.id }).eq('calendar_id', inserted.calendar_id).select('calendar_id, task, task_date, start, "end", customer_id, google_event_id, color, description').single()
              if (updErr) console.error('failed update google_event_id', updErr)
              else inserted = upd
            } else {
              // Insert may not have succeeded earlier; attempt to upsert by google_event_id
              const up = {
                google_event_id: json.id,
                task_date: row.task_date,
                start: row.start,
                end: row.end,
                task: row.task,
                customer_id: row.customer_id,
                description: row.description,
                color: row.color
              }
              const { data: upData, error: upErr } = await supabase.from('calendar').upsert(up, { onConflict: 'google_event_id' }).select('calendar_id, task, task_date, start, "end", customer_id, google_event_id, color, description')
              if (upErr) console.error('fallback upsert failed', upErr)
              else {
                // upsert returns array
                inserted = Array.isArray(upData) ? upData[0] : upData
                console.log('[calendar] fallback upsert created row', { calendar_id: inserted?.calendar_id })
              }
            }
            // record google id on returned object if present
            if (inserted) inserted.google_event_id = json.id
          } catch (uerr) {
            console.error('error while setting google_event_id locally', uerr)
          }
        } else {
          console.error('google returned no id for created event', attempt.res.status, attempt.bodyJson || attempt.bodyText)
        }
      }
    }
  } catch (err) {
    console.error('create event google error', err)
  }

  // Normalize start/end for the client response. Preserve the original string
  // provided by the client for timed events to avoid timezone conversion.
  const normalizedStart = payload.start ? String(payload.start) : null
  let normalizedEnd = null
  if (payload.end) {
    normalizedEnd = String(payload.end)
  } else if (payload.start && String(payload.start).includes('T')) {
    // If no explicit end provided but start has time, default to +1 hour using
    // local wall-clock arithmetic and format back to a YYYY-MM-DDTHH:mm:SS string.
    const s = new Date(String(payload.start))
    const e = new Date(s.getTime() + 60 * 60 * 1000)
    const fmt = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:00`
    normalizedEnd = fmt(e)
  } else {
    normalizedEnd = payload.start ? String(payload.start) : null
  }

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

export async function updateEventForUser(calendarIdOrGoogleId, payload) {
  // payload: { title?, start?, end?, description?, color? }
  // Accept either a numeric calendar_id or a google_event_id string.
  let calendarId = String(calendarIdOrGoogleId || '')
  console.log('[calendar.service] updateEventForUser called with', calendarId, typeof calendarId)

  // If caller passed a google_event_id, resolve to numeric calendar_id
  if (!/^\d+$/.test(calendarId)) {
    try {
      const { data: resolved, error: resErr } = await supabase.from('calendar').select('calendar_id').eq('google_event_id', calendarId).maybeSingle()
      if (resErr) throw resErr
      if (!resolved) {
        const e = new Error('calendar row not found for google_event_id')
        e.code = 'NOT_FOUND'
        throw e
      }
      calendarId = String(resolved.calendar_id)
    } catch (e) {
      console.error('[calendar.service] failed to resolve google_event_id to calendar_id', e)
      throw e
    }
  }

  // normalize to number for queries to avoid type mismatch between string/number
  const numericCalendarId = Number(calendarId)

  // select existing row using maybeSingle to avoid throws when missing
  const { data: existing, error: selErr } = await supabase.from('calendar').select('calendar_id, task, task_date, customer_id, google_event_id, color, description').eq('calendar_id', numericCalendarId).maybeSingle()
  if (selErr) throw selErr
  if (!existing) {
    const e = new Error('calendar row not found')
    e.code = 'NOT_FOUND'
    throw e
  }

  const updates = {}
  if (payload.title) updates.task = payload.title
  if (payload.description !== undefined) updates.description = payload.description
  if (payload.color !== undefined) updates.color = payload.color
  if (payload.start) {
    // Preserve the exact string provided by the client for task_date so the
    // stored value matches the user's wall-clock input and avoids TZ shifts.
    const { date: taskDate, time: startTime } = extractDateAndTime(payload.start)
    updates.task_date = taskDate
    if (startTime !== null) updates.start = startTime
  }
  if (payload.end !== undefined) {
    const { time: endTime } = extractDateAndTime(payload.end)
    if (endTime !== null) updates.end = endTime
  }

  const { data: upd, error: updErr } = await supabase.from('calendar').update(updates).eq('calendar_id', numericCalendarId).select('calendar_id, task, task_date, start, "end", customer_id, google_event_id, color, description').maybeSingle()
  if (updErr) {
    // If update failed because color column missing, retry without color
    if (String(updErr.message).toLowerCase().includes('column') && String(updErr.message).toLowerCase().includes('color')) {
      delete updates.color
      const { data: upd2, error: updErr2 } = await supabase.from('calendar').update(updates).eq('calendar_id', numericCalendarId).select('calendar_id, task, task_date, customer_id, google_event_id, description').maybeSingle()
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

      // Build request body compatible with Google Calendar API
      const buildBody = () => {
        const body = {}
        if (payload.title) body.summary = payload.title
        if (payload.description !== undefined) body.description = payload.description
        if (payload.start) {
          if (String(payload.start).includes('T')) body.start = { dateTime: new Date(String(payload.start)).toISOString() }
          else body.start = { date: String(payload.start) }
        }
        if (payload.end !== undefined) {
          if (payload.end && String(payload.end).includes('T')) body.end = { dateTime: new Date(String(payload.end)).toISOString() }
          else if (payload.end) body.end = { date: String(payload.end) }
        }
        return body
      }

      // Helper: use googleapis to patch event with the provided access token
      const patchWithGoogleapis = async (token) => {
        try {
          const authClient = new google.auth.OAuth2()
          authClient.setCredentials({ access_token: token })
          const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary'
          const calendar = google.calendar({ version: 'v3', auth: authClient })
          const res = await calendar.events.patch({ calendarId, eventId: existing.google_event_id, requestBody: buildBody() })
          return { ok: true, status: res.status || 200, data: res.data }
        } catch (err) {
          const status = err?.response?.status || null
          return { ok: false, status, error: err }
        }
      }

      let attempt = await patchWithGoogleapis(accessToken)
      if (attempt && attempt.status === 401) {
        try {
          const refreshed = await refreshAccessToken(tokens.refresh_token)
          accessToken = refreshed.access_token
          await updateAccessTokenForUser(String(cust.user_id), accessToken, refreshed.expires_in)
          attempt = await patchWithGoogleapis(accessToken)
        } catch (err) {
          console.error('failed to refresh access token during google patch', err)
          const e = new Error('google_auth_required')
          e.code = 'GOOGLE_AUTH_REQUIRED'
          throw e
        }
      }

      if (!attempt || !attempt.ok) {
        console.error('google patch event failed', attempt && attempt.status, attempt && attempt.error)
        if (attempt && attempt.status === 401) {
          const e = new Error('google_auth_required')
          e.code = 'GOOGLE_AUTH_REQUIRED'
          throw e
        }
      }
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
  const { data: existing, error: selErr } = await supabase.from('calendar').select('calendar_id, task, task_date, start, "end", customer_id, google_event_id, color, description').eq('calendar_id', calendarId).maybeSingle()
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
        // Use googleapis to perform delete; this gives more consistent errors and handling
        const tryDel = async (token) => {
          try {
            const authClient = new google.auth.OAuth2()
            authClient.setCredentials({ access_token: token })
            const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary'
            const calendar = google.calendar({ version: 'v3', auth: authClient })
            // google.calendar.events.delete returns empty on success; wrap for consistency
            await calendar.events.delete({ calendarId, eventId: existing.google_event_id })
            console.log('[google] delete event success', { google_event_id: existing.google_event_id })
            return { ok: true, status: 204 }
          } catch (err) {
            const status = err?.response?.status || err?.code || null
            // Treat 404 as success (already deleted in Google)
            if (status === 404 || (err && String(err.message || '').toLowerCase().includes('not found'))) {
              console.log('[google] delete event - not found (404), treating as success', { google_event_id: existing.google_event_id })
              return { ok: true, status: 404 }
            }
            console.error('[google] delete event error', { status, error: err })
            return { ok: false, status, error: err }
          }
        }

        let r = await tryDel(accessToken)
        if (!r.ok && r.status === 401) {
          try {
            const refreshed = await refreshAccessToken(tokens.refresh_token)
            accessToken = refreshed.access_token
            await updateAccessTokenForUser(String(cust.user_id), accessToken, refreshed.expires_in)
            r = await tryDel(accessToken)
          } catch (refreshErr) {
            console.error('failed to refresh access token during google delete', refreshErr)
          }
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
