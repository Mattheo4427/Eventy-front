import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Event } from '../types';

interface EventCardProps {
  event: Event;
  onViewEvent: (eventId: string) => void;
  // AJOUT : Ces props sont obligatoires pour que EventList ne plante pas
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
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [event.imageUrl]);
  
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
      activeOpacity={0.9}
    >
      {/* Conteneur Image */}
      <View style={styles.imageContainer}>
        {(imageError || !event.imageUrl) ? (
          <View style={[styles.image, styles.placeholderContainer]}>
            <Ionicons name="image-outline" size={48} color="#9ca3af" />
            <Text style={styles.placeholderText}>Eventy</Text>
          </View>
        ) : (
          <Image 
            source={{ uri: event.imageUrl }} 
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        )}
        
        {/* Badge Statut (si non actif) */}
        {event.status !== 'active' && (
          <View style={[styles.badge, event.status === 'canceled' ? styles.badgeRed : styles.badgeOrange]}>
            <Text style={styles.badgeText}>{event.status}</Text>
          </View>
        )}

        {/* Bouton Favori (Coeur) - Conditionnel */}
        {showFavoriteButton && onToggleFavorite && (
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={(e) => {
              e.stopPropagation(); // Empêche d'ouvrir le détail quand on clique sur le coeur
              onToggleFavorite(event.id);
            }}
          >
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={22} 
              color={isFavorite ? "#ef4444" : "#ffffff"} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Contenu Texte */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>{event.name}</Text>
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
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: '#e5e7eb',
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  placeholderText: {
    marginTop: 8,
    color: '#9ca3af',
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  category: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  infoText: {
    marginLeft: 8,
    color: '#4b5563',
    fontSize: 14,
    fontWeight: '500',
  },
  // Styles Badges et Boutons
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 10,
  },
  badgeRed: { backgroundColor: '#fee2e2' },
  badgeOrange: { backgroundColor: '#ffedd5' },
  badgeText: { fontSize: 12, fontWeight: 'bold', color: '#374151', textTransform: 'uppercase' },
  
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 8,
    zIndex: 10,
  }
});