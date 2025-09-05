import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import upload from './config/multer.js'
import { uploadProfileImage,addfeedback,getlatestweightbyid,getweightbyid,addweight,getuserbyid, updateuserdetails} from './controllers/user.controller.js'
import {
	getGoogleOauthUrl,
	googleCallback,
	calendarStatus,
	getCalendarEvents,
	syncCalendar,
	createCalendarEvent,
	// used by debug route
} from './controllers/calendar.controller.js'
import { updateCalendarEvent, deleteCalendarEvent } from './controllers/calendar.controller.js'
import { getTokensForUser } from './services/calendar.service.js'

const app = express()
app.use(express.json())
app.use(cors())

app.get('/getuserbyid/:userId',getuserbyid)
app.patch('/updateuserdetails/:userId',updateuserdetails)
app.post('/addweight',addweight)
app.get('/getweightbyid/:userId',getweightbyid)
app.get('/getlatestweightbyid/:userId',getlatestweightbyid)
app.post('/addfeedback',addfeedback)

app.post('/upload-image', upload.single('image'), uploadProfileImage);
// Google Calendar & OAuth routes
app.get('/google/oauth-url/:userId', getGoogleOauthUrl)
app.get('/google/callback', googleCallback)
app.get('/calendar/status/:userId', calendarStatus)
app.get('/calendar/events/:userId', getCalendarEvents)
app.post('/calendar/sync/:userId', syncCalendar)
app.post('/calendar/create/:userId', createCalendarEvent)
app.put('/calendar/:calendarId', updateCalendarEvent)
app.delete('/calendar/:calendarId', deleteCalendarEvent)
// Dev-only debug route to view stored tokens (do not enable in production)
if (process.env.NODE_ENV !== 'production') {
	app.get('/debug/google/tokens/:userId', async (req, res) => {
		try {
			const { userId } = req.params;
			const tokens = await getTokensForUser(String(userId));
			res.json(tokens || null);
		} catch (err) {
			console.error('debug tokens error', err);
			res.status(500).json({ error: 'failed' });
		}
	})
}
app.listen(process.env.PORT || 3004,()=>{
   
})

