import React from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import { LanguageProvider } from './src/contexts/LanguageContext';
import AppContent from './AppContent';
import './src/i18n';

export default function App() {
  return (
    <StripeProvider
      publishableKey="pk_test_YOUR_PUBLISHABLE_KEY">
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </StripeProvider>
  );
}