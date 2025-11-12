import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CustomModal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface LoginModalProps {
  visible: boolean;
  onClose: () => void;
}

export function LoginModal({ visible, onClose }: LoginModalProps) {
  const { t } = useTranslation();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      await login(username, password);
  Alert.alert(t('login.successMessage'));
      handleClose();
    } catch (error) {
      Alert.alert(t('login.error'), t('login.errorMessage'));
    }
  };

  const handleClose = () => {
    setUsername('');
    setPassword('');
    onClose();
  };

  return (
    <CustomModal
      visible={visible}
      onClose={handleClose}
      title={t('login.title')}
    >
      <View style={styles.form}>
        {/* Info message removed, you can add a custom message if needed */}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('login.username')}</Text>
          <Input
            placeholder={t('login.usernamePlaceholder')}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            editable={true}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('login.password')}</Text>
          <Input
            placeholder={t('login.passwordPlaceholder')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={true}
          />
        </View>

        <View style={styles.actions}>
          <Button
            title={t('login.loginButton')}
            onPress={handleLogin}
            style={[styles.closeButton, { justifyContent: 'center', alignItems: 'center' }]}
            textStyle={{ textAlign: 'center', width: '100%' }}
          />
          <Button
            title={t('common.close')}
            variant="outline"
            onPress={handleClose}
            style={styles.closeButton}
          />
        </View>
      </View>
    </CustomModal>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  infoContainer: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0ea5e9',
  },
  infoText: {
    fontSize: 14,
    color: '#0369a1',
    lineHeight: 20,
  },
  actions: {
    marginTop: 12,
  },
  closeButton: {
    width: '100%',
  },
});
