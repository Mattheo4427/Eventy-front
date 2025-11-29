import { api } from './api';
import { Conversation, Message } from '../types';

export const InteractionService = {
  // Create or get existing conversation
  createConversation: async (participantId: string, ticketId?: string, eventId?: string): Promise<Conversation> => {
    const response = await api.post<Conversation>('/interactions/messages/conversations', {
      participantId,
      ticketId,
      eventId
    });
    return response.data;
  },

  // Get my conversations
  getMyConversations: async (): Promise<Conversation[]> => {
    const response = await api.get<Conversation[]>('/interactions/messages/conversations');
    return response.data;
  },

  // Get messages for a conversation
  getConversationMessages: async (conversationId: string): Promise<Message[]> => {
    const response = await api.get<Message[]>(`/interactions/messages/conversations/${conversationId}/messages`);
    return response.data;
  },

  // Send message to conversation
  sendMessage: async (conversationId: string, content: string): Promise<void> => {
    await api.post(`/interactions/messages/conversations/${conversationId}/messages`, {
      content
    });
  }
};
