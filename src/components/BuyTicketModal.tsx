import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CustomModal } from './ui/Modal';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { Ticket, Event } from '../types';

interface BuyTicketModalProps {
  visible: boolean;
  ticket: Ticket;
  event: Event;
  onBuy: () => void;
  onClose: () => void;
}

export function BuyTicketModal({ visible, ticket, event, onBuy, onClose }: BuyTicketModalProps) {
  const formatPrice = (price: number) => `${price}€`;

  const handlePurchase = () => {
    Alert.alert(
      'Confirm purchase',
      `Do you really want to buy this ticket for ${formatPrice(ticket.price)}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Buy',
          onPress: () => onBuy()
        }
      ]
    );
  };

  const savings = ticket.originalPrice - ticket.price;

  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      title="Buy a ticket"
    >
      <View style={styles.container}>
        {/* Event Info */}
        <Card style={styles.eventCard}>
          <CardContent>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <View style={styles.eventMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar" size={16} color="#6b7280" />
                <Text style={styles.metaText}>
                  {new Date(event.date).toLocaleDateString('fr-FR')}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="location" size={16} color="#6b7280" />
                <Text style={styles.metaText}>{event.venue}</Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Ticket Details */}
        <Card style={styles.ticketCard}>
          <CardContent>
            <Text style={styles.sectionTitle}>Détails du billet</Text>
            
            <View style={styles.ticketInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Section:</Text>
                <Text style={styles.infoValue}>{ticket.section}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Rang:</Text>
                <Text style={styles.infoValue}>{ticket.row}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Siège:</Text>
                <Text style={styles.infoValue}>{ticket.seat}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Vendeur:</Text>
                <Text style={styles.infoValue}>{ticket.sellerName}</Text>
              </View>
            </View>

            {ticket.description && (
              <View style={styles.description}>
                <Text style={styles.descriptionLabel}>Description:</Text>
                <Text style={styles.descriptionText}>{ticket.description}</Text>
              </View>
            )}
          </CardContent>
        </Card>

        {/* Price Summary */}
        <Card style={styles.priceCard}>
          <CardContent>
            <Text style={styles.sectionTitle}>Price summary</Text>
            
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Ticket price:</Text>
              <Text style={styles.priceValue}>{formatPrice(ticket.price)}</Text>
            </View>
            
            {savings > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.savingsLabel}>Savings:</Text>
                <Text style={styles.savingsValue}>-{formatPrice(savings)}</Text>
              </View>
            )}
            
            {ticket.originalPrice > ticket.price && (
              <View style={styles.priceRow}>
                <Text style={styles.originalPriceLabel}>Original price:</Text>
                <Text style={styles.originalPriceValue}>
                  {formatPrice(ticket.originalPrice)}
                </Text>
              </View>
            )}
            
            <View style={styles.separator} />
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total to pay:</Text>
              <Text style={styles.totalValue}>{formatPrice(ticket.price)}</Text>
            </View>
          </CardContent>
        </Card>

        {/* Actions */}
                <View style={styles.actions}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={onClose}
            size="lg"
            style={styles.cancelButton}
          />
          <Button
            title={`Buy - ${formatPrice(ticket.price)}`}
            onPress={handlePurchase}
            size="lg"
            style={styles.buyButton}
          />
        </View>
      </View>
    </CustomModal>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  eventCard: {
    backgroundColor: '#f8fafc',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  eventMeta: {
    gap: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: '#6b7280',
  },
  ticketCard: {},
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  ticketInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  description: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  priceCard: {},
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#374151',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  savingsLabel: {
    fontSize: 14,
    color: '#059669',
  },
  savingsValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  originalPriceLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  originalPriceValue: {
    fontSize: 14,
    color: '#6b7280',
    textDecorationLine: 'line-through',
  },
  separator: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
  },
  buyButton: {
    flex: 1,
  },
});