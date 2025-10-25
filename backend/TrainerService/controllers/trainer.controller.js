
import { getmembershipGyms,getgymplanbytrainerid,getfeedbackbytrainerid,getalltrainers, gettrainerbyid,  updatetrainerdetails ,booksession, sendrequest, requestTrainerVerification, holdsession, releasesession} from '../services/trainer.service.js';


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
        console.log('Final gym plans to return:', JSON.stringify(gymplans, null, 2));

    if (gymplans && gymplans.length > 0) {
      res.status(200).json({ message: "GymPlans retrieved successfully", gymplans });
    } else {
      res.status(200).json({ message: "No Plans found" ,gymplans:[]  });
    }
  
  } catch (error) {
    console.error("Error retrieving Gym Plans:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const bookSession = async (req, res) => {
    const body = req.body || {};
    const { sessionId, customerId } = body;
    if (!sessionId || !customerId) {
      return res.status(400).json({ success: false, message: 'sessionId and customerId are required' });
    }
  
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

// Place a hold (lock) on a session if it's not already booked
export const holdSession = async (req, res) => {
  const body = req.body || {};
  const { sessionId, customerId } = body;
  try {
    if (!sessionId || !customerId) {
      return res.status(400).json({ success: false, message: 'sessionId and customerId are required' });
    }
    const locked = await holdsession(sessionId, customerId);
    if (!locked) {
      return res.status(409).json({ success: false, message: 'Session is already booked' });
    }
    return res.status(200).json({ success: true, session: locked });
  } catch (error) {
    console.error('Error holding session:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Release a held/locked session
export const releaseSession = async (req, res) => {
  const body = req.body || {};
  const { sessionId } = body;
  try {
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'sessionId is required' });
    }
    const released = await releasesession(sessionId);
    if (!released) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    return res.status(200).json({ success: true, session: released });
  } catch (error) {
    console.error('Error releasing session:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getGymById = async (req, res) => {
    const { trainerId } = req.params;
    try {
        const gyms = await getmembershipGyms(trainerId);
        if (gyms) {
        res.status(200).json({ message: "Gyms retrieved successfully", gyms });
        } else {
        res.status(200).json({ message: "Gyms not found", gyms: [] });
        }
    } catch (error) {
        console.error("Error retrieving gyms:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const sendRequest = async (req, res) => {
  try {
    const { trainer_id, gym_id } = req.body;
    
    // Validate required fields
    if (!trainer_id || !gym_id) {
      return res.status(400).json({ message: "trainer_id and gym_id are required" });
    }
    
    console.log(trainer_id, gym_id);
    const request = await sendrequest(trainer_id, gym_id);
    
    if (request) {
      res.status(200).json({ message: "Request sent successfully", request });
    } else {
      res.status(409).json({ message: "Request already sent" }); // 409 Conflict for already exists
    }
  } catch (error) {
    console.error("Error sending request:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
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


