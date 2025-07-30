import React, { useState, useEffect } from 'react';
import { Recipe, SubstitutionSuggestion } from '../types';
import { IngredientService, IngredientSuggestionsResponse } from '../services/ingredientService';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import { 
  Lightbulb, 
  RefreshCw, 
  Check, 
  X, 
  Leaf, 
  Shield, 
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface SubstitutionSuggestionsProps {
  recipe: Recipe;
  onApplySuggestion: (suggestion: SubstitutionSuggestion, selectedSubstitute: any) => void;
}

const SubstitutionSuggestions: React.FC<SubstitutionSuggestionsProps> = ({
  recipe,
  onApplySuggestion
}) => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<IngredientSuggestionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (recipe?.id && user) {
      loadSuggestions();
    }
  }, [recipe?.id, user]);

  const loadSuggestions = async () => {
    try {
      setIsLoading(true);
      
      // Get user's dietary restrictions from their profile
      const dietaryRestrictions = user?.dietaryRestrictions?.map(dr => dr.name.toLowerCase()) || [];
      
      const data = await IngredientService.getSubstitutionSuggestions(
        recipe.id,
        dietaryRestrictions
      );
      
      setSuggestions(data);
      setIsExpanded(data.suggestions.length > 0);
    } catch (error) {
      console.error('Failed to load substitution suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplySuggestion = (suggestion: SubstitutionSuggestion, substitute: any) => {
    onApplySuggestion(suggestion, substitute);
    setAppliedSuggestions(prev => new Set([...Array.from(prev), `${suggestion.original.id}-${substitute.id}`]));
  };

  const getDietaryBenefitIcon = (benefit: string) => {
    const lowerBenefit = benefit.toLowerCase();
    if (lowerBenefit.includes('vegan')) return <Leaf className="h-4 w-4 text-green-600" />;
    if (lowerBenefit.includes('vegetarian')) return <Leaf className="h-4 w-4 text-green-500" />;
    if (lowerBenefit.includes('gluten-free')) return <Shield className="h-4 w-4 text-amber-600" />;
    if (lowerBenefit.includes('dairy-free')) return <Shield className="h-4 w-4 text-blue-600" />;
    return <Shield className="h-4 w-4 text-neutral-500" />;
  };

  const getConflictType = (suggestion: SubstitutionSuggestion) => {
    const conflicts = [];
    
    // Check if it's for allergies
    if (user?.allergies?.some(allergy => 
      suggestion.original.allergens?.includes(allergy.name)
    )) {
      conflicts.push('allergen');
    }
    
    // Check if it's for dietary restrictions
    if (suggestion.substitutes.some(sub => sub.substitutionInfo.dietaryBenefit)) {
      conflicts.push('dietary');
    }
    
    return conflicts;
  };

  if (!user || isLoading) {
    if (isLoading) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <span className="text-sm text-yellow-800">Checking for personalized substitutions...</span>
            <LoadingSpinner size="sm" />
          </div>
        </div>
      );
    }
    return null;
  }

  if (!suggestions || suggestions.suggestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Lightbulb className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-900">
            Smart Substitution Suggestions
          </h3>
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
            {suggestions.suggestions.length} suggestion{suggestions.suggestions.length !== 1 ? 's' : ''}
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-700"
        >
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
      </div>

      <p className="text-blue-800 text-sm mb-4">
        Based on your dietary preferences and allergies, we found some ingredients that could be substituted:
      </p>

      {isExpanded && (
        <div className="space-y-4">
          {suggestions.suggestions.map((suggestion, index) => {
            const conflicts = getConflictType(suggestion);
            const hasAllergen = conflicts.includes('allergen');
            const hasDietaryConflict = conflicts.includes('dietary');

            return (
              <div
                key={`${suggestion.original.id}-${index}`}
                className="bg-white rounded-lg border border-blue-200 p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-neutral-900">
                        {suggestion.original.name}
                      </h4>
                      {hasAllergen && (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Allergen</span>
                        </div>
                      )}
                      {hasDietaryConflict && (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">
                          <Shield className="h-3 w-3" />
                          <span>Dietary Conflict</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-neutral-600 mb-3">
                      Recipe calls for: {suggestion.quantity} {suggestion.unit}
                    </p>

                    <div className="space-y-2">
                      {suggestion.substitutes.slice(0, 2).map((substitute) => {
                        const adjustedQuantity = suggestion.quantity * substitute.substitutionInfo.ratio;
                        const isApplied = appliedSuggestions.has(`${suggestion.original.id}-${substitute.id}`);

                        return (
                          <div
                            key={substitute.id}
                            className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                              isApplied 
                                ? 'border-green-300 bg-green-50' 
                                : 'border-neutral-200 hover:border-neutral-300'
                            }`}
                          >
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-neutral-900">
                                  {substitute.name}
                                </span>
                                {substitute.substitutionInfo.dietaryBenefit && (
                                  <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                    {getDietaryBenefitIcon(substitute.substitutionInfo.dietaryBenefit)}
                                    <span>{substitute.substitutionInfo.dietaryBenefit}</span>
                                  </div>
                                )}
                              </div>
                              <div className="text-sm text-neutral-600">
                                Use: {adjustedQuantity.toFixed(2)} {substitute.unit}
                                {substitute.substitutionInfo.ratio !== 1 && (
                                  <span className="text-amber-600 ml-2">
                                    (Ratio: {substitute.substitutionInfo.ratio}:1)
                                  </span>
                                )}
                              </div>
                              {substitute.substitutionInfo.flavorProfile && (
                                <div className="text-xs text-neutral-500 mt-1">
                                  Flavor: {substitute.substitutionInfo.flavorProfile}
                                </div>
                              )}
                            </div>
                            
                            <button
                              onClick={() => handleApplySuggestion(suggestion, substitute)}
                              disabled={isApplied}
                              className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                isApplied
                                  ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                              }`}
                            >
                              {isApplied ? (
                                <>
                                  <Check className="h-4 w-4" />
                                  <span>Applied</span>
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="h-4 w-4" />
                                  <span>Use This</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {suggestion.substitutes.length > 2 && (
                      <button className="text-blue-600 hover:text-blue-700 text-sm mt-2">
                        View {suggestion.substitutes.length - 2} more option{suggestion.substitutes.length - 2 !== 1 ? 's' : ''}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <div className="flex items-center justify-between pt-4 border-t border-blue-200">
            <div className="text-sm text-blue-700">
              {suggestions.userRestrictions.allergies.length > 0 && (
                <span>
                  Avoiding: {suggestions.userRestrictions.allergies.join(', ')}
                </span>
              )}
              {suggestions.userRestrictions.dietaryRestrictions.length > 0 && (
                <span className={suggestions.userRestrictions.allergies.length > 0 ? 'ml-4' : ''}>
                  Preferences: {suggestions.userRestrictions.dietaryRestrictions.join(', ')}
                </span>
              )}
            </div>
            <button
              onClick={loadSuggestions}
              className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubstitutionSuggestions; 