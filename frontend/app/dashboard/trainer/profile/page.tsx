"use client";
import { useState } from 'react';
import Image, { StaticImageData } from 'next/image';
import profileImage from '@/public/images/gallery-6.png';
import { Button } from '@/components/ui/button';

interface Trainer {
  name: string;
  bio: string;
  rating: number;
  contact: string;
  profileImage: string | StaticImageData;
  experience: number;
  skills: string[];
  verified: boolean;
}

const TrainerProfile: React.FC = () => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [trainer, setTrainer] = useState<Trainer>({
    name: 'John Doe',
    bio: 'Passionate fitness coach dedicated to helping clients achieve their goals through personalized training and nutrition plans.',
    rating: 4.8,
    contact: '+1 (555) 123-4567',
    profileImage: profileImage,
    experience: 7,
    skills: ['Strength Training', 'Cardio', 'Nutrition Planning', 'Yoga'],
    verified: true,
  });

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTrainer({ ...trainer, [name]: value });
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skillsArray = e.target.value.split(',').map((skill) => skill.trim());
    setTrainer({ ...trainer, skills: skillsArray });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTrainer({ ...trainer, profileImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 text-white min-h-screen">
      <div className="bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-red-500">
            <Image
              src={trainer.profileImage}
              alt="Profile"
              layout="fill"
              objectFit="cover"
              className="rounded-full"
            />
          </div>
          <div className="flex-1 text-center md:text-left">
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={trainer.name}
                onChange={handleInputChange}
                className="text-3xl font-bold bg-gray-700 text-white p-2 rounded w-full"
              />
            ) : (
              <h1 className="text-3xl font-bold">{trainer.name}</h1>
            )}
            <div className="flex items-center justify-center md:justify-start mt-2">
              <span className="text-yellow-400">★ {trainer.rating}/5</span>
              {trainer.verified && (
                <span className="ml-4 bg-green-500 text-white text-sm px-2 py-1 rounded-full">
                  Verified Trainer
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6">
          {isEditing ? (
            <textarea
              name="bio"
              value={trainer.bio}
              onChange={handleInputChange}
              className="w-full bg-gray-700 text-white p-3 rounded"
              rows={4}
            />
          ) : (
            <p className="text-gray-300">{trainer.bio}</p>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Contact</h2>
            {isEditing ? (
              <input
                type="text"
                name="contact"
                value={trainer.contact}
                onChange={handleInputChange}
                className="w-full bg-gray-700 text-white p-2 rounded"
              />
            ) : (
              <p className="text-gray-300">{trainer.contact}</p>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Experience</h2>
            {isEditing ? (
              <input
                type="number"
                name="experience"
                value={trainer.experience}
                onChange={handleInputChange}
                className="w-full bg-gray-700 text-white p-2 rounded"
              />
            ) : (
              <p className="text-gray-300">{trainer.experience} years</p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold text-white">Skills</h2>
          {isEditing ? (
            <input
              type="text"
              name="skills"
              value={trainer.skills.join(', ')}
              onChange={handleSkillsChange}
              className="w-full bg-gray-700 text-white p-2 rounded"
              placeholder="Enter skills separated by commas"
            />
          ) : (
            <div className="flex flex-wrap gap-2 mt-2">
              {trainer.skills.map((skill, index) => (
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

        <div className="mt-6">
          <h2 className="text-xl font-semibold text-white">Profile Image</h2>
          {isEditing ? (
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full bg-gray-700 text-white p-2 rounded"
            />
          ) : (
            <p className="text-gray-300">Current profile image displayed above</p>
          )}
        </div>

        <Button
          onClick={handleEditToggle}
          className="mt-6 text-white font-semibold py-2 px-4 rounded"
        >
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </Button>
      </div>
    </div>
  );
};

export default TrainerProfile;