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
}
