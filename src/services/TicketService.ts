import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Ticket } from '../types';
import { apiConfig } from '../config';

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

export const TicketService = {
  /**
   * Mettre un billet en vente
   * Backend attend: TicketRequestDto
   */
  createTicket: async (ticketData: any): Promise<Ticket> => {
    // POST /tickets (via Gateway -> Tickets Service)
    const response = await api.post<Ticket>('/tickets', ticketData);
    return response.data;
  },

  /**
   * Récupérer les types de billets (Standard, VIP...)
   * Utile pour le formulaire
   */
  getTicketTypes: async (): Promise<any[]> => {
    // Mock pour le MVP si l'endpoint n'existe pas encore, ou appel réel
    return api.get('/tickets/types').then(r => r.data);
    
    // Retourne les IDs insérés par votre script SQL V2
    return [
      { id: '11111111-1111-1111-1111-111111111111', label: 'Standard' },
      { id: '22222222-2222-2222-2222-222222222222', label: 'VIP' },
      { id: '33333333-3333-3333-3333-333333333333', label: 'Early Bird' },
      { id: '44444444-4444-4444-4444-444444444444', label: 'Loge' },
    ];
  },

  getMyTickets: async (id: string): Promise<Ticket[]> => {
    // Backend: Il faudrait un endpoint GET /tickets/vendor/{id}
    // Sinon on filtre côté front (moins performant mais ok pour MVP)
    // Supposons que le backend a cet endpoint ou un filtre
    // Pour l'instant, on va utiliser un endpoint fictif ou filtrer getAll
    const response = await api.get<Ticket[]>(`/tickets/vendeur/${id}`);
    return response.data;
  },

  getTicketById: async (id: string): Promise<Ticket> => {
    const response = await api.get<Ticket>(`/tickets/${id}`);
    return response.data;
  }
};