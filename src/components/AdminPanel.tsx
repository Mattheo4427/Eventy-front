import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Ticket, Event } from '../types';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Button } from './ui/Button';

interface AdminPanelProps {
  tickets: Ticket[];
  events: Event[];
  onUpdateTicket: (ticketId: string, status: 'available' | 'sold' | 'pending') => void;
}

export function AdminPanel({ tickets, events, onUpdateTicket }: AdminPanelProps) {
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

  const handleStatusChange = (ticket: Ticket, newStatus: 'available' | 'sold' | 'pending') => {
    Alert.alert(
      'Modifier le statut',
      `Changer le statut du billet vers "${getStatusText(newStatus)}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Confirmer', 
          onPress: () => onUpdateTicket(ticket.id, newStatus)
        }
      ]
    );
  };

  const totalTickets = tickets.length;
  const availableTickets = tickets.filter(t => t.status === 'available').length;
  const soldTickets = tickets.filter(t => t.status === 'sold').length;
  const pendingTickets = tickets.filter(t => t.status === 'pending').length;
  const totalRevenue = tickets.filter(t => t.status === 'sold').reduce((sum, t) => sum + t.price, 0);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Panneau d'administration</Text>
          <Text style={styles.subtitle}>Gérez tous les billets sur la plateforme</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <CardContent style={styles.statContent}>
              <View style={styles.statIcon}>
                <Ionicons name="ticket" size={24} color="#2563eb" />
              </View>
              <Text style={styles.statNumber}>{totalTickets}</Text>
              <Text style={styles.statLabel}>Total billets</Text>
            </CardContent>
          </Card>

          <Card style={styles.statCard}>
            <CardContent style={styles.statContent}>
              <View style={[styles.statIcon, { backgroundColor: '#dcfce7' }]}>
                <Ionicons name="checkmark-circle" size={24} color="#059669" />
              </View>
              <Text style={styles.statNumber}>{availableTickets}</Text>
              <Text style={styles.statLabel}>Disponibles</Text>
            </CardContent>
          </Card>

          <Card style={styles.statCard}>
            <CardContent style={styles.statContent}>
              <View style={[styles.statIcon, { backgroundColor: '#f3f4f6' }]}>
                <Ionicons name="checkmark-done" size={24} color="#6b7280" />
              </View>
              <Text style={styles.statNumber}>{soldTickets}</Text>
              <Text style={styles.statLabel}>Vendus</Text>
            </CardContent>
          </Card>

          <Card style={styles.statCard}>
            <CardContent style={styles.statContent}>
              <View style={[styles.statIcon, { backgroundColor: '#fef3c7' }]}>
                <Ionicons name="time" size={24} color="#d97706" />
              </View>
              <Text style={styles.statNumber}>{pendingTickets}</Text>
              <Text style={styles.statLabel}>En attente</Text>
            </CardContent>
          </Card>
        </View>

        {/* Revenue Card */}
        <Card style={styles.revenueCard}>
          <CardContent style={styles.revenueContent}>
            <View style={styles.revenueIcon}>
              <Ionicons name="trending-up" size={32} color="#059669" />
            </View>
            <View style={styles.revenueInfo}>
              <Text style={styles.revenueAmount}>{formatPrice(totalRevenue)}</Text>
              <Text style={styles.revenueLabel}>Chiffre d'affaires total</Text>
            </View>
          </CardContent>
        </Card>

        {/* Tickets Management */}
        <Card style={styles.ticketsCard}>
          <CardHeader>
            <Text style={styles.ticketsTitle}>Gestion des billets</Text>
          </CardHeader>
          <CardContent>
            {tickets.length > 0 ? (
              <View style={styles.ticketsList}>
                {tickets.map(ticket => {
                  const event = getEventById(ticket.eventId);
                  return (
                    <View key={ticket.id} style={styles.ticketItem}>
                      <View style={styles.ticketHeader}>
                        <View style={styles.ticketMainInfo}>
                          <Text style={styles.ticketEvent} numberOfLines={1}>
                            {event?.title || 'Événement inconnu'}
                          </Text>
                          <Text style={styles.ticketDetails}>
                            {ticket.section} - {ticket.row}{ticket.seat}
                          </Text>
                        </View>
                        <View style={styles.ticketPriceInfo}>
                          <Text style={styles.ticketPrice}>
                            {formatPrice(ticket.price)}
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
                      </View>

                      <View style={styles.ticketMeta}>
                        <View style={styles.sellerInfo}>
                          <Ionicons name="person-outline" size={14} color="#6b7280" />
                          <Text style={styles.sellerName}>{ticket.sellerName}</Text>
                        </View>
                        {event && (
                          <Text style={styles.eventDate}>
                            {new Date(event.date).toLocaleDateString('fr-FR')}
                          </Text>
                        )}
                      </View>

                      {/* Action Buttons */}
                      <View style={styles.actionButtons}>
                        {ticket.status !== 'available' && (
                          <Button
                            title="Disponible"
                            variant="outline"
                            size="sm"
                            onPress={() => handleStatusChange(ticket, 'available')}
                            style={[styles.actionButton, styles.availableButton]}
                          />
                        )}
                        {ticket.status !== 'pending' && (
                          <Button
                            title="En attente"
                            variant="outline"
                            size="sm"
                            onPress={() => handleStatusChange(ticket, 'pending')}
                            style={[styles.actionButton, styles.pendingButton]}
                          />
                        )}
                        {ticket.status !== 'sold' && (
                          <Button
                            title="Vendu"
                            variant="outline"
                            size="sm"
                            onPress={() => handleStatusChange(ticket, 'sold')}
                            style={[styles.actionButton, styles.soldButton]}
                          />
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="ticket-outline" size={48} color="#9ca3af" />
                <Text style={styles.emptyTitle}>Aucun billet</Text>
                <Text style={styles.emptyText}>
                  Aucun billet n'est actuellement sur la plateforme
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
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: 150,
  },
  statContent: {
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  revenueCard: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  revenueContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  revenueIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  revenueInfo: {
    flex: 1,
  },
  revenueAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 4,
  },
  revenueLabel: {
    fontSize: 16,
    color: '#065f46',
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
  ticketMainInfo: {
    flex: 1,
    marginRight: 12,
  },
  ticketEvent: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  ticketDetails: {
    fontSize: 14,
    color: '#6b7280',
  },
  ticketPriceInfo: {
    alignItems: 'flex-end',
    gap: 4,
  },
  ticketPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
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
  ticketMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sellerName: {
    fontSize: 14,
    color: '#6b7280',
  },
  eventDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    flex: 0,
    minWidth: 80,
  },
  availableButton: {
    borderColor: '#059669',
  },
  pendingButton: {
    borderColor: '#d97706',
  },
  soldButton: {
    borderColor: '#6b7280',
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