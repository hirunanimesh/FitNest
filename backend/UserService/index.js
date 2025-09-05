import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import upload from './config/multer.js'
import { uploadProfileImage,addfeedback,getlatestweightbyid,getweightbyid,addweight,getuserbyid, updateuserdetails} from './controllers/user.controller.js'
import { getCalendarEventsHandler, createCalendarEventHandler, storeGoogleTokensHandler } from './controllers/calendar.controller.js'



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

app.get('/calendar/events/:userId', getCalendarEventsHandler);
app.post('/calendar/event/:userId', createCalendarEventHandler);
app.post('/store-google-tokens', storeGoogleTokensHandler);



app.listen(process.env.PORT || 3004,()=>{
   
})

