import api from '../lib/api';
import { ShoppingList, ShoppingListItem } from '../types';

export interface ShoppingListCreateData {
  name: string;
  items?: {
    ingredientId: string;
    quantity: number;
    unit: string;
    notes?: string;
  }[];
}

export interface GenerateFromRecipesData {
  recipeIds: string[];
  servingAdjustments?: Record<string, number>;
  listName?: string;
}

export interface ShoppingListsResponse {
  shoppingLists: ShoppingList[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface GenerateFromRecipesResponse {
  message: string;
  shoppingList: ShoppingList;
  recipesUsed: { id: string; title: string }[];
}

export class ShoppingService {
  // Get user's shopping lists
  static async getShoppingLists(page = 1, limit = 20): Promise<ShoppingListsResponse> {
    const response = await api.get<ShoppingListsResponse>(`/shopping/lists?page=${page}&limit=${limit}`);
    return response.data;
  }

  // Get single shopping list
  static async getShoppingList(id: string): Promise<ShoppingList> {
    const response = await api.get<{ shoppingList: ShoppingList }>(`/shopping/lists/${id}`);
    return response.data.shoppingList;
  }

  // Create new shopping list
  static async createShoppingList(data: ShoppingListCreateData): Promise<ShoppingList> {
    const response = await api.post<{ shoppingList: ShoppingList }>('/shopping/lists', data);
    return response.data.shoppingList;
  }

  // Generate shopping list from recipes
  static async generateFromRecipes(data: GenerateFromRecipesData): Promise<GenerateFromRecipesResponse> {
    const response = await api.post<GenerateFromRecipesResponse>('/shopping/generate-from-recipes', data);
    return response.data;
  }

  // Update shopping list
  static async updateShoppingList(id: string, data: { name?: string; completed?: boolean }): Promise<ShoppingList> {
    const response = await api.put<{ shoppingList: ShoppingList }>(`/shopping/lists/${id}`, data);
    return response.data.shoppingList;
  }

  // Delete shopping list
  static async deleteShoppingList(id: string): Promise<void> {
    await api.delete(`/shopping/lists/${id}`);
  }

  // Update shopping list item
  static async updateShoppingListItem(
    itemId: string, 
    data: { 
      quantity?: number; 
      unit?: string; 
      purchased?: boolean; 
      notes?: string; 
    }
  ): Promise<ShoppingListItem> {
    const response = await api.put<{ item: ShoppingListItem }>(`/shopping/items/${itemId}`, data);
    return response.data.item;
  }

  // Add item to shopping list
  static async addItemToShoppingList(
    listId: string,
    data: {
      ingredientId: string;
      quantity: number;
      unit: string;
      notes?: string;
    }
  ): Promise<ShoppingListItem> {
    const response = await api.post<{ item: ShoppingListItem }>(`/shopping/lists/${listId}/items`, data);
    return response.data.item;
  }

  // Remove item from shopping list
  static async removeItemFromShoppingList(itemId: string): Promise<void> {
    await api.delete(`/shopping/items/${itemId}`);
  }

  // Toggle item purchased status
  static async toggleItemPurchased(itemId: string, purchased: boolean): Promise<ShoppingListItem> {
    return this.updateShoppingListItem(itemId, { purchased });
  }
} 