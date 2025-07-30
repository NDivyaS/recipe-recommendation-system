import React from 'react';
import { 
  RefreshCw, 
  Leaf, 
  Shield, 
  TrendingUp, 
  Info,
  CheckCircle
} from 'lucide-react';

interface SubstitutionSummaryProps {
  substitutions: Record<string, any>;
  onClearAll: () => void;
}

const SubstitutionSummary: React.FC<SubstitutionSummaryProps> = ({
  substitutions,
  onClearAll
}) => {
  const substitutionArray = Object.values(substitutions);
  
  if (substitutionArray.length === 0) {
    return null;
  }

  const getDietaryBenefits = () => {
    const benefits = new Set<string>();
    substitutionArray.forEach(sub => {
      if (sub.substitute.substitutionInfo?.dietaryBenefit) {
        benefits.add(sub.substitute.substitutionInfo.dietaryBenefit);
      }
    });
    return Array.from(benefits);
  };

  const getTotalNutritionalImpact = () => {
    let totalCalories = 0;
    let totalProtein = 0;
    
    substitutionArray.forEach(sub => {
      if (sub.substitute.caloriesPerUnit) {
        totalCalories += sub.substitute.caloriesPerUnit * sub.adjustedQuantity;
      }
      if (sub.substitute.proteinPerUnit) {
        totalProtein += sub.substitute.proteinPerUnit * sub.adjustedQuantity;
      }
    });

    return { totalCalories, totalProtein };
  };

  const benefits = getDietaryBenefits();
  const { totalCalories, totalProtein } = getTotalNutritionalImpact();

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="bg-green-100 p-2 rounded-full">
            <RefreshCw className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-900">
              Recipe Adapted
            </h3>
            <p className="text-sm text-green-700">
              {substitutionArray.length} ingredient{substitutionArray.length !== 1 ? 's' : ''} substituted
            </p>
          </div>
        </div>
        <button
          onClick={onClearAll}
          className="text-green-600 hover:text-green-700 text-sm underline"
        >
          Clear All Substitutions
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Substitutions List */}
        <div>
          <h4 className="font-medium text-green-900 mb-3 flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            Applied Substitutions
          </h4>
          <div className="space-y-2">
            {substitutionArray.map((sub, index) => (
              <div key={index} className="bg-white rounded-lg p-3 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm">
                      <span className="text-neutral-500 line-through">
                        {sub.original.ingredient.name}
                      </span>
                      <span className="mx-2 text-green-600">→</span>
                      <span className="font-medium text-green-800">
                        {sub.substitute.name}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-600 mt-1">
                      {sub.adjustedQuantity.toFixed(1)} {sub.substitute.unit}
                    </div>
                  </div>
                  {sub.substitute.substitutionInfo?.dietaryBenefit && (
                    <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                      <Leaf className="h-3 w-3" />
                      <span>{sub.substitute.substitutionInfo.dietaryBenefit}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Summary */}
        <div>
          <h4 className="font-medium text-green-900 mb-3 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Benefits & Impact
          </h4>
          
          <div className="space-y-3">
            {/* Dietary Benefits */}
            {benefits.length > 0 && (
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Dietary Benefits</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {benefits.map((benefit, index) => (
                    <span 
                      key={index}
                      className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                    >
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Nutritional Impact */}
            {(totalCalories > 0 || totalProtein > 0) && (
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Info className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Nutritional Impact</span>
                </div>
                <div className="text-xs text-neutral-600 space-y-1">
                  {totalCalories > 0 && (
                    <div>Additional calories from substitutes: ~{Math.round(totalCalories)}</div>
                  )}
                  {totalProtein > 0 && (
                    <div>Additional protein: ~{totalProtein.toFixed(1)}g</div>
                  )}
                </div>
              </div>
            )}

            {/* Recipe Status */}
            <div className="bg-white rounded-lg p-3 border border-green-200">
              <div className="text-sm font-medium text-green-900 mb-1">Recipe Status</div>
              <div className="text-xs text-green-600">
                ✓ Adapted to your dietary preferences
              </div>
              <div className="text-xs text-green-600">
                ✓ Allergen conflicts resolved
              </div>
              <div className="text-xs text-green-600">
                ✓ Ready to cook with substitutes
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubstitutionSummary; 