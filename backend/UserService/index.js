import express from 'express'
import cors from 'cors'
import { getProfile, createProfile, updateProfile, uploadProfileImage, deleteProfileImage, getProfileStats } from './controllers/profile.controller.js'
import { addProgress, getProgressHistory, getLatestProgress, updateProgress, deleteProgress, getBMITrends } from './controllers/progress.controller.js'
import { getCalendar, addCalendarTask, updateCalendarTask, deleteCalendarTask, getTasksByDate, syncGoogleCalendar } from './controllers/calendar.controller.js'
import dashboardController from './controllers/dashboard.controller.js'
import { submitFeedback } from './controllers/feedback.controller.js'
import { subscriptionAPI } from './utils/apiClient.js'

const app = express()
app.use(express.json())
app.use(cors())

// Profile routes
app.get('/profile', getProfile)
app.post('/profile', createProfile)
app.put('/profile', updateProfile)
app.post('/profile/image', uploadProfileImage)
app.delete('/profile/image', deleteProfileImage)
app.get('/profile/stats', getProfileStats)

// Progress routes
app.post('/progress', addProgress)
app.get('/progress/history', getProgressHistory)
app.get('/progress/latest', getLatestProgress)
app.put('/progress/:id', updateProgress)
app.delete('/progress/:id', deleteProgress)
app.get('/progress/bmi-trends', getBMITrends)

// Calendar routes 
app.get('/calendar', getCalendar)
app.post('/calendar/task', addCalendarTask)
app.put('/calendar/task/:id', updateCalendarTask)
app.delete('/calendar/task/:id', deleteCalendarTask)
app.get('/calendar/date/:date', getTasksByDate)
app.post('/calendar/sync-google', syncGoogleCalendar)

// Dashboard routes
app.get('/dashboard', dashboardController.getDashboard)
app.get('/dashboard/motivation', dashboardController.getMotivation)
app.get('/dashboard/plans', dashboardController.getSubscribedPlans)
app.get('/dashboard/weight-progress', dashboardController.getWeightProgress)
app.get('/dashboard/bmi-variation', dashboardController.getBMIVariation)
app.get('/dashboard/calendar', dashboardController.getCalendarTasks)
app.post('/dashboard/weight-entry', dashboardController.addWeightEntry)
app.get('/dashboard/stats', dashboardController.getDashboardStats)

// Feedback route
app.post('/feedback', submitFeedback)

// Subscriptions (calls Subscription Service via Axios)
app.get('/subscriptions', async (req, res) => {
  try {
    const userId = req.query.userId // you may use req.user.id if using Auth middleware

    const response = await subscriptionAPI.get(`/subscriptions?userId=${userId}`)

    res.status(200).json(response.data)
  } catch (err) {
    console.error("Error fetching subscriptions:", err.message)
    res.status(500).json({ error: "Failed to fetch subscriptions" })
  }
})

app.listen(process.env.PORT || 3003, () => {
  console.log(`User Service is running on port ${process.env.PORT || 3003}`)
})

