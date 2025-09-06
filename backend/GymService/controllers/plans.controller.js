import { GymPlanCreateProducer, GymPlanDeleteProducer, GymPlanPriceUpdateProducer } from "../kafka/Producer.js";
import { addgymplan, assigntrainerstoplan, deletegymplan, getallgymplans, getgymplanbygymid, getplanmembercount, getplantrainers, updategymplan, updateplantrainers,getOneDayGyms , getOtherGyms, getgymplanbyplanid } from "../services/plans.service.js";


export const addGymPlan = async (req, res) => {
    try {
        const gymPlan = await addgymplan(req.body);
        if (gymPlan) {
            res.status(200).json({ message: "Gym plan created successfully", gymPlan });
            await GymPlanCreateProducer(gymPlan.plan_id,gymPlan.title,gymPlan.price,gymPlan.duration)
        }
    } catch (error) {
        console.error("Error creating gym plan:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const getAllGymPlans = async (req, res) => {
    try {
        const gymPlans = await getallgymplans()
        if (gymPlans) {
            res.status(200).json({ message: "Gym plans retrieved successfully", gymPlans });
        } else {
            res.status(404).json({ message: "No gym plans found" });
        }
    } catch (error) {
        console.error("Error retrieving gym plans:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const getGymPlanByGymId = async (req, res) => {
    const { gymId } = req.params;
    try {
        const gymPlan = await getgymplanbygymid(gymId)
        if (gymPlan) {
            res.status(200).json({ message: "Gym plan retrieved successfully", gymPlan });
        } else {
            res.status(404).json({ message: "Gym plan not found" });
        }
    } catch (error) {
        console.error("Error retrieving gym plan:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const updateGymPlan = async (req, res) => {
    const { gymPlanId } = req.params;
    try {
        const oldPlan = await getgymplanbyplanid(gymPlanId);
        const updatedGymPlan = await updategymplan(gymPlanId, req.body);
        if (updatedGymPlan) {
            if(oldPlan.price !== updatedGymPlan.price){
                await GymPlanPriceUpdateProducer(gymPlanId,updatedGymPlan.price,updatedGymPlan.duration) 
                console.log("Price changed, send to kafka")
            }
            res.status(200).json({ message: "Gym plan updated successfully", updatedGymPlan });
        } else {
            res.status(404).json({ message: "Gym plan not found" });
        }
    } catch (error) {
        console.error("Error updating gym plan:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

export const deleteGymPlan = async (req, res) => {
    const { gymPlanId } = req.params;
    try {
        const deleteplan = await deletegymplan(gymPlanId);
        if(deleteplan){
            res.status(200).json({ message: "Gym plan deleted successfully" });
            await GymPlanDeleteProducer(gymPlanId)
        }else{
            res.status(404).json({ message: "Gym plan not found" });
        }

    } catch (error) {
        console.error("Error deleting gym plan:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const getMemberCountPerPlan = async (req, res) => {
    const {plan_id} = req.params;
    try{
        const count = await getplanmembercount(plan_id)
        if(count){
            res.status(200).json({ message: "Member count retrieved successfully", count });
        }else{
            res.status(404).json({ message: "Plan not found or no members" });
        }
    }catch(error){
        console.error("Error retrieving member count per plan:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const assignTrainersToPlan = async (req, res) => {
  try {
    const { plan_id, trainer_ids } = req.body;
    const result = await assigntrainerstoplan(plan_id, trainer_ids);
    res.status(200).json({ 
      message: "Trainers assigned to plan successfully", 
      data: result 
    });
  } catch (error) {
    console.error("Error assigning trainers to plan:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: error.message 
    });
  }
};

export const getPlanTrainers = async (req, res) => {
  try {
    const { planId } = req.params;
    const trainers = await getplantrainers(planId);
    res.status(200).json({ 
      message: "Plan trainers retrieved successfully", 
      data: trainers 
    });
  } catch (error) {
    console.error("Error retrieving plan trainers:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: error.message 
    });
  }
};

export const updatePlanTrainers = async (req, res) => {
  try {
    const { planId } = req.params;
    const { trainer_ids } = req.body;
    const result = await updateplantrainers(planId, trainer_ids);
    res.status(200).json({ 
      message: "Plan trainers updated successfully", 
      data: result 
    });
  } catch (error) {
    console.error("Error updating plan trainers:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: error.message 
    });
  }
};

export const GetOneDayGyms = async (req, res) => {
    try {
        const gyms = await getOneDayGyms();
        res.status(200).json({ message: "One day gyms retrieved successfully", gyms });
    } catch (error) {
        console.error("Error retrieving one day gyms:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

//get gyms which are not providing one day plans
export const GetOtherGyms = async (req, res) => {
    try {
        const gyms = await getOtherGyms();
        res.status(200).json({ message: "Other gyms retrieved successfully", gyms });
    } catch (error) {
        console.error("Error retrieving other gyms:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
