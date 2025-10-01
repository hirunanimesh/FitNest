import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

import {addfeedback,getlatestweightbyid,getweightbyid,addweight,getuserbyid, updateuserdetails, getMySessions, addreport} from './controllers/user.controller.js'

const app = express()
app.use(express.json())
app.use(cors())

app.get('/getuserbyid/:userId',getuserbyid)
app.patch('/updateuserdetails/:userId',updateuserdetails)
app.post('/addweight',addweight)
app.get('/getweightbyid/:userId',getweightbyid)
app.get('/getlatestweightbyid/:userId',getlatestweightbyid)
app.post('/addfeedback',addfeedback)
app.get('/mysessions/:customerId',getMySessions)
app.post('/addreport',addreport)  
app.listen(process.env.PORT || 3004,()=>{
 
})

