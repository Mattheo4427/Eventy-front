import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Ionicons } from '@expo/vector-icons';

interface DatePickerProps {
  label?: string;
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
}

export function DatePicker({ label, value, onChange }: DatePickerProps) {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    onChange(`${year}-${month}-${day}`);
    hideDatePicker();
  };

  const getDateObject = () => {
    if (!value) return new Date();
    const [y, m, d] = value.split('-').map(Number);
    // Note: Month is 0-indexed in Date constructor
    return new Date(y, m - 1, d);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity onPress={showDatePicker} style={styles.input}>
        {/* Dummy View pour équilibrer l'icône et centrer le texte parfaitement */}
        <View style={{ width: 20 }} />
        
        <Text style={[styles.inputText, !value && styles.placeholder]} numberOfLines={1}>
          {value || 'Sélectionner'}
        </Text>
        
        <Ionicons name="calendar-outline" size={20} color="#6b7280" />
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        date={getDateObject()}
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        locale="fr-FR"
        display={Platform.OS === 'ios' ? 'inline' : 'default'}
        themeVariant="light"
        pickerContainerStyleIOS={{
          backgroundColor: "white",
          borderRadius: 12,
        }}
        textColor="black"
        confirmTextIOS="Valider"
        cancelTextIOS="Annuler"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: { marginBottom: 6, fontSize: 14, color: '#111827' },
  input: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#d1d5db',
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, minHeight: 44
  },
  inputText: { fontSize: 14, color: '#111827', textAlign: 'center', flex: 1 },
  placeholder: { color: '#6b7280' },
});
