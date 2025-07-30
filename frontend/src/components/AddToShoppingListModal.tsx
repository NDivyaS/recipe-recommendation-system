import React, { useState, useEffect } from 'react';
import { Recipe, ShoppingList } from '../types';
import { ShoppingService } from '../services/shoppingService';
import LoadingSpinner from './LoadingSpinner';
import { X, Plus, ShoppingCart, List } from 'lucide-react';

interface AddToShoppingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe;
  onSuccess: (message: string) => void;
}

const AddToShoppingListModal: React.FC<AddToShoppingListModalProps> = ({
  isOpen,
  onClose,
  recipe,
  onSuccess
}) => {
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [newListName, setNewListName] = useState('');
  const [servings, setServings] = useState(recipe.servings);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadShoppingLists();
      setServings(recipe.servings);
      setNewListName('');
      setSelectedListId('');
      setIsCreatingNew(false);
    }
  }, [isOpen, recipe.servings]);

  const loadShoppingLists = async () => {
    try {
      setIsLoading(true);
      const response = await ShoppingService.getShoppingLists(1, 50); // Get more lists for selection
      const activeLists = response.shoppingLists.filter(list => !list.completed);
      setShoppingLists(activeLists);
      
      // Auto-select the first list if available
      if (activeLists.length > 0) {
        setSelectedListId(activeLists[0].id);
      } else {
        setIsCreatingNew(true);
      }
    } catch (error) {
      console.error('Failed to load shopping lists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (isCreatingNew && !newListName.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);

      if (isCreatingNew) {
        // Generate a new shopping list from this recipe
        const result = await ShoppingService.generateFromRecipes({
          recipeIds: [recipe.id],
          servingAdjustments: { [recipe.id]: servings },
          listName: newListName.trim()
        });
        
        onSuccess(`Added "${recipe.title}" to new shopping list "${result.shoppingList.name}"`);
      } else {
        // Add ingredients to existing shopping list
        if (!selectedListId) return;

        // Calculate serving multiplier
        const multiplier = servings / recipe.servings;

        // Add each ingredient to the shopping list
        if (recipe.ingredients) {
          const promises = recipe.ingredients.map(recipeIngredient =>
            ShoppingService.addItemToShoppingList(selectedListId, {
              ingredientId: recipeIngredient.ingredientId,
              quantity: recipeIngredient.quantity * multiplier,
              unit: recipeIngredient.unit,
              notes: `From ${recipe.title}`
            })
          );

          await Promise.all(promises);
        }

        const selectedList = shoppingLists.find(list => list.id === selectedListId);
        onSuccess(`Added "${recipe.title}" ingredients to "${selectedList?.name}"`);
      }

      onClose();
    } catch (error) {
      console.error('Failed to add recipe to shopping list:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 className="text-xl font-bold text-neutral-900">Add to Shopping List</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Recipe Info */}
          <div className="bg-neutral-50 rounded-lg p-4">
            <h3 className="font-semibold text-neutral-900">{recipe.title}</h3>
            <p className="text-sm text-neutral-600 mt-1">
              {recipe.ingredients?.length || 0} ingredients
            </p>
          </div>

          {/* Servings Adjustment */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Servings
            </label>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setServings(Math.max(1, servings - 1))}
                className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:bg-neutral-50"
              >
                -
              </button>
              <span className="w-12 text-center font-medium">{servings}</span>
              <button
                onClick={() => setServings(servings + 1)}
                className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:bg-neutral-50"
              >
                +
              </button>
              <span className="text-sm text-neutral-500">
                (Original: {recipe.servings})
              </span>
            </div>
          </div>

          {/* Shopping List Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              Add to
            </label>

            {isLoading ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner size="sm" />
              </div>
            ) : (
              <div className="space-y-3">
                {/* Create New List Option */}
                <div
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    isCreatingNew
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                  onClick={() => setIsCreatingNew(true)}
                >
                  <div className="flex items-center">
                    <Plus className="h-4 w-4 text-primary-600 mr-2" />
                    <span className="font-medium text-neutral-900">Create new list</span>
                  </div>
                </div>

                {isCreatingNew && (
                  <input
                    type="text"
                    placeholder="Enter list name..."
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    autoFocus
                  />
                )}

                {/* Existing Lists */}
                {shoppingLists.length > 0 && (
                  <>
                    <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                      Existing Lists
                    </div>
                    {shoppingLists.map((list) => (
                      <div
                        key={list.id}
                        className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                          !isCreatingNew && selectedListId === list.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                        onClick={() => {
                          setIsCreatingNew(false);
                          setSelectedListId(list.id);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <List className="h-4 w-4 text-neutral-500 mr-2" />
                            <span className="font-medium text-neutral-900">{list.name}</span>
                          </div>
                          <span className="text-xs text-neutral-500">
                            {list.items?.length || 0} items
                          </span>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {shoppingLists.length === 0 && !isCreatingNew && (
                  <p className="text-neutral-500 text-center py-4">
                    No active shopping lists found. Create a new one!
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-neutral-200">
          <button
            onClick={onClose}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              isLoading ||
              (isCreatingNew && !newListName.trim()) ||
              (!isCreatingNew && !selectedListId)
            }
            className="btn btn-primary flex items-center"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">Adding...</span>
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to List
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToShoppingListModal; 