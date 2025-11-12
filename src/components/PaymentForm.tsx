import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';

interface PaymentFormProps {
  amount: number; // Amount in cents
  currency?: string; // 'usd' or 'eur'
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
  disabled?: boolean;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  currency = 'eur',
  onPaymentSuccess,
  onPaymentError,
  disabled = false,
}) => {
  const { confirmPayment } = useStripe();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);

  const formatAmount = (cents: number): string => {
    const symbol = currency === 'eur' ? '€' : '$';
    return `${(cents / 100).toFixed(2)}${symbol}`;
  };

  const handlePayment = async () => {
    if (!cardComplete || isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Create payment intent on your backend
      // Replace this URL with your actual backend endpoint
      const response = await fetch('YOUR_BACKEND_URL/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add your auth token here
          // 'Authorization': `Bearer ${yourAuthToken}`,
        },
        body: JSON.stringify({
          amount,
          currency,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret, paymentIntentId } = await response.json();

      if (!clientSecret) {
        throw new Error('Invalid payment intent response');
      }

      // Step 2: Confirm payment with Stripe
      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
      });

      if (error) {
        onPaymentError(error.message || 'Payment failed');
      } else if (paymentIntent) {
        onPaymentSuccess(paymentIntent.id);
      }
    } catch (error) {
      onPaymentError(
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Amount Card */}
      <Card style={styles.amountCard}>
        <CardContent>
          <View style={styles.amountHeader}>
            <Ionicons name="card-outline" size={24} color="#059669" />
            <Text style={styles.amountLabel}>Amount to pay</Text>
          </View>
          <Text style={styles.amountValue}>{formatAmount(amount)}</Text>
        </CardContent>
      </Card>

      {/* Card Details Card */}
      <Card>
        <CardContent>
          <Text style={styles.cardLabel}>Card details</Text>
          <Text style={styles.cardSubtext}>
            Enter your card information securely
          </Text>

          <CardField
            postalCodeEnabled={true}
            placeholders={{
              number: '4242 4242 4242 4242',
            }}
            cardStyle={{
              backgroundColor: '#FFFFFF',
              textColor: '#000000',
              borderColor: '#e5e7eb',
              borderWidth: 1,
              borderRadius: 8,
            }}
            style={styles.cardField}
            onCardChange={(cardDetails) => {
              setCardComplete(cardDetails.complete);
            }}
            disabled={disabled || isProcessing}
          />

          {/* Secure Payment Info */}
          <View style={styles.secureInfo}>
            <Ionicons name="shield-checkmark" size={16} color="#6b7280" />
            <Text style={styles.secureText}>
              Secure payment powered by Stripe
            </Text>
          </View>
        </CardContent>
      </Card>

      {/* Pay Button */}
      <Button
        title={isProcessing ? 'Processing...' : `Pay ${formatAmount(amount)}`}
        onPress={handlePayment}
        disabled={!cardComplete || isProcessing || disabled}
        size="lg"
      />

      {isProcessing && (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="small" color="#059669" />
          <Text style={styles.processingText}>Processing your payment...</Text>
        </View>
      )}

      {/* Test Card Info (Remove in production) */}
      <Card style={styles.testCard}>
        <CardContent>
          <Text style={styles.testTitle}>Test Card</Text>
          <Text style={styles.testText}>
            Use card number: 4242 4242 4242 4242{'\n'}
            Any future date, any CVC, any postal code
          </Text>
        </CardContent>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  amountCard: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
    borderWidth: 1,
  },
  amountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  amountValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#059669',
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  cardSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  cardField: {
    width: '100%',
    height: 50,
    marginVertical: 12,
  },
  secureInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  secureText: {
    fontSize: 12,
    color: '#6b7280',
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  processingText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  testCard: {
    backgroundColor: '#fef3c7',
    borderColor: '#fcd34d',
    borderWidth: 1,
  },
  testTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 4,
  },
  testText: {
    fontSize: 12,
    color: '#92400e',
    lineHeight: 18,
  },
});