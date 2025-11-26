import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Event, Ticket } from '../types';
import { EventCard } from './EventCard';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { BuyTicketModal } from './BuyTicketModal';

// --- Mock data ---
const mockEvent: Event = {
  id: 'evt_1',
  title: 'Mock Concert',
  date: new Date().toISOString(),
  venue: 'Mock Arena',
  location: 'Paris',
  category: 'Music',
  description: 'A great mock concert event!',
  image: 'https://placehold.co/600x400',
};

const mockTicket: Ticket = {
  id: 'tkt_1',
  eventId: 'evt_1',
  sellerId: 'user_1',
  section: 'A',
  row: '5',
  seat: '12',
  sellerName: 'John Doe',
  price: 25,
  originalPrice: 40,
  description: 'Front row seat for the best experience!',
  status: 'available',
};

interface EventListProps {
  events: Event[];
  onViewEvent: (eventId: string) => void;
  onSellTicket: () => void;
}

export function EventList({ events, onViewEvent, onSellTicket }: EventListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const { t } = useTranslation();

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
    const matchesLocation = locationFilter === 'all' || event.location === locationFilter;
    return matchesSearch && matchesCategory && matchesLocation;
  });

  const categories = Array.from(new Set(events.map(e => e.category)));
  const locations = Array.from(new Set(events.map(e => e.location)));

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('availableEvents', { ns: 'events' })}</Text>
          <Text style={styles.subtitle}>{t('findTickets', { ns: 'events' })}</Text>
        </View>
        <Button 
          title={t('sellTicket', { ns: 'events' })}
          onPress={onSellTicket}
          size="lg"
          style={styles.sellButton}
        />
      </View>

      {/* Filters */}
      <Card style={styles.filtersCard}>
        <CardContent>
          <Text style={styles.filtersTitle}>{t('searchFilters', { ns: 'events' })}</Text>
          
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
            <Input
              placeholder={t('searchPlaceholder', { ns: 'events' })}
              value={searchTerm}
              onChangeText={setSearchTerm}
              style={styles.searchInput}
            />
          </View>

          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>{t('category', { ns: 'events' })}:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  categoryFilter === 'all' && styles.filterChipActive
                ]}
                onPress={() => setCategoryFilter('all')}
              >
                <Text style={[
                  styles.filterChipText,
                  categoryFilter === 'all' && styles.filterChipTextActive
                ]}>
                  All
                </Text>
              </TouchableOpacity>
              {categories.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.filterChip,
                    categoryFilter === category && styles.filterChipActive
                  ]}
                  onPress={() => setCategoryFilter(category)}
                >
                  <Text style={[
                    styles.filterChipText,
                    categoryFilter === category && styles.filterChipTextActive
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Location:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  locationFilter === 'all' && styles.filterChipActive
                ]}
                onPress={() => setLocationFilter('all')}
              >
                <Text style={[
                  styles.filterChipText,
                  locationFilter === 'all' && styles.filterChipTextActive
                ]}>
                  All
                </Text>
              </TouchableOpacity>
              {locations.map(location => (
                <TouchableOpacity
                  key={location}
                  style={[
                    styles.filterChip,
                    locationFilter === location && styles.filterChipActive
                  ]}
                  onPress={() => setLocationFilter(location)}
                >
                  <Text style={[
                    styles.filterChipText,
                    locationFilter === location && styles.filterChipTextActive
                  ]}>
                    {location}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </CardContent>
      </Card>

      {/* Events Grid */}
      <View style={styles.eventsContainer}>
        {filteredEvents.map(event => (
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
              <View style={styles.eventMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                  <Text style={styles.metaText}>
                    {new Date(event.date).toLocaleDateString('fr-FR')}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="location-outline" size={16} color="#6b7280" />
                  <Text style={styles.metaText}>{event.location}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="pricetag-outline" size={16} color="#6b7280" />
                  <Text style={styles.metaText}>{event.category}</Text>
                </View>
              </View>
              <Text style={styles.eventDescription} numberOfLines={2}>
                {event.description}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Mock payment test button */}
      <Button
        title="Test Buy Mock Ticket"
        onPress={() => setModalVisible(true)}
        style={{ margin: 20 }}
      />

      {/* Payment Modal for testing */}
      <BuyTicketModal
        visible={modalVisible}
        ticket={mockTicket}
        event={mockEvent}
        onBuy={() => setModalVisible(false)}
        onClose={() => setModalVisible(false)}
      />

      {filteredEvents.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No events found</Text>
          <Text style={styles.emptySubtext}>
            Try modifying your search criteria
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'column',
    padding: 16,
    gap: 16,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  sellButton: {
    alignSelf: 'stretch',
  },
  filtersCard: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  filtersTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: 12,
    zIndex: 1,
  },
  searchInput: {
    paddingLeft: 40,
  },
  filterRow: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  filterChip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterChipText: {
    fontSize: 14,
    color: '#374151',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  eventsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  eventCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
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
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  eventContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
    lineHeight: 24,
  },
  eventMeta: {
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 6,
  },
  eventDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});