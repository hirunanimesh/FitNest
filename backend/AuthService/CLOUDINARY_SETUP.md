# Cloudinary Integration for FitNest

This document explains how to set up Cloudinary for image upload functionality in the FitNest application.

## What's Implemented

### Backend Changes (AuthService)
1. **Cloudinary Configuration** (`config/cloudinary.js`)
   - Image upload with automatic resizing (400x400)
   - WebP format conversion for better performance
   - Face-focused cropping for profile pictures
   - Organized storage in folders

2. **Multer Configuration** (`config/multer.js`)
   - Memory storage for handling file uploads
   - Image file validation
   - 10MB file size limit

3. **Updated AuthController**
   - Handles image upload to Cloudinary
   - Stores image URL in database instead of file
   - Graceful error handling (registration continues even if image upload fails)

4. **Updated Routes**
   - Added multer middleware to handle `multipart/form-data`
   - Single file upload with field name `profileImage`

### Frontend Changes
1. **Updated API Function**
   - Handles FormData for file uploads
   - Sets proper Content-Type headers

2. **Updated Registration Form**
   - Sends all data as FormData (including image)
   - Simplified form submission logic

## Setup Instructions

### 1. Create Cloudinary Account
1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Get your credentials from the dashboard

### 2. Configure Environment Variables
Add these to your `.env` file in the AuthService directory:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

Replace the placeholder values with your actual Cloudinary credentials.

### 3. Database Schema
Make sure your `customer` table has these columns:
```sql
-- profile_img should store URL (TEXT/VARCHAR)
profile_img TEXT,
weight INTEGER,
height INTEGER,
location TEXT
```

## How It Works

1. **User uploads image** → Frontend stores file in state
2. **Form submission** → All data (including image) sent as FormData
3. **Backend receives request** → Multer processes the image file
4. **Image upload** → Cloudinary processes and stores the image
5. **URL storage** → Cloudinary URL saved to database
6. **Response** → Success response with image URL

## Image Processing Features

- **Automatic resizing**: 400x400 pixels
- **Face detection**: Crops focusing on faces for profile pictures
- **Format optimization**: Converts to WebP for better performance
- **Quality optimization**: Automatic quality adjustment
- **Organized storage**: Images stored in `fitnest/customers/` folder

## Error Handling

- If image upload fails, user registration still continues
- Validation ensures only image files are accepted
- File size limit prevents oversized uploads
- Graceful fallback when no image is provided

## Testing

1. Start the AuthService with the new environment variables
2. Use the registration form to upload a profile picture
3. Check the database for the Cloudinary URL
4. Verify the image appears in your Cloudinary dashboard

## Troubleshooting

### Common Issues:
1. **401 Unauthorized**: Check your Cloudinary credentials
2. **File too large**: Reduce image size or increase multer limit
3. **Invalid file type**: Ensure you're uploading image files only
4. **Network errors**: Check Cloudinary connectivity

### Debug Steps:
1. Check browser network tab for upload errors
2. Review server logs for Cloudinary errors
3. Verify environment variables are loaded
4. Test Cloudinary connection with a simple upload

## Benefits

1. **Scalability**: Cloudinary handles image storage and delivery
2. **Performance**: Automatic optimization and CDN delivery
3. **Storage**: No need to store files on your server
4. **Flexibility**: Easy to add transformations and effects
5. **Reliability**: Cloudinary's robust infrastructure
