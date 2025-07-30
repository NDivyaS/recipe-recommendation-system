import api from '../lib/api';
import { User, DietaryRestriction, Allergy } from '../types';

export interface ProfileActivity {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  userId: string; // Make activities user-specific
}

export class UserService {
  // Get all available dietary restrictions
  static async getDietaryRestrictions(): Promise<DietaryRestriction[]> {
    const response = await api.get<{ restrictions: DietaryRestriction[] }>('/users/dietary-restrictions');
    return response.data.restrictions;
  }

  // Get all available allergies
  static async getAllergies(): Promise<Allergy[]> {
    const response = await api.get<{ allergies: Allergy[] }>('/users/allergies');
    return response.data.allergies;
  }

  // Update user profile
  static async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put<{ user: User }>('/auth/profile', data);
    // Log activity locally for current user
    UserService.logActivity('Profile Updated', 'Personal information was updated', response.data.user.id);
    return response.data.user;
  }

  // Update dietary restrictions
  static async updateDietaryRestrictions(restrictions: string[]): Promise<void> {
    await api.post('/auth/dietary-restrictions', { restrictions });
    // Get current user ID from stored user data
    const currentUser = UserService.getCurrentUserFromStorage();
    if (currentUser) {
      UserService.logActivity('Dietary Restrictions Updated', `Updated to: ${restrictions.join(', ') || 'None'}`, currentUser.id);
    }
  }

  // Update allergies
  static async updateAllergies(allergies: string[]): Promise<void> {
    await api.post('/auth/allergies', { allergies });
    // Get current user ID from stored user data
    const currentUser = UserService.getCurrentUserFromStorage();
    if (currentUser) {
      UserService.logActivity('Allergies Updated', `Updated to: ${allergies.join(', ') || 'None'}`, currentUser.id);
    }
  }

  // Get user statistics
  static async getUserStats(): Promise<{
    favoriteRecipes: number;
    shoppingLists: number;
    recipesCreated: number;
  }> {
    const response = await api.get<{ stats: any }>('/users/stats');
    return response.data.stats;
  }

  // Activity tracking methods - now user-specific
  static logActivity(action: string, details: string, userId: string): void {
    const activity: ProfileActivity = {
      id: Date.now().toString(),
      action,
      details,
      timestamp: new Date().toISOString(),
      userId
    };

    const activities = UserService.getActivityHistory(userId);
    activities.unshift(activity); // Add to beginning
    
    // Keep only last 50 activities
    const limitedActivities = activities.slice(0, 50);
    
    // Store activities with user-specific key
    localStorage.setItem(`userActivityHistory_${userId}`, JSON.stringify(limitedActivities));
  }

  static getActivityHistory(userId?: string): ProfileActivity[] {
    if (!userId) {
      const currentUser = UserService.getCurrentUserFromStorage();
      if (!currentUser) return [];
      userId = currentUser.id;
    }

    try {
      const stored = localStorage.getItem(`userActivityHistory_${userId}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static clearActivityHistory(userId?: string): void {
    if (!userId) {
      const currentUser = UserService.getCurrentUserFromStorage();
      if (!currentUser) return;
      userId = currentUser.id;
    }
    localStorage.removeItem(`userActivityHistory_${userId}`);
  }

  // Helper method to get current user from localStorage
  private static getCurrentUserFromStorage(): User | null {
    try {
      const userData = localStorage.getItem('currentUser');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  // Clean up activities for all users except current (optional cleanup method)
  static cleanupOldUserActivities(currentUserId: string): void {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('userActivityHistory_') && !key.endsWith(currentUserId)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
} 