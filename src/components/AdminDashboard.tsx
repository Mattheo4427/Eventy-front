import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { AdminService } from '../services/AdminService';
import { EventService } from '../services/EventService';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 380; // Ajustement pour petits écrans type Crosscall

export function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    activeEvents: 0,
    ticketsOnSale: 0,
    ticketsSold: 0,
    totalUsers: 0,
    suspendedUsers: 0,
    totalCommissions: 0,
    totalVolume: 0,
    transactionStats: {
        COMPLETED: 0,
        PENDING: 0,
        FAILED: 0,
        REFUNDED: 0,
        CANCELED: 0,
        total: 0
    }
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [events, tickets, users, transactions] = await Promise.all([
        EventService.getAllEvents(),
        AdminService.getAllTickets(),
        AdminService.getAllUsers(),
        AdminService.getAllTransactions()
      ]);

      const activeEvents = events.filter(e => e.status === 'active').length;
      const ticketsOnSale = tickets.filter(t => t.status === 'AVAILABLE').length;
      const ticketsSold = tickets.filter(t => t.status === 'SOLD').length;
      const totalUsers = users.length;
      const suspendedUsers = users.filter(u => u.status === 'SUSPENDED').length;
      
      // Calculer les volumes uniquement sur les transactions validées
      const completedTransactions = transactions.filter(t => t.status === 'COMPLETED');
      const totalVolume = completedTransactions.reduce((acc, tx) => acc + tx.totalAmount, 0);
      
      // 5% commission on each completed transaction
      const totalCommissions = completedTransactions.reduce((acc, tx) => {
        return acc + (tx.totalAmount * 0.05);
      }, 0);

      const transactionStats = {
        COMPLETED: transactions.filter(t => t.status === 'COMPLETED').length,
        PENDING: transactions.filter(t => t.status === 'PENDING').length,
        FAILED: transactions.filter(t => t.status === 'FAILED').length,
        REFUNDED: transactions.filter(t => t.status === 'REFUNDED').length,
        CANCELED: transactions.filter(t => t.status === 'CANCELED').length,
        total: transactions.length
      };

      setStats({
        activeEvents,
        ticketsOnSale,
        ticketsSold,
        totalUsers,
        suspendedUsers,
        totalCommissions,
        totalVolume,
        transactionStats
      });
    } catch (error) {
      console.error("Error loading stats", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  if (loading && !refreshing) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
  );

  const StatCard = ({ title, value, icon, color, prefix = '', fullWidth = false, subtitle = '' }: any) => (
    <View style={[styles.card, fullWidth ? styles.cardFull : (isSmallDevice ? styles.cardFull : styles.cardHalf)]}>
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardValue}>{prefix}{typeof value === 'number' ? value.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2}) : value}</Text>
        <Text style={styles.cardTitle}>{title}</Text>
        {subtitle ? <Text style={styles.cardSubtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );

  const TransactionBar = ({ label, count, total, color }: any) => {
      const percentage = total > 0 ? (count / total) * 100 : 0;
      return (
          <View style={styles.statRow}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4}}>
                  <Text style={styles.statLabel}>{label}</Text>
                  <Text style={styles.statCount}>{count} ({percentage.toFixed(0)}%)</Text>
              </View>
              <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${percentage}%`, backgroundColor: color }]} />
              </View>
          </View>
      );
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} />}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Tableau de Bord</Text>
          <Text style={styles.headerSubtitle}>Vue d'ensemble de l'activité</Text>
        </View>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={20} color="#2563eb" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.sectionTitle}>Performance Financière</Text>
      <View style={styles.row}>
        <View style={[styles.card, styles.cardFull, styles.highlightCard]}>
          <View style={styles.highlightContent}>
            <View>
              <Text style={styles.highlightLabel}>Commissions Totales (5%)</Text>
              <Text style={styles.highlightValue}>{stats.totalCommissions.toFixed(2)} €</Text>
            </View>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Ionicons name="wallet" size={32} color="#fff" />
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.highlightFooter}>
            <Text style={styles.highlightFooterText}>Volume total des transactions: {stats.totalVolume.toFixed(2)} €</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Activité Plateforme</Text>
      <View style={styles.grid}>
        <StatCard 
          title="Utilisateurs" 
          value={stats.totalUsers} 
          icon="people" 
          color="#2563eb" 
          subtitle="Inscrits"
        />
        <StatCard 
          title="Suspendus" 
          value={stats.suspendedUsers} 
          icon="ban" 
          color="#ef4444" 
          subtitle="Utilisateurs bloqués"
        />
        <StatCard 
          title="Événements" 
          value={stats.activeEvents} 
          icon="calendar" 
          color="#059669" 
          subtitle="Actifs"
        />
      </View>

      <Text style={styles.sectionTitle}>Transactions par Statut</Text>
      <View style={styles.row}>
          <View style={[styles.card, styles.cardFull]}>
              <TransactionBar label="Validées" count={stats.transactionStats.COMPLETED} total={stats.transactionStats.total} color="#10b981" />
              <TransactionBar label="En attente" count={stats.transactionStats.PENDING} total={stats.transactionStats.total} color="#f59e0b" />
              <TransactionBar label="Échouées" count={stats.transactionStats.FAILED} total={stats.transactionStats.total} color="#ef4444" />
              <TransactionBar label="Remboursées" count={stats.transactionStats.REFUNDED} total={stats.transactionStats.total} color="#6366f1" />
              <TransactionBar label="Annulées" count={stats.transactionStats.CANCELED} total={stats.transactionStats.total} color="#94a3b8" />
          </View>
      </View>

      <Text style={styles.sectionTitle}>Billetterie</Text>
      <View style={styles.grid}>
        <StatCard 
          title="En Vente" 
          value={stats.ticketsOnSale} 
          icon="ticket-outline" 
          color="#d97706" 
        />
        <StatCard 
          title="Vendus" 
          value={stats.ticketsSold} 
          icon="checkmark-circle" 
          color="#7c3aed" 
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  header: { 
    padding: 24, 
    paddingTop: 20,
    backgroundColor: '#fff', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#0f172a' },
  headerSubtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  refreshButton: { padding: 8, backgroundColor: '#eff6ff', borderRadius: 12 },

  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#334155', 
    marginLeft: 20, 
    marginTop: 24, 
    marginBottom: 12 
  },

  row: { paddingHorizontal: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12 },
  
  card: { 
    backgroundColor: 'white', 
    borderRadius: 20, 
    padding: 16, 
    shadowColor: '#64748b', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 12, 
    elevation: 3,
    marginBottom: 4
  },
  cardHalf: { width: '48%', minWidth: 150, flex: 1 },
  cardFull: { width: '100%' },
  
  cardContent: { marginTop: 12 },
  cardValue: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#64748b', marginTop: 2 },
  cardSubtitle: { fontSize: 12, color: '#94a3b8', marginTop: 2 },

  iconContainer: { 
    width: 48, 
    height: 48, 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center',
    alignSelf: 'flex-start'
  },

  // Highlight Card (Financial)
  highlightCard: { backgroundColor: '#2563eb' },
  highlightContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  highlightLabel: { color: '#bfdbfe', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  highlightValue: { color: '#fff', fontSize: 32, fontWeight: '800' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 16 },
  highlightFooter: {},
  highlightFooterText: { color: '#dbeafe', fontSize: 13, fontWeight: '500' },

  // Transaction Bars
  statRow: { marginBottom: 12 },
  statLabel: { fontSize: 13, color: '#475569', fontWeight: '600' },
  statCount: { fontSize: 13, color: '#64748b' },
  progressBarBg: { height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, marginTop: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 }
});
