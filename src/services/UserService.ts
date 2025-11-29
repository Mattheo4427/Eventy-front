import { api } from './api';
import { User } from '../types';

export const UserService = {
  /**
   * Récupère le profil complet de l'utilisateur connecté (inclus le solde à jour)
   */
  getProfile: async (): Promise<User> => {
    const response = await api.get<User>(`/users/me`);
    return response.data;
  },
  

  getUserById: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put<User>(`/users/me`, data);
    return response.data;
  },

  updatePassword: async (password: string): Promise<void> => {
    await api.put(`/users/me/password`, { password });
  }
};