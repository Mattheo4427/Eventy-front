import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Event, Ticket } from '../types';
import { Button } from './ui/Button';
import { useTranslation } from 'react-i18next';
import { EventService } from '../services/EventService';

interface EventDetailProps {
  eventId: string; // On passe l'ID au lieu de l'objet complet
  onBuyTicket: (ticket: Ticket) => void;
  onBack: () => void;
}

export function EventDetail({ eventId, onBuyTicket, onBack }: EventDetailProps) {
  const { t } = useTranslation();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        console.error("Erreur chargement détail:", error);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      loadData();
    }
  }, [eventId]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text>Événement introuvable</Text>
        <Button title="Retour" onPress={onBack} style={{marginTop: 20}} />
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // Filtrer uniquement les billets disponibles
  const availableTickets = tickets.filter(t => t.status === 'AVAILABLE');

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header avec bouton retour */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
          <Text style={styles.backText}>{t('eventDetail.back', { defaultValue: 'Retour' })}</Text>
        </TouchableOpacity>
      </View>

      {/* Image */}
      <Image 
        source={{ uri: event.imageUrl || 'https://via.placeholder.com/800x400' }} 
        style={styles.coverImage}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>{event.name}</Text>
          <View style={styles.badgesContainer}>
            {event.categoryLabel && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{event.categoryLabel}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Infos */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={20} color="#4b5563" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>{formatDate(event.startDate)}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location" size={20} color="#4b5563" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Lieu</Text>
              <Text style={styles.infoValue}>{event.location}</Text>
              {event.fullAddress && <Text style={styles.infoSubValue}>{event.fullAddress}</Text>}
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos</Text>
          <Text style={styles.description}>{event.description}</Text>
        </View>

        {/* Billets */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
             Billets disponibles ({availableTickets.length})
          </Text>
          
          {availableTickets.length > 0 ? (
            availableTickets.map(ticket => (
              <View key={ticket.id} style={styles.ticketCard}>
                <View style={styles.ticketInfo}>
                  <View style={styles.ticketHeader}>
                    <View>
                        <Text style={styles.ticketType}>{ticket.ticketTypeLabel || 'Standard'}</Text>
                        <Text style={styles.ticketLocation}>Section {ticket.section || '-'} • Rang {ticket.row || '-'}</Text>
                    </View>
                    <Text style={styles.price}>{ticket.salePrice}€</Text>
                  </View>
                  {ticket.sellerName && (
                      <Text style={styles.sellerText}>Vendeur: {ticket.sellerName}</Text>
                  )}
                </View>
                <Button 
                  title="Acheter" 
                  onPress={() => onBuyTicket(ticket)}
                  variant="primary"
                />
              </View>
            ))
          ) : (
            <View style={styles.noTicketsContainer}>
              <Ionicons name="ticket-outline" size={48} color="#9ca3af" />
              <Text style={styles.noTicketsTitle}>Aucun billet disponible</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { paddingTop: 50, paddingHorizontal: 16, paddingBottom: 10, backgroundColor: '#fff', zIndex: 10 },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backText: { marginLeft: 4, fontSize: 16, color: '#374151', fontWeight: '500' },
  coverImage: { width: '100%', height: 200, backgroundColor: '#f3f4f6' },
  content: { padding: 20 },
  titleSection: { marginBottom: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#111827', marginBottom: 10 },
  badgesContainer: { flexDirection: 'row', gap: 8 },
  categoryBadge: { backgroundColor: '#dbeafe', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  categoryText: { color: '#2563eb', fontWeight: '600', fontSize: 14 },
  infoSection: { backgroundColor: '#f9fafb', padding: 16, borderRadius: 12, marginBottom: 24 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  infoTextContainer: { marginLeft: 12, flex: 1 },
  infoLabel: { fontSize: 14, color: '#6b7280', marginBottom: 2 },
  infoValue: { fontSize: 16, color: '#111827', fontWeight: '600' },
  infoSubValue: { fontSize: 14, color: '#4b5563', marginTop: 2 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 12 },
  description: { fontSize: 16, color: '#4b5563', lineHeight: 24 },
  ticketCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  ticketInfo: { marginBottom: 16 },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  ticketType: { fontSize: 16, fontWeight: '700', color: '#111827' },
  ticketLocation: { fontSize: 13, color: '#6b7280' },
  price: { fontSize: 18, fontWeight: '700', color: '#059669' },
  sellerText: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  noTicketsContainer: { alignItems: 'center', padding: 24, backgroundColor: '#f9fafb', borderRadius: 12, borderStyle: 'dashed', borderWidth: 1, borderColor: '#e5e7eb' },
  noTicketsTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginTop: 12 },
});