import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage, Language } from '../contexts/LanguageContext';

interface LanguageSelectorProps {
  style?: any;
}

const languageConfig = {
  en: {
    flag: '🇺🇸',
    name: 'English',
    nativeName: 'English'
  },
  fr: {
    flag: '🇫🇷',
    name: 'French',
    nativeName: 'Français'
  },
  es: {
    flag: '🇪🇸',
    name: 'Spanish',
    nativeName: 'Español'
  }
};

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ style }) => {
  const { currentLanguage, changeLanguage } = useLanguage();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleLanguageSelect = async (language: Language) => {
    await changeLanguage(language);
    setIsModalVisible(false);
  };

  return (
    <>
      {/* Language button in header */}
      <TouchableOpacity
        style={[styles.languageButton, style]}
        onPress={() => setIsModalVisible(true)}
        accessibilityLabel="Change language"
      >
        <Text style={styles.flagEmoji}>
          {languageConfig[currentLanguage].flag}
        </Text>
      </TouchableOpacity>

      {/* Language selection modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            onPress={() => setIsModalVisible(false)}
          />
          
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Language</Text>
              <TouchableOpacity 
                onPress={() => setIsModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <View style={styles.languageList}>
              {(Object.keys(languageConfig) as Language[]).map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[
                    styles.languageOption,
                    currentLanguage === lang && styles.selectedLanguage
                  ]}
                  onPress={() => handleLanguageSelect(lang)}
                >
                  <View style={styles.languageInfo}>
                    <Text style={styles.languageFlag}>
                      {languageConfig[lang].flag}
                    </Text>
                    <View style={styles.languageNames}>
                      <Text style={styles.languageName}>
                        {languageConfig[lang].name}
                      </Text>
                      <Text style={styles.languageNativeName}>
                        {languageConfig[lang].nativeName}
                      </Text>
                    </View>
                  </View>
                  {currentLanguage === lang && (
                    <Ionicons name="checkmark" size={24} color="#2563eb" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  languageButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagEmoji: {
    fontSize: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 0,
    minWidth: 300,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  languageList: {
    padding: 12,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginVertical: 2,
  },
  selectedLanguage: {
    backgroundColor: '#eff6ff',
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  languageFlag: {
    fontSize: 28,
    marginRight: 16,
  },
  languageNames: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  languageNativeName: {
    fontSize: 14,
    color: '#6b7280',
  },
});