
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

export async function getallgyms(){
        const { data, error } = await supabase
        .from('gym')
        .select('*');
        
        if (error) {
        throw new Error(error.message);
        }
        
        return data; // Return all gyms
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


