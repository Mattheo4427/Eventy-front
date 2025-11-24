import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { AdminService } from '../services/AdminService';
import { EventService } from '../services/EventService';
import { EventCategory } from '../types';

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
    fullAddress: '', // Nouveau champ
    startDate: '',
    endDate: '',
    imageUrl: '',
    eventTypeId: '11111111-1111-1111-1111-111111111111', // ID Concert par défaut (à rendre dynamique si besoin)
    categoryId: '' // Sera rempli par la sélection
  });
  
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Charger les catégories au montage
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await EventService.getCategories();
        setCategories(data);
        // Sélectionner la première catégorie par défaut si disponible
        if (data.length > 0) {
          setForm(prev => ({ ...prev, categoryId: data[0].categoryId }));
        }
      } catch (error) {
        console.error("Erreur chargement catégories", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    if (visible) {
      loadCategories();
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (!form.categoryId) {
      alert("Veuillez sélectionner une catégorie");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        startDate: form.startDate.includes('T') ? form.startDate : `${form.startDate}T20:00:00`,
        endDate: form.endDate.includes('T') ? form.endDate : `${form.endDate}T23:00:00`,
        creatorId: 'b95257b7-6f15-4f0d-94ad-835376ae806d' // À remplacer par l'ID de l'admin connecté via AuthContext
      };
      
      await AdminService.createEvent(payload);
      onSuccess();
      setForm({ // Reset form
        name: '', description: '', location: '', fullAddress: '',
        startDate: '', endDate: '', imageUrl: '',
        eventTypeId: '11111111-1111-1111-1111-111111111111', categoryId: ''
      });
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
        
        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          <Input label="Nom" value={form.name} onChangeText={t => setForm({...form, name: t})} placeholder="Concert..." />
          <Input label="Description" value={form.description} onChangeText={t => setForm({...form, description: t})} multiline />
          <Input label="Lieu (Ville)" value={form.location} onChangeText={t => setForm({...form, location: t})} />
          <Input label="Adresse complète" value={form.fullAddress} onChangeText={t => setForm({...form, fullAddress: t})} placeholder="123 Rue de la Paix..." />
          
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Input label="Date Début (YYYY-MM-DD)" value={form.startDate} onChangeText={t => setForm({...form, startDate: t})} />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Input label="Date Fin (YYYY-MM-DD)" value={form.endDate} onChangeText={t => setForm({...form, endDate: t})} />
            </View>
          </View>

          <Input label="Image URL" value={form.imageUrl} onChangeText={t => setForm({...form, imageUrl: t})} />
          
          {/* Sélection des catégories */}
          <Text style={styles.label}>Catégorie</Text>
          {loadingCategories ? (
            <ActivityIndicator size="small" color="#2563eb" />
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

          <Button title={loading ? "Création..." : "Valider"} onPress={handleSubmit} disabled={loading} style={{ marginTop: 20 }} />
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