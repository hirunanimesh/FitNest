import { google } from 'googleapis'
import { supabase } from '../database/supabase.js'

const calendar = google.calendar('v3')

class CalendarService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    )
  }

  setUserCredentials(accessToken, refreshToken) {
    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    })
    google.options({ auth: this.oauth2Client })
  }

  async getUserTokens(userId) {
    const { data, error } = await supabase
      .from('user_google_tokens')
      .select('access_token, refresh_token')
      .eq('user_id', userId)
      .single()

    if (error || !data) throw new Error('User not connected to Google Calendar')
    return data
  }

  async getCalendarEvents(userId, timeMin, timeMax) {
    try {
      const { access_token, refresh_token } = await this.getUserTokens(userId)
      this.setUserCredentials(access_token, refresh_token)

      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin || new Date().toISOString(),
        timeMax,
        maxResults: 100,
        singleEvents: true,
        orderBy: 'startTime'
      })

      return {
        success: true,
        events: response.data.items || []
      }
    } catch (error) {
      console.error('Calendar error:', error)
      return { success: false, error: error.message }
    }
  }

  async addCalendarTask(userId, taskData) {
    try {
      const { access_token, refresh_token } = await this.getUserTokens(userId)
      this.setUserCredentials(access_token, refresh_token)

      const event = {
        summary: taskData.title,
        description: taskData.description || '',
        start: {
          dateTime: taskData.startTime,
          timeZone: taskData.timeZone || 'Asia/Colombo'
        },
        end: {
          dateTime: taskData.endTime,
          timeZone: taskData.timeZone || 'Asia/Colombo'
        },
        location: taskData.location,
        attendees: taskData.attendees?.map(email => ({ email }))
      }

      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: event
      })

      await this.storeEventReference(userId, response.data.id, taskData)

      return {
        success: true,
        event: response.data,
        eventId: response.data.id
      }
    } catch (error) {
      console.error('Add calendar error:', error)
      return { success: false, error: error.message }
    }
  }

  async updateCalendarTask(userId, eventId, taskData) {
    try {
      const { access_token, refresh_token } = await this.getUserTokens(userId)
      this.setUserCredentials(access_token, refresh_token)

      const response = await calendar.events.update({
        calendarId: 'primary',
        eventId,
        resource: {
          summary: taskData.title,
          description: taskData.description || '',
          start: {
            dateTime: taskData.startTime,
            timeZone: taskData.timeZone || 'Asia/Colombo'
          },
          end: {
            dateTime: taskData.endTime,
            timeZone: taskData.timeZone || 'Asia/Colombo'
          },
          location: taskData.location,
          attendees: taskData.attendees?.map(email => ({ email }))
        }
      })

      return { success: true, event: response.data }
    } catch (error) {
      console.error('Update calendar error:', error)
      return { success: false, error: error.message }
    }
  }

  async deleteCalendarTask(userId, eventId) {
    try {
      const { access_token, refresh_token } = await this.getUserTokens(userId)
      this.setUserCredentials(access_token, refresh_token)

      await calendar.events.delete({
        calendarId: 'primary',
        eventId
      })

      await this.removeEventReference(userId, eventId)

      return { success: true, message: 'Event deleted successfully' }
    } catch (error) {
      console.error('Delete calendar error:', error)
      return { success: false, error: error.message }
    }
  }

  async getTasksByDate(userId, date) {
    const start = new Date(date)
    start.setHours(0, 0, 0, 0)
    const end = new Date(date)
    end.setHours(23, 59, 59, 999)

    return await this.getCalendarEvents(userId, start.toISOString(), end.toISOString())
  }

  async storeEventReference(userId, googleEventId, taskData) {
    try {
      await supabase.from('user_calendar_events').insert({
        user_id: userId,
        google_event_id: googleEventId,
        event_title: taskData.title,
        event_type: taskData.type || 'manual',
        created_at: new Date().toISOString()
      })
    } catch (error) {
      console.error('DB store error:', error)
    }
  }

  async removeEventReference(userId, googleEventId) {
    try {
      await supabase
        .from('user_calendar_events')
        .delete()
        .eq('user_id', userId)
        .eq('google_event_id', googleEventId)
    } catch (error) {
      console.error('DB delete error:', error)
    }
  }

  async getDashboardCalendarData(userId) {
    try {
      const today = new Date()
      const nextWeek = new Date()
      nextWeek.setDate(today.getDate() + 7)

      const { data, error } = await supabase
        .from('user_calendar_cache')
        .select('*')
        .eq('user_id', userId)
        .gte('start_time', today.toISOString())
        .lte('start_time', nextWeek.toISOString())
        .order('start_time', { ascending: true })

      if (error) throw error

      return {
        success: true,
        events: data || [],
        upcomingCount: data?.length || 0
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error)
      return { success: false, error: error.message }
    }
  }
}

export default new CalendarService()
