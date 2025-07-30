// User and Authentication Types
export interface User {
  id: string;
  name: string;
  email: string;
  cookingSkillLevel: 'beginner' | 'intermediate' | 'advanced';
  bio?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  dietaryRestrictions?: DietaryRestriction[];
  allergies?: Allergy[];
}

export interface DietaryRestriction {
  id: string;
  name: string;
}

export interface Allergy {
  id: string;
  name: string;
}

// Recipe Types
export interface Recipe {
  id: string;
  title: string;
  description: string;
  instructions: string | string[];
  prepTime?: number;
  cookTime?: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine?: string;
  imageUrl?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  rating?: number;
  createdAt: string;
  updatedAt: string;
  ingredients?: RecipeIngredient[];
  tags?: RecipeTag[];
  isFavorited?: boolean;
}

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  unit: string;
  allergens?: string[];
  dietaryBenefit?: string;
  // Nutritional info per unit
  caloriesPerUnit?: number;
  proteinPerUnit?: number;
  carbsPerUnit?: number;
  fatPerUnit?: number;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeIngredient {
  id: string;
  recipeId: string;
  ingredientId: string;
  quantity: number;
  unit: string;
  notes?: string;
  ingredient?: Ingredient;
}

export interface RecipeTag {
  id: string;
  name: string;
  recipeId?: string;
}

// Shopping List Types
export interface ShoppingList {
  id: string;
  name: string;
  userId: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  items?: ShoppingListItem[];
}

export interface ShoppingListItem {
  id: string;
  shoppingListId: string;
  ingredientId: string;
  quantity: number;
  unit: string;
  purchased: boolean;
  notes?: string;
  ingredient?: Ingredient;
}

// Ingredient Substitution Types
export interface IngredientSubstitution {
  id: string;
  originalId: string;
  substituteId: string;
  ratio: number;
  dietaryBenefit?: string;
  flavorProfile?: string;
  original?: Ingredient;
  substitute?: Ingredient;
}

export interface SubstituteIngredient extends Ingredient {
  substitutionInfo: {
    ratio: number;
    dietaryBenefit?: string;
    flavorProfile?: string;
  };
}

export interface IngredientSubstitutes {
  original: Ingredient;
  substitutes: SubstituteIngredient[];
}

export interface SubstitutionSuggestion {
  original: Ingredient;
  quantity: number;
  unit: string;
  substitutes: SubstituteIngredient[];
}

// API Response Types
export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Search and Filter Types
export interface RecipeSearchParams {
  q?: string;
  cuisine?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  maxPrepTime?: number;
  maxCookTime?: number;
  minServings?: number;
  maxServings?: number;
  tags?: string;
  dietaryRestrictions?: string;
  page?: number;
  limit?: number;
}

export interface IngredientSearchParams {
  q?: string;
  category?: string;
  dietaryRestriction?: string;
  page?: number;
  limit?: number;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  cookingSkillLevel: 'beginner' | 'intermediate' | 'advanced';
} 