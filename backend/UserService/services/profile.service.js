import { supabase } from '../database/supabase.js';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

class ProfileService {
  // Fetch user profile details
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('customer')
        .select('customer_id, user_id, first_name, last_name, profile_image_url, created_at, updated_at')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { success: false, error: 'Profile not found' };
        }
        throw error;
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return { success: false, error: 'Failed to fetch user profile' };
    }
  }

  // Update user profile details
  async updateUserProfile(userId, updateData) {
    try {
      const allowedFields = ['first_name', 'last_name'];
      const filteredData = {};

      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          filteredData[field] = updateData[field];
        }
      });

      filteredData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('customer')
        .update(filteredData)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { success: false, error: 'Profile not found' };
        }
        throw error;
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { success: false, error: 'Failed to update user profile' };
    }
  }

  // Update profile photo
  async updateProfilePhoto(userId, imageBuffer) {
    try {
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'fitnest/profiles',
            public_id: `user_${userId}_${Date.now()}`,
            resource_type: 'image',
            format: 'jpg',
            transformation: [
              { width: 400, height: 400, crop: 'fill', gravity: 'face' },
              { quality: 'auto:good' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(imageBuffer);
      });

      const { data, error } = await supabase
        .from('customer')
        .update({
          profile_image_url: uploadResult.secure_url,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: {
          ...data,
          image_url: uploadResult.secure_url
        }
      };
    } catch (error) {
      console.error('Error updating profile photo:', error);
      return { success: false, error: 'Failed to update profile photo' };
    }
  }
}

export default new ProfileService();