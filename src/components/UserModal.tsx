import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { AdminService } from '../services/AdminService';
import { User } from '../types';

interface UserModalProps {
  visible: boolean;
  userToEdit?: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function UserModal({ visible, userToEdit, onClose, onSuccess }: UserModalProps) {
  const [form, setForm] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    role: 'USER' as 'USER' | 'ADMIN'
  });
  const [loading, setLoading] = useState(false);

  // Reset ou Pré-remplissage
 useEffect(() => {
    if (userToEdit) {
      // SÉCURISATION : Vérifier que les champs existent avant de faire split()
      const nameStr = userToEdit.username || ''; // Fallback chaîne vide
      const emailStr = userToEdit.email || ''; // Fallback chaîne vide
      
      const firstName = userToEdit.firstName || '';
      const lastName = userToEdit.lastName || '';
      
      setForm({
        // Utilisation de l'opérateur optionnel et valeurs par défaut
        username: nameStr,
        email: emailStr,
        firstName: firstName,
        lastName: lastName,
        password: '', 
        role: userToEdit.role || 'USER' // Fallback rôle
      });
    } else {
      setForm({ username: '', email: '', firstName: '', lastName: '', password: '', role: 'USER' });
    }
  }, [userToEdit, visible]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (userToEdit) {
        // Mode Édition (Attention: nécessite l'endpoint backend)
        await AdminService.updateUser(userToEdit.id, form);
      } else {
        // Mode Création
        await AdminService.createUser(form);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erreur user", error);
      alert("Une erreur est survenue. Vérifiez les données.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <Text style={styles.title}>
          {userToEdit ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
        </Text>
        
        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          <Input label="Email" value={form.email} onChangeText={t => setForm({...form, email: t})} autoCapitalize="none" keyboardType="email-address" />
          <Input label="Nom d'utilisateur (Username)" value={form.username} onChangeText={t => setForm({...form, username: t})} autoCapitalize="none" />
          
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Input label="Prénom" value={form.firstName} onChangeText={t => setForm({...form, firstName: t})} />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Input label="Nom" value={form.lastName} onChangeText={t => setForm({...form, lastName: t})} />
            </View>
          </View>

          {/* Mot de passe obligatoire seulement en création */}
          {!userToEdit && (
            <Input label="Mot de passe" value={form.password} onChangeText={t => setForm({...form, password: t})} secureTextEntry />
          )}

          <Text style={styles.label}>Rôle</Text>
          <View style={styles.roleContainer}>
            {(['USER', 'ADMIN'] as const).map((role) => (
              <TouchableOpacity
                key={role}
                style={[styles.roleChip, form.role === role && styles.roleChipActive]}
                onPress={() => setForm({...form, role})}
              >
                <Text style={[styles.roleText, form.role === role && styles.roleTextActive]}>
                  {role}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button title={loading ? "Sauvegarde..." : "Enregistrer"} onPress={handleSubmit} disabled={loading} style={{ marginTop: 20 }} />
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
  roleContainer: { flexDirection: 'row', marginBottom: 16 },
  roleChip: {
    paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#f3f4f6',
    borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#e5e7eb'
  },
  roleChipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  roleText: { color: '#374151', fontWeight: '500' },
  roleTextActive: { color: '#ffffff' }
});