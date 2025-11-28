import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction, User } from '../types';
import { Button } from './ui/Button';
import { AdminService } from '../services/AdminService';

interface TransactionDetailModalProps {
  visible: boolean;
  transaction: (Transaction & { isSale?: boolean }) | null;
  buyer?: User;
  onClose: () => void;
  onSuccess?: () => void; // Callback pour rafraîchir
  mode?: 'admin' | 'user';
}

export function TransactionDetailModal({ visible, transaction, buyer, onClose, onSuccess, mode = 'admin' }: TransactionDetailModalProps) {
  if (!transaction) return null;

  const isSale = transaction.isSale;
  const displayAmount = isSale ? transaction.vendorAmount : transaction.totalAmount;
  const displayLabel = isSale ? "Montant Net Vendeur" : "Montant Total";

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('fr-FR', {
      dateStyle: 'full',
      timeStyle: 'medium'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return '#10b981';
      case 'PENDING': return '#f59e0b';
      case 'FAILED': return '#ef4444';
      case 'REFUNDED': return '#6366f1';
      default: return '#6b7280';
    }
  };

  const statusColor = getStatusColor(transaction.status);

  const handleRefund = () => {
    Alert.alert(
      "Remboursement",
      "Cette action est irréversible. L'acheteur sera crédité via Stripe et le vendeur débité.",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Confirmer", style: "destructive", onPress: async () => {
            try {
                await AdminService.refundTransaction(transaction.id);
                Alert.alert("Succès", "Remboursement effectué.");
                if (onSuccess) onSuccess();
                onClose(); 
            } catch (e) {
                Alert.alert("Erreur", "Échec du remboursement.");
            }
        }}
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Détail Transaction</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Status Banner */}
          <View style={[styles.statusBanner, { backgroundColor: statusColor + '15', borderColor: statusColor }]}>
            <Ionicons name={transaction.status === 'COMPLETED' ? "checkmark-circle" : "information-circle"} size={32} color={statusColor} />
            <View style={styles.statusContent}>
              <Text style={[styles.statusTitle, { color: statusColor }]}>{transaction.status}</Text>
              <Text style={styles.statusDate}>{formatDate(transaction.transactionDate)}</Text>
            </View>
          </View>

          {/* Montant Principal */}
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>{displayLabel}</Text>
            <Text style={[styles.amountValue, { color: statusColor }]}>{displayAmount?.toFixed(2) ?? 'N/A'} €</Text>
          </View>

          {/* Détails Financiers */}
          {(mode === 'admin' || isSale) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Récapitulatif</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Prix Payé (Acheteur)</Text>
                <Text style={styles.value}>{transaction.totalAmount?.toFixed(2) ?? 'N/A'} €</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.row}>
                <Text style={styles.label}>Commission Plateforme</Text>
                <Text style={styles.value}>{transaction.platformFee?.toFixed(2) ?? 'N/A'} €</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.row}>
                <Text style={styles.label}>Net Vendeur</Text>
                <Text style={[styles.value, { fontWeight: 'bold', color: '#10b981' }]}>{transaction.vendorAmount?.toFixed(2) ?? 'N/A'} €</Text>
              </View>
            </View>
          )}

          {/* Informations Acheteur */}
          {mode === 'admin' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Acheteur</Text>
              <View style={styles.userCard}>
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{buyer?.firstName?.[0] || '?'}</Text>
                </View>
                <View>
                  <Text style={styles.userName}>{buyer ? `${buyer.firstName} ${buyer.lastName}` : 'Inconnu'}</Text>
                  <Text style={styles.userEmail}>{buyer?.email || 'Email non disponible'}</Text>
                  <Text style={styles.userId}>ID: {transaction.buyerId}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Informations Générales (Visible pour tous) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Méthode de paiement</Text>
              <Text style={styles.value}>{transaction.paymentMethod}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>ID Ticket</Text>
              <Text style={[styles.value, styles.uuid]}>{transaction.ticketId}</Text>
            </View>
          </View>

          {/* Informations Techniques (Admin Only) */}
          {mode === 'admin' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Infos Techniques</Text>
              <View style={styles.row}>
                <Text style={styles.label}>ID Transaction</Text>
                <Text style={[styles.value, styles.uuid]}>{transaction.id}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.row}>
                <Text style={styles.label}>Date Validation</Text>
                <Text style={styles.value}>{transaction.validationDate ? formatDate(transaction.validationDate) : '-'}</Text>
              </View>
              {transaction.paymentToken && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.row}>
                    <Text style={styles.label}>Token Paiement</Text>
                    <Text style={[styles.value, styles.uuid]}>{transaction.paymentToken}</Text>
                  </View>
                </>
              )}
            </View>
          )}

          {/* Actions Admin - Remboursement */}
          {mode === 'admin' && transaction.status === 'COMPLETED' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: '#ef4444' }]}>Zone de Danger</Text>
              <Button 
                title="Rembourser la transaction" 
                onPress={handleRefund} 
                variant="outline" 
                style={{ borderColor: '#ef4444' }}
                textStyle={{ color: '#ef4444' }}
                icon={<Ionicons name="alert-circle-outline" size={20} color="#ef4444" />}
              />
            </View>
          )}
          
          <View style={{height: 40}} />
        </ScrollView>
        
        <View style={styles.footer}>
             <Button title="Fermer" onPress={onClose} variant="outline" style={{width: '100%'}} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  closeButton: { padding: 4 },
  content: { flex: 1, padding: 20 },
  
  statusBanner: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 24 },
  statusContent: { marginLeft: 12 },
  statusTitle: { fontSize: 18, fontWeight: 'bold' },
  statusDate: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  
  amountContainer: { alignItems: 'center', marginBottom: 32 },
  amountLabel: { fontSize: 14, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1 },
  amountValue: { fontSize: 40, fontWeight: 'bold' },
  
  section: { backgroundColor: '#f9fafb', borderRadius: 16, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 12, textTransform: 'uppercase' },
  
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  label: { fontSize: 15, color: '#6b7280' },
  value: { fontSize: 15, color: '#111827', fontWeight: '500', flex: 1, textAlign: 'right', marginLeft: 16 },
  uuid: { fontSize: 11, fontFamily: 'Courier' }, // Si police monospace dispo
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 8 },
  
  userCard: { flexDirection: 'row', alignItems: 'center' },
  avatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e0e7ff', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: '#4338ca', fontWeight: 'bold', fontSize: 16 },
  userName: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  userEmail: { fontSize: 14, color: '#6b7280' },
  userId: { fontSize: 10, color: '#9ca3af', marginTop: 2 },
  
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#f3f4f6' }
});