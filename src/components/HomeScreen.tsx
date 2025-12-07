import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Event } from '../types';
import { Button } from './ui/Button';
import { EventService } from '../services/EventService';
import { FeaturedEventCard } from './FeaturedEventCard';
import { Ionicons } from '@expo/vector-icons';

interface HomeScreenProps {
  // On retire 'events' des props car le composant les charge lui-même
  onViewEvent: (eventId: string) => void;
  onNavigateToEvents: () => void;
}

export function HomeScreen({ onViewEvent, onNavigateToEvents }: HomeScreenProps) {
  const { t, i18n } = useTranslation();
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedEvents = async () => {
      try {
        // Récupère tous les événements (ou créer un endpoint /upcoming dédié plus tard)
        const allEvents = await EventService.getAllEvents();
        // On prend les 5 premiers pour l'affichage "À la une"
        setFeaturedEvents(allEvents.slice(0, 5));
      } catch (error) {
        console.error("Erreur chargement événements home:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedEvents();
  }, []);
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <Image 
          source={{
            uri: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGZlc3RpdmFsJTIwY3Jvd2R8ZW58MXx8fHwxNzU4NzE0NDU0fDA&ixlib=rb-4.1.0&q=80&w=1080"
          }}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View style={styles.heroOverlay}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>{t('heroTitle', { ns: 'home', defaultValue: 'Vivez des moments inoubliables' })}</Text>
            <Text style={styles.heroSubtitle}>
              {t('heroSubtitle', { ns: 'home', defaultValue: 'Découvrez les meilleurs événements près de chez vous' })}
            </Text>
            <Button 
              title={t('discoverEvents', { ns: 'home', defaultValue: 'Découvrir' })}
              onPress={onNavigateToEvents}
              size="lg"
              style={styles.heroButton}
            />
          </View>
        </View>
      </View>

      {/* Featured Events */}
      <View style={styles.featuredSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('featuredEvents', { ns: 'home', defaultValue: 'À la une' })}</Text>
          <TouchableOpacity onPress={onNavigateToEvents}>
            <Text style={styles.seeAllLink}>{t('seeAll', { ns: 'common', defaultValue: 'Voir tout' })}</Text>
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 20 }} />
        ) : (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.eventsContainer}
          >
            {featuredEvents.length > 0 ? (
              featuredEvents.map(event => (
                <FeaturedEventCard 
                  key={event.id} 
                  event={event} 
                  onViewEvent={onViewEvent} 
                />
              ))
            ) : (
              <Text style={styles.emptyText}>Aucun événement à la une pour le moment.</Text>
            )}
          </ScrollView>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  hero: {
    height: 320,
    position: 'relative',
    marginBottom: 32,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Un peu plus sombre pour la lisibilité
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
    paddingHorizontal: 16,
    maxWidth: 400,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#f3f4f6',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  heroButton: {
    minWidth: 180,
  },
  featuredSection: {
    paddingLeft: 16,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  seeAllLink: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
  eventsContainer: {
    paddingRight: 16,
    paddingBottom: 10, // Pour l'ombre
  },
  emptyText: {
    color: '#6b7280',
    fontStyle: 'italic',
    marginLeft: 4,
  }
});