import { supabase } from "../database/supabase.js";
import { uploadImage } from '../config/cloudinary.js';
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
      .select(`*,
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

  export async function getallsessionbytrainerid(trainerId) {
    const { data, error } = await supabase
      .from('trainer_sessions')
      .select(`*,
        trainer(
          trainer_name,
          contact_no
        )
      `)
      .eq('trainer_id', trainerId);

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

  export async function uploadSessionImage(fileBuffer, userId) {
  try {
    // Upload image to Cloudinary
    const cloudinaryResult = await uploadImage(
      fileBuffer,
      "fitnest/profile-updates",
      `profile_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    );
    
    return {
      success: true,
      imageUrl: cloudinaryResult.secure_url,
      publicId: cloudinaryResult.public_id
    };
  } catch (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }
}
export async function getallplansbytrainerid(trainerId) {
    const { data, error } = await supabase
      .from('trainer_plan')
      .select(`*,
        trainer(
          trainer_name,
          contact_no
        )
      `)
      .eq('trainer_id', trainerId);

      if(!data){
        return null;
      }
    if (error) {
        throw new Error(error.message);
    }
    return data;
  }

  export async function updateplan(planId, planData) {
    const { data, error } = await supabase
      .from('trainer_plan')
      .update(planData)
      .eq('id', planId)
      .select();
  
    if (error) {
      throw new Error(error.message);
    }
  
    return data[0]; // Return updated plan
  }

  export async function deleteplan(planId) {
    const { data, error } = await supabase
      .from('trainer_plan')
      .delete()
      .eq('id', planId)
      .select();
  
    if (error) {
      throw new Error(error.message);
    }
  
    return data[0];
  }
