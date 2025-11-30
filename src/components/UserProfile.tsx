import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Alert, FlatList, Dimensions, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User, Ticket, Transaction, Event } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useAuth } from '../contexts/AuthContext';
import { UserService } from '../services/UserService';
import { TransactionService } from '../services/TransactionService';
import { TicketService } from '../services/TicketService';
import { EventService } from '../services/EventService';
import { FavoriteService } from '../services/FavoriteService';
import { TicketDetailModal } from './TicketDetailModal';
import { TransactionDetailModal } from './TransactionDetailModal';

const { height } = Dimensions.get('window');
const isSmallDevice = height < 600; // Détection écran court (ex: Crosscall Core M5)

interface UserProfileProps {
  onViewEvent?: (eventId: string) => void;
  initialTab?: 'profile' | 'wallet' | 'tickets' | 'favorites';
  onContactSeller?: (sellerId: string) => void;
}

export function UserProfile({ onViewEvent, initialTab = 'profile', onContactSeller }: UserProfileProps) {
  const { user: authUser, logout } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'wallet' | 'tickets' | 'favorites'>(initialTab);
  const [ticketTab, setTicketTab] = useState<'owned' | 'selling'>('owned');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Data lists
  const [transactions, setTransactions] = useState<(Transaction & { isSale?: boolean })[]>([]);
  const [myTickets, setMyTickets] = useState<Ticket[]>([]); // Tickets I am selling
  const [ownedTickets, setOwnedTickets] = useState<Ticket[]>([]); // Tickets I bought
  const [favoriteEvents, setFavoriteEvents] = useState<Event[]>([]);

  // Filters
  const [transactionFilter, setTransactionFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELED' | 'REFUNDED'>('ALL');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<'PURCHASE' | 'SALE'>('PURCHASE');
  const [transactionSort, setTransactionSort] = useState<'DATE_DESC' | 'DATE_ASC' | 'PRICE_DESC' | 'PRICE_ASC'>('DATE_DESC');
  const [sellingFilter, setSellingFilter] = useState<'ALL' | 'AVAILABLE' | 'SOLD'>('ALL');
  const [showFilters, setShowFilters] = useState(false);

  // Stock Filters
  const [myTicketEvents, setMyTicketEvents] = useState<Map<string, Event>>(new Map());
  const [showStockFilters, setShowStockFilters] = useState(false);
  const [stockFilters, setStockFilters] = useState({
    eventName: '',
    minPrice: '',
    maxPrice: '',
    ticketType: '',
    dateSort: 'DESC' as 'ASC' | 'DESC'
  });

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
      const purchases = history.map(t => ({ ...t, isSale: false }));

      // 3. Récupérer les ventes réelles
      const salesHistory = await TransactionService.getMySales();
      const sales = salesHistory.map(t => ({ ...t, isSale: true }));

      // 4. Récupérer les tickets achetés (via les transactions)
      const ownedPromises = history
        .filter(tx => tx.status === 'COMPLETED')
        .map(tx => TicketService.getTicketById(tx.ticketId).catch(e => null));
      
      const owned = (await Promise.all(ownedPromises)).filter((t): t is Ticket => t !== null);
      const uniqueOwned = Array.from(new Map(owned.map(item => [item.id, item])).values());
      setOwnedTickets(uniqueOwned);

      // 5. Récupérer les tickets mis en vente par cet user
      const tickets = await TicketService.getMyTickets(authUser.id);
      const uniqueMyTickets = Array.from(new Map(tickets.map(item => [item.id, item])).values());
      setMyTickets(uniqueMyTickets);

      // Fetch events for my tickets to allow filtering
      const eventIds = new Set(uniqueMyTickets.map(t => t.eventId).filter(Boolean));
      const eventPromisesForMyTickets = Array.from(eventIds).map(eid => EventService.getEventById(eid).catch(() => null));
      const eventsForMyTickets = await Promise.all(eventPromisesForMyTickets);
      const eventMap = new Map<string, Event>();
      eventsForMyTickets.forEach(e => {
        if (e) eventMap.set(e.id, e);
      });
      setMyTicketEvents(eventMap);

      // 6. Récupérer les favoris
      try {
        const favorites = await FavoriteService.getFavorites(authUser.id);
        const eventPromises = favorites.map(fav => 
            EventService.getEventById(fav.eventId).catch(e => null)
        );
        const loadedEvents = await Promise.all(eventPromises);
        setFavoriteEvents(loadedEvents.filter((e): e is Event => e !== null));
      } catch (e) {
        console.error("Erreur chargement favoris", e);
      }

      // Fusionner et trier par date
      const allTransactions = [...purchases, ...sales].sort((a, b) => 
        new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
      );
      
      // Deduplicate
      const uniqueTransactions = Array.from(new Map(allTransactions.map(item => [item.id, item])).values());
      setTransactions(uniqueTransactions);

    } catch (error) {
      console.error("Erreur chargement profil", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      // 1. Update Profile Info (excluding password)
      // On exclut le mot de passe de l'objet envoyé à updateProfile
      const { password, ...profileData } = editForm;
      const updatedUser = await UserService.updateProfile(profileData);
      
      // 2. Update Password if provided
      if (password && password.trim() !== '') {
          try {
            await UserService.updatePassword(password);
          } catch (pwError) {
            console.error("Password update failed", pwError);
            Alert.alert("Attention", "Profil mis à jour, mais échec de la modification du mot de passe.");
            setUser(updatedUser);
            setIsEditing(false);
            return;
          }
      }

      setUser(updatedUser);
      setIsEditing(false);
      Alert.alert("Succès", "Profil mis à jour");
    } catch (error) {
      console.error("Profile update failed", error);
      Alert.alert("Erreur", "Impossible de mettre à jour le profil");
    }
  };

  const handleRemoveFavorite = async (eventId: string) => {
    if (!authUser) return;
    try {
        await FavoriteService.removeFavorite(authUser.id, eventId);
        setFavoriteEvents(prev => prev.filter(e => e.id !== eventId));
    } catch (error) {
        console.error("Error removing favorite", error);
        Alert.alert("Erreur", "Impossible de retirer le favori");
    }
  };

  const renderFavoriteItem = ({ item }: { item: Event }) => (
    <TouchableOpacity onPress={() => onViewEvent?.(item.id)} activeOpacity={0.7}>
      <View style={styles.card}>
        <View style={{flexDirection: 'row', gap: 12}}>
            <Image source={{ uri: item.imageUrl }} style={{width: 60, height: 60, borderRadius: 12, backgroundColor: '#f3f4f6'}} />
            <View style={{flex: 1, justifyContent: 'center'}}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSubtitle}>{new Date(item.startDate).toLocaleDateString()}</Text>
                <Text style={[styles.cardDetail, {marginLeft: 0}]}>{item.location}</Text>
            </View>
            <TouchableOpacity onPress={() => handleRemoveFavorite(item.id)} style={{justifyContent: 'center', padding: 8}}>
                <Ionicons name="heart" size={24} color="#ef4444" />
            </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

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

  const handleViewTicketFromTransaction = async (ticketId: string) => {
      setShowTransactionModal(false);
      setLoading(true);
      try {
          const ticket = await TicketService.getTicketById(ticketId);
          if (ticket) {
              handleTicketPress(ticket);
          } else {
              Alert.alert("Erreur", "Ticket introuvable");
          }
      } catch (error) {
          console.error("Error fetching ticket from transaction", error);
          Alert.alert("Erreur", "Impossible de charger le ticket");
      } finally {
          setLoading(false);
      }
  };

  const renderTicketItem = ({ item, mode }: { item: Ticket, mode: 'owned' | 'selling' }) => {
    const event = myTicketEvents.get(item.eventId);
    const displayTitle = event?.name || `Ticket #${item.id.substring(0, 8)}`;

    return (
    <TouchableOpacity onPress={() => handleTicketPress(item)} activeOpacity={0.7}>
      <View style={styles.card}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
            <View style={{flexDirection: 'row', gap: 12, alignItems: 'center'}}>
                <View style={{
                    width: 48, height: 48, borderRadius: 12, 
                    backgroundColor: mode === 'owned' ? '#eff6ff' : '#f0fdf4', 
                    justifyContent: 'center', alignItems: 'center'
                }}>
                    <Ionicons name="ticket" size={24} color={mode === 'owned' ? '#2563eb' : '#16a34a'} />
                </View>
                <View>
                    <Text style={styles.cardTitle}>{displayTitle}</Text>
                    <Text style={styles.cardSubtitle}>
                        {item.ticketTypeLabel || 'Standard'} • {item.salePrice}€
                    </Text>
                    {mode === 'selling' && item.creationDate && (
                        <Text style={[styles.cardDetail, {marginLeft: 0, fontSize: 11}]}>
                            Mis en vente le {new Date(item.creationDate).toLocaleDateString()}
                        </Text>
                    )}
                </View>
            </View>
            
            {mode === 'selling' && (
                <View style={[styles.badge, 
                    item.status === 'SOLD' ? styles.bgGreen : 
                    item.status === 'AVAILABLE' ? styles.bgBlue : styles.bgGray
                ]}>
                    <Text style={[styles.badgeText, 
                    item.status === 'SOLD' ? {color: '#065f46'} : 
                    item.status === 'AVAILABLE' ? {color: '#1e40af'} : {color: '#374151'}
                    ]}>{item.status}</Text>
                </View>
            )}
             {mode === 'owned' && (
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            )}
        </View>
      </View>
    </TouchableOpacity>
  );
  };

  const renderTransactionItem = ({ item }: { item: Transaction & { isSale?: boolean } }) => {
    const isSale = item.isSale;
    const amount = isSale ? item.vendorAmount : item.totalAmount;
    const color = isSale ? '#10b981' : '#ef4444';
    const icon = isSale ? 'arrow-up-circle' : 'arrow-down-circle';
    const label = isSale ? 'Vente' : 'Achat';
    const sign = isSale ? '+' : '-';

    return (
    <TouchableOpacity onPress={() => handleTransactionPress(item)} activeOpacity={0.7}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
            <View style={{
                width: 40, height: 40, borderRadius: 20, 
                backgroundColor: isSale ? '#dcfce7' : '#fee2e2',
                justifyContent: 'center', alignItems: 'center'
            }}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <View>
                <Text style={styles.cardTitle}>{label}</Text>
                <Text style={styles.cardSubtitle}>{new Date(item.transactionDate).toLocaleDateString()}</Text>
            </View>
          </View>
          <View style={{alignItems: 'flex-end'}}>
            <Text style={[styles.priceText, { color }]}>{sign}{amount.toFixed(2)}€</Text>
            <View style={[styles.badge, {
                marginTop: 4,
                backgroundColor: item.status === 'COMPLETED' ? '#f0fdf4' : '#fffbeb'
            }]}>
                <Text style={[styles.badgeText, {
                    fontSize: 10,
                    color: item.status === 'COMPLETED' ? '#15803d' : '#b45309'
                }]}>{item.status}</Text>
            </View>
          </View>
        </View>
        <Text style={[styles.cardDetail, {marginTop: 0}]}>ID: {item.id.substring(0, 8)}</Text>
      </View>
    </TouchableOpacity>
    );
  };

  if (loading) return <ActivityIndicator size="large" color="#2563eb" style={{marginTop: 50}} />;
  if (!user) return <Text>Utilisateur non trouvé</Text>;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{paddingBottom: 20}}>
        {/* Header Profil */}
        <View style={[styles.headerContainer, isSmallDevice && styles.headerContainerSmall]}>
            <View style={[styles.headerContent, isSmallDevice && styles.headerContentSmall]}>
                <View style={[styles.avatarContainer, isSmallDevice && styles.avatarContainerSmall]}>
                    <View style={[styles.avatar, isSmallDevice && styles.avatarSmall]}>
                        <Text style={[styles.avatarText, isSmallDevice && styles.avatarTextSmall]}>
                            {user.firstName[0]}{user.lastName[0]}
                        </Text>
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={[styles.userName, isSmallDevice && styles.userNameSmall]}>{user.firstName} {user.lastName}</Text>
                        <Text style={styles.userEmail}>{user.email}</Text>
                    </View>
                </View>
                
                <View style={[styles.statsCard, isSmallDevice && styles.statsCardSmall]}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, isSmallDevice && styles.statValueSmall]}>
                            {transactions.filter(t => !t.isSale).length}
                        </Text>
                        <Text style={styles.statLabel}>Achats</Text>
                    </View>
                    <View style={styles.verticalDivider} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, isSmallDevice && styles.statValueSmall]}>
                            {transactions.filter(t => t.isSale).length}
                        </Text>
                        <Text style={styles.statLabel}>Ventes</Text>
                    </View>
                    <View style={styles.verticalDivider} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, isSmallDevice && styles.statValueSmall]}>
                            {myTickets.filter(t => t.status === 'AVAILABLE').length}
                        </Text>
                        <Text style={styles.statLabel}>En vente</Text>
                    </View>
                </View>
            </View>
        </View>

        {/* Tabs */}
        <View style={[styles.tabsContainer, isSmallDevice && styles.tabsContainerSmall]}>
            <TouchableOpacity onPress={() => setActiveTab('profile')} style={[styles.tab, activeTab === 'profile' && styles.activeTab]}>
            <Ionicons name="person-outline" size={isSmallDevice ? 18 : 20} color={activeTab === 'profile' ? '#2563eb' : '#6b7280'} style={{marginBottom: 4}} />
            <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>Infos</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('wallet')} style={[styles.tab, activeTab === 'wallet' && styles.activeTab]}>
            <Ionicons name="wallet-outline" size={isSmallDevice ? 18 : 20} color={activeTab === 'wallet' ? '#2563eb' : '#6b7280'} style={{marginBottom: 4}} />
            <Text style={[styles.tabText, activeTab === 'wallet' && styles.activeTabText]}>Portefeuille</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('tickets')} style={[styles.tab, activeTab === 'tickets' && styles.activeTab]}>
            <Ionicons name="ticket-outline" size={isSmallDevice ? 18 : 20} color={activeTab === 'tickets' ? '#2563eb' : '#6b7280'} style={{marginBottom: 4}} />
            <Text style={[styles.tabText, activeTab === 'tickets' && styles.activeTabText]}>Tickets</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('favorites')} style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}>
            <Ionicons name="heart-outline" size={isSmallDevice ? 18 : 20} color={activeTab === 'favorites' ? '#2563eb' : '#6b7280'} style={{marginBottom: 4}} />
            <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>Favoris</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.content}>
            
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
                
                {/* Tabs Achats / Ventes */}
                <View style={styles.subTabs}>
                    <TouchableOpacity onPress={() => setTransactionTypeFilter('PURCHASE')} style={[styles.subTab, transactionTypeFilter === 'PURCHASE' && styles.activeSubTab]}>
                        <Text style={[styles.subTabText, transactionTypeFilter === 'PURCHASE' && styles.activeSubTabText]}>Mes Achats</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setTransactionTypeFilter('SALE')} style={[styles.subTab, transactionTypeFilter === 'SALE' && styles.activeSubTab]}>
                        <Text style={[styles.subTabText, transactionTypeFilter === 'SALE' && styles.activeSubTabText]}>Mes Ventes</Text>
                    </TouchableOpacity>
                </View>

                {/* Toggle Filters */}
                <TouchableOpacity 
                    style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12}} 
                    onPress={() => setShowFilters(!showFilters)}
                >
                    <Ionicons name={showFilters ? "chevron-down" : "chevron-forward"} size={20} color="#6b7280" />
                    <Text style={{color: '#6b7280', fontWeight: '600', marginLeft: 4}}>Filtres & Tri</Text>
                </TouchableOpacity>

                {showFilters && (
                    <View>
                        {/* Status Filter */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 8}}>
                            <Text style={{alignSelf:'center', marginRight: 8, fontSize: 12, color: '#6b7280'}}>Statut:</Text>
                            {(['ALL', 'COMPLETED', 'PENDING', 'FAILED', 'CANCELED', 'REFUNDED'] as const).map(f => (
                                <TouchableOpacity 
                                    key={f} 
                                    onPress={() => setTransactionFilter(f)}
                                    style={[styles.filterChip, transactionFilter === f && styles.activeFilterChip]}
                                >
                                    <Text style={[styles.filterText, transactionFilter === f && styles.activeFilterText]}>
                                        {f === 'ALL' ? 'Tout' : 
                                         f === 'COMPLETED' ? 'Validé' : 
                                         f === 'PENDING' ? 'En attente' :
                                         f === 'FAILED' ? 'Échoué' :
                                         f === 'CANCELED' ? 'Annulé' : 'Remboursé'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Sort Filter */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 8}}>
                            <Text style={{alignSelf:'center', marginRight: 8, fontSize: 12, color: '#6b7280'}}>Tri:</Text>
                            {[
                                { key: 'DATE_DESC', label: 'Date ↓' },
                                { key: 'DATE_ASC', label: 'Date ↑' },
                                { key: 'PRICE_DESC', label: 'Prix ↓' },
                                { key: 'PRICE_ASC', label: 'Prix ↑' },
                            ].map(s => (
                                <TouchableOpacity 
                                    key={s.key} 
                                    onPress={() => setTransactionSort(s.key as any)}
                                    style={[styles.filterChip, transactionSort === s.key && styles.activeFilterChip]}
                                >
                                    <Text style={[styles.filterText, transactionSort === s.key && styles.activeFilterText]}>
                                        {s.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}
            </View>

            {transactions
                .filter(t => {
                    if (transactionFilter !== 'ALL' && t.status !== transactionFilter) return false;
                    if (transactionTypeFilter === 'PURCHASE' && t.isSale) return false;
                    if (transactionTypeFilter === 'SALE' && !t.isSale) return false;
                    return true;
                })
                .sort((a, b) => {
                    const dateA = new Date(a.transactionDate).getTime();
                    const dateB = new Date(b.transactionDate).getTime();
                    const amountA = a.isSale ? a.vendorAmount : a.totalAmount;
                    const amountB = b.isSale ? b.vendorAmount : b.totalAmount;

                    switch (transactionSort) {
                        case 'DATE_ASC': return dateA - dateB;
                        case 'DATE_DESC': return dateB - dateA;
                        case 'PRICE_ASC': return amountA - amountB;
                        case 'PRICE_DESC': return amountB - amountA;
                        default: return 0;
                    }
                })
                .length === 0 ? (
                <Text style={styles.emptyText}>Aucune transaction trouvée</Text>
            ) : (
                transactions
                    .filter(t => {
                        if (transactionFilter !== 'ALL' && t.status !== transactionFilter) return false;
                        if (transactionTypeFilter === 'PURCHASE' && t.isSale) return false;
                        if (transactionTypeFilter === 'SALE' && !t.isSale) return false;
                        return true;
                    })
                    .sort((a, b) => {
                        const dateA = new Date(a.transactionDate).getTime();
                        const dateB = new Date(b.transactionDate).getTime();
                        const amountA = a.isSale ? a.vendorAmount : a.totalAmount;
                        const amountB = b.isSale ? b.vendorAmount : b.totalAmount;

                        switch (transactionSort) {
                            case 'DATE_ASC': return dateA - dateB;
                            case 'DATE_DESC': return dateB - dateA;
                            case 'PRICE_ASC': return amountA - amountB;
                            case 'PRICE_DESC': return amountB - amountA;
                            default: return 0;
                        }
                    })
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
                    <Text style={[styles.subTabText, ticketTab === 'selling' && styles.activeSubTabText]}>Stocks</Text>
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
                                {renderTicketItem({item: t, mode: 'owned'})}
                            </View>
                        ))
                    )}
                </View>
            ) : (
                <View>
                    {/* Filters Header */}
                    <TouchableOpacity 
                        style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12, justifyContent: 'space-between'}} 
                        onPress={() => setShowStockFilters(!showStockFilters)}
                    >
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Ionicons name={showStockFilters ? "chevron-down" : "chevron-forward"} size={20} color="#6b7280" />
                            <Text style={{color: '#6b7280', fontWeight: '600', marginLeft: 4}}>Filtres & Tri</Text>
                        </View>
                        {(stockFilters.eventName || stockFilters.minPrice || stockFilters.maxPrice || stockFilters.ticketType) && (
                             <TouchableOpacity onPress={() => setStockFilters({eventName: '', minPrice: '', maxPrice: '', ticketType: '', dateSort: 'DESC'})}>
                                <Text style={{color: '#2563eb', fontSize: 12}}>Réinitialiser</Text>
                             </TouchableOpacity>
                        )}
                    </TouchableOpacity>

                    {showStockFilters && (
                        <View style={{backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 16}}>
                            <Input 
                                label="Événement" 
                                placeholder="Rechercher un événement..."
                                value={stockFilters.eventName}
                                onChangeText={t => setStockFilters({...stockFilters, eventName: t})}
                                style={{marginBottom: 8}}
                            />
                            <View style={{flexDirection: 'row', gap: 8}}>
                                <View style={{flex: 1}}>
                                    <Input 
                                        label="Prix Min" 
                                        placeholder="0"
                                        keyboardType="numeric"
                                        value={stockFilters.minPrice}
                                        onChangeText={t => setStockFilters({...stockFilters, minPrice: t})}
                                    />
                                </View>
                                <View style={{flex: 1}}>
                                    <Input 
                                        label="Prix Max" 
                                        placeholder="1000"
                                        keyboardType="numeric"
                                        value={stockFilters.maxPrice}
                                        onChangeText={t => setStockFilters({...stockFilters, maxPrice: t})}
                                    />
                                </View>
                            </View>
                            <Input 
                                label="Type de ticket" 
                                placeholder="Standard, VIP..."
                                value={stockFilters.ticketType}
                                onChangeText={t => setStockFilters({...stockFilters, ticketType: t})}
                                style={{marginTop: 8}}
                            />
                            
                            <View style={{marginTop: 12}}>
                                <Text style={{fontSize: 12, color: '#6b7280', marginBottom: 8}}>Trier par date</Text>
                                <View style={{flexDirection: 'row', gap: 8}}>
                                    <TouchableOpacity 
                                        onPress={() => setStockFilters({...stockFilters, dateSort: 'DESC'})}
                                        style={[styles.filterChip, stockFilters.dateSort === 'DESC' && styles.activeFilterChip]}
                                    >
                                        <Text style={[styles.filterText, stockFilters.dateSort === 'DESC' && styles.activeFilterText]}>Plus récent</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        onPress={() => setStockFilters({...stockFilters, dateSort: 'ASC'})}
                                        style={[styles.filterChip, stockFilters.dateSort === 'ASC' && styles.activeFilterChip]}
                                    >
                                        <Text style={[styles.filterText, stockFilters.dateSort === 'ASC' && styles.activeFilterText]}>Plus ancien</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}

                    {myTickets
                        .filter(t => {
                            if (t.status !== 'AVAILABLE') return false;
                            if (stockFilters.eventName) {
                                const evt = myTicketEvents.get(t.eventId);
                                if (!evt?.name.toLowerCase().includes(stockFilters.eventName.toLowerCase())) return false;
                            }
                            if (stockFilters.minPrice && t.salePrice < parseFloat(stockFilters.minPrice)) return false;
                            if (stockFilters.maxPrice && t.salePrice > parseFloat(stockFilters.maxPrice)) return false;
                            if (stockFilters.ticketType && !t.ticketTypeLabel?.toLowerCase().includes(stockFilters.ticketType.toLowerCase())) return false;
                            return true;
                        })
                        .sort((a, b) => {
                            const evtA = myTicketEvents.get(a.eventId);
                            const evtB = myTicketEvents.get(b.eventId);
                            const dateA = evtA ? new Date(evtA.startDate).getTime() : (a.creationDate ? new Date(a.creationDate).getTime() : 0);
                            const dateB = evtB ? new Date(evtB.startDate).getTime() : (b.creationDate ? new Date(b.creationDate).getTime() : 0);
                            return stockFilters.dateSort === 'ASC' ? dateA - dateB : dateB - dateA;
                        })
                        .length === 0 ? (
                        <Text style={styles.emptyText}>Aucun ticket en vente trouvé</Text>
                    ) : (
                        myTickets
                            .filter(t => {
                                if (t.status !== 'AVAILABLE') return false;
                                if (stockFilters.eventName) {
                                    const evt = myTicketEvents.get(t.eventId);
                                    if (!evt?.name.toLowerCase().includes(stockFilters.eventName.toLowerCase())) return false;
                                }
                                if (stockFilters.minPrice && t.salePrice < parseFloat(stockFilters.minPrice)) return false;
                                if (stockFilters.maxPrice && t.salePrice > parseFloat(stockFilters.maxPrice)) return false;
                                if (stockFilters.ticketType && !t.ticketTypeLabel?.toLowerCase().includes(stockFilters.ticketType.toLowerCase())) return false;
                                return true;
                            })
                            .sort((a, b) => {
                                const evtA = myTicketEvents.get(a.eventId);
                                const evtB = myTicketEvents.get(b.eventId);
                                const dateA = evtA ? new Date(evtA.startDate).getTime() : (a.creationDate ? new Date(a.creationDate).getTime() : 0);
                                const dateB = evtB ? new Date(evtB.startDate).getTime() : (b.creationDate ? new Date(b.creationDate).getTime() : 0);
                                return stockFilters.dateSort === 'ASC' ? dateA - dateB : dateB - dateA;
                            })
                            .map(t => (
                            <View key={t.id} style={{marginBottom: 8}}>
                                {renderTicketItem({item: t, mode: 'selling'})}
                            </View>
                        )))
                    }
                </View>
            )}
          </View>
        )}

        {/* --- ONGLET FAVORIS --- */}
        {activeTab === 'favorites' && (
          <View style={styles.section}>
            <Text style={styles.infoText}>Vos événements favoris.</Text>
            {favoriteEvents.length === 0 ? (
                <View style={{alignItems: 'center', marginTop: 32}}>
                    <Ionicons name="heart-outline" size={48} color="#9ca3af" style={{marginBottom: 16}} />
                    <Text style={styles.emptyText}>Aucun favori pour le moment.</Text>
                    <Text style={[styles.infoText, {marginTop: 8}]}>Explorez les événements et ajoutez-les à vos favoris !</Text>
                </View>
            ) : (
                favoriteEvents.map(event => (
                    <View key={event.id} style={{marginBottom: 8}}>
                        {renderFavoriteItem({item: event})}
                    </View>
                ))
            )}
          </View>
        )}
        </View>
      </ScrollView>

      <TicketDetailModal 
        visible={showTicketModal}
        ticket={selectedTicket}
        event={selectedEvent || undefined}
        onClose={() => setShowTicketModal(false)}
        hideSalesInfo={ticketTab === 'owned'} // Hide sales info if it's a ticket I own (bought)
        onContactSeller={ticketTab === 'owned' ? onContactSeller : undefined}
      />

      <TransactionDetailModal
        visible={showTransactionModal}
        transaction={selectedTransaction}
        onClose={() => setShowTransactionModal(false)}
        mode="user"
        onViewTicket={handleViewTicketFromTransaction}
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
  
  infoText: { fontSize: 14, color: '#6b7280', marginBottom: 20, fontStyle: 'italic', textAlign: 'center' },

  // Small Device Styles
  headerContainerSmall: { paddingBottom: 12 },
  headerContentSmall: { padding: 16, paddingTop: 8 },
  avatarContainerSmall: { marginBottom: 12 },
  avatarSmall: { width: 50, height: 50, borderRadius: 25 },
  avatarTextSmall: { fontSize: 18 },
  userNameSmall: { fontSize: 18 },
  statsCardSmall: { padding: 12 },
  statValueSmall: { fontSize: 16 },
  tabsContainerSmall: { marginTop: 12, marginHorizontal: 12 }
});