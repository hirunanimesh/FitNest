//calendar
//add weight

import { getWeightById, addWeight,updateUserDetails,getUserById } from '../services/user.service.js';


/*export const addUser = async (req, res) => {
  try {
    const user = await createUser(req.body);
    if (user) {
      res.status(200).json({ message: "User created successfully", user });
    }
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};*/

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
        const weight = await addWeight(req.body);
        if (weight) {
            res.status(200).json({ message: "Weight add successfully", weight });
        }
    } catch (error) {
        console.error("Error adding weight:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
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
}



