import axios from 'axios';
import { Event, EventCategory, Ticket, User } from '../types';
import { apiConfig } from '../config';
import * as SecureStore from 'expo-secure-store'; // Import nécessaire pour récupérer le token

const EXPO_PUBLIC_API_GATEWAY_URL = apiConfig.baseUrl;
const api = axios.create({
  baseURL: EXPO_PUBLIC_API_GATEWAY_URL,
  headers: { 'Content-Type': 'application/json' }
});
// --- INTERCEPTEUR D'AUTHENTIFICATION ---
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
export const AdminService = {
  // --- Gestion Événements ---
  createEvent: async (eventData: Partial<Event>): Promise<Event> => {
    // POST /api/events
    const response = await api.post<Event>('/events', eventData);
    return response.data;
  },

  deleteEvent: async (eventId: string): Promise<void> => {
    await api.delete(`/events/${eventId}`);
  },

  updateEvent: async (id: string, data: any): Promise<Event> => {
    const response = await api.put<Event>(`/events/${id}`, data);
    return response.data;
  },

  // --- Gestion Tickets ---
  getAllTickets: async (): Promise<Ticket[]> => {
    // Supposons un endpoint admin qui liste tout
    // Backend: GET /api/tickets/admin/all
    const response = await api.get<Ticket[]>('/tickets/admin/all'); 
    return response.data;
  },

  createCategory: async (label: string): Promise<EventCategory> => {
    // POST /api/event-categories
    const response = await api.post<EventCategory>('/event-categories', { label });
    return response.data;
  },

  updateCategory: async (id: string, label: string): Promise<EventCategory> => {
    // PUT /api/event-categories/{id}
    const response = await api.put<EventCategory>(`/event-categories/${id}`, { label });
    return response.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    // DELETE /api/event-categories/{id}
    await api.delete(`/event-categories/${id}`);
  },
  /**
   * Récupère la liste de tous les utilisateurs (Admin only)
   */
  getAllUsers: async (): Promise<User[]> => {
    // Appel vers Users Service via Gateway
    // Endpoint Backend: GET /users/admin/users
    const response = await api.get<User[]>('/users/admin/users');
    return response.data;
  },

  /**
   * Suspend un utilisateur
   */
  suspendUser: async (userId: string): Promise<void> => {
    // Endpoint Backend: POST /users/admin/users/{id}/suspend
    await api.post(`/users/admin/users/${userId}/suspend`);
  },

  /**
   * Crée un nouvel utilisateur (Admin ou Standard)
   */
  createUser: async (userData: any): Promise<void> => {
    // Si on crée un admin, on utilise l'endpoint sécurisé
    if (userData.role === 'ADMIN') {
      await api.post('/users/admin/users/create-admin', userData);
    } else {
      // Sinon création standard
      await api.post('/users', userData);
    }
  },

  /**
   * Met à jour un utilisateur (Requiert implémentation backend PUT /users/admin/users/{id})
   */
  updateUser: async (id: string, userData: any): Promise<void> => {
    // TODO: Implémenter l'endpoint côté backend. 
    // Pour l'instant, cet appel échouera probablement (404 ou 405)
    await api.put(`/users/admin/users/${id}`, userData);
  },

  /**
   * Supprime un utilisateur définitivement
   */
  deleteUser: async (userId: string): Promise<void> => {
    // Endpoint Backend: DELETE /users/admin/users/{id}
    await api.delete(`/users/admin/users/${userId}`);
  }
};