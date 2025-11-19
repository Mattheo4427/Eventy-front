export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  phone?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  image: string;
  venue: string;
}

export interface Ticket {
  id: string;
  eventId: string;
  sellerId: string;
  sellerName: string;
  price: number;
  originalPrice: number;
  section: string;
  row: string;
  seat: string;
  description?: string;
  status: 'available' | 'sold' | 'pending';
}

export interface Transaction {
  id: string;
  ticketId: string;
  buyerId: string;
  sellerId: string;
  price: number;
  date: string;
  status: 'completed' | 'pending' | 'cancelled';
}

export interface Notification {
  id: string;
  userId: string;
  type: 'purchase_confirmation' | 'sale_success' | 'event_reminder' | 'message' | 'system';
  title: string;
  message: string;
  date: string;
  read: boolean;
  relatedId?: string; // ID de l'événement, transaction, etc.
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  date: string;
  read: boolean;
  type: 'text' | 'system';
}

export interface Conversation {
  id: string;
  participants: string[]; // IDs des utilisateurs
  lastMessage?: Message;
  relatedTicketId?: string;
  relatedEventId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FavoriteEvent {
  id: string;
  userId: string;
  eventId: string;
  addedAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reportedType: 'user' | 'ticket' | 'transaction' | 'event' | 'other';
  reportedId: string;
  reason: string;
  description: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  adminNotes?: string;
  resolvedBy?: string;
  resolvedAt?: string;
}