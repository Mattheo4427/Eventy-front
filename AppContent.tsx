import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, ActivityIndicator, Image, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  Header,
  EventList,
  EventDetail,
  UserProfile,
  AdminPanel,
  AdminDashboard,
  LoginModal,
  HomeScreen,
  NotificationCenter,
  MessagingCenter,
  EventTickets
} from './src/components';
import {
  Notification,
  FavoriteEvent,
  User
} from './src/types';
import {
  NotificationService
} from './src/services/NotificationService';
import { FavoriteService } from './src/services/FavoriteService';
import { InteractionService } from './src/services/InteractionService';
import { useAuth } from './src/contexts/AuthContext';

// Notifications removed for Expo Go compatibility (requires Dev Build on Android SDK 53+)
/*
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});
*/

export default function AppContent() {
  const { 
    user: currentUser, 
    isLoading: authLoading, 
    isAuthenticated, 
    logout
  } = useAuth();

  const [currentView, setCurrentView] = useState<'home' | 'events' | 'event-detail' | 'event-tickets' | 'profile' | 'admin' | 'admin-dashboard' | 'notifications' | 'messages'>('home');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // UI State for Modals
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessaging, setShowMessaging] = useState(false);
  const [profileInitialTab, setProfileInitialTab] = useState<'profile' | 'wallet' | 'tickets' | 'favorites'>('profile');
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Local Data State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [favoriteEvents, setFavoriteEvents] = useState<FavoriteEvent[]>([]);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  
  // Polling for new messages
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let lastCount = 0;

    const checkMessages = async () => {
      if (!currentUser) return;
      try {
        const conversations = await InteractionService.getMyConversations();
        const totalUnread = conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);
        
        setUnreadMessageCount(totalUnread);

        // If unread count increased, send notification
        if (totalUnread > lastCount) {
          // Find the conversation with the most recent unread message
          const unreadConvs = conversations.filter(c => (c.unreadCount || 0) > 0);
          // Sort by last message date desc
          unreadConvs.sort((a, b) => {
             const dateA = a.lastMessage?.dateSent ? new Date(Array.isArray(a.lastMessage.dateSent) ? new Date(a.lastMessage.dateSent[0], a.lastMessage.dateSent[1]-1, a.lastMessage.dateSent[2], a.lastMessage.dateSent[3], a.lastMessage.dateSent[4], a.lastMessage.dateSent[5]) : a.lastMessage.dateSent).getTime() : 0;
             const dateB = b.lastMessage?.dateSent ? new Date(Array.isArray(b.lastMessage.dateSent) ? new Date(b.lastMessage.dateSent[0], b.lastMessage.dateSent[1]-1, b.lastMessage.dateSent[2], b.lastMessage.dateSent[3], b.lastMessage.dateSent[4], b.lastMessage.dateSent[5]) : b.lastMessage.dateSent).getTime() : 0;
             return dateB - dateA;
          });

          if (unreadConvs.length > 0) {
            const latestConv = unreadConvs[0];
            const senderName = `User ${latestConv.participant1Id === currentUser.id ? latestConv.participant2Id.substring(0, 8) : latestConv.participant1Id.substring(0, 8)}...`;
            
            // Don't notify if we are currently viewing this conversation
            if (!showMessaging || activeConversationId !== latestConv.id) {
               // Fallback to Alert for Expo Go (Notifications require Dev Build)
               Alert.alert(
                 "Nouveau message",
                 `${senderName}: ${latestConv.lastMessage?.content || 'Message reçu'}`,
                 [
                   { text: "Ignorer", style: "cancel" },
                   { text: "Voir", onPress: () => {
                     setActiveConversationId(latestConv.id);
                     setShowMessaging(true);
                   }}
                 ]
               );
               
               /* 
               await Notifications.scheduleNotificationAsync({
                content: {
                  title: "Nouveau message",
                  body: `${senderName}: ${latestConv.lastMessage?.content || 'Message reçu'}`,
                  data: { conversationId: latestConv.id },
                },
                trigger: null, // Immediate
              });
              */
            }
          }
        }
        lastCount = totalUnread;
      } catch (e) {
        console.error("Error polling messages:", e);
      }
    };

    if (currentUser) {
      checkMessages(); // Initial check
      interval = setInterval(checkMessages, 5000); // Poll every 5s
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentUser, showMessaging, activeConversationId]);

  useEffect(() => {
    if (currentUser?.role === 'ADMIN') {
      setCurrentView('admin-dashboard');
    }
  }, [currentUser]);

  // Load favorites when user logs in
  useEffect(() => {
    const loadFavorites = async () => {
      if (currentUser) {
        try {
          const favorites = await FavoriteService.getFavorites(currentUser.id);
          setFavoriteEvents(favorites);
        } catch (error) {
          console.error("Error loading favorites:", error);
        }
      } else {
        setFavoriteEvents([]);
      }
    };
    loadFavorites();
  }, [currentUser]);

  const handleLogout = async () => {
    await logout();
    setCurrentView('home');
    setNotifications([]);
    setFavoriteEvents([]);
  };

  const handleViewEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    setCurrentView('event-detail');
  };

  // --- Notification Logic (Local) ---
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

  // --- Favorites Logic ---
  const toggleFavorite = async (eventId: string) => {
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }

    const isFavorite = favoriteEvents.some(f => {
       const id = f.eventId || (f as any).event?.eventId;
       return id === eventId;
    });
    
    try {
      if (isFavorite) {
        await FavoriteService.removeFavorite(currentUser.id, eventId);
        setFavoriteEvents(prev => prev.filter(f => {
          const id = f.eventId || (f as any).event?.eventId;
          return id !== eventId;
        }));
      } else {
        const newFavorite = await FavoriteService.addFavorite(currentUser.id, eventId);
        setFavoriteEvents(prev => [...prev, newFavorite]);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const isEventFavorite = (eventId: string) => {
    return favoriteEvents.some(f => {
       const id = f.eventId || (f as any).event?.eventId;
       return id === eventId;
    });
  };

  // --- Messaging Logic ---
  const handleContactSeller = async (sellerId: string) => {
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }
    try {
      const conversation = await InteractionService.createConversation(sellerId);
      setActiveConversationId(conversation.id);
      setShowMessaging(true);
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  const userNotifications = currentUser ? notifications.filter(n => n.userId === currentUser.id) : [];

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#101116" />
        <Image 
          source={require('./assets/icon.png')} 
          style={styles.loadingLogo}
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color="#3b82f6" style={styles.loadingIndicator} />
      </View>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return (
          <HomeScreen
            onViewEvent={handleViewEvent}
            onNavigateToEvents={() => setCurrentView('events')}
          />
        );
      case 'events':
        return (
          <EventList 
            onViewEvent={handleViewEvent}
          />
        );
      case 'event-detail':
        if (!selectedEventId) return null; 
        return (
          <EventDetail 
            eventId={selectedEventId}
            isFavorite={isEventFavorite(selectedEventId)}
            onToggleFavorite={() => toggleFavorite(selectedEventId)}
            onViewTickets={(id) => setCurrentView('event-tickets')}
            onBack={() => setCurrentView('events')}
          />
        );
      case 'event-tickets':
        if (!selectedEventId) return null; 
        return (
          <EventTickets 
            eventId={selectedEventId}
            onBack={() => setCurrentView('event-detail')}
          />
        );
      case 'profile':
        if (!currentUser) {
          setCurrentView('home');
          return null;
        }
        return (
          <UserProfile 
            onViewEvent={handleViewEvent} 
            initialTab={profileInitialTab}
            onContactSeller={handleContactSeller}
          />
        );
      case 'admin':
        if (!currentUser || currentUser.role !== 'ADMIN') {
          setCurrentView('home');
          return null;
        }
        return (
          <AdminPanel />
        );
      case 'admin-dashboard':
        if (!currentUser || currentUser.role !== 'ADMIN') {
          setCurrentView('home');
          return null;
        }
        return <AdminDashboard />;
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
          onNavigate={(view) => {
            if (view === 'profile') setProfileInitialTab('profile');
            setCurrentView(view);
          }}
          currentView={currentView}
          notificationCount={userNotifications.filter(n => !n.read).length}
          messageCount={unreadMessageCount}
          onShowNotifications={() => setShowNotifications(true)}
          onShowMessages={() => {
            setActiveConversationId(null);
            setShowMessaging(true);
          }}
          onShowFavorites={() => {
            setProfileInitialTab('favorites');
            setCurrentView('profile');
          }}
        />

        <View style={styles.content}>
          {renderContent()}
        </View>

        <LoginModal 
          visible={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />

        <NotificationCenter
          visible={showNotifications}
          onClose={() => setShowNotifications(false)}
          notifications={userNotifications}
          onMarkAsRead={markNotificationAsRead}
          onMarkAllAsRead={markAllNotificationsAsRead}
          onDeleteNotification={deleteNotification}
        />

        {currentUser && (
          <MessagingCenter
            visible={showMessaging}
            onClose={() => {
              setShowMessaging(false);
              setActiveConversationId(null);
            }}
            currentUser={currentUser}
            initialConversationId={activeConversationId}
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#101116',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingLogo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  loadingIndicator: {
    position: 'absolute',
    bottom: 50,
  }
});