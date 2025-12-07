import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Event } from '../types';
import { useTranslation } from 'react-i18next';
import { EventService } from '../services/EventService';
import { SellTicketModal } from './SellTicketModal'; // Import du Modal
import { useAuth } from '../contexts/AuthContext'; // Pour vérifier la connexion

interface EventDetailProps {
  eventId: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onViewTickets: (eventId: string) => void; // Navigation vers la liste des billets
  onBack: () => void;
}

export function EventDetail({ eventId, isFavorite = false, onToggleFavorite, onViewTickets, onBack }: EventDetailProps) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth(); // Récupération du statut de connexion
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  
  // État local pour gérer la visibilité du modal
  const [showSellModal, setShowSellModal] = useState(false);

  // Chargement des données de l'événement
  const loadData = async () => {
    try {
      setLoading(true);
      const eventData = await EventService.getEventById(eventId);
      setEvent(eventData);
    } catch (error) {
      console.error("Erreur chargement détail:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) loadData();
  }, [eventId]);

  useEffect(() => {
    if (event) setImageError(false);
  }, [event]);

  // Gestion du clic sur "Vendre"
  const handleSellClick = () => {
    if (!isAuthenticated) {
      Alert.alert("Connexion requise", "Vous devez être connecté pour vendre un billet.");
      return;
    }
    setShowSellModal(true);
  };

  if (loading) {
    return <View style={[styles.container, styles.center]}><ActivityIndicator size="large" color="#2563eb" /></View>;
  }

  if (!event) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text>Événement introuvable</Text>
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const hasImage = !imageError && event.imageUrl;

  return (
    <View style={{flex: 1}}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Image et Header */}
        <View style={styles.imageContainer}>
            {!hasImage ? (
              <View style={[styles.coverImage, styles.placeholderContainer]}>
                <Ionicons name="image-outline" size={64} color="#9ca3af" />
                <Text style={styles.placeholderText}>Eventy</Text>
              </View>
            ) : (
              <Image 
                source={{ uri: event.imageUrl }} 
                style={styles.coverImage}
                resizeMode="cover"
                onError={() => setImageError(true)}
              />
            )}
            
            <TouchableOpacity 
              onPress={onBack} 
              style={[styles.backButtonOverlay, !hasImage && styles.lightButtonOverlay]}
            >
              <Ionicons name="arrow-back" size={24} color={!hasImage ? "#111827" : "#fff"} />
            </TouchableOpacity>

            {onToggleFavorite && (
              <TouchableOpacity 
                onPress={onToggleFavorite} 
                style={[styles.favoriteButtonOverlay, !hasImage && styles.lightButtonOverlay]}
              >
                <Ionicons 
                  name={isFavorite ? "heart" : "heart-outline"} 
                  size={24} 
                  color={isFavorite ? "#ef4444" : (!hasImage ? "#111827" : "#fff")} 
                />
              </TouchableOpacity>
            )}
            
            <View style={styles.titleOverlay}>
                <Text style={[styles.title, !hasImage && styles.darkTitle]}>{event.name}</Text>
                {event.categoryLabel && (
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{event.categoryLabel}</Text>
                    </View>
                )}
            </View>
        </View>

        <View style={styles.content}>
          {/* Info Date/Lieu */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={20} color="#4b5563" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoValue}>{formatDate(event.startDate)}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="location" size={20} color="#4b5563" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Lieu</Text>
                <Text style={styles.infoValue}>{event.location}</Text>
                {event.fullAddress && <Text style={styles.infoSubValue}>{event.fullAddress}</Text>}
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>À propos</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          {/* Section Billetterie (Boutons d'action) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Billetterie</Text>
            <View style={styles.actionButtonsContainer}>
                
                {/* Action 1 : Voir les billets (Acheteur) */}
                <TouchableOpacity 
                    style={[styles.actionCard, styles.buyCard]} 
                    onPress={() => onViewTickets(event.id)}
                >
                    <View style={styles.iconCircleBuy}>
                        <Ionicons name="ticket" size={24} color="#2563eb" />
                    </View>
                    <View style={{flex: 1}}>
                        <Text style={styles.actionTitle}>Acheter un billet</Text>
                        <Text style={styles.actionSubtitle}>Voir les offres disponibles</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </TouchableOpacity>

                {/* Action 2 : Vendre un billet (Vendeur) */}
                <TouchableOpacity 
                    style={[styles.actionCard, styles.sellCard]} 
                    onPress={handleSellClick}
                >
                    <View style={styles.iconCircleSell}>
                        <Ionicons name="cash-outline" size={24} color="#059669" />
                    </View>
                    <View style={{flex: 1}}>
                        <Text style={styles.actionTitle}>Revendre un billet</Text>
                        <Text style={styles.actionSubtitle}>Mettre en vente sur la place de marché</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal de Vente intégré localement */}
      <SellTicketModal 
        visible={showSellModal}
        event={event}
        onClose={() => setShowSellModal(false)}
        onSuccess={() => {
             // Feedback utilisateur
             // On pourrait recharger les données si on affichait un compteur de billets ici
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  center: { justifyContent: 'center', alignItems: 'center' },
  
  imageContainer: { position: 'relative', height: 240, width: '100%' },
  coverImage: { width: '100%', height: '100%', backgroundColor: '#f3f4f6' },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
  },
  placeholderText: {
    marginTop: 12,
    color: '#9ca3af',
    fontSize: 24,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 40,
  },
  backButtonOverlay: { position: 'absolute', top: 50, left: 16, padding: 8, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20 },
  favoriteButtonOverlay: { position: 'absolute', top: 50, right: 16, padding: 8, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20 },
  lightButtonOverlay: { backgroundColor: 'rgba(255,255,255,0.8)' },
  titleOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingTop: 40 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 8, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 },
  darkTitle: { color: '#111827', textShadowColor: 'transparent' },
  
  badgesContainer: { flexDirection: 'row', gap: 8 },
  categoryBadge: { backgroundColor: '#2563eb', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  categoryText: { color: '#fff', fontWeight: '600', fontSize: 12 },

  content: { padding: 20 },
  
  infoSection: { flexDirection: 'row', backgroundColor: '#f9fafb', padding: 16, borderRadius: 16, marginBottom: 24, justifyContent: 'space-between' },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', flex: 1 },
  infoTextContainer: { marginLeft: 10, flex: 1 },
  infoLabel: { fontSize: 12, color: '#6b7280', marginBottom: 2, textTransform: 'uppercase' },
  infoValue: { fontSize: 15, color: '#111827', fontWeight: '600' },
  infoSubValue: { fontSize: 13, color: '#4b5563', marginTop: 2 },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 16 },
  description: { fontSize: 16, color: '#4b5563', lineHeight: 24 },

  actionButtonsContainer: { gap: 12 },
  actionCard: { 
      flexDirection: 'row', alignItems: 'center', 
      padding: 16, borderRadius: 16, 
      backgroundColor: '#fff', 
      borderWidth: 1, borderColor: '#e5e7eb',
      shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  buyCard: { borderLeftWidth: 4, borderLeftColor: '#2563eb' },
  sellCard: { borderLeftWidth: 4, borderLeftColor: '#059669' },
  
  iconCircleBuy: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  iconCircleSell: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  
  actionTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  actionSubtitle: { fontSize: 13, color: '#6b7280', marginTop: 2 },
});
