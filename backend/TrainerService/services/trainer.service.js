
import { supabase } from '../database/supabase.js';

export async function getalltrainers(page = 1, limit = 12, search = ''){
        let query = supabase
        .from('trainer')
        .select('*', { count: 'exact' });

        // Add search filter
        if (search) {
          query = query.ilike('trainer_name', `%${search}%`);
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

export async function gettrainerbyid(trainerId) {
        const { data, error } = await supabase
        .from('trainer')
        .select('*')
        .eq('id', trainerId)
        .single(); // Fetch single trainer by ID

        if(!data){
          return null;
        }
        
        if (error) {
        throw new Error(error.message);
        }
        
        return data; // Return the trainer data
}
export async function getgymplanbytrainerid(trainerId) {
  const { data, error } = await supabase
    .from("gym_plan_trainers")
    .select(`
      id,
      trainer_id,
      gym_plan_id,
      Gym_plans (*)
    `)
    .eq("trainer_id", trainerId);

  if (error) throw new Error(error.message);

  if (!data || data.length === 0) return null;

  return data.map((row) => row.Gym_plans);
}
export async function getmembershipGyms(trainerId) {
  // Validate input to avoid passing undefined to Supabase bigint filters
  if (trainerId === undefined || trainerId === null) {
    throw new Error('trainerId is required');
  }
  const id = Number(trainerId);
  if (Number.isNaN(id)) {
    throw new Error('trainerId must be a valid number');
  }

  const { data, error } = await supabase
    .from('trainer_requests')
    .select('*')
    .eq('trainer_id', id);

  if (error) throw new Error(error.message);

  return (data && data.length > 0) ? data : null;
}

export async function updatetrainerdetails(trainerId, trainerData) {
  const { data, error } = await supabase
    .from('trainer')
    .update(trainerData)
    .eq('id', trainerId)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data[0]; // Return updated trainer
}
    
export async function getfeedbackbytrainerid(trainerId) {
  const { data, error } = await supabase
    .from("feedback")
    .select(`
      *,
      customer (
        first_name,
        last_name,
        profile_img
      )
    `)
    .eq("trainer_id", trainerId);

  if (error) {
    throw new Error(error.message);
  }

  return data || null;
}

export async function booksession(sessionId, customerId) {
  const { data, error } = await supabase
  .from('trainer_sessions')
  .update({ customer_id: customerId, booked: true, lock: false })
  .eq('session_id', sessionId)
  .select()
  .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;

}

// Atomically place a hold on a session if it's not already booked
export async function holdsession(sessionId, customerId) {
  const { data, error } = await supabase
    .from('trainer_sessions')
    // place a lock only if not already locked or booked
    .update({ customer_id: customerId, lock: true })
    .eq('session_id', sessionId)
    .eq('booked', false)
    .eq('lock', false)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  // If no rows updated, someone else already booked/holding it
  if (!data || data.length === 0) {
    return null;
  }

  return data[0];
}

// Release a held session (set booked=false and clear customer)
export async function releasesession(sessionId) {
  const { data, error } = await supabase
    .from('trainer_sessions')
    // release only the lock; do not mark as booked
    .update({ customer_id: null, lock: false })
    .eq('session_id', sessionId)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data && data[0] ? data[0] : null;
}
export async function sendrequest(trainerId, gymId) {
  // First check if a record already exists
  const { data: existingRecord, error: checkError } = await supabase
    .from('trainer_requests')
    .select('*')
    .eq('trainer_id', trainerId)
    .eq('gym_id', gymId)
    .single();

  // If there's an error other than "not found", throw it
  if (checkError && checkError.code !== 'PGRST116') {
    throw new Error(checkError.message);
  }

  // If record exists, return null to indicate already sent
  if (existingRecord) {
    return null;
  }

  // No existing record, create new one
  const { data, error } = await supabase
    .from('trainer_requests')
    .insert([{ trainer_id: trainerId, gym_id: gymId, approved: false }])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  
  return data;
}

export async function requestTrainerVerification(verificationData) {
  const { trainer_id, type, status, email } = verificationData;

  // Check if a verification record already exists for this trainer_id
  const { data: existingRecord, error: checkError } = await supabase
    .from('verifications')
    .select('*')
    .eq('customer_id', trainer_id)
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
      return { message: 'Your trainer profile is already verified.' };
    }
  }

  // No existing record, create new one
  const { data, error } = await supabase
    .from('verifications')
    .insert([{
      customer_id:trainer_id,
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





