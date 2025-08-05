import express from 'express'
import cors from 'cors'
import { 
  registerTrainer,
  getAllTrainers,
  getTrainerById,
  getTrainerDashboard,
  getTrainerCalendar,
  updateTrainerProfile
} from './controllers/trainer.controller.js'

import {
  createTrainingPlan,
  updateTrainingPlan,
  deleteTrainingPlan
} from './controllers/plan.controller.js'

const app = express()
app.use(express.json())
app.use(cors())

// Trainer registration and profile routes
app.post('/api/trainers/register', registerTrainer)
app.get('/api/trainers', getAllTrainers)
app.get('/api/trainers/:id', getTrainerById)
app.put('/api/trainers/profile', updateTrainerProfile)

// Training plan routes
app.post('/api/trainers/:id/plans', createTrainingPlan)
app.put('/api/trainers/plans/:planId', updateTrainingPlan)
app.delete('/api/trainers/plans/:planId', deleteTrainingPlan)

// Trainer dashboard and calendar routes
app.get('/api/trainers/:id/dashboard', getTrainerDashboard)
app.get('/api/trainers/:id/calendar', getTrainerCalendar) //add task,update,delete

app.listen(process.env.PORT || 3004, () => {
    console.log(`Trainer Service is running on port ${process.env.PORT || 3004}`)
})