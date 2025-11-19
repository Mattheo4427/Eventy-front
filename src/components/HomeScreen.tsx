import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Event } from '../types';
import { Button } from './ui/Button';

interface HomeScreenProps {
  events: Event[];
  onViewEvent: (eventId: string) => void;
  onNavigateToEvents: () => void;
}

export function HomeScreen({ events, onViewEvent, onNavigateToEvents }: HomeScreenProps) {
  const { t, i18n } = useTranslation();
  
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
            <Text style={styles.heroTitle}>{t('heroTitle', { ns: 'home' })}</Text>
            <Text style={styles.heroSubtitle}>
              {t('heroSubtitle', { ns: 'home' })}
            </Text>
            <Button 
              title={t('discoverEvents', { ns: 'home' })}
              onPress={onNavigateToEvents}
              size="lg"
              style={styles.heroButton}
            />
          </View>
        </View>
      </View>

      {/* Featured Events */}
      <View style={styles.featuredSection}>
        <Text style={styles.sectionTitle}>{t('featuredEvents', { ns: 'home' })}</Text>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.eventsContainer}
        >
          {events.slice(0, 3).map(event => (
            <TouchableOpacity 
              key={event.id} 
              style={styles.eventCard}
              onPress={() => onViewEvent(event.id)}
            >
              <Image 
                source={{ uri: event.image }} 
                style={styles.eventImage}
                resizeMode="cover"
              />
              <View style={styles.eventContent}>
                <Text style={styles.eventTitle} numberOfLines={2}>
                  {event.title}
                </Text>
                <Text style={styles.eventDetails}>
                  {new Date(event.date).toLocaleDateString(i18n.language === 'es' ? 'es-ES' : i18n.language === 'fr' ? 'fr-FR' : 'en-US')} • {event.location}
                </Text>
                <Text style={styles.eventLink}>
                  {t('viewTickets', { ns: 'home' })}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    marginBottom: 16,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  heroButton: {
    minWidth: 200,
  },
  featuredSection: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 24,
  },
  eventsContainer: {
    paddingRight: 16,
  },
  eventCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginRight: 16,
    width: 280,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  eventImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  eventContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 22,
  },
  eventDetails: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  eventLink: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
});