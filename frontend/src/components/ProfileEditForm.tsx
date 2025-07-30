import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUpdateProfile } from '../hooks/useUserProfile';
import { User, Save, X, AlertCircle, CheckCircle } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface ProfileEditFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ onCancel, onSuccess }) => {
  const { user } = useAuth();
  const updateProfileMutation = useUpdateProfile();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    cookingSkillLevel: user?.cookingSkillLevel || 'beginner',
    avatar: user?.avatar || ''
  });

  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (formData.name.trim().length < 2) {
      setError('Name must be at least 2 characters long');
      return;
    }

    try {
      await updateProfileMutation.mutateAsync(formData);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold text-neutral-900 flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Edit Profile</span>
        </h3>
      </div>
      
      <div className="card-content">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Name Field */}
          <div>
            <label htmlFor="name" className="label">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="input mt-1"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>

          {/* Bio Field */}
          <div>
            <label htmlFor="bio" className="label">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              className="input mt-1 resize-none"
              placeholder="Tell us about yourself and your cooking interests..."
              value={formData.bio}
              onChange={handleInputChange}
            />
            <p className="mt-1 text-xs text-neutral-500">
              Optional - share your cooking interests, favorite cuisines, or goals
            </p>
          </div>

          {/* Cooking Skill Level */}
          <div>
            <label htmlFor="cookingSkillLevel" className="label">
              Cooking Skill Level
            </label>
            <select
              id="cookingSkillLevel"
              name="cookingSkillLevel"
              className="input mt-1"
              value={formData.cookingSkillLevel}
              onChange={handleInputChange}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <p className="mt-1 text-xs text-neutral-500">
              This helps us recommend recipes appropriate for your skill level
            </p>
          </div>

          {/* Avatar URL */}
          <div>
            <label htmlFor="avatar" className="label">
              Avatar URL
            </label>
            <input
              id="avatar"
              name="avatar"
              type="url"
              className="input mt-1"
              placeholder="https://example.com/your-avatar.jpg"
              value={formData.avatar}
              onChange={handleInputChange}
            />
            <p className="mt-1 text-xs text-neutral-500">
              Optional - provide a URL to your profile picture
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="btn btn-primary flex-1"
            >
              {updateProfileMutation.isPending ? (
                <div className="flex items-center justify-center space-x-2">
                  <LoadingSpinner size="sm" />
                  <span>Saving...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </div>
              )}
            </button>
            
            <button
              type="button"
              onClick={onCancel}
              disabled={updateProfileMutation.isPending}
              className="btn btn-outline flex-1"
            >
              <div className="flex items-center justify-center space-x-2">
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditForm; 