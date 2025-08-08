/*import express from 'express'
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
})*/
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

import {
  addSession,
  deleteSession,
  getAllSession,
  getSessionBySessionId,
  updatedSession
} from "./controllers/session.controller.js";
import { 
  addTrainer,
  getallTrainers, 
  getTrainerById, 
  updateTrainerDetails
 } from './controllers/trainer.controller.js'
const app = express()
app.use(express.json())
app.use(cors())

app.post('/addsession', addSession);
app.get('/getallsessions', getAllSession);
app.get('/getsessionbysessionid/:sessionId', getSessionBySessionId);
app.put('/updatesession/:sessionId', updatedSession);
app.delete('/deletesession/:sessionId', deleteSession);

app.post('/addTrainer', addTrainer);
app.get('/getalltrainers', getallTrainers);
app.get('/gettrainerbyid/:trainerId', getTrainerById);
app.put('/updatetrainerdetails/:trainerId', updateTrainerDetails);

//api  for calendar function
//get subscribe user
const PORT = process.env.PORT || 3005
app.listen(PORT, () => {
  console.log(`Trainer Service is running on port ${PORT}`)
})