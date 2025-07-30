import api from '../lib/api';
import { AuthResponse, LoginFormData, RegisterFormData, User } from '../types';

export class AuthService {
  private static tokenKey = 'authToken';
  private static userKey = 'currentUser';

  // Login user
  static async login(data: LoginFormData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    
    // Store token and user data
    this.setToken(response.data.token);
    this.setUser(response.data.user);
    
    return response.data;
  }

  // Register user
  static async register(data: RegisterFormData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    
    // Store token and user data
    this.setToken(response.data.token);
    this.setUser(response.data.user);
    
    return response.data;
  }

  // Get current user from API
  static async getCurrentUser(): Promise<User> {
    const response = await api.get<{ user: User }>('/auth/me');
    const user = response.data.user;
    
    // Update stored user data
    this.setUser(user);
    
    return user;
  }

  // Update user profile
  static async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put<{ user: User }>('/auth/profile', data);
    const user = response.data.user;
    
    // Update stored user data
    this.setUser(user);
    
    return user;
  }

  // Update dietary restrictions
  static async updateDietaryRestrictions(restrictions: string[]): Promise<void> {
    await api.post('/auth/dietary-restrictions', { restrictions });
    
    // Refresh user data to get updated restrictions
    await this.getCurrentUser();
  }

  // Update allergies
  static async updateAllergies(allergies: string[]): Promise<void> {
    await api.post('/auth/allergies', { allergies });
    
    // Refresh user data to get updated allergies
    await this.getCurrentUser();
  }

  // Logout user
  static logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  // Token management
  static getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  static setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  // User data management
  static getUser(): User | null {
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  static setUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return !!this.getToken();
  }
} 