import { api } from './api';
import { Transaction } from '../types';

export const TransactionService = {
  /**
   * Crée une transaction et récupère le secret de paiement
   */
  createPaymentIntent: async (ticketId: string, amount: number): Promise<{ clientSecret: string, transactionId: string }> => {
    // On appelle le backend pour préparer la transaction
    // Le backend doit contacter Stripe et nous renvoyer le client_secret
    const response = await api.post<{ clientSecret: string, transactionId: string }>('/transactions', {
      ticketId,
      amount,
      paymentMethod: 'CREDIT_CARD' // Par défaut pour Stripe
    });
    return response.data;
  },

  confirmTransaction: async (transactionId: string): Promise<void> => {
    // Appelle l'endpoint POST /transactions/{id}/confirm
    await api.post(`/transactions/${transactionId}/confirm`);
  },

  getMyHistory: async (): Promise<Transaction[]> => {
    const response = await api.get<Transaction[]>('/transactions/history');
    return response.data;
  },
  getMySales: async (): Promise<Transaction[]> => {
    const response = await api.get<Transaction[]>('/transactions/sales');
    return response.data;
  },
  cancelTransaction: async (transactionId: string): Promise<void> => {
    try {
      await api.post(`/transactions/${transactionId}/cancel`);
    } catch (error) {
      console.warn("Erreur lors de l'annulation de la transaction (peut déjà être annulée)", error);
    }
  },
  failTransaction: async (transactionId: string): Promise<void> => {
    try {
      await api.post(`/transactions/${transactionId}/fail`);
    } catch (error) {
      console.warn("Erreur lors du signalement de l'échec transaction", error);
    }
  }
};