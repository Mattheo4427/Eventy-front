import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation resources
import login_en from './locales/en/login.json';
import navigation_en from './locales/en/navigation.json';
import events_en from './locales/en/events.json';
import eventDetail_en from './locales/en/eventDetail.json';
import buyTicket_en from './locales/en/buyTicket.json';
import sellTicket_en from './locales/en/sellTicket.json';
import userProfile_en from './locales/en/userProfile.json';
import messaging_en from './locales/en/messaging.json';
import notifications_en from './locales/en/notifications.json';
import favorites_en from './locales/en/favorites.json';
import home_en from './locales/en/home.json';
import common_en from './locales/en/common.json';

import login_fr from './locales/fr/login.json';
import navigation_fr from './locales/fr/navigation.json';
import events_fr from './locales/fr/events.json';
import eventDetail_fr from './locales/fr/eventDetail.json';
import buyTicket_fr from './locales/fr/buyTicket.json';
import sellTicket_fr from './locales/fr/sellTicket.json';
import userProfile_fr from './locales/fr/userProfile.json';
import messaging_fr from './locales/fr/messaging.json';
import notifications_fr from './locales/fr/notifications.json';
import favorites_fr from './locales/fr/favorites.json';
import home_fr from './locales/fr/home.json';
import common_fr from './locales/fr/common.json';

import login_es from './locales/es/login.json';
import navigation_es from './locales/es/navigation.json';
import events_es from './locales/es/events.json';
import eventDetail_es from './locales/es/eventDetail.json';
import buyTicket_es from './locales/es/buyTicket.json';
import sellTicket_es from './locales/es/sellTicket.json';
import userProfile_es from './locales/es/userProfile.json';
import messaging_es from './locales/es/messaging.json';
import notifications_es from './locales/es/notifications.json';
import favorites_es from './locales/es/favorites.json';
import home_es from './locales/es/home.json';
import common_es from './locales/es/common.json';


export const defaultNS = 'common';

export const resources = {
  en: {
    login: login_en,
    navigation: navigation_en,
    events: events_en,
    eventDetail: eventDetail_en,
    buyTicket: buyTicket_en,
    sellTicket: sellTicket_en,
    userProfile: userProfile_en,
    messaging: messaging_en,
    notifications: notifications_en,
    favorites: favorites_en,
    home: home_en,
    common: common_en,
  },
  fr: {
    login: login_fr,
    navigation: navigation_fr,
    events: events_fr,
    eventDetail: eventDetail_fr,
    buyTicket: buyTicket_fr,
    sellTicket: sellTicket_fr,
    userProfile: userProfile_fr,
    messaging: messaging_fr,
    notifications: notifications_fr,
    favorites: favorites_fr,
    home: home_fr,
    common: common_fr,
  },
  es: {
    login: login_es,
    navigation: navigation_es,
    events: events_es,
    eventDetail: eventDetail_es,
    buyTicket: buyTicket_es,
    sellTicket: sellTicket_es,
    userProfile: userProfile_es,
    messaging: messaging_es,
    notifications: notifications_es,
    favorites: favorites_es,
    home: home_es,
    common: common_es,
  },
} as const;

i18n
  .use(initReactI18next)
  .init({
    lng: 'en', // default language
    fallbackLng: 'en',
    defaultNS,
    ns: [
      'login',
      'navigation',
      'events',
      'eventDetail',
      'buyTicket',
      'sellTicket',
      'userProfile',
      'messaging',
      'notifications',
      'favorites',
      'home',
      'common',
    ],
    
    resources,
    
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    
    react: {
      useSuspense: false,
    },
  });

export default i18n;