import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CustomModal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { Event } from '../types';

interface SellTicketModalProps {
  visible: boolean;
  events: Event[];
  onSell: (ticketData: any) => void;
  onClose: () => void;
}

export function SellTicketModal({ visible, events, onSell, onClose }: SellTicketModalProps) {
  const [eventId, setEventId] = useState('');
  const [section, setSection] = useState('');
  const [row, setRow] = useState('');
  const [seat, setSeat] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setEventId('');
    setSection('');
    setRow('');
    setSeat('');
    setOriginalPrice('');
    setPrice('');
    setDescription('');
  };

  const handleSell = async () => {
    if (!eventId || !section || !row || !seat || !originalPrice || !price) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    const originalPriceNum = parseFloat(originalPrice);
    const priceNum = parseFloat(price);

    if (isNaN(originalPriceNum) || isNaN(priceNum) || originalPriceNum <= 0 || priceNum <= 0) {
      Alert.alert('Error', 'Please enter valid prices');
      return;
    }

    if (priceNum > originalPriceNum * 1.5) {
      Alert.alert('Error', 'The sale price cannot exceed 150% of the original price');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const ticketData = {
        eventId,
        section,
        row,
        seat,
        originalPrice: originalPriceNum,
        price: priceNum,
        description: description.trim() || undefined,
      };

      onSell(ticketData);
      resetForm();
      setIsLoading(false);
      Alert.alert('Succès', 'Votre billet a été mis en vente !');
    }, 1000);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      title="Sell a ticket"
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <Card style={styles.infoCard}>
            <CardContent>
              <Text style={styles.infoText}>
                📝 Remplissez les informations de votre billet pour le mettre en vente
              </Text>
            </CardContent>
          </Card>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Event *</Text>
            <TouchableOpacity 
              style={styles.pickerButton}
              onPress={() => {
                if (events.length > 0) {
                  Alert.alert(
                    'Select an event',
                    'Choose an event',
                    events.map(event => ({
                      text: `${event.title} - ${new Date(event.date).toLocaleDateString('en-US')}`,
                      onPress: () => setEventId(event.id)
                    })).concat([{ text: 'Cancel', onPress: () => {} }])
                  );
                }
              }}
            >
              <Text style={[styles.pickerButtonText, !eventId && styles.placeholderText]}>
                {eventId ? events.find(e => e.id === eventId)?.title : 'Select an event'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Section *</Text>
              <Input
                placeholder="VIP, Standard, Tribune..."
                value={section}
                onChangeText={setSection}
              />
            </View>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Rang *</Text>
              <Input
                placeholder="A, B, C..."
                value={row}
                onChangeText={setRow}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Siège *</Text>
            <Input
              placeholder="Numéro de siège"
              value={seat}
              onChangeText={setSeat}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Original price *</Text>
              <Input
                placeholder="0"
                value={originalPrice}
                onChangeText={setOriginalPrice}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Sale price *</Text>
              <Input
                placeholder="0"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
            </View>
          </View>

          {price && originalPrice && (
            <View style={styles.priceHelper}>
              {parseFloat(price) < parseFloat(originalPrice) && (
                <Text style={styles.savingsText}>
                  💰 Buyers will save {parseFloat(originalPrice) - parseFloat(price)}€
                </Text>
              )}
              {parseFloat(price) > parseFloat(originalPrice) && (
                <Text style={styles.warningText}>
                  ⚠️ Price higher than original (+{parseFloat(price) - parseFloat(originalPrice)}€)
                </Text>
              )}
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description (optional)</Text>
            <Input
              placeholder="Informations supplémentaires sur le billet..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              style={styles.textArea}
            />
          </View>

          <View style={styles.actions}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={handleClose}
              style={styles.cancelButton}
              disabled={isLoading}
            />
            <Button
              title={isLoading ? "Publishing..." : "Put on sale"}
              onPress={handleSell}
              style={styles.sellButton}
              disabled={isLoading}
            />
          </View>
        </View>
      </ScrollView>
    </CustomModal>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 20,
  },
  infoCard: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#0ea5e9',
  },
  infoText: {
    fontSize: 14,
    color: '#0369a1',
    lineHeight: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  pickerButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#111827',
  },
  placeholderText: {
    color: '#6b7280',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  priceHelper: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  savingsText: {
    fontSize: 14,
    color: '#059669',
    lineHeight: 20,
  },
  warningText: {
    fontSize: 14,
    color: '#dc2626',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  cancelButton: {
    flex: 1,
  },
  sellButton: {
    flex: 1,
  },
});