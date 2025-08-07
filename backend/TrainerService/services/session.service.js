import { supabase } from "../database/supabase.js";

export async function addsession(sessionData) {
    const { data, error } = await supabase
      .from('trainer_sessions')
      .insert([sessionData])
      .select();
  
    if (error) {
      throw new Error(error.message);
    }
  
    return data[0]; // Return first inserted session
  }

  export async function getallsessions() {
    const { data, error } = await supabase
      .from('trainer_sessions')
      .select(`*
      
        trainer (
          trainer_name,
          contact_no
        )
      `);  //foreign key ekak danna ona trainer ge name , contact_no ennna
        
      if(!data){
        return null;
      }
    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
  
  export async function getsessionbysessionid(sessionId) {
    const { data, error } = await supabase
      .from('trainer_sessions')
      .select('*')
      .eq('session_id', sessionId);

      if(!data){
        return null;
      }
    if (error) {
        throw new Error(error.message);
    }
    return data;
  }

  export async function updatesession(sessionId, sessionData) {
    const { data, error } = await supabase
      .from('trainer_sessions')
      .update(sessionData)
      .eq('session_id', sessionId)
      .select();
  
    if (error) {
      throw new Error(error.message);
    }
  
    return data[0]; // Return updated session
  }

  export async function deletesession(sessionId) {
    const { data, error } = await supabase
      .from('trainer_sessions')
      .delete()
      .eq('session_id', sessionId)
      .select();
  
    if (error) {
      throw new Error(error.message);
    }
  
    return data[0];
  }

  