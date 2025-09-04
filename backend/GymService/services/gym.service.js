import { supabase } from '../database/supabase.js';

export async function createGym(gymData) {
  const { data, error } = await supabase
    .from('gym')
    .insert([gymData])
    .select(); 

  if (error) {
    throw new Error(error.message);
  }

  return data[0]; // Return first inserted row
}

export async function getallgyms(){
        const { data, error } = await supabase
        .from('gym')
        .select('*');
        
        if (error) {
        throw new Error(error.message);
        }
        
        return data; // Return all gyms
}

export async function getgymbyid(gymId) {
        const { data, error } = await supabase
        .from('gym')
        .select('*')
        .eq('gym_id', gymId)
        .single(); // Fetch single gym by ID

        if(!data){
                return null;
        }
        
        if (error) {
        throw new Error(error.message);
        }
        
        return data; // Return the gym data
}

export async function getgymbyuserid(userId) {
  const { data, error } = await supabase
  .from('gym')
  .select('*')
  .eq('user_id', userId)
  .single(); // Fetch single gym by ID

  if(!data){
          return null;
  }
  
  if (error) {
  throw new Error(error.message);
  }
  
  return data; // Return the gym data
}

export async function updategymdetails(gymId, gymData) {
  const { data, error } = await supabase
    .from('gym')
    .update(gymData)
    .eq('gym_id', gymId)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data[0]; // Return updated gym
}     


export async function gettotalmembercount(gymId){
  const {data,error} = await supabase.rpc('get_gym_member_count', { gym_id_param: gymId });
  if(data === null | data === 0){
    return 0;
  }
  if(error){
    throw new Error(error.message);
  }
  return data;
}

export async function getgymtrainers(gymId){
  const {data,error} = await supabase.from('trainer_requests').select(`
    *,
    trainer (*)
    `).eq("gym_id",gymId)
  if(data === null | data === 0){
    return 0
  }
  if(error){
    throw new Error(error.message)
  }
  return data;
}

export async function approvetrainer(request_id){
  const {data,error} = await supabase.from("trainer_requests")
  .update({
    approved:true,
    approved_at:Date.now
  })
  .eq("request_id",request_id)
  .select();

  return data;
}

export async function getgymtrainercount(gymId){
  const {data,error} = await supabase.rpc('get_gym_trainer_count',{gym_id_input:gymId})
  if(data === null | data === 0){
    return 0;
  }
  if(error){
    throw new Error(error.message);
  }
  return data;
}

export async function getAllGymUsersByIds(customerIds) {
  console.log("Fetching users for customer IDs:", customerIds);
  const { data, error } = await supabase
    .from('customer')
    .select('*')
    .in('id', customerIds);

  if (error) {
    throw new Error(error.message);
  }
  return data; // array of customer objects
}
