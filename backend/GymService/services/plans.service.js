import { supabase } from "../database/supabase.js";

export async function addgymplan(gymPlanData) {
    const { data, error } = await supabase
      .from('Gym_plans')
      .insert([gymPlanData])
      .select();
  
    if (error) {
      throw new Error(error.message);
    }
  
    return data[0]; // Return first inserted gym plan
  }

  export async function getallgymplans() {
    const { data, error } = await supabase
      .from('Gym_plans')
      .select(`
        *,
        gym (
          gym_name,
          address,
          contact_no,
          location
        )
      `);
        
      if(!data){
        return null;
      }
    if (error) {
      throw new Error(error.message);
    }
  
    return data;
  }
  
  export async function getgymplanbygymid(gymId) {
    const { data, error } = await supabase
      .from('Gym_plans')
      .select('*')
      .eq('gym_id', gymId);

      if(!data){
        return null;
      }
    if (error) {
        throw new Error(error.message);
    }
    return data;
  }

  export async function updategymplan(gymPlanId, gymPlanData) {
    const { data, error } = await supabase
      .from('Gym_plans')
      .update(gymPlanData)
      .eq('plan_id', gymPlanId)
      .select();
  
    if (error) {
      throw new Error(error.message);
    }
  
    return data[0]; // Return updated gym plan
  }

  export async function deletegymplan(gymPlanId) {
    const { data, error } = await supabase
      .from('Gym_plans')
      .delete()
      .eq('plan_id', gymPlanId)
      .select();
  
    if (error) {
      throw new Error(error.message);
    }
  
    return data[0];
  }