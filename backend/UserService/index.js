import express from 'express'
import cors from 'cors'
import { 
  getProfile, 
  updateProfile, 
  uploadProfileImage 
} from './controllers/profile.controller.js'

import { 
  addProgress, 
  getProgressHistory, 
  getLatestProgress, 
  updateProgress, 
  deleteProgress, 
  getBMITrends 
} from './controllers/progress.controller.js'

import { 
  getCalendar, 
  addCalendarTask, 
  updateCalendarTask, 
  deleteCalendarTask, 
  getTasksByDate, 
  syncGoogleCalendar 
} from './controllers/calendar.controller.js'

//is this actually want?
import { 
  getDashboard, 
} from './controllers/dashboard.controller.js'

const app = express()
app.use(express.json())
app.use(cors())

// Profile routes
app.get('/api/users/profile', getProfile)
app.put('/api/users/profile', updateProfile)
app.post('/api/users/profile/image', uploadProfileImage)

// Progress routes
app.post('/api/users/progress', addProgress)
app.get('/api/users/progress/history', getProgressHistory)
app.get('/api/users/progress/latest', getLatestProgress)
app.put('/api/users/progress/:id', updateProgress)
app.delete('/api/users/progress/:id', deleteProgress)
app.get('/api/users/progress/bmi-trends', getBMITrends)

// Calendar routes 
app.get('/api/users/calendar', getCalendar)
app.post('/api/users/calendar/task', addCalendarTask)
app.put('/api/users/calendar/task/:id', updateCalendarTask)
app.delete('/api/users/calendar/task/:id', deleteCalendarTask)
app.get('/api/users/calendar/date/:date', getTasksByDate)
app.post('/api/users/calendar/sync-google', syncGoogleCalendar)

// Dashboard routes
app.get('/api/users/dashboard', getDashboard)


app.listen(process.env.PORT || 3003, () => {
    console.log(`User Service is running on port ${process.env.PORT || 3003}`)
})