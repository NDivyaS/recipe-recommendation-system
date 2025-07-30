import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDietaryRestrictions, useUpdateDietaryRestrictions } from '../hooks/useUserProfile';
import { Leaf, Plus, X, AlertCircle, CheckCircle, Edit3 } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface DietaryRestrictionsManagerProps {
  isEditing: boolean;
}

const DietaryRestrictionsManager: React.FC<DietaryRestrictionsManagerProps> = ({ isEditing }) => {
  const { user } = useAuth();
  const { data: availableRestrictions, isLoading: loadingRestrictions } = useDietaryRestrictions();
  const updateRestrictionsMutation = useUpdateDietaryRestrictions();

  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>(
    user?.dietaryRestrictions?.map(r => r.name) || []
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Reset selections when user data changes or editing mode changes
  useEffect(() => {
    if (user?.dietaryRestrictions) {
      setSelectedRestrictions(user.dietaryRestrictions.map(r => r.name));
      setHasChanges(false);
      setError('');
      setSuccessMessage('');
    }
  }, [user?.dietaryRestrictions, isEditing]);

  const handleToggleRestriction = (restrictionName: string) => {
    if (!isEditing) return;

    const newSelected = selectedRestrictions.includes(restrictionName)
      ? selectedRestrictions.filter(r => r !== restrictionName)
      : [...selectedRestrictions, restrictionName];
    
    setSelectedRestrictions(newSelected);
    setHasChanges(true);
    setError('');
    setSuccessMessage('');
  };

  const handleSave = async () => {
    try {
      await updateRestrictionsMutation.mutateAsync(selectedRestrictions);
      setHasChanges(false);
      setSuccessMessage('Dietary restrictions updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update dietary restrictions');
    }
  };

  const handleReset = () => {
    setSelectedRestrictions(user?.dietaryRestrictions?.map(r => r.name) || []);
    setHasChanges(false);
    setError('');
    setSuccessMessage('');
  };

  if (loadingRestrictions) {
    return (
      <div className="card">
        <div className="card-content">
          <LoadingSpinner className="py-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold text-neutral-900 flex items-center space-x-2">
          <Leaf className="h-5 w-5 text-secondary-600" />
          <span>Dietary Restrictions</span>
          {!isEditing && (
            <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded-full ml-2">
              View Only
            </span>
          )}
        </h3>
        <p className="text-sm text-neutral-600 mt-1">
          {isEditing 
            ? "Select your dietary preferences to get personalized recipe recommendations"
            : "Your current dietary preferences"
          }
        </p>
      </div>
      
      <div className="card-content space-y-4">
        {/* Messages */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            <p className="text-sm text-green-600">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Edit Mode Notice */}
        {!isEditing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center space-x-2">
            <Edit3 className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <p className="text-sm text-blue-700">
              Click "Edit Profile" to modify your dietary restrictions
            </p>
          </div>
        )}

        {/* Restrictions Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {availableRestrictions?.map((restriction) => {
            const isSelected = selectedRestrictions.includes(restriction.name);
            return (
              <button
                key={restriction.id}
                onClick={() => handleToggleRestriction(restriction.name)}
                disabled={!isEditing}
                className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm font-medium ${
                  isSelected
                    ? 'border-secondary-500 bg-secondary-50 text-secondary-700'
                    : 'border-neutral-200 bg-white text-neutral-700'
                } ${
                  isEditing 
                    ? 'hover:border-neutral-300 cursor-pointer' 
                    : 'cursor-default opacity-75'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  {isSelected && <CheckCircle className="h-4 w-4" />}
                  <span className="capitalize">{restriction.name}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Current Selection Summary */}
        {selectedRestrictions.length > 0 && (
          <div className="bg-neutral-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-neutral-900 mb-2">
              {isEditing ? 'Selected Restrictions:' : 'Current Restrictions:'}
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedRestrictions.map((restriction) => (
                <span
                  key={restriction}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800"
                >
                  {restriction}
                  {isEditing && (
                    <button
                      onClick={() => handleToggleRestriction(restriction)}
                      className="ml-2 hover:text-secondary-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {selectedRestrictions.length === 0 && (
          <div className="text-center py-6 text-neutral-500">
            <Leaf className="h-8 w-8 mx-auto mb-2 text-neutral-400" />
            <p>No dietary restrictions selected</p>
            {isEditing && (
              <p className="text-sm">Select any dietary preferences you follow</p>
            )}
          </div>
        )}

        {/* Action Buttons - Only show in edit mode */}
        {isEditing && hasChanges && (
          <div className="flex space-x-3 pt-4 border-t border-neutral-200">
            <button
              onClick={handleSave}
              disabled={updateRestrictionsMutation.isPending}
              className="btn btn-secondary flex-1"
            >
              {updateRestrictionsMutation.isPending ? (
                <div className="flex items-center justify-center space-x-2">
                  <LoadingSpinner size="sm" />
                  <span>Saving...</span>
                </div>
              ) : (
                'Save Changes'
              )}
            </button>
            
            <button
              onClick={handleReset}
              disabled={updateRestrictionsMutation.isPending}
              className="btn btn-outline flex-1"
            >
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DietaryRestrictionsManager; 