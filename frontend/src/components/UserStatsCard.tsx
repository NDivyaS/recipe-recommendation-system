import React from 'react';
import { useUserStats } from '../hooks/useUserProfile';
import { BarChart3, Heart, ShoppingCart, ChefHat, TrendingUp } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const UserStatsCard: React.FC = () => {
  const { data: stats, isLoading, error } = useUserStats();

  if (isLoading) {
    return (
      <div className="card">
        <div className="card-content">
          <LoadingSpinner className="py-8" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-neutral-900 flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Your Statistics</span>
          </h3>
        </div>
        <div className="card-content">
          <p className="text-neutral-500 text-center py-4">
            Unable to load statistics at the moment.
          </p>
        </div>
      </div>
    );
  }

  const statItems = [
    {
      label: 'Favorite Recipes',
      value: stats?.favoriteRecipes || 0,
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'Recipes you\'ve saved as favorites'
    },
    {
      label: 'Shopping Lists',
      value: stats?.shoppingLists || 0,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Shopping lists you\'ve created'
    },
    {
      label: 'Recipes Created',
      value: stats?.recipesCreated || 0,
      icon: ChefHat,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
      description: 'Your own recipe contributions'
    }
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold text-neutral-900 flex items-center space-x-2">
          <BarChart3 className="h-5 w-5" />
          <span>Your Statistics</span>
        </h3>
        <p className="text-sm text-neutral-600 mt-1">
          Track your cooking journey and activity
        </p>
      </div>
      
      <div className="card-content space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {statItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="relative overflow-hidden rounded-lg border border-neutral-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${item.bgColor}`}>
                    <Icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-2xl font-bold text-neutral-900">
                      {item.value}
                    </p>
                    <p className="text-sm font-medium text-neutral-700 truncate">
                      {item.label}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Progress Section */}
        {stats && (stats.favoriteRecipes > 0 || stats.shoppingLists > 0) && (
          <div className="border-t border-neutral-200 pt-4">
            <div className="flex items-center space-x-2 mb-3">
              <TrendingUp className="h-4 w-4 text-secondary-600" />
              <h4 className="text-sm font-medium text-neutral-900">Activity Summary</h4>
            </div>
            
            <div className="space-y-2 text-sm text-neutral-600">
              {stats.favoriteRecipes > 0 && (
                <p>🍳 You've favorited {stats.favoriteRecipes} recipe{stats.favoriteRecipes !== 1 ? 's' : ''}</p>
              )}
              {stats.shoppingLists > 0 && (
                <p>🛒 You've created {stats.shoppingLists} shopping list{stats.shoppingLists !== 1 ? 's' : ''}</p>
              )}
              {stats.recipesCreated > 0 && (
                <p>👨‍🍳 You've contributed {stats.recipesCreated} recipe{stats.recipesCreated !== 1 ? 's' : ''}</p>
              )}
              {stats.favoriteRecipes === 0 && stats.shoppingLists === 0 && stats.recipesCreated === 0 && (
                <p className="text-neutral-500 italic">Start exploring recipes to build your cooking profile!</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserStatsCard; 