import axios from 'axios';
import { Event, EventCategory } from '../types';
import { apiConfig } from '../config';

// Création de l'instance Axios
// EXPO_PUBLIC_API_GATEWAY_URL doit être http://VOTRE_IP:8080/api
const EXPO_PUBLIC_API_GATEWAY_URL = apiConfig.baseUrl || 'http://localhost:8080/api';
const api = axios.create({
  baseURL: EXPO_PUBLIC_API_GATEWAY_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token si disponible (à implémenter avec votre AuthContext plus tard)
// Pour l'instant, les endpoints GET /events sont publics dans votre code Java actuel.

export const EventService = {
  /**
   * Récupère la liste des événements avec filtres optionnels
   */
  getAllEvents: async (search?: string, location?: string, categoryId?: string): Promise<Event[]> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (location && location !== 'all') params.append('location', location);
    if (categoryId && categoryId !== 'all') params.append('categoryId', categoryId);

    try {
      // Appel vers GET /api/events
      const response = await api.get<Event[]>('/events', { params });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des événements:', error);
      throw error;
    }
  },

  /**
   * Récupère un événement par son ID
   */
  getEventById: async (id: string): Promise<Event> => {
    try {
      const response = await api.get<Event>(`/events/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'événement ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupère les catégories (nécessite d'avoir créé le endpoint dans le back ou de les mocker)
   * Si vous n'avez pas encore le endpoint /event-categories, utilisez des données statiques temporaires.
   */
  getCategories: async (): Promise<EventCategory[]> => {
    try {
        // TODO: Décommenter quand le endpoint sera prêt
        // const response = await api.get<EventCategory[]>('/event-categories');
        // return response.data;
        
        // Mock temporaire pour tester l'UI
        return [
            { categoryId: 'all', label: 'Toutes' },
            { categoryId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', label: 'Musique' },
            { categoryId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', label: 'Sport' },
            { categoryId: 'cccccccc-cccc-cccc-cccc-cccccccccccc', label: 'Arts' },
            { categoryId: 'dddddddd-dddd-dddd-dddd-dddddddddddd', label: 'Technologie' }
        ];
    } catch (error) {
      console.error('Erreur catégories:', error);
      return [];
    }
  }
};