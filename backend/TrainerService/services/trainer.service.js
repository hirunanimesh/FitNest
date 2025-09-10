
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
  .update({ customer_id: customerId, booked: true })
  .eq('session_id', sessionId)
  .select()
  .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;

}
 


