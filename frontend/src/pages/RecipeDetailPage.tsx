import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useRecipe, useToggleFavorite } from '../hooks/useRecipes';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  ChefHat, 
  Clock, 
  Users, 
  Heart, 
  ArrowLeft,
  Timer,
  Utensils,
  Star,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

const RecipeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: recipe, isLoading, error, isError } = useRecipe(id!);
  const toggleFavoriteMutation = useToggleFavorite();

  const handleFavoriteClick = () => {
    if (recipe) {
      toggleFavoriteMutation.mutate(recipe.id);
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'hard': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-neutral-600 bg-neutral-50 border-neutral-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError || !recipe) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Recipe Not Found</h3>
          <p className="text-red-700 mb-4">
            {error?.message || 'The recipe you\'re looking for doesn\'t exist or has been removed.'}
          </p>
          <Link to="/recipes" className="btn btn-primary">
            Back to Recipes
          </Link>
        </div>
      </div>
    );
  }

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="btn btn-ghost"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </button>

      {/* Recipe Header */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
        <div className="relative h-64 md:h-80 bg-neutral-100">
          {recipe.imageUrl ? (
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          ) : null}
          
          {/* Fallback */}
          <div 
            className={`absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center ${
              recipe.imageUrl ? 'hidden' : 'flex'
            }`}
          >
            <ChefHat className="h-16 w-16 text-primary-400" />
          </div>

          {/* Overlay Info */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            <div className="flex space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(recipe.difficulty)}`}>
                {recipe.difficulty}
              </span>
              {recipe.cuisine && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-neutral-900 bg-opacity-75 text-white">
                  {recipe.cuisine}
                </span>
              )}
            </div>

            <button
              onClick={handleFavoriteClick}
              disabled={toggleFavoriteMutation.isPending}
              className={`p-3 rounded-full shadow-lg transition-all duration-200 ${
                recipe.isFavorited
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-white text-neutral-600 hover:bg-neutral-50 hover:text-red-500'
              }`}
              title={recipe.isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              {toggleFavoriteMutation.isPending ? (
                <LoadingSpinner size="sm" className="h-5 w-5" />
              ) : (
                <Heart className={`h-5 w-5 ${recipe.isFavorited ? 'fill-current' : ''}`} />
              )}
            </button>
          </div>

          {/* Rating */}
          {recipe.rating && (
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded-full flex items-center space-x-1">
              <Star className="h-4 w-4 fill-current text-yellow-400" />
              <span className="font-medium">{recipe.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {/* Title and Description */}
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                {recipe.title}
              </h1>
              <p className="text-neutral-600 text-lg leading-relaxed">
                {recipe.description}
              </p>
            </div>

            {/* Recipe Meta */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-neutral-200">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-5 w-5 text-neutral-500" />
                </div>
                <div className="text-sm font-medium text-neutral-900">{formatTime(totalTime)}</div>
                <div className="text-xs text-neutral-500">Total Time</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-5 w-5 text-neutral-500" />
                </div>
                <div className="text-sm font-medium text-neutral-900">{recipe.servings}</div>
                <div className="text-xs text-neutral-500">Servings</div>
              </div>

              {recipe.prepTime && (
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Utensils className="h-5 w-5 text-neutral-500" />
                  </div>
                  <div className="text-sm font-medium text-neutral-900">{formatTime(recipe.prepTime)}</div>
                  <div className="text-xs text-neutral-500">Prep Time</div>
                </div>
              )}

              {recipe.cookTime && (
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Timer className="h-5 w-5 text-neutral-500" />
                  </div>
                  <div className="text-sm font-medium text-neutral-900">{formatTime(recipe.cookTime)}</div>
                  <div className="text-xs text-neutral-500">Cook Time</div>
                </div>
              )}
            </div>

            {/* Nutrition Info */}
            {(recipe.calories || recipe.protein || recipe.carbs || recipe.fat) && (
              <div className="bg-neutral-50 rounded-lg p-4">
                <h3 className="font-medium text-neutral-900 mb-3">Nutrition (per serving)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {recipe.calories && (
                    <div>
                      <div className="font-medium text-neutral-900">{recipe.calories}</div>
                      <div className="text-neutral-500">Calories</div>
                    </div>
                  )}
                  {recipe.protein && (
                    <div>
                      <div className="font-medium text-neutral-900">{recipe.protein}g</div>
                      <div className="text-neutral-500">Protein</div>
                    </div>
                  )}
                  {recipe.carbs && (
                    <div>
                      <div className="font-medium text-neutral-900">{recipe.carbs}g</div>
                      <div className="text-neutral-500">Carbs</div>
                    </div>
                  )}
                  {recipe.fat && (
                    <div>
                      <div className="font-medium text-neutral-900">{recipe.fat}g</div>
                      <div className="text-neutral-500">Fat</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tags */}
            {recipe.tags && recipe.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {recipe.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-block px-3 py-1 text-sm bg-secondary-100 text-secondary-800 rounded-full"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Ingredients */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-neutral-900">Ingredients</h2>
              <button
                className="btn btn-outline btn-sm"
                title="Add to shopping list"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to List
              </button>
            </div>

            <div className="space-y-3">
              {recipe.ingredients && recipe.ingredients.length > 0 ? (
                recipe.ingredients.map((ingredient, index) => (
                  <div
                    key={ingredient.id || index}
                    className="flex items-start space-x-3 p-3 rounded-lg border border-neutral-100 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-xs font-medium text-primary-600 mt-0.5">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-neutral-900">
                          {ingredient.quantity} {ingredient.unit}
                        </span>
                        <span className="text-neutral-600">
                          {ingredient.ingredient?.name}
                        </span>
                      </div>
                      {ingredient.notes && (
                        <p className="text-sm text-neutral-500 mt-1">{ingredient.notes}</p>
                      )}
                      {ingredient.ingredient?.allergens && ingredient.ingredient.allergens.length > 0 && (
                        <div className="flex items-center space-x-1 mt-1">
                          <AlertTriangle className="h-3 w-3 text-amber-500" />
                          <span className="text-xs text-amber-600">
                            Contains: {ingredient.ingredient.allergens.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-neutral-500 text-center py-4">No ingredients listed</p>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Instructions</h2>

            <div className="space-y-4">
              {recipe.instructions && Array.isArray(recipe.instructions) && recipe.instructions.length > 0 ? (
                recipe.instructions.map((instruction, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-4 p-4 rounded-lg border border-neutral-100"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-neutral-700 leading-relaxed">{instruction}</p>
                    </div>
                  </div>
                ))
              ) : typeof recipe.instructions === 'string' ? (
                <div className="prose prose-neutral max-w-none">
                  <p className="text-neutral-700 leading-relaxed whitespace-pre-line">
                    {recipe.instructions}
                  </p>
                </div>
              ) : (
                <p className="text-neutral-500 text-center py-8">No instructions available</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={handleFavoriteClick}
          disabled={toggleFavoriteMutation.isPending}
          className={`btn ${recipe.isFavorited ? 'btn-primary' : 'btn-outline'}`}
        >
          <Heart className={`h-4 w-4 mr-2 ${recipe.isFavorited ? 'fill-current' : ''}`} />
          {recipe.isFavorited ? 'Favorited' : 'Add to Favorites'}
        </button>

        <button className="btn btn-outline">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Shopping List
        </button>

        <button className="btn btn-ghost">
          <ExternalLink className="h-4 w-4 mr-2" />
          Share Recipe
        </button>
      </div>
    </div>
  );
};

export default RecipeDetailPage; 