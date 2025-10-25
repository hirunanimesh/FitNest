import { 
    addplan, 
    deleteplan, 
    getallplans, 
    getplanbyplanid, 
    updateplan,
    getallplanbytrainerid
} from "../services/plan.service.js";

export const addplans = async (req, res) => {
    try {
        const plan = await addplan(req.body);
        if (plan) {
            res.status(200).json({ message: "Trainer plan created successfully", plan });
        }
    } catch (error) {
        console.error("Error creating plan:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const getAllplan = async (req, res) => {
  try {
    const plans = await getallplans();

    if (plans && plans.length > 0) {
      res.status(200).json({ message: "Trainer plan retrieved successfully", plans });
    } else {
      res.status(404).json({ message: "No plans found" });
    }

  } catch (error) {
    console.error("Error retrieving trainer plans:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const getplanByplanId = async (req, res) => {
    const { planId } = req.params;
    try {
        const plan = await getplanbyplanid(planId)
        if (plan) {
            res.status(200).json({ message: "Trainer plan retrieved successfully", plan });
        } else {
            res.status(404).json({ message: "Trainer plan not found" });
        }
    } catch (error) {
        console.error("Error retrieving Trainer plan:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}
export const getallplanByTrainerId = async (req, res) => {
    const { trainerId } = req.params;
    try {
        const { plans, totalCount } = await getallplanbytrainerid(trainerId)
        if (plans) {
            res.status(200).json({ message: "Trainer plans retrieved successfully", plans,totalCount });
        } else {
            res.status(404).json({ message: "Trainer plans not found" });
        }
    } catch (error) {
        console.error("Error retrieving Trainer plan:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}
export const updatePlan = async (req, res) => {
    const { planId } = req.params;
    try {
        const updatedplan = await updateplan(planId, req.body);
        if (updatedplan) {
            res.status(200).json({ message: "Trainer plan updated successfully", updatedplan });
        } else {
            res.status(404).json({ message: "Trainer plan not found" });
        }
    } catch (error) {
        console.error("Error updating plan plan:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

export const deletePlan = async (req, res) => {
    const { planId } = req.params;
    try {
        const plan = await deleteplan(planId);
        if(plan){
            res.status(200).json({ message: "Trainer plan deleted successfully" });
        }else{
            res.status(404).json({ message: "Trainer plan not found" });
        }

    } catch (error) {
        console.error("Error deleting plan:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}