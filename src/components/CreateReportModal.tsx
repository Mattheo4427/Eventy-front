import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReportService } from '../services/ReportService';

interface CreateReportModalProps {
  visible: boolean;
  onClose: () => void;
  targetType: 'USER' | 'TICKET' | 'TRANSACTION';
  targetId: string;
  targetName?: string; // Nom de l'utilisateur ou titre du ticket pour affichage
}

export function CreateReportModal({ visible, onClose, targetType, targetId, targetName }: CreateReportModalProps) {
  const [reportType, setReportType] = useState<'SPAM' | 'FRAUD' | 'HARASSMENT' | 'INAPPROPRIATE_CONTENT' | 'OTHER'>('OTHER');
  const [reason, setReason] = useState('');
  const [evidence, setEvidence] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      Alert.alert("Erreur", "Veuillez décrire la raison du signalement.");
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        reportType,
        reason,
        evidence
      };

      if (targetType === 'USER') payload.reportedUserId = targetId;
      if (targetType === 'TICKET') payload.reportedTicketId = targetId;
      if (targetType === 'TRANSACTION') payload.reportedTransactionId = targetId;

      await ReportService.createReport(payload);
      Alert.alert("Succès", "Votre signalement a été envoyé et sera traité par nos équipes.");
      onClose();
      // Reset form
      setReason('');
      setEvidence('');
      setReportType('OTHER');
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Impossible d'envoyer le signalement.");
    } finally {
      setLoading(false);
    }
  };

  const ReportTypeButton = ({ type, label, icon }: { type: string, label: string, icon: any }) => (
    <TouchableOpacity 
      style={[styles.typeButton, reportType === type && styles.typeButtonActive]} 
      onPress={() => setReportType(type as any)}
    >
      <Ionicons name={icon} size={24} color={reportType === type ? '#fff' : '#4b5563'} />
      <Text style={[styles.typeButtonText, reportType === type && styles.typeButtonTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Signaler {targetType === 'USER' ? "un utilisateur" : targetType === 'TICKET' ? "un billet" : "une transaction"}</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#6b7280" /></TouchableOpacity>
          </View>
          
          <ScrollView style={styles.body}>
            {targetName && (
                <View style={styles.targetInfo}>
                    <Text style={styles.targetLabel}>Concerne :</Text>
                    <Text style={styles.targetValue}>{targetName}</Text>
                </View>
            )}

            <Text style={styles.label}>Type de problème</Text>
            <View style={styles.typesGrid}>
              <ReportTypeButton type="SPAM" label="Spam" icon="alert-circle-outline" />
              <ReportTypeButton type="FRAUD" label="Arnaque" icon="warning-outline" />
              <ReportTypeButton type="HARASSMENT" label="Harcèlement" icon="hand-left-outline" />
              <ReportTypeButton type="INAPPROPRIATE_CONTENT" label="Contenu inapproprié" icon="ban-outline" />
            </View>

            <Text style={styles.label}>Description détaillée *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Décrivez le problème..."
              multiline
              numberOfLines={4}
              value={reason}
              onChangeText={setReason}
            />

            <Text style={styles.label}>Preuves (Optionnel)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Liens, détails supplémentaires..."
              multiline
              numberOfLines={2}
              value={evidence}
              onChangeText={setEvidence}
            />
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Envoyer le signalement</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  body: { padding: 20 },
  
  targetInfo: { backgroundColor: '#f3f4f6', padding: 12, borderRadius: 8, marginBottom: 20 },
  targetLabel: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  targetValue: { fontSize: 14, fontWeight: '600', color: '#1f2937' },

  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, fontSize: 14, backgroundColor: '#fff' },
  textArea: { height: 100, textAlignVertical: 'top' },
  
  typesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeButton: { width: '48%', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center', flexDirection: 'row', gap: 8 },
  typeButtonActive: { backgroundColor: '#ef4444', borderColor: '#ef4444' },
  typeButtonText: { fontSize: 14, color: '#4b5563', fontWeight: '500' },
  typeButtonTextActive: { color: '#fff' },

  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#f3f4f6', flexDirection: 'row', gap: 12 },
  cancelButton: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#f3f4f6', alignItems: 'center' },
  cancelButtonText: { color: '#4b5563', fontWeight: '600' },
  submitButton: { flex: 2, padding: 14, borderRadius: 12, backgroundColor: '#ef4444', alignItems: 'center' },
  submitButtonText: { color: '#fff', fontWeight: 'bold' }
});
