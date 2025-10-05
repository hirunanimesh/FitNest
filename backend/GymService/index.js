import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()


import { addGym,approveTrainer,getAllGyms, getAllGymUsers, getGymById, getGymByUserId, getGymTrainerCount, getTotalGymMemberCount, getTrainers, updateGymDetails, requestVerification } from './controllers/gym.controller.js'
import { addGymPlan, deleteGymPlan, getAllGymPlans, getGymPlanByGymId, getMemberCountPerPlan, updateGymPlan, assignTrainersToPlan, getPlanTrainers, updatePlanTrainers , GetOneDayGyms , GetOtherGyms, GetGymPlanDetails, GetPlanDetailFromPlanId} from './controllers/plans.controller.js'
import subscriptionEmailRoutes from './routes/subscription.email.routes.js';


const app = express()
app.use(express.json())
app.use(cors())



app.post('/addGym',addGym)
app.get('/getallgyms',getAllGyms)
app.get('/getgymbyid/:gymId',getGymById)
app.get('/getgymbyuserid/:userId',getGymByUserId)
app.put('/updategymdetails/:gymId',updateGymDetails)

app.post('/getallgymusers',getAllGymUsers)

app.use('/api/gym', subscriptionEmailRoutes);

app.post('/addgymplan', addGymPlan)
app.get('/getallgymplans',getAllGymPlans)
app.get('/getgymplanbygymid/:gymId',getGymPlanByGymId)
app.put('/updategymplan/:gymPlanId', updateGymPlan)
app.delete('/deletegymplan/:gymPlanId',deleteGymPlan)
app.post('/getgymplandetails',GetGymPlanDetails)
app.get('/getgymplanbyplanid/:planId',GetPlanDetailFromPlanId)

// New routes for managing plan trainers
app.post('/assign-trainers-to-plan', assignTrainersToPlan)
app.get('/get-plan-trainers/:planId', getPlanTrainers)
app.put('/update-plan-trainers/:planId', updatePlanTrainers)

app.get('/gettotalmembercount/:gymId',getTotalGymMemberCount)
app.get('/getplanmembercount/:plan_id',getMemberCountPerPlan)
app.get('/gettrainers/:gymId',getTrainers)
app.put('/approvetrainer/:request_id',approveTrainer)
app.get('/getstatistics/:gymId',getGymTrainerCount)

app.get('/one-day', GetOneDayGyms)
app.get('/other', GetOtherGyms)
app.post('/request-verification', requestVerification)

app.listen(process.env.PORT || 3002,()=>{
    console.log(`Gym Service is running on port ${process.env.PORT || 3002}`)
})