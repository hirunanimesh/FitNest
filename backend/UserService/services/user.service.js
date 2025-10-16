import { supabase } from '../database/supabase.js';

export async function updateUserDetails(userId, userData) {
  const { data, error } = await supabase
    .from('customer')
    .update(userData)
    .eq('id', userId)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data[0]; // Return updated customer
}

export async function getUserByCustomerId(customerId) {
  const { data, error } = await supabase
    .from('customer')
    .select('*')
    .eq('id', customerId)
    .single(); 
    if(!data){
      return null;
    }
  if (error) {
    throw new Error(error.message);
  }
  return data; 
}

export async function addWeight(weightData) {
  const { customer_id, date } = weightData;

  // Check if a record already exists for this customer on this date
  const { data: existing, error: fetchError } = await supabase
    .from('customer_progress')
    .select('id')
    .eq('customer_id', customer_id)
    .eq('date', date)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') { // ignore "no rows found" error
    throw new Error(fetchError.message);
  }

  let result, error;

  if (existing) {
    // Update existing record
    ({ data: result, error } = await supabase
      .from('customer_progress')
      .update(weightData)
      .eq('id', existing.id)
      .select());
  } else {
    // Insert new record
    ({ data: result, error } = await supabase
      .from('customer_progress')
      .insert(weightData)
      .select());
  }

  if (error) {
    throw new Error(error.message);
  }

  return result[0];
}


  export async function getUserById(userId) {
          const { data, error } = await supabase
          .from('customer')
          .select('*')
          .eq('id', userId)
          .single(); // Fetch single user by ID
  
          if(!data){
                  return null;
          }
          
          if (error) {
          throw new Error(error.message);
          }
          
          return data; // Return the user data
  }
  export async function getWeightById(userId) {
  const { data, error } = await supabase
    .from('customer_progress')
    .select('*')
    .eq('customer_id', userId)
    .order('date', { decending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data; // Array of all weight entries
}
export async function getLatestWeightById(userId) {
  const { data, error } = await supabase
    .from('customer_progress')
    .select('height,weight')
    .eq('customer_id', userId)
    .order('date', { ascending: false })
    .limit(1); // Get the latest weight entry

  if (error) {
    throw new Error(error.message);
  }

  return data[0]; // Array of all weight entries
}

export async function getUserSessions(customerId){
  const {data,error} = await supabase
  .from('trainer_sessions')
  .select(`*,trainer(
    trainer_name,
    profile_img
    )`)
  .eq('customer_id',customerId)
  .eq('booked',true)
  .order('date',{ascending:false});

  if(error){
    throw new Error(error.message);
  }
  return data;
};

export async function addReport(reportData) {
    const { data, error } = await supabase
      .from('Reports')
      .insert(reportData)
      .select();
  
    if (error) {
      throw new Error(error.message);
    }
  
    return data[0]; 
  }