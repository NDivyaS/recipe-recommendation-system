import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { User, LoginFormData, RegisterFormData } from '../types';
import { AuthService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = AuthService.getToken();
      if (token) {
        try {
          const currentUser = await AuthService.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          console.error('Failed to get current user:', error);
          AuthService.logout();
          // Clear all cached data if token is invalid
          queryClient.clear();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [queryClient]);

  const login = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      // Clear any existing cached data before login
      queryClient.clear();
      
      const response = await AuthService.login(data);
      setUser(response.user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      // Clear any existing cached data before registration
      queryClient.clear();
      
      const response = await AuthService.register(data);
      setUser(response.user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear authentication data
    AuthService.logout();
    setUser(null);
    
    // CRITICAL: Clear all React Query cache to prevent data bleeding between users
    queryClient.clear();
    
    // Clear any additional local storage that might contain user-specific data
    localStorage.removeItem('userActivityHistory');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    // Invalidate user-related queries to ensure fresh data
    queryClient.invalidateQueries({ queryKey: ['users'] });
    queryClient.invalidateQueries({ queryKey: ['recipes'] });
  };

  const refreshUser = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
      // Invalidate all queries to ensure fresh data for the refreshed user
      queryClient.invalidateQueries();
    } catch (error) {
      console.error('Failed to refresh user:', error);
      logout();
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 