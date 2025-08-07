import { createTrainer,getalltrainers, gettrainerbyid,  updatetrainerdetails } from '../services/trainer.service.js';

export const addTrainer = async (req, res) => {
  try {
    const trainer = await createTrainer(req.body);
    if (trainer) {
      res.status(200).json({ message: "Trainer created successfully", trainer });
    }
  } catch (error) {
    console.error("Error creating Trainer:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const getallTrainers = async (req,res)=>{
    try{
        const trainers = await getalltrainers();
        res.status(200).json({ message: "Trainers retrieved successfully", trainers });       
    }catch(error){
        console.error("Error retrieving trainers:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const getTrainerById = async (req, res) => {
    const { trainerId } = req.params;
    try {
        const trainer = await gettrainerbyid(trainerId);
        if (trainer) {
        res.status(200).json({ message: "Trainer retrieved successfully", trainer });
        } else {
        res.status(404).json({ message: "Trainer not found" });
        }
    } catch (error) {
        console.error("Error retrieving trainer:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const updateTrainerDetails = async (req, res) => {
    const { trainerId } = req.params;
    try {
        const updatedTrainer = await updatetrainerdetails(trainerId, req.body);
        if (updatedTrainer) {
            res.status(200).json({ message: "Trainer updated successfully", updatedTrainer });
        } else {
            res.status(404).json({ message: "Trainer not found" });
        }
    } catch (error) {
        console.error("Error updating trainer:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


