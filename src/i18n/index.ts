import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation resources
import enTranslations from './locales/en.json';
import frTranslations from './locales/fr.json';
import esTranslations from './locales/es.json';

export const defaultNS = 'common';

export const resources = {
  en: {
    common: enTranslations,
  },
  fr: {
    common: frTranslations,
  },
  es: {
    common: esTranslations,
  },
} as const;

i18n
  .use(initReactI18next)
  .init({
    lng: 'en', // default language
    fallbackLng: 'en',
    defaultNS,
    ns: ['common'],
    
    resources,
    
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    
    react: {
      useSuspense: false,
    },
  });

export default i18n;