import { v2 as cloudinary } from 'cloudinary';

// Check if Cloudinary credentials are properly set
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret || 
    cloudName === 'your_cloud_name_here' || 
    apiKey === 'your_api_key_here' || 
    apiSecret === 'your_api_secret_here') {
  console.warn('⚠️  Cloudinary credentials not properly configured. Please update your .env file with actual Cloudinary credentials.');
  console.warn('   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are required.');
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

/**
 * Upload image to Cloudinary
 * @param {Buffer} fileBuffer - The image file buffer
 * @param {string} folder - The folder name in Cloudinary (optional)
 * @param {string} publicId - Custom public ID (optional)
 * @returns {Promise<Object>} - Cloudinary upload response
 */
export const uploadImage = async (fileBuffer, folder = 'fitnest/customers', publicId = null) => {
  try {
    return new Promise((resolve, reject) => {
      const uploadOptions = {
        folder: folder,
        resource_type: 'image',
        transformation: [
          {
            width: 400,
            height: 400,
            crop: 'fill',
            gravity: 'face'
          },
          {
            quality: 'auto',
            format: 'webp'
          }
        ]
      };

      if (publicId) {
        uploadOptions.public_id = publicId;
      }

      cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(fileBuffer);
    });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - The public ID of the image to delete
 * @returns {Promise<Object>} - Cloudinary delete response
 */
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

export { cloudinary };
