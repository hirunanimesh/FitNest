# UserService Profile Image Upload Implementation

This document explains how profile image upload has been implemented in the UserService following the same approach as AuthService.

## Implementation Overview

### 1. Dependencies Added
- `cloudinary`: For cloud image storage and processing
- `multer`: For handling multipart form data (file uploads)

### 2. Files Modified/Created

#### New Files:
- `config/cloudinary.js`: Cloudinary configuration and upload functions

#### Modified Files:
- `config/multer.js`: Updated to use ES modules
- `index.js`: Added multer middleware for the update endpoint
- `controllers/user.controller.js`: Added image upload handling
- `services/user.service.js`: Enhanced field mapping and database operations

### 3. API Endpoint

**PATCH** `/updateuserdetails/:userId`

#### Request Types Supported:
1. **JSON Data Only**: Regular profile updates without image
2. **FormData with File**: Profile updates including new profile image

#### FormData Fields:
- `profileImage`: Image file (optional)
- Other profile fields: `firstName`, `lastName`, `phone`, `address`, `dateOfBirth`, `gender`, etc.

### 4. Image Processing

When an image is uploaded:
1. **Validation**: Only image files are accepted (checked by multer)
2. **Upload to Cloudinary**: 
   - Resized to 400x400 pixels
   - Optimized quality
   - Converted to WebP format
   - Face detection for cropping
3. **Storage**: The secure URL from Cloudinary is stored in database
4. **Database Field**: Stored in `profile_image_url` column

### 5. Field Mapping

The service handles multiple field name formats from frontend:
- `firstName` → `first_name`
- `lastName` → `last_name`
- `phone`/`phone_no` → `contact_number`
- `dateOfBirth`/`birthday` → `date_of_birth`
- `profile_img`/`avatar` → `profile_image_url`

### 6. Environment Variables Required

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 7. Response Format

```json
{
  "success": true,
  "message": "User updated successfully",
  "user": {
    "customer_id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "profile_image_url": "https://res.cloudinary.com/...",
    // ... other fields
  },
  "profileImageUrl": "https://res.cloudinary.com/..." // if image was uploaded
}
```

### 8. Error Handling

- **File upload errors**: Returns 500 with specific error message
- **Database errors**: Returns 500 with database error details
- **User not found**: Returns 404
- **No valid fields**: Returns error if no updatable fields provided

### 9. Usage Examples

#### Frontend JavaScript (FormData with Image):
```javascript
const formData = new FormData();
formData.append('firstName', 'John');
formData.append('lastName', 'Doe');
formData.append('profileImage', imageFile);

const response = await fetch('/api/user/updateuserdetails/123', {
  method: 'PATCH',
  body: formData
});
```

#### Frontend JavaScript (JSON Data Only):
```javascript
const response = await fetch('/api/user/updateuserdetails/123', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1234567890'
  })
});
```

### 10. Database Schema

The customer table includes:
```sql
profile_image_url TEXT -- Stores Cloudinary URL
```

This implementation ensures consistent image handling across the application and provides a scalable solution for profile image management.
