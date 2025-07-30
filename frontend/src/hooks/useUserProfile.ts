import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserService } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';

export const useUserStats = () => {
  return useQuery({
    queryKey: ['userStats'],
    queryFn: UserService.getUserStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useDietaryRestrictions = () => {
  return useQuery({
    queryKey: ['dietaryRestrictions'],
    queryFn: UserService.getDietaryRestrictions,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useAllergies = () => {
  return useQuery({
    queryKey: ['allergies'],
    queryFn: UserService.getAllergies,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  return useMutation({
    mutationFn: UserService.updateProfile,
    onSuccess: (updatedUser) => {
      // Update auth context
      refreshUser();
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
    },
  });
};

export const useUpdateDietaryRestrictions = () => {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  return useMutation({
    mutationFn: UserService.updateDietaryRestrictions,
    onSuccess: () => {
      // Refresh user data to get updated restrictions
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
    },
  });
};

export const useUpdateAllergies = () => {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  return useMutation({
    mutationFn: UserService.updateAllergies,
    onSuccess: () => {
      // Refresh user data to get updated allergies
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
    },
  });
}; 