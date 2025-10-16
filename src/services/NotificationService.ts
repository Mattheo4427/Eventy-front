import { Notification, Message, Report, Transaction, Event, User, Conversation, FavoriteEvent } from '../types';

export class NotificationService {
  static createPurchaseConfirmation(
    userId: string,
    transaction: Transaction,
    event: Event
  ): Omit<Notification, 'id' | 'date'> {
    return {
      userId,
      type: 'purchase_confirmation',
      title: 'Achat confirmé !',
      message: `Votre achat pour "${event.title}" a été confirmé. Montant: ${transaction.price}€`,
      read: false,
      relatedId: transaction.id
    };
  }

  static createSaleSuccess(
    userId: string,
    transaction: Transaction,
    event: Event
  ): Omit<Notification, 'id' | 'date'> {
    return {
      userId,
      type: 'sale_success',
      title: 'Vente réussie !',
      message: `Votre billet pour "${event.title}" a été vendu pour ${transaction.price}€`,
      read: false,
      relatedId: transaction.id
    };
  }

  static createEventReminder(
    userId: string,
    event: Event,
    daysUntilEvent: number
  ): Omit<Notification, 'id' | 'date'> {
    const timeMessage = daysUntilEvent === 0 
      ? "aujourd'hui" 
      : daysUntilEvent === 1 
        ? "demain" 
        : `dans ${daysUntilEvent} jours`;
    
    return {
      userId,
      type: 'event_reminder',
      title: 'Rappel d\'événement',
      message: `N'oubliez pas ! "${event.title}" a lieu ${timeMessage} à ${event.location}`,
      read: false,
      relatedId: event.id
    };
  }

  static createNewMessageNotification(
    userId: string,
    message: Message,
    senderName: string
  ): Omit<Notification, 'id' | 'date'> {
    return {
      userId,
      type: 'message',
      title: 'Nouveau message',
      message: `${senderName}: ${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}`,
      read: false,
      relatedId: message.conversationId
    };
  }

  static createReportStatusUpdate(
    userId: string,
    report: Report,
    oldStatus: string
  ): Omit<Notification, 'id' | 'date'> {
    const statusMessages: Record<string, string> = {
      investigating: 'Votre signalement est en cours d\'examen',
      resolved: 'Votre signalement a été résolu',
      dismissed: 'Votre signalement a été rejeté'
    };

    return {
      userId,
      type: 'system',
      title: 'Mise à jour de signalement',
      message: statusMessages[report.status] || 'Le statut de votre signalement a été mis à jour',
      read: false,
      relatedId: report.id
    };
  }

  static createSystemNotification(
    userId: string,
    title: string,
    message: string,
    relatedId?: string
  ): Omit<Notification, 'id' | 'date'> {
    return {
      userId,
      type: 'system',
      title,
      message,
      read: false,
      relatedId
    };
  }

  static shouldSendEventReminder(event: Event): { shouldSend: boolean; daysUntil: number } {
    const eventDate = new Date(event.date);
    const now = new Date();
    const diffInDays = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    // Envoyer des rappels à 7 jours, 1 jour et le jour même
    const reminderDays = [7, 1, 0];
    const shouldSend = reminderDays.includes(diffInDays) && diffInDays >= 0;
    
    return { shouldSend, daysUntil: diffInDays };
  }

  static generateNotificationId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static generateFavoriteId(): string {
    return `fav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export class MessageService {
  static createConversation(
    participants: string[],
    ticketId?: string,
    eventId?: string
  ): Omit<Conversation, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      participants,
      relatedTicketId: ticketId,
      relatedEventId: eventId
    };
  }

  static createMessage(
    conversationId: string,
    senderId: string,
    receiverId: string,
    content: string
  ): Omit<Message, 'id' | 'date'> {
    return {
      conversationId,
      senderId,
      receiverId,
      content,
      read: false,
      type: 'text'
    };
  }

  static createSystemMessage(
    conversationId: string,
    content: string
  ): Omit<Message, 'id' | 'date'> {
    return {
      conversationId,
      senderId: 'system',
      receiverId: 'system',
      content,
      read: true,
      type: 'system'
    };
  }
}

export class ReportService {
  static createReport(
    reporterId: string,
    reportedType: Report['reportedType'],
    reportedId: string,
    reason: string,
    description: string
  ): Omit<Report, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      reporterId,
      reportedType,
      reportedId,
      reason,
      description,
      status: 'pending',
      priority: 'medium'
    };
  }

  static updateReportStatus(
    report: Report,
    newStatus: Report['status'],
    adminNotes?: string,
    resolvedBy?: string
  ): Partial<Report> {
    const updates: Partial<Report> = {
      status: newStatus,
      updatedAt: new Date().toISOString()
    };

    if (adminNotes) {
      updates.adminNotes = adminNotes;
    }

    if (newStatus === 'resolved' && resolvedBy) {
      updates.resolvedBy = resolvedBy;
      updates.resolvedAt = new Date().toISOString();
    }

    return updates;
  }

  static prioritizeReport(report: Report): Report['priority'] {
    // Logique de priorisation automatique
    const urgentKeywords = ['arnaque', 'fraude', 'menace', 'danger'];
    const highKeywords = ['faux', 'spam', 'inapproprié'];
    
    const content = (report.reason + ' ' + report.description).toLowerCase();
    
    if (urgentKeywords.some(keyword => content.includes(keyword))) {
      return 'urgent';
    }
    
    if (highKeywords.some(keyword => content.includes(keyword))) {
      return 'high';
    }
    
    return 'medium';
  }
}

export class FavoriteService {
  static createFavorite(
    userId: string,
    eventId: string
  ): Omit<FavoriteEvent, 'id'> {
    return {
      userId,
      eventId,
      addedAt: new Date().toISOString()
    };
  }

  static isFavorite(favorites: FavoriteEvent[], userId: string, eventId: string): boolean {
    return favorites.some(fav => fav.userId === userId && fav.eventId === eventId);
  }

  static removeFavorite(favorites: FavoriteEvent[], userId: string, eventId: string): FavoriteEvent[] {
    return favorites.filter(fav => !(fav.userId === userId && fav.eventId === eventId));
  }
}