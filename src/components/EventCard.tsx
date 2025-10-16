import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Event, FavoriteEvent } from '../types';
import { Button } from './ui/Button';
import { FavoriteButton } from './FavoritesManager';

interface EventCardProps {
  event: Event;
  onViewEvent: (eventId: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (eventId: string) => void;
  showFavoriteButton?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onViewEvent,
  isFavorite = false,
  onToggleFavorite,
  showFavoriteButton = false
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isEventPassed = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const isPassed = isEventPassed(event.date);

  return (
    <View style={[styles.eventCard, isPassed && styles.eventCardPassed]}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: event.image }} style={styles.eventImage} resizeMode="cover" />
        {showFavoriteButton && onToggleFavorite && (
          <View style={styles.favoriteButtonContainer}>
            <FavoriteButton
              eventId={event.id}
              isFavorite={isFavorite}
              onToggleFavorite={onToggleFavorite}
              size="md"
            />
          </View>
        )}
        {isPassed && (
          <View style={styles.passedOverlay}>
            <Text style={styles.passedText}>Événement passé</Text>
          </View>
        )}
      </View>
      
      <View style={styles.eventInfo}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle} numberOfLines={2}>
            {event.title}
          </Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{event.category}</Text>
          </View>
        </View>
        
        <Text style={styles.eventDate}>
          📅 {formatDate(event.date)}
        </Text>
        
        <Text style={styles.eventLocation}>
          📍 {event.location} - {event.venue}
        </Text>
        
        <Text style={styles.eventDescription} numberOfLines={3}>
          {event.description}
        </Text>
        
        <View style={styles.actionContainer}>
          <Button
            title={isPassed ? "Voir les détails" : "Voir les billets"}
            onPress={() => onViewEvent(event.id)}
            variant={isPassed ? "outline" : "primary"}
            size="sm"
            style={styles.viewButton}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  eventCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  eventCardPassed: {
    opacity: 0.7,
  },
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  eventImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
  },
  favoriteButtonContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  passedOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 8,
    alignItems: 'center',
  },
  passedText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  eventInfo: {
    padding: 20,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  eventTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginRight: 12,
    lineHeight: 28,
  },
  categoryBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e40af',
  },
  eventDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
    marginBottom: 8,
  },
  eventLocation: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  eventDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 16,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewButton: {
    flex: 1,
  },
});