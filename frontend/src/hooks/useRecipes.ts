import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RecipeService, RecipeSearchParams, RecipeCreateData } from '../services/recipeService';
import { Recipe, PaginatedResponse } from '../types';
import { useAuth } from '../contexts/AuthContext';

// Query keys for React Query with user-specific caching
export const recipeKeys = {
  all: (userId?: string) => ['recipes', userId] as const,
  lists: (userId?: string) => [...recipeKeys.all(userId), 'list'] as const,
  list: (userId: string | undefined, params: RecipeSearchParams) => [...recipeKeys.lists(userId), params] as const,
  details: (userId?: string) => [...recipeKeys.all(userId), 'detail'] as const,
  detail: (userId: string | undefined, id: string) => [...recipeKeys.details(userId), id] as const,
  favorites: (userId: string) => [...recipeKeys.all(userId), 'favorites'] as const,
};

// Hook for searching/listing recipes
export const useRecipes = (params: RecipeSearchParams = {}) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: recipeKeys.list(user?.id, params),
    queryFn: () => RecipeService.searchRecipes(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
};

// Hook for getting a single recipe
export const useRecipe = (id: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: recipeKeys.detail(user?.id, id),
    queryFn: () => RecipeService.getRecipe(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for getting favorite recipes
export const useFavoriteRecipes = (page: number = 1, limit: number = 20) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: [...recipeKeys.favorites(user?.id || ''), page, limit],
    queryFn: () => RecipeService.getFavoriteRecipes(page, limit),
    enabled: !!user, // Only run if user is authenticated
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook for creating a recipe
export const useCreateRecipe = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (data: RecipeCreateData) => RecipeService.createRecipe(data),
    onSuccess: () => {
      // Invalidate and refetch recipe lists for current user
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists(user?.id) });
    },
  });
};

// Hook for updating a recipe
export const useUpdateRecipe = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RecipeCreateData> }) =>
      RecipeService.updateRecipe(id, data),
    onSuccess: (updatedRecipe) => {
      // Update the specific recipe in cache for current user
      queryClient.setQueryData(
        recipeKeys.detail(user?.id, updatedRecipe.id),
        updatedRecipe
      );
      // Invalidate recipe lists to reflect changes
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists(user?.id) });
      if (user) {
        queryClient.invalidateQueries({ queryKey: recipeKeys.favorites(user.id) });
      }
    },
  });
};

// Hook for deleting a recipe
export const useDeleteRecipe = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (id: string) => RecipeService.deleteRecipe(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache for current user
      queryClient.removeQueries({ queryKey: recipeKeys.detail(user?.id, deletedId) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists(user?.id) });
      if (user) {
        queryClient.invalidateQueries({ queryKey: recipeKeys.favorites(user.id) });
      }
    },
  });
};

// Hook for toggling favorite status
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (id: string) => RecipeService.toggleFavorite(id),
    onSuccess: (result, recipeId) => {
      if (!user) return;

      // Update the recipe in cache for current user
      queryClient.setQueryData(
        recipeKeys.detail(user.id, recipeId),
        (oldData: Recipe | undefined) => {
          if (oldData) {
            return { ...oldData, isFavorited: result.isFavorited };
          }
          return oldData;
        }
      );

      // Update any recipe lists that might contain this recipe for current user
      queryClient.setQueriesData(
        { queryKey: recipeKeys.lists(user.id) },
        (oldData: PaginatedResponse<Recipe> | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              data: oldData.data.map((recipe: Recipe) =>
                recipe.id === recipeId
                  ? { ...recipe, isFavorited: result.isFavorited }
                  : recipe
              ),
            };
          }
          return oldData;
        }
      );

      // Invalidate favorites to reflect changes for current user
      queryClient.invalidateQueries({ queryKey: recipeKeys.favorites(user.id) });
    },
  });
}; 