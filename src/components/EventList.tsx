import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TextInput, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next'; // Import du hook de traduction
import { Event, EventCategory } from '../types';
import { EventService } from '../services/EventService';
import { EventCard } from './EventCard';
import { Input } from './ui/Input'; // Assurez-vous d'utiliser votre composant Input personnalisé si disponible

interface EventListProps {
  onViewEvent: (eventId: string) => void;
  onSellTicket?: () => void; // Prop optionnelle pour le bouton "Vendre"
}

export function EventList({ onViewEvent, onSellTicket }: EventListProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Hook de traduction
  const { t } = useTranslation(); 

  const loadData = async () => {
    try {
      const cats = await EventService.getCategories();
      setCategories(cats.filter(c => c.categoryId !== 'all'));      
      await fetchEvents();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const data = await EventService.getAllEvents(searchTerm, 'all', selectedCategory === 'all' ? undefined : selectedCategory);
      setEvents(data);
    } catch (error) {
      console.error("Failed to fetch events", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEvents();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getCategoryLabel = (label: string) => {
    // Tente de traduire 'events.categories.Nom', sinon affiche le Nom
    return t(`categories.${label}`, { ns: 'events', defaultValue: label });
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Titre traduit : 'availableEvents' */}
      <Text style={styles.pageTitle}>{t('availableEvents', { ns: 'events', defaultValue: 'Événements disponibles' })}</Text>
      
      {/* Sous-titre traduit : 'findTickets' */}
      <Text style={styles.subtitle}>{t('findTickets', { ns: 'events', defaultValue: 'Trouvez les billets pour vos événements préférés' })}</Text>

      {/* Barre de recherche traduite : 'searchPlaceholder' */}
      <TextInput
        style={styles.searchInput}
        placeholder={t('searchPlaceholder', { ns: 'events', defaultValue: 'Rechercher un événement...' })}
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      {/* Filtres Catégories */}
      <View style={styles.filterLabelContainer}>
         <Text style={styles.filterLabel}>{t('category', { ns: 'events', defaultValue: 'Catégorie' })}:</Text>
      </View>

      <FlatList
        horizontal
        data={[
          { categoryId: 'all', label: 'all' }, // On met une clé de traduction ou un mot clé
          ...categories
        ]}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.categoryId}
        contentContainerStyle={styles.categoriesList}
        renderItem={({ item }) => {
          // CORRECTION 3 : Traduction de l'affichage
          const label = item.categoryId === 'all' 
            ? t('all', { ns: 'events', defaultValue: 'Toutes' }) 
            : getCategoryLabel(item.label);

          return (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === item.categoryId && styles.categoryChipActive
              ]}
              onPress={() => setSelectedCategory(item.categoryId)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === item.categoryId && styles.categoryTextActive
              ]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );

  if (loading && !refreshing) {
    return <ActivityIndicator size="large" color="#2563eb" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <EventCard 
            event={item} 
            onViewEvent={onViewEvent}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {/* Message vide traduit : 'noEventsFound' et 'modifySearchCriteria' */}
            <Text style={styles.emptyText}>{t('noEventsFound', { ns: 'events', defaultValue: 'Aucun événement trouvé' })}</Text>
            <Text style={styles.emptySubtext}>{t('modifySearchCriteria', { ns: 'events', defaultValue: 'Essayez de modifier vos critères de recherche' })}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  loader: { marginTop: 50 },
  listContent: { paddingBottom: 20 },
  headerContainer: { padding: 16, backgroundColor: 'white', marginBottom: 10 },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6b7280', marginBottom: 16 },
  searchInput: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 16,
  },
  filterLabelContainer: { marginBottom: 8 },
  filterLabel: { fontSize: 14, fontWeight: '600', color: '#374151' },
  categoriesList: { paddingVertical: 4 },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  categoryText: { color: '#4b5563', fontWeight: '500' },
  categoryTextActive: { color: 'white' },
  emptyContainer: { alignItems: 'center', marginTop: 40, paddingHorizontal: 20 },
  emptyText: { color: '#374151', fontSize: 18, fontWeight: '600', marginBottom: 8 },
  emptySubtext: { color: '#6b7280', fontSize: 14, textAlign: 'center' },
});