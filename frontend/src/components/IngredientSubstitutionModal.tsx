import React, { useState, useEffect } from 'react';
import { RecipeIngredient, SubstituteIngredient, IngredientSubstitutes } from '../types';
import { IngredientService } from '../services/ingredientService';
import LoadingSpinner from './LoadingSpinner';
import { 
  X, 
  RefreshCw, 
  Info, 
  Check, 
  Leaf, 
  Shield, 
  Wheat, 
  Heart,
  ChefHat,
  Scale
} from 'lucide-react';

interface IngredientSubstitutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipeIngredient: RecipeIngredient;
  onSubstitute: (originalIngredient: RecipeIngredient, substitute: SubstituteIngredient, adjustedQuantity: number) => void;
}

const IngredientSubstitutionModal: React.FC<IngredientSubstitutionModalProps> = ({
  isOpen,
  onClose,
  recipeIngredient,
  onSubstitute
}) => {
  const [substitutes, setSubstitutes] = useState<IngredientSubstitutes | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubstitute, setSelectedSubstitute] = useState<SubstituteIngredient | null>(null);
  const [dietaryFilter, setDietaryFilter] = useState<string>('');

  useEffect(() => {
    if (isOpen && recipeIngredient?.ingredientId) {
      loadSubstitutes();
    }
  }, [isOpen, recipeIngredient?.ingredientId, dietaryFilter]);

  const loadSubstitutes = async () => {
    try {
      setIsLoading(true);
      const data = await IngredientService.getIngredientSubstitutes(
        recipeIngredient.ingredientId,
        dietaryFilter || undefined
      );
      setSubstitutes(data);
      setSelectedSubstitute(null);
    } catch (error) {
      console.error('Failed to load substitutes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubstitute = () => {
    if (selectedSubstitute) {
      const adjustedQuantity = recipeIngredient.quantity * selectedSubstitute.substitutionInfo.ratio;
      onSubstitute(recipeIngredient, selectedSubstitute, adjustedQuantity);
      onClose();
    }
  };

  const getDietaryBenefitIcon = (benefit: string) => {
    const lowerBenefit = benefit.toLowerCase();
    if (lowerBenefit.includes('vegan')) return <Leaf className="h-4 w-4 text-green-600" />;
    if (lowerBenefit.includes('vegetarian')) return <Leaf className="h-4 w-4 text-green-500" />;
    if (lowerBenefit.includes('gluten-free')) return <Wheat className="h-4 w-4 text-amber-600" />;
    if (lowerBenefit.includes('dairy-free')) return <Shield className="h-4 w-4 text-blue-600" />;
    if (lowerBenefit.includes('low-fat')) return <Heart className="h-4 w-4 text-red-500" />;
    return <Info className="h-4 w-4 text-neutral-500" />;
  };

  const getFlavorProfileColor = (profile: string) => {
    const lowerProfile = profile.toLowerCase();
    if (lowerProfile.includes('similar')) return 'text-green-600 bg-green-50';
    if (lowerProfile.includes('milder')) return 'text-blue-600 bg-blue-50';
    if (lowerProfile.includes('stronger')) return 'text-orange-600 bg-orange-50';
    if (lowerProfile.includes('different')) return 'text-purple-600 bg-purple-50';
    return 'text-neutral-600 bg-neutral-50';
  };

  const dietaryFilters = [
    { value: '', label: 'All Substitutes' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'gluten-free', label: 'Gluten-Free' },
    { value: 'dairy-free', label: 'Dairy-Free' },
    { value: 'low-fat', label: 'Low-Fat' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">Find Substitutes</h2>
            <p className="text-sm text-neutral-600 mt-1">
              For: {recipeIngredient.ingredient?.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-col h-[calc(90vh-200px)]">
          {/* Original Ingredient Info */}
          <div className="p-6 bg-neutral-50 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-neutral-900">
                  {recipeIngredient.ingredient?.name}
                </h3>
                <p className="text-sm text-neutral-600">
                  {recipeIngredient.quantity} {recipeIngredient.unit}
                  {recipeIngredient.ingredient?.category && (
                    <span className="ml-2 text-neutral-500">
                      • {recipeIngredient.ingredient.category}
                    </span>
                  )}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-neutral-500">Current Recipe</div>
                {recipeIngredient.notes && (
                  <div className="text-xs text-neutral-400 mt-1">
                    {recipeIngredient.notes}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="p-4 border-b bg-white">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-neutral-700">
                Filter by dietary benefit:
              </label>
              <select
                value={dietaryFilter}
                onChange={(e) => setDietaryFilter(e.target.value)}
                className="px-3 py-1 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {dietaryFilters.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
              <button
                onClick={loadSubstitutes}
                disabled={isLoading}
                className="btn btn-ghost btn-sm"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Substitutes List */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : substitutes && substitutes.substitutes.length > 0 ? (
              <div className="space-y-4">
                {substitutes.substitutes.map((substitute) => {
                  const adjustedQuantity = recipeIngredient.quantity * substitute.substitutionInfo.ratio;
                  const isSelected = selectedSubstitute?.id === substitute.id;

                  return (
                    <div
                      key={substitute.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                      onClick={() => setSelectedSubstitute(substitute)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-neutral-900">
                              {substitute.name}
                            </h4>
                            {isSelected && (
                              <Check className="h-4 w-4 text-primary-600" />
                            )}
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-neutral-600 mb-3">
                            <span className="flex items-center">
                              <Scale className="h-4 w-4 mr-1" />
                              {adjustedQuantity.toFixed(2)} {substitute.unit}
                            </span>
                            {substitute.category && (
                              <span>{substitute.category}</span>
                            )}
                            {substitute.substitutionInfo.ratio !== 1 && (
                              <span className="text-amber-600">
                                Ratio: {substitute.substitutionInfo.ratio}:1
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {substitute.substitutionInfo.dietaryBenefit && (
                              <div className="flex items-center space-x-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs">
                                {getDietaryBenefitIcon(substitute.substitutionInfo.dietaryBenefit)}
                                <span>{substitute.substitutionInfo.dietaryBenefit}</span>
                              </div>
                            )}
                            {substitute.substitutionInfo.flavorProfile && (
                              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                                getFlavorProfileColor(substitute.substitutionInfo.flavorProfile)
                              }`}>
                                <ChefHat className="h-3 w-3" />
                                <span>{substitute.substitutionInfo.flavorProfile}</span>
                              </div>
                            )}
                          </div>

                          {/* Nutritional comparison */}
                          {(substitute.caloriesPerUnit || recipeIngredient.ingredient?.caloriesPerUnit) && (
                            <div className="mt-3 text-xs text-neutral-500">
                              <div className="flex items-center space-x-4">
                                {substitute.caloriesPerUnit && (
                                  <span>
                                    {Math.round(substitute.caloriesPerUnit * adjustedQuantity)} cal
                                  </span>
                                )}
                                {substitute.proteinPerUnit && (
                                  <span>
                                    {(substitute.proteinPerUnit * adjustedQuantity).toFixed(1)}g protein
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-neutral-400 mb-4">
                  <RefreshCw className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-neutral-600 mb-2">
                  No Substitutes Found
                </h3>
                <p className="text-neutral-500">
                  {dietaryFilter
                    ? `No ${dietaryFilter} substitutes available for this ingredient.`
                    : 'No substitutes are available for this ingredient.'
                  }
                </p>
                {dietaryFilter && (
                  <button
                    onClick={() => setDietaryFilter('')}
                    className="btn btn-outline btn-sm mt-4"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-neutral-200 bg-white">
          <div className="text-sm text-neutral-600">
            {selectedSubstitute && (
              <span>
                Will use {(recipeIngredient.quantity * selectedSubstitute.substitutionInfo.ratio).toFixed(2)} {selectedSubstitute.unit} instead
              </span>
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
              onClick={handleSubstitute}
              disabled={!selectedSubstitute}
              className="btn btn-primary flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Use Substitute
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IngredientSubstitutionModal; 