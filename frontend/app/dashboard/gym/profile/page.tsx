"use client";
import React, { useState, useEffect } from 'react';
import { Camera, MapPin, Phone, FileText, Edit3, Save, Shield, CheckCircle, X, Upload, Download, Clock, Loader2, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { GetGymProfileData } from '@/lib/api';

const GymProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gymProfileData, setGymProfileData] = useState({
    gym_name: '',
    address: '',
    operating_Hours: '',
    contact_no: '',
    description: '',
    profile_img: '',
    verified: false,
    documents: []
  });

  const [formData, setFormData] = useState({
    gym_name: '',
    address: '',
    operating_Hours: '',
    contact_no: '',
    description: ''
  });

  const [newProfileImage, setNewProfileImage] = useState(null);
  const [newDocuments, setNewDocuments] = useState([]);
  const [documentsToDelete, setDocumentsToDelete] = useState([]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewProfileImage({
        file,
        preview: URL.createObjectURL(file)
      });
    }
  };

  const handleDocumentChange = (e) => {
    const files = Array.from(e.target.files || []);
    const newDocs = files.map(file => ({
      id: `temp_${Date.now()}_${Math.random()}`,
      file,
      type: file.name, // Using file name as type for simplicity; adjust if specific type is needed
      isNew: true
    }));
    setNewDocuments(prev => [...prev, ...newDocs]);
  };

  const removeNewDocument = (docId) => {
    setNewDocuments(prev => prev.filter(doc => doc.id !== docId));
  };

  const removeExistingDocument = (docId) => {
    setDocumentsToDelete(prev => [...prev, docId]);
  };

  const undoRemoveDocument = (docId) => {
    setDocumentsToDelete(prev => prev.filter(id => id !== docId));
  };

  const updateGymProfile = async () => {
    try {
      setLoading(true);
      const userId = await getSession();
      if (!userId) throw new Error("No user session found");

      // Initialize update data
      const updateData = { ...formData };
      
      // Handle profile image upload
      let profileImgUrl = gymProfileData.profile_img;
      if (newProfileImage?.file) {
        const fileExt = newProfileImage.file.name.split('.').pop();
        const fileName = `${userId}/profile_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('gym-profiles')
          .upload(fileName, newProfileImage.file, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);
        
        const { data: publicUrlData } = supabase.storage
          .from('gym-profiles')
          .getPublicUrl(fileName);
        
        profileImgUrl = publicUrlData.publicUrl;
        updateData.profile_img = profileImgUrl;
      }

      // Handle document uploads
      const uploadedDocs = [];
      for (const doc of newDocuments) {
        const fileExt = doc.file.name.split('.').pop();
        const fileName = `${userId}/docs/${Date.now()}_${doc.type}`;
        const { error: uploadError } = await supabase.storage
          .from('gym-documents')
          .upload(fileName, doc.file, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) throw new Error(`Document upload failed: ${uploadError.message}`);
        
        const { data: publicUrlData } = supabase.storage
          .from('gym-documents')
          .getPublicUrl(fileName);
        
        uploadedDocs.push({
          id: doc.id,
          type: doc.type,
          url: publicUrlData.publicUrl
        });
      }

      // Handle document deletions
      if (documentsToDelete.length > 0) {
        const filesToDelete = documentsToDelete.map(docId => {
          const doc = gymProfileData.documents.find(d => d.id === docId);
          return doc?.url.split('/').pop();
        }).filter(Boolean);

        await supabase.storage
          .from('gym-documents')
          .remove(filesToDelete);
      }

      // Update database
      const { error: dbError } = await supabase
        .from('gym_profiles')
        .upsert({
          user_id: userId,
          ...updateData,
          documents: [
            ...gymProfileData.documents.filter(doc => !documentsToDelete.includes(doc.id)),
            ...uploadedDocs
          ],
          updated_at: new Date().toISOString()
        }, { onConflict: ['user_id'] });

      if (dbError) throw new Error(`Database update failed: ${dbError.message}`);

      // Update local state
      setGymProfileData(prev => ({
        ...prev,
        ...updateData,
        profile_img: profileImgUrl,
        documents: [
          ...prev.documents.filter(doc => !documentsToDelete.includes(doc.id)),
          ...uploadedDocs
        ]
      }));

      // Reset editing states
      setNewProfileImage(null);
      setNewDocuments([]);
      setDocumentsToDelete([]);
      setIsEditing(false);
      
      console.log("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(`Failed to update profile: ${error.message}`);
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
        <div className="bg-gray-900/50 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-800 overflow-hidden mb-8">
          <div className="relative h-64 bg-gradient-to-r from-black via-gray-900 to-black">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-transparent to-red-600/20"></div>
            <div className="absolute bottom-6 left-6 text-white">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-4xl font-bold">{gymProfileData.gym_name || 'Gym Name'}</h1>
                {gymProfileData.verified ? (
                  <div className="flex items-center gap-2 bg-green-400 backdrop-blur-sm px-3 py-1 rounded-full border border-green-800">
                    <CheckCircle className="w-5 h-5 text-black" />
                    <span className="text-sm font-semibold text-black">Verified</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-red-400 backdrop-blur-sm px-3 py-1 rounded-full border border-red-800">
                    <CheckCircle className="w-5 h-5 text-black" />
                    <span className="text-sm font-semibold text-black">Not Verified</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <MapPin className="w-4 h-4" />
                <span>{gymProfileData.address || 'Address not set'}</span>
              </div>
              <div className="flex items-center gap-2 text-white/80 mt-2">
                <Clock className="w-4 h-4" />
                <span>{gymProfileData.operating_Hours || 'Operating hours not set'}</span>
              </div>
            </div>
            <div className="absolute right-5 bottom-5 flex gap-3">
              {isEditing && (
                <Button
                  onClick={cancelEdit}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              )}
              <Button
                onClick={toggleEdit}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700"
              >
                {loading ? (
                  <Loader2 className='justify-center'/>
                ) : isEditing ? (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                    className="w-64 h-64 rounded-2xl object-cover border-4 border-gray-700 shadow-xl group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-red-900/30 via-transparent to-transparent rounded-2xl"></div>
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/70 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
                {isEditing && (
                  <label className="mt-4 cursor-pointer">
                    <input type="file" accept="image/*" onChange={handleProfileImageChange} className="hidden" />
                    <Button className="bg-red-600 hover:bg-red-700">
                      <Camera className="w-4 h-4" />
                      Change Photo
                    </Button>
                  </label>
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
                      className="w-full bg-black/60 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-300"
                    />
                  ) : (
                    <p className="text-xl font-semibold text-white bg-black/40 rounded-xl px-4 py-3 border border-gray-800">{gymProfileData.gym_name || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide flex items-center gap-2">
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
                    <p className="text-white bg-black/40 rounded-xl px-4 py-3 border border-gray-800">{gymProfileData.address || 'Not set'}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Operating Hours
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="operating_Hours"
                        value={formData.operating_Hours}
                        onChange={handleInputChange}
                        className="w-full bg-black/60 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-300"
                        placeholder="e.g., Mon-Fri 6AM-10PM, Sat-Sun 8AM-8PM"
                      />
                    ) : (
                      <p className="text-white bg-black/40 rounded-xl px-4 py-3 border border-gray-800">{gymProfileData.operating_Hours || 'Not set'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide flex items-center gap-2">
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
                      <p className="text-white bg-black/40 rounded-xl px-4 py-3 border border-gray-800">{gymProfileData.contact_no || 'Not set'}</p>
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
              className="w-full bg-black/60 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-300 resize-none"
              placeholder="Tell people about your gym..."
            />
          ) : (
            <p className="text-white/90 text-lg leading-relaxed bg-black/40 rounded-xl px-6 py-4 border border-gray-800">
              {gymProfileData.description || 'No description provided yet'}
            </p>
          )}
        </div>

        <div className="mt-8 bg-gray-900/50 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-800 p-8">
          <label className="block text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wide flex items-center gap-2">
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
                <span className="text-gray-500 italic">No documents uploaded yet</span>
              ) : (
                <span className="text-white">
                  {gymProfileData.documents.length} document(s) uploaded
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GymProfile;