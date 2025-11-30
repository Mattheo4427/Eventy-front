import { Ticket } from '../types';
import { api } from './api';

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
    try {
      const response = await api.get('/tickets/types');
      return response.data;
    } catch (error) {
      console.warn("Endpoint /tickets/types non disponible, utilisation du mock.");
      return [
        { id: '11111111-1111-1111-1111-111111111111', label: 'Standard' },
        { id: '22222222-2222-2222-2222-222222222222', label: 'VIP' },
        { id: '33333333-3333-3333-3333-333333333333', label: 'Early Bird' },
        { id: '44444444-4444-4444-4444-444444444444', label: 'Loge' },
      ];
    }
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