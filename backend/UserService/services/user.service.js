// Add event to Google Calendar for a user
import { google } from 'googleapis';

export async function addEventToCalendar(userId, event) {
  // Fetch user from DB to get Google tokens and calendarId
  const { data, error } = await supabase
    .from('customer')
    .select('google_access_token, google_refresh_token, calendar_id')
    .eq('id', userId)
    .single();
  if (error || !data) {
    return { success: false, error: 'User not found or DB error' };
  }
  const { google_access_token, google_refresh_token, calendar_id } = data;
  if (!google_access_token || !google_refresh_token || !calendar_id) {
    return { success: false, error: 'Missing Google credentials or calendarId' };
  }
  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: google_access_token,
      refresh_token: google_refresh_token
    });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const response = await calendar.events.insert({
      calendarId: calendar_id,
      resource: event
    });
    return { success: true, eventId: response.data.id };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
import { supabase } from '../database/supabase.js';

/*export async function createUser(userData) {
  const { data, error } = await supabase
    .from('customer')
    .insert([userData])
    .select(); 

  if (error) {
    throw new Error(error.message);
  }

  return data[0]; // Return first inserted row
}*/

export async function updateUserDetails(userId, userData) {
  const { data, error } = await supabase
    .from('customer')
    .update(userData)
    .eq('id', userId)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data[0]; // Return updated customer
}


export async function addWeight(weightData) {
    const { data, error } = await supabase
      .from('customer_progress')
      .insert(weightData)
      .select();
  
    if (error) {
      throw new Error(error.message);
    }
  
    return data[0]; // Return first inserted weight
  }


  export async function getUserById(userId) {
          const { data, error } = await supabase
          .from('customer')
          .select('*')
          .eq('id', userId)
          .single(); // Fetch single user by ID
  
          if(!data){
                  return null;
          }
          
          if (error) {
          throw new Error(error.message);
          }
          
          return data; // Return the user data
  }
  export async function getWeightById(userId) {
  const { data, error } = await supabase
    .from('customer_progress')
    .select('*')
    .eq('customer_id', userId);

  if (error) {
    throw new Error(error.message);
  }

  return data; // Array of all weight entries
}
export async function getLatestWeightById(userId) {
  const { data, error } = await supabase
    .from('customer_progress')
    .select('height,weight')
    .eq('customer_id', userId)
    .order('created_at', { ascending: false })
    .limit(1); // Get the latest weight entry

  if (error) {
    throw new Error(error.message);
  }

  return data[0]; // Array of all weight entries
}

export async function addGoogleCalendarTask(req, res) {
    try {
      const { accessToken, refreshToken, calendarId, task, note, task_date } = req.body;
      if (!accessToken || !refreshToken || !calendarId) {
        return res.status(400).json({ error: 'Missing Google credentials or calendarId' });
      }
      const event = {
        summary: task,
        description: note,
        start: { date: task_date },
        end: { date: task_date }
      };
      const result = await addEventToCalendar(accessToken, refreshToken, calendarId, event);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }


