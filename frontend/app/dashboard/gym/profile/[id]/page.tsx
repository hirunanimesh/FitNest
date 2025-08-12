"use client"
import React, { useState } from 'react';
import { Camera, MapPin, Phone, FileText, Edit3, Save, Shield, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GymProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [gymData, setGymData] = useState({
    gymName: 'FitZone Elite Gym',
    address: '123 Fitness Boulevard, Downtown District',
    location: 'Downtown',
    contactNo: '+1-555-123-4567',
    description: 'Transform your body and mind at FitZone Elite - where champions are made. Our state-of-the-art facility features premium equipment, expert personal trainers, diverse group classes, and a supportive community dedicated to helping you achieve your fitness goals.',
    profileImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    verified: true,
    documents: null as File | null,
  });

  const [formData, setFormData] = useState({ ...gymData });
  const [newProfileImage, setNewProfileImage] = useState<string | null>(null);
  const [newDocument, setNewDocument] = useState<File | null>(null);

  const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewProfileImage(URL.createObjectURL(file));
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewDocument(file);
    }
  };

  const toggleEdit = () => {
    if (isEditing) {
      setGymData({
        ...formData,
        profileImage: newProfileImage || formData.profileImage,
        documents: newDocument || formData.documents,
      });
    } else {
      setFormData({ ...gymData });
      setNewProfileImage(null);
      setNewDocument(null);
    }
    setIsEditing(!isEditing);
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Minimal Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-red-500 rounded-full mix-blend-multiply filter blur-2xl opacity-8 animate-pulse delay-2000"></div>
        
        {/* Minimal floating particles */}
        <div className="absolute top-40 right-40 w-1 h-1 bg-red-400 rounded-full animate-bounce delay-1000 opacity-30"></div>
        <div className="absolute bottom-60 left-60 w-1 h-1 bg-red-300 rounded-full animate-bounce delay-3000 opacity-25"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="bg-gray-900/50 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-800 overflow-hidden mb-8">
          <div className="relative h-64 bg-gradient-to-r from-black via-gray-900 to-black">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-transparent to-red-600/20"></div>
            <div className="absolute bottom-6 left-6 text-white">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-4xl font-bold">{gymData.gymName}</h1>
                {gymData.verified && (
                  <div className="flex items-center gap-2 bg-green-400 backdrop-blur-sm px-3 py-1 rounded-full border border-green-800">
                    <CheckCircle className="w-5 h-5 text-black" />
                    <span className="text-sm font-semibold text-black">Verified</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <MapPin className="w-4 h-4" />
                <span>{gymData.location}</span>
              </div>
            </div>
            <Button
              onClick={toggleEdit}
              className='absolute right-5 bottom-5'
            >
              {isEditing ? (
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Image */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900/50 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-800 p-6">
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <img
                    src={isEditing ? newProfileImage || formData.profileImage : gymData.profileImage}
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
                    <Button>
                      <Camera className="w-4 h-4" />
                      Change Photo
                    </Button>
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900/50 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-800 p-8">
              <div className="space-y-6">
                {/* Gym Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">Gym Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="gymName"
                      value={formData.gymName}
                      onChange={handleInputChange}
                      className="w-full bg-black/60 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-300"
                    />
                  ) : (
                    <p className="text-xl font-semibold text-white bg-black/40 rounded-xl px-4 py-3 border border-gray-800">{gymData.gymName}</p>
                  )}
                </div>

                {/* Address */}
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
                    <p className="text-white bg-black/40 rounded-xl px-4 py-3 border border-gray-800">{gymData.address}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Location */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">Area</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full bg-black/60 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-300"
                      />
                    ) : (
                      <p className="text-white bg-black/40 rounded-xl px-4 py-3 border border-gray-800">{gymData.location}</p>
                    )}
                  </div>

                  {/* Contact */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide flex items-center gap-2">
                      <Phone className="w-4 h-4" /> Contact
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="contactNo"
                        value={formData.contactNo}
                        onChange={handleInputChange}
                        className="w-full bg-black/60 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-300"
                      />
                    ) : (
                      <p className="text-white bg-black/40 rounded-xl px-4 py-3 border border-gray-800">{gymData.contactNo}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-8 bg-gray-900/50 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-800 p-8">
          <label className="block text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wide">About Our Gym</label>
          {isEditing ? (
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={6}
              className="w-full bg-black/60 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-300 resize-none"
            />
          ) : (
            <p className="text-white/90 text-lg leading-relaxed bg-black/40 rounded-xl px-6 py-4 border border-gray-800">{gymData.description}</p>
          )}
        </div>

        {/* Documents */}
        <div className="mt-8 bg-gray-900/50 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-800 p-8">
          <label className="block text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wide flex items-center gap-2">
            <FileText className="w-4 h-4" /> Documents & Certifications
          </label>
          {isEditing ? (
            <div className="space-y-4">
              <input type="file" accept=".pdf,.doc,.docx" onChange={handleDocumentChange} className="hidden" id="document-upload" />
              <label
                htmlFor="document-upload"
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl cursor-pointer transition-colors duration-300 shadow-lg hover:shadow-red-600/25"
              >
                <FileText className="w-4 h-4" /> Upload Document
              </label>
              {newDocument && <p className="text-red-400 text-sm">Selected: {newDocument.name}</p>}
            </div>
          ) : (
            <div className="bg-black/40 rounded-xl px-6 py-4 border border-gray-800">
              {gymData.documents ? (
                <a
                  href={URL.createObjectURL(gymData.documents)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors duration-300"
                >
                  <FileText className="w-4 h-4" /> View Document
                </a>
              ) : (
                <span className="text-gray-500 italic">No documents uploaded yet</span>
              )}
            </div>
          )}
        </div>

        
      </div>
    </div>
  );
};

export default GymProfile;