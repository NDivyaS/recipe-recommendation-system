import React, { useState, useEffect } from 'react';
import { ShoppingList } from '../types';
import { ShoppingService } from '../services/shoppingService';
import ShoppingListCard from '../components/ShoppingListCard';
import RecipeSelectionModal from '../components/RecipeSelectionModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { Plus, ShoppingCart, AlertCircle } from 'lucide-react';

const ShoppingListsPage: React.FC = () => {
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    loadShoppingLists();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const loadShoppingLists = async (page = 1, append = false) => {
    try {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const response = await ShoppingService.getShoppingLists(page, 10);
      
      if (append) {
        setShoppingLists(prev => [...prev, ...response.shoppingLists]);
      } else {
        setShoppingLists(response.shoppingLists);
      }
      
      setHasNextPage(response.pagination.hasNext);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to load shopping lists:', error);
      setMessage({
        type: 'error',
        text: 'Failed to load shopping lists. Please try again.'
      });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    loadShoppingLists(currentPage + 1, true);
  };

  const handleShoppingListUpdate = (updatedList: ShoppingList) => {
    setShoppingLists(prev =>
      prev.map(list => list.id === updatedList.id ? updatedList : list)
    );
  };

  const handleShoppingListDelete = (listId: string) => {
    setShoppingLists(prev => prev.filter(list => list.id !== listId));
    setMessage({
      type: 'success',
      text: 'Shopping list deleted successfully.'
    });
  };

  const handleShoppingListGenerated = (successMessage: string) => {
    setMessage({
      type: 'success',
      text: successMessage
    });
    // Reload the first page to show the new list
    loadShoppingLists(1, false);
  };

  const activeShoppingLists = shoppingLists.filter(list => !list.completed);
  const completedShoppingLists = shoppingLists.filter(list => list.completed);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-neutral-900">Shopping Lists</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Generate from Recipes
          </button>
        </div>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center space-x-2 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <ShoppingCart className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Active Shopping Lists */}
      {activeShoppingLists.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">
            Active Lists ({activeShoppingLists.length})
          </h2>
          <div className="grid gap-6 lg:grid-cols-2">
            {activeShoppingLists.map((list) => (
              <ShoppingListCard
                key={list.id}
                shoppingList={list}
                onUpdate={handleShoppingListUpdate}
                onDelete={handleShoppingListDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Shopping Lists */}
      {completedShoppingLists.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">
            Completed Lists ({completedShoppingLists.length})
          </h2>
          <div className="grid gap-6 lg:grid-cols-2">
            {completedShoppingLists.map((list) => (
              <ShoppingListCard
                key={list.id}
                shoppingList={list}
                onUpdate={handleShoppingListUpdate}
                onDelete={handleShoppingListDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Load More */}
      {hasNextPage && (
        <div className="flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="btn btn-outline"
          >
            {isLoadingMore ? 'Loading...' : 'Load More Lists'}
          </button>
        </div>
      )}

      {/* Empty State */}
      {shoppingLists.length === 0 && (
        <div className="card p-8 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            No Shopping Lists Yet
          </h3>
          <p className="text-neutral-600 mb-6">
            Create your first shopping list by selecting recipes and generating a consolidated list
            with intelligent ingredient consolidation and quantity calculations.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
          >
            Generate from Recipes
          </button>
        </div>
      )}

      {/* Recipe Selection Modal */}
      <RecipeSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onShoppingListGenerated={handleShoppingListGenerated}
      />
    </div>
  );
};

export default ShoppingListsPage; 