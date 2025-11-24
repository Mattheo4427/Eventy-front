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

  // --- Gestion Utilisateurs ---
  getAllUsers: async (): Promise<User[]> => {
    // Backend: GET /api/users
    const response = await api.get<User[]>('/users');
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
  }
};