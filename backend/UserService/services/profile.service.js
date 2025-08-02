import { supabase } from '../database/supabase.js';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

class ProfileService {
  
  /**
   * Get user profile by user ID
   * @param {string} userId - Supabase auth user ID
   * @returns {Object} User profile data
   */
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('customer')
        .select(`
          customer_id,
          user_id,
          first_name,
          last_name,
          address,
          contact_number,
          date_of_birth,
          gender,
          profile_image_url,
          created_at,
          updated_at
        `)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { success: false, error: 'Profile not found' };
        }
        throw error;
      }

      // Get user email from Supabase auth
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
      
      const profile = {
        ...data,
        email: authUser?.user?.email || null
      };

      return { success: true, data: profile };
    } catch (error) {
      console.error('Get profile error:', error);
      return { success: false, error: 'Failed to fetch user profile' };
    }
  }

  /**
   * Create new user profile
   * @param {string} userId - Supabase auth user ID
   * @param {Object} profileData - Profile information
   * @returns {Object} Created profile data
   */
  async createUserProfile(userId, profileData) {
    try {
      const { 
        first_name, 
        last_name, 
        address, 
        contact_number, 
        date_of_birth, 
        gender 
      } = profileData;

      const { data, error } = await supabase
        .from('customer')
        .insert({
          user_id: userId,
          first_name,
          last_name,
          address,
          contact_number,
          date_of_birth,
          gender,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (error) {
      console.error('Create profile error:', error);
      return { success: false, error: 'Failed to create user profile' };
    }
  }

  /**
   * Update user profile
   * @param {string} userId - Supabase auth user ID
   * @param {Object} updateData - Data to update
   * @returns {Object} Updated profile data
   */
  async updateUserProfile(userId, updateData) {
    try {
      const allowedFields = [
        'first_name',
        'last_name', 
        'address',
        'contact_number',
        'date_of_birth',
        'gender'
      ];

      // Filter only allowed fields
      const filteredData = {};
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          filteredData[field] = updateData[field];
        }
      });

      // Add updated timestamp
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
      console.error('Update profile error:', error);
      return { success: false, error: 'Failed to update user profile' };
    }
  }

  /**
   * Upload and update profile image
   * @param {string} userId - Supabase auth user ID
   * @param {Buffer} imageBuffer - Image file buffer
   * @param {string} fileName - Original filename
   * @returns {Object} Updated profile with new image URL
   */
  async updateProfileImage(userId, imageBuffer, fileName) {
    try {
      // Upload to Cloudinary
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

      // Update profile with new image URL
      const { data, error } = await supabase
        .from('customer')
        .update({
          profile_image_url: uploadResult.secure_url,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: {
          ...data,
          image_url: uploadResult.secure_url,
          cloudinary_public_id: uploadResult.public_id
        }
      };
    } catch (error) {
      console.error('Upload profile image error:', error);
      return { success: false, error: 'Failed to upload profile image' };
    }
  }

  /**
   * Delete profile image
   * @param {string} userId - Supabase auth user ID
   * @returns {Object} Updated profile without image
   */
  async deleteProfileImage(userId) {
    try {
      // Get current profile to get image URL
      const { data: profile } = await supabase
        .from('customer')
        .select('profile_image_url')
        .eq('user_id', userId)
        .single();

      // Delete from Cloudinary if exists
      if (profile?.profile_image_url) {
        try {
          // Extract public_id from Cloudinary URL
          const urlParts = profile.profile_image_url.split('/');
          const fileWithExt = urlParts[urlParts.length - 1];
          const publicId = `fitnest/profiles/${fileWithExt.split('.')[0]}`;
          
          await cloudinary.uploader.destroy(publicId);
        } catch (cloudinaryError) {
          console.warn('Cloudinary delete warning:', cloudinaryError.message);
        }
      }

      // Update profile to remove image URL
      const { data, error } = await supabase
        .from('customer')
        .update({
          profile_image_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (error) {
      console.error('Delete profile image error:', error);
      return { success: false, error: 'Failed to delete profile image' };
    }
  }

  /**
   * Get profile statistics
   * @param {string} userId - Supabase auth user ID
   * @returns {Object} Profile completion and stats
   */
  async getProfileStats(userId) {
    try {
      const { data, error } = await supabase
        .from('customer')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        throw error;
      }

      // Calculate profile completion percentage
      const requiredFields = ['first_name', 'last_name', 'contact_number', 'date_of_birth'];
      const optionalFields = ['address', 'gender', 'profile_image_url'];
      
      const completedRequired = requiredFields.filter(field => data[field]).length;
      const completedOptional = optionalFields.filter(field => data[field]).length;
      
      const completionPercentage = Math.round(
        ((completedRequired / requiredFields.length) * 70) + 
        ((completedOptional / optionalFields.length) * 30)
      );

      return {
        success: true,
        data: {
          completion_percentage: completionPercentage,
          completed_required: completedRequired,
          total_required: requiredFields.length,
          completed_optional: completedOptional,
          total_optional: optionalFields.length,
          has_profile_image: !!data.profile_image_url,
          member_since: data.created_at
        }
      };
    } catch (error) {
      console.error('Get profile stats error:', error);
      return { success: false, error: 'Failed to get profile statistics' };
    }
  }
}

export default new ProfileService();
