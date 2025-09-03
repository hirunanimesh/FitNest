import {getLatestWeightById,getWeightById, addWeight,updateUserDetails,getUserById } from '../services/user.service.js';
import{addFeedback} from  '../services/feedback.service.js';
import { uploadImage } from '../config/cloudinary.js';

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
/*export const addEventToCalendarController = async (req, res) => {
    try {
        const { userId, event } = req.body;
        if (!userId || !event) {
            return res.status(400).json({ message: "Missing userId or event data" });
        }
        const result = await addEventToCalendar(userId, event);
        if (result && result.success) {
            res.status(200).json({ message: "Event added to calendar successfully", eventId: result.eventId });
        } else {
            res.status(500).json({ message: "Failed to add event to calendar", error: result?.error });
        }
    } catch (error) {
        console.error("Error adding event to calendar:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};*/
export const uploadProfileImage = async (req, res) => {
    try {
      console.log("Profile image upload request received");
      console.log("Request file:", req.file);

      // Check if a file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image file provided",
        });
      }

      let profileImageUrl = null;

      try {
        // Upload image to Cloudinary
        const cloudinaryResult = await uploadImage(
          req.file.buffer,
          "fitnest/profile-updates",
          `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        );
        profileImageUrl = cloudinaryResult.secure_url;
        console.log(
          "Profile image uploaded successfully to Cloudinary:",
          profileImageUrl
        );
      } catch (uploadError) {
        console.error("Error uploading image to Cloudinary:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload image to cloud storage",
          error: uploadError.message,
        });
      }

      res.status(200).json({
        success: true,
        message: "Image uploaded successfully",
        imageUrl: profileImageUrl,
        url: profileImageUrl, // Alternative field name for compatibility
        secure_url: profileImageUrl, // Another alternative field name
      });
    } catch (error) {
      console.error("[User Service] Error during image upload:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload image",
        error: error.message,
      });
    }
  }



