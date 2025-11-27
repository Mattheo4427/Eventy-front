import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { apiConfig } from '../config';
import { User } from '../types';

const EXPO_PUBLIC_API_GATEWAY_URL = apiConfig.baseUrl || 'http://localhost:8080/api';
const api = axios.create({
  baseURL: EXPO_PUBLIC_API_GATEWAY_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token si disponible (à implémenter avec votre AuthContext plus tard)
// Pour l'instant, les endpoints GET /events sont publics dans votre code Java actuel.
// Injecte le token Bearer dans chaque requête sortante
api.interceptors.request.use(
  async (config) => {
    try {
      // Récupère le token stocké par AuthContext lors du login
      const token = await SecureStore.getItemAsync('accessToken');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du token pour l'intercepteur:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- INTERCEPTEUR DE RÉPONSE (Optionnel mais recommandé) ---
// Gère les erreurs 401/403 globalement
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn("Erreur d'authentification (401/403) dans AdminService");
      // Ici, vous pourriez déclencher une déconnexion ou un refresh token si nécessaire
    }
    return Promise.reject(error);
  }
);

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
  }
};