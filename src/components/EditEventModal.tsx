import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { AdminService } from '../services/AdminService';
import { EventService } from '../services/EventService';
import { Event, EventCategory } from '../types';

interface EditEventModalProps {
  visible: boolean;
  event: Event | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditEventModal({ visible, event, onClose, onSuccess }: EditEventModalProps) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    location: '',
    fullAddress: '',
    startDate: '',
    endDate: '',
    imageUrl: '',
    eventTypeId: '',
    categoryId: ''
  });
  
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Charger les catégories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await EventService.getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Erreur chargement catégories", error);
      } finally {
        setLoadingCategories(false);
      }
    };
    if (visible) loadCategories();
  }, [visible]);

  // Pré-remplir le formulaire quand l'événement change
  useEffect(() => {
    if (event) {
      // On extrait la date "YYYY-MM-DD" de la chaîne ISO complète pour l'affichage
      const formatDate = (dateStr: string) => dateStr ? dateStr.split('T')[0] : '';

      // Pour retrouver l'ID de la catégorie, on doit parfois chercher dans la liste
      // car l'objet Event contient souvent categoryLabel mais pas l'ID direct.
      // Idéalement, le backend devrait renvoyer categoryId dans l'objet Event.
      // Si ce n'est pas le cas, on devra se baser sur le label ou adapter le backend.
      // Ici, on suppose que l'objet Event contient un champ categoryId (à ajouter au type si manquant)
      // ou on fait une recherche inverse sur le label.
      
      setForm({
        name: event.name,
        description: event.description,
        location: event.location,
        fullAddress: event.fullAddress || '',
        startDate: formatDate(event.startDate),
        endDate: formatDate(event.endDate),
        imageUrl: event.imageUrl || '',
        eventTypeId: '11111111-1111-1111-1111-111111111111', // Placeholder
        // @ts-ignore : Si categoryId n'est pas dans le type Event, on utilisera le label pour trouver l'id
        categoryId: (event as any).categoryId || '' 
      });
    }
  }, [event]);

  // Recherche inverse de l'ID catégorie si manquant dans l'event (fallback)
  useEffect(() => {
    if (event && categories.length > 0 && !form.categoryId && event.categoryLabel) {
      const found = categories.find(c => c.label === event.categoryLabel);
      if (found) setForm(prev => ({ ...prev, categoryId: found.categoryId }));
    }
  }, [event, categories]);

  const handleSubmit = async () => {
    if (!event) return;
    setLoading(true);
    try {
      const payload = {
        ...form,
        // Reconstruire le format ISO pour le backend
        startDate: form.startDate.includes('T') ? form.startDate : `${form.startDate}T00:00:00`,
        endDate: form.endDate.includes('T') ? form.endDate : `${form.endDate}T23:59:59`,
      };
      
      // Appel au service de mise à jour
      // @ts-ignore
      await AdminService.updateEvent(event.id, payload);
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erreur modification", error);
      alert("Erreur lors de la modification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <Text style={styles.title}>Modifier l'événement</Text>
        
        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          <Input label="Nom" value={form.name} onChangeText={t => setForm({...form, name: t})} />
          <Input label="Description" value={form.description} onChangeText={t => setForm({...form, description: t})} multiline />
          <Input label="Lieu" value={form.location} onChangeText={t => setForm({...form, location: t})} />
          <Input label="Adresse complète" value={form.fullAddress} onChangeText={t => setForm({...form, fullAddress: t})} />
          
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Input label="Date Début" value={form.startDate} onChangeText={t => setForm({...form, startDate: t})} placeholder="YYYY-MM-DD" />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Input label="Date Fin" value={form.endDate} onChangeText={t => setForm({...form, endDate: t})} placeholder="YYYY-MM-DD" />
            </View>
          </View>

          <Input label="Image URL" value={form.imageUrl} onChangeText={t => setForm({...form, imageUrl: t})} />
          
          <Text style={styles.label}>Catégorie</Text>
          {loadingCategories ? (
            <ActivityIndicator />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat.categoryId}
                  style={[
                    styles.categoryChip,
                    form.categoryId === cat.categoryId && styles.categoryChipActive
                  ]}
                  onPress={() => setForm({...form, categoryId: cat.categoryId})}
                >
                  <Text style={[
                    styles.categoryText,
                    form.categoryId === cat.categoryId && styles.categoryTextActive
                  ]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <Button title={loading ? "Modification..." : "Enregistrer"} onPress={handleSubmit} disabled={loading} style={{ marginTop: 20 }} />
          <Button title="Annuler" onPress={onClose} variant="outline" style={{ marginTop: 10, marginBottom: 30 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff', paddingTop: 60 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#111827' },
  form: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8, marginTop: 8 },
  categoriesContainer: { flexDirection: 'row', marginBottom: 16, height: 50 },
  categoryChip: {
    paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#f3f4f6',
    borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#e5e7eb',
    height: 40, justifyContent: 'center'
  },
  categoryChipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  categoryText: { fontSize: 14, color: '#374151' },
  categoryTextActive: { color: '#ffffff', fontWeight: '600' }
});