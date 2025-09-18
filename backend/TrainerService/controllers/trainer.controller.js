
import { getmembershipGyms,getgymplanbytrainerid,getfeedbackbytrainerid,getalltrainers, gettrainerbyid,  updatetrainerdetails ,booksession, sendrequest, requestTrainerVerification} from '../services/trainer.service.js';


export const getallTrainers = async (req,res)=>{
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const search = req.query.search || '';
        
        const trainers = await getalltrainers(page, limit, search);
        res.status(200).json({ message: "Trainers retrieved successfully", trainers });       
    }catch(error){
        console.error("Error retrieving trainers:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const getFeedbackbyTrainerId = async (req, res) => {
    const { trainerId } = req.params;
    try {
        const trainer = await getfeedbackbytrainerid(trainerId);
        if (trainer) {
        res.status(200).json({ message: "Feedbacks retrieved successfully", trainer });
        } else {
        res.status(404).json({ message: "Feedbacks not found" });
        }
    } catch (error) {
        console.error("Error retrieving feedbacks:", error);
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
export const getGymPlanByTrainerId = async (req, res) => {
  try {
        const trainerIdParam = req.params.trainerId;
        const trainerId = Number(trainerIdParam);
        if (!trainerIdParam || Number.isNaN(trainerId)) {
            console.warn('Invalid trainerId param for getGymPlanByTrainerId:', trainerIdParam);
            return res.status(400).json({ message: 'Invalid trainerId parameter' });
        }
        const gymplans = await getgymplanbytrainerid(trainerId);

    if (gymplans && gymplans.length > 0) {
      res.status(200).json({ message: "GymPlans retrieved successfully", gymplans });
    } else {
      res.status(404).json({ message: "No Plans found" });
    }
  
  } catch (error) {
    console.error("Error retrieving Gym Plans:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const bookSession = async (req, res) => {
    const { sessionId, customerId } = req.body;
  
    try {
      const session = await booksession(sessionId, customerId);
      if (session) {
        res.status(200).json({ success: true, session });
      } else {
        res.status(404).json({ success: false, message: "Session not found" });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

export const getGymById = async (req, res) => {
    const { trainerId } = req.params;
    try {
        const gyms = await getmembershipGyms(trainerId);
        if (gyms) {
        res.status(200).json({ message: "Gyms retrieved successfully", gyms });
        } else {
        res.status(404).json({ message: "Gyms not found" });
        }
    } catch (error) {
        console.error("Error retrieving gyms:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const sendRequest = async (req,res)=>{
  try{
    const {trainer_id,gym_id}= req.body
    console.log(trainer_id,gym_id)
    const request = await sendrequest(trainer_id,gym_id)
    if(request){
      res.status(200).json({message:"Request sent successfully",request})
    }
    else{
      res.status(400).json({message:"Request already sent"})
    }
    }catch(error){
    console.error("Error sending request:", error);
    }
  }

export const requestVerification = async (req, res) => {
  try {
    const { trainer_id, type, status, email } = req.body;

    if (!trainer_id || !type || !status || !email) {
      return res.status(400).json({ message: "Missing required fields: trainer_id, type, status, email" });
    }

    const result = await requestTrainerVerification({ trainer_id, type, status, email });
    res.status(200).json(result);
  } catch (error) {
    console.error("Error requesting verification:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}


