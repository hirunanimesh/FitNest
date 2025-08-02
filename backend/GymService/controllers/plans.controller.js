import { addgymplan, deletegymplan, getallgymplans, getgymplanbygymid, getplanmembercount, updategymplan } from "../services/plans.service.js";


export const addGymPlan = async (req, res) => {
    try {
        const gymPlan = await addgymplan(req.body);
        if (gymPlan) {
            res.status(200).json({ message: "Gym plan created successfully", gymPlan });
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
        const updatedGymPlan = await updategymplan(gymPlanId, req.body);
        if (updatedGymPlan) {
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