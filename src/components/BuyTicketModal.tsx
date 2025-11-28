import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, ActivityIndicator, Alert, Image, TouchableOpacity } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { Button } from './ui/Button';
import { Ticket, Event } from '../types';
import { TransactionService } from '../services/TransactionService';
import { Ionicons } from '@expo/vector-icons';

interface BuyTicketModalProps {
  visible: boolean;
  ticket: Ticket;
  event: Event;
  onClose: () => void;
  onSuccess: () => void;
}

export function BuyTicketModal({ visible, ticket, event, onClose, onSuccess }: BuyTicketModalProps) {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  
  // Stocke l'ID pour pouvoir annuler si l'utilisateur ferme avant de payer
  const [currentTransactionId, setCurrentTransactionId] = useState<string | null>(null);
  const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false);

  // --- GESTION DE LA FERMETURE (Annulation) ---
  const handleClose = async () => {
    // Si une transaction a été créée MAIS pas encore payée avec succès
    if (currentTransactionId && !isPaymentSuccessful) {
      try {
        console.log("Annulation de la transaction en cours...", currentTransactionId);
        await TransactionService.cancelTransaction(currentTransactionId);
      } catch (error) {
        console.error("Erreur silencieuse lors de l'annulation", error);
      }
    }
    
    // Reset des états pour la prochaine ouverture
    setCurrentTransactionId(null);
    setLoading(false);
    onClose();
  };

  // 1. Initialiser le paiement
  const initializePayment = async () => {
    setLoading(true);
    try {
      // A. Créer la transaction (PENDING) au backend
      const { clientSecret, transactionId } = await TransactionService.createPaymentIntent(
        ticket.id,
        ticket.salePrice
      );

      setCurrentTransactionId(transactionId); // On garde l'ID en mémoire

      // B. Initialiser Stripe
      const { error } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Eventy',
        returnURL: 'eventy://stripe-redirect',
        applePay: { merchantCountryCode: 'FR' },
        googlePay: { merchantCountryCode: 'FR', testEnv: true },
      });

      if (error) {
        Alert.alert('Erreur', "Impossible d'initialiser le paiement.");
        // On annule immédiatement la transaction backend car on ne peut pas payer
        await TransactionService.cancelTransaction(transactionId);
        setCurrentTransactionId(null);
        setLoading(false);
        return;
      }

      // C. Ouvrir la feuille
      await openPaymentSheet(transactionId);

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
      // CAS ECHEC / ANNULATION
      // On appelle TOUJOURS cancelTransaction. 
      // Le backend vérifiera Stripe pour savoir si c'est FAILED ou CANCELED.
      try {
        await TransactionService.cancelTransaction(transactionId);
      } catch (e) { console.error(e); }

      setCurrentTransactionId(null); // Nettoyage ID pour ne pas ré-annuler dans handleClose
      setLoading(false);

      if (error.code === 'Canceled') {
          // Feedback discret ou nul pour une simple annulation
      } else {
          // Feedback explicite pour un échec technique/bancaire
          Alert.alert("Paiement non abouti", error.message);
      }
      
      // Optionnel : Fermer le modal automatiquement après échec
      // onClose(); 
    } else {
      // CAS SUCCES
      try {
        await TransactionService.confirmTransaction(transactionId);
        // Succès total : on reset l'ID pour que handleClose ne fasse rien
        setCurrentTransactionId(null); 
        
        Alert.alert('Félicitations !', 'Votre billet est réservé.');
        onSuccess();
        onClose();
      } catch (e) {
        console.error(e);
        Alert.alert("Attention", "Paiement réussi mais erreur de validation.");
        setLoading(false);
      }
    }
  };

  return (
    <Modal 
        visible={visible} 
        animationType="slide" 
        transparent
        onRequestClose={handleClose} // Gère le bouton retour Android
    >
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
            {/* Bouton Fermer qui déclenche l'annulation */}
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
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

            {ticket.originalPrice > ticket.salePrice && (
                <View style={styles.row}>
                    <Text style={styles.label}>Prix initial</Text>
                    <Text style={[styles.value, styles.strikethrough]}>{ticket.originalPrice.toFixed(2)} €</Text>
                </View>
            )}

            <View style={styles.divider} />
            <View style={styles.row}>
                <Text style={styles.totalLabel}>Total à payer</Text>
                <View style={{alignItems: 'flex-end'}}>
                    <Text style={styles.totalPrice}>{ticket.salePrice.toFixed(2)} €</Text>
                    {ticket.originalPrice > ticket.salePrice && (
                        <Text style={styles.savingsText}>
                            Vous économisez {(ticket.originalPrice - ticket.salePrice).toFixed(2)} €
                        </Text>
                    )}
                </View>
            </View>
          </View>

          <View style={styles.footer}>
            <Button 
              title={loading ? "Paiement en cours..." : "Payer avec Stripe"} 
              onPress={initializePayment}
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
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    minHeight: 450,
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
  closeButton: { padding: 8, marginRight: -8 },
  
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
  strikethrough: { textDecorationLine: 'line-through', color: '#9ca3af' },
  savingsText: { fontSize: 12, color: '#10b981', fontWeight: '600', marginTop: 2 },

  footer: { marginTop: 'auto' },
  payButton: { width: '100%', borderRadius: 12, height: 50 }
});