import api from '../lib/api';
import { AuthResponse, LoginData, RegisterData, User } from '../types';

export class AuthService {
  private static tokenKey = 'authToken';
  private static userKey = 'user';

  static async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    this.setToken(response.data.token);
    this.setUser(response.data.user);
    return response.data;
  }

  static async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    this.setToken(response.data.token);
    this.setUser(response.data.user);
    return response.data;
  }

  static async getCurrentUser(): Promise<User> {
    const response = await api.get<{ user: User }>('/auth/me');
    this.setUser(response.data.user);
    return response.data.user;
  }

  static async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put<{ user: User }>('/auth/profile', data);
    this.setUser(response.data.user);
    return response.data.user;
  }

  static async updateDietaryRestrictions(restrictions: string[]): Promise<void> {
    await api.post('/auth/dietary-restrictions', { restrictions });
  }

  static async updateAllergies(allergies: string[]): Promise<void> {
    await api.post('/auth/allergies', { allergies });
  }

  static logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    window.location.href = '/login';
  }

  static getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  static setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  static getUser(): User | null {
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  static setUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  static isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }
} 