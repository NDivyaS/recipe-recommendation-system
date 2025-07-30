import api from '../lib/api';
import { Recipe, PaginatedResponse } from '../types';

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

export interface RecipeCreateData {
  title: string;
  description: string;
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine: string;
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
  tags?: string[];
}

export class RecipeService {
  // Search and list recipes
  static async searchRecipes(params: RecipeSearchParams = {}): Promise<PaginatedResponse<Recipe>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await api.get<{
      recipes: Recipe[];
      pagination: {
        page: number;
        limit: number;
        totalCount: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    }>(`/recipes?${queryParams.toString()}`);
    
    // Transform the response to match our PaginatedResponse type
    return {
      data: response.data.recipes,
      pagination: response.data.pagination
    };
  }

  // Get single recipe by ID
  static async getRecipe(id: string): Promise<Recipe> {
    const response = await api.get<{ recipe: Recipe }>(`/recipes/${id}`);
    return response.data.recipe;
  }

  // Create new recipe
  static async createRecipe(data: RecipeCreateData): Promise<Recipe> {
    const response = await api.post<{ recipe: Recipe; message: string }>('/recipes', data);
    return response.data.recipe;
  }

  // Update recipe
  static async updateRecipe(id: string, data: Partial<RecipeCreateData>): Promise<Recipe> {
    const response = await api.put<{ recipe: Recipe; message: string }>(`/recipes/${id}`, data);
    return response.data.recipe;
  }

  // Delete recipe
  static async deleteRecipe(id: string): Promise<void> {
    await api.delete(`/recipes/${id}`);
  }

  // Toggle recipe favorite
  static async toggleFavorite(id: string): Promise<{ isFavorited: boolean; message: string }> {
    const response = await api.post<{ isFavorited: boolean; message: string }>(`/recipes/${id}/favorite`);
    return response.data;
  }

  // Get user's favorite recipes
  static async getFavoriteRecipes(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Recipe>> {
    const response = await api.get<{
      recipes: Recipe[];
      pagination: {
        page: number;
        limit: number;
        totalCount: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    }>(`/recipes/favorites/my?page=${page}&limit=${limit}`);
    
    // Transform the response to match our PaginatedResponse type
    return {
      data: response.data.recipes,
      pagination: response.data.pagination
    };
  }

  // Get popular cuisines (for filtering)
  static getPopularCuisines(): string[] {
    return [
      'Italian',
      'Mexican',
      'Chinese',
      'Indian',
      'Mediterranean',
      'Thai',
      'American',
      'French',
      'Japanese',
      'Greek'
    ];
  }

  // Get difficulty levels
  static getDifficultyLevels(): { value: string; label: string }[] {
    return [
      { value: 'easy', label: 'Easy' },
      { value: 'medium', label: 'Medium' },
      { value: 'hard', label: 'Hard' }
    ];
  }

  // Get common dietary restrictions for filtering
  static getDietaryFilters(): string[] {
    return [
      'vegetarian',
      'vegan',
      'gluten-free',
      'dairy-free',
      'nut-free',
      'low-carb',
      'keto',
      'paleo'
    ];
  }
} 