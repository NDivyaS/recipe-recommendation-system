import React, { useState, useEffect } from 'react';
import { Recipe } from '../types';
import { RecipeService } from '../services/recipeService';
import { ShoppingService, GenerateFromRecipesData } from '../services/shoppingService';
import LoadingSpinner from './LoadingSpinner';
import { X, Search, Plus, Minus, ShoppingCart } from 'lucide-react';

interface RecipeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShoppingListGenerated: (message: string) => void;
}

interface SelectedRecipe extends Recipe {
  selectedServings: number;
}

const RecipeSelectionModal: React.FC<RecipeSelectionModalProps> = ({
  isOpen,
  onClose,
  onShoppingListGenerated
}) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipes, setSelectedRecipes] = useState<SelectedRecipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [listName, setListName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Load recipes when modal opens
  useEffect(() => {
    if (isOpen) {
      loadRecipes();
    }
  }, [isOpen, searchQuery, currentPage]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedRecipes([]);
      setSearchQuery('');
      setListName('');
      setCurrentPage(1);
    }
  }, [isOpen]);

  const loadRecipes = async () => {
    try {
      setIsLoading(true);
      const response = await RecipeService.searchRecipes({
        q: searchQuery,
        page: currentPage,
        limit: 12
      });
      
      if (currentPage === 1) {
        setRecipes(response.data);
      } else {
        setRecipes(prev => [...prev, ...response.data]);
      }
      
      setHasNextPage(response.pagination.hasNext);
    } catch (error) {
      console.error('Failed to load recipes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handleRecipeSelect = (recipe: Recipe) => {
    const isSelected = selectedRecipes.some(r => r.id === recipe.id);
    
    if (isSelected) {
      setSelectedRecipes(prev => prev.filter(r => r.id !== recipe.id));
    } else {
      setSelectedRecipes(prev => [...prev, {
        ...recipe,
        selectedServings: recipe.servings
      }]);
    }
  };

  const handleServingChange = (recipeId: string, newServings: number) => {
    if (newServings < 1) return;
    
    setSelectedRecipes(prev =>
      prev.map(recipe =>
        recipe.id === recipeId
          ? { ...recipe, selectedServings: newServings }
          : recipe
      )
    );
  };

  const handleGenerateShoppingList = async () => {
    if (selectedRecipes.length === 0) return;

    try {
      setIsGenerating(true);
      
      const servingAdjustments = selectedRecipes.reduce((acc, recipe) => {
        acc[recipe.id] = recipe.selectedServings;
        return acc;
      }, {} as Record<string, number>);

      const data: GenerateFromRecipesData = {
        recipeIds: selectedRecipes.map(r => r.id),
        servingAdjustments,
        listName: listName.trim() || undefined
      };

      const result = await ShoppingService.generateFromRecipes(data);
      
      onShoppingListGenerated(
        `Shopping list generated successfully with ${result.shoppingList.items?.length || 0} ingredients from ${result.recipesUsed.length} recipes!`
      );
      onClose();
    } catch (error) {
      console.error('Failed to generate shopping list:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 className="text-2xl font-bold text-neutral-900">Generate Shopping List</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-200px)]">
          {/* Recipe Selection */}
          <div className="flex-1 p-6 border-r border-neutral-200 overflow-y-auto">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search recipes..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {isLoading && currentPage === 1 ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recipes.map((recipe) => {
                    const isSelected = selectedRecipes.some(r => r.id === recipe.id);
                    return (
                      <div
                        key={recipe.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                        onClick={() => handleRecipeSelect(recipe)}
                      >
                        {recipe.imageUrl && (
                          <img
                            src={recipe.imageUrl}
                            alt={recipe.title}
                            className="w-full h-32 object-cover rounded-lg mb-3"
                          />
                        )}
                        <h3 className="font-semibold text-neutral-900 mb-1">{recipe.title}</h3>
                        <p className="text-sm text-neutral-600 mb-2 line-clamp-2">
                          {recipe.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-neutral-500">
                          <span>{recipe.servings} servings</span>
                          <span>{(recipe.prepTime || 0) + (recipe.cookTime || 0)} min</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {hasNextPage && (
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={handleLoadMore}
                      disabled={isLoading}
                      className="btn btn-outline"
                    >
                      {isLoading ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Selected Recipes & Settings */}
          <div className="w-80 p-6 bg-neutral-50 overflow-y-auto">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Selected Recipes ({selectedRecipes.length})
            </h3>

            {selectedRecipes.length === 0 ? (
              <p className="text-neutral-500 text-center py-8">
                Select recipes from the left to add them to your shopping list
              </p>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {selectedRecipes.map((recipe) => (
                    <div key={recipe.id} className="bg-white rounded-lg p-4 border">
                      <h4 className="font-medium text-neutral-900 mb-2">{recipe.title}</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600">Servings:</span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleServingChange(recipe.id, recipe.selectedServings - 1)}
                            className="text-neutral-500 hover:text-neutral-700"
                            disabled={recipe.selectedServings <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-medium">
                            {recipe.selectedServings}
                          </span>
                          <button
                            onClick={() => handleServingChange(recipe.id, recipe.selectedServings + 1)}
                            className="text-neutral-500 hover:text-neutral-700"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-neutral-500 mt-2">
                        Original: {recipe.servings} servings
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mb-6">
                  <label htmlFor="listName" className="block text-sm font-medium text-neutral-700 mb-2">
                    Shopping List Name (Optional)
                  </label>
                  <input
                    type="text"
                    id="listName"
                    value={listName}
                    onChange={(e) => setListName(e.target.value)}
                    placeholder="e.g., Weekly Meal Prep"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-neutral-200 bg-white">
          <div className="text-sm text-neutral-600">
            {selectedRecipes.length > 0 && (
              <span>{selectedRecipes.length} recipes selected</span>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateShoppingList}
              disabled={selectedRecipes.length === 0 || isGenerating}
              className="btn btn-primary flex items-center"
            >
              {isGenerating ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Generating...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Generate Shopping List
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeSelectionModal; 