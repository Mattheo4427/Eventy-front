import React from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Ticket, Event } from '../types';
import { Button } from './ui/Button';

interface TicketDetailModalProps {
  visible: boolean;
  ticket: Ticket | null;
  event?: Event; // L'événement associé si disponible
  onClose: () => void;
  hideSalesInfo?: boolean;
}

export function TicketDetailModal({ visible, ticket, event, onClose, hideSalesInfo = false }: TicketDetailModalProps) {
  if (!ticket) return null;

  const statusColors: Record<string, string> = { 
    'AVAILABLE': '#10b981', 
    'SOLD': '#6b7280', 
    'PENDING': '#f59e0b', 
    'CANCELED': '#ef4444' 
  };
  const statusColor = statusColors[ticket.status?.toUpperCase()] || '#6b7280';

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Détail du Billet</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* En-tête Billet */}
          <View style={[styles.statusBanner, { backgroundColor: statusColor + '20' }]}>
            <Ionicons name="ticket-outline" size={24} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {ticket.status?.toUpperCase() || 'INCONNU'}
            </Text>
          </View>

          {/* Info Événement */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Événement</Text>
            <Text style={styles.eventName}>{event?.name || 'Nom de l\'événement indisponible'}</Text>
            <Text style={styles.eventDetail}>
              {event ? `${new Date(event.startDate).toLocaleDateString()} à ${event.location}` : ticket.eventId}
            </Text>
          </View>

          {/* Info Place */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Placement</Text>
            <View style={styles.grid}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Type</Text>
                <Text style={styles.value}>{ticket.ticketTypeLabel || 'Standard'}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Section</Text>
                <Text style={styles.value}>{ticket.section || '-'}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Rang</Text>
                <Text style={styles.value}>{ticket.row || '-'}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Siège</Text>
                <Text style={styles.value}>{ticket.seat || '-'}</Text>
              </View>
            </View>
          </View>

          {/* Info Vente */}
          {ticket.status?.toUpperCase() === 'SOLD' && !hideSalesInfo && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Détails de la vente</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Prix de vente</Text>
                <Text style={styles.price}>{ticket.salePrice?.toFixed(2)} €</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Vendeur</Text>
                <Text style={styles.value}>{ticket.sellerName || 'Inconnu'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>ID Billet</Text>
                <Text style={styles.smallValue}>{ticket.id}</Text>
              </View>
            </View>
          )}

        </ScrollView>

        <View style={styles.footer}>
          <Button title="Fermer" onPress={onClose} variant="outline" style={{ width: '100%' }} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  closeButton: { padding: 4 },
  content: { flex: 1, padding: 20 },
  
  statusBanner: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 24, gap: 12 },
  statusText: { fontSize: 18, fontWeight: 'bold' },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#6b7280', marginBottom: 12, textTransform: 'uppercase' },
  eventName: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  eventDetail: { fontSize: 14, color: '#4b5563' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  gridItem: { width: '45%', backgroundColor: '#f9fafb', padding: 12, borderRadius: 8 },
  
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  label: { fontSize: 14, color: '#6b7280' },
  value: { fontSize: 16, fontWeight: '500', color: '#111827' },
  smallValue: { fontSize: 12, color: '#9ca3af', fontFamily: 'monospace' },
  price: { fontSize: 18, fontWeight: 'bold', color: '#059669' },

  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#f3f4f6' }
});
