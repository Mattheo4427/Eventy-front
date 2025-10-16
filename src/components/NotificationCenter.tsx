import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { CustomModal } from './ui/Modal';
import { Button } from './ui/Button';
import { Notification } from '../types';

interface NotificationCenterProps {
  visible: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  visible,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'purchase_confirmation': return '🎫';
      case 'sale_success': return '💰';
      case 'event_reminder': return '⏰';
      case 'message': return '💬';
      case 'system': return 'ℹ️';
      default: return '📢';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'À l\'instant';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    if (diffInHours < 48) return 'Hier';
    return date.toLocaleDateString('fr-FR');
  };

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🔔</Text>
      <Text style={styles.emptyTitle}>Aucune notification</Text>
      <Text style={styles.emptyMessage}>Vous n'avez aucune notification pour le moment.</Text>
    </View>
  );

  return (
    <CustomModal visible={visible} onClose={onClose} title="Notifications">
      <View style={styles.container}>
        {notifications.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <View style={styles.header}>
              <Text style={styles.title}>
                {unreadCount > 0 ? `${unreadCount} non lue(s)` : 'Toutes lues'}
              </Text>
              <Button
                title="Tout marquer comme lu"
                onPress={onMarkAllAsRead}
                variant="outline"
                size="sm"
              />
            </View>

            <ScrollView style={styles.notificationsList}>
              {notifications.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  style={[
                    styles.notificationItem,
                    !notification.read && styles.unreadNotification
                  ]}
                  onPress={() => !notification.read && onMarkAsRead(notification.id)}
                >
                  <View style={styles.notificationContent}>
                    <View style={styles.notificationHeader}>
                      <Text style={styles.notificationIcon}>
                        {getNotificationIcon(notification.type)}
                      </Text>
                      <Text style={styles.notificationTitle}>
                        {notification.title}
                      </Text>
                      <Text style={styles.notificationDate}>
                        {formatDate(notification.date)}
                      </Text>
                    </View>
                    <Text style={styles.notificationMessage}>
                      {notification.message}
                    </Text>
                    {!notification.read && (
                      <View style={styles.unreadIndicator} />
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => onDeleteNotification(notification.id)}
                  >
                    <Text style={styles.deleteButtonText}>×</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}
      </View>
    </CustomModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxHeight: 600,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  notificationsList: {
    flex: 1,
    marginTop: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    position: 'relative',
  },
  unreadNotification: {
    backgroundColor: '#f0f9ff',
    borderColor: '#3b82f6',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  notificationTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
  },
  notificationDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  unreadIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
  deleteButtonText: {
    fontSize: 20,
    color: '#ef4444',
    fontWeight: 'bold',
  },
});