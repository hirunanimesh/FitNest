import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

import {
  addSession,
  deleteSession,
  getAllSession,
  getSessionBySessionId,
  updatedSession,
  getallSessionByTrainerId
} from "./controllers/session.controller.js";
import { 
  getallTrainers, 
  getTrainerById, 
  updateTrainerDetails,
  getFeedbackbyTrainerId,
  bookSession
 } from './controllers/trainer.controller.js'
import {
  addplans,
  deletePlan,
  getAllplan,
  getplanByplanId,
  updatePlan,
  getallplanByTrainerId
} from "./controllers/plan.controller.js";
const app = express()
app.use(express.json())
app.use(cors())

app.post('/addsession', addSession);
app.get('/getallsessions', getAllSession);
app.get('/getsessionbysessionid/:sessionId', getSessionBySessionId);
app.get('/getallsessionbytrainerid/:trainerId', getallSessionByTrainerId);
app.patch('/updatesession/:sessionId', updatedSession);
app.delete('/deletesession/:sessionId', deleteSession);

app.get('/getalltrainers', getallTrainers);
app.get('/gettrainerbyid/:trainerId', getTrainerById);
app.patch('/updatetrainerdetails/:trainerId', updateTrainerDetails);
app.get('/getfeedbackbytrainerid/:trainerId',getFeedbackbyTrainerId);

app.post('/addplan', addplans);
app.get('/getallplans', getAllplan);
app.get('/getplanbyid/:planId', getplanByplanId);
app.get('/getallplansbytrainerid/:trainerId', getallplanByTrainerId);
app.patch('/updateplan/:planId', updatePlan);
app.delete('/deleteplan/:planId', deletePlan);

app.post('/booksession',bookSession)
//api  for calendar function
//get subscribe user
const PORT = process.env.PORT || 3005
app.listen(PORT, () => {
  console.log(`Trainer Service is running on port ${PORT}`)
})