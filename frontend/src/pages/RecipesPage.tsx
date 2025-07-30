import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRecipes } from '../hooks/useRecipes';
import { RecipeSearchParams } from '../services/recipeService';
import RecipeCard from '../components/RecipeCard';
import RecipeFilters from '../components/RecipeFilters';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  ChefHat, 
  Search, 
  Heart, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List
} from 'lucide-react';

const RecipesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Initialize filters from URL params
  const [filters, setFilters] = useState<RecipeSearchParams>(() => {
    const initialFilters: RecipeSearchParams = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: 12,
    };

    // Restore filters from URL
    if (searchParams.get('q')) initialFilters.q = searchParams.get('q')!;
    if (searchParams.get('cuisine')) initialFilters.cuisine = searchParams.get('cuisine')!;
    if (searchParams.get('difficulty')) initialFilters.difficulty = searchParams.get('difficulty') as any;
    if (searchParams.get('maxPrepTime')) initialFilters.maxPrepTime = parseInt(searchParams.get('maxPrepTime')!);
    if (searchParams.get('maxCookTime')) initialFilters.maxCookTime = parseInt(searchParams.get('maxCookTime')!);
    if (searchParams.get('minServings')) initialFilters.minServings = parseInt(searchParams.get('minServings')!);
    if (searchParams.get('maxServings')) initialFilters.maxServings = parseInt(searchParams.get('maxServings')!);
    if (searchParams.get('tags')) initialFilters.tags = searchParams.get('tags')!;
    if (searchParams.get('dietaryRestrictions')) initialFilters.dietaryRestrictions = searchParams.get('dietaryRestrictions')!;

    return initialFilters;
  });

  // Fetch recipes with current filters
  const { data, isLoading, error, isError } = useRecipes(filters);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, value.toString());
      }
    });

    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleFiltersChange = (newFilters: RecipeSearchParams) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({ page: 1, limit: 12 });
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
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
            <ChefHat className="h-8 w-8 text-primary-600" />
            <span>Recipes</span>
          </h1>
          <p className="text-neutral-600 mt-1">
            Discover delicious recipes tailored to your taste and dietary preferences
          </p>
        </div>

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

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn ${showFilters ? 'btn-primary' : 'btn-outline'}`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <RecipeFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          isLoading={isLoading}
        />
      )}

      {/* Quick Search Bar (when filters are hidden) */}
      {!showFilters && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Quick search recipes..."
            value={filters.q || ''}
            onChange={(e) => handleFiltersChange({ ...filters, q: e.target.value, page: 1 })}
            className="input pl-10 w-full"
            disabled={isLoading}
          />
        </div>
      )}

      {/* Results Summary */}
      {data && (
        <div className="flex items-center justify-between text-sm text-neutral-600">
          <div>
            Showing {recipes.length} of {pagination?.totalCount || 0} recipes
            {filters.q && (
              <span> for "{filters.q}"</span>
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
            <Search className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Recipes</h3>
            <p className="text-red-700 mb-4">
              {error?.message || 'Something went wrong while fetching recipes.'}
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
            <Search className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No Recipes Found</h3>
            <p className="text-neutral-600 mb-4">
              Try adjusting your search criteria or filters to find more recipes.
            </p>
            <button
              onClick={handleClearFilters}
              className="btn btn-outline"
            >
              Clear Filters
            </button>
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

      {/* Quick Actions */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-3">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn btn-primary btn-sm shadow-lg"
          title="Toggle filters"
        >
          <Filter className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="btn btn-outline btn-sm shadow-lg"
          title="Scroll to top"
        >
          ↑
        </button>
      </div>
    </div>
  );
};

export default RecipesPage; 