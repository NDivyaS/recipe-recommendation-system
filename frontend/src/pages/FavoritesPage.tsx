import React, { useState } from 'react';
import { useFavoriteRecipes } from '../hooks/useRecipes';
import RecipeCard from '../components/RecipeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Heart, 
  Search, 
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List
} from 'lucide-react';

const FavoritesPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const limit = 12;

  const { data, isLoading, error, isError } = useFavoriteRecipes(page, limit);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const recipes = data?.recipes || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 flex items-center space-x-3">
            <Heart className="h-8 w-8 text-red-500" />
            <span>My Favorites</span>
          </h1>
          <p className="text-neutral-600 mt-1">
            Your collection of favorite recipes, saved for easy access
          </p>
        </div>

        {recipes.length > 0 && (
          <div className="flex items-center space-x-3">
            {/* View Mode Toggle */}
            <div className="flex bg-neutral-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white shadow-sm text-neutral-900'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
                title="Grid view"
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white shadow-sm text-neutral-900'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
                title="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      {data && (
        <div className="flex items-center justify-between text-sm text-neutral-600">
          <div>
            {pagination?.totalCount === 0 ? (
              'No favorite recipes yet'
            ) : (
              `${recipes.length} of ${pagination?.totalCount || 0} favorite recipes`
            )}
          </div>
          
          {pagination?.totalCount && pagination.totalCount > 0 && (
            <div>
              Page {pagination.page} of {pagination.totalPages}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : isError ? (
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
            <Heart className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Favorites</h3>
            <p className="text-red-700 mb-4">
              {error?.message || 'Something went wrong while fetching your favorites.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-8 max-w-md mx-auto">
            <Heart className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No Favorite Recipes Yet</h3>
            <p className="text-neutral-600 mb-6">
              Start exploring recipes and save your favorites by clicking the heart icon on any recipe card.
            </p>
            <a href="/recipes" className="btn btn-primary">
              Discover Recipes
            </a>
          </div>
        </div>
      ) : (
        <>
          {/* Recipe Grid/List */}
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                showFavorite={true}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-8">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                className="btn btn-outline btn-sm"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </button>

              <div className="flex items-center space-x-1">
                {/* Page Numbers */}
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, pagination.page - 2) + i;
                  if (pageNum > pagination.totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 rounded-md text-sm ${
                        pageNum === pagination.page
                          ? 'bg-primary-600 text-white'
                          : 'text-neutral-600 hover:bg-neutral-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
                className="btn btn-outline btn-sm"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Stats Section */}
      {recipes.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-6 border border-red-100">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-red-100 rounded-full">
              <Heart className="h-6 w-6 text-red-600 fill-current" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">Recipe Collection</h3>
              <p className="text-neutral-600">
                You've saved {pagination?.totalCount || recipes.length} recipe{(pagination?.totalCount || recipes.length) !== 1 ? 's' : ''} to your favorites. 
                Keep exploring to discover more delicious recipes!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage; 