import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Event, Ticket } from '../types';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader } from './ui/Card';

interface EventDetailProps {
  event: Event;
  tickets: Ticket[];
  onBuyTicket: (ticket: Ticket) => void;
  onBack: () => void;
}

export function EventDetail({ event, tickets, onBuyTicket, onBack }: EventDetailProps) {
  const formatPrice = (price: number) => {
    return `${price}€`;
  };

  const getSavingsText = (price: number, originalPrice: number) => {
    const savings = originalPrice - price;
    if (savings > 0) {
      return `Save ${savings}€`;
    }
    return null;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      {/* Event Details */}
      <View style={styles.eventSection}>
        <Image 
          source={{ uri: event.image }}
          style={styles.eventImage}
          resizeMode="cover"
        />
        
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          
          <View style={styles.eventMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar" size={20} color="#2563eb" />
              <Text style={styles.metaText}>
                {new Date(event.date).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>
            
            <View style={styles.metaItem}>
              <Ionicons name="location" size={20} color="#2563eb" />
              <Text style={styles.metaText}>{event.venue}</Text>
            </View>
            
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={20} color="#2563eb" />
              <Text style={styles.metaText}>{event.location}</Text>
            </View>
            
            <View style={styles.metaItem}>
              <Ionicons name="pricetag" size={20} color="#2563eb" />
              <Text style={styles.metaText}>{event.category}</Text>
            </View>
          </View>

          <Text style={styles.eventDescription}>{event.description}</Text>
        </View>
      </View>

      {/* Tickets Section */}
      <View style={styles.ticketsSection}>
        <View style={styles.ticketsHeader}>
          <Text style={styles.ticketsTitle}>
            Billets disponibles ({tickets.length})
          </Text>
          <Text style={styles.ticketsSubtitle}>
            Sélectionnez le billet qui vous convient
          </Text>
        </View>

        {tickets.length > 0 ? (
          <View style={styles.ticketsList}>
            {tickets.map(ticket => (
              <Card key={ticket.id} style={styles.ticketCard}>
                <CardContent style={styles.ticketContent}>
                  <View style={styles.ticketInfo}>
                    <View style={styles.ticketHeader}>
                      <Text style={styles.ticketSection}>
                        {ticket.section} - Rang {ticket.row}, Siège {ticket.seat}
                      </Text>
                      <View style={styles.priceContainer}>
                        <Text style={styles.price}>{formatPrice(ticket.price)}</Text>
                        {ticket.originalPrice > ticket.price && (
                          <Text style={styles.originalPrice}>
                            {formatPrice(ticket.originalPrice)}
                          </Text>
                        )}
                      </View>
                    </View>
                    
                    <View style={styles.ticketMeta}>
                      <View style={styles.sellerInfo}>
                        <Ionicons name="person-outline" size={16} color="#6b7280" />
                        <Text style={styles.sellerText}>
                          Vendu par {ticket.sellerName}
                        </Text>
                      </View>
                      
                      {getSavingsText(ticket.price, ticket.originalPrice) && (
                        <Text style={styles.savings}>
                          {getSavingsText(ticket.price, ticket.originalPrice)}
                        </Text>
                      )}
                    </View>

                    {ticket.description && (
                      <Text style={styles.ticketDescription}>
                        {ticket.description}
                      </Text>
                    )}
                  </View>

                  <Button
                    title={`Buy - ${formatPrice(ticket.price)}`}
                    onPress={() => onBuyTicket(ticket)}
                    size="lg"
                    style={styles.buyButton}
                  />
                </CardContent>
              </Card>
            ))}
          </View>
        ) : (
          <View style={styles.noTickets}>
            <Ionicons name="ticket-outline" size={64} color="#9ca3af" />
            <Text style={styles.noTicketsTitle}>No tickets available</Text>
            <Text style={styles.noTicketsText}>
              There are currently no tickets for sale for this event.
              Come back later or create an alert.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 8,
    fontWeight: '500',
  },
  eventSection: {
    backgroundColor: '#ffffff',
    marginBottom: 24,
  },
  eventImage: {
    width: '100%',
    height: 250,
  },
  eventInfo: {
    padding: 20,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    lineHeight: 32,
  },
  eventMeta: {
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  eventDescription: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  ticketsSection: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  ticketsHeader: {
    marginBottom: 20,
  },
  ticketsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  ticketsSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  ticketsList: {
    gap: 16,
  },
  ticketCard: {
    backgroundColor: '#ffffff',
  },
  ticketContent: {
    padding: 20,
  },
  ticketInfo: {
    marginBottom: 16,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ticketSection: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#059669',
  },
  originalPrice: {
    fontSize: 14,
    color: '#6b7280',
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  ticketMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 6,
  },
  savings: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
  ticketDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginTop: 8,
  },
  buyButton: {
    marginTop: 8,
  },
  noTickets: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  noTicketsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  noTicketsText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});