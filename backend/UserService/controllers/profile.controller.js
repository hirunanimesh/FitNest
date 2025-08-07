import profileService from '../services/profile.service.js';
import multer from 'multer';
import path from 'path';

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
    }
  }
});

class ProfileController {

  /**
   * Get user profile
   * GET /api/users/profile
   */
  async getProfile(req, res) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized - User ID not found'
        });
      }

      const result = await profileService.getUserProfile(userId);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data
        });
      } else {
        // If profile doesn't exist, return empty profile structure
        if (result.error === 'Profile not found') {
          res.status(200).json({
            success: true,
            data: null,
            message: 'Profile not found. Please create your profile.'
          });
        } else {
          res.status(500).json({
            success: false,
            error: result.error
          });
        }
      }
    } catch (error) {
      console.error('Get profile controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Create user profile
   * POST /api/users/profile
   */
  async createProfile(req, res) {
    try {
      const userId = req.user?.id;
      const profileData = req.body;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized - User ID not found'
        });
      }

      // Validate required fields
      const requiredFields = ['first_name', 'last_name'];
      const missingFields = requiredFields.filter(field => !profileData[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`
        });
      }

      // Validate data formats
      if (profileData.contact_number && !/^\+?[\d\s\-\(\)]{10,15}$/.test(profileData.contact_number)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid contact number format'
        });
      }

      if (profileData.date_of_birth && !/^\d{4}-\d{2}-\d{2}$/.test(profileData.date_of_birth)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid date format. Use YYYY-MM-DD'
        });
      }

      if (profileData.gender && !['male', 'female', 'other'].includes(profileData.gender)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid gender. Must be male, female, or other'
        });
      }

      const result = await profileService.createUserProfile(userId, profileData);
      
      if (result.success) {
        res.status(201).json({
          success: true,
          data: result.data,
          message: 'Profile created successfully'
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Create profile controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Update user profile
   * PUT /api/users/profile
   */
  async updateProfile(req, res) {
    try {
      const userId = req.user?.id;
      const updateData = req.body;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized - User ID not found'
        });
      }

      // Validate data formats if provided
      if (updateData.contact_number && !/^\+?[\d\s\-\(\)]{10,15}$/.test(updateData.contact_number)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid contact number format'
        });
      }

      if (updateData.date_of_birth && !/^\d{4}-\d{2}-\d{2}$/.test(updateData.date_of_birth)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid date format. Use YYYY-MM-DD'
        });
      }

      if (updateData.gender && !['male', 'female', 'other'].includes(updateData.gender)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid gender. Must be male, female, or other'
        });
      }

      const result = await profileService.updateUserProfile(userId, updateData);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: 'Profile updated successfully'
        });
      } else {
        if (result.error === 'Profile not found') {
          res.status(404).json({
            success: false,
            error: 'Profile not found. Please create your profile first.'
          });
        } else {
          res.status(500).json({
            success: false,
            error: result.error
          });
        }
      }
    } catch (error) {
      console.error('Update profile controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Upload profile image
   * POST /api/users/profile/image
   */
  async uploadProfileImage(req, res) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized - User ID not found'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No image file provided'
        });
      }

      const result = await profileService.updateProfileImage(
        userId, 
        req.file.buffer, 
        req.file.originalname
      );
      
      if (result.success) {
        res.status(200).json({
          success: true,
          data: {
            profile_image_url: result.data.image_url,
            message: 'Profile image updated successfully'
          }
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Upload profile image controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Delete profile image
   * DELETE /api/users/profile/image
   */
  async deleteProfileImage(req, res) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized - User ID not found'
        });
      }

      const result = await profileService.deleteProfileImage(userId);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Profile image deleted successfully'
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Delete profile image controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get profile statistics
   * GET /api/users/profile/stats
   */
  async getProfileStats(req, res) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized - User ID not found'
        });
      }

      const result = await profileService.getProfileStats(userId);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Get profile stats controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}

// Export controller instance and multer upload middleware
const profileController = new ProfileController();

export const getProfile = profileController.getProfile.bind(profileController);
export const createProfile = profileController.createProfile.bind(profileController);
export const updateProfile = profileController.updateProfile.bind(profileController);
export const getProfileStats = profileController.getProfileStats.bind(profileController);

// Multer middleware for image upload
export const uploadProfileImage = [
  upload.single('profileImage'),
  profileController.uploadProfileImage.bind(profileController)
];

export const deleteProfileImage = profileController.deleteProfileImage.bind(profileController);

export default profileController;
