import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Alert, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User, Ticket, Transaction } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useAuth } from '../contexts/AuthContext';
import { UserService } from '../services/UserService'; // Assurez-vous d'avoir créé ce service
import { TransactionService } from '../services/TransactionService';
import { TicketService } from '../services/TicketService'; // Pour récupérer mes tickets en vente

export function UserProfile() {
  const { user: authUser, logout } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'wallet' | 'tickets'>('profile');

  // Data lists
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);

  // Edit Mode
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    loadUserData();
  }, [authUser]);

  const loadUserData = async () => {
    if (!authUser) return;
    setLoading(true);
    try {
      // 1. Récupérer les infos fraiches de l'utilisateur (dont la balance)
      const userData = await UserService.getProfile();
      setUser(userData);
      setEditForm({
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: ''
      });

      // 2. Récupérer l'historique des transactions (Achats)
      const history = await TransactionService.getMyHistory();
      setTransactions(history);

      // 3. Récupérer les tickets mis en vente par cet user
      // Note: Il faudra peut-être adapter l'endpoint dans TicketService
      const tickets = await TicketService.getMyTickets(authUser.id); // Supposons cette méthode
      setMyTickets(tickets);

    } catch (error) {
      console.error("Erreur chargement profil", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      const updatedUser = await UserService.updateProfile(editForm);
      setUser(updatedUser);
      setIsEditing(false);
      Alert.alert("Succès", "Profil mis à jour");
    } catch (error) {
      Alert.alert("Erreur", "Impossible de mettre à jour le profil");
    }
  };

  const renderTicketItem = ({ item }: { item: Ticket }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Ticket #{item.id.substring(0, 8)}</Text>
        <View style={[styles.badge, 
          item.status === 'SOLD' ? styles.bgGreen : 
          item.status === 'AVAILABLE' ? styles.bgBlue : styles.bgGray
        ]}>
          <Text style={styles.badgeText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.cardSubtitle}>Prix: {item.salePrice}€</Text>
    </View>
  );

  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Achat le {new Date(item.transactionDate).toLocaleDateString()}</Text>
        <Text style={styles.priceText}>-{item.totalAmount}€</Text>
      </View>
      <Text style={styles.cardSubtitle}>ID: {item.id.substring(0, 8)} • {item.status}</Text>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" color="#2563eb" style={{marginTop: 50}} />;
  if (!user) return <Text>Utilisateur non trouvé</Text>;

  return (
    <View style={styles.container}>
      {/* Header Profil */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.firstName[0]}{user.lastName[0]}
          </Text>
        </View>
        <Text style={styles.userName}>{user.firstName} {user.lastName}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        
        <View style={styles.statsRow}>
            <View style={styles.statItem}>
                <Text style={styles.statValue}>{myTickets.filter(t => t.status === 'AVAILABLE').length}</Text>
                <Text style={styles.statLabel}>En vente</Text>
            </View>
            <View style={styles.statItem}>
                <Text style={styles.statValue}>{myTickets.filter(t => t.status === 'SOLD').length}</Text>
                <Text style={styles.statLabel}>Vendus</Text>
            </View>
            <View style={styles.statItem}>
                <Text style={styles.statValue}>{transactions.length}</Text>
                <Text style={styles.statLabel}>Achats</Text>
            </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity onPress={() => setActiveTab('profile')} style={[styles.tab, activeTab === 'profile' && styles.activeTab]}>
          <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>Infos</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('wallet')} style={[styles.tab, activeTab === 'wallet' && styles.activeTab]}>
          <Text style={[styles.tabText, activeTab === 'wallet' && styles.activeTabText]}>Portefeuille</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('tickets')} style={[styles.tab, activeTab === 'tickets' && styles.activeTab]}>
          <Text style={[styles.tabText, activeTab === 'tickets' && styles.activeTabText]}>Activité</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        
        {/* --- ONGLET PROFIL --- */}
        {activeTab === 'profile' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Mes informations</Text>
                {!isEditing && (
                    <TouchableOpacity onPress={() => setIsEditing(true)}>
                        <Ionicons name="pencil" size={20} color="#2563eb" />
                    </TouchableOpacity>
                )}
            </View>

            <Input 
                label="Nom d'utilisateur" 
                value={editForm.username}
                onChangeText={t => setEditForm({...editForm, username: t})} 
                editable={isEditing}
                style={styles.disabledInput}
            />
            <Input 
                label="Prénom" 
                value={editForm.firstName} 
                onChangeText={t => setEditForm({...editForm, firstName: t})} 
                editable={isEditing} 
                style={!isEditing && styles.disabledInput}
            />
            <Input 
                label="Nom" 
                value={editForm.lastName} 
                onChangeText={t => setEditForm({...editForm, lastName: t})} 
                editable={isEditing}
                style={!isEditing && styles.disabledInput}
            />
            <Input 
                label="Email" 
                value={editForm.email} 
                onChangeText={t => setEditForm({...editForm, email: t})} 
                editable={isEditing}
                style={!isEditing && styles.disabledInput}
            />
            <Input 
                label="Mot de passe" 
                value={editForm.password} 
                onChangeText={t => setEditForm({...editForm, password: t})}
                editable={isEditing}
                secureTextEntry 
                style={!isEditing && styles.disabledInput}
            />  

            {isEditing && (
                <View style={styles.editButtons}>
                    <Button title="Enregistrer" onPress={handleSaveProfile} style={{flex: 1, marginRight: 8}} />
                    <Button title="Annuler" variant="outline" onPress={() => setIsEditing(false)} style={{flex: 1}} />
                </View>
            )}

            <Button 
                title="Se déconnecter" 
                variant="outline" 
                onPress={logout} 
                style={{marginTop: 24, borderColor: '#ef4444'}}
                textStyle={{color: '#ef4444'}}
            />
          </View>
        )}

        {/* --- ONGLET PORTEFEUILLE --- */}
        {activeTab === 'wallet' && (
          <View style={styles.section}>
            <View style={styles.balanceCard}>
                <Text style={styles.balanceLabel}>Solde disponible</Text>
                <Text style={styles.balanceValue}>{user.balance?.toFixed(2) ?? '0.00'} €</Text>
                <Text style={styles.balanceNote}>Gains issus de vos ventes</Text>
            </View>
            
            <Text style={styles.subHeader}>Historique des transactions</Text>
            {transactions.length === 0 ? (
                <Text style={styles.emptyText}>Aucune transaction</Text>
            ) : (
                transactions.map(t => (
                    <View key={t.id} style={{marginBottom: 8}}>
                        {renderTransactionItem({item: t})}
                    </View>
                ))
            )}
          </View>
        )}

        {/* --- ONGLET TICKETS --- */}
        {activeTab === 'tickets' && (
          <View style={styles.section}>
            <Text style={styles.subHeader}>Mes Tickets en Vente / Vendus</Text>
            {myTickets.length === 0 ? (
                <Text style={styles.emptyText}>Aucun ticket mis en vente</Text>
            ) : (
                myTickets.map(t => (
                    <View key={t.id} style={{marginBottom: 8}}>
                        {renderTicketItem({item: t})}
                    </View>
                ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  userEmail: { fontSize: 14, color: '#6b7280', marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 20 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  statLabel: { fontSize: 12, color: '#6b7280' },
  
  tabs: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 16, paddingBottom: 0 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#2563eb' },
  tabText: { color: '#6b7280', fontWeight: '500' },
  activeTabText: { color: '#2563eb', fontWeight: 'bold' },
  
  content: { flex: 1, padding: 16 },
  section: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  disabledInput: { backgroundColor: '#f3f4f6', color: '#6b7280' },
  editButtons: { flexDirection: 'row', marginTop: 16 },
  
  balanceCard: { backgroundColor: '#2563eb', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 24 },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 8 },
  balanceValue: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  balanceNote: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 8 },
  
  subHeader: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 12, marginTop: 8 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardTitle: { fontWeight: '600', color: '#111827' },
  cardSubtitle: { color: '#6b7280', fontSize: 12 },
  priceText: { fontWeight: 'bold', color: '#059669' },
  
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  bgGreen: { backgroundColor: '#d1fae5' },
  bgBlue: { backgroundColor: '#dbeafe' },
  bgGray: { backgroundColor: '#f3f4f6' },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  
  emptyText: { textAlign: 'center', color: '#9ca3af', marginTop: 20, fontStyle: 'italic' }
});