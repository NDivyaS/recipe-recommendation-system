import api from '../lib/api';
import { Ingredient, IngredientSubstitutes, SubstitutionSuggestion } from '../types';

export interface IngredientCreateData {
  name: string;
  category?: string;
  unit?: string;
  caloriesPerUnit?: number;
  proteinPerUnit?: number;
  carbsPerUnit?: number;
  fatPerUnit?: number;
  allergens?: string;
}

export interface SubstitutionCreateData {
  ratio?: number;
  dietaryBenefit?: string;
  flavorProfile?: string;
}

export interface IngredientSuggestionsResponse {
  suggestions: SubstitutionSuggestion[];
  userRestrictions: {
    allergies: string[];
    dietaryRestrictions: string[];
  };
}

export class IngredientService {
  // Get all ingredients with optional filtering
  static async getIngredients(params?: {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    ingredients: Ingredient[];
    pagination: {
      page: number;
      limit: number;
      totalCount: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await api.get(`/ingredients?${queryParams.toString()}`);
    return response.data;
  }

  // Get single ingredient by ID
  static async getIngredient(id: string): Promise<Ingredient> {
    const response = await api.get<{ ingredient: Ingredient }>(`/ingredients/${id}`);
    return response.data.ingredient;
  }

  // Create new ingredient
  static async createIngredient(data: IngredientCreateData): Promise<Ingredient> {
    const response = await api.post<{ ingredient: Ingredient }>('/ingredients', data);
    return response.data.ingredient;
  }

  // Get substitutes for a specific ingredient
  static async getIngredientSubstitutes(
    ingredientId: string,
    dietaryRestriction?: string
  ): Promise<IngredientSubstitutes> {
    const queryParams = new URLSearchParams();
    if (dietaryRestriction) {
      queryParams.append('dietaryRestriction', dietaryRestriction);
    }

    const response = await api.get<IngredientSubstitutes>(
      `/ingredients/${ingredientId}/substitutes?${queryParams.toString()}`
    );
    return response.data;
  }

  // Add substitution relationship between ingredients
  static async addIngredientSubstitution(
    originalId: string,
    substituteId: string,
    data: SubstitutionCreateData
  ): Promise<void> {
    await api.post(`/ingredients/${originalId}/substitutes/${substituteId}`, data);
  }

  // Get ingredient categories
  static async getIngredientCategories(): Promise<string[]> {
    const response = await api.get<{ categories: string[] }>('/ingredients/categories');
    return response.data.categories;
  }

  // Get personalized substitution suggestions for a recipe
  static async getSubstitutionSuggestions(
    recipeId: string,
    dietaryRestrictions?: string[]
  ): Promise<IngredientSuggestionsResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('recipeId', recipeId);
    
    if (dietaryRestrictions && dietaryRestrictions.length > 0) {
      queryParams.append('dietaryRestrictions', dietaryRestrictions.join(','));
    }

    const response = await api.get<IngredientSuggestionsResponse>(
      `/ingredients/suggest?${queryParams.toString()}`
    );
    return response.data;
  }

  // Search ingredients by name
  static async searchIngredients(query: string, limit = 10): Promise<Ingredient[]> {
    const response = await api.get<{
      ingredients: Ingredient[];
    }>(`/ingredients?search=${encodeURIComponent(query)}&limit=${limit}`);
    return response.data.ingredients;
  }
} 