// gym.controller.js
import { approvetrainer, createGym,getallgyms, getgymbyid, getgymbyuserid, getgymtrainercount, getgymtrainers, gettotalmembercount, updategymdetails } from '../services/gym.service.js';

export const addGym = async (req, res) => {
  try {
    const gym = await createGym(req.body);
    if (gym) {
      res.status(200).json({ message: "Gym created successfully", gym });
    }
  } catch (error) {
    console.error("Error creating gym:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const getAllGyms = async (req,res)=>{
    try{
        const gyms = await getallgyms();
        res.status(200).json({ message: "Gyms retrieved successfully", gyms });       
    }catch(error){
        console.error("Error retrieving gyms:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const getGymById = async (req, res) => {
    const { gymId } = req.params;
    try {
        const gym = await getgymbyid(gymId);
        if (gym) {
        res.status(200).json({ message: "Gym retrieved successfully", gym });
        } else {
        res.status(404).json({ message: "Gym not found" });
        }
    } catch (error) {
        console.error("Error retrieving gym:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const getGymByUserId = async (req, res) => {
    const { userId } = req.params;
    try {
        const gym = await getgymbyuserid(userId);
        if (gym) {
        res.status(200).json({ message: "Gym retrieved successfully", gym });
        } else {
        res.status(404).json({ message: "Gym not found" });
        }
    } catch (error) {
        console.error("Error retrieving gym:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const updateGymDetails = async (req, res) => {
    const { gymId } = req.params;
    try {
        const updatedGym = await updategymdetails(gymId, req.body);
        if (updatedGym) {
            res.status(200).json({ message: "Gym updated successfully", updatedGym });
        } else {
            res.status(404).json({ message: "Gym not found" });
        }
    } catch (error) {
        console.error("Error updating gym:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


export const getTotalGymMemberCount = async (req,res) => {
    const {gymId} = req.params;
    try{
        const member_count = await gettotalmembercount(gymId)
        if(member_count !== null) {
            res.status(200).json({ message: "Member count retrieved successfully", member_count });
        }else{
            res.status(404).json({ message: "Gym not found or no members" });
        }

    }catch(error){
        console.error("Error retrieving member count:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const getTrainers = async (req,res) =>{
    const {gymId} = req.params
    try{
        const trainers_data = await getgymtrainers(gymId)
        if(trainers_data !== null){
            res.status(200).json({message:"Trainers retrive successfully",trainers_data})
        }else{
            res.status(404).json({ message: "fetching trainers error" });
        }
    }catch(error){
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const approveTrainer = async (req,res) => {
    const {request_id} = req.params
    try{
        const approve = await approvetrainer(request_id)
        if(approve){
            res.status(200).json({message:"Approved trainer request",approve,success:true})
        }else{
            res.status(404).json({ message: "Not approved request!" ,success:false});
        }
    }catch(error){
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const getGymTrainerCount = async (req,res) => {
    const {gymId} = req.params
    console.log("Gym ID:", gymId);
    try{
        const trainers_count = await getgymtrainercount(gymId)
        console.log("Trainer count:", trainers_count);
        if(trainers_count !== null){
            res.status(200).json({message:"Trainers count retrive successfully",trainers_count})
        }
        if(trainers_count === 0 | trainers_count === null){
            res.status(200).json({message:"No trainers found",trainers_count})
        }
    }catch(error){
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

