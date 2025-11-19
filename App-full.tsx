import React, { useState } from 'react';
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
  HomeScreen
} from './src/components';
import { User, Event, Ticket, Transaction } from './src/types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'events' | 'event-detail' | 'profile' | 'admin'>('home');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Mock data
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

  const handleLogin = (email: string, password: string) => {
    // Simulation de connexion
    const mockUser: User = {
      id: '1',
      name: 'Utilisateur Test',
      email: email,
      role: email.includes('admin') ? 'ADMIN' : 'USER',
      phone: '+33 6 12 34 56 78'
    };
    setCurrentUser(mockUser);
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('home');
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
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, status: 'sold' as const }
        : ticket
    ));
    setShowBuyModal(false);
    setSelectedTicket(null);
  };

  const handleTicketListing = (ticketData: any) => {
    const newTicket: Ticket = {
      id: Date.now().toString(),
      eventId: ticketData.eventId,
      sellerId: currentUser!.id,
      sellerName: currentUser!.name,
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
  };

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
          />
        );
      case 'profile':
        if (!currentUser) return null;
        return (
          <UserProfile 
            user={currentUser}
            tickets={tickets.filter(t => t.sellerId === currentUser.id)}
            events={events}
          />
        );
      case 'admin':
        if (!currentUser || currentUser.role !== 'ADMIN') return null;
        return (
          <AdminPanel 
            tickets={tickets}
            events={events}
            onUpdateTicket={(ticketId: string, status: 'available' | 'sold' | 'pending') => {
              setTickets(prev => prev.map(ticket => 
                ticket.id === ticketId ? { ...ticket, status } : ticket
              ));
            }}
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
        />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderContent()}
        </ScrollView>

        {/* Modals */}
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
