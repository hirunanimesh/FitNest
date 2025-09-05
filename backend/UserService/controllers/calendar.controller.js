import { storeGoogleTokens } from '../lib/supabaseTokens.js';
import { getCalendarEvents, createCalendarEvent } from '../services/calendar.service.js';

export const getCalendarEventsHandler = async (req, res) => {
  try {
    const id = req.params.userId || req.params.trainerId;
    const events = await getCalendarEvents(id);
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createCalendarEventHandler = async (req, res) => {
  try {
    const id = req.params.userId || req.params.trainerId;
    const event = await createCalendarEvent(id, req.body);
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const storeGoogleTokensHandler = async (req, res) => {
  try {
    const { userId, accessToken, refreshToken, expiresAt } = req.body;
    await storeGoogleTokens(userId, accessToken, refreshToken, expiresAt);
    res.status(200).json({ message: 'Tokens stored successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};