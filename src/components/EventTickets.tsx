import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Event, Ticket } from '../types';
import { Button } from './ui/Button';
import { useTranslation } from 'react-i18next';
import { EventService } from '../services/EventService';
import { TicketService } from '../services/TicketService';
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
      const [eventData, ticketsData, ticketTypes] = await Promise.all([
        EventService.getEventById(eventId),
        EventService.getEventTickets(eventId),
        TicketService.getTicketTypes()
      ]);
      
      // Enrichir les tickets avec le label du type
      const enrichedTickets = ticketsData.map(t => {
        // Si le backend envoie déjà le label, on le garde
        if (t.ticketTypeLabel) return t;
        
        // Sinon on essaie de le trouver via ticketTypeId (souvent présent dans le JSON brut)
        // On vérifie plusieurs formats possibles (camelCase, snake_case, objet imbriqué)
        const typeId = (t as any).ticketTypeId || (t as any).ticket_type_id || (t as any).ticketType?.id;
        
        const type = ticketTypes.find((tt: any) => tt.id === typeId);
        
        return {
            ...t,
            ticketTypeLabel: type ? type.label : (t.ticketTypeLabel || 'Standard')
        };
      });

      setEvent(eventData);
      setTickets(enrichedTickets);
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

  const getTypeColor = (label: string) => {
    const normalized = label?.toUpperCase() || '';
    if (normalized.includes('VIP')) return '#7c3aed'; // Purple
    if (normalized.includes('EARLY')) return '#059669'; // Green
    if (normalized.includes('LOGE') || normalized.includes('BOX')) return '#db2777'; // Pink
    if (normalized.includes('PREMIUM')) return '#d97706'; // Orange
    return '#2563eb'; // Default Blue
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
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
            <Text style={styles.headerTitle} numberOfLines={1}>{event?.name || 'Événement'}</Text>
            {event && (
                <View style={styles.headerMeta}>
                    <Ionicons name="calendar-outline" size={12} color="#6b7280" />
                    <Text style={styles.headerSubtitle}>{new Date(event.startDate).toLocaleDateString()}</Text>
                    <Text style={styles.headerDot}>•</Text>
                    <Ionicons name="location-outline" size={12} color="#6b7280" />
                    <Text style={styles.headerSubtitle}>{event.location}</Text>
                </View>
            )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleContainer}>
          <Text style={styles.pageTitle}>
            {t('eventDetail.availableTickets', { defaultValue: 'Billets disponibles' })}
          </Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{displayedTickets.length}</Text>
          </View>
        </View>

        {/* Filtres UI */}
        <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll} contentContainerStyle={{paddingRight: 16}}>
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
            </TouchableOpacity>
        </View>

        {displayedTickets.length > 0 ? (
          displayedTickets.map(ticket => (
            <View key={ticket.id} style={styles.ticketCard}>
              {/* Left Side: Ticket Info */}
              <View style={styles.ticketMain}>
                  <View style={styles.ticketHeaderRow}>
                      <Text style={[styles.ticketType, { color: getTypeColor(ticket.ticketTypeLabel || 'Standard') }]}>
                        {ticket.ticketTypeLabel || 'Standard'}
                      </Text>
                  </View>
                  
                  <View style={styles.locationRow}>
                      <View style={styles.locationItem}>
                          <Text style={styles.locationLabel}>Section</Text>
                          <Text style={styles.locationValue}>{ticket.section || '-'}</Text>
                      </View>
                      <View style={styles.verticalDivider} />
                      <View style={styles.locationItem}>
                          <Text style={styles.locationLabel}>Rang</Text>
                          <Text style={styles.locationValue}>{ticket.row || '-'}</Text>
                      </View>
                      <View style={styles.verticalDivider} />
                      <View style={styles.locationItem}>
                          <Text style={styles.locationLabel}>Siège</Text>
                          <Text style={styles.locationValue}>{ticket.seat || 'Libre'}</Text>
                      </View>
                  </View>

                  <View style={styles.sellerRow}>
                      <Ionicons name="person-circle-outline" size={16} color="#9ca3af" />
                      <Text style={styles.sellerName}>Vendu par {ticket.sellerName || 'Utilisateur'}</Text>
                  </View>
              </View>

              {/* Right Side: Price & Action */}
              <View style={styles.ticketAction}>
                  <Text style={styles.price}>{ticket.salePrice.toFixed(2)}€</Text>
                  <TouchableOpacity 
                    style={styles.buyButtonSmall}
                    onPress={() => handleBuyClick(ticket)}
                  >
                      <Text style={styles.buyButtonText}>Acheter</Text>
                  </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.noTicketsContainer}>
            <View style={styles.noTicketsIcon}>
                <Ionicons name="ticket-outline" size={40} color="#9ca3af" />
            </View>
            <Text style={styles.noTicketsTitle}>Aucun billet disponible</Text>
            <Text style={styles.noTicketsText}>Soyez le premier à être notifié quand un billet est mis en vente.</Text>
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
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { justifyContent: 'center', alignItems: 'center' },
  
  // Header
  header: { 
    paddingTop: 20, 
    paddingHorizontal: 20, 
    paddingBottom: 12, 
    backgroundColor: '#fff', 
    borderBottomWidth: 1, 
    borderBottomColor: '#f1f5f9',
    flexDirection: 'row',
    alignItems: 'center'
  },
  backButton: { padding: 8, marginRight: 8, borderRadius: 12, backgroundColor: '#f8fafc' },
  headerContent: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  headerMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  headerSubtitle: { fontSize: 12, color: '#64748b', marginLeft: 4 },
  headerDot: { marginHorizontal: 6, color: '#cbd5e1' },

  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  
  // Title Section
  titleContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  pageTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  countBadge: { backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  countText: { color: '#2563eb', fontWeight: 'bold', fontSize: 14 },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 }, // Kept for compatibility if needed

  // Filters
  filterContainer: { flexDirection: 'row', marginBottom: 24, alignItems: 'center' },
  typeScroll: { flex: 1, marginRight: 12 },
  filterChip: { 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 24, 
    backgroundColor: '#fff', 
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  filterChipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  filterChipText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  filterChipTextActive: { color: '#fff' },
  sortButton: { 
    padding: 10, 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  sortButtonText: { marginLeft: 4, fontSize: 12, fontWeight: '600', color: '#374151' },

  // Ticket Card
  ticketCard: { 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    marginBottom: 16, 
    shadowColor: '#64748b', 
    shadowOffset: {width:0, height: 4}, 
    shadowOpacity: 0.06, 
    shadowRadius: 12, 
    elevation: 3, 
    flexDirection: 'row',
    overflow: 'hidden'
  },
  ticketMain: { flex: 1, padding: 16, borderRightWidth: 1, borderRightColor: '#f1f5f9', borderStyle: 'dashed' },
  ticketHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  ticketType: { fontSize: 16, fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  discountBadge: { backgroundColor: '#ecfdf5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  discountText: { color: '#059669', fontSize: 10, fontWeight: 'bold' },

  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  locationItem: { alignItems: 'center' },
  locationLabel: { fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 2 },
  locationValue: { fontSize: 13, fontWeight: '700', color: '#334155' },
  verticalDivider: { width: 1, height: 20, backgroundColor: '#e2e8f0', marginHorizontal: 12 },

  sellerRow: { flexDirection: 'row', alignItems: 'center' },
  sellerName: { fontSize: 12, color: '#64748b', marginLeft: 6 },

  // Ticket Action Side
  ticketAction: { width: 100, padding: 12, justifyContent: 'center', alignItems: 'center' },
  originalPrice: { fontSize: 12, color: '#94a3b8', textDecorationLine: 'line-through', marginBottom: 2 },
  price: { fontSize: 18, fontWeight: '800', color: '#2563eb', marginBottom: 8 },
  buyButtonSmall: { backgroundColor: '#2563eb', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, width: '100%', alignItems: 'center' },
  buyButtonText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  // Empty State
  noTicketsContainer: { alignItems: 'center', padding: 40, marginTop: 20 },
  noTicketsIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  noTicketsTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 8 },
  noTicketsText: { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 20 },

  // Legacy styles to prevent crash if referenced elsewhere (though I replaced usages)
  ticketInfo: {},
  ticketHeader: {},
  ticketLocation: {},
  ticketMeta: {},
  seatContainer: {},
  seatText: {},
  sellerInfo: {},
  sellerText: {},
  badge: {},
  badgeText: {},
  buyButton: {},
});