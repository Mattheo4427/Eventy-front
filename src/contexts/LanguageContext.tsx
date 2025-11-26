import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
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
  // On initialise le state avec la langue actuelle de l'instance i18n
  const [currentLanguage, setCurrentLanguage] = useState<Language>(i18n.language as Language || 'en');
  const [isLoading, setIsLoading] = useState(true);
  
  // Plus besoin de const { i18n } = useTranslation(); ici

  // Load saved language preference on app start
  useEffect(() => {
    const loadSavedLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('appLanguage');
        if (savedLanguage && ['en', 'fr', 'es'].includes(savedLanguage)) {
          const language = savedLanguage as Language;
          
          // Si la langue sauvegardée est différente de la langue par défaut
          if (language !== i18n.language) {
              await i18n.changeLanguage(language);
          }
          setCurrentLanguage(language);
        }
      } catch (error) {
        console.warn('Error loading saved language:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedLanguage();
  }, []); // Dépendance vide, on ne veut le lancer qu'une fois

  const changeLanguage = async (language: Language) => {
    try {
      await i18n.changeLanguage(language); // Utilisation de l'instance importée
      setCurrentLanguage(language);
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