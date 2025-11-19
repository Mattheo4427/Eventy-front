import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CustomModal } from './ui/Modal';
import { Button } from './ui/Button';
import { Event, FavoriteEvent } from '../types';

interface FavoritesManagerProps {
  visible: boolean;
  onClose: () => void;
  favoriteEvents: FavoriteEvent[];
  events: Event[];
  onRemoveFavorite: (eventId: string) => void;
  onViewEvent: (eventId: string) => void;
}

export function FavoritesManager({ 
  visible, 
  onClose, 
  favoriteEvents, 
  events, 
  onRemoveFavorite, 
  onViewEvent 
}: FavoritesManagerProps) {
  const { t } = useTranslation();
  const getFavoriteEvents = () => {
    return favoriteEvents
      .map(fav => events.find(event => event.id === fav.eventId))
      .filter(Boolean) as Event[];
  };

  const favoriteEventsList = getFavoriteEvents();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isEventPassed = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>❤️</Text>
      <Text style={styles.emptyTitle}>Aucun favori</Text>
      <Text style={styles.emptyMessage}>
        {t('favorites.noFavoritesDescription', { ns: 'favorites' })}{"\n"}
        {t('favorites.exploreTip', { ns: 'favorites' })}
      </Text>
    </View>
  );

  return (
    <CustomModal visible={visible} onClose={onClose} title={t('myFavorites', { ns: 'favorites' })}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {t('favoriteEvents', { count: favoriteEventsList.length, ns: 'favorites' })}
          </Text>
          <Text style={styles.subtitle}>
            {t('findAllFavorites', { ns: 'favorites' })}
          </Text>
        </View>

        <ScrollView style={styles.eventsList}>
          {favoriteEventsList.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>⭐</Text>
              <Text style={styles.emptyText}>{t('noFavoritesTitle', { ns: 'favorites' })}</Text>
              <Text style={styles.emptySubtext}>
                {t('noFavoritesDescription', { ns: 'favorites' })}
              </Text>
            </View>
          ) : (
            favoriteEventsList.map((event) => {
              const isPassed = isEventPassed(event.date);
              return (
                <View key={event.id} style={styles.eventItem}>
                  <Image
                    source={{ uri: event.image }}
                    style={styles.eventImage}
                    resizeMode="cover"
                  />
                  <View style={styles.eventContent}>
                    <View style={styles.eventInfo}>
                      <Text style={styles.eventTitle} numberOfLines={2}>
                        {event.title}
                      </Text>
                      <Text style={styles.eventDate}>
                        {formatDate(event.date)}
                      </Text>
                      <Text style={styles.eventLocation}>
                        📍 {event.location} - {event.venue}
                      </Text>
                      <Text style={styles.eventCategory}>
                        {event.category}
                      </Text>
                      {isPassed && (
                        <View style={styles.passedBadge}>
                          <Text style={styles.passedText}>Événement passé</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.eventActions}>
                      <Button
                        title="Voir"
                        onPress={() => onViewEvent(event.id)}
                        variant="outline"
                        size="sm"
                        style={styles.actionButton}
                      />
                      <TouchableOpacity
                        onPress={() => onRemoveFavorite(event.id)}
                        style={styles.removeButton}
                      >
                        <Text style={styles.removeButtonText}>❤️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </View>
    </CustomModal>
  );
};

// Composant pour le bouton de favori à utiliser dans les listes d'événements
interface FavoriteButtonProps {
  eventId: string;
  isFavorite: boolean;
  onToggleFavorite: (eventId: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  eventId,
  isFavorite,
  onToggleFavorite,
  size = 'md'
}) => {
  const getIconSize = () => {
    switch (size) {
      case 'sm': return 16;
      case 'lg': return 24;
      default: return 20;
    }
  };

  return (
    <TouchableOpacity
      onPress={() => onToggleFavorite(eventId)}
      style={[
        styles.favoriteButton,
        size === 'sm' && styles.favoriteButtonSm,
        size === 'lg' && styles.favoriteButtonLg
      ]}
    >
      <Text style={{ fontSize: getIconSize() }}>
        {isFavorite ? '❤️' : '🤍'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxHeight: 600,
  },
  header: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  eventsList: {
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
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  eventItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  eventImage: {
    width: 80,
    height: 80,
    backgroundColor: '#f3f4f6',
  },
  eventContent: {
    flex: 1,
    padding: 12,
    flexDirection: 'row',
  },
  eventInfo: {
    flex: 1,
    marginRight: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  eventCategory: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
  },
  passedBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  passedText: {
    fontSize: 10,
    color: '#92400e',
    fontWeight: '500',
  },
  eventActions: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionButton: {
    marginBottom: 8,
  },
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    fontSize: 20,
  },
  favoriteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  favoriteButtonSm: {
    padding: 6,
  },
  favoriteButtonLg: {
    padding: 10,
  },
});