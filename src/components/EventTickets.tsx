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

  const availableTickets = tickets.filter(t => t.status === 'AVAILABLE');

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
          <Text style={styles.subtitle}>{availableTickets.length} résultat(s)</Text>
        </View>

        {availableTickets.length > 0 ? (
          availableTickets.map(ticket => (
            <View key={ticket.id} style={styles.ticketCard}>
              <View style={styles.ticketInfo}>
                <View style={styles.ticketHeader}>
                  <View style={{flex: 1}}>
                      <Text style={styles.ticketType}>{ticket.ticketTypeLabel || 'Standard'}</Text>
                      <Text style={styles.ticketLocation}>
                        {ticket.section ? `Section ${ticket.section}` : ''}
                        {ticket.section && ticket.row ? ' • ' : ''}
                        {ticket.row ? `Rang ${ticket.row}` : ''}
                      </Text>
                  </View>
                  <Text style={styles.price}>{ticket.salePrice.toFixed(2)}€</Text>
                </View>
                
                <View style={styles.ticketMeta}>
                    <Text style={styles.seatText}>
                        {ticket.seat ? `Siège: ${ticket.seat}` : 'Placement libre'}
                    </Text>
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
  ticketCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: {width:0, height:1}, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  ticketInfo: { marginBottom: 16 },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  ticketType: { fontSize: 16, fontWeight: '700', color: '#111827' },
  ticketLocation: { fontSize: 13, color: '#6b7280' },
  price: { fontSize: 18, fontWeight: '700', color: '#059669' },
  ticketMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  seatText: { fontSize: 13, color: '#4b5563' },
  sellerInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  sellerText: { fontSize: 11, color: '#4b5563', marginLeft: 4 },
  noTicketsContainer: { alignItems: 'center', padding: 40, marginTop: 20 },
  noTicketsTitle: { fontSize: 18, fontWeight: '600', color: '#374151', marginTop: 16 },
  noTicketsText: { fontSize: 14, color: '#6b7280', marginTop: 4 },
});