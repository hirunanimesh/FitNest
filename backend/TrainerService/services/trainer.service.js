
import { supabase } from '../database/supabase.js';

export async function getalltrainers(){
        const { data, error } = await supabase
        .from('trainer')
        .select('*');
        
        if (error) {
        throw new Error(error.message);
        }
        
        return data; // Return all trainers
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


