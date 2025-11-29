import { api } from './api';
import { FavoriteEvent } from '../types';

export const FavoriteService = {
  /**
   * Get all favorites for a user
   */
  getFavorites: async (userId: string): Promise<FavoriteEvent[]> => {
    const response = await api.get<any[]>(`/favorites/user/${userId}`);
    return response.data.map(fav => ({
      id: fav.favoriteId,
      userId: fav.userId,
      eventId: fav.event.eventId,
      addedAt: fav.addedDate
    }));
  },

  /**
   * Add an event to favorites
   */
  addFavorite: async (userId: string, eventId: string): Promise<FavoriteEvent> => {
    const payload = {
      userId,
      event: {
        eventId
      }
    };
    const response = await api.post<any>('/favorites', payload);
    return {
      id: response.data.favoriteId,
      userId: response.data.userId,
      eventId: response.data.event.eventId,
      addedAt: response.data.addedDate
    };
  },

  /**
   * Remove an event from favorites
   */
  removeFavorite: async (userId: string, eventId: string): Promise<void> => {
    await api.delete(`/favorites/user/${userId}/event/${eventId}`);
  }
};
