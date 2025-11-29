import React, { useMemo } from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Report, User, Ticket, Transaction } from '../types';
import { Button } from './ui/Button';
import { AdminService } from '../services/AdminService';

interface ReportDetailModalProps {
  visible: boolean;
  report: Report | null;
  reporter?: User; // L'utilisateur qui a fait le signalement
  users: User[];
  tickets: Ticket[];
  transactions: Transaction[];
  onClose: () => void;
  onUpdateStatus: (report: Report, status: string) => void;
  onOpenTicket: (ticket: Ticket) => void;
  onOpenTransaction: (transaction: Transaction) => void;
  onOpenUser: (user: User) => void;
}

export function ReportDetailModal({ 
    visible, 
    report, 
    reporter, 
    users, 
    tickets, 
    transactions, 
    onClose, 
    onUpdateStatus,
    onOpenTicket,
    onOpenTransaction,
    onOpenUser
}: ReportDetailModalProps) {
  if (!report) return null;

  const statusColors: Record<string, string> = { 
    'PENDING': '#f59e0b', 
    'UNDER_INVESTIGATION': '#3b82f6', 
    'RESOLVED': '#10b981', 
    'DISMISSED': '#6b7280' 
  };
  const color = statusColors[report.status] || '#6b7280';

  // --- LOGIQUE DE RÉSOLUTION DE L'UTILISATEUR SIGNALÉ ---
  const reportedUser = useMemo(() => {
      if (report.reportedUserId) {
          return users.find(u => u.id === report.reportedUserId);
      }
      if (report.reportedTicketId) {
          const ticket = tickets.find(t => t.id === report.reportedTicketId);
          if (ticket) return users.find(u => u.id === ticket.vendorId);
      }
      if (report.reportedTransactionId) {
          const transaction = transactions.find(t => t.id === report.reportedTransactionId);
          if (transaction) {
              // Si le signaleur est l'acheteur, le signalé est le vendeur (via le ticket)
              if (report.reporterId === transaction.buyerId) {
                  const ticket = tickets.find(t => t.id === transaction.ticketId);
                  return ticket ? users.find(u => u.id === ticket.vendorId) : undefined;
              }
              // Si le signaleur est le vendeur (peu probable mais possible), le signalé est l'acheteur
              const ticket = tickets.find(t => t.id === transaction.ticketId);
              if (ticket && ticket.vendorId === report.reporterId) {
                  return users.find(u => u.id === transaction.buyerId);
              }
          }
      }
      return undefined;
  }, [report, users, tickets, transactions]);

  const handleStatusChange = (newStatus: string) => {
      onUpdateStatus(report, newStatus);
      onClose();
  };

  const handleSuspendUser = () => {
      if (!reportedUser) return;
      Alert.alert(
          "Suspendre l'utilisateur",
          `Voulez-vous vraiment suspendre ${reportedUser.firstName} ${reportedUser.lastName} ?`,
          [
              { text: "Annuler", style: "cancel" },
              { 
                  text: "Suspendre", 
                  style: "destructive", 
                  onPress: async () => {
                      try {
                          await AdminService.suspendUser(reportedUser.id);
                          Alert.alert("Succès", "Utilisateur suspendu.");
                          onClose(); // Fermer pour rafraîchir
                      } catch (e) {
                          Alert.alert("Erreur", "Impossible de suspendre l'utilisateur.");
                      }
                  } 
              }
          ]
      );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Détail Signalement #{report.id}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
            {/* Status Banner */}
            <View style={[styles.statusBanner, { backgroundColor: color + '20' }]}>
                <Ionicons name="warning" size={24} color={color} />
                <Text style={[styles.statusText, { color: color }]}>{report.status}</Text>
            </View>

            {/* Info Signalement */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Informations</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Type</Text>
                    <Text style={styles.value}>{report.reportType}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.row}>
                    <Text style={styles.label}>Date</Text>
                    <Text style={styles.value}>{new Date(report.reportDate).toLocaleString()}</Text>
                </View>
            </View>

            {/* Reporter */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Signaleur</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>ID</Text>
                    <Text style={styles.value}>{report.reporterId}</Text>
                </View>
                {reporter && (
                    <>
                        <View style={styles.divider} />
                        <View style={styles.row}>
                            <Text style={styles.label}>Nom</Text>
                            <Text style={styles.value}>{reporter.firstName} {reporter.lastName}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.row}>
                            <Text style={styles.label}>Email</Text>
                            <Text style={styles.value}>{reporter.email}</Text>
                        </View>
                    </>
                )}
            </View>

            {/* Cible du signalement (Objets) */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Objet du signalement</Text>
                
                {report.reportedTicketId && (
                    <View style={styles.objectRow}>
                        <View style={{flex: 1}}>
                            <Text style={styles.label}>Ticket ID</Text>
                            <Text style={[styles.value, { textAlign: 'left', marginLeft: 0 }]}>{report.reportedTicketId}</Text>
                        </View>
                        <TouchableOpacity 
                            style={styles.iconButton} 
                            onPress={() => {
                                const t = tickets.find(x => x.id === report.reportedTicketId);
                                if (t) onOpenTicket(t);
                                else Alert.alert("Info", "Ticket introuvable (peut-être supprimé)");
                            }}
                        >
                            <Ionicons name="arrow-forward-circle" size={28} color="#2563eb" />
                        </TouchableOpacity>
                    </View>
                )}

                {report.reportedTransactionId && (
                    <View style={styles.objectRow}>
                        <View style={{flex: 1}}>
                            <Text style={styles.label}>Transaction ID</Text>
                            <Text style={[styles.value, { textAlign: 'left', marginLeft: 0 }]}>{report.reportedTransactionId}</Text>
                        </View>
                        <TouchableOpacity 
                            style={styles.iconButton}
                            onPress={() => {
                                const t = transactions.find(x => x.id === report.reportedTransactionId);
                                if (t) onOpenTransaction(t);
                                else Alert.alert("Info", "Transaction introuvable");
                            }}
                        >
                            <Ionicons name="arrow-forward-circle" size={28} color="#2563eb" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* UTILISATEUR SIGNALÉ (DÉDUIT OU EXPLICITE) */}
            {reportedUser && (
                <View style={[styles.section, { borderColor: '#ef4444', borderWidth: 1 }]}>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
                        <Text style={[styles.sectionTitle, { color: '#ef4444', marginBottom: 0 }]}>Utilisateur Signalé</Text>
                        <Ionicons name="alert-circle" size={20} color="#ef4444" />
                    </View>
                    
                    <View style={styles.row}>
                        <Text style={styles.label}>Nom</Text>
                        <Text style={styles.value}>{reportedUser.firstName} {reportedUser.lastName}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.row}>
                        <Text style={styles.label}>Email</Text>
                        <Text style={styles.value}>{reportedUser.email}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.row}>
                        <Text style={styles.label}>Statut</Text>
                        <Text style={[styles.value, { color: reportedUser.status === 'SUSPENDED' ? '#ef4444' : '#10b981' }]}>
                            {reportedUser.status}
                        </Text>
                    </View>

                    <View style={{flexDirection: 'row', gap: 10, marginTop: 16}}>
                        {reportedUser.status !== 'SUSPENDED' && (
                            <Button 
                                title="Suspendre" 
                                onPress={handleSuspendUser} 
                                style={{flex: 1, backgroundColor: '#ef4444'}}
                            />
                        )}
                    </View>
                </View>
            )}

            {/* Raison & Preuve */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Détails</Text>
                <Text style={styles.label}>Motif :</Text>
                <Text style={styles.textBlock}>{report.reason}</Text>
                
                {report.evidence && (
                    <>
                        <Text style={[styles.label, {marginTop: 12}]}>Preuve :</Text>
                        <Text style={styles.textBlock}>{report.evidence}</Text>
                    </>
                )}
            </View>

            {/* Actions Admin */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Actions</Text>
                <View style={styles.actionButtons}>
                    {report.status === 'PENDING' && (
                        <Button title="Investiguer" onPress={() => handleStatusChange('UNDER_INVESTIGATION')} style={{backgroundColor: '#3b82f6', marginBottom: 8}} />
                    )}
                    {report.status !== 'RESOLVED' && report.status !== 'DISMISSED' && (
                        <Button title="Résoudre" onPress={() => handleStatusChange('RESOLVED')} style={{backgroundColor: '#10b981', marginBottom: 8}} />
                    )}
                    {/* Masquer le bouton Rejeter si le statut est RESOLVED */}
                    {report.status !== 'RESOLVED' && report.status !== 'DISMISSED' && (
                        <Button title="Rejeter" onPress={() => handleStatusChange('DISMISSED')} style={{backgroundColor: '#6b7280'}} />
                    )}
                </View>
            </View>

        </ScrollView>
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

  section: { marginBottom: 24, backgroundColor: '#f9fafb', padding: 12, borderRadius: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#6b7280', marginBottom: 12, textTransform: 'uppercase' },
  
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  objectRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  
  label: { fontSize: 14, color: '#6b7280', fontWeight: '500' },
  value: { fontSize: 14, color: '#111827', fontWeight: '600', flex: 1, textAlign: 'right', marginLeft: 16, flexShrink: 1 },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 4 },
  
  textBlock: { fontSize: 14, color: '#374151', marginTop: 4, lineHeight: 20, fontStyle: 'italic' },
  
  actionButtons: { flexDirection: 'column', gap: 8 },
  
  linkButton: { marginTop: 8, alignSelf: 'flex-end' },
  linkButtonText: { color: '#2563eb', fontWeight: '600', fontSize: 14 },
  
  iconButton: { padding: 4 }
});