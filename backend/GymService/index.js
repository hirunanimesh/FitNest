import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

import { addGym,getAllGyms, getGymById, getTotalGymMemberCount, updateGymDetails } from './controllers/gym.controller.js'
import { addGymPlan, deleteGymPlan, getAllGymPlans, getGymPlanByGymId, getMemberCountPerPlan, updateGymPlan } from './controllers/plans.controller.js'

const app = express()
app.use(express.json())
app.use(cors())



app.post('/addGym',addGym)
app.get('/getallgyms',getAllGyms)
app.get('/getgymbyid/:gymId',getGymById)
app.put('/updategymdetails/:gymId',updateGymDetails)

app.post('/addgymplan', addGymPlan)
app.get('/getallgymplans',getAllGymPlans)
app.get('/getgymplanbygymid/:gymId',getGymPlanByGymId)
app.put('/updategymplan/:gymPlanId', updateGymPlan)
app.delete('/deletegymplan/:gymPlanId',deleteGymPlan)

app.get('/gettotalmembercount/:gymId',getTotalGymMemberCount)
app.get('/getplanmembercount/:plan_id',getMemberCountPerPlan)

app.listen(process.env.PORT || 3002,()=>{
    console.log(`Gym Service is running on port ${process.env.PORT || 3002}`)
})