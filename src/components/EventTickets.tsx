import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Event, Ticket } from '../types';
import { Button } from './ui/Button';
import { useTranslation } from 'react-i18next';
import { EventService } from '../services/EventService';
import { useAuth } from '../contexts/AuthContext';
import { BuyTicketModal } from './BuyTicketModal'; // Import du Modal

interface EventTicketsProps {
  eventId: string;
  onBack: () => void;
}

export function EventTickets({ eventId, onBack }: EventTicketsProps) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtres et Tri
  const [sortBy, setSortBy] = useState<'asc' | 'desc'>('asc');
  const [filterType, setFilterType] = useState<string>('ALL');

  // États pour le Modal d'achat
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventData, ticketsData] = await Promise.all([
        EventService.getEventById(eventId),
        EventService.getEventTickets(eventId)
      ]);
      setEvent(eventData);
      setTickets(ticketsData);
    } catch (error) {
      console.error("Erreur chargement tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [eventId]);

  const handleBuyClick = (ticket: Ticket) => {
    if (!isAuthenticated) {
      Alert.alert("Connexion requise", "Vous devez être connecté pour acheter un billet.");
      return;
    }
    setSelectedTicket(ticket);
    setShowBuyModal(true);
  };

  // Logique de filtrage et tri
  const uniqueTypes = ['ALL', ...Array.from(new Set(tickets.map(t => t.ticketTypeLabel || 'Standard')))];

  const displayedTickets = tickets
    .filter(t => t.status === 'AVAILABLE')
    .filter(t => filterType === 'ALL' || (t.ticketTypeLabel || 'Standard') === filterType)
    .sort((a, b) => {
        return sortBy === 'asc' ? a.salePrice - b.salePrice : b.salePrice - a.salePrice;
    });

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
          <Text style={styles.backText}>{event?.name || 'Événement'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleContainer}>
          <Text style={styles.pageTitle}>
            {t('eventDetail.availableTickets', { defaultValue: 'Billets disponibles' })}
          </Text>
          <Text style={styles.subtitle}>{displayedTickets.length} résultat(s)</Text>
        </View>

        {/* Filtres UI */}
        <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
                {uniqueTypes.map(type => (
                    <TouchableOpacity 
                        key={type} 
                        style={[styles.filterChip, filterType === type && styles.filterChipActive]}
                        onPress={() => setFilterType(type)}
                    >
                        <Text style={[styles.filterChipText, filterType === type && styles.filterChipTextActive]}>
                            {type === 'ALL' ? 'Tous' : type}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            
            <TouchableOpacity style={styles.sortButton} onPress={() => setSortBy(prev => prev === 'asc' ? 'desc' : 'asc')}>
                <Ionicons name={sortBy === 'asc' ? "arrow-up" : "arrow-down"} size={16} color="#374151" />
                <Text style={styles.sortButtonText}>Prix</Text>
            </TouchableOpacity>
        </View>

        {displayedTickets.length > 0 ? (
          displayedTickets.map(ticket => (
            <View key={ticket.id} style={styles.ticketCard}>
              <View style={styles.ticketInfo}>
                <View style={styles.ticketHeader}>
                  <View style={{flex: 1}}>
                      <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                        <Text style={styles.ticketType}>{ticket.ticketTypeLabel || 'Standard'}</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{ticket.section ? 'Numéroté' : 'Libre'}</Text>
                        </View>
                      </View>
                      <Text style={styles.ticketLocation}>
                        {ticket.section ? `Section ${ticket.section}` : ''}
                        {ticket.section && ticket.row ? ' • ' : ''}
                        {ticket.row ? `Rang ${ticket.row}` : ''}
                      </Text>
                  </View>
                  <Text style={styles.price}>{ticket.salePrice.toFixed(2)}€</Text>
                </View>
                
                <View style={styles.ticketMeta}>
                    <View style={styles.seatContainer}>
                        <Ionicons name="grid-outline" size={14} color="#6b7280" />
                        <Text style={styles.seatText}>
                            {ticket.seat ? `Siège ${ticket.seat}` : 'Placement libre'}
                        </Text>
                    </View>
                    {ticket.sellerName && (
                        <View style={styles.sellerInfo}>
                            <Ionicons name="person-circle-outline" size={14} color="#6b7280" />
                            <Text style={styles.sellerText}>{ticket.sellerName}</Text>
                        </View>
                    )}
                </View>
              </View>
              
              <Button 
                title={t('eventDetail.buy', { defaultValue: 'Acheter' })} 
                onPress={() => handleBuyClick(ticket)}
                variant="primary"
                style={styles.buyButton}
              />
            </View>
          ))
        ) : (
          <View style={styles.noTicketsContainer}>
            <Ionicons name="ticket-outline" size={48} color="#9ca3af" />
            <Text style={styles.noTicketsTitle}>Aucun billet en vente</Text>
            <Text style={styles.noTicketsText}>Revenez plus tard !</Text>
          </View>
        )}
        
        <View style={{height: 40}} />
      </ScrollView>

      {/* Modal d'Achat intégré ici */}
      {selectedTicket && event && (
        <BuyTicketModal 
            visible={showBuyModal}
            ticket={selectedTicket}
            event={event} // Ici 'event' est bien défini, plus d'erreur !
            onClose={() => {
                setShowBuyModal(false);
                setSelectedTicket(null);
            }}
            onSuccess={() => {
                // Rafraîchir la liste pour que le billet vendu disparaisse
                loadData();
            }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { paddingTop: 50, paddingHorizontal: 16, paddingBottom: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backText: { marginLeft: 8, fontSize: 16, color: '#374151', fontWeight: '600' },
  content: { padding: 16 },
  titleContainer: { marginBottom: 20 },
  pageTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  
  // Filtres
  filterContainer: { flexDirection: 'row', marginBottom: 20, alignItems: 'center' },
  typeScroll: { flex: 1, marginRight: 12 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e5e7eb', marginRight: 8 },
  filterChipActive: { backgroundColor: '#2563eb' },
  filterChipText: { fontSize: 14, fontWeight: '600', color: '#4b5563' },
  filterChipTextActive: { color: '#fff' },
  sortButton: { flexDirection: 'row', alignItems: 'center', padding: 8, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  sortButtonText: { marginLeft: 4, fontSize: 12, fontWeight: '600', color: '#374151' },

  // Carte Ticket
  ticketCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderLeftWidth: 4, borderLeftColor: '#2563eb' },
  ticketInfo: { marginBottom: 16 },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'flex-start' },
  ticketType: { fontSize: 18, fontWeight: '700', color: '#111827' },
  ticketLocation: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  price: { fontSize: 20, fontWeight: '800', color: '#059669' },
  
  ticketMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  seatContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  seatText: { fontSize: 14, color: '#4b5563', fontWeight: '500' },
  sellerInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  sellerText: { fontSize: 12, color: '#4b5563', marginLeft: 6, fontWeight: '500' },
  
  badge: { backgroundColor: '#eff6ff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  badgeText: { fontSize: 10, color: '#2563eb', fontWeight: '700', textTransform: 'uppercase' },
  buyButton: { borderRadius: 12 },

  noTicketsContainer: { alignItems: 'center', padding: 40, marginTop: 20 },
  noTicketsTitle: { fontSize: 18, fontWeight: '600', color: '#374151', marginTop: 16 },
  noTicketsText: { fontSize: 14, color: '#6b7280', marginTop: 4 },
});