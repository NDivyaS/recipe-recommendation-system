import React from 'react';
import { RecipeSearchParams, RecipeService } from '../services/recipeService';
import { Search, Filter, X, Clock, Users, ChefHat } from 'lucide-react';

interface RecipeFiltersProps {
  filters: RecipeSearchParams;
  onFiltersChange: (filters: RecipeSearchParams) => void;
  onClearFilters: () => void;
  isLoading?: boolean;
}

const RecipeFilters: React.FC<RecipeFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  isLoading = false
}) => {
  const handleFilterChange = (key: keyof RecipeSearchParams, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
      page: 1 // Reset to first page when filters change
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== null && value !== ''
  );

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-6 space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
        <input
          type="text"
          placeholder="Search recipes..."
          value={filters.q || ''}
          onChange={(e) => handleFilterChange('q', e.target.value)}
          className="input pl-10 w-full"
          disabled={isLoading}
        />
      </div>

      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-neutral-600" />
          <h3 className="font-medium text-neutral-900">Filters</h3>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="btn btn-ghost btn-sm"
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </button>
        )}
      </div>

      {/* Filter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cuisine Filter */}
        <div>
          <label className="label">Cuisine</label>
          <select
            value={filters.cuisine || ''}
            onChange={(e) => handleFilterChange('cuisine', e.target.value || undefined)}
            className="input w-full"
            disabled={isLoading}
          >
            <option value="">All Cuisines</option>
            {RecipeService.getPopularCuisines().map((cuisine) => (
              <option key={cuisine} value={cuisine}>
                {cuisine}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty Filter */}
        <div>
          <label className="label">Difficulty</label>
          <select
            value={filters.difficulty || ''}
            onChange={(e) => handleFilterChange('difficulty', e.target.value || undefined)}
            className="input w-full"
            disabled={isLoading}
          >
            <option value="">All Levels</option>
            {RecipeService.getDifficultyLevels().map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        {/* Max Prep Time */}
        <div>
          <label className="label flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>Max Prep Time</span>
          </label>
          <select
            value={filters.maxPrepTime || ''}
            onChange={(e) => handleFilterChange('maxPrepTime', e.target.value ? parseInt(e.target.value) : undefined)}
            className="input w-full"
            disabled={isLoading}
          >
            <option value="">Any</option>
            <option value="15">15 min</option>
            <option value="30">30 min</option>
            <option value="45">45 min</option>
            <option value="60">1 hour</option>
            <option value="120">2 hours</option>
          </select>
        </div>

        {/* Max Cook Time */}
        <div>
          <label className="label flex items-center space-x-1">
            <ChefHat className="h-4 w-4" />
            <span>Max Cook Time</span>
          </label>
          <select
            value={filters.maxCookTime || ''}
            onChange={(e) => handleFilterChange('maxCookTime', e.target.value ? parseInt(e.target.value) : undefined)}
            className="input w-full"
            disabled={isLoading}
          >
            <option value="">Any</option>
            <option value="15">15 min</option>
            <option value="30">30 min</option>
            <option value="45">45 min</option>
            <option value="60">1 hour</option>
            <option value="120">2 hours</option>
            <option value="180">3 hours</option>
          </select>
        </div>
      </div>

      {/* Servings Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>Min Servings</span>
          </label>
          <input
            type="number"
            min="1"
            max="20"
            placeholder="1"
            value={filters.minServings || ''}
            onChange={(e) => handleFilterChange('minServings', e.target.value ? parseInt(e.target.value) : undefined)}
            className="input w-full"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="label flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>Max Servings</span>
          </label>
          <input
            type="number"
            min="1"
            max="20"
            placeholder="20"
            value={filters.maxServings || ''}
            onChange={(e) => handleFilterChange('maxServings', e.target.value ? parseInt(e.target.value) : undefined)}
            className="input w-full"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Dietary Restrictions */}
      <div>
        <label className="label">Dietary Preferences</label>
        <select
          value={filters.dietaryRestrictions || ''}
          onChange={(e) => handleFilterChange('dietaryRestrictions', e.target.value || undefined)}
          className="input w-full"
          disabled={isLoading}
        >
          <option value="">All Diets</option>
          {RecipeService.getDietaryFilters().map((diet) => (
            <option key={diet} value={diet}>
              {diet.charAt(0).toUpperCase() + diet.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Tags */}
      <div>
        <label className="label">Tags (comma-separated)</label>
        <input
          type="text"
          placeholder="e.g., healthy, quick, vegetarian"
          value={filters.tags || ''}
          onChange={(e) => handleFilterChange('tags', e.target.value)}
          className="input w-full"
          disabled={isLoading}
        />
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="border-t border-neutral-200 pt-4">
          <div className="flex flex-wrap gap-2">
            {filters.q && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
                Search: "{filters.q}"
                <button
                  onClick={() => handleFilterChange('q', undefined)}
                  className="ml-2 hover:text-primary-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            
            {filters.cuisine && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-secondary-100 text-secondary-800">
                {filters.cuisine}
                <button
                  onClick={() => handleFilterChange('cuisine', undefined)}
                  className="ml-2 hover:text-secondary-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {filters.difficulty && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                {filters.difficulty}
                <button
                  onClick={() => handleFilterChange('difficulty', undefined)}
                  className="ml-2 hover:text-yellow-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {filters.maxPrepTime && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                Prep ≤ {filters.maxPrepTime}m
                <button
                  onClick={() => handleFilterChange('maxPrepTime', undefined)}
                  className="ml-2 hover:text-blue-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {filters.dietaryRestrictions && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                {filters.dietaryRestrictions}
                <button
                  onClick={() => handleFilterChange('dietaryRestrictions', undefined)}
                  className="ml-2 hover:text-green-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeFilters; 