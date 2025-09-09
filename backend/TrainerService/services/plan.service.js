import { supabase } from "../database/supabase.js";
export async function addplan(planData) {
    const { data, error } = await supabase
      .from('trainer_plans')
      .insert([planData])
      .select();
  
    if (error) {
      throw new Error(error.message);
    }
  
    return data[0]; // Return first inserted plan
  }

  export async function getallplans() {
    const { data, error } = await supabase
      .from('trainer_plans')
      .select(`*,
        trainer (
          trainer_name,
          contact_no
        )
      `);  //foreign key ekak danna ona trainer ge name , contact_no ennna
        
      if(!data){
        return null;
      }
    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
  
  export async function getplanbyplanid(planId) {
    const { data, error } = await supabase
      .from('trainer_plans')
      .select('*')
      .eq('id', planId);

      if(!data){
        return null;
      }
    if (error) {
        throw new Error(error.message);
    }
    return data;
  }

  export async function getallplanbytrainerid(trainerId) {
    const { data, error,count } = await supabase
      .from('trainer_plans')
      .select(
        `*,
        trainer(
          trainer_name,
          contact_no
        )`,
        { count: 'exact' }
      )
      .eq('trainer_id', trainerId);

      if(!data){
        return { plans: [], totalCount: 0 };
      }
    if (error) {
        throw new Error(error.message);
    }
    return { plans: data, totalCount: count };
  }

  export async function updateplan(planId, planData) {
    const { data, error } = await supabase
      .from('trainer_plans')
      .update(planData)
      .eq('id', planId)
      .select();
  
    if (error) {
      throw new Error(error.message);
    }
  
    return data[0]; // Return updated plan
  }

  export async function deleteplan(planId) {
    const { data, error } = await supabase
      .from('trainer_plans')
      .delete()
      .eq('id', planId)
      .select();
  
    if (error) {
      throw new Error(error.message);
    }
  
    return data[0];
  }

  