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
<<<<<<< Updated upstream
    const { data, error } = await supabase
      .from('customer_progress')
      .insert(weightData)
      .select();
  
    if (error) {
      throw new Error(error.message);
    }
  
    return data[0]; // Return first inserted weight
=======
    const { customer_id, date } = weightData;
    console.log('addWeight service - input:', { customer_id, date, keys: Object.keys(weightData) });

    // Look for an existing entry for the same customer and date
    // The primary key for this table is `record_id` (not `id`) per DB schema
    const { data: existing, error: fetchError } = await supabase
      .from('customer_progress')
      .select('record_id')
      .eq('customer_id', customer_id)
      .eq('date', date)
      .maybeSingle();

    if (fetchError) {
      const msg = `Supabase fetch error checking existing customer_progress for customer_id=${customer_id} date=${date}: ${fetchError.message}`;
      console.error('addWeight service - fetchError:', fetchError);
      throw new Error(msg);
    }

    let result;
    if (existing) {
      console.log('addWeight service - existing record found:', existing);
      // Update existing record (only update weight/height/BMI/date fields provided in weightData)
      const { data, error } = await supabase
        .from('customer_progress')
        .update(weightData)
        .eq('record_id', existing.record_id)
        .select();

      if (error) {
        const msg = `Supabase update error for record_id=${existing.record_id}: ${error.message}`;
        console.error('addWeight service - update error:', error);
        throw new Error(msg);
      }

      result = data[0];
      console.log('addWeight service - updated result:', result);
    } else {
      console.log('addWeight service - no existing record, inserting new');
      // Insert new record
      const { data, error } = await supabase
        .from('customer_progress')
        .insert(weightData)
        .select();

      if (error) {
        const msg = `Supabase insert error for customer_id=${customer_id} date=${date}: ${error.message}`;
        console.error('addWeight service - insert error:', error);
        throw new Error(msg);
      }

      result = data[0];
      console.log('addWeight service - inserted result:', result);
    }

    return result;
>>>>>>> Stashed changes
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