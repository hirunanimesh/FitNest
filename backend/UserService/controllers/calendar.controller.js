import { google } from 'googleapis'

export const syncGoogleCalendar = async (req, res) => {
  const { accessToken } = req.body

  const oauth2Client = new google.auth.OAuth2()
  oauth2Client.setCredentials({ access_token: accessToken })

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

  try {
    const result = await calendar.events.list({
      calendarId: 'primary',
      maxResults: 10,
      orderBy: 'startTime',
      singleEvents: true,
      timeMin: new Date().toISOString()
    })
    res.status(200).json({ events: result.data.items })
  } catch (error) {
    res.status(500).json({ message: 'Failed to sync calendar', error })
  }
}
