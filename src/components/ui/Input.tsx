import React from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet, TextStyle, ViewStyle } from 'react-native';

interface InputProps extends TextInputProps {
  variant?: 'default' | 'outline';
  label?: string;
  containerStyle?: ViewStyle | ViewStyle[];
  labelStyle?: TextStyle | TextStyle[];
}

export function Input({ variant = 'default', style, label, containerStyle, labelStyle, ...props }: InputProps) {
  const getInputStyle = (): TextStyle[] => {
    const baseStyle: TextStyle[] = [styles.input];
    
    switch (variant) {
      case 'default':
        baseStyle.push(styles.default);
        break;
      case 'outline':
        baseStyle.push(styles.outline);
        break;
    }

    return baseStyle;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={[styles.label, labelStyle]}>{label}</Text> : null}
      <TextInput
        style={[getInputStyle(), style]}
        placeholderTextColor="#6b7280"
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    marginBottom: 6,
    fontSize: 14,
    color: '#111827'
  },
  input: {
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderRadius: 8,
    color: '#111827', // Force text color for Dark Mode
  },
  default: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  outline: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
});