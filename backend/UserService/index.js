import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

import {addfeedback,getlatestweightbyid,getweightbyid,addweight,getuserbyid, updateuserdetails, getMySessions, addreport, getuserbycustomerid} from './controllers/user.controller.js'
import {
	getGoogleOauthUrl,
	googleCallback,
	calendarStatus,
	getCalendarEvents,
	syncCalendar,
	createCalendarEvent,
	updateCalendarEvent,
	deleteCalendarEvent
} from './controllers/calendar.controller.js'

const app = express()
app.use(express.json())
app.use(cors())

app.get('/getuserbyid/:userId',getuserbyid)
//app.get('/getuserbycustomerid/:customerId',getuserbycustomerid)
app.patch('/updateuserdetails/:userId',updateuserdetails)
app.post('/addweight',addweight)
app.get('/getweightbyid/:userId',getweightbyid)
app.get('/getlatestweightbyid/:userId',getlatestweightbyid)
app.post('/addfeedback',addfeedback)
app.get('/mysessions/:customerId',getMySessions)
app.post('/addreport',addreport)  
// Calendar / Google OAuth endpoints
app.get('/google/oauth-url/:userId', getGoogleOauthUrl)
app.get('/google/callback', googleCallback)
app.get('/calendar/status/:userId', calendarStatus)
app.get('/calendar/events/:userId', getCalendarEvents)
app.post('/calendar/sync/:userId', syncCalendar)
app.post('/calendar/create/:userId', createCalendarEvent)
app.patch('/calendar/:calendarId', updateCalendarEvent)
app.delete('/calendar/:calendarId', deleteCalendarEvent)

app.listen(process.env.PORT || 3004,()=>{
   
})

