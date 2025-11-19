import { useTranslation } from 'react-i18next';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CustomModal } from './ui/Modal';
import { Button } from './ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

interface LoginModalProps {
  visible: boolean;
  onClose: () => void;
}

export function LoginModal({ visible, onClose }: LoginModalProps) {
    const { t } = useTranslation();
  const { login } = useAuth(); // Récupère la fonction de connexion

  const handleLogin = () => {
    // Appelle la fonction de connexion du contexte
    // qui va ouvrir la page Keycloak
    login();
    onClose(); // Ferme la modale
  };

  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      title={t('title', { ns: 'login' })}
    >
      <View style={styles.content}>
        <View style={styles.infoContainer}>
          <Ionicons name="shield-checkmark-outline" size={24} color="#059669" />
          <Text style={styles.infoText}>
            {t('redirectInfo', { ns: 'login' })}
          </Text>
        </View>

        <Button
          title={t('continue', { ns: 'login' })}
          onPress={handleLogin}
          style={styles.loginButton}
        />

        <Button
          title={t('cancel', { ns: 'common' })}
          variant="outline"
          onPress={onClose}
        />
      </View>
    </CustomModal>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 20,
  },
  infoContainer: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#065f46',
    lineHeight: 20,
  },
  loginButton: {
    marginTop: 8,
  },
});