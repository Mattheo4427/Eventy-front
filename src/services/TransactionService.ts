import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { apiConfig } from '../config';
import { Transaction } from '../types';

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
  }
};