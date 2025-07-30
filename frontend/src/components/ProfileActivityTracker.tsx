import React, { useState, useEffect } from 'react';
import { UserService, ProfileActivity } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import { Activity, Clock, User, Leaf, Shield, RotateCcw, Trash2 } from 'lucide-react';

interface ProfileActivityTrackerProps {
  refreshTrigger?: number; // Optional prop to trigger refresh
}

const ProfileActivityTracker: React.FC<ProfileActivityTrackerProps> = ({ refreshTrigger }) => {
  const [activities, setActivities] = useState<ProfileActivity[]>([]);
  const [showAll, setShowAll] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadActivities();
    }
  }, [user, refreshTrigger]); // Refresh when user changes or trigger changes

  const loadActivities = () => {
    if (!user) return;
    const activityHistory = UserService.getActivityHistory(user.id);
    setActivities(activityHistory);
  };

  const clearHistory = () => {
    if (!user) return;
    UserService.clearActivityHistory(user.id);
    setActivities([]);
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const getActivityIcon = (action: string) => {
    if (action.toLowerCase().includes('profile')) return User;
    if (action.toLowerCase().includes('dietary')) return Leaf;
    if (action.toLowerCase().includes('allerg')) return Shield;
    return Activity;
  };

  const getActivityColor = (action: string) => {
    if (action.toLowerCase().includes('profile')) return 'text-blue-600 bg-blue-50';
    if (action.toLowerCase().includes('dietary')) return 'text-secondary-600 bg-secondary-50';
    if (action.toLowerCase().includes('allerg')) return 'text-red-600 bg-red-50';
    return 'text-neutral-600 bg-neutral-50';
  };

  const displayedActivities = showAll ? activities : activities.slice(0, 5);

  // Don't render if no user is logged in
  if (!user) {
    return null;
  }

  if (activities.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-neutral-900 flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Profile Activity</span>
          </h3>
          <p className="text-sm text-neutral-600 mt-1">
            Track your profile changes and updates
          </p>
        </div>
        
        <div className="card-content">
          <div className="text-center py-8 text-neutral-500">
            <Activity className="h-8 w-8 mx-auto mb-2 text-neutral-400" />
            <p>No activity recorded yet</p>
            <p className="text-sm">Start editing your profile to see your activity history</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Profile Activity</span>
              <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded-full">
                {activities.length}
              </span>
            </h3>
            <p className="text-sm text-neutral-600 mt-1">
              Track your profile changes and updates
            </p>
          </div>
          
          {activities.length > 0 && (
            <div className="flex space-x-2">
              <button
                onClick={loadActivities}
                className="btn btn-ghost btn-sm"
                title="Refresh activity"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={clearHistory}
                className="btn btn-ghost btn-sm"
                title="Clear activity history"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="card-content">
        <div className="space-y-3">
          {displayedActivities.map((activity) => {
            const Icon = getActivityIcon(activity.action);
            const colorClasses = getActivityColor(activity.action);
            
            return (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-3 rounded-lg border border-neutral-100 hover:bg-neutral-50 transition-colors"
              >
                <div className={`p-2 rounded-lg ${colorClasses}`}>
                  <Icon className="h-4 w-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-neutral-900">
                      {activity.action}
                    </p>
                    <div className="flex items-center space-x-1 text-xs text-neutral-500">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(activity.timestamp)}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-neutral-600 mt-1">
                    {activity.details}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Show More/Less Button */}
        {activities.length > 5 && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="btn btn-ghost btn-sm"
            >
              {showAll ? (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Show Less
                </>
              ) : (
                <>
                  Show All {activities.length} Activities
                </>
              )}
            </button>
          </div>
        )}

        {/* Activity Summary */}
        {activities.length > 0 && (
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-semibold text-neutral-900">
                  {activities.filter(a => a.action.toLowerCase().includes('profile')).length}
                </p>
                <p className="text-xs text-neutral-500">Profile Updates</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-neutral-900">
                  {activities.filter(a => a.action.toLowerCase().includes('dietary')).length}
                </p>
                <p className="text-xs text-neutral-500">Dietary Changes</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-neutral-900">
                  {activities.filter(a => a.action.toLowerCase().includes('allerg')).length}
                </p>
                <p className="text-xs text-neutral-500">Allergy Updates</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileActivityTracker; 