import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Event, Ticket } from '../types';
import { Button } from './ui/Button';
import { useTranslation } from 'react-i18next';

interface EventDetailProps {
  event: Event;
  tickets: Ticket[];
  onBuyTicket: (ticket: Ticket) => void;
  onBack: () => void;
}

export function EventDetail({ event, tickets, onBuyTicket, onBack }: EventDetailProps) {
  const { t } = useTranslation();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header avec bouton retour */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
          <Text style={styles.backText}>{t('eventDetail.back')}</Text>
        </TouchableOpacity>
      </View>

      {/* Image de l'événement */}
      <Image 
        source={{ uri: event.imageUrl || 'https://via.placeholder.com/800x400' }} 
        style={styles.coverImage}
        resizeMode="cover"
      />

      <View style={styles.content}>
        {/* Informations principales */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{event.name}</Text>
          <View style={styles.badgesContainer}>
            {event.categoryLabel && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{event.categoryLabel}</Text>
              </View>
            )}
            {event.status !== 'active' && (
              <View style={[styles.statusBadge, event.status === 'canceled' ? styles.bgRed : styles.bgOrange]}>
                <Text style={styles.statusText}>{event.status}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Date et Lieu */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={20} color="#4b5563" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>{formatDate(event.startDate)}</Text>
              {event.endDate && (
                <Text style={styles.infoSubValue}>au {formatDate(event.endDate)}</Text>
              )}
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location" size={20} color="#4b5563" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>{t('events.location')}</Text>
              <Text style={styles.infoValue}>{event.location}</Text>
              {event.fullAddress && (
                <Text style={styles.infoSubValue}>{event.fullAddress}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos</Text>
          <Text style={styles.description}>{event.description}</Text>
        </View>

        {/* Liste des billets */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('events.availableEvents')}</Text> {/* "Billets disponibles" serait mieux */}
          
          {tickets.length > 0 ? (
            tickets.map(ticket => (
              <View key={ticket.id} style={styles.ticketCard}>
                <View style={styles.ticketInfo}>
                  <View style={styles.ticketHeader}>
                    <Text style={styles.ticketSection}>
                      Section {ticket.section}, Rang {ticket.row}
                    </Text>
                    <View style={styles.priceContainer}>
                      <Text style={styles.price}>{ticket.salePrice}€</Text>
                      {ticket.originalPrice > ticket.salePrice && (
                        <Text style={styles.originalPrice}>{ticket.originalPrice}€</Text>
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.ticketMeta}>
                    <Text style={styles.seatText}>Siège: {ticket.seat}</Text>
                    {ticket.originalPrice > ticket.salePrice && (
                      <View style={styles.savingsBadge}>
                        <Text style={styles.savingsText}>
                          -{Math.round(((ticket.originalPrice - ticket.salePrice) / ticket.originalPrice) * 100)}%
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <Button 
                  title={t('eventDetail.buy')} 
                  onPress={() => onBuyTicket(ticket)}
                  variant="primary"
                />
              </View>
            ))
          ) : (
            <View style={styles.noTicketsContainer}>
              <Ionicons name="ticket-outline" size={48} color="#9ca3af" />
              <Text style={styles.noTicketsTitle}>{t('eventDetail.noTicketsAvailable')}</Text>
              <Text style={styles.noTicketsText}>{t('eventDetail.noTicketsDescription')}</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingTop: 50, // SafeArea
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
    zIndex: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    marginLeft: 4,
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  coverImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 20,
  },
  titleSection: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  bgRed: { backgroundColor: '#fee2e2' },
  bgOrange: { backgroundColor: '#ffedd5' },
  statusText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 14,
  },
  infoSection: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
  infoSubValue: {
    fontSize: 14,
    color: '#4b5563',
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  ticketCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  ticketInfo: {
    marginBottom: 16,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ticketSection: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
  },
  originalPrice: {
    fontSize: 14,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  ticketMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seatText: {
    fontSize: 14,
    color: '#6b7280',
  },
  savingsBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  savingsText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: 'bold',
  },
  noTicketsContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  noTicketsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
    marginBottom: 4,
  },
  noTicketsText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});