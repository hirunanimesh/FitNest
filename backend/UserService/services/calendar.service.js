import { google } from 'googleapis';
import { getGoogleTokens } from '../lib/supabaseTokens.js';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export const getCalendarEvents = async (userId) => {
  const tokens = await getGoogleTokens(userId);
  oauth2Client.setCredentials({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime'
  });

  return response.data.items;
};

export const createCalendarEvent = async (userId, eventData) => {
  const tokens = await getGoogleTokens(userId);
  oauth2Client.setCredentials({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  const event = {
    summary: eventData.summary,
    description: eventData.description,
    start: { dateTime: eventData.start, timeZone: 'UTC' },
    end: { dateTime: eventData.end, timeZone: 'UTC' }
  };

  const response = await calendar.events.insert({
    calendarId: 'primary',
    resource: event
  });

  return response.data;
};
