import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  Header,
  EventList,
  EventDetail,
  UserProfile,
  AdminPanel,
  SellTicketModal,
  BuyTicketModal,
  LoginModal,
  HomeScreen,
  NotificationCenter,
  MessagingCenter,
  FavoritesManager,
  ReportModal,
  ReportManagement
} from './src/components';
import {
  User,
  Event,
  Ticket,
  Transaction,
  Notification,
  Message,
  Conversation,
  FavoriteEvent,
  Report
} from './src/types';
import {
  NotificationService,
  MessageService,
  ReportService,
  FavoriteService
} from './src/services/NotificationService';

export default function App() {
  // État existant
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'events' | 'event-detail' | 'profile' | 'admin'>('home');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Nouvel état pour les nouvelles fonctionnalités
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessaging, setShowMessaging] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReportManagement, setShowReportManagement] = useState(false);
  const [reportContext, setReportContext] = useState<{
    type: 'user' | 'ticket' | 'transaction' | 'event' | 'other';
    id: string;
    name: string;
  } | null>(null);

  // Données des nouvelles fonctionnalités
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [favoriteEvents, setFavoriteEvents] = useState<FavoriteEvent[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Mock data existant + utilisateurs pour les conversations
  const [users] = useState<User[]>([
    {
      id: 'user1',
      name: 'Marie Dubois',
      email: 'marie@example.com',
      role: 'user'
    },
    {
      id: 'user2',
      name: 'Jean Martin',
      email: 'jean@example.com',
      role: 'user'
    },
    {
      id: 'user3',
      name: 'Sophie Laurent',
      email: 'sophie@example.com',
      role: 'user'
    }
  ]);

  const [events] = useState<Event[]>([
    {
      id: '1',
      title: 'Festival de Musique Électronique',
      description: 'Le plus grand festival de musique électronique de France avec les meilleurs DJs internationaux.',
      date: '2024-07-15',
      location: 'Paris',
      category: 'Festival',
      image: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGZlc3RpdmFsJTIwY3Jvd2R8ZW58MXx8fHwxNzU4NzE0NDU0fDA&ixlib=rb-4.1.0&q=80&w=1080',
      venue: 'Parc de la Villette'
    },
    {
      id: '2',
      title: 'Concert Rock Stadium',
      description: 'Concert exceptionnel dans un stade mythique avec des groupes légendaires.',
      date: '2024-08-20',
      location: 'Lyon',
      category: 'Concert',
      image: 'https://images.unsplash.com/photo-1647524904834-1ed784e73d2c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxjb25jZXJ0JTIwc3RhZGl1bSUyMGxpZ2h0c3xlbnwxfHx8fDE3NTg3MTQ0NTd8MA&ixlib=rb-4.1.0&q=80&w=1080',
      venue: 'Stade de Gerland'
    },
    {
      id: '3',
      title: 'Spectacle Théâtral',
      description: 'Une pièce théâtrale exceptionnelle avec des acteurs renommés.',
      date: '2024-09-10',
      location: 'Marseille',
      category: 'Théâtre',
      image: 'https://images.unsplash.com/photo-1609039504401-47ac3940f378?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdGVyJTIwc3RhZ2UlMjBzaG93fGVufDF8fHx8MTc1ODcxNDQ1OXww&ixlib=rb-4.1.0&q=80&w=1080',
      venue: 'Opéra Municipal'
    }
  ]);

  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: '1',
      eventId: '1',
      sellerId: 'user1',
      sellerName: 'Marie Dubois',
      price: 80,
      originalPrice: 100,
      section: 'VIP',
      row: 'A',
      seat: '12',
      description: 'Billet VIP avec accès aux loges',
      status: 'available'
    },
    {
      id: '2',
      eventId: '1',
      sellerId: 'user2',
      sellerName: 'Jean Martin',
      price: 60,
      originalPrice: 70,
      section: 'Standard',
      row: 'B',
      seat: '25',
      status: 'available'
    },
    {
      id: '3',
      eventId: '2',
      sellerId: 'user3',
      sellerName: 'Sophie Laurent',
      price: 120,
      originalPrice: 150,
      section: 'Tribune',
      row: 'C',
      seat: '8',
      description: 'Excellente vue sur la scène',
      status: 'available'
    }
  ]);

  // Effet pour les rappels d'événements
  useEffect(() => {
    if (!currentUser) return;

    const checkEventReminders = () => {
      favoriteEvents.forEach(favorite => {
        const event = events.find(e => e.id === favorite.eventId);
        if (event) {
          const { shouldSend, daysUntil } = NotificationService.shouldSendEventReminder(event);
          if (shouldSend) {
            // Vérifier si on n'a pas déjà envoyé ce rappel
            const existingReminder = notifications.find(
              n => n.relatedId === event.id && 
                   n.type === 'event_reminder' && 
                   n.message.includes(daysUntil === 0 ? "aujourd'hui" : daysUntil === 1 ? "demain" : `dans ${daysUntil} jours`)
            );
            
            if (!existingReminder) {
              const notification = NotificationService.createEventReminder(currentUser.id, event, daysUntil);
              addNotification(notification);
            }
          }
        }
      });
    };

    // Vérifier les rappels au montage et toutes les heures
    checkEventReminders();
    const interval = setInterval(checkEventReminders, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [currentUser, favoriteEvents, events, notifications]);

  // Fonctions pour les notifications
  const addNotification = (notificationData: Omit<Notification, 'id' | 'date'>) => {
    const notification: Notification = {
      id: NotificationService.generateNotificationId(),
      date: new Date().toISOString(),
      ...notificationData
    };
    setNotifications(prev => [notification, ...prev]);
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  const markAllNotificationsAsRead = () => {
    if (!currentUser) return;
    setNotifications(prev => prev.map(n => 
      n.userId === currentUser.id ? { ...n, read: true } : n
    ));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  // Fonctions pour la messagerie
  const createConversation = (participantId: string, ticketId?: string) => {
    if (!currentUser) return;
    
    const conversationData = MessageService.createConversation(
      [currentUser.id, participantId],
      ticketId,
      ticketId ? tickets.find(t => t.id === ticketId)?.eventId : undefined
    );
    
    const conversation: Conversation = {
      id: NotificationService.generateConversationId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...conversationData
    };
    
    setConversations(prev => [conversation, ...prev]);
    return conversation.id;
  };

  const sendMessage = (conversationId: string, content: string) => {
    if (!currentUser) return;
    
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) return;
    
    const receiverId = conversation.participants.find(id => id !== currentUser.id);
    if (!receiverId) return;
    
    const messageData = MessageService.createMessage(conversationId, currentUser.id, receiverId, content);
    const message: Message = {
      id: NotificationService.generateMessageId(),
      date: new Date().toISOString(),
      ...messageData
    };
    
    setMessages(prev => [...prev, message]);
    
    // Mettre à jour la conversation
    setConversations(prev => prev.map(c => 
      c.id === conversationId 
        ? { ...c, lastMessage: message, updatedAt: new Date().toISOString() }
        : c
    ));
    
    // Envoyer une notification au destinataire
    const senderName = currentUser.name;
    const notification = NotificationService.createNewMessageNotification(receiverId, message, senderName);
    addNotification(notification);
  };

  const markMessageAsRead = (messageId: string) => {
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, read: true } : m
    ));
  };

  // Fonctions pour les favoris
  const toggleFavorite = (eventId: string) => {
    if (!currentUser) return;
    
    const isFavorite = FavoriteService.isFavorite(favoriteEvents, currentUser.id, eventId);
    
    if (isFavorite) {
      setFavoriteEvents(prev => FavoriteService.removeFavorite(prev, currentUser.id, eventId));
    } else {
      const favoriteData = FavoriteService.createFavorite(currentUser.id, eventId);
      const favorite: FavoriteEvent = {
        id: NotificationService.generateFavoriteId(),
        ...favoriteData
      };
      setFavoriteEvents(prev => [...prev, favorite]);
    }
  };

  const removeFavorite = (eventId: string) => {
    if (!currentUser) return;
    setFavoriteEvents(prev => FavoriteService.removeFavorite(prev, currentUser.id, eventId));
  };

  // Fonctions pour les signalements
  const submitReport = async (reportData: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>) => {
    const report: Report = {
      id: NotificationService.generateReportId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...reportData,
      priority: ReportService.prioritizeReport(reportData as Report)
    };
    
    setReports(prev => [report, ...prev]);
    setShowReportModal(false);
    setReportContext(null);
  };

  const updateReportStatus = (reportId: string, status: Report['status'], notes?: string) => {
    setReports(prev => prev.map(r => {
      if (r.id === reportId) {
        const updates = ReportService.updateReportStatus(r, status, notes, currentUser?.id);
        const updatedReport = { ...r, ...updates };
        
        // Envoyer une notification au rapporteur
        const notification = NotificationService.createReportStatusUpdate(r.reporterId, updatedReport, r.status);
        addNotification(notification);
        
        return updatedReport;
      }
      return r;
    }));
  };

  const updateReportPriority = (reportId: string, priority: Report['priority']) => {
    setReports(prev => prev.map(r => 
      r.id === reportId 
        ? { ...r, priority, updatedAt: new Date().toISOString() }
        : r
    ));
  };

  const openReportModal = (type: 'user' | 'ticket' | 'transaction' | 'event' | 'other', id: string, name: string) => {
    setReportContext({ type, id, name });
    setShowReportModal(true);
  };

  // Fonctions existantes mises à jour
  const handleLogin = (email: string, password: string) => {
    const mockUser: User = {
      id: email.includes('admin') ? 'admin1' : `user_${Date.now()}`,
      name: email.includes('admin') ? 'Admin' : 'Utilisateur Test',
      email: email,
      role: email.includes('admin') ? 'admin' : 'user',
      phone: '+33 6 12 34 56 78'
    };
    setCurrentUser(mockUser);
    setShowLoginModal(false);
    
    // Notification de bienvenue
    const welcomeNotification = NotificationService.createSystemNotification(
      mockUser.id,
      'Bienvenue !',
      'Vous êtes maintenant connecté à votre compte.'
    );
    addNotification(welcomeNotification);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('home');
    setNotifications([]);
    setMessages([]);
    setConversations([]);
    setFavoriteEvents([]);
  };

  const handleViewEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    setCurrentView('event-detail');
  };

  const handleBuyTicket = (ticket: Ticket) => {
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }
    setSelectedTicket(ticket);
    setShowBuyModal(true);
  };

  const handleSellTicket = () => {
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }
    setShowSellModal(true);
  };

  const handleTicketPurchase = (ticketId: string) => {
    if (!currentUser || !selectedTicket) return;
    
    const ticket = tickets.find(t => t.id === ticketId);
    const event = events.find(e => e.id === ticket?.eventId);
    
    if (!ticket || !event) return;
    
    // Créer la transaction
    const transaction: Transaction = {
      id: `trans_${Date.now()}`,
      ticketId,
      buyerId: currentUser.id,
      sellerId: ticket.sellerId,
      price: ticket.price,
      date: new Date().toISOString(),
      status: 'completed'
    };
    
    setTransactions(prev => [...prev, transaction]);
    
    // Mettre à jour le statut du billet
    setTickets(prev => prev.map(t => 
      t.id === ticketId ? { ...t, status: 'sold' as const } : t
    ));
    
    // Envoyer les notifications
    const purchaseNotification = NotificationService.createPurchaseConfirmation(currentUser.id, transaction, event);
    addNotification(purchaseNotification);
    
    const saleNotification = NotificationService.createSaleSuccess(ticket.sellerId, transaction, event);
    addNotification(saleNotification);
    
    // Créer une conversation entre acheteur et vendeur
    createConversation(ticket.sellerId, ticketId);
    
    setShowBuyModal(false);
    setSelectedTicket(null);
  };

  const handleTicketListing = (ticketData: any) => {
    if (!currentUser) return;
    
    const newTicket: Ticket = {
      id: `ticket_${Date.now()}`,
      eventId: ticketData.eventId,
      sellerId: currentUser.id,
      sellerName: currentUser.name,
      price: ticketData.price,
      originalPrice: ticketData.originalPrice,
      section: ticketData.section,
      row: ticketData.row,
      seat: ticketData.seat,
      description: ticketData.description,
      status: 'available'
    };
    
    setTickets(prev => [...prev, newTicket]);
    setShowSellModal(false);
    
    // Notification de mise en vente
    const event = events.find(e => e.id === ticketData.eventId);
    if (event) {
      const notification = NotificationService.createSystemNotification(
        currentUser.id,
        'Billet mis en vente',
        `Votre billet pour "${event.title}" est maintenant en ligne !`
      );
      addNotification(notification);
    }
  };

  // Filtrer les données pour l'utilisateur actuel
  const userNotifications = currentUser ? notifications.filter(n => n.userId === currentUser.id) : [];
  const userFavorites = currentUser ? favoriteEvents.filter(f => f.userId === currentUser.id) : [];
  const userConversations = currentUser ? conversations.filter(c => c.participants.includes(currentUser.id)) : [];

  const selectedEvent = selectedEventId ? events.find(e => e.id === selectedEventId) : null;

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return (
          <HomeScreen
            events={events}
            onViewEvent={handleViewEvent}
            onNavigateToEvents={() => setCurrentView('events')}
          />
        );
      case 'events':
        return (
          <EventList 
            events={events}
            onViewEvent={handleViewEvent}
            onSellTicket={handleSellTicket}
            favoriteEvents={userFavorites}
            onToggleFavorite={toggleFavorite}
          />
        );
      case 'event-detail':
        if (!selectedEvent) return null;
        return (
          <EventDetail 
            event={selectedEvent}
            tickets={tickets.filter(t => t.eventId === selectedEvent.id && t.status === 'available')}
            onBuyTicket={handleBuyTicket}
            onBack={() => setCurrentView('events')}
            isFavorite={currentUser ? FavoriteService.isFavorite(userFavorites, currentUser.id, selectedEvent.id) : false}
            onToggleFavorite={() => toggleFavorite(selectedEvent.id)}
            onReportEvent={() => openReportModal('event', selectedEvent.id, selectedEvent.title)}
            onReportTicket={(ticketId: string, ticketName: string) => openReportModal('ticket', ticketId, ticketName)}
            onContactSeller={(sellerId: string) => {
              const conversationId = createConversation(sellerId);
              if (conversationId) setShowMessaging(true);
            }}
          />
        );
      case 'profile':
        if (!currentUser) return null;
        return (
          <UserProfile 
            user={currentUser}
            tickets={tickets.filter(t => t.sellerId === currentUser.id)}
            events={events}
            onReportUser={(userId: string, userName: string) => openReportModal('user', userId, userName)}
          />
        );
      case 'admin':
        if (!currentUser || currentUser.role !== 'admin') return null;
        return (
          <AdminPanel 
            tickets={tickets}
            events={events}
            onUpdateTicket={(ticketId: string, status: 'available' | 'sold' | 'pending') => {
              setTickets(prev => prev.map(ticket => 
                ticket.id === ticketId ? { ...ticket, status } : ticket
              ));
            }}
            onViewReports={() => setShowReportManagement(true)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        
        <Header 
          currentUser={currentUser}
          onLogin={() => setShowLoginModal(true)}
          onLogout={handleLogout}
          onNavigate={setCurrentView}
          currentView={currentView}
          notificationCount={userNotifications.filter(n => !n.read).length}
          messageCount={userConversations.filter(c => {
            const convMessages = messages.filter(m => m.conversationId === c.id);
            return convMessages.some(msg => !msg.read && msg.senderId !== currentUser?.id);
          }).length}
          onShowNotifications={() => setShowNotifications(true)}
          onShowMessages={() => setShowMessaging(true)}
          onShowFavorites={() => setShowFavorites(true)}
        />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderContent()}
        </ScrollView>

        {/* Modals existants */}
        <LoginModal 
          visible={showLoginModal}
          onLogin={handleLogin}
          onClose={() => setShowLoginModal(false)}
        />

        <SellTicketModal 
          visible={showSellModal}
          events={events}
          onSell={handleTicketListing}
          onClose={() => setShowSellModal(false)}
        />

        {selectedTicket && (
          <BuyTicketModal 
            visible={showBuyModal}
            ticket={selectedTicket}
            event={events.find(e => e.id === selectedTicket.eventId)!}
            onBuy={() => handleTicketPurchase(selectedTicket.id)}
            onClose={() => {
              setShowBuyModal(false);
              setSelectedTicket(null);
            }}
          />
        )}

        {/* Nouveaux modals */}
        <NotificationCenter
          visible={showNotifications}
          onClose={() => setShowNotifications(false)}
          notifications={userNotifications}
          onMarkAsRead={markNotificationAsRead}
          onMarkAllAsRead={markAllNotificationsAsRead}
          onDeleteNotification={deleteNotification}
        />

        <MessagingCenter
          visible={showMessaging}
          onClose={() => setShowMessaging(false)}
          conversations={userConversations}
          messages={messages}
          currentUser={currentUser!}
          users={users}
          onSendMessage={sendMessage}
          onCreateConversation={createConversation}
          onMarkAsRead={markMessageAsRead}
        />

        <FavoritesManager
          visible={showFavorites}
          onClose={() => setShowFavorites(false)}
          favoriteEvents={userFavorites}
          events={events}
          onRemoveFavorite={removeFavorite}
          onViewEvent={handleViewEvent}
        />

        {reportContext && (
          <ReportModal
            visible={showReportModal}
            onClose={() => {
              setShowReportModal(false);
              setReportContext(null);
            }}
            reportType={reportContext.type}
            reportedId={reportContext.id}
            reportedName={reportContext.name}
            onSubmitReport={submitReport}
            currentUserId={currentUser?.id || ''}
          />
        )}

        {currentUser?.role === 'admin' && (
          <ReportManagement
            visible={showReportManagement}
            onClose={() => setShowReportManagement(false)}
            reports={reports}
            onUpdateReportStatus={updateReportStatus}
            onUpdateReportPriority={updateReportPriority}
          />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
  },
});