import { supabase } from "../database/supabase.js";
import dotenv from "dotenv";

dotenv.config();

export default class AdminService {
  static async getMemberGrowthStats() {
    try {
    console.log('In getMemberGrowthStats service method');
      const { data, error } = await supabase.rpc('get_user_growth');
      console.log("data",data)

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error("Error in getMemberGrowthStats service:", error);
      throw new Error("Failed to retrieve member growth stats");
    }
  }

  static async getDashboardStats() {
    try {
      const { data, error } = await supabase.rpc('get_admin_dashboard_stats_array');
      console.log("data",data)

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error("Error in getDashboardStats service:", error);
      throw new Error("Failed to retrieve dashboard stats");
    }
  }

  static async getTrainerVerifications() {
    try{
      const {data , error} = await supabase.rpc('get_trainer_verifications');
      if(error){
        throw new Error(`Supabase error: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error("Error in getTrainerVerifications service:", error);
      throw new Error("Failed to retrieve trainer verifications");
    }
  }

  static async getGymVerifications() {
    try{
      const {data , error} = await supabase.rpc('get_gym_verifications');
      if(error){
        throw new Error(`Supabase error: ${error.message}`);
      }
      return data;
    } catch (error) {
      console.error("Error in getGymVerifications service:", error);
      throw new Error("Failed to retrieve gym verifications");
    }
}
  static async handleVerificationState(id, state, type, entityId) {
    try{
      // Update the verification state in the verifications table
      const {data , error} = await supabase.from('verifications').update({verification_state: state}).eq('id', id).select();
      if (error){
        throw new Error(`Supabase error: ${error.message}`);
      }

      // If approved, update the verified column in the appropriate table using entityId
      if (state === 'Approved') {
        if (type === 'gym') {
          // Update the gym table's verified column to true using gym_id
          const { data: gymData, error: gymError } = await supabase
            .from('gym')
            .update({ verified: true })
            .eq('gym_id', entityId) // Use the gym_id from the verification response
            .select();
          
          if (gymError) {
            console.error('Error updating gym verified status:', gymError);
            // Note: We don't throw here to avoid breaking the main verification update
          } else {
            console.log('Successfully updated gym verified status:', gymData);
          }
        } else if (type === 'trainer') {
          // Update the trainer table's verified column to true using trainer_id
          const { data: trainerData, error: trainerError } = await supabase
            .from('trainer')
            .update({ verified: true })
            .eq('id', entityId) // Use the trainer_id from the verification response
            .select();
          
          if (trainerError) {
            console.error('Error updating trainer verified status:', trainerError);
            // Note: We don't throw here to avoid breaking the main verification update
          } else {
            console.log('Successfully updated trainer verified status:', trainerData);
          }
        }
      }
      // If rejected, we don't update the verified column (keep existing behavior)

      return data;
    }catch (error) {
      console.error("Error in handleVerificationState service:", error);
      throw new Error("Failed to update verification state");
    }
  }

  static async  getUserInquiries() {
      const { data, error } = await supabase
        .from('Reports')
        .select(`*`);  
          
        if(!data){
          return null;
        }
      if (error) {
        throw new Error(error.message);
      }
  
      return data;
    }

    static async BannedUsers(banned_data) {
  // only pick the fields that exist in the "banned" table
  const bannedInsert = {
    user_id: banned_data.user_id,
    reason: banned_data.reason,
    type: banned_data.type
  }

  // 1️⃣ Insert into banned table
  const { data, error } = await supabase
    .from('banned')
    .insert(bannedInsert)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  // 2️⃣ Update trainer or gym table (optional, e.g., mark verified false)
  if (banned_data.type === 'trainer') {
    const { error: trainerError } = await supabase
      .from('trainer')
      .update({ verified: false })  
      .eq('user_id', banned_data.user_id);

    if (trainerError) {
      console.error('Error updating trainer banned state:', trainerError);
    }
  } else if (banned_data.type === 'gym') {
    const { error: gymError } = await supabase
      .from('gym')
      .update({ verified: false })  
      .eq('user_id', banned_data.user_id);

    if (gymError) {
      console.error('Error updating gym banned state:', gymError);
    }
  }

  // 3️⃣ Update the Reports table for this inquiry (use inquiryId separately)
  if (banned_data.inquiryId) {
    const { error: reportError } = await supabase
      .from('Reports')
      .update({ banned: true, status: 'resolved' })
      .eq('id', Number(banned_data.inquiryId));

    if (reportError) {
      console.error('Error updating report banned state:', reportError);
    }
  }

  return data[0]; 
}


  static async  updateUserInquiries(inquiryId, status) {
      const { data, error } = await supabase
        .from('Reports')
        .update(status)
        .eq('id', inquiryId)
        .select();
    
      if (error) {
        throw new Error(error.message);
      }
    
      return data[0]; 
    }
}
