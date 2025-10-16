import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'en' | 'fr' | 'es';

interface LanguageContextType {
  currentLanguage: Language;
  changeLanguage: (language: Language) => Promise<void>;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);
  const { i18n } = useTranslation();

  // Load saved language preference on app start
  useEffect(() => {
    const loadSavedLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('appLanguage');
        if (savedLanguage && ['en', 'fr', 'es'].includes(savedLanguage)) {
          const language = savedLanguage as Language;
          setCurrentLanguage(language);
          await i18n.changeLanguage(language);
        }
      } catch (error) {
        console.warn('Error loading saved language:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedLanguage();
  }, [i18n]);

  const changeLanguage = async (language: Language) => {
    try {
      setCurrentLanguage(language);
      await i18n.changeLanguage(language);
      await AsyncStorage.setItem('appLanguage', language);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};