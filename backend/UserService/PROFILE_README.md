# Profile Management API Documentation

## Overview
The Profile Management system allows users to create, view, update their personal information and manage their profile photos. This includes changing names, contact details, and uploading/managing profile images.

## Features

### 1. **Profile Information Management**
- Create new user profile
- View complete profile details
- Update personal information (name, contact, address, etc.)
- Profile completion tracking

### 2. **Profile Photo Management**
- Upload profile images (JPEG, PNG, GIF, WebP)
- Automatic image optimization and resizing
- Cloud storage with Cloudinary
- Delete profile images

### 3. **Profile Statistics**
- Profile completion percentage
- Required vs optional field tracking
- Member since information

## API Endpoints

### Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer <your-jwt-token>
```

### Profile Information

#### Get User Profile
```http
GET /api/users/profile
```

**Response:**
```json
{
  "success": true,
  "data": {
    "customer_id": 1,
    "user_id": "uuid",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "address": "123 Main St",
    "contact_number": "+1234567890",
    "date_of_birth": "1990-01-01",
    "gender": "male",
    "profile_image_url": "https://cloudinary.com/image.jpg",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  }
}
```

#### Create User Profile
```http
POST /api/users/profile
Content-Type: application/json
```

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "address": "123 Main St",
  "contact_number": "+1234567890",
  "date_of_birth": "1990-01-01",
  "gender": "male"
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* created profile data */ },
  "message": "Profile created successfully"
}
```

#### Update User Profile
```http
PUT /api/users/profile
Content-Type: application/json
```

**Request Body:**
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "contact_number": "+0987654321",
  "address": "456 Oak Ave"
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* updated profile data */ },
  "message": "Profile updated successfully"
}
```

### Profile Photo Management

#### Upload Profile Image
```http
POST /api/users/profile/image
Content-Type: multipart/form-data
```

**Form Data:**
- `profileImage`: Image file (max 5MB)

**Supported formats:** JPEG, PNG, GIF, WebP

**Response:**
```json
{
  "success": true,
  "data": {
    "profile_image_url": "https://cloudinary.com/optimized-image.jpg",
    "message": "Profile image updated successfully"
  }
}
```

#### Delete Profile Image
```http
DELETE /api/users/profile/image
```

**Response:**
```json
{
  "success": true,
  "message": "Profile image deleted successfully"
}
```

### Profile Statistics

#### Get Profile Stats
```http
GET /api/users/profile/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "completion_percentage": 85,
    "completed_required": 4,
    "total_required": 4,
    "completed_optional": 2,
    "total_optional": 3,
    "has_profile_image": true,
    "member_since": "2025-01-01T00:00:00Z"
  }
}
```

## Data Validation

### Required Fields
- `first_name`: String, 1-50 characters
- `last_name`: String, 1-50 characters

### Optional Fields
- `address`: Text
- `contact_number`: String, must match pattern `^\+?[\d\s\-\(\)]{10,15}$`
- `date_of_birth`: Date in YYYY-MM-DD format
- `gender`: Enum ('male', 'female', 'other')

### Image Upload Validation
- **File size:** Maximum 5MB
- **File types:** JPEG, PNG, GIF, WebP
- **Processing:** Automatic resize to 400x400px, optimized quality
- **Storage:** Cloudinary with face-centered cropping

## Error Handling

### Common Error Responses

#### 401 Unauthorized
```json
{
  "success": false,
  "error": "Authorization token required"
}
```

#### 400 Bad Request
```json
{
  "success": false,
  "error": "Missing required fields: first_name, last_name"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "error": "Profile not found. Please create your profile first."
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

## Frontend Integration Examples

### React/JavaScript Examples

#### Fetch User Profile
```javascript
const fetchProfile = async () => {
  try {
    const response = await fetch('/api/users/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    if (data.success) {
      setProfile(data.data);
    }
  } catch (error) {
    console.error('Error fetching profile:', error);
  }
};
```

#### Update Profile
```javascript
const updateProfile = async (profileData) => {
  try {
    const response = await fetch('/api/users/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData)
    });
    
    const data = await response.json();
    if (data.success) {
      console.log('Profile updated successfully');
      setProfile(data.data);
    }
  } catch (error) {
    console.error('Error updating profile:', error);
  }
};
```

#### Upload Profile Image
```javascript
const uploadProfileImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('profileImage', imageFile);
  
  try {
    const response = await fetch('/api/users/profile/image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const data = await response.json();
    if (data.success) {
      setProfileImage(data.data.profile_image_url);
      console.log('Image uploaded successfully');
    }
  } catch (error) {
    console.error('Error uploading image:', error);
  }
};
```

### React Component Example
```jsx
import React, { useState, useEffect } from 'react';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await uploadProfileImage(file);
      await fetchProfile(); // Refresh profile data
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateProfile(formData);
    setEditing(false);
    await fetchProfile();
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-image">
          {profile?.profile_image_url ? (
            <img src={profile.profile_image_url} alt="Profile" />
          ) : (
            <div className="default-avatar">No Image</div>
          )}
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageUpload}
            style={{ display: 'none' }}
            id="image-upload"
          />
          <label htmlFor="image-upload" className="upload-btn">
            Change Photo
          </label>
        </div>
        
        <div className="profile-info">
          <h1>{profile?.first_name} {profile?.last_name}</h1>
          <p>{profile?.email}</p>
        </div>
      </div>

      {editing ? (
        <form onSubmit={handleSubmit} className="profile-form">
          <input
            name="first_name"
            placeholder="First Name"
            defaultValue={profile?.first_name}
            onChange={handleInputChange}
            required
          />
          <input
            name="last_name"
            placeholder="Last Name"
            defaultValue={profile?.last_name}
            onChange={handleInputChange}
            required
          />
          <input
            name="contact_number"
            placeholder="Contact Number"
            defaultValue={profile?.contact_number}
            onChange={handleInputChange}
          />
          <input
            name="address"
            placeholder="Address"
            defaultValue={profile?.address}
            onChange={handleInputChange}
          />
          <input
            name="date_of_birth"
            type="date"
            defaultValue={profile?.date_of_birth}
            onChange={handleInputChange}
          />
          <select
            name="gender"
            defaultValue={profile?.gender}
            onChange={handleInputChange}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          
          <div className="form-actions">
            <button type="submit">Save Changes</button>
            <button type="button" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="profile-details">
          <div className="detail-item">
            <label>Name:</label>
            <span>{profile?.first_name} {profile?.last_name}</span>
          </div>
          <div className="detail-item">
            <label>Contact:</label>
            <span>{profile?.contact_number || 'Not provided'}</span>
          </div>
          <div className="detail-item">
            <label>Address:</label>
            <span>{profile?.address || 'Not provided'}</span>
          </div>
          <div className="detail-item">
            <label>Date of Birth:</label>
            <span>{profile?.date_of_birth || 'Not provided'}</span>
          </div>
          <div className="detail-item">
            <label>Gender:</label>
            <span>{profile?.gender || 'Not provided'}</span>
          </div>
          
          <button onClick={() => setEditing(true)} className="edit-btn">
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
```

## Security Features

### Authentication
- JWT token validation on all endpoints
- User ID extracted from verified token
- Row-level security in database

### Image Upload Security
- File type validation (whitelist approach)
- File size limits (5MB maximum)
- Automatic image optimization
- Secure cloud storage with Cloudinary

### Data Validation
- Input sanitization and validation
- SQL injection prevention
- XSS protection through proper encoding

## Configuration Requirements

### Environment Variables
```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Dependencies
```json
{
  "multer": "^2.0.2",
  "cloudinary": "^2.7.0",
  "@supabase/supabase-js": "^2.53.0"
}
```

This profile management system provides a complete solution for user profile management with image upload capabilities, proper validation, and security measures.
