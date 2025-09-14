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
      const { data, error } = await supabase.rpc('get_dashboard_stats');
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
}
