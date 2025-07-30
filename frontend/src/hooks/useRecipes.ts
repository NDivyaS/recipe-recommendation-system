import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RecipeService, RecipeSearchParams, RecipeCreateData } from '../services/recipeService';
import { Recipe, PaginatedResponse } from '../types';

// Query keys for React Query
export const recipeKeys = {
  all: ['recipes'] as const,
  lists: () => [...recipeKeys.all, 'list'] as const,
  list: (params: RecipeSearchParams) => [...recipeKeys.lists(), params] as const,
  details: () => [...recipeKeys.all, 'detail'] as const,
  detail: (id: string) => [...recipeKeys.details(), id] as const,
  favorites: () => [...recipeKeys.all, 'favorites'] as const,
};

// Hook for searching/listing recipes
export const useRecipes = (params: RecipeSearchParams = {}) => {
  return useQuery({
    queryKey: recipeKeys.list(params),
    queryFn: () => RecipeService.searchRecipes(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for getting a single recipe
export const useRecipe = (id: string) => {
  return useQuery({
    queryKey: recipeKeys.detail(id),
    queryFn: () => RecipeService.getRecipe(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for getting favorite recipes
export const useFavoriteRecipes = (page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: [...recipeKeys.favorites(), page, limit],
    queryFn: () => RecipeService.getFavoriteRecipes(page, limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook for creating a recipe
export const useCreateRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RecipeCreateData) => RecipeService.createRecipe(data),
    onSuccess: () => {
      // Invalidate and refetch recipe lists
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
    },
  });
};

// Hook for updating a recipe
export const useUpdateRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RecipeCreateData> }) =>
      RecipeService.updateRecipe(id, data),
    onSuccess: (updatedRecipe) => {
      // Update the specific recipe in cache
      queryClient.setQueryData(
        recipeKeys.detail(updatedRecipe.id),
        updatedRecipe
      );
      // Invalidate recipe lists to reflect changes
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: recipeKeys.favorites() });
    },
  });
};

// Hook for deleting a recipe
export const useDeleteRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => RecipeService.deleteRecipe(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: recipeKeys.detail(deletedId) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: recipeKeys.favorites() });
    },
  });
};

// Hook for toggling favorite status
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => RecipeService.toggleFavorite(id),
    onSuccess: (result, recipeId) => {
      // Update the recipe in cache
      queryClient.setQueryData(
        recipeKeys.detail(recipeId),
        (oldData: Recipe | undefined) => {
          if (oldData) {
            return { ...oldData, isFavorited: result.isFavorited };
          }
          return oldData;
        }
      );

      // Update any recipe lists that might contain this recipe
      queryClient.setQueriesData(
        { queryKey: recipeKeys.lists() },
        (oldData: PaginatedResponse<Recipe> | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              recipes: oldData.recipes.map((recipe) =>
                recipe.id === recipeId
                  ? { ...recipe, isFavorited: result.isFavorited }
                  : recipe
              ),
            };
          }
          return oldData;
        }
      );

      // Invalidate favorites to reflect changes
      queryClient.invalidateQueries({ queryKey: recipeKeys.favorites() });
    },
  });
}; 