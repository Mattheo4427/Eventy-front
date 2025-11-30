import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, ScrollView } from 'react-native';
import { Event, EventCategory, Ticket, User, Transaction, Report } from '../types';
import { AdminService } from '../services/AdminService';
import { EventService } from '../services/EventService';
import { CreateEventModal } from './CreateEventModal';
import { EditEventModal } from './EditEventModal';
import { CategoryModal } from './CategoryModal';
import { UserModal } from './UserModal';
import { TicketDetailModal } from './TicketDetailModal';
import { Ionicons } from '@expo/vector-icons';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { stat } from 'fs';
import { TransactionDetailModal } from './TransactionDetailModal';
import { ReportDetailModal } from './ReportDetailModal';

export function AdminPanel() {
  // Onglet actif (Ajout de 'transactions')
  const [activeTab, setActiveTab] = useState<'events' | 'tickets' | 'users' | 'categories' | 'transactions' | 'reports'>('events');
  
  // Données principales
  const [data, setData] = useState<any[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reports, setReports] = useState<Report[]>([]); // AJOUT

  // États des Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const [showTransModal, setShowTransModal] = useState(false);
  const [selectedTrans, setSelectedTrans] = useState<Transaction | null>(null);
  
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | null>(null);

  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // --- FILTRES TICKETS ---
  const [ticketSearch, setTicketSearch] = useState('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState<string>('ALL');
  const [ticketCategoryFilter, setTicketCategoryFilter] = useState<string>('ALL');
  const [ticketDateFilter, setTicketDateFilter] = useState('');

  // --- AJOUT : FILTRES TRANSACTIONS ---
  const [transSearch, setTransSearch] = useState('');
  const [transStatusFilter, setTransStatusFilter] = useState<string>('ALL');

  // --- AJOUT : FILTRES USERS ---
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');

  // --- AJOUT : FILTRES REPORTS ---
  const [reportStatusFilter, setReportStatusFilter] = useState<string>('ALL');
  const [reportTypeFilter, setReportTypeFilter] = useState<string>('ALL');
  const [reportDateFilter, setReportDateFilter] = useState('');

  // --- NOUVEAUX ETATS POUR LE TRI ET COLLAPSE ---
  const [showTicketFilters, setShowTicketFilters] = useState(false);
  const [ticketSort, setTicketSort] = useState<'DATE_DESC' | 'DATE_ASC' | 'PRICE_DESC' | 'PRICE_ASC'>('DATE_DESC');

  const [showTransFilters, setShowTransFilters] = useState(false);
  const [transSort, setTransSort] = useState<'DATE_DESC' | 'DATE_ASC' | 'PRICE_DESC' | 'PRICE_ASC'>('DATE_DESC');

  const [refreshing, setRefreshing] = useState(false);

  // --- CHARGEMENT DES DONNÉES ---
  const loadData = async () => {
    try {
      // Chargement des référentiels de base
      const [loadedEvents, loadedCats] = await Promise.all([
        EventService.getAllEvents(),
        EventService.getCategories()
      ]);
      
      setEvents(loadedEvents);
      const cleanCats = loadedCats.filter(c => c.categoryId !== 'all');
      setCategories(cleanCats);

      // Chargement contextuel
      if (activeTab === 'events') {
        setData(loadedEvents);
      } 
      else if (activeTab === 'categories') {
        setData(cleanCats);
      } 
      else if (activeTab === 'users') {
        const loadedUsers = await AdminService.getAllUsers();
        setUsers(loadedUsers); // Stockage pour usage ultérieur (résolution noms)
        setData(loadedUsers);
      } 
      else if (activeTab === 'tickets') {
        const loadedTickets = await AdminService.getAllTickets();
        setTickets(loadedTickets);
        // setData géré par useEffect
      }
      else if (activeTab === 'transactions') {
        // Pour les transactions, on a besoin des users et events pour afficher les détails
        const [loadedTrans, loadedUsers, loadedTickets] = await Promise.all([
            AdminService.getAllTransactions(),
            AdminService.getAllUsers(),
            AdminService.getAllTickets()
        ]);
        setTransactions(loadedTrans);
        setUsers(loadedUsers);
        setTickets(loadedTickets);
        // setData géré par useEffect
      }
      else if (activeTab === 'reports') {
        const [loadedReports, loadedUsers, loadedTickets, loadedTrans] = await Promise.all([
            AdminService.getAllReports(),
            AdminService.getAllUsers(),
            AdminService.getAllTickets(),
            AdminService.getAllTransactions()
        ]);
        setReports(loadedReports);
        setUsers(loadedUsers);
        setTickets(loadedTickets);
        setTransactions(loadedTrans);
        // setData géré par useEffect
      }
    } catch (e) {
      console.error("Erreur loadData:", e);
      setData([]);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  // --- FILTRAGE TICKETS ---
  useEffect(() => {
    if (activeTab === 'tickets') {
      let result = tickets;

      if (ticketSearch) {
        const lowerSearch = ticketSearch.toLowerCase();
        result = result.filter(t => {
          const event = events.find(e => e.id === t.eventId);
          return (
            t.id.toLowerCase().includes(lowerSearch) ||
            event?.name.toLowerCase().includes(lowerSearch) ||
            t.sellerName?.toLowerCase().includes(lowerSearch)
          );
        });
      }
      if (ticketStatusFilter !== 'ALL') {
        result = result.filter(t => t.status?.toUpperCase() === ticketStatusFilter);
      }
      if (ticketCategoryFilter !== 'ALL') {
        const eventIdsInCat = events.filter(e => e.categoryLabel === ticketCategoryFilter).map(e => e.id);
        result = result.filter(t => eventIdsInCat.includes(t.eventId));
      }
      if (ticketDateFilter) {
        result = result.filter(t => events.find(e => e.id === t.eventId)?.startDate.startsWith(ticketDateFilter));
      }
      
      // Tri
      result.sort((a, b) => {
          if (ticketSort === 'DATE_DESC' || ticketSort === 'DATE_ASC') {
              const dateA = a.creationDate ? new Date(a.creationDate).getTime() : 0;
              const dateB = b.creationDate ? new Date(b.creationDate).getTime() : 0;
              return ticketSort === 'DATE_DESC' ? dateB - dateA : dateA - dateB;
          } else {
              return ticketSort === 'PRICE_DESC' ? b.salePrice - a.salePrice : a.salePrice - b.salePrice;
          }
      });

      setData(result);
    }
  }, [tickets, ticketSearch, ticketStatusFilter, ticketCategoryFilter, ticketDateFilter, events, activeTab, ticketSort]);

  // --- AJOUT : FILTRAGE TRANSACTIONS ---
  useEffect(() => {
    if (activeTab === 'transactions') {
        let result = transactions;

        if (transSearch) {
            const lower = transSearch.toLowerCase();
            result = result.filter(t => 
                t.id.toLowerCase().includes(lower) ||
                t.buyerId.toLowerCase().includes(lower)
            );
        }

        if (transStatusFilter !== 'ALL') {
            result = result.filter(t => t.status.toUpperCase() === transStatusFilter);
        }
        
        // Tri
        result.sort((a, b) => {
            if (transSort === 'DATE_DESC' || transSort === 'DATE_ASC') {
                const dateA = a.transactionDate ? new Date(a.transactionDate).getTime() : 0;
                const dateB = b.transactionDate ? new Date(b.transactionDate).getTime() : 0;
                return transSort === 'DATE_DESC' ? dateB - dateA : dateA - dateB;
            } else {
                return transSort === 'PRICE_DESC' ? b.totalAmount - a.totalAmount : a.totalAmount - b.totalAmount;
            }
        });

        setData(result);
    }
  }, [transactions, transSearch, transStatusFilter, activeTab, transSort]);

  // --- AJOUT : FILTRAGE USERS ---
  useEffect(() => {
    if (activeTab === 'users') {
      let result = users;

      if (userSearch) {
        const lower = userSearch.toLowerCase();
        result = result.filter(u => 
          (u.firstName && u.firstName.toLowerCase().includes(lower)) || 
          (u.lastName && u.lastName.toLowerCase().includes(lower)) || 
          (u.email && u.email.toLowerCase().includes(lower))
        );
      }

      if (userStatusFilter !== 'ALL') {
        result = result.filter(u => u.status === userStatusFilter);
      }

      setData(result);
    }
  }, [users, userSearch, userStatusFilter, activeTab]);

  // --- AJOUT : FILTRAGE REPORTS ---
  useEffect(() => {
    if (activeTab === 'reports') {
      let result = reports;
      if (reportStatusFilter !== 'ALL') {
        result = result.filter(r => r.status === reportStatusFilter);
      }
      if (reportTypeFilter !== 'ALL') {
        result = result.filter(r => r.reportType === reportTypeFilter);
      }
      if (reportDateFilter) {
        // Filtrage simple par date (YYYY-MM-DD)
        result = result.filter(r => r.reportDate.startsWith(reportDateFilter));
      }
      // Tri par date décroissante
      result.sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime());
      setData(result);
    }
  }, [reports, reportStatusFilter, reportTypeFilter, reportDateFilter, activeTab]);


  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // --- HANDLERS ACTIONS ---
  const handleDeleteEvent = (id: string) => {
    Alert.alert("Supprimer", "Êtes-vous sûr ?", [{ text: "Annuler" }, { text: "Supprimer", style: 'destructive', onPress: async () => { await AdminService.deleteEvent(id); loadData(); }}]);
  };
  const handleEditEvent = (event: Event) => { setSelectedEvent(event); setShowEditModal(true); };

  const handleEditCategory = (cat: EventCategory) => { setSelectedCategory(cat); setShowCategoryModal(true); };
  const handleDeleteCategory = (id: string) => { 
      Alert.alert("Supprimer", "Attention: Cela peut impacter des événements.", [{ text: "Annuler" }, { text: "Supprimer", style: 'destructive', onPress: async () => { await AdminService.deleteCategory(id); loadData(); }}]);
  };
  const openCreateCategory = () => { setSelectedCategory(null); setShowCategoryModal(true); };

  const handleEditUser = (user: User) => { setSelectedUser(user); setShowUserModal(true); };
  const openCreateUser = () => { setSelectedUser(null); setShowUserModal(true); };
  const handleSuspendUser = (user: User) => { 
      Alert.alert("Suspendre", `Suspendre ${user.firstName} ${user.lastName} ?`, [{ text: "Non" }, { text: "Oui", onPress: async () => { await AdminService.suspendUser(user.id); loadData(); }}]);
  };
  const handleDeleteUser = (user: User) => {
    Alert.alert("Supprimer", "Action irréversible.", [{ text: "Annuler" }, { text: "Supprimer", style: 'destructive', onPress: async () => { await AdminService.deleteUser(user.id); loadData(); }}]);
  };

  // USERS : Gestion Suspension / Réactivation
  const handleToggleUserStatus = (user: User) => {
    const isSuspended = user.status === 'SUSPENDED';
    const actionLabel = isSuspended ? "Réactiver" : "Suspendre";
    
    Alert.alert(
      `${actionLabel} l'utilisateur`,
      `Voulez-vous vraiment ${actionLabel.toLowerCase()} ${user.firstName} ${user.lastName} ?`,
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: actionLabel, 
          style: isSuspended ? "default" : "destructive", // Rouge pour suspendre, Bleu pour réactiver
          onPress: async () => {
            try {
              if (isSuspended) {
                 await AdminService.reactivateUser(user.id);
              } else {
                 await AdminService.suspendUser(user.id);
              }
              loadData();
              Alert.alert("Succès", `Utilisateur ${isSuspended ? 'réactivé' : 'suspendu'}.`);
            } catch (error) {
              Alert.alert("Erreur", "Une erreur est survenue.");
            }
          }
        }
      ]
    );
  };

  const openTransactionDetail = (trans: Transaction) => {
      if (showReportModal) {
          setShowReportModal(false);
          setTimeout(() => {
              setSelectedTrans(trans);
              setShowTransModal(true);
          }, 500);
      } else {
          setSelectedTrans(trans);
          setShowTransModal(true);
      }
  };

  const openTicketDetail = (ticket: Ticket) => {
      if (showReportModal) {
          setShowReportModal(false);
          setTimeout(() => {
              setSelectedTicket(ticket);
              setShowTicketModal(true);
          }, 500);
      } else {
          setSelectedTicket(ticket);
          setShowTicketModal(true);
      }
  };

  const openReportDetail = (report: Report) => {
      setSelectedReport(report);
      setShowReportModal(true);
  };

  const handleUpdateReportStatus = (report: Report, newStatus: string) => {
    Alert.alert(
      "Mettre à jour le statut",
      `Passer le signalement en ${newStatus} ?`,
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Confirmer", 
          onPress: async () => {
            try {
              await AdminService.updateReportStatus(report.id, newStatus, "Updated via Admin Panel");
              loadData();
            } catch (e) {
              Alert.alert("Erreur", "Impossible de mettre à jour le statut");
            }
          }
        }
      ]
    );
  };

  const handleViewTicketFromTransaction = (ticketId: string) => {
      setShowTransModal(false);
      setTimeout(() => {
          const ticket = tickets.find(t => t.id === ticketId);
          if (ticket) {
              openTicketDetail(ticket);
          } else {
              Alert.alert("Erreur", "Ticket introuvable dans les données chargées.");
          }
      }, 500);
  };


  // --- RENDU ITEMS ---

  const renderTicketItem = (ticket: Ticket) => {
    const event = events.find(e => e.id === ticket.eventId);
    const statusColors: Record<string, string> = { 
      'AVAILABLE': '#10b981', 
      'SOLD': '#374151',      // Gris foncé pour vendu
      'RESERVED': '#8b5cf6',  // Violet pour réservé
      'PENDING': '#f59e0b', 
      'CANCELED': '#ef4444' 
    };
    const statusKey = ticket.status?.toUpperCase() || 'AVAILABLE';
    const statusColor = statusColors[statusKey] || '#6b7280';

    return (
      <TouchableOpacity 
        style={[styles.ticketCard, { borderLeftColor: statusColor }]}
        onPress={() => openTicketDetail(ticket)}
        activeOpacity={0.7}
      >
        <View style={styles.ticketHeader}>
          <View style={{flex: 1}}>
            <Text style={styles.ticketEventName} numberOfLines={1}>{event ? event.name : 'Événement inconnu'}</Text>
            <Text style={styles.ticketDate}>{event ? new Date(event.startDate).toLocaleDateString() : '-'} • {event?.location}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}> 
            <Text style={[styles.statusText, { color: statusColor }]}>{statusKey}</Text>
          </View>
        </View>
        <View style={styles.ticketDetails}>
          <View style={styles.ticketDetailItem}><Text style={styles.detailLabel}>Section</Text><Text style={styles.detailValue}>{ticket.section || '-'}</Text></View>
          <View style={styles.ticketDetailItem}><Text style={styles.detailLabel}>Rang</Text><Text style={styles.detailValue}>{ticket.row || '-'}</Text></View>
          <View style={styles.ticketDetailItem}><Text style={styles.detailLabel}>Siège</Text><Text style={styles.detailValue}>{ticket.seat || '-'}</Text></View>
          <View style={styles.ticketDetailItem}><Text style={styles.detailLabel}>Prix</Text><Text style={styles.priceValue}>{ticket.salePrice || ticket.salePrice} €</Text></View>
        </View>
        <View style={styles.ticketFooter}>
          <View style={styles.sellerInfo}>
            <Ionicons name="person-circle-outline" size={16} color="#6b7280" />
            <Text style={styles.sellerName}>{ticket.sellerName || 'Vendeur inconnu'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
        </View>
      </TouchableOpacity>
    );
  };

// --- Rendu Transaction (CORRIGÉ) ---
  const renderTransactionItem = (trans: Transaction) => {
      // Trouver l'utilisateur acheteur
      const buyer = users.find(u => u.id === trans.buyerId);
      
      const statusColors: Record<string, string> = {
          'COMPLETED': '#10b981', 'PENDING': '#f59e0b', 'FAILED': '#ef4444', 'REFUNDED': '#6366f1'
      };
      const statusColor = statusColors[trans.status?.toUpperCase()] || '#6b7280';

      // SÉCURISATION : Gestion des dates et ID
      const dateStr = trans.transactionDate ? new Date(trans.transactionDate).toLocaleDateString() : 'Date inconnue';
      const timeStr = trans.transactionDate ? new Date(trans.transactionDate).toLocaleTimeString() : '';
      
      // CRASH FIX : Utilisation de (trans.buyerId || '') avant substring
      const buyerDisplay = buyer ? buyer.firstName : (trans.buyerId ? trans.buyerId.substring(0, 8) : 'Inconnu');

      return (
          <View style={styles.transCard}>
              <View style={styles.transRow}>
                  <View style={styles.transIconContainer}>
                      <Ionicons name={trans.status === 'COMPLETED' ? "checkmark-circle" : "time"} size={24} color={statusColor} />
                  </View>
                  <View style={{flex: 1, marginLeft: 12}}>
                      <Text style={styles.transTitle}>Achat de Billet</Text>
                      <Text style={styles.transSubtitle}>
                          {dateStr} à {timeStr}
                      </Text>
                      <Text style={styles.transBuyer}>
                          Acheteur: <Text style={{fontWeight: 'bold'}}>{buyerDisplay}</Text>
                      </Text>
                  </View>
                  <View style={{alignItems: 'flex-end'}}>
                      {/* Utilisation de totalAmount au lieu de price */}
                      <Text style={[styles.transAmount, {color: statusColor}]}>
                          {trans.totalAmount ? trans.totalAmount.toFixed(2) : '0.00'} €
                      </Text>
                      <View style={[styles.statusBadge, {backgroundColor: statusColor + '15', marginTop: 4}]}>
                          <Text style={[styles.statusText, {color: statusColor, fontSize: 9}]}>
                              {trans.status}
                          </Text>
                      </View>
                  </View>
              </View>
          </View>
      );
  };

  const renderItem = ({ item }: { item: any }) => {
    if (activeTab === 'events') {
      return (
        <View style={styles.cardRow}>
          <View style={styles.iconBox}>
             <Ionicons name="calendar-outline" size={24} color="#2563eb" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSubtitle}>{item.location} • {item.categoryLabel}</Text>
            <View style={styles.miniBadge}>
                <Text style={styles.miniBadgeText}>{item.status}</Text>
            </View>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => handleEditEvent(item)} style={styles.actionButton}><Ionicons name="pencil" size={20} color="#2563eb" /></TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteEvent(item.id)} style={styles.actionButton}><Ionicons name="trash" size={20} color="#ef4444" /></TouchableOpacity>
          </View>
        </View>
      );
    }
    if (activeTab === 'categories') {
      const catId = item.categoryId || ''; 
      return (
        <View style={styles.cardRow}>
          <View style={[styles.iconBox, { backgroundColor: '#f3f4f6' }]}>
             <Ionicons name="pricetag-outline" size={24} color="#4b5563" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{item.label}</Text>
            <Text style={styles.cardSubtitle}>ID: {catId.length > 8 ? catId.substring(0, 8) + '...' : catId}</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => handleEditCategory(item)} style={styles.actionButton}><Ionicons name="pencil" size={20} color="#2563eb" /></TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteCategory(item.categoryId)} style={styles.actionButton}><Ionicons name="trash" size={20} color="#ef4444" /></TouchableOpacity>
          </View>
        </View>
      );
    }
    if (activeTab === 'users') {
      const isSuspended = item.status === 'SUSPENDED';
      const isActive = item.status === 'ACTIVE';
      const initials = (item.firstName?.[0] || '') + (item.lastName?.[0] || '');
      const isAdmin = item.role === 'ADMIN';

      return (
        <View style={styles.cardRow}>
          <View style={[styles.avatarBox, isAdmin ? styles.avatarAdmin : styles.avatarUser]}>
            <Text style={[styles.avatarText, isAdmin ? styles.textAdmin : styles.textUser]}>{initials.toUpperCase()}</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                <Text style={styles.cardTitle}>{item.firstName} {item.lastName}</Text>
                {isAdmin && <Ionicons name="shield-checkmark" size={14} color="#dc2626" />}
            </View>
            <Text style={styles.cardSubtitle}>{item.email}</Text>
            <View style={{ flexDirection: 'row', marginTop: 6, gap: 6 }}>
              <View style={[styles.badge, item.status === 'ACTIVE' ? { backgroundColor: '#d1fae5' } : item.status === 'INACTIVE' ? { backgroundColor: '#fee2e2' } : { backgroundColor: '#fef3c7' }]}>
                <Text style={[styles.badgeText, item.status === 'ACTIVE' ? { color: '#059669' } : item.status === 'INACTIVE' ? { color: '#dc2626' } : item.status === 'SUSPENDED' ? { color: '#b45309' } : {}]}>{item.status}</Text>
              </View>
            </View>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => handleEditUser(item)} style={styles.actionButton}><Ionicons name="pencil" size={20} color="#2563eb" /></TouchableOpacity>
            <TouchableOpacity onPress={() => handleToggleUserStatus(item)} style={styles.actionButton}>
                          <Ionicons 
                            name={isSuspended ? "play-outline" : "ban-outline"} 
                            size={20} 
                            color={isSuspended ? "#10b981" : "#f59e0b"} 
                          />
            </TouchableOpacity>            
            <TouchableOpacity onPress={() => handleDeleteUser(item)} style={styles.actionButton}><Ionicons name="trash" size={20} color="#ef4444" /></TouchableOpacity>
          </View>
        </View>
      );
    }
    if (activeTab === 'tickets') {
      return renderTicketItem(item);
    }
    // AJOUT
    if (activeTab === 'transactions') {
        const statusColors: any = { 'COMPLETED': '#10b981', 'PENDING': '#f59e0b', 'FAILED': '#ef4444', 'REFUNDED': '#6366f1' };
        const color = statusColors[item.status] || '#6b7280';
        const buyer = users.find(u => u.id === item.buyerId);

        const getIconName = (status: string) => {
            switch (status) {
                case 'COMPLETED': return 'checkmark';
                case 'FAILED': return 'alert-circle';
                case 'REFUNDED': return 'arrow-undo';
                case 'PENDING': return 'time';
                default: return 'help-circle';
            }
        };

        return (
          <TouchableOpacity 
            style={[styles.transCard, { borderLeftColor: color }]} 
            onPress={() => openTransactionDetail(item)}
            activeOpacity={0.7}
          >
             <View style={styles.transRow}>
                 <View style={[styles.transIconContainer, { backgroundColor: color + '15' }]}>
                     <Ionicons name={getIconName(item.status)} size={20} color={color} />
                 </View>
                 <View style={{flex: 1, marginLeft: 12}}>
                     <Text style={styles.transTitle}>Transaction</Text>
                     <Text style={styles.transSubtitle}>{new Date(item.transactionDate).toLocaleDateString()}</Text>
                     <Text style={styles.transBuyer}>Acheteur: {buyer ? buyer.firstName : '...'}</Text>
                 </View>
                 <View style={{alignItems: 'flex-end'}}>
                     <Text style={[styles.transAmount, { color: color }]}>{item.totalAmount ? item.totalAmount.toFixed(2) : ''} €</Text>
                     <Text style={[styles.statusTextMini, { color: color }]}>{item.status}</Text>
                 </View>
                 <Ionicons name="chevron-forward" size={16} color="#9ca3af" style={{marginLeft: 8}} />
             </View>
          </TouchableOpacity>
        );
    }
    if (activeTab === 'reports') {
      const statusColors: any = { 'PENDING': '#f59e0b', 'UNDER_INVESTIGATION': '#3b82f6', 'RESOLVED': '#10b981', 'DISMISSED': '#6b7280' };
      const color = statusColors[item.status] || '#6b7280';
      
      return (
        <TouchableOpacity 
            style={[styles.cardRow, { flexDirection: 'column', alignItems: 'stretch', padding: 12 }]}
            onPress={() => openReportDetail(item)}
            activeOpacity={0.7}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'flex-start' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, marginRight: 8 }}>
              <View style={[styles.iconBox, { backgroundColor: '#fee2e2', width: 40, height: 40 }]}>
                <Ionicons name="warning" size={20} color="#ef4444" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { fontSize: 14 }]} numberOfLines={1}>{item.reportType}</Text>
                <Text style={[styles.cardSubtitle, { fontSize: 11 }]}>{new Date(item.reportDate).toLocaleDateString()}</Text>
              </View>
            </View>
            <View style={[styles.badge, { backgroundColor: color + '20', alignSelf: 'flex-start' }]}>
              <Text style={[styles.badgeText, { color: color, fontSize: 9 }]}>{item.status}</Text>
            </View>
          </View>
          
          <Text style={{ fontSize: 13, color: '#374151', marginBottom: 8, fontStyle: 'italic' }} numberOfLines={2}>"{item.reason}"</Text>
          
          {item.description ? (
             <Text style={{ fontSize: 12, color: '#4b5563', marginBottom: 8 }} numberOfLines={2}>{item.description}</Text>
          ) : null}

          {item.evidence ? (
             <Text style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }} numberOfLines={1}>Preuve: {item.evidence}</Text>
          ) : null}

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 8, borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 8 }}>
            {item.status !== 'RESOLVED' && item.status !== 'DISMISSED' && (
              <>
                {item.status === 'PENDING' && (
                  <TouchableOpacity onPress={() => handleUpdateReportStatus(item, 'UNDER_INVESTIGATION')} style={[styles.actionButton, { backgroundColor: '#eff6ff', paddingVertical: 6, paddingHorizontal: 10 }]}>
                    <Text style={{ color: '#2563eb', fontSize: 11, fontWeight: '600' }}>Investiguer</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => handleUpdateReportStatus(item, 'DISMISSED')} style={[styles.actionButton, { backgroundColor: '#f3f4f6', paddingVertical: 6, paddingHorizontal: 10 }]}>
                  <Text style={{ color: '#4b5563', fontSize: 11, fontWeight: '600' }}>Rejeter</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleUpdateReportStatus(item, 'RESOLVED')} style={[styles.actionButton, { backgroundColor: '#ecfdf5', paddingVertical: 6, paddingHorizontal: 10 }]}>
                  <Text style={{ color: '#059669', fontSize: 11, fontWeight: '600' }}>Résoudre</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id || item.categoryId || item.transactionId || Math.random().toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <Text style={styles.headerTitle}>Administration</Text>
            
            {/* Onglets */}
            <View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer} style={styles.tabsScrollView}>
                {(['events', 'categories', 'tickets', 'users', 'transactions', 'reports'] as const).map(tab => (
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

            {/* Zone Filtres (Tickets) */}
            {activeTab === 'tickets' && (
              <View style={styles.filterSection}>
                <View style={{flexDirection: 'row', gap: 8, marginBottom: 8}}>
                  <Input placeholder="Rechercher..." value={ticketSearch} onChangeText={setTicketSearch} style={[styles.searchBar, {flex: 1, marginBottom: 0}]} />
                  <TouchableOpacity onPress={() => setShowTicketFilters(!showTicketFilters)} style={styles.filterToggleButton}>
                      <Ionicons name={showTicketFilters ? "chevron-up" : "options"} size={20} color="#4b5563" />
                  </TouchableOpacity>
                </View>
                
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
                  {['ALL', 'AVAILABLE', 'SOLD', 'RESERVED', 'CANCELED'].map((status) => (
                      <TouchableOpacity key={status} style={[styles.chip, ticketStatusFilter === status && styles.chipActive]} onPress={() => setTicketStatusFilter(status)}>
                          <Text style={[styles.chipText, ticketStatusFilter === status && styles.chipTextActive]}>{status}</Text>
                      </TouchableOpacity>
                  ))}
                </ScrollView>

                {showTicketFilters && (
                    <View style={styles.advancedFilters}>
                        <Text style={styles.filterLabel}>Trier par :</Text>
                        <View style={styles.sortRow}>
                            <TouchableOpacity onPress={() => setTicketSort('DATE_DESC')} style={[styles.sortChip, ticketSort === 'DATE_DESC' && styles.sortChipActive]}><Text style={[styles.sortChipText, ticketSort === 'DATE_DESC' && styles.sortChipTextActive]}>Date ↓</Text></TouchableOpacity>
                            <TouchableOpacity onPress={() => setTicketSort('DATE_ASC')} style={[styles.sortChip, ticketSort === 'DATE_ASC' && styles.sortChipActive]}><Text style={[styles.sortChipText, ticketSort === 'DATE_ASC' && styles.sortChipTextActive]}>Date ↑</Text></TouchableOpacity>
                            <TouchableOpacity onPress={() => setTicketSort('PRICE_DESC')} style={[styles.sortChip, ticketSort === 'PRICE_DESC' && styles.sortChipActive]}><Text style={[styles.sortChipText, ticketSort === 'PRICE_DESC' && styles.sortChipTextActive]}>Prix ↓</Text></TouchableOpacity>
                            <TouchableOpacity onPress={() => setTicketSort('PRICE_ASC')} style={[styles.sortChip, ticketSort === 'PRICE_ASC' && styles.sortChipActive]}><Text style={[styles.sortChipText, ticketSort === 'PRICE_ASC' && styles.sortChipTextActive]}>Prix ↑</Text></TouchableOpacity>
                        </View>
                    </View>
                )}
              </View>
            )}

            {/* Zone Filtres (Transactions) */}
            {activeTab === 'transactions' && (
              <View style={styles.filterSection}>
                <View style={{flexDirection: 'row', gap: 8, marginBottom: 8}}>
                  <Input placeholder="Rechercher ID ou Acheteur..." value={transSearch} onChangeText={setTransSearch} style={[styles.searchBar, {flex: 1, marginBottom: 0}]} />
                  <TouchableOpacity onPress={() => setShowTransFilters(!showTransFilters)} style={styles.filterToggleButton}>
                      <Ionicons name={showTransFilters ? "chevron-up" : "options"} size={20} color="#4b5563" />
                  </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
                  {['ALL', 'COMPLETED', 'PENDING', 'FAILED', 'REFUNDED', 'CANCELED'].map((status) => (
                      <TouchableOpacity key={status} style={[styles.chip, transStatusFilter === status && styles.chipActive]} onPress={() => setTransStatusFilter(status)}>
                          <Text style={[styles.chipText, transStatusFilter === status && styles.chipTextActive]}>{status}</Text>
                      </TouchableOpacity>
                  ))}
                </ScrollView>

                {showTransFilters && (
                    <View style={styles.advancedFilters}>
                        <Text style={styles.filterLabel}>Trier par :</Text>
                        <View style={styles.sortRow}>
                            <TouchableOpacity onPress={() => setTransSort('DATE_DESC')} style={[styles.sortChip, transSort === 'DATE_DESC' && styles.sortChipActive]}><Text style={[styles.sortChipText, transSort === 'DATE_DESC' && styles.sortChipTextActive]}>Date ↓</Text></TouchableOpacity>
                            <TouchableOpacity onPress={() => setTransSort('DATE_ASC')} style={[styles.sortChip, transSort === 'DATE_ASC' && styles.sortChipActive]}><Text style={[styles.sortChipText, transSort === 'DATE_ASC' && styles.sortChipTextActive]}>Date ↑</Text></TouchableOpacity>
                            <TouchableOpacity onPress={() => setTransSort('PRICE_DESC')} style={[styles.sortChip, transSort === 'PRICE_DESC' && styles.sortChipActive]}><Text style={[styles.sortChipText, transSort === 'PRICE_DESC' && styles.sortChipTextActive]}>Prix ↓</Text></TouchableOpacity>
                            <TouchableOpacity onPress={() => setTransSort('PRICE_ASC')} style={[styles.sortChip, transSort === 'PRICE_ASC' && styles.sortChipActive]}><Text style={[styles.sortChipText, transSort === 'PRICE_ASC' && styles.sortChipTextActive]}>Prix ↑</Text></TouchableOpacity>
                        </View>
                    </View>
                )}
              </View>
            )}

            {/* Zone Filtres (Users) */}
            {activeTab === 'users' && (
              <View style={styles.filterSection}>
                <Input placeholder="Rechercher un utilisateur..." value={userSearch} onChangeText={setUserSearch} style={styles.searchBar} />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
                  {['ALL', 'ACTIVE', 'SUSPENDED'].map((status) => (
                      <TouchableOpacity key={status} style={[styles.chip, userStatusFilter === status && styles.chipActive]} onPress={() => setUserStatusFilter(status as any)}>
                          <Text style={[styles.chipText, userStatusFilter === status && styles.chipTextActive]}>{status}</Text>
                      </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Zone Filtres (Reports) */}
            {activeTab === 'reports' && (
              <View style={styles.filterSection}>
                <View style={{flexDirection: 'row', gap: 8, marginBottom: 8}}>
                    <Input 
                        placeholder="Date (YYYY-MM-DD)..." 
                        value={reportDateFilter} 
                        onChangeText={setReportDateFilter} 
                        style={[styles.searchBar, {flex: 1, marginBottom: 0}]} 
                    />
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
                  {['ALL', 'PENDING', 'UNDER_INVESTIGATION', 'RESOLVED', 'DISMISSED'].map((status) => (
                      <TouchableOpacity key={status} style={[styles.chip, reportStatusFilter === status && styles.chipActive]} onPress={() => setReportStatusFilter(status)}>
                          <Text style={[styles.chipText, reportStatusFilter === status && styles.chipTextActive]}>{status}</Text>
                      </TouchableOpacity>
                  ))}
                </ScrollView>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.chipsContainer, {marginTop: 4}]}>
                  {['ALL', 'SPAM', 'FRAUD', 'HARASSMENT', 'INAPPROPRIATE_CONTENT', 'OTHER'].map((type) => (
                      <TouchableOpacity key={type} style={[styles.chip, reportTypeFilter === type && styles.chipActive]} onPress={() => setReportTypeFilter(type)}>
                          <Text style={[styles.chipText, reportTypeFilter === type && styles.chipTextActive]}>{type}</Text>
                      </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Boutons d'ajout */}
            {activeTab === 'events' && <Button title="+ Événement" onPress={() => setShowCreateModal(true)} style={styles.addButton} />}
            {activeTab === 'categories' && <Button title="+ Catégorie" onPress={openCreateCategory} style={styles.addButton} />}
            {activeTab === 'users' && <Button title="+ Utilisateur" onPress={openCreateUser} style={styles.addButton} />}
          </View>
        }
        ListEmptyComponent={<Text style={styles.emptyText}>Aucune donnée trouvée</Text>}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />

      {/* Modals */}
      <CreateEventModal visible={showCreateModal} onClose={() => setShowCreateModal(false)} onSuccess={loadData} />
      <EditEventModal visible={showEditModal} event={selectedEvent} onClose={() => { setShowEditModal(false); setSelectedEvent(null); }} onSuccess={loadData} />
      <CategoryModal visible={showCategoryModal} categoryToEdit={selectedCategory} onClose={() => { setShowCategoryModal(false); setSelectedCategory(null); }} onSuccess={loadData} />
      <UserModal visible={showUserModal} userToEdit={selectedUser} onClose={() => { setShowUserModal(false); setSelectedUser(null); }} onSuccess={loadData} />
      <TransactionDetailModal 
        visible={showTransModal}
        transaction={selectedTrans}
        buyer={selectedTrans ? users.find(u => u.id === selectedTrans.buyerId) : undefined}
        seller={selectedTrans ? (() => {
            const ticket = tickets.find(t => t.id === selectedTrans.ticketId);
            return ticket ? users.find(u => u.id === ticket.vendorId) : undefined;
        })() : undefined}
        onClose={() => setShowTransModal(false)}
        onSuccess={loadData}
        onViewTicket={handleViewTicketFromTransaction}
      />
      <TicketDetailModal 
        visible={showTicketModal}
        ticket={selectedTicket}
        event={selectedTicket ? events.find(e => e.id === selectedTicket.eventId) : undefined}
        onClose={() => setShowTicketModal(false)}
        isAdmin={true}
        onUpdate={loadData}
      />
      <ReportDetailModal 
        visible={showReportModal}
        report={selectedReport}
        reporter={selectedReport ? users.find(u => u.id === selectedReport.reporterId) : undefined}
        users={users}
        tickets={tickets}
        transactions={transactions}
        onOpenTicket={openTicketDetail}
        onOpenTransaction={openTransactionDetail}
        onOpenUser={handleEditUser}
        onClose={() => setShowReportModal(false)}
        onUpdateStatus={(report, status) => {
            // On utilise la fonction existante mais on doit l'adapter car elle attend un event onPress
            // Ici on appelle directement le service
            AdminService.updateReportStatus(report.id, status, "Updated via Detail Modal")
                .then(() => loadData())
                .catch(() => Alert.alert("Erreur", "Impossible de mettre à jour le statut"));
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9fafb' },
  headerTitle: { fontSize: 30, fontWeight: '800', marginBottom: 18, color: '#0f172a' },
  tabsScrollView: { marginBottom: 16, maxHeight: 50 },
  tabsContainer: { backgroundColor: '#eef2ff', borderRadius: 12, padding: 6, height: 48, alignItems: 'center' },
  tab: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 999, marginRight: 8, justifyContent: 'center', backgroundColor: 'transparent' },
  activeTab: { backgroundColor: '#2563eb', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  tabText: { fontWeight: '600', color: '#475569', fontSize: 14 },
  activeTabText: { color: 'white' },
  addButton: { backgroundColor: '#2563eb', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginBottom: 16, width: 160 },
  addButtonText: { color: 'white', fontWeight: 'bold' },
  list: { paddingBottom: 40 },
  
  // New Card Styles
  cardRow: { flexDirection: 'row', padding: 16, backgroundColor: 'white', marginBottom: 10, borderRadius: 16, alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2, borderLeftWidth: 4, borderLeftColor: 'transparent' },
  iconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  cardContent: { flex: 1, justifyContent: 'center' },
  cardTitle: { fontWeight: '700', fontSize: 16, color: '#1f2937', marginBottom: 4 },
  cardSubtitle: { color: '#6b7280', fontSize: 13 },
  miniBadge: { alignSelf: 'flex-start', backgroundColor: '#f3f4f6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 6 },
  miniBadgeText: { fontSize: 10, fontWeight: '600', color: '#4b5563', textTransform: 'uppercase' },

  // Avatar Styles
  avatarBox: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  avatarAdmin: { backgroundColor: '#fee2e2' },
  avatarUser: { backgroundColor: '#dbeafe' },
  avatarText: { fontSize: 18, fontWeight: 'bold' },
  textAdmin: { color: '#dc2626' },
  textUser: { color: '#2563eb' },

  actions: { flexDirection: 'row', gap: 8 },
  actionButton: { padding: 8, backgroundColor: '#f9fafb', borderRadius: 8 },
  emptyText: { textAlign: 'center', color: '#9ca3af', marginTop: 28, padding: 24, backgroundColor: '#fff', borderRadius: 12 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, alignSelf: 'flex-start' },
  badgeText: { fontSize: 10, fontWeight: 'bold' },

  // Filtres
  filterSection: { marginBottom: 16 },
  searchBar: { marginBottom: 8, backgroundColor: 'white' },
  chipsContainer: { flexDirection: 'row', marginBottom: 8, height: 35 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#e5e7eb', marginRight: 8, justifyContent: 'center' },
  chipActive: { backgroundColor: '#3b82f6' },
  chipText: { fontSize: 12, color: '#374151', fontWeight: '600' },
  chipTextActive: { color: 'white' },
  subFilterRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  smallChip: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6, backgroundColor: '#e5e7eb', marginRight: 6, marginVertical: 2 },
  smallChipActive: { backgroundColor: '#6366f1' },
  smallChipText: { fontSize: 11, color: '#374151' },

  // Carte Ticket
  ticketCard: { backgroundColor: 'white', borderRadius: 12, padding: 12, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, borderLeftWidth: 4, borderLeftColor: '#6b7280' },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  ticketEventName: { fontSize: 15, fontWeight: 'bold', color: '#1f2937', flex: 1, marginRight: 8 },
  ticketDate: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  ticketDetails: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#f9fafb', padding: 8, borderRadius: 8, marginBottom: 12 },
  ticketDetailItem: { alignItems: 'center', width: '50%', marginBottom: 6 },
  detailLabel: { fontSize: 10, color: '#9ca3af', marginBottom: 2, textTransform: 'uppercase' },
  detailValue: { fontSize: 13, fontWeight: '600', color: '#374151' },
  priceValue: { fontSize: 13, fontWeight: 'bold', color: '#059669' },
  ticketFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 8 },
  sellerInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  sellerName: { fontSize: 11, color: '#4b5563', marginLeft: 4 },
  categoryTag: { backgroundColor: '#e0e7ff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  categoryTagText: { fontSize: 10, color: '#4338ca', fontWeight: '600' },

  // Carte Transaction
  transCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  transRow: { flexDirection: 'row', alignItems: 'center' },
  transIconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  transTitle: { fontSize: 14, fontWeight: 'bold', color: '#1f2937' },
  transSubtitle: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  transBuyer: { fontSize: 12, color: '#4b5563', marginTop: 4 },
  transAmount: { fontSize: 16, fontWeight: 'bold', textAlign: 'right' },
  statusTextMini: { fontSize: 10, fontWeight: 'bold', textAlign: 'right', marginTop: 2 },

  // Advanced Filters
  filterToggleButton: { padding: 10, backgroundColor: '#e5e7eb', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  advancedFilters: { marginTop: 12, padding: 12, backgroundColor: '#f3f4f6', borderRadius: 12 },
  filterLabel: { fontSize: 12, fontWeight: '600', color: '#4b5563', marginBottom: 8 },
  sortRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sortChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb' },
  sortChipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  sortChipText: { fontSize: 12, color: '#4b5563' },
  sortChipTextActive: { color: '#fff', fontWeight: '600' },
});