import React from 'react';
import { Link } from 'react-router-dom';
import { Recipe } from '../types';
import { useToggleFavorite } from '../hooks/useRecipes';
import { 
  Clock, 
  Users, 
  ChefHat, 
  Heart, 
  Star, 
  Timer,
  Utensils
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface RecipeCardProps {
  recipe: Recipe;
  showFavorite?: boolean;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, showFavorite = true }) => {
  const toggleFavoriteMutation = useToggleFavorite();

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking favorite
    e.stopPropagation();
    toggleFavoriteMutation.mutate(recipe.id);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'hard': return 'text-red-600 bg-red-50';
      default: return 'text-neutral-600 bg-neutral-50';
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <Link to={`/recipes/${recipe.id}`} className="block group">
      <div className="card hover:shadow-lg transition-all duration-200 group-hover:scale-[1.02]">
        {/* Recipe Image */}
        <div className="relative h-48 bg-neutral-100 rounded-t-lg overflow-hidden">
          {recipe.imageUrl ? (
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          ) : null}
          
          {/* Fallback when no image or image fails to load */}
          <div 
            className={`absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center ${
              recipe.imageUrl ? 'hidden' : 'flex'
            }`}
          >
            <ChefHat className="h-12 w-12 text-primary-400" />
          </div>

          {/* Favorite Button */}
          {showFavorite && (
            <button
              onClick={handleFavoriteClick}
              disabled={toggleFavoriteMutation.isPending}
              className={`absolute top-3 right-3 p-2 rounded-full shadow-lg transition-all duration-200 ${
                recipe.isFavorited
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-white text-neutral-600 hover:bg-neutral-50 hover:text-red-500'
              }`}
              title={recipe.isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              {toggleFavoriteMutation.isPending ? (
                <LoadingSpinner size="sm" className="h-4 w-4" />
              ) : (
                <Heart 
                  className={`h-4 w-4 ${recipe.isFavorited ? 'fill-current' : ''}`} 
                />
              )}
            </button>
          )}

          {/* Difficulty Badge */}
          <div className="absolute top-3 left-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
              {recipe.difficulty}
            </span>
          </div>

          {/* Rating Badge (if available) */}
          {recipe.rating && recipe.rating > 0 && (
            <div className="absolute bottom-3 left-3 bg-black bg-opacity-75 text-white px-2 py-1 rounded-full flex items-center space-x-1">
              <Star className="h-3 w-3 fill-current text-yellow-400" />
              <span className="text-xs font-medium">{recipe.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Recipe Content */}
        <div className="card-content">
          <div className="space-y-3">
            {/* Title and Cuisine */}
            <div>
              <h3 className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                {recipe.title}
              </h3>
              {recipe.cuisine && (
                <p className="text-sm text-neutral-500 mt-1">{recipe.cuisine}</p>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-neutral-600 line-clamp-2">
              {recipe.description}
            </p>

            {/* Recipe Meta Info */}
            <div className="flex items-center justify-between text-sm text-neutral-500">
              <div className="flex items-center space-x-4">
                {/* Prep + Cook Time */}
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatTime((recipe.prepTime || 0) + (recipe.cookTime || 0))}</span>
                </div>

                {/* Servings */}
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{recipe.servings}</span>
                </div>
              </div>

              {/* Calories */}
              {recipe.calories && (
                <div className="text-xs bg-neutral-100 text-neutral-700 px-2 py-1 rounded-full">
                  {recipe.calories} cal
                </div>
              )}
            </div>

            {/* Time Breakdown */}
            <div className="flex items-center space-x-4 text-xs text-neutral-500">
              {recipe.prepTime && (
                <div className="flex items-center space-x-1">
                  <Utensils className="h-3 w-3" />
                  <span>Prep: {formatTime(recipe.prepTime)}</span>
                </div>
              )}
              {recipe.cookTime && (
                <div className="flex items-center space-x-1">
                  <Timer className="h-3 w-3" />
                  <span>Cook: {formatTime(recipe.cookTime)}</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {recipe.tags && recipe.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {recipe.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-block px-2 py-1 text-xs bg-secondary-100 text-secondary-800 rounded-full"
                  >
                    {tag.name}
                  </span>
                ))}
                {recipe.tags.length > 3 && (
                  <span className="inline-block px-2 py-1 text-xs bg-neutral-100 text-neutral-600 rounded-full">
                    +{recipe.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RecipeCard; 