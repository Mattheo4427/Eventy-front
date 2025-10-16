import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { CustomModal } from './ui/Modal';
import { Button } from './ui/Button';
import { Report } from '../types';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  reportType: 'user' | 'ticket' | 'transaction' | 'event' | 'other';
  reportedId: string;
  reportedName: string;
  onSubmitReport: (report: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>) => void;
  currentUserId: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  visible,
  onClose,
  reportType,
  reportedId,
  reportedName,
  onSubmitReport,
  currentUserId
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getReportReasons = () => {
    switch (reportType) {
      case 'user':
        return [
          'Comportement inapproprié',
          'Spam ou publicité',
          'Contenu offensant',
          'Arnaque ou fraude',
          'Usurpation d\'identité',
          'Autre'
        ];
      case 'ticket':
        return [
          'Prix excessif',
          'Billet suspect ou faux',
          'Information incorrecte',
          'Vente multiple du même billet',
          'Autre'
        ];
      case 'transaction':
        return [
          'Paiement non reçu',
          'Billet non livré',
          'Billet invalide',
          'Remboursement non effectué',
          'Autre'
        ];
      case 'event':
        return [
          'Événement annulé non signalé',
          'Informations incorrectes',
          'Contenu inapproprié',
          'Autre'
        ];
      default:
        return [
          'Problème technique',
          'Contenu inapproprié',
          'Autre'
        ];
    }
  };

  const getReportTitle = () => {
    switch (reportType) {
      case 'user': return `Signaler l'utilisateur: ${reportedName}`;
      case 'ticket': return `Signaler le billet: ${reportedName}`;
      case 'transaction': return `Signaler la transaction: ${reportedName}`;
      case 'event': return `Signaler l'événement: ${reportedName}`;
      default: return 'Signaler un problème';
    }
  };

  const handleSubmit = async () => {
    if (!selectedReason || !description.trim()) {
      Alert.alert('Erreur', 'Veuillez sélectionner une raison et fournir une description.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitReport({
        reporterId: currentUserId,
        reportedType: reportType,
        reportedId,
        reason: selectedReason,
        description: description.trim(),
        status: 'pending',
        priority: 'medium'
      });
      
      Alert.alert(
        'Signalement envoyé',
        'Votre signalement a été transmis à nos équipes. Nous examinerons votre demande dans les plus brefs délais.',
        [{ text: 'OK', onPress: onClose }]
      );
      
      setSelectedReason('');
      setDescription('');
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'envoi du signalement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomModal visible={visible} onClose={onClose} title={getReportTitle()}>
      <View style={styles.container}>
        <Text style={styles.subtitle}>
          Aidez-nous à maintenir une communauté sûre en signalant les problèmes.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Raison du signalement *</Text>
          <View style={styles.reasonsList}>
            {getReportReasons().map((reason) => (
              <TouchableOpacity
                key={reason}
                style={[
                  styles.reasonItem,
                  selectedReason === reason && styles.selectedReason
                ]}
                onPress={() => setSelectedReason(reason)}
              >
                <View style={[
                  styles.radio,
                  selectedReason === reason && styles.radioSelected
                ]}>
                  {selectedReason === reason && <View style={styles.radioDot} />}
                </View>
                <Text style={[
                  styles.reasonText,
                  selectedReason === reason && styles.selectedReasonText
                ]}>
                  {reason}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description détaillée *</Text>
          <TextInput
            style={styles.textArea}
            value={description}
            onChangeText={setDescription}
            placeholder="Décrivez le problème en détail. Plus vous fournirez d'informations, plus nous pourrons traiter votre signalement efficacement."
            multiline
            numberOfLines={6}
            maxLength={1000}
            textAlignVertical="top"
          />
          <Text style={styles.characterCount}>
            {description.length}/1000 caractères
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.disclaimer}>
            Les signalements abusifs ou répétés peuvent entraîner des sanctions sur votre compte.
          </Text>
          <View style={styles.actions}>
            <Button
              title="Annuler"
              onPress={onClose}
              variant="outline"
              style={styles.actionButton}
            />
            <Button
              title={isSubmitting ? 'Envoi...' : 'Signaler'}
              onPress={handleSubmit}
              disabled={!selectedReason || !description.trim() || isSubmitting}
              style={styles.actionButton}
            />
          </View>
        </View>
      </View>
    </CustomModal>
  );
};

// Composant pour la gestion des signalements par les administrateurs
interface ReportManagementProps {
  visible: boolean;
  onClose: () => void;
  reports: Report[];
  onUpdateReportStatus: (reportId: string, status: Report['status'], notes?: string) => void;
  onUpdateReportPriority: (reportId: string, priority: Report['priority']) => void;
}

export const ReportManagement: React.FC<ReportManagementProps> = ({
  visible,
  onClose,
  reports,
  onUpdateReportStatus,
  onUpdateReportPriority
}) => {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const getStatusColor = (status: Report['status']) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'investigating': return '#3b82f6';
      case 'resolved': return '#10b981';
      case 'dismissed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority: Report['priority']) => {
    switch (priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#f59e0b';
      case 'low': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusUpdate = (status: Report['status']) => {
    if (selectedReport) {
      onUpdateReportStatus(selectedReport.id, status, adminNotes);
      setSelectedReport(null);
      setAdminNotes('');
    }
  };

  if (selectedReport) {
    return (
      <CustomModal 
        visible={visible} 
        onClose={onClose} 
        title={`Signalement #${selectedReport.id.substring(0, 8)}`}
      >
        <View style={styles.container}>
          <ScrollView style={styles.reportDetail}>
            <View style={styles.reportHeader}>
              <View style={styles.statusBadge}>
                <View style={[
                  styles.statusDot,
                  { backgroundColor: getStatusColor(selectedReport.status) }
                ]} />
                <Text style={styles.statusText}>{selectedReport.status}</Text>
              </View>
              <View style={[
                styles.priorityBadge,
                { backgroundColor: getPriorityColor(selectedReport.priority) }
              ]}>
                <Text style={styles.priorityText}>{selectedReport.priority}</Text>
              </View>
            </View>

            <View style={styles.reportInfo}>
              <Text style={styles.infoLabel}>Type:</Text>
              <Text style={styles.infoValue}>{selectedReport.reportedType}</Text>
            </View>

            <View style={styles.reportInfo}>
              <Text style={styles.infoLabel}>Raison:</Text>
              <Text style={styles.infoValue}>{selectedReport.reason}</Text>
            </View>

            <View style={styles.reportInfo}>
              <Text style={styles.infoLabel}>Description:</Text>
              <Text style={styles.infoValue}>{selectedReport.description}</Text>
            </View>

            <View style={styles.reportInfo}>
              <Text style={styles.infoLabel}>Date de création:</Text>
              <Text style={styles.infoValue}>{formatDate(selectedReport.createdAt)}</Text>
            </View>

            {selectedReport.adminNotes && (
              <View style={styles.reportInfo}>
                <Text style={styles.infoLabel}>Notes admin:</Text>
                <Text style={styles.infoValue}>{selectedReport.adminNotes}</Text>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notes administrateur</Text>
              <TextInput
                style={styles.textArea}
                value={adminNotes}
                onChangeText={setAdminNotes}
                placeholder="Ajoutez des notes pour ce signalement..."
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.actionsSection}>
              <Text style={styles.sectionTitle}>Actions</Text>
              <View style={styles.actionButtons}>
                <Button
                  title="Enquête en cours"
                  onPress={() => handleStatusUpdate('investigating')}
                  variant="outline"
                  size="sm"
                />
                <Button
                  title="Résolu"
                  onPress={() => handleStatusUpdate('resolved')}
                  size="sm"
                />
                <Button
                  title="Rejeter"
                  onPress={() => handleStatusUpdate('dismissed')}
                  variant="outline"
                  size="sm"
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button
              title="Retour à la liste"
              onPress={() => setSelectedReport(null)}
              variant="outline"
            />
          </View>
        </View>
      </CustomModal>
    );
  }

  return (
    <CustomModal visible={visible} onClose={onClose} title="Gestion des signalements">
      <View style={styles.container}>
        <ScrollView style={styles.reportsList}>
          {reports.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Aucun signalement</Text>
            </View>
          ) : (
            reports.map((report) => (
              <TouchableOpacity
                key={report.id}
                style={styles.reportItem}
                onPress={() => setSelectedReport(report)}
              >
                <View style={styles.reportItemHeader}>
                  <View style={styles.reportMeta}>
                    <Text style={styles.reportType}>{report.reportedType}</Text>
                    <Text style={styles.reportDate}>{formatDate(report.createdAt)}</Text>
                  </View>
                  <View style={styles.badges}>
                    <View style={[
                      styles.priorityBadge,
                      { backgroundColor: getPriorityColor(report.priority) }
                    ]}>
                      <Text style={styles.priorityText}>{report.priority}</Text>
                    </View>
                    <View style={styles.statusBadge}>
                      <View style={[
                        styles.statusDot,
                        { backgroundColor: getStatusColor(report.status) }
                      ]} />
                    </View>
                  </View>
                </View>
                <Text style={styles.reportReason}>{report.reason}</Text>
                <Text style={styles.reportDescription} numberOfLines={2}>
                  {report.description}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </CustomModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxHeight: 600,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  reasonsList: {
    gap: 8,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectedReason: {
    borderColor: '#3b82f6',
    backgroundColor: '#f0f9ff',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#3b82f6',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
  },
  reasonText: {
    fontSize: 14,
    color: '#374151',
  },
  selectedReasonText: {
    color: '#1e40af',
    fontWeight: '500',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 120,
  },
  characterCount: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
    marginTop: 4,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
  },
  disclaimer: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    marginBottom: 16,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  reportsList: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
  reportItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  reportItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportMeta: {
    flex: 1,
  },
  reportType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textTransform: 'capitalize',
  },
  reportDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#374151',
    textTransform: 'capitalize',
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  reportReason: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  reportDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  reportDetail: {
    flex: 1,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  reportInfo: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
  },
  actionsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});