//calendar
//add weight

import {  updateUseretails } from '../services/user.service.js';

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

export const updateUserDetails = async (req, res) => {
    const { userId } = req.params;
    try {
        const updatedUser = await updateUseretails(userId, req.body);
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


