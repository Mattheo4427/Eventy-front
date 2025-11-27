import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Alert, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User, Ticket, Transaction, Event } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useAuth } from '../contexts/AuthContext';
import { UserService } from '../services/UserService';
import { TransactionService } from '../services/TransactionService';
import { TicketService } from '../services/TicketService';
import { EventService } from '../services/EventService';
import { TicketDetailModal } from './TicketDetailModal';
import { TransactionDetailModal } from './TransactionDetailModal';

export function UserProfile() {
  const { user: authUser, logout } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'wallet' | 'tickets'>('profile');
  const [ticketTab, setTicketTab] = useState<'owned' | 'selling'>('owned');

  // Data lists
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [myTickets, setMyTickets] = useState<Ticket[]>([]); // Tickets I am selling
  const [ownedTickets, setOwnedTickets] = useState<Ticket[]>([]); // Tickets I bought

  // Filters
  const [transactionFilter, setTransactionFilter] = useState<'ALL' | 'COMPLETED' | 'PENDING'>('ALL');
  const [sellingFilter, setSellingFilter] = useState<'ALL' | 'AVAILABLE' | 'SOLD'>('ALL');

  // Modals
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

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
      // 1. Récupérer les infos fraiches de l'utilisateur
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
      // Deduplicate transactions just in case
      const uniqueHistory = Array.from(new Map(history.map(item => [item.id, item])).values());
      setTransactions(uniqueHistory);

      // 3. Récupérer les tickets achetés (via les transactions)
      // On récupère les détails de chaque ticket acheté
      const ownedPromises = uniqueHistory
        .filter(tx => tx.status === 'COMPLETED')
        .map(tx => TicketService.getTicketById(tx.ticketId).catch(e => null));
      
      const owned = (await Promise.all(ownedPromises)).filter((t): t is Ticket => t !== null);
      // Deduplicate owned tickets (in case multiple transactions point to same ticket)
      const uniqueOwned = Array.from(new Map(owned.map(item => [item.id, item])).values());
      setOwnedTickets(uniqueOwned);

      // 4. Récupérer les tickets mis en vente par cet user
      const tickets = await TicketService.getMyTickets(authUser.id);
      // Deduplicate my tickets
      const uniqueMyTickets = Array.from(new Map(tickets.map(item => [item.id, item])).values());
      setMyTickets(uniqueMyTickets);

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

  const handleTicketPress = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    // Reset previous event to avoid showing wrong data while loading
    setSelectedEvent(null);
    
    if (ticket.eventId) {
      try {
        const eventData = await EventService.getEventById(ticket.eventId);
        setSelectedEvent(eventData);
      } catch (error) {
        console.error("Erreur chargement event pour ticket", error);
      }
    }
    
    setShowTicketModal(true);
  };

  const handleTransactionPress = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionModal(true);
  };

  const renderTicketItem = ({ item }: { item: Ticket }) => (
    <TouchableOpacity onPress={() => handleTicketPress(item)} activeOpacity={0.7}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
            <Ionicons name="ticket-outline" size={20} color="#4b5563" />
            <Text style={styles.cardTitle}>Ticket #{item.id.substring(0, 8)}</Text>
          </View>
          <View style={[styles.badge, 
            item.status === 'SOLD' ? styles.bgGreen : 
            item.status === 'AVAILABLE' ? styles.bgBlue : styles.bgGray
          ]}>
            <Text style={[styles.badgeText, 
              item.status === 'SOLD' ? {color: '#065f46'} : 
              item.status === 'AVAILABLE' ? {color: '#1e40af'} : {color: '#374151'}
            ]}>{item.status}</Text>
          </View>
        </View>
        <View style={styles.cardBody}>
            <Text style={styles.cardSubtitle}>Prix: {item.salePrice}€</Text>
            {item.ticketTypeLabel && <Text style={styles.cardDetail}>• {item.ticketTypeLabel}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <TouchableOpacity onPress={() => handleTransactionPress(item)} activeOpacity={0.7}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
            <Ionicons name={item.status === 'COMPLETED' ? "checkmark-circle" : "time"} size={20} color={item.status === 'COMPLETED' ? "#10b981" : "#f59e0b"} />
            <Text style={styles.cardTitle}>{new Date(item.transactionDate).toLocaleDateString()}</Text>
          </View>
          <Text style={styles.priceText}>-{item.totalAmount}€</Text>
        </View>
        <Text style={styles.cardSubtitle}>ID: {item.id.substring(0, 8)} • {item.status}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) return <ActivityIndicator size="large" color="#2563eb" style={{marginTop: 50}} />;
  if (!user) return <Text>Utilisateur non trouvé</Text>;

  return (
    <View style={styles.container}>
      {/* Header Profil */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
            <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {user.firstName[0]}{user.lastName[0]}
                    </Text>
                </View>
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.firstName} {user.lastName}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                </View>
            </View>
            
            <View style={styles.statsCard}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{myTickets.filter(t => t.status === 'AVAILABLE').length}</Text>
                    <Text style={styles.statLabel}>En vente</Text>
                </View>
                <View style={styles.verticalDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{myTickets.filter(t => t.status === 'SOLD').length}</Text>
                    <Text style={styles.statLabel}>Vendus</Text>
                </View>
                <View style={styles.verticalDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{transactions.length}</Text>
                    <Text style={styles.statLabel}>Achats</Text>
                </View>
            </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity onPress={() => setActiveTab('profile')} style={[styles.tab, activeTab === 'profile' && styles.activeTab]}>
          <Ionicons name="person-outline" size={20} color={activeTab === 'profile' ? '#2563eb' : '#6b7280'} style={{marginBottom: 4}} />
          <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>Infos</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('wallet')} style={[styles.tab, activeTab === 'wallet' && styles.activeTab]}>
          <Ionicons name="wallet-outline" size={20} color={activeTab === 'wallet' ? '#2563eb' : '#6b7280'} style={{marginBottom: 4}} />
          <Text style={[styles.tabText, activeTab === 'wallet' && styles.activeTabText]}>Portefeuille</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('tickets')} style={[styles.tab, activeTab === 'tickets' && styles.activeTab]}>
          <Ionicons name="ticket-outline" size={20} color={activeTab === 'tickets' ? '#2563eb' : '#6b7280'} style={{marginBottom: 4}} />
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
            
            <View style={{marginBottom: 16}}>
                <Text style={styles.subHeader}>Historique des transactions</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginTop: 8}}>
                    {(['ALL', 'COMPLETED', 'PENDING'] as const).map(f => (
                        <TouchableOpacity 
                            key={f} 
                            onPress={() => setTransactionFilter(f)}
                            style={[styles.filterChip, transactionFilter === f && styles.activeFilterChip]}
                        >
                            <Text style={[styles.filterText, transactionFilter === f && styles.activeFilterText]}>
                                {f === 'ALL' ? 'Tout' : f === 'COMPLETED' ? 'Validé' : 'En attente'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {transactions
                .filter(t => transactionFilter === 'ALL' || t.status === transactionFilter)
                .length === 0 ? (
                <Text style={styles.emptyText}>Aucune transaction trouvée</Text>
            ) : (
                transactions
                    .filter(t => transactionFilter === 'ALL' || t.status === transactionFilter)
                    .map(t => (
                    <View key={t.id} style={{marginBottom: 8}}>
                        {renderTransactionItem({item: t})}
                    </View>
                )))
            }
          </View>
        )}

        {/* --- ONGLET TICKETS --- */}
        {activeTab === 'tickets' && (
          <View style={styles.section}>
            <View style={styles.subTabs}>
                <TouchableOpacity onPress={() => setTicketTab('owned')} style={[styles.subTab, ticketTab === 'owned' && styles.activeSubTab]}>
                    <Text style={[styles.subTabText, ticketTab === 'owned' && styles.activeSubTabText]}>Mes Billets</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setTicketTab('selling')} style={[styles.subTab, ticketTab === 'selling' && styles.activeSubTab]}>
                    <Text style={[styles.subTabText, ticketTab === 'selling' && styles.activeSubTabText]}>Mes Ventes</Text>
                </TouchableOpacity>
            </View>

            {ticketTab === 'owned' ? (
                <View>
                    <Text style={styles.infoText}>Billets achetés et valides pour entrer aux événements.</Text>
                    {ownedTickets.length === 0 ? (
                        <Text style={styles.emptyText}>Vous n'avez acheté aucun billet.</Text>
                    ) : (
                        ownedTickets.map(t => (
                            <View key={t.id} style={{marginBottom: 8}}>
                                {renderTicketItem({item: t})}
                            </View>
                        ))
                    )}
                </View>
            ) : (
                <View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 16}}>
                        {(['ALL', 'AVAILABLE', 'SOLD'] as const).map(f => (
                            <TouchableOpacity 
                                key={f} 
                                onPress={() => setSellingFilter(f)}
                                style={[styles.filterChip, sellingFilter === f && styles.activeFilterChip]}
                            >
                                <Text style={[styles.filterText, sellingFilter === f && styles.activeFilterText]}>
                                    {f === 'ALL' ? 'Tout' : f === 'AVAILABLE' ? 'En vente' : 'Vendu'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {myTickets
                        .filter(t => sellingFilter === 'ALL' || t.status === sellingFilter)
                        .length === 0 ? (
                        <Text style={styles.emptyText}>Aucun ticket trouvé</Text>
                    ) : (
                        myTickets
                            .filter(t => sellingFilter === 'ALL' || t.status === sellingFilter)
                            .map(t => (
                            <View key={t.id} style={{marginBottom: 8}}>
                                {renderTicketItem({item: t})}
                            </View>
                        )))
                    }
                </View>
            )}
          </View>
        )}
      </ScrollView>

      <TicketDetailModal 
        visible={showTicketModal}
        ticket={selectedTicket}
        event={selectedEvent || undefined}
        onClose={() => setShowTicketModal(false)}
        hideSalesInfo={ticketTab === 'owned'} // Hide sales info if it's a ticket I own (bought)
      />

      <TransactionDetailModal
        visible={showTransactionModal}
        transaction={selectedTransaction}
        onClose={() => setShowTransactionModal(false)}
        mode="user"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  
  // Header
  headerContainer: { backgroundColor: '#fff', paddingBottom: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3, zIndex: 10 },
  headerContent: { padding: 20, paddingTop: 10 },
  avatarContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  avatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#dbeafe' },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  userInfo: { marginLeft: 16, flex: 1 },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  userEmail: { fontSize: 14, color: '#6b7280' },
  
  statsCard: { flexDirection: 'row', backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, justifyContent: 'space-around', alignItems: 'center' },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  statLabel: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  verticalDivider: { width: 1, height: 24, backgroundColor: '#e2e8f0' },
  
  // Tabs
  tabsContainer: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 16, marginTop: 16, marginHorizontal: 16, borderRadius: 12, padding: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: '#eff6ff' },
  tabText: { color: '#6b7280', fontSize: 12, fontWeight: '500' },
  activeTabText: { color: '#2563eb', fontWeight: 'bold' },
  
  content: { flex: 1, padding: 16 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  disabledInput: { backgroundColor: '#f9fafb', color: '#6b7280', borderColor: '#e5e7eb' },
  editButtons: { flexDirection: 'row', marginTop: 16 },
  
  // Wallet
  balanceCard: { backgroundColor: '#2563eb', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 24, shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  balanceLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginBottom: 8, fontWeight: '500' },
  balanceValue: { color: '#fff', fontSize: 36, fontWeight: 'bold' },
  balanceNote: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 8 },
  
  subHeader: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 12, marginTop: 8 },
  
  // Cards
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, borderWidth: 1, borderColor: '#f1f5f9' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardBody: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontWeight: '600', color: '#111827', fontSize: 15 },
  cardSubtitle: { color: '#6b7280', fontSize: 13 },
  cardDetail: { color: '#6b7280', fontSize: 13, marginLeft: 4 },
  priceText: { fontWeight: 'bold', color: '#059669', fontSize: 15 },
  
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  bgGreen: { backgroundColor: '#dcfce7' },
  bgBlue: { backgroundColor: '#dbeafe' },
  bgGray: { backgroundColor: '#f3f4f6' },
  badgeText: { fontSize: 11, fontWeight: 'bold' },
  
  emptyText: { textAlign: 'center', color: '#9ca3af', marginTop: 32, fontStyle: 'italic' },
  
  // Filters
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', marginRight: 8 },
  activeFilterChip: { backgroundColor: '#eff6ff', borderColor: '#2563eb' },
  filterText: { fontSize: 13, color: '#6b7280', fontWeight: '500' },
  activeFilterText: { color: '#2563eb', fontWeight: 'bold' },
  
  // SubTabs
  subTabs: { flexDirection: 'row', marginBottom: 20, backgroundColor: '#e5e7eb', padding: 4, borderRadius: 12 },
  subTab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  activeSubTab: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  subTabText: { fontSize: 14, color: '#6b7280', fontWeight: '500' },
  activeSubTabText: { color: '#111827', fontWeight: 'bold' },
  
  infoText: { fontSize: 14, color: '#6b7280', marginBottom: 20, fontStyle: 'italic', textAlign: 'center' }
});