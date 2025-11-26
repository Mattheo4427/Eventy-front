import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { TicketService } from '../services/TicketService';
import { Event } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface SellTicketModalProps {
  visible: boolean;
  event: Event | null; // L'événement pour lequel on vend
  onClose: () => void;
  onSuccess: () => void;
}

export function SellTicketModal({ visible, event, onClose, onSuccess }: SellTicketModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [ticketTypes, setTicketTypes] = useState<any[]>([]);

  // Formulaire
  const [form, setForm] = useState({
    ticketTypeId: '11111111-1111-1111-1111-111111111111', // Standard par défaut
    originalPrice: '',
    salePrice: '',
    section: '',
    row: '',
    seat: '',
    description: ''
  });

  useEffect(() => {
    // Charger les types de billets
    TicketService.getTicketTypes().then(setTicketTypes);
  }, []);

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert("Erreur", "Vous devez être connecté pour vendre.");
      return;
    }
    if (!event) return;
    if (!form.salePrice || !form.originalPrice) {
      Alert.alert("Erreur", "Les prix sont obligatoires.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        eventId: event.id,
        vendorId: user.id, // L'utilisateur connecté
        ticketTypeId: form.ticketTypeId,
        originalPrice: parseFloat(form.originalPrice),
        salePrice: parseFloat(form.salePrice),
        section: form.section,
        row: form.row ? parseInt(form.row) : null, // Conversion en entier pour le backend
        seat: form.seat,
        description: form.description
      };

      await TicketService.createTicket(payload);
      
      Alert.alert("Succès", "Votre billet est en vente !");
      onSuccess(); // Rafraîchir la liste
      onClose();
      
      // Reset form
      setForm({ ...form, originalPrice: '', salePrice: '', section: '', row: '', seat: '' });
      
    } catch (error) {
      console.error("Erreur vente", error);
      Alert.alert("Erreur", "Impossible de mettre en vente le billet.");
    } finally {
      setLoading(false);
    }
  };

  if (!event) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <Text style={styles.title}>Vendre un billet</Text>
        <Text style={styles.subtitle}>{event.name}</Text>
        
        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          
          {/* Sélection Type */}
          <Text style={styles.label}>Type de billet</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeContainer}>
            {ticketTypes.map(type => (
              <TouchableOpacity 
                key={type.id}
                style={[styles.typeChip, form.ticketTypeId === type.id && styles.typeChipActive]}
                onPress={() => setForm({...form, ticketTypeId: type.id})}
              >
                <Text style={[styles.typeText, form.ticketTypeId === type.id && styles.typeTextActive]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Prix */}
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Input 
                label="Prix d'origine (€)" 
                value={form.originalPrice} 
                onChangeText={t => setForm({...form, originalPrice: t})} 
                keyboardType="numeric"
                placeholder="50.00"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Input 
                label="Prix de vente (€)" 
                value={form.salePrice} 
                onChangeText={t => setForm({...form, salePrice: t})} 
                keyboardType="numeric"
                placeholder="45.00"
              />
            </View>
          </View>

          {/* Localisation */}
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Input label="Section" value={form.section} onChangeText={t => setForm({...form, section: t})} placeholder="A, Nord..." />
            </View>
            <View style={{ flex: 0.6, marginRight: 8 }}>
              <Input label="Rang" value={form.row} onChangeText={t => setForm({...form, row: t})} keyboardType="numeric" />
            </View>
            <View style={{ flex: 0.6 }}>
              <Input label="Siège" value={form.seat} onChangeText={t => setForm({...form, seat: t})} />
            </View>
          </View>
          
          <Button 
            title={loading ? "Publication..." : "Mettre en vente"} 
            onPress={handleSubmit} 
            disabled={loading} 
            style={{ marginTop: 24 }} 
            variant="primary"
          />
          <Button 
            title="Annuler" 
            onPress={onClose} 
            variant="outline" 
            style={{ marginTop: 12, marginBottom: 30 }} 
          />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff', paddingTop: 60 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#6b7280', marginBottom: 24 },
  form: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  typeContainer: { flexDirection: 'row', marginBottom: 16, maxHeight: 40 },
  typeChip: {
    paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#f3f4f6',
    borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#e5e7eb'
  },
  typeChipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  typeText: { color: '#374151', fontWeight: '500' },
  typeTextActive: { color: '#fff' }
});