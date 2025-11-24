import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, ScrollView } from 'react-native';
import { Event, EventCategory } from '../types';
import { AdminService } from '../services/AdminService';
import { EventService } from '../services/EventService';
import { CreateEventModal } from './CreateEventModal';
import { EditEventModal } from './EditEventModal';
import { CategoryModal } from './CategoryModal'; // Import du nouveau modal
import { Ionicons } from '@expo/vector-icons';

export function AdminPanel() {
  // AJOUT de 'categories' dans le type de l'onglet
  const [activeTab, setActiveTab] = useState<'events' | 'tickets' | 'users' | 'categories'>('events');
  const [data, setData] = useState<any[]>([]);
  
  // États pour les modals d'événements
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // AJOUT : États pour les catégories
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | null>(null);

  const loadData = async () => {
    try {
      if (activeTab === 'events') {
        const events = await EventService.getAllEvents();
        setData(events);
      } else if (activeTab === 'categories') {
        // AJOUT : Chargement des catégories
        const categories = await EventService.getCategories();
        // On filtre la fausse catégorie "Toutes" (id: 'all') si elle est ajoutée par le front
        setData(categories.filter(c => c.categoryId !== 'all'));
      } else if (activeTab === 'users') {
        // const users = await AdminService.getAllUsers();
        setData([{ id: '1', name: 'Admin Test', email: 'admin@test.com', role: 'ADMIN' }]);
      } else {
        setData([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  // --- LOGIQUE EVENEMENTS ---
  const handleDeleteEvent = (id: string) => {
    Alert.alert("Supprimer l'événement", "Êtes-vous sûr ?", [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", style: "destructive", onPress: async () => {
            await AdminService.deleteEvent(id); loadData();
        }}
    ]);
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setShowEditModal(true);
  };

  // --- AJOUT : LOGIQUE CATEGORIES ---
  const handleEditCategory = (category: EventCategory) => {
    setSelectedCategory(category);
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = (id: string) => {
    Alert.alert(
      "Supprimer la catégorie",
      "Attention : Cela pourrait affecter les événements liés. Êtes-vous sûr ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", style: "destructive", onPress: async () => {
            try {
              await AdminService.deleteCategory(id);
              loadData();
            } catch (e) {
              Alert.alert("Erreur", "Impossible de supprimer cette catégorie (peut-être utilisée ?)");
            }
        }}
      ]
    );
  };

  const openCreateCategory = () => {
    setSelectedCategory(null); // Null = Mode Création
    setShowCategoryModal(true);
  };

  const renderItem = ({ item }: { item: any }) => {
    // Rendu Événements
    if (activeTab === 'events') {
      return (
        <View style={styles.row}>
          <View style={{flex: 1}}>
            <Text style={styles.rowTitle}>{item.name}</Text>
            <Text style={styles.rowSubtitle}>{item.location} • {item.categoryLabel}</Text>
            <Text style={styles.rowStatus}>{item.status}</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => handleEditEvent(item)} style={styles.actionButton}>
              <Ionicons name="pencil" size={20} color="#2563eb" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteEvent(item.id)} style={styles.actionButton}>
              <Ionicons name="trash" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    
    // AJOUT : Rendu Catégories
if (activeTab === 'categories') {
      // Sécurisation de l'ID : si undefined, chaîne vide
      const catId = item.categoryId || ''; 
      return (
        <View style={styles.row}>
          <View style={{flex: 1}}>
            <Text style={styles.rowTitle}>{item.label}</Text>
            {/* CORRECTION : Utilisation sécurisée de substring */}
            <Text style={styles.rowSubtitle}>ID: {catId.length > 8 ? catId.substring(0, 8) + '...' : catId}</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => handleEditCategory(item)} style={styles.actionButton}><Ionicons name="pencil" size={20} color="#2563eb" /></TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteCategory(item.categoryId)} style={styles.actionButton}><Ionicons name="trash" size={20} color="#ef4444" /></TouchableOpacity>
          </View>
        </View>
      );
    }

    // Rendu Users (Mock)
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
      <View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.tabsContainer}
          style={styles.tabsScrollView}
        >
          {(['events', 'categories', 'tickets', 'users'] as const).map(tab => (
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
        </ScrollView>
      </View>

      {/* Boutons d'action contextuels */}
      {activeTab === 'events' && (
        <TouchableOpacity style={styles.addButton} onPress={() => setShowCreateModal(true)}>
          <Text style={styles.addButtonText}>+ Événement</Text>
        </TouchableOpacity>
      )}

      {activeTab === 'categories' && (
        <TouchableOpacity style={styles.addButton} onPress={openCreateCategory}>
          <Text style={styles.addButtonText}>+ Catégorie</Text>
        </TouchableOpacity>
      )}

      {/* Liste */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id || item.eventId || item.categoryId}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>Aucune donnée</Text>}
      />

      {/* Modals Événements */}
      <CreateEventModal 
        visible={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        onSuccess={loadData}
      />
      <EditEventModal
        visible={showEditModal}
        event={selectedEvent}
        onClose={() => { setShowEditModal(false); setSelectedEvent(null); }}
        onSuccess={loadData}
      />

      {/* AJOUT : Modal Catégorie */}
      <CategoryModal 
        visible={showCategoryModal}
        categoryToEdit={selectedCategory}
        onClose={() => { setShowCategoryModal(false); setSelectedCategory(null); }}
        onSuccess={loadData}
      />
    </View>
  );
}

// Styles inchangés (ou ajustés légèrement pour 4 onglets)
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9fafb' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 16, color: '#111827' },
  
  // Styles modifiés pour le scroll horizontal des onglets
  tabsScrollView: { marginBottom: 16, maxHeight: 50 },
  tabsContainer: { 
    backgroundColor: '#e5e7eb', 
    borderRadius: 8, 
    padding: 4, 
    height: 44, // Hauteur fixe pour éviter l'écrasement
    alignItems: 'center'
  },
  tab: { 
    paddingHorizontal: 16, 
    paddingVertical: 6, 
    borderRadius: 6, 
    marginRight: 4,
    justifyContent: 'center'
  },
  activeTab: { backgroundColor: 'white', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2 },
  tabText: { fontWeight: '600', color: '#6b7280', fontSize: 14 },
  activeTabText: { color: '#111827' },

  addButton: { backgroundColor: '#2563eb', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 16 },
  addButtonText: { color: 'white', fontWeight: 'bold' },
  list: { paddingBottom: 20 },
  row: { flexDirection: 'row', padding: 16, backgroundColor: 'white', marginBottom: 8, borderRadius: 8, alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  rowTitle: { fontWeight: 'bold', fontSize: 16, color: '#1f2937' },
  rowSubtitle: { color: '#6b7280', marginTop: 2 },
  rowStatus: { fontSize: 12, color: '#9ca3af', marginTop: 4, textTransform: 'uppercase' },
  actions: { flexDirection: 'row', gap: 10 },
  actionButton: { padding: 8 },
  emptyText: { textAlign: 'center', color: '#9ca3af', marginTop: 20 }
});