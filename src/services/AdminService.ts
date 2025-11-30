import { Event, EventCategory, Ticket, User, Transaction, Report } from '../types';
import { api } from './api';

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

  cancelTicket: async (ticketId: string): Promise<void> => {
    const response = await api.post(`/tickets/admin/${ticketId}/cancel`);
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

  reactivateUser: async (userId: string): Promise<void> => {
    // Endpoint Backend: POST /users/admin/users/{id}/reactivate
    await api.post(`/users/admin/users/${userId}/unsuspend`);
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

  updateUserPassword: async (id: string, password: string): Promise<void> => {
    await api.put(`/users/admin/users/${id}/password`, { password });
  },

  /**
   * Supprime un utilisateur définitivement
   */
  deleteUser: async (userId: string): Promise<void> => {
    // Endpoint Backend: DELETE /users/admin/users/{id}
    await api.delete(`/users/admin/users/${userId}`);
  },

  getAllTransactions: async (): Promise<Transaction[]> => {
    // Appel vers Transactions Service via Gateway
    // Endpoint Backend: GET /transactions/admin/all
    const response = await api.get<Transaction[]>('/transactions/admin/all');
    return response.data;
  },
  refundTransaction: async (transactionId: string): Promise<void> => {
    await api.post(`/transactions/admin/${transactionId}/refund`);
  },

  // --- Gestion Signalements ---
  getAllReports: async (): Promise<Report[]> => {
    // GET /reports/admin/all
    const response = await api.get<Report[]>('/interactions/reports/admin/all');
    return response.data;
  },

  updateReportStatus: async (reportId: number, status: string, adminAction: string): Promise<void> => {
    // PUT /reports/admin/{id}/status
    await api.put(`/interactions/reports/admin/${reportId}/status`, { status, adminAction });
  },
};