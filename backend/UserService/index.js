import express from 'express'
import cors from 'cors'
import { authenticateUser } from './middleware/auth.middleware.js'
import { getProfile, createProfile, updateProfile, uploadProfileImage, deleteProfileImage, getProfileStats } from './controllers/profile.controller.js'
import { addProgress, getProgressHistory, getLatestProgress, updateProgress, deleteProgress, getBMITrends } from './controllers/progress.controller.js'
import { getCalendar, addCalendarTask, updateCalendarTask, deleteCalendarTask, getTasksByDate, syncGoogleCalendar } from './controllers/calendar.controller.js'
import dashboardController from './controllers/dashboard.controller.js'
import { submitFeedback } from './controllers/feedback.controller.js'
import { subscriptionAPI } from './utils/apiClient.js'
import {registerCustomer} from './controllers/register.controller.js'
const app = express()
app.use(express.json())
app.use(cors())

// Apply authentication middleware to all routes
app.use('/api/users', authenticateUser)
// Customer routes
app.post('/api/users/customer', registerCustomer)

// Profile routes
app.get('/api/users/profile', getProfile)
app.post('/api/users/profile', createProfile)
app.put('/api/users/profile', updateProfile)
app.post('/api/users/profile/image', uploadProfileImage)
app.delete('/api/users/profile/image', deleteProfileImage)
app.get('/api/users/profile/stats', getProfileStats)

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
app.get('/api/users/dashboard', dashboardController.getDashboard)
app.get('/api/users/dashboard/motivation', dashboardController.getMotivation)
app.get('/api/users/dashboard/plans', dashboardController.getSubscribedPlans)
app.get('/api/users/dashboard/weight-progress', dashboardController.getWeightProgress)
app.get('/api/users/dashboard/bmi-variation', dashboardController.getBMIVariation)
app.get('/api/users/dashboard/calendar', dashboardController.getCalendarTasks)
app.post('/api/users/dashboard/weight-entry', dashboardController.addWeightEntry)
app.get('/api/users/dashboard/stats', dashboardController.getDashboardStats)

// Feedback route
app.post('/api/users/feedback', submitFeedback)

// Subscriptions (calls Subscription Service via Axios)
app.get('/api/users/subscriptions', async (req, res) => {
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

