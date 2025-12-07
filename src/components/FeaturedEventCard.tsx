import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Event } from '../types';

interface FeaturedEventCardProps {
  event: Event;
  onViewEvent: (eventId: string) => void;
}

export const FeaturedEventCard: React.FC<FeaturedEventCardProps> = ({ event, onViewEvent }) => {
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [event.imageUrl]);

  return (
    <TouchableOpacity 
      style={styles.eventCard}
      onPress={() => onViewEvent(event.id)}
      activeOpacity={0.8}
    >
      {/* Image Container */}
      <View style={styles.imageContainer}>
        {(imageError || !event.imageUrl) ? (
          <View style={[styles.eventImage, styles.placeholderContainer]}>
            <Ionicons name="image-outline" size={32} color="#9ca3af" />
            <Text style={styles.placeholderText}>Eventy</Text>
          </View>
        ) : (
          <Image 
            source={{ uri: event.imageUrl }} 
            style={styles.eventImage}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        )}
      </View>

      <View style={styles.eventContent}>
        <Text style={styles.eventTitle} numberOfLines={2}>
          {event.name}
        </Text>
        
        <View style={styles.metaContainer}>
          <Ionicons name="calendar-outline" size={14} color="#6b7280" />
          <Text style={styles.eventDetails}>
            {' '}{new Date(event.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
          </Text>
          <Text style={styles.bullet}>•</Text>
          <Ionicons name="location-outline" size={14} color="#6b7280" />
          <Text style={styles.eventDetails} numberOfLines={1}>
             {' '}{event.location}
          </Text>
        </View>

        <Text style={styles.eventLink}>
          {t('viewTickets', { ns: 'home', defaultValue: 'Voir les billets' })} 
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  eventCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginRight: 16,
    width: 260,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    overflow: 'hidden', // Important for border radius
  },
  imageContainer: {
    height: 150,
    width: '100%',
    backgroundColor: '#e5e7eb',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  placeholderText: {
    marginTop: 8,
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  eventContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 22,
    height: 44,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventDetails: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
    maxWidth: 90,
  },
  bullet: {
    marginHorizontal: 6,
    color: '#9ca3af',
  },
  eventLink: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '700',
  },
});
