import React from 'react';
import { TextInput, TextInputProps, StyleSheet, TextStyle } from 'react-native';

interface InputProps extends TextInputProps {
  variant?: 'default' | 'outline';
}

export function Input({ variant = 'default', style, ...props }: InputProps) {
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
    <TextInput
      style={[getInputStyle(), style]}
      placeholderTextColor="#6b7280"
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderRadius: 8,
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