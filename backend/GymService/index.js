import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()


import { addGym,approveTrainer,getAllGyms, getAllGymUsers, getGymById, getGymByUserId, getGymTrainerCount, getTotalGymMemberCount, getTrainers, updateGymDetails, requestVerification } from './controllers/gym.controller.js'
import { addGymPlan, deleteGymPlan, getAllGymPlans, getGymPlanByGymId, getMemberCountPerPlan, updateGymPlan, assignTrainersToPlan, getPlanTrainers, updatePlanTrainers , GetOneDayGyms , GetOtherGyms, GetGymPlanDetails} from './controllers/plans.controller.js'


const app = express()
app.use(express.json())
app.use(cors())



app.post('/addGym',addGym)
app.get('/getallgyms',getAllGyms)
app.get('/getgymbyid/:gymId',getGymById)
app.get('/getgymbyuserid/:userId',getGymByUserId)
app.put('/updategymdetails/:gymId',updateGymDetails)

app.post('/getallgymusers',getAllGymUsers)

app.post('/addgymplan', addGymPlan)
app.get('/getallgymplans',getAllGymPlans)
app.get('/getgymplanbygymid/:gymId',getGymPlanByGymId)
app.put('/updategymplan/:gymPlanId', updateGymPlan)
app.delete('/deletegymplan/:gymPlanId',deleteGymPlan)
app.post('/getgymplandetails',GetGymPlanDetails)
app.get('/getgymplan/:planId', async (req, res) => {
    try {
        const { getgymplanbyplanid } = await import('./services/plans.service.js');
        const planData = await getgymplanbyplanid(req.params.planId);
        
        if (planData) {
            res.status(200).json(planData);
        } else {
            res.status(404).json({ message: "Gym plan not found" });
        }
    } catch (error) {
        console.error("Error retrieving gym plan:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
})

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