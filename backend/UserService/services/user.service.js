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


export async function addWeight(weightData) {
  const { data, error } = await supabase
    .from('customer_progress')
    .upsert(weightData, { onConflict: ['customer_id', 'date'] }) // replaces if already exists for same day
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data[0]; // Return the updated or newly inserted record
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