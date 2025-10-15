"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useTrainerData } from '../context/TrainerContext';
import { UpdateTrainerDetails, uploadToCloudinary, RequestTrainerVerification } from "@/lib/api";
import TrainerDocuments from '../_components/TrainerDocuments';
import { Edit3, ArrowLeft, Shield } from "lucide-react";
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const TrainerProfile: React.FC = () => {
  const { trainerData, refreshTrainerData } = useTrainerData();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editFormData, setEditFormData] = useState<any>({
    ...trainerData,
    profileImage: trainerData?.profile_img || ""
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [verifying, setVerifying] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' });
  const router = useRouter();

  useEffect(() => {
    if (trainerData) {
      setEditFormData({
        ...trainerData,
        profileImage: trainerData.profile_img || ""
      });
    }
  }, [trainerData]);


  const handleBack = () => {
    router.back();
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skillsArray = e.target.value.split(',').map((skill) => skill.trim());
    setEditFormData({ ...editFormData, skills: skillsArray });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      let profileImageUrl = editFormData.profileImage;
      if (selectedImage) {
        profileImageUrl = await uploadToCloudinary(selectedImage);
      }
      const updatedData = {
        ...editFormData,
        profile_img: profileImageUrl,
        profileImage: profileImageUrl
      };
      if (trainerData) {
        await UpdateTrainerDetails(trainerData.trainer_id, updatedData);
        await refreshTrainerData();
      }
      setIsEditing(false);
      setSelectedImage(null);
      setImagePreview("");
    } catch (error) {
      console.error("Error updating trainer profile:", error);
    }
  };

  const handleVerify = async () => {
    try {
      setVerifying(true);
      setMessage({ type: null, text: '' }); // Clear previous messages

      // Get user email from Supabase auth if not available in trainerData
      let email = trainerData?.email || '';
      if (!email) {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user?.email) {
          throw new Error("Unable to get user email");
        }
        email = userData.user.email;
      }

      const result = await RequestTrainerVerification(trainerData?.trainer_id, email);

      if (!result) {
        throw new Error(result.message || 'Verification request failed');
      }

      setMessage({ type: 'success', text: result.message });
      // Refresh trainer data to update verification status
      await refreshTrainerData();
    } catch (error) {
      console.error("Error requesting verification:", error);

      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      setMessage({ type: 'error', text: `Failed to request verification: ${errorMessage}` });
    } finally {
      setVerifying(false);
    }
  };


  return (
    <div className="max-w-4xl mx-auto p-6 bg-transparent text-white min-h-screen">
      {/* Back Button */}
      <div className="mb-6">
        <Button
          onClick={handleBack}
          variant="outline"
          className="flex items-center gap-2 bg-transparent border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-400 hover:text-red-300 transition-all duration-300 shadow-lg hover:shadow-red-500/25"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>


      <div className="bg-gray-800 rounded-lg shadow-lg p-8">
        {/* Message Display */}
        {message.type && (
          <div className={`mb-6 p-4 rounded-xl border backdrop-blur-lg ${
            message.type === 'success'
              ? 'bg-green-900/20 border-green-700 text-green-300'
              : 'bg-red-900/20 border-red-700 text-red-300'
          }`}>
            <div className="flex items-center gap-3">
              {message.type === 'success' ? (
                <Shield className="w-5 h-5 text-green-400" />
              ) : (
                <Shield className="w-5 h-5 text-red-400" />
              )}
              <span className="text-sm font-medium">{message.text}</span>
              <button
                onClick={() => setMessage({ type: null, text: '' })}
                className="ml-auto text-gray-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-red-500 cursor-pointer">
            <Image
              src={imagePreview || editFormData.profileImage || "/placeholder.svg"}
              alt="Profile"
              fill
              style={{ objectFit: "cover" }}
              className="rounded-full"
            />

            {isEditing && (
              <label
                htmlFor="profileImageUpload"
                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 cursor-pointer"
              >
                <Edit3 className="h-8 w-8 text-white drop-shadow-lg" />
              </label>
            )}

            {/* Hidden input */}
            <input
              id="profileImageUpload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
          <div className="flex-1 text-center md:text-left">
            {isEditing ? (
              <input
                type="text"
                name="Name"
                value={editFormData.Name || trainerData?.trainer_name || ""}
                onChange={handleInputChange}
                className="text-3xl font-bold bg-gray-700 text-white p-2 rounded w-full"
              />
            ) : (
              <h1 className="text-3xl font-bold">{trainerData?.trainer_name}</h1>
            )}
            <div className="flex items-center justify-center md:justify-start mt-2 gap-4">
              <span className="text-yellow-400">★ {(() => {
                if (trainerData?.rating === null || trainerData?.rating === undefined) return '4.5';

                const numRating = typeof trainerData.rating === 'string' ? parseFloat(trainerData.rating) : trainerData.rating;

                return !isNaN(numRating) && numRating >= 0 && numRating <= 5 ? numRating.toFixed(1) : '4.5';
              })()}/5</span>
              {trainerData?.verified ? (
                <span className="bg-green-500 text-white text-sm px-2 py-1 rounded-full">
                  Verified Trainer
                </span>
              ) : (
                <Button
                  onClick={handleVerify}
                  disabled={verifying}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 px-3 py-1 text-xs"
                >
                  {verifying ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                  ) : (
                    <Shield className="w-3 h-3 mr-1" />
                  )}
                  {verifying ? 'Verifying...' : 'Verify Me'}
                </Button>
              )}
            </div>
          </div>
        </div>
  
        <div className="mt-6">
          <div><h2 className="text-xl font-semibold text-white">Bio</h2></div>
          {isEditing ? (
            <textarea
              name="bio"
              value={editFormData.bio || ""}
              onChange={handleInputChange}
              className="w-full bg-gray-700 text-white p-3 rounded"
              rows={4}
            />
          ) : (
            <p className="text-gray-300">{trainerData?.bio}</p>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Contact</h2>
            {isEditing ? (
              <input
                type="text"
                name="contact_no"
                value={editFormData.contact_no  || ""}
                onChange={handleInputChange}
                className="w-full bg-gray-700 text-white p-2 rounded"
              />
            ) : (
              <p className="text-gray-300">{trainerData?.contact_no}</p>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Experience</h2>
            {isEditing ? (
              <input
                type="number"
                min="0"
                name="years_of_experience"
                value={editFormData.years_of_experience || ""}
                onChange={handleInputChange}
                className="w-full bg-gray-700 text-white p-2 rounded"
              />
            ) : (
              <p className="text-gray-300">{trainerData?.years_of_experience} years</p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold text-white">Skills</h2>
          {isEditing ? (
            <input
              type="text"
              name="skills"
              value={editFormData.skills?.join(', ') || ""}
              onChange={handleSkillsChange}
              className="w-full bg-gray-700 text-white p-2 rounded"
              placeholder="Enter skills separated by commas"
            />
          ) : (
            <div className="flex flex-wrap gap-2 mt-2">
              {trainerData?.skills?.map((skill: string, index: number) => (
                <span
                  key={index}
                  className="bg-gray-600 text-white px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        <Button
          onClick={isEditing ? handleSave : handleEditToggle}
          className="mt-6 bg-gradient-to-r from-[#FB4141] to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-2 px-4 rounded transition-all duration-300 shadow-lg hover:shadow-red-500/25"
        >
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </Button>

        {/* Documents preview placed under profile area. Editable when isEditing is true. */}
        <TrainerDocuments editable={isEditing} />
      </div>
    </div>
  );
};

export default TrainerProfile;
