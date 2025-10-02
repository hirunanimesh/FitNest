// Cloudinary upload utility
export const uploadToCloudinary = async (file, folder = 'gym-uploads') => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Cloudinary upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      url: data.secure_url,
      public_id: data.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    // Note: Deletion from client-side requires additional setup
    // For security, this should typically be done from the backend
    console.warn('Cloudinary deletion should be handled from backend for security');
    return true;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};