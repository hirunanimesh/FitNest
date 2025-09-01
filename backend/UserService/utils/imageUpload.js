import { v2 as cloudinary } from 'cloudinary';

/**
 * Upload image to Cloudinary
 * @param {Buffer} fileBuffer - The image file buffer
 * @param {string} folder - Cloudinary folder name (optional)
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
export const uploadImageToCloudinary = async (fileBuffer, folder = 'user-profiles') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'image',
        transformation: [
          { width: 500, height: 500, crop: 'limit' },
          { quality: 'auto:good' },
          { format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
        } else {
          resolve(result.secure_url);
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};
