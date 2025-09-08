import { supabase } from "../database/supabase.js";

export async function addgymplan(gymPlanData) {

  const { trainers, plan_id, ...planDataWithoutTrainers } = gymPlanData
  console.log(planDataWithoutTrainers)
    const { data, error } = await supabase
      .from('Gym_plans')
      .insert([planDataWithoutTrainers])
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

  export async function getgymplanbyplanid(planId){
    const { data, error } = await supabase
      .from('Gym_plans')
      .select('*')
      .eq('plan_id', planId)
      .single();

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

    const {trainers, ...planDataWithoutTrainers} = gymPlanData
    const { data, error } = await supabase
      .from('Gym_plans')
      .update(planDataWithoutTrainers)
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

  export async function getplanmembercount(plan_id){
    const {data , error} = await supabase.rpc('member_count_per_plan', { plan_id_param: plan_id });
    console.log("Data:", data);
    if(data === null || data === 0){
      return 0;
    }

    if (error) {
      throw new Error(error.message);
    }
    return data[0].total_members;
  }

  export async function assigntrainerstoplan(planId, trainerIds) {
  try {
    // First, delete existing assignments for this plan
    const { error: deleteError } = await supabase
      .from('gym_plan_trainers')
      .delete()
      .eq('gym_plan_id', planId);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    // Then insert new assignments
    if (trainerIds && trainerIds.length > 0) {
      const assignments = trainerIds.map(trainerId => ({
        gym_plan_id: planId,
        trainer_id: parseInt(trainerId)
      }));

      const { data, error } = await supabase
        .from('gym_plan_trainers')
        .insert(assignments)
        .select();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    }

    return [];
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getplantrainers(planId) {
  const { data, error } = await supabase
    .from('gym_plan_trainers')
    .select(`
      trainer_id,
      trainer:trainer_id (
        id,
        trainer_name,
        rating,
        years_of_experience,
        profile_img,
        verified
      )
    `)
    .eq('gym_plan_id', planId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateplantrainers(planId, trainerIds) {
  return await assigntrainerstoplan(planId, trainerIds);
}

export const getOneDayGyms = async () => {
    try {
        const gyms = await supabase
            .from('Gym_plans')
            .select(`
                *,
                gym (
                    location,
                    gym_id,
                    profile_img
                )
            `)
            .eq('duration', '1 day');
        return gyms;
    } catch (error) {
        console.error("Error retrieving one day gyms:", error);
        throw error;
    }
};

//get gyms which are not providing one day plans
export const getOtherGyms = async () => {
    try {
        const gyms = await supabase
            .from('Gym_plans')
            .select(`
                *,
                gym (
                    location,
                    gym_id,
                    profile_img
                )
            `)
            .neq('duration', '1 day');
        return gyms;
    } catch (error) {
        console.error("Error retrieving other gyms:", error);
        throw error;
    }
};

export const getgymplandetails = async (planIds) => {
  try {
    const { data, error } = await supabase
      .from('Gym_plans')
      .select(`
        plan_id,
        title,
        price,
        duration,
        description,
        gym_plan_trainers (
          trainer:trainer_id (
            id,
            trainer_name,
            profile_img,
            trainer_plans (
              id,
              title,
              description,
              img_url,
              instruction_pdf,
              category
            )
          )
        )
      `)
      .in('plan_id', planIds);

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Error fetching gym plan details:", err.message);
    return [];
  }
};



