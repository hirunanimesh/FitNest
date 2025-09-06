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
      .insert(weightData)
      .select();
  
    if (error) {
      throw new Error(error.message);
    }
  
    return data[0]; // Return first inserted weight
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
    .order('created_at', { ascending: false })
    .limit(1); // Get the latest weight entry

  if (error) {
    throw new Error(error.message);
  }

  return data[0]; // Array of all weight entries
}

