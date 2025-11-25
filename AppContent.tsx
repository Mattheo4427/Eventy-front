import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, StatusBar, ActivityIndicator } from 'react-native'; // Ajout de ActivityIndicator
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
  ReportManagement,
  FavoriteButton
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
import { useAuth } from './src/contexts/AuthContext'; // Import corrigé
import { EventService } from './src/services/EventService';

export default function AppContent() {
  // === MODIFICATION ===
  // Récupère le vrai utilisateur, le statut de chargement et les fonctions depuis le contexte
  const { 
    user: currentUser, 
    isLoading: authLoading, 
    isAuthenticated, 
    logout,
    token // Récupère le token pour les appels API (à utiliser plus tard)
  } = useAuth();
  // ====================
  useEffect(() => {
    if (currentUser?.role === 'ADMIN') {
      setCurrentView('admin');
    }
  }, [currentUser]);
  
  const [currentView, setCurrentView] = useState<'home' | 'events' | 'event-detail' | 'profile' | 'admin'>('home');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // ... (tous les autres états restent identiques) ...
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [favoriteEvents, setFavoriteEvents] = useState<FavoriteEvent[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  // ... (toutes les fonctions addNotification, markNotificationAsRead, etc. restent identiques) ...
  // === MODIFICATION ===
  // Cette fonction locale est supprimée. 
  // Le 'onLogin' du Header ouvre le LoginModal, qui utilise 'login' du contexte.
  /*
  const handleLogin = (email: string, password: string) => {
    // ... (code supprimé)
  };
  */

  // === MODIFICATION ===
  // Cette fonction utilise maintenant le 'logout' du contexte
  const handleLogout = async () => {
    await logout(); // Appelle la fonction du contexte
    setCurrentView('home');
    setNotifications([]);
    setMessages([]);
    setConversations([]);
    setFavoriteEvents([]);
  };
  // ====================

  const handleViewEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    setCurrentView('event-detail');
  };
  
  // === MODIFICATION ===
  // Ces fonctions vérifient 'isAuthenticated' du contexte
  const handleBuyTicket = (ticket: Ticket) => {
    if (!isAuthenticated) { // Utilise isAuthenticated
      setShowLoginModal(true);
      return;
    }
    setSelectedTicket(ticket);
    setShowBuyModal(true);
  };

  const handleSellTicket = () => {
    if (!isAuthenticated) { // Utilise isAuthenticated
      setShowLoginModal(true);
      return;
    }
    setShowSellModal(true);
  };
  // ====================

  // ... (handleTicketPurchase et handleTicketListing restent identiques pour l'instant) ...
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
      //sellerId: ticket.sellerId,
      totalAmount: ticket.price,
      platformFee: 0, // À ajuster selon la logique métier
      vendorAmount: ticket.price, // À ajuster selon la logique métier
      transactionDate: new Date().toISOString(),
      status: 'COMPLETED',
      paymentMethod: 'CREDIT_CARD',
      paymentStatus: 'PAID'
    };
    
    setTransactions(prev => [...prev, transaction]);
    
    // Mettre à jour le statut du billet
    setTickets(prev => prev.map(t => 
      t.id === ticketId ? { ...t, status: 'sold' as const } : t
    ));
    
    // Envoyer les notifications (logique fictive)
    const purchaseNotification = NotificationService.createPurchaseConfirmation(currentUser.id, transaction, event);
    addNotification(purchaseNotification);
    
    const saleNotification = NotificationService.createSaleSuccess(ticket.sellerId, transaction, event);
    addNotification(saleNotification);
    
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
      status: 'available',
      salePrice: ticketData.price
    };
    
    setTickets(prev => [...prev, newTicket]);
    setShowSellModal(false);
    
    // Notification de mise en vente (logique fictive)
    const event = events.find(e => e.id === ticketData.eventId);
    if (event) {
      const notification = NotificationService.createSystemNotification(
        currentUser.id,
        'Billet mis en vente',
        `Votre billet pour "${event.name}" est maintenant en ligne !`
      );
      addNotification(notification);
    }
  };

  // ... (toute la logique de notification, message, favoris, report reste identique) ...
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
  const toggleFavorite = (eventId: string) => {
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }
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
  const updateReportStatus = (reportId: string, status: Report['status'] | 'in_review') => {
    // Accept legacy 'in_review' and map it to the Report type's 'investigating' value
    const mappedStatus: Report['status'] = status === 'in_review' ? 'investigating' : status as Report['status'];
    setReports(prev => prev.map(r => 
      r.id === reportId ? { ...r, status: mappedStatus, updatedAt: new Date().toISOString() } : r
    ));
  };
  const updateReportPriority = (reportId: string, priority: Report['priority'] | 1 | 2 | 3) => {
    // Accept the Report['priority'] string union and also normalize legacy numeric priorities
    const mapNumericToPriority = (p: 1 | 2 | 3): Report['priority'] => {
      switch (p) {
        case 1:
          return 'low';
        case 2:
          return 'medium';
        case 3:
          return 'high';
        default:
          return 'low';
      }
    };

    const normalized: Report['priority'] = typeof priority === 'number' ? mapNumericToPriority(priority) : priority;

    setReports(prev => prev.map(r => 
      r.id === reportId ? { ...r, priority: normalized, updatedAt: new Date().toISOString() } : r
    ));
  };
  const openReportModal = (type: 'user' | 'ticket' | 'transaction' | 'event' | 'other', id: string, name: string) => {
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }
    setReportContext({ type, id, name });
    setShowReportModal(true);
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
    setConversations(prev => prev.map(c => 
      c.id === conversationId 
        ? { ...c, lastMessage: message, updatedAt: new Date().toISOString() }
        : c
    ));
  };
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
  const markMessageAsRead = (messageId: string) => {
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, read: true } : m
    ));
  };
  // ... (fin de la logique de service fictive) ...

  const userNotifications = currentUser ? notifications.filter(n => n.userId === currentUser.id) : [];
  const userFavorites = currentUser ? favoriteEvents.filter(f => f.userId === currentUser.id) : [];
  const userConversations = currentUser ? conversations.filter(c => c.participants.includes(currentUser.id)) : [];

  const selectedEvent = selectedEventId ? events.find(e => e.id === selectedEventId) : null;

  // === AJOUT ===
  // Affiche un écran de chargement pendant que l'on vérifie le token
  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }
  // =============

  const renderContent = () => {
    // ... (votre switch/case reste identique) ...
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
            // EventList gère maintenant son propre chargement de données via le Service
            // Mais si vous passez des props, assurez-vous qu'elles matchent
            // Si EventList est autonome (comme codé précédemment), vous n'avez peut-être plus besoin de passer 'events' ici
            // Vérifiez la signature de votre composant EventList mis à jour.
            // Si EventList attend des props:
            /* events={events} */
            onViewEvent={handleViewEvent}
           /* onSellTicket={handleSellTicket}
            */
          />
        );
      case 'event-detail':
        if (!selectedEvent) return null;
        return (
          <EventDetail 
            event={selectedEvent}
            // Filtrer les tickets compatibles avec le nouveau modèle
            tickets={tickets.filter(t => t.eventId === selectedEvent.id && t.status === 'available')}
            onBuyTicket={handleBuyTicket}
            onBack={() => setCurrentView('events')}
            // ... autres props
          />
        );
      case 'profile':
        if (!currentUser) {
          // Si l'utilisateur arrive ici sans être connecté (ne devrait pas arriver), 
          // on le redirige ou on n'affiche rien.
          setCurrentView('home');
          return null;
        }
        return (
          <UserProfile 
            user={currentUser}
            tickets={tickets.filter(t => t.sellerId === currentUser.id)}
            events={events}
            // @ts-ignore
            onReportUser={(userId: string, userName: string) => openReportModal('user', userId, userName)}
          />
        );
      case 'admin':
        if (!currentUser || currentUser.role !== 'ADMIN') {
          setCurrentView('home');
          return null;
        }
        return (
          <AdminPanel 
            // Vous n'avez plus besoin de passer ces props si AdminPanel est autonome via AdminService
            // Sinon, adaptez selon votre implémentation de AdminPanel
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
          currentUser={currentUser} // Passe le vrai utilisateur (ou null)
          onLogin={() => setShowLoginModal(true)}
          onLogout={handleLogout} // Passe la nouvelle fonction de logout
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

        <View style={styles.content} /*showsVerticalScrollIndicator={false}*/>
          {renderContent()}
        </View>

        {/* Modals */}
        <LoginModal 
          visible={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />

        {/* ... (tous vos autres modals restent identiques) ... */}
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

        {currentUser?.role === 'ADMIN' && (
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
  // Style pour l'écran de chargement
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
  }
});