import {getLatestWeightById,getWeightById, addWeight,updateUserDetails,getUserById, getUserSessions, addReport, getUserByCustomerId } from '../services/user.service.js';
import{addFeedback} from  '../services/feedback.service.js';

export const updateuserdetails = async (req, res) => {
    const { userId } = req.params;
    try {
        const updatedUser = await updateUserDetails(userId, req.body);
        if (updatedUser) {
            res.status(200).json({ message: "User updated successfully", updatedUser });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
export const getuserbyid = async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await getUserById(userId);
        if (user) {
        res.status(200).json({ message: "User retrieved successfully", user });
        } else {
        res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error("Error retrieving user:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

export const addweight = async (req, res) => {
    try {
        console.log('addweight controller - request body:', req.body);
        const weight = await addWeight(req.body);
        if (weight) {
            console.log('addweight controller - success:', weight);
            return res.status(200).json({ message: "Weight added successfully", weight });
        }
        // If service returned falsy, respond with 400
        console.warn('addweight controller - service returned no result');
        return res.status(400).json({ message: 'No weight returned from service' });
    } catch (error) {
        // Log full error for server-side debugging
        console.error("Error adding weight:", error && error.stack ? error.stack : error);
        const errMsg = error && error.message ? error.message : String(error);
        // Return the message and also a small debug hint for now
        return res.status(500).json({ message: "Internal server error", error: errMsg });
    }
};
export const getweightbyid = async (req, res) => {
    const { userId } = req.params;
    try {
        const weight = await getWeightById(userId)
        if (weight) {
            res.status(200).json({ message: "Weight retrieved successfully", weight });
        } else {
            res.status(404).json({ message: "Weight plan not found" });
        }
    } catch (error) {
        console.error("Error retrieving weight:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
export const getlatestweightbyid = async (req, res) => {
    const { userId } = req.params;
    try {
        const weight = await getLatestWeightById(userId)
        if (weight) {
            res.status(200).json({ message: "Weight retrieved successfully", weight });
        } else {
            res.status(404).json({ message: "Weight  not found" });
        }
    } catch (error) {
        console.error("Error retrieving weight:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
export const addfeedback = async (req, res) => {
    try {
        const feedback = await addFeedback(req.body);
        if (feedback) {
            res.status(200).json({ message: "feedback add successfully", feedback });
        }
    } catch (error) {
        console.error("Error adding feedback:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
export const getMySessions = async(req,res)=>{
    const {customerId} = req.params;
    try{
        const sessions = await getUserSessions(customerId);
        console.log("Sessions:", sessions);
        if(sessions){
            res.status(200).json({message:"Sessions retrieved successfully",sessions});
        }else{
            res.status(200).json({message:"No sessions found"});
        }
    }catch(error){
        console.error("Error retrieving sessions:", error);
        res.status(500).json({message:"Internal server error",error:error.message});
    }
};

export const addreport = async (req, res) => {
    try {
        const report = await addReport(req.body);
        if (report) {
            res.status(200).json({ message: "Report added successfully", report });
        }
    } catch (error) {
        console.error("Error adding report:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

export const getuserbycustomerid = async(req,res)=>{
    try{
        const {customerId} = req.params;
        const customer = await getUserByCustomerId(customerId)
        if(customer){
            res.status(200).json({message:"User retrieved successfully",customer});
        }else{
            res.status(404).json({message:"User not found",customer:null});
        }   
    }catch(error){
        console.error("Error retrieving user:", error);
        res.status(500).json({message:"Internal server error",error:error.message});
    }
}
