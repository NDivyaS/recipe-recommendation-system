import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Edit3, Calendar, Mail, Award, CheckCircle, Save, X } from 'lucide-react';
import ProfileEditForm from '../components/ProfileEditForm';
import DietaryRestrictionsManager from '../components/DietaryRestrictionsManager';
import AllergiesManager from '../components/AllergiesManager';
import UserStatsCard from '../components/UserStatsCard';
import ProfileActivityTracker from '../components/ProfileActivityTracker';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [activityRefreshTrigger, setActivityRefreshTrigger] = useState(0);

  const handleEditSuccess = () => {
    setIsEditing(false);
    setSuccessMessage('Profile updated successfully!');
    // Trigger activity refresh
    setActivityRefreshTrigger(prev => prev + 1);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSuccessMessage('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Profile</h1>
          <p className="text-neutral-600 mt-1">
            Manage your personal information, dietary preferences, and cooking profile
          </p>
        </div>
        
        <div className="flex space-x-3">
          {isEditing ? (
            <button
              onClick={handleCancelEdit}
              className="btn btn-outline"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel Edit
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-primary"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Edit Mode Notice */}
      {isEditing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center space-x-2">
          <Edit3 className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Edit Mode Active</p>
            <p>You can now modify your profile information, dietary restrictions, and allergies. Don't forget to save your changes!</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
          <p className="text-sm text-green-600">{successMessage}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card or Edit Form */}
          {isEditing ? (
            <ProfileEditForm
              onCancel={handleCancelEdit}
              onSuccess={handleEditSuccess}
            />
          ) : (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-neutral-900 flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Personal Information</span>
                </h3>
              </div>
              
              <div className="card-content space-y-4">
                {/* Avatar */}
                <div className="flex justify-center">
                  <div className="relative">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-lg"
                        onError={(e) => {
                          // Fallback to icon if image fails to load
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className={`h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center shadow-lg ${
                        user?.avatar ? 'hidden' : 'flex'
                      }`}
                    >
                      <User className="h-8 w-8 text-primary-600" />
                    </div>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-neutral-400" />
                    <div>
                      <p className="text-sm text-neutral-500">Name</p>
                      <p className="font-medium text-neutral-900">{user?.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-neutral-400" />
                    <div>
                      <p className="text-sm text-neutral-500">Email</p>
                      <p className="font-medium text-neutral-900">{user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Award className="h-4 w-4 text-neutral-400" />
                    <div>
                      <p className="text-sm text-neutral-500">Cooking Level</p>
                      <p className="font-medium text-neutral-900 capitalize">{user?.cookingSkillLevel}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-neutral-400" />
                    <div>
                      <p className="text-sm text-neutral-500">Member Since</p>
                      <p className="font-medium text-neutral-900">
                        {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {user?.bio && (
                  <div className="border-t border-neutral-200 pt-4">
                    <p className="text-sm text-neutral-500 mb-2">Bio</p>
                    <p className="text-neutral-700 text-sm leading-relaxed">{user.bio}</p>
                  </div>
                )}

                {/* Current Preferences Summary */}
                <div className="border-t border-neutral-200 pt-4 space-y-3">
                  <div>
                    <p className="text-sm text-neutral-500 mb-2">Dietary Restrictions</p>
                    {user?.dietaryRestrictions && user.dietaryRestrictions.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {user.dietaryRestrictions.map((restriction) => (
                          <span
                            key={restriction.id}
                            className="inline-block px-2 py-1 text-xs font-medium bg-secondary-100 text-secondary-800 rounded-full"
                          >
                            {restriction.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-400 italic">None specified</p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-neutral-500 mb-2">Allergies</p>
                    {user?.allergies && user.allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {user.allergies.map((allergy) => (
                          <span
                            key={allergy.id}
                            className="inline-block px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full"
                          >
                            {allergy.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-400 italic">None specified</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User Statistics - Only show when not editing */}
          {!isEditing && <UserStatsCard />}

          {/* Activity Tracker - Only show when not editing */}
          {!isEditing && <ProfileActivityTracker refreshTrigger={activityRefreshTrigger} />}
        </div>

        {/* Right Column - Preferences Management */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dietary Restrictions Manager */}
          <DietaryRestrictionsManager isEditing={isEditing} />

          {/* Allergies Manager */}
          <AllergiesManager isEditing={isEditing} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 