import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal } from 'react-native';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { AdminService } from '../services/AdminService';

interface CreateEventModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}


export function CreateEventModal({ visible, onClose, onSuccess }: CreateEventModalProps) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    location: '',
    startDate: '', // Format ISO attendu: YYYY-MM-DDTHH:mm:ss
    endDate: '',
    imageUrl: '',
    eventTypeId: '11111111-1111-1111-1111-111111111111', // ID Concert par défaut (à rendre dynamique)
    categoryId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'  // ID Musique par défaut
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Ajout manuel des heures pour le format LocalDateTime Java
      const payload = {
        ...form,
        startDate: form.startDate.includes('T') ? form.startDate : `${form.startDate}T20:00:00`,
        endDate: form.endDate.includes('T') ? form.endDate : `${form.endDate}T23:00:00`,
        creatorId: 'b95257b7-6f15-4f0d-94ad-835376ae806d' // ID Admin temporaire ou récupéré du contexte
      };
      
      await AdminService.createEvent(payload);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erreur création", error);
      alert("Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <Text style={styles.title}>Créer un événement</Text>
        <ScrollView style={styles.form}>
          <Input label="Nom" value={form.name} onChangeText={t => setForm({...form, name: t})} placeholder="Concert..." />
          <Input label="Description" value={form.description} onChangeText={t => setForm({...form, description: t})} multiline />
          <Input label="Lieu" value={form.location} onChangeText={t => setForm({...form, location: t})} />
          <Input label="Date (YYYY-MM-DD)" value={form.startDate} onChangeText={t => setForm({...form, startDate: t})} />
          <Input label="Date Fin (YYYY-MM-DD)" value={form.endDate} onChangeText={t => setForm({...form, endDate: t})} />
          <Input label="Image URL" value={form.imageUrl} onChangeText={t => setForm({...form, imageUrl: t})} />
          
          <Button title={loading ? "Création..." : "Valider"} onPress={handleSubmit} disabled={loading} style={{ marginTop: 20 }} />
          <Button title="Annuler" onPress={onClose} variant="outline" style={{ marginTop: 10 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff', marginTop: 50 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  form: { flex: 1 }
});