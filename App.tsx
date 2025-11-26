import React from 'react';
import { AuthProvider } from './src/contexts/AuthContext';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { StripeProvider } from '@stripe/stripe-react-native';
import AppContent from './AppContent';
import './src/i18n';

export default function App() {
  return (
    <StripeProvider publishableKey="pk_test_51SWvtlAtRHkUiEbBKTLFYjQPiqZP9SGSIKMmdDrsint3XzB1ttdGJniJY7NSUHrMTC5SrCO0R6bF60d710iHFt1l00QQs6Ny5m">
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </StripeProvider>
  );
}