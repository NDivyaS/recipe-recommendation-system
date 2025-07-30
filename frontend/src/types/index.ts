// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  cookingSkillLevel: 'beginner' | 'intermediate' | 'advanced';
  bio?: string;
  dietaryRestrictions: DietaryRestriction[];
  allergies: Allergy[];
  createdAt: string;
  updatedAt: string;
}

export interface DietaryRestriction {
  id: string;
  name: string;
}

export interface Allergy {
  id: string;
  name: string;
}

// Recipe types
export interface Recipe {
  id: string;
  title: string;
  description?: string;
  instructions: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine?: string;
  imageUrl?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  ingredients: RecipeIngredient[];
  tags: RecipeTag[];
  isFavorited?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeIngredient {
  id: string;
  quantity: number;
  unit: string;
  notes?: string;
  ingredient: Ingredient;
}

export interface RecipeTag {
  id: string;
  name: string;
}

// Ingredient types
export interface Ingredient {
  id: string;
  name: string;
  category?: string;
  unit: string;
  caloriesPerUnit?: number;
  proteinPerUnit?: number;
  carbsPerUnit?: number;
  fatPerUnit?: number;
  allergens?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IngredientSubstitution {
  id: string;
  originalId: string;
  substituteId: string;
  ratio: number;
  dietaryBenefit?: string;
  flavorProfile?: string;
  original: Ingredient;
  substitute: Ingredient;
}

// Shopping list types
export interface ShoppingList {
  id: string;
  name: string;
  userId: string;
  completed: boolean;
  items: ShoppingListItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingListItem {
  id: string;
  shoppingListId: string;
  ingredientId: string;
  quantity: number;
  unit: string;
  purchased: boolean;
  notes?: string;
  ingredient: Ingredient;
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
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

// Auth types
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  cookingSkillLevel: 'beginner' | 'intermediate' | 'advanced';
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

// Search types
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
  page?: number;
  limit?: number;
}

// Form types
export interface RecipeFormData {
  title: string;
  description?: string;
  instructions: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine?: string;
  imageUrl?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  ingredients: {
    ingredientId: string;
    quantity: number;
    unit: string;
    notes?: string;
  }[];
  tags: string[];
}

export interface ShoppingListFormData {
  name: string;
  items?: {
    ingredientId: string;
    quantity: number;
    unit: string;
    notes?: string;
  }[];
}

// Shopping list generation
export interface GenerateShoppingListData {
  recipeIds: string[];
  servingAdjustments?: Record<string, number>;
  listName?: string;
}

// Ingredient suggestions
export interface IngredientSuggestion {
  original: Ingredient;
  quantity: number;
  unit: string;
  substitutes: (Ingredient & {
    substitutionRatio: number;
    dietaryBenefit?: string;
    flavorProfile?: string;
  })[];
}

export interface SuggestionResponse {
  suggestions: IngredientSuggestion[];
  userRestrictions: {
    dietary: string[];
    allergies: string[];
  };
} 