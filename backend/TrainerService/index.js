import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

import upload from './config/multer.js'
import {
  uploadSessionImage,
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
  getFeedbackbyTrainerId
 } from './controllers/trainer.controller.js'
const app = express()
app.use(express.json())
app.use(cors())

app.post('/addsession', addSession);
app.get('/getallsessions', getAllSession);
app.get('/getsessionbysessionid/:sessionId', getSessionBySessionId);
app.get('/getallsessionbytrainerid/:trainerId', getallSessionByTrainerId);
app.patch('/updatesession/:sessionId', updatedSession);
app.post('/uploadsessionimage', upload.single('image'), uploadSessionImage)
app.delete('/deletesession/:sessionId', deleteSession);

app.get('/getalltrainers', getallTrainers);
app.get('/gettrainerbyid/:trainerId', getTrainerById);
app.put('/updatetrainerdetails/:trainerId', updateTrainerDetails);
app.get('/getfeedbackbytrainerid/:trainerId',getFeedbackbyTrainerId);
//api  for calendar function
//get subscribe user
const PORT = process.env.PORT || 3005
app.listen(PORT, () => {
  console.log(`Trainer Service is running on port ${PORT}`)
})