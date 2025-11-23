import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User, Ticket, Event } from '../types';
import { Card, CardContent, CardHeader } from './ui/Card';

interface UserProfileProps {
  user: User;
  tickets: Ticket[];
  events: Event[];
}

export function UserProfile({ user, tickets, events }: UserProfileProps) {
  const getEventById = (eventId: string) => events.find(e => e.id === eventId);

  const formatPrice = (price: number) => `${price}€`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return '#059669';
      case 'sold':
        return '#6b7280';
      case 'pending':
        return '#d97706';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'sold':
        return 'Vendu';
      case 'pending':
        return 'En attente';
      default:
        return status;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* User Info */}
        <Card style={styles.userCard}>
          <CardContent style={styles.userContent}>
            <View style={styles.userHeader}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={32} color="#2563eb" />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                {user.phone && (
                  <Text style={styles.userPhone}>{user.phone}</Text>
                )}
                <View style={styles.roleContainer}>
                  <Text style={[
                    styles.roleText,
                    user.role === 'admin' ? styles.adminRole : styles.userRole
                  ]}>
                    {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                  </Text>
                </View>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <CardContent style={styles.statContent}>
              <Text style={styles.statNumber}>{tickets.length}</Text>
              <Text style={styles.statLabel}>Billets en vente</Text>
            </CardContent>
          </Card>
          <Card style={styles.statCard}>
            <CardContent style={styles.statContent}>
              <Text style={styles.statNumber}>
                {tickets.filter(t => t.status === 'sold').length}
              </Text>
              <Text style={styles.statLabel}>Billets vendus</Text>
            </CardContent>
          </Card>
          <Card style={styles.statCard}>
            <CardContent style={styles.statContent}>
              <Text style={styles.statNumber}>
                {formatPrice(tickets.filter(t => t.status === 'sold')
                  .reduce((sum, t) => sum + t.price, 0))}
              </Text>
              <Text style={styles.statLabel}>Total vendu</Text>
            </CardContent>
          </Card>
        </View>

        {/* Tickets List */}
        <Card style={styles.ticketsCard}>
          <CardHeader>
            <Text style={styles.ticketsTitle}>Mes billets en vente</Text>
          </CardHeader>
          <CardContent>
            {tickets.length > 0 ? (
              <View style={styles.ticketsList}>
                {tickets.map(ticket => {
                  const event = getEventById(ticket.eventId);
                  return (
                    <View key={ticket.id} style={styles.ticketItem}>
                      <View style={styles.ticketHeader}>
                        <Text style={styles.ticketEvent}>
                          {event?.name || 'Événement inconnu'}
                        </Text>
                        <View style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusColor(ticket.status) + '20' }
                        ]}>
                          <Text style={[
                            styles.statusText,
                            { color: getStatusColor(ticket.status) }
                          ]}>
                            {getStatusText(ticket.status)}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.ticketDetails}>
                        <Text style={styles.ticketInfo}>
                          {ticket.section} - Rang {ticket.row}, Siège {ticket.seat}
                        </Text>
                        <View style={styles.ticketPricing}>
                          <Text style={styles.currentPrice}>
                            {formatPrice(ticket.price)}
                          </Text>
                          {ticket.originalPrice > ticket.price && (
                            <Text style={styles.originalPrice}>
                              {formatPrice(ticket.originalPrice)}
                            </Text>
                          )}
                        </View>
                      </View>

                      {event && (
                        <View style={styles.eventMeta}>
                          <View style={styles.metaItem}>
                            <Ionicons name="calendar-outline" size={14} color="#6b7280" />
                            <Text style={styles.metaText}>
                              {new Date(event.startDate).toLocaleDateString('fr-FR')}
                            </Text>
                          </View>
                          <View style={styles.metaItem}>
                            <Ionicons name="location-outline" size={14} color="#6b7280" />
                            <Text style={styles.metaText}>{event.location}</Text>
                          </View>
                        </View>
                      )}

                      {ticket.description && (
                        <Text style={styles.ticketDescription}>
                          {ticket.description}
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="ticket-outline" size={48} color="#9ca3af" />
                <Text style={styles.emptyTitle}>Aucun billet en vente</Text>
                <Text style={styles.emptyText}>
                  Vous n'avez pas encore mis de billet en vente
                </Text>
              </View>
            )}
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 16,
    gap: 20,
  },
  userCard: {},
  userContent: {
    padding: 20,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  roleContainer: {
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adminRole: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  userRole: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
  },
  statContent: {
    alignItems: 'center',
    padding: 16,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  ticketsCard: {},
  ticketsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  ticketsList: {
    gap: 16,
  },
  ticketItem: {
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ticketEvent: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ticketDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketInfo: {
    fontSize: 14,
    color: '#374151',
  },
  ticketPricing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
  },
  originalPrice: {
    fontSize: 14,
    color: '#6b7280',
    textDecorationLine: 'line-through',
  },
  eventMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
  },
  ticketDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});