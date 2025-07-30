import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAllergies, useUpdateAllergies } from '../hooks/useUserProfile';
import { Shield, AlertTriangle, X, AlertCircle, CheckCircle, Edit3 } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface AllergiesManagerProps {
  isEditing: boolean;
}

const AllergiesManager: React.FC<AllergiesManagerProps> = ({ isEditing }) => {
  const { user } = useAuth();
  const { data: availableAllergies, isLoading: loadingAllergies } = useAllergies();
  const updateAllergiesMutation = useUpdateAllergies();

  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(
    user?.allergies?.map(a => a.name) || []
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Reset selections when user data changes or editing mode changes
  useEffect(() => {
    if (user?.allergies) {
      setSelectedAllergies(user.allergies.map(a => a.name));
      setHasChanges(false);
      setError('');
      setSuccessMessage('');
    }
  }, [user?.allergies, isEditing]);

  const handleToggleAllergy = (allergyName: string) => {
    if (!isEditing) return;

    const newSelected = selectedAllergies.includes(allergyName)
      ? selectedAllergies.filter(a => a !== allergyName)
      : [...selectedAllergies, allergyName];
    
    setSelectedAllergies(newSelected);
    setHasChanges(true);
    setError('');
    setSuccessMessage('');
  };

  const handleSave = async () => {
    try {
      await updateAllergiesMutation.mutateAsync(selectedAllergies);
      setHasChanges(false);
      setSuccessMessage('Allergies updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update allergies');
    }
  };

  const handleReset = () => {
    setSelectedAllergies(user?.allergies?.map(a => a.name) || []);
    setHasChanges(false);
    setError('');
    setSuccessMessage('');
  };

  if (loadingAllergies) {
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
          <Shield className="h-5 w-5 text-red-600" />
          <span>Allergies & Intolerances</span>
          {!isEditing && (
            <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded-full ml-2">
              View Only
            </span>
          )}
        </h3>
        <p className="text-sm text-neutral-600 mt-1">
          {isEditing 
            ? "Select your allergies to ensure safe recipe recommendations and ingredient substitutions"
            : "Your current allergy information for recipe safety"
          }
        </p>
      </div>
      
      <div className="card-content space-y-4">
        {/* Warning Notice - Always show */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-amber-800">Important Safety Notice</p>
            <p className="text-amber-700 mt-1">
              Always verify ingredients and read labels carefully. This system provides guidance but cannot guarantee complete safety for severe allergies.
            </p>
          </div>
        </div>

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
              Click "Edit Profile" to modify your allergy information
            </p>
          </div>
        )}

        {/* Allergies Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {availableAllergies?.map((allergy) => {
            const isSelected = selectedAllergies.includes(allergy.name);
            return (
              <button
                key={allergy.id}
                onClick={() => handleToggleAllergy(allergy.name)}
                disabled={!isEditing}
                className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm font-medium ${
                  isSelected
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-neutral-200 bg-white text-neutral-700'
                } ${
                  isEditing 
                    ? 'hover:border-neutral-300 cursor-pointer' 
                    : 'cursor-default opacity-75'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  {isSelected && <AlertTriangle className="h-4 w-4" />}
                  <span className="capitalize">{allergy.name}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Current Selection Summary */}
        {selectedAllergies.length > 0 && (
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <h4 className="text-sm font-medium text-red-900 mb-2 flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>{isEditing ? 'Selected Allergy Alerts:' : 'Active Allergy Alerts:'}</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedAllergies.map((allergy) => (
                <span
                  key={allergy}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
                >
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {allergy}
                  {isEditing && (
                    <button
                      onClick={() => handleToggleAllergy(allergy)}
                      className="ml-2 hover:text-red-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {selectedAllergies.length === 0 && (
          <div className="text-center py-6 text-neutral-500">
            <Shield className="h-8 w-8 mx-auto mb-2 text-neutral-400" />
            <p>No allergies selected</p>
            {isEditing ? (
              <p className="text-sm">Select any allergies you have for safer recipe recommendations</p>
            ) : (
              <p className="text-sm">Great! No allergies on record</p>
            )}
          </div>
        )}

        {/* Action Buttons - Only show in edit mode */}
        {isEditing && hasChanges && (
          <div className="flex space-x-3 pt-4 border-t border-neutral-200">
            <button
              onClick={handleSave}
              disabled={updateAllergiesMutation.isPending}
              className="btn btn-primary flex-1"
            >
              {updateAllergiesMutation.isPending ? (
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
              disabled={updateAllergiesMutation.isPending}
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

export default AllergiesManager; 