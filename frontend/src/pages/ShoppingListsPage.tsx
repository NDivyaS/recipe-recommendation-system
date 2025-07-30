import React from 'react';

const ShoppingListsPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-neutral-900">Shopping Lists</h1>
        <button className="btn btn-primary">
          Generate from Recipes
        </button>
      </div>

      <div className="card p-8 text-center">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Smart Shopping List System 🛒
        </h3>
        <p className="text-neutral-600 mb-6">
          The backend supports automatic shopping list generation from recipes with 
          intelligent ingredient consolidation and quantity calculations.
        </p>
        <div className="space-y-2 text-sm text-neutral-500">
          <p>✅ Generate lists from multiple recipes</p>
          <p>✅ Automatic ingredient consolidation</p>
          <p>✅ Serving size adjustments</p>
          <p>✅ Shopping progress tracking</p>
          <p>✅ Ingredient categorization</p>
        </div>
      </div>
    </div>
  );
};

export default ShoppingListsPage; 