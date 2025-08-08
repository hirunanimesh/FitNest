import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

import { addUser, updateUserDetails } from './controllers/user.controller.js'


const app = express()
app.use(express.json())
app.use(cors())



app.post('/adduser',addUser)
app.put('/updateuserdetails/:userId',updateUserDetails)


app.listen(process.env.PORT || 3003,()=>{
    console.log(`User Service is running on port ${process.env.PORT || 3003}`)
})

