"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, MapPin, Phone, FileText, Edit3, Save, Shield, CheckCircle, X, Upload, Download, Clock, Loader2, Loader, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { GetGymProfileData } from '@/lib/api';
import { RequestVerification } from '@/api/gym/route';

// Operating hours types & defaults
type DayHours = { open: string; close: string };
type OperatingHours = Record<string, DayHours>;

interface Document {
  id: string;
  type: string;
  url: string;
}

const GymProfile = () => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [gymProfileData, setGymProfileData] = useState<{
    gym_id?: string;
    gym_name: string;
    address: string;
    operating_Hours: string;
    contact_no: string;
    description: string;
    profile_img: string;
    verified: boolean;
    documents: Document[];
  }>( {
    gym_name: '',
    address: '',
    operating_Hours: '',
    contact_no: '',
    description: '',
    profile_img: '',
    verified: false,
    documents: []
  });
const [operatingHours, setOperatingHours] = useState<OperatingHours>({});

  // Helper to safely format operating_Hours which may be a string or an object

  const [formData, setFormData] = useState({
    gym_name: '',
    address: '',
    operating_Hours: '',
    contact_no: '',
    description: ''
  });

  const [newProfileImage, setNewProfileImage] = useState<{ file: File; preview: string } | null>(null);
  const [newDocuments, setNewDocuments] = useState<Array<{ id: string; file: File; type: string; isNew: boolean }>>([]);
  const [documentsToDelete, setDocumentsToDelete] = useState<string[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' });

  const getSession = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Error fetching session:", error);
      return null;
    }
    return data.session?.user.id;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userId = await getSession();
        if (userId) {
          const response = await GetGymProfileData(userId);
          if (response && response.gym) {
            const gymData = response.gym;
            setGymProfileData({
              gym_id: gymData.gym_id,
              gym_name: gymData.gym_name || '',
              address: gymData.address || '',
              operating_Hours: gymData.operating_Hours || '',
              contact_no: gymData.contact_no || '',
              description: gymData.description || '',
              profile_img: gymData.profile_img || '',
              verified: gymData.verified || false,
              documents: Array.isArray(gymData.documents) ? gymData.documents : []
            });

            setFormData({
              gym_name: gymData.gym_name || '',
              address: gymData.address || '',
              operating_Hours: gymData.operating_Hours || '',
              contact_no: gymData.contact_no || '',
              description: gymData.description || ''
            });

            // populate operatingHours state from fetched value (string or object)
            try {
              if (gymData.operating_Hours) {
                const parsed = typeof gymData.operating_Hours === 'string'
                  ? JSON.parse(gymData.operating_Hours)
                  : gymData.operating_Hours;
                setOperatingHours(parsed || {});
              } else {
                setOperatingHours({});
              }
            } catch (e) {
              console.error('Failed to parse operating hours:', e);
              setOperatingHours({});
            }
          }
        }
      } catch (error) {
        console.error("Error fetching gym data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (message.type) {
      const timer = setTimeout(() => {
        setMessage({ type: null, text: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input triggered');
    const file = e.target.files?.[0];
    console.log('Selected file:', file);
    
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please select a valid image file' });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size should be less than 5MB' });
        return;
      }
      
      setNewProfileImage({
        file,
        preview: URL.createObjectURL(file)
      });
      console.log('Profile image set for preview');
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newDocs = files.map((file: File) => ({
      id: `temp_${Date.now()}_${Math.random()}`,
      file,
      type: file.name, // Using file name as type for simplicity; adjust if specific type is needed
      isNew: true
    }));
    setNewDocuments(prev => [...prev, ...newDocs]);
  };

  const removeNewDocument = (docId: string) => {
    setNewDocuments(prev => prev.filter(doc => doc.id !== docId));
  };

  const removeExistingDocument = (docId: string) => {
    setDocumentsToDelete(prev => [...prev, docId]);
  };

  const undoRemoveDocument = (docId: string) => {
    setDocumentsToDelete(prev => prev.filter(id => id !== docId));
  };

  const updateGymProfile = async () => {
    try {
      setLoading(true);
      const userId = await getSession();
      if (!userId) throw new Error("No user session found");

      // Initialize update data
      const updateData: {
        gym_name: string;
        address: string;
        operating_Hours: string;
        contact_no: string;
        description: string;
        profile_img?: string;
        documents?: any;
      } = { ...formData };
      
      // Handle profile image upload to Cloudinary
      if (newProfileImage?.file) {
        console.log('Uploading profile image to Cloudinary...');
        try {
          const { uploadToCloudinary } = await import('@/lib/cloudinary');
          const uploadResult = await uploadToCloudinary(newProfileImage.file, 'gym-profiles');
          console.log('Profile image upload successful:', uploadResult);
          updateData.profile_img = uploadResult.url;
        } catch (uploadError) {
          console.error('Profile image upload error:', uploadError);
          throw new Error(`Image upload failed: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
        }
      }

      // Handle document uploads to Cloudinary
      const uploadedDocs: Document[] = [];
      for (const doc of newDocuments) {
        try {
          const { uploadToCloudinary } = await import('@/lib/cloudinary');
          const uploadResult = await uploadToCloudinary(doc.file, 'gym-documents');
          uploadedDocs.push({
            id: `doc_${Date.now()}_${Math.random()}`,
            type: doc.type,
            url: uploadResult.url
          });
        } catch (uploadError) {
          console.error(`Failed to upload document ${doc.type}:`, uploadError);
          throw new Error(`Document upload failed: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
        }
      }

      // Prepare final documents array
      const finalDocuments = [
        ...gymProfileData.documents.filter(doc => !documentsToDelete.includes(doc.id)),
        ...uploadedDocs
      ];

      // Include documents in update data
      updateData.documents = finalDocuments;

      // Update database via API
      if (!gymProfileData.gym_id) {
        throw new Error("Gym ID not found");
      }

      // serialize operating hours as JSON string for backend
      try {
        updateData.operating_Hours = JSON.stringify(operatingHours || {});
      } catch (e) {
        console.error('Failed to stringify operating hours:', e);
        updateData.operating_Hours = formData.operating_Hours || '';
      }

      const { UpdateGymProfile } = await import('@/lib/api');
      const response = await UpdateGymProfile(gymProfileData.gym_id, updateData);

      if (response && response.updatedGym) {
        // Update local state with the response from server
        setGymProfileData(prev => ({
          ...prev,
          ...updateData,
          documents: finalDocuments
        }));

        // Reset editing states
        setNewProfileImage(null);
        setNewDocuments([]);
        setDocumentsToDelete([]);
        setIsEditing(false);

        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        console.log("Profile updated successfully");
      } else {
        throw new Error("Failed to update profile - no response from server");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setMessage({ type: 'error', text: `Failed to update profile: ${errorMessage}` });
    } finally {
      setLoading(false);
    }
  };

  const toggleEdit = () => {
    if (isEditing) {
      updateGymProfile();
    } else {
      setFormData({
        gym_name: gymProfileData.gym_name,
        address: gymProfileData.address,
        operating_Hours: gymProfileData.operating_Hours,
        contact_no: gymProfileData.contact_no,
        description: gymProfileData.description
      });
      setNewProfileImage(null);
      setNewDocuments([]);
      setDocumentsToDelete([]);
      setIsEditing(!isEditing);
    }
  };

  const cancelEdit = () => {
    setFormData({
      gym_name: gymProfileData.gym_name,
      address: gymProfileData.address,
      operating_Hours: gymProfileData.operating_Hours,
      contact_no: gymProfileData.contact_no,
      description: gymProfileData.description
    });
    setNewProfileImage(null);
    setNewDocuments([]);
    setDocumentsToDelete([]);
    setIsEditing(false);
  };

  const handleVerify = async () => {
    try {
      setLoading(true);
      setMessage({ type: null, text: '' }); // Clear previous messages

      const userId = await getSession();
      if (!userId) throw new Error("No user session found");

      // Get user email from Supabase auth
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user?.email) {
        throw new Error("Unable to get user email");
      }

      const result = await RequestVerification(gymProfileData.gym_id,userData.user.email)

      setMessage({ type: 'success', text: result.message });
    } catch (error) {
      console.error("Error requesting verification:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setMessage({ type: 'error', text: `Failed to request verification: ${errorMessage}` });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !gymProfileData.gym_name) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl"><Loader className='justify-center text-red-400 animate-spin'/></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-red-500 rounded-full mix-blend-multiply filter blur-2xl opacity-8 animate-pulse delay-2000"></div>
        <div className="absolute top-40 right-40 w-1 h-1 bg-red-400 rounded-full animate-bounce delay-1000 opacity-30"></div>
        <div className="absolute bottom-60 left-60 w-1 h-1 bg-red-300 rounded-full animate-bounce delay-3000 opacity-25"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-6">
        {/* Message Display */}
        {message.type && (
          <div className={`mb-6 p-4 rounded-xl border backdrop-blur-lg ${
            message.type === 'success'
              ? 'bg-green-900/20 border-green-700 text-green-300'
              : 'bg-red-900/20 border-red-700 text-red-300'
          }`}>
            <div className="flex items-center gap-3">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <X className="w-5 h-5 text-red-400" />
              )}
              <span className="text-sm font-medium">{message.text}</span>
              <button
                onClick={() => setMessage({ type: null, text: '' })}
                className="ml-auto text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="bg-gray-900/50 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-800 overflow-hidden mb-8">
          <div className="relative h-64 bg-gradient-to-r from-black via-gray-900 to-black">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-transparent to-red-600/20"></div>
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-black/80 backdrop-blur-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
            <div className="absolute bottom-6 left-6 text-white">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-4xl font-bold">{gymProfileData.gym_name || 'Gym Name'}</h1>
                {gymProfileData.verified ? (
                  <div className="flex items-center gap-2 bg-green-400 backdrop-blur-sm px-3 py-1 rounded-full border border-green-800">
                    <CheckCircle className="w-5 h-5 text-black" />
                    <span className="text-sm font-semibold text-black">Verified</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-red-400 backdrop-blur-sm px-3 py-1 rounded-full border border-red-800">
                      <CheckCircle className="w-5 h-5 text-black" />
                      <span className="text-sm font-semibold text-black">Not Verified</span>
                    </div>
                    <Button
                      onClick={handleVerify}
                      disabled={loading}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm"
                    >
                      {loading ? (
                        <Loader2 className='w-4 h-4 animate-spin' />
                      ) : (
                        <>
                          <Shield className="w-4 h-4 mr-2" />
                          Verify Me
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <MapPin className="w-4 h-4" />
                <span>{gymProfileData.address || 'Address not set'}</span>
              </div>
              
            </div>
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
              {isEditing ? (
                <div className="flex gap-2">
                  <Button
                    onClick={cancelEdit}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 px-3 py-2 text-sm bg-black/80 backdrop-blur-sm"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={toggleEdit}
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700 px-3 py-2 text-sm"
                  >
                    {loading ? (
                      <Loader2 className='w-4 h-4'/>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={toggleEdit}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 px-3 py-2 text-sm"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="lg:col-span-1">
            <div className="bg-gray-900/50 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-800 p-6">
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <img
                    src={
                      isEditing
                        ? (newProfileImage?.preview || gymProfileData.profile_img || '/api/placeholder/300/300')
                        : (gymProfileData.profile_img || '/api/placeholder/300/300')
                    }
                    alt="Gym Profile"
                    className={`w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 rounded-2xl object-cover border-4 border-gray-700 shadow-xl group-hover:scale-105 transition-transform duration-300 ${
                      isEditing ? 'cursor-pointer' : ''
                    }`}
                    onClick={isEditing ? () => document.getElementById('profile-image-upload')?.click() : undefined}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-red-900/30 via-transparent to-transparent rounded-2xl"></div>
                  {isEditing && (
                    <div 
                      className="absolute inset-0 bg-black/70 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                      onClick={() => document.getElementById('profile-image-upload')?.click()}
                    >
                      <div className="text-center">
                        <Camera className="w-8 h-8 text-white mx-auto mb-2" />
                        <p className="text-white text-sm">Click to change</p>
                      </div>
                    </div>
                  )}
                </div>
                {isEditing && (
                  <div className="mt-4">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleProfileImageChange} 
                      className="hidden" 
                      id="profile-image-upload"
                      ref={(input) => {
                        if (input) {
                          (window as any).profileImageInput = input;
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => {
                        const input = document.getElementById('profile-image-upload') as HTMLInputElement;
                        if (input) {
                          input.click();
                        }
                      }}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Change Photo
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-gray-900/50 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-800 p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">Gym Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="gym_name"
                      value={formData.gym_name}
                      onChange={handleInputChange}
                      className="w-full bg-black/60 border border-gray-700 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-white placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-300 text-sm sm:text-base"
                    />
                  ) : (
                    <p className="text-lg sm:text-xl font-semibold text-white bg-black/40 rounded-xl px-3 sm:px-4 py-2 sm:py-3 border border-gray-800">{gymProfileData.gym_name || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="flex text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide items-center gap-2">
                    <MapPin className="w-4 h-4" /> Address
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full bg-black/60 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-300"
                    />
                  ) : (
                    <p className="text-white bg-black/40 rounded-xl px-3 sm:px-4 py-2 sm:py-3 border border-gray-800">{gymProfileData.address || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="flex text-sm font-semibold text-white mb-2 uppercase tracking-wide items-center gap-4">
                    <Clock className="h-5 w-5 text-red-400" /> Operating Hours
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {Object.keys(operatingHours).map((day) => {
                      const d = day as keyof OperatingHours;
                      const times = operatingHours[d];
                      return (
                        <div key={day} className="flex items-center gap-2 text-white">
                          <span className="w-24 capitalize">{day}</span>
                          <input
                            type="time"
                            value={times.open}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setOperatingHours((prev: OperatingHours) => ({
                                ...prev,
                                [d]: { ...prev[d], open: e.target.value },
                              }))
                            }
                            className="w-32 bg-black/60 border border-gray-700 rounded-xl px-2 py-1 text-white"
                          />
                          <span className="mx-4">to</span>
                          <input
                            type="time"
                            value={times.close}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setOperatingHours((prev: OperatingHours) => ({
                                ...prev,
                                [d]: { ...prev[d], close: e.target.value },
                              }))
                            }
                            className="w-32 bg-black/60 border border-gray-700 rounded-xl px-2 py-1 text-white"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                  <div>
                    <label className="flex text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide items-center gap-2">
                      <Phone className="w-4 h-4" /> Contact
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="contact_no"
                        value={formData.contact_no}
                        onChange={handleInputChange}
                        className="w-full bg-black/60 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-300"
                      />
                    ) : (
                      <p className="text-white bg-black/40 rounded-xl px-3 sm:px-4 py-2 sm:py-3 border border-gray-800">{gymProfileData.contact_no || 'Not set'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-gray-900/50 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-800 p-8">
          <label className="block text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wide">About Our Gym</label>
          {isEditing ? (
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={6}
              className="w-full bg-black/60 border border-gray-700 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-white placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-300 resize-none text-sm sm:text-base"
              placeholder="Tell people about your gym..."
            />
          ) : (
            <p className="text-white/90 text-base sm:text-lg leading-relaxed bg-black/40 rounded-xl px-4 sm:px-6 py-3 sm:py-4 border border-gray-800">
              {gymProfileData.description || 'No description provided yet'}
            </p>
          )}
        </div>

        <div className="mt-8 bg-gray-900/50 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-800 p-8">
          <label className="flex text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wide items-center gap-2">
            <FileText className="w-4 h-4" /> Documents & Certifications
          </label>
          
          {gymProfileData.documents && gymProfileData.documents.length > 0 && (
            <div className="mb-6">
              <h4 className="text-white font-medium mb-3">Current Documents:</h4>
              <div className="space-y-3">
                {gymProfileData.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={`flex items-center justify-between bg-black/40 rounded-xl px-4 py-3 border border-gray-800 ${
                      documentsToDelete.includes(doc.id) ? 'opacity-50 line-through' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-red-400" />
                      <span className="text-white">{doc.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isEditing && doc.url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(doc.url, '_blank')}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                      {isEditing && (
                        <>
                          {documentsToDelete.includes(doc.id) ? (
                            <Button
                              size="sm"
                              onClick={() => undoRemoveDocument(doc.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Undo
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeExistingDocument(doc.id)}
                              className="border-red-600 text-red-400 hover:bg-red-600/10"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isEditing && newDocuments.length > 0 && (
            <div className="mb-6">
              <h4 className="text-white font-medium mb-3">New Documents to Upload:</h4>
              <div className="space-y-3">
                {newDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between bg-green-900/20 rounded-xl px-4 py-3 border border-green-800">
                    <div className="flex items-center gap-3">
                      <Upload className="w-5 h-5 text-green-400" />
                      <span className="text-white">{doc.type}</span>
                      <span className="text-green-400 text-sm">(New)</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeNewDocument(doc.id)}
                      className="border-red-600 text-red-400 hover:bg-red-600/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isEditing ? (
            <div className="space-y-4">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleDocumentChange}
                className="hidden"
                id="document-upload"
                multiple
              />
              <label
                htmlFor="document-upload"
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl cursor-pointer transition-colors duration-300 shadow-lg hover:shadow-red-600/25"
              >
                <FileText className="w-4 h-4" /> Upload Documents
              </label>
              <p className="text-gray-400 text-sm">
                Accepted formats: PDF, DOC, DOCX, JPG, JPEG, PNG
              </p>
            </div>
          ) : (
            <div className="bg-black/40 rounded-xl px-6 py-4 border border-gray-800">
              {!gymProfileData.documents || gymProfileData.documents.length === 0 ? (
                <span className="text-gray-500 italic text-sm sm:text-base">No documents uploaded yet</span>
              ) : (
                <span className="text-white text-sm sm:text-base">
                  {gymProfileData.documents.length} document(s) uploaded
                </span>
              )}
            </div>
          )}
        </div>
      </div>

  );
};

export default GymProfile;