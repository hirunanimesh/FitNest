import { google } from 'googleapis'

/**
 * Create an authorized Google API client
 */
const getOAuthClient = (accessToken) => {
  const oauth2Client = new google.auth.OAuth2()
  oauth2Client.setCredentials({ access_token: accessToken })
  return oauth2Client
}

/**
 * Fetch upcoming events from user's Google Calendar
 */
export const fetchUpcomingEvents = async (accessToken) => {
  const auth = getOAuthClient(accessToken)
  const calendar = google.calendar({ version: 'v3', auth })

  try {
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    })

    return response.data.items
  } catch (error) {
    console.error('Error fetching events:', error)
    throw new Error('Failed to fetch events from Google Calendar')
  }
}

/**
 * Add a new event to user's Google Calendar
 */
export const createEvent = async (accessToken, eventData) => {
  const auth = getOAuthClient(accessToken)
  const calendar = google.calendar({ version: 'v3', auth })

  const event = {
    summary: eventData.summary,
    description: eventData.description || '',
    start: {
      dateTime: eventData.startDateTime, // ISO string format
      timeZone: 'Asia/Colombo',          // adjust if needed
    },
    end: {
      dateTime: eventData.endDateTime,
      timeZone: 'Asia/Colombo',
    },
  }

  try {
    const result = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    })

    return result.data
  } catch (error) {
    console.error('Error creating event:', error)
    throw new Error('Failed to create event in Google Calendar')
  }
}
