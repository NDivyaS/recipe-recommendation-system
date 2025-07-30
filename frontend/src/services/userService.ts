import api from '../lib/api';
import { User, DietaryRestriction, Allergy } from '../types';

export interface ProfileActivity {
  id: string;
  action: string;
  details: string;
  timestamp: string;
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
    // Log activity locally
    UserService.logActivity('Profile Updated', 'Personal information was updated');
    return response.data.user;
  }

  // Update dietary restrictions
  static async updateDietaryRestrictions(restrictions: string[]): Promise<void> {
    await api.post('/auth/dietary-restrictions', { restrictions });
    // Log activity locally
    UserService.logActivity('Dietary Restrictions Updated', `Updated to: ${restrictions.join(', ') || 'None'}`);
  }

  // Update allergies
  static async updateAllergies(allergies: string[]): Promise<void> {
    await api.post('/auth/allergies', { allergies });
    // Log activity locally
    UserService.logActivity('Allergies Updated', `Updated to: ${allergies.join(', ') || 'None'}`);
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

  // Activity tracking methods
  static logActivity(action: string, details: string): void {
    const activity: ProfileActivity = {
      id: Date.now().toString(),
      action,
      details,
      timestamp: new Date().toISOString()
    };

    const activities = UserService.getActivityHistory();
    activities.unshift(activity); // Add to beginning
    
    // Keep only last 50 activities
    const limitedActivities = activities.slice(0, 50);
    
    localStorage.setItem('userActivityHistory', JSON.stringify(limitedActivities));
  }

  static getActivityHistory(): ProfileActivity[] {
    try {
      const stored = localStorage.getItem('userActivityHistory');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static clearActivityHistory(): void {
    localStorage.removeItem('userActivityHistory');
  }
} 