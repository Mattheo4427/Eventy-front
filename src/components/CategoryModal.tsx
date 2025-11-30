import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Alert } from 'react-native';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { AdminService } from '../services/AdminService';
import { EventCategory } from '../types';

interface CategoryModalProps {
  visible: boolean;
  categoryToEdit?: EventCategory | null; // Si null = Création, sinon = Édition
  onClose: () => void;
  onSuccess: () => void;
}

export function CategoryModal({ visible, categoryToEdit, onClose, onSuccess }: CategoryModalProps) {
  const [label, setLabel] = useState('');
  const [loading, setLoading] = useState(false);

  // Pré-remplir le champ si on est en mode édition
  useEffect(() => {
    if (categoryToEdit) {
      setLabel(categoryToEdit.label);
    } else {
      setLabel('');
    }
  }, [categoryToEdit, visible]);

  const handleSubmit = async () => {
    if (!label.trim()) {
      Alert.alert("Erreur", "Le nom de la catégorie est obligatoire");
      return;
    }

    setLoading(true);
    try {
      if (categoryToEdit) {
        // Mode Édition
        await AdminService.updateCategory(categoryToEdit.categoryId, label);
      } else {
        // Mode Création
        await AdminService.createCategory(label);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erreur catégorie", error);
      Alert.alert("Erreur", "Une erreur est survenue lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>
            {categoryToEdit ? "Modifier la catégorie" : "Nouvelle catégorie"}
          </Text>
          
          <View style={styles.form}>
            <Input 
              label="Nom de la catégorie" 
              value={label} 
              onChangeText={setLabel} 
              placeholder="Ex: Concert, Sport..." 
            />
            
            <View style={styles.buttons}>
              <Button 
                title={loading ? "Sauvegarde..." : "Enregistrer"} 
                onPress={handleSubmit} 
                disabled={loading} 
                style={styles.saveButton}
              />
              <Button 
                title="Annuler" 
                onPress={onClose} 
                variant="outline" 
                style={styles.cancelButton}
              />
            </View>
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
    justifyContent: 'center',
    padding: 20,
  },
  container: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    color: '#111827',
    textAlign: 'center'
  },
  form: { gap: 16 },
  buttons: { marginTop: 10, gap: 10 },
  saveButton: { backgroundColor: '#2563eb' },
  cancelButton: { borderColor: '#d1d5db' }
});