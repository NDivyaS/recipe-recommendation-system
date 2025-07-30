import React, { useState } from 'react';
import { ShoppingList, ShoppingListItem } from '../types';
import { ShoppingService } from '../services/shoppingService';
import { CheckCircle, Circle, Edit2, Trash2, Package, Calendar } from 'lucide-react';

interface ShoppingListCardProps {
  shoppingList: ShoppingList;
  onUpdate: (updatedList: ShoppingList) => void;
  onDelete: (listId: string) => void;
}

const ShoppingListCard: React.FC<ShoppingListCardProps> = ({
  shoppingList,
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(shoppingList.name);
  const [isUpdating, setIsUpdating] = useState(false);

  const totalItems = shoppingList.items?.length || 0;
  const purchasedItems = shoppingList.items?.filter(item => item.purchased).length || 0;
  const progressPercentage = totalItems > 0 ? (purchasedItems / totalItems) * 100 : 0;

  const handleNameUpdate = async () => {
    if (editedName.trim() === shoppingList.name) {
      setIsEditing(false);
      return;
    }

    try {
      setIsUpdating(true);
      const updatedList = await ShoppingService.updateShoppingList(shoppingList.id, {
        name: editedName.trim()
      });
      onUpdate(updatedList);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update shopping list name:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleCompleted = async () => {
    try {
      setIsUpdating(true);
      const updatedList = await ShoppingService.updateShoppingList(shoppingList.id, {
        completed: !shoppingList.completed
      });
      onUpdate(updatedList);
    } catch (error) {
      console.error('Failed to toggle shopping list completion:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleItemPurchased = async (item: ShoppingListItem) => {
    try {
      const updatedItem = await ShoppingService.toggleItemPurchased(item.id, !item.purchased);
      
      // Update the shopping list with the new item state
      const updatedItems = shoppingList.items?.map(i => 
        i.id === updatedItem.id ? updatedItem : i
      ) || [];
      
      const updatedList = {
        ...shoppingList,
        items: updatedItems
      };
      
      onUpdate(updatedList);
    } catch (error) {
      console.error('Failed to toggle item purchased status:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this shopping list?')) {
      try {
        await ShoppingService.deleteShoppingList(shoppingList.id);
        onDelete(shoppingList.id);
      } catch (error) {
        console.error('Failed to delete shopping list:', error);
      }
    }
  };

  // Group items by category
  const groupedItems = shoppingList.items?.reduce((groups, item) => {
    const category = item.ingredient?.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as Record<string, ShoppingListItem[]>) || {};

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden ${
      shoppingList.completed ? 'opacity-75' : ''
    }`}>
      {/* Header */}
      <div className="p-6 border-b border-neutral-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="text-xl font-semibold text-neutral-900 bg-transparent border-b border-primary-200 focus:border-primary-500 outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleNameUpdate();
                    if (e.key === 'Escape') {
                      setEditedName(shoppingList.name);
                      setIsEditing(false);
                    }
                  }}
                  autoFocus
                />
                <button
                  onClick={handleNameUpdate}
                  disabled={isUpdating}
                  className="text-primary-600 hover:text-primary-700"
                >
                  ✓
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <h3 className={`text-xl font-semibold ${
                  shoppingList.completed ? 'text-neutral-500 line-through' : 'text-neutral-900'
                }`}>
                  {shoppingList.name}
                </h3>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
            )}
            
            <div className="flex items-center space-x-4 mt-2 text-sm text-neutral-500">
              <span className="flex items-center">
                <Package className="h-4 w-4 mr-1" />
                {totalItems} items
              </span>
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(shoppingList.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleToggleCompleted}
              disabled={isUpdating}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                shoppingList.completed
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {shoppingList.completed ? 'Completed' : 'Mark Complete'}
            </button>
            <button
              onClick={handleDelete}
              className="text-neutral-400 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-neutral-600 mb-2">
            <span>Progress</span>
            <span>{purchasedItems}/{totalItems} items ({Math.round(progressPercentage)}%)</span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="p-6">
        {totalItems === 0 ? (
          <p className="text-neutral-500 text-center py-4">No items in this shopping list</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedItems).map(([category, items]) => (
              <div key={category}>
                <h4 className="text-sm font-medium text-neutral-700 mb-3 uppercase tracking-wide">
                  {category}
                </h4>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                        item.purchased ? 'bg-green-50' : 'hover:bg-neutral-50'
                      }`}
                    >
                      <button
                        onClick={() => handleToggleItemPurchased(item)}
                        className={`flex-shrink-0 transition-colors ${
                          item.purchased 
                            ? 'text-green-600 hover:text-green-700' 
                            : 'text-neutral-400 hover:text-neutral-600'
                        }`}
                      >
                        {item.purchased ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </button>
                      
                      <div className="flex-1">
                        <div className={`flex items-center justify-between ${
                          item.purchased ? 'text-neutral-500' : 'text-neutral-900'
                        }`}>
                          <span className={`font-medium ${
                            item.purchased ? 'line-through' : ''
                          }`}>
                            {item.ingredient?.name}
                          </span>
                          <span className="text-sm">
                            {item.quantity} {item.unit}
                          </span>
                        </div>
                        {item.notes && (
                          <p className="text-sm text-neutral-500 mt-1">{item.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingListCard; 