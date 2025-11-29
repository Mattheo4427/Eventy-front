import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ModalProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface CustomModalProps extends Partial<ModalProps> {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  contentStyle?: any;
}

export function CustomModal({ visible, onClose, title, children, contentStyle, ...props }: CustomModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
      {...props}
    >
      <SafeAreaView style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <View style={[styles.content, contentStyle]}>
            {children}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    overflow: 'hidden', // Prevent content from spilling out
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    flexShrink: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
    // flex: 1 removed to prevent collapse when parent has no fixed height
  },
});