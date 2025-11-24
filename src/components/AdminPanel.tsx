import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { Event, Ticket, User } from '../types';
import { AdminService } from '../services/AdminService';
import { EventService } from '../services/EventService';
import { CreateEventModal } from './CreateEventModal';
import { Ionicons } from '@expo/vector-icons';

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'events' | 'tickets' | 'users'>('events');
  const [data, setData] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadData = async () => {
    try {
      if (activeTab === 'events') {
        const events = await EventService.getAllEvents(); // Réutilise le service existant
        setData(events);
      } else if (activeTab === 'users') {
        // const users = await AdminService.getAllUsers(); // À décommenter quand le back sera prêt
        setData([{ id: '1', name: 'User Test', email: 'test@test.com', role: 'USER' }]); // Mock
      } else {
        // const tickets = await AdminService.getAllTickets();
        setData([]); // Mock
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const renderItem = ({ item }: { item: any }) => {
    if (activeTab === 'events') {
      return (
        <View style={styles.row}>
          <View style={{flex: 1}}>
            <Text style={styles.rowTitle}>{item.name}</Text>
            <Text style={styles.rowSubtitle}>{item.location} - {item.status}</Text>
          </View>
          <TouchableOpacity onPress={() => AdminService.deleteEvent(item.id).then(loadData)}>
            <Ionicons name="trash" size={20} color="red" />
          </TouchableOpacity>
        </View>
      );
    }
    if (activeTab === 'users') {
      return (
        <View style={styles.row}>
          <Text style={styles.rowTitle}>{item.name}</Text>
          <Text style={styles.rowSubtitle}>{item.email} ({item.role})</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Administration</Text>
      
      {/* Tabs */}
      <View style={styles.tabs}>
        {(['events', 'tickets', 'users'] as const).map(tab => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Actions */}
      {activeTab === 'events' && (
        <TouchableOpacity style={styles.addButton} onPress={() => setShowCreateModal(true)}>
          <Text style={styles.addButtonText}>+ Nouvel Événement</Text>
        </TouchableOpacity>
      )}

      {/* Liste */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id || item.eventId}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />

      <CreateEventModal 
        visible={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        onSuccess={loadData}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9fafb' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 16, color: '#111827' },
  tabs: { flexDirection: 'row', marginBottom: 16, backgroundColor: '#e5e7eb', borderRadius: 8, padding: 4 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  activeTab: { backgroundColor: 'white', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2 },
  tabText: { fontWeight: '600', color: '#6b7280' },
  activeTabText: { color: '#111827' },
  addButton: { backgroundColor: '#2563eb', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 16 },
  addButtonText: { color: 'white', fontWeight: 'bold' },
  list: { paddingBottom: 20 },
  row: { flexDirection: 'row', padding: 16, backgroundColor: 'white', marginBottom: 8, borderRadius: 8, alignItems: 'center', justifyContent: 'space-between' },
  rowTitle: { fontWeight: 'bold', fontSize: 16 },
  rowSubtitle: { color: 'gray' }
});