import { supabase } from '../database/supabase.js';

/*export async function createUser(userData) {
  const { data, error } = await supabase
    .from('customer')
    .insert([userData])
    .select(); 

  if (error) {
    throw new Error(error.message);
  }

  return data[0]; // Return first inserted row
}*/

export async function updateUserDetails(userId, userData) {
  const { data, error } = await supabase
    .from('customer')
    .update(userData)
    .eq('customer_id', userId)
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
          .eq('customer_id', userId)
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
    .eq('customer_id', userId);

  if (error) {
    throw new Error(error.message);
  }

  return data; // Array of all weight entries
}
