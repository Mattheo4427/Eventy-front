import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity, ActivityIndicator, Platform, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { DatePicker } from './ui/DatePicker';
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
    fullAddress: '',
    startDate: '',
    endDate: '',
    imageUrl: '',
    eventTypeId: '11111111-1111-1111-1111-111111111111',
    categoryId: ''
  });
  
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await EventService.getCategories();
        setCategories(data);
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
        creatorId: 'b95257b7-6f15-4f0d-94ad-835376ae806d'
      };
      
      await AdminService.createEvent(payload);
      onSuccess();
      setForm({
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Nouvel Événement</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
        </View>
        
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
          <ScrollView style={styles.form} contentContainerStyle={{paddingBottom: 100}} showsVerticalScrollIndicator={false}>
            <Input label="Nom de l'événement" value={form.name} onChangeText={t => setForm({...form, name: t})} placeholder="Ex: Concert de Jazz..." />
            
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <DatePicker label="Date Début" value={form.startDate} onChange={d => setForm({...form, startDate: d})} />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <DatePicker label="Date Fin" value={form.endDate} onChange={d => setForm({...form, endDate: d})} />
              </View>
            </View>

            <Input label="Lieu (Ville)" value={form.location} onChangeText={t => setForm({...form, location: t})} placeholder="Ex: Paris" />
            <Input label="Adresse complète" value={form.fullAddress} onChangeText={t => setForm({...form, fullAddress: t})} placeholder="Ex: 123 Avenue des Champs-Élysées" />
            
            <Input label="Description" value={form.description} onChangeText={t => setForm({...form, description: t})} multiline numberOfLines={4} style={{minHeight: 100, textAlignVertical: 'top'}} />
            
            <Input label="Image URL" value={form.imageUrl} onChangeText={t => setForm({...form, imageUrl: t})} placeholder="https://..." />
            
            <Text style={styles.label}>Catégorie</Text>
            {loadingCategories ? (
              <ActivityIndicator size="small" color="#2563eb" style={{alignSelf: 'flex-start', marginVertical: 10}} />
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
          </ScrollView>
        </KeyboardAvoidingView>

        <View style={styles.footer}>
          <Button title={loading ? "Création en cours..." : "Publier l'événement"} onPress={handleSubmit} disabled={loading} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 20, paddingVertical: 16, 
    borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
    backgroundColor: '#fff'
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  closeButton: { padding: 8, backgroundColor: '#f3f4f6', borderRadius: 20 },
  
  form: { flex: 1, padding: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 12, marginTop: 8 },
  
  categoriesContainer: { flexDirection: 'row', marginBottom: 24, height: 44 },
  categoryChip: {
    paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#f9fafb',
    borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#e5e7eb',
    height: 36, justifyContent: 'center'
  },
  categoryChipActive: { backgroundColor: '#eff6ff', borderColor: '#2563eb' },
  categoryText: { fontSize: 13, color: '#4b5563', fontWeight: '500' },
  categoryTextActive: { color: '#2563eb', fontWeight: '600' },

  footer: { 
    padding: 20, borderTopWidth: 1, borderTopColor: '#f3f4f6', 
    backgroundColor: '#fff', paddingBottom: Platform.OS === 'ios' ? 34 : 20 
  }
});