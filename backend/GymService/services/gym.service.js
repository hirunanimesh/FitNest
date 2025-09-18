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

export async function requestGymVerification(verificationData) {
  const { gym_id, type, status, email } = verificationData;

  // Check if a verification record already exists for this gym_id
  const { data: existingRecord, error: checkError } = await supabase
    .from('verifications')
    .select('*')
    .eq('customer_id', gym_id)
    .single();

  if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
    throw new Error(checkError.message);
  }

  if (existingRecord) {
    // Record exists, check status
    if (existingRecord.verification_state === 'Pending') {
      return { message: 'Verification request already sent. Please wait for approval.' };
    } else if (existingRecord.verification_state === 'Rejected') {
      return { message: 'Your previous verification request was rejected. Please contact support.' };
    } else if (existingRecord.verification_state === 'Approved') {
      return { message: 'Your gym is already verified.' };
    }
  }

  // No existing record, create new one
  const { data, error } = await supabase
    .from('verifications')
    .insert([{
      customer_id:gym_id,
      type,
      verification_state:status,
      email,
      created_at: new Date().toISOString()
    }])
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return { message: 'Verification request submitted successfully. You will be notified once reviewed.' };
}
