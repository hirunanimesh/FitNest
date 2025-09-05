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

export async function getallgyms(page = 1, limit = 12, search = '', location = ''){
        let query = supabase
        .from('gym')
        .select('*', { count: 'exact' });

        // Add search filters
        if (search) {
          query = query.ilike('gym_name', `%${search}%`);
        }

        if (location) {
          query = query.or(`address.ilike.%${location}%,location.ilike.%${location}%`);
        }

        // Add pagination
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        
        query = query.range(from, to);
        
        const { data, error, count } = await query;
        
        if (error) {
        throw new Error(error.message);
        }
        
        return {
          data,
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
          hasNext: page * limit < count,
          hasPrev: page > 1
        };
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
