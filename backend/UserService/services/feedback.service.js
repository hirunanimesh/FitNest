import { supabase } from '../database/supabase.js';

export async function addFeedback(feedbackData) {
    const { data, error } = await supabase
      .from('feedback')
      .insert(feedbackData)
      .select();
  
    if (error) {
      throw new Error(error.message);
    }
  
    return data[0]; // Return first inserted weight
  }