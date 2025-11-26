import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, ActivityIndicator, Alert, Image, TouchableOpacity } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native'; // <--- Hook Stripe
import { Button } from './ui/Button';
import { Ticket, Event } from '../types';
import { TransactionService } from '../services/TransactionService';
import { Ionicons } from '@expo/vector-icons';

interface BuyTicketModalProps {
  visible: boolean;
  ticket: Ticket;
  event: Event;
  onClose: () => void;
  onSuccess: () => void; // Callback appelé après succès
}

export function BuyTicketModal({ visible, ticket, event, onClose, onSuccess }: BuyTicketModalProps) {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const [currentTransactionId, setCurrentTransactionId] = useState<string | null>(null); // AJOUT

  // 1. Initialiser le paiement
  const initializePayment = async () => {
    setLoading(true);
    try {
      // A. Demander au backend de créer l'intention de paiement
      const { clientSecret, transactionId } = await TransactionService.createPaymentIntent(
        ticket.id,
        ticket.salePrice
      );

      setCurrentTransactionId(transactionId); // AJOUT

      // B. Initialiser la feuille de paiement Stripe
      const { error } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Eventy',
        returnURL: 'eventy://stripe-redirect', // Pour le retour d'app (deeplinking)
        // Configuration optionnelle pour Apple Pay / Google Pay
        applePay: { merchantCountryCode: 'FR' },
        googlePay: { merchantCountryCode: 'FR', testEnv: true },
      });

      if (error) {
        Alert.alert('Erreur', "Impossible d'initialiser le paiement.");
        setLoading(false);
        return;
      }

      // C. Ouvrir la feuille de paiement
      openPaymentSheet(transactionId);

    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', "Erreur de communication avec le serveur.");
      setLoading(false);
    }
  };

  // 2. Présenter la feuille et gérer le résultat
  const openPaymentSheet = async (transactionId: string) => {
    const { error } = await presentPaymentSheet();

    if (error) {
      Alert.alert(`Paiement annulé`, error.message);
      setLoading(false);
    } else {
      try {
        // 1. On confirme au backend que le paiement est fait
        await TransactionService.confirmTransaction(transactionId);
        
        Alert.alert('Succès', 'Votre paiement est confirmé ! Le billet est à vous.');
        onSuccess();
        onClose();
      } catch (e) {
        console.error("Erreur confirmation backend", e);
        Alert.alert("Attention", "Paiement réussi mais erreur de validation. Contactez le support.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header avec Image */}
          <View style={styles.header}>
            <Image 
                source={{ uri: event.imageUrl || 'https://via.placeholder.com/100' }} 
                style={styles.eventImage} 
            />
            <View style={{flex: 1}}>
                <Text style={styles.title}>Récapitulatif</Text>
                <Text style={styles.eventName}>{event.name}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Détails du Billet */}
          <View style={styles.detailsContainer}>
            <View style={styles.row}>
                <Text style={styles.label}>Type</Text>
                <Text style={styles.value}>{ticket.ticketTypeLabel || 'Standard'}</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Place</Text>
                <Text style={styles.value}>
                    {ticket.section ? `Sec ${ticket.section}` : ''} {ticket.row ? `Rg ${ticket.row}` : ''}
                </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
                <Text style={styles.totalLabel}>Total à payer</Text>
                <Text style={styles.totalPrice}>{ticket.salePrice.toFixed(2)} €</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Button 
              title={loading ? "Chargement..." : "Payer avec Stripe"} 
              onPress={initializePayment} // Lance le flux
              disabled={loading}
              variant="primary"
              style={styles.payButton}
              icon={<Ionicons name="card-outline" size={20} color="white" style={{marginRight: 8}}/>}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end', // Affichage type "Bottom Sheet"
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    minHeight: 400,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12
  },
  eventImage: {
      width: 60, height: 60, borderRadius: 8, backgroundColor: '#f3f4f6'
  },
  title: { fontSize: 14, color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' },
  eventName: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  closeButton: { padding: 4 },
  
  detailsContainer: {
      backgroundColor: '#f9fafb',
      padding: 16,
      borderRadius: 12,
      marginBottom: 24
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  label: { color: '#6b7280', fontSize: 16 },
  value: { color: '#111827', fontSize: 16, fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 12 },
  totalLabel: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  totalPrice: { fontSize: 24, fontWeight: 'bold', color: '#2563eb' },

  footer: { marginTop: 'auto' },
  payButton: { width: '100%', borderRadius: 12, height: 50 }
});