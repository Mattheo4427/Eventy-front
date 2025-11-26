import React, { useState } from 'react';
import { StripeProvider } from '@stripe/stripe-react-native'; // <--- Import
import { View, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppContent from './AppContent';
import { AuthProvider } from './src/contexts/AuthContext';
import { LanguageProvider } from './src/contexts/LanguageContext';
import './global.css';

export default function App() {
  return (
    <StripeProvider
      publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''}
      merchantIdentifier="merchant.com.eventy" // Optionnel (pour Apple Pay)
    >
      <AuthProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </AuthProvider>
    </StripeProvider>
  );
}