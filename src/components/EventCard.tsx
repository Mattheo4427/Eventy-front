import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Event } from '../types';

interface EventCardProps {
  event: Event;
  onViewEvent: (eventId: string) => void;
  
}

export const EventCard: React.FC<EventCardProps> = ({ event, onViewEvent }) => {
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date inconnue';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => onViewEvent(event.id)}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: event.imageUrl || 'https://via.placeholder.com/400x200?text=Eventy' }} 
        style={styles.image}
        resizeMode="cover"
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>{event.name}</Text>
          {event.status !== 'active' && (
            <View style={[styles.badge, event.status === 'canceled' ? styles.badgeRed : styles.badgeOrange]}>
              <Text style={styles.badgeText}>{event.status}</Text>
            </View>
          )}
        </View>

        {event.categoryLabel && (
          <Text style={styles.category}>{event.categoryLabel}</Text>
        )}

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color="#6b7280" />
          <Text style={styles.infoText}>{formatDate(event.startDate)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color="#6b7280" />
          <Text style={styles.infoText} numberOfLines={1}>{event.location}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 150,
    backgroundColor: '#e5e7eb',
  },
  content: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  category: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  infoText: {
    marginLeft: 6,
    color: '#4b5563',
    fontSize: 14,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeRed: { backgroundColor: '#fee2e2' },
  badgeOrange: { backgroundColor: '#ffedd5' },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: '#374151' }
});