
import { supabase } from '../database/supabase.js';

export async function createTrainer(trainerData) {
  const { data, error } = await supabase
    .from('trainer')
    .insert([trainerData])
    .select(); 

  if (error) {
    throw new Error(error.message);
  }

  return data[0]; // Return first inserted row
}

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
        .eq('trainer_id', trainerId)
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
    .eq('trainer_id', trainerId)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data[0]; // Return updated trainer
}     


