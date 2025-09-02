import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

import { addfeedback,getlatestweightbyid,getweightbyid,addweight,getuserbyid, updateuserdetails} from './controllers/user.controller.js'


const app = express()
app.use(express.json())
app.use(cors())


app.get('/getuserbyid/:userId',getuserbyid)
//app.post('/adduser',addUser)
app.patch('/updateuserdetails/:userId',updateuserdetails)
app.post('/addweight',addweight)
app.get('/getweightbyid/:userId',getweightbyid)
app.get('/getlatestweightbyid/:userId',getlatestweightbyid)
app.post('/addfeedback',addfeedback)

app.listen(process.env.PORT || 3004,()=>{
    console.log(`User Service is running on port ${process.env.PORT || 3004}`)
})

