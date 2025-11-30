export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
  balance?: number;
  phone?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

/** 
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
*/

export interface Event {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  fullAddress?: string;
  imageUrl?: string;
  status: 'active' | 'canceled' | 'full';
  typeLabel?: string;
  categoryLabel?: string;
  priceRange?: string; // Pour affichage (ex: "30€ - 50€")
}

export interface EventCategory {
  categoryId: string;
  label: string;
}
export interface Ticket {
  id: string;
  eventId: string;
  
  // Infos Vendeur
  vendorId: string;    // Correspond à 'vendor_id' du backend
  sellerName?: string; // Champ enrichi par le DTO backend ou le front
  
  // Infos Billet
  ticketTypeLabel?: string; // Label du type (Standard, VIP...) via la relation TicketType
  
  // Prix
  originalPrice: number;
  salePrice: number;   // Le prix de vente effectif
  
  // Localisation
  section?: string;    // String en backend
  row?: number;        // Integer en backend
  seat?: string;
  
  // Statut & Gestion
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'CANCELED';
  
  // Codes (Optionnels car pas toujours exposés)
  barcode?: string;
  qrCode?: string;
  
  // Métadonnées
  creationDate?: string; // ISO String
}

export interface Transaction {
  id: string;             // UUID backend
  buyerId: string;        // UUID backend
  ticketId: string;       // UUID backend
  
  // Montants
  totalAmount: number;
  platformFee: number;
  vendorAmount: number;

  // Méthodes & Statuts (Alignés avec les Enums Java)
  paymentMethod: 'CREDIT_CARD' | 'PAYPAL' | 'APPLE_PAY' | 'GOOGLE_PAY';
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELED' | 'REFUNDED';
  
  paymentToken?: string;
  refundAddress?: string;

  // Dates
  transactionDate: string; // ISO String
  validationDate?: string; // ISO String
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
  id: number; // Backend uses Long
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  dateSent: string; // Backend field
  isRead: boolean; // Backend field
  messageType: 'GENERAL' | 'SYSTEM' | 'NEGOTIATION'; // Backend enum
}

export interface Conversation {
  id: string;
  participant1Id: string;
  participant2Id: string;
  lastMessage?: Message;
  unreadCount?: number;
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
  id: number;
  reporterId: string;
  
  // Cibles (Optionnels selon le type)
  reportedUserId?: string;
  reportedTicketId?: string;
  reportedTransactionId?: string;

  reportType: 'SPAM' | 'SCAM' | 'HARASSMENT' | 'OTHER';
  reason: string;
  description?: string;
  evidence?: string;
  
  status: 'PENDING' | 'UNDER_INVESTIGATION' | 'RESOLVED' | 'DISMISSED';
  
  reportDate: string; // ISO String
  
  adminAction?: string;
  adminId?: string;
}