import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { User } from '../types';
import { LanguageSelector } from './LanguageSelector';

interface HeaderProps {
  currentUser: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onNavigate: (view: 'home' | 'events' | 'profile' | 'admin') => void;
  currentView: string;
  notificationCount?: number;
  messageCount?: number;
  onShowNotifications?: () => void;
  onShowMessages?: () => void;
  onShowFavorites?: () => void;
}

export function Header({ 
  currentUser, 
  onLogin, 
  onLogout, 
  onNavigate, 
  currentView,
  notificationCount = 0,
  messageCount = 0,
  onShowNotifications,
  onShowMessages,
  onShowFavorites
}: HeaderProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { t } = useTranslation();

  const handleNavigate = (view: 'home' | 'events' | 'profile' | 'admin') => {
    onNavigate(view);
    setIsDrawerOpen(false);
  };

  const NavigationItem = ({ 
    title, 
    onPress, 
    isActive,
    icon
  }: { 
    title: string; 
    onPress: () => void; 
    isActive: boolean;
    icon?: string;
  }) => (
    <TouchableOpacity 
      onPress={onPress}
      style={[styles.drawerItem, isActive && styles.drawerItemActive]}
    >
      {icon && <Ionicons name={icon as any} size={24} color={isActive ? '#2563eb' : '#374151'} />}
      <Text style={[styles.drawerItemText, isActive && styles.drawerItemTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {/* Logo */}
        <TouchableOpacity 
          onPress={() => handleNavigate('home')}
          style={styles.logo}
        >
          <Text style={styles.logoText}>Eventy</Text>
        </TouchableOpacity>

        {/* Actions rapides pour les fonctionnalités principales */}
        <View style={styles.quickActions}>
          {/* Language selector */}
          <LanguageSelector style={styles.languageSelector} />
          
          {currentUser && onShowFavorites && (
            <TouchableOpacity onPress={onShowFavorites} style={styles.iconButton}>
              <Ionicons name="heart-outline" size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
          
          {currentUser && onShowMessages && (
            <TouchableOpacity onPress={onShowMessages} style={styles.iconButton}>
              <Ionicons name="chatbubble-outline" size={20} color="#6b7280" />
              {messageCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{messageCount > 9 ? '9+' : messageCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          
          {currentUser && onShowNotifications && (
            <TouchableOpacity onPress={onShowNotifications} style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={20} color="#6b7280" />
              {notificationCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{notificationCount > 9 ? '9+' : notificationCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Bouton menu burger */}
        <TouchableOpacity 
          onPress={() => setIsDrawerOpen(true)} 
          style={styles.menuButton}
        >
          <Ionicons name="menu" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Panneau latéral */}
      <Modal
        visible={isDrawerOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDrawerOpen(false)}
      >
        <View style={styles.drawerOverlay}>
          <TouchableOpacity 
            style={styles.drawerBackdrop} 
            onPress={() => setIsDrawerOpen(false)}
          />
          
          <View style={styles.drawer}>
            {/* En-tête du drawer */}
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>{t('home', { ns: 'navigation' })}</Text>
              <TouchableOpacity 
                onPress={() => setIsDrawerOpen(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.drawerContent}>
              {/* Main navigation */}
              <View style={styles.drawerSection}>
                <Text style={styles.drawerSectionTitle}>{t('home', { ns: 'navigation' })}</Text>
                <NavigationItem
                  title={t('home', { ns: 'navigation' })}
                  onPress={() => handleNavigate('home')}
                  isActive={currentView === 'home'}
                  icon="home-outline"
                />
                <NavigationItem
                  title={t('events', { ns: 'navigation' })}
                  onPress={() => handleNavigate('events')}
                  isActive={currentView === 'events'}
                  icon="calendar-outline"
                />
                
                {currentUser && (
                  <NavigationItem
                    title={t('myProfile', { ns: 'navigation' })}
                    onPress={() => handleNavigate('profile')}
                    isActive={currentView === 'profile'}
                    icon="person-outline"
                  />
                )}
                
                {currentUser?.role === 'ADMIN' && (
                  <NavigationItem
                    title={t('administration', { ns: 'navigation' })}
                    onPress={() => handleNavigate('admin')}
                    isActive={currentView === 'admin'}
                    icon="settings-outline"
                  />
                )}
              </View>

              {/* Features */}
              {currentUser && (
                <View style={styles.drawerSection}>
                  <Text style={styles.drawerSectionTitle}>{t('features', { ns: 'navigation' })}</Text>
                  
                  {onShowFavorites && (
                    <TouchableOpacity 
                      onPress={() => {
                        onShowFavorites();
                        setIsDrawerOpen(false);
                      }} 
                      style={styles.drawerItem}
                    >
                      <Ionicons name="heart-outline" size={24} color="#374151" />
                      <Text style={styles.drawerItemText}>{t('myFavorites', { ns: 'navigation' })}</Text>
                    </TouchableOpacity>
                  )}
                  
                  {onShowMessages && (
                    <TouchableOpacity 
                      onPress={() => {
                        onShowMessages();
                        setIsDrawerOpen(false);
                      }} 
                      style={styles.drawerItem}
                    >
                      <View style={styles.iconWithBadge}>
                        <Ionicons name="chatbubble-outline" size={24} color="#374151" />
                        {messageCount > 0 && (
                          <View style={styles.drawerBadge}>
                            <Text style={styles.drawerBadgeText}>{messageCount > 9 ? '9+' : messageCount}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.drawerItemText}>{t('messages', { ns: 'navigation' })}</Text>
                    </TouchableOpacity>
                  )}
                  
                  {onShowNotifications && (
                    <TouchableOpacity 
                      onPress={() => {
                        onShowNotifications();
                        setIsDrawerOpen(false);
                      }} 
                      style={styles.drawerItem}
                    >
                      <View style={styles.iconWithBadge}>
                        <Ionicons name="notifications-outline" size={24} color="#374151" />
                        {notificationCount > 0 && (
                          <View style={styles.drawerBadge}>
                            <Text style={styles.drawerBadgeText}>{notificationCount > 9 ? '9+' : notificationCount}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.drawerItemText}>{t('notifications', { ns: 'navigation' })}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Authentication */}
              <View style={styles.drawerSection}>
                <Text style={styles.drawerSectionTitle}>{t('account', { ns: 'navigation' })}</Text>
                {currentUser ? (
                  <>
                    <View style={styles.userInfo}>
                      <Ionicons name="person-circle-outline" size={32} color="#6b7280" />
                      <View style={styles.userDetails}>
                        <Text style={styles.userName}>{currentUser.name}</Text>
                        <Text style={styles.userEmail}>{currentUser.email}</Text>
                      </View>
                    </View>
                    <TouchableOpacity 
                      onPress={() => {
                        onLogout();
                        setIsDrawerOpen(false);
                      }} 
                      style={styles.logoutButton}
                    >
                      <Ionicons name="log-out-outline" size={24} color="#dc2626" />
                      <Text style={styles.logoutText}>{t('logout', { ns: 'navigation' })}</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity 
                    onPress={() => {
                      onLogin();
                      setIsDrawerOpen(false);
                    }} 
                    style={styles.loginButton}
                  >
                    <Text style={styles.loginText}>{t('login', { ns: 'navigation' })}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 64,
  },
  logo: {
    flex: 0,
    marginRight: 16,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2563eb',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    justifyContent: 'flex-end',
  },
  navigationScroll: {
    flexShrink: 1,
    maxWidth: '70%',
  },
  navItem: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginHorizontal: 2,
  },
  navItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  navText: {
    fontSize: 14,
    color: '#374151',
  },
  navTextActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  loginText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  logoutText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  iconButton: {
    position: 'relative',
    padding: 8,
    marginHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  
  // Styles du drawer
  quickActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  drawerOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    width: Dimensions.get('window').width * 0.8,
    maxWidth: 320,
    backgroundColor: '#ffffff',
    height: '100%',
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  drawerContent: {
    flex: 1,
  },
  drawerSection: {
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  drawerSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  drawerItemActive: {
    backgroundColor: '#e0f2fe',
  },
  drawerItemText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 16,
    flex: 1,
  },
  drawerItemTextActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
  iconWithBadge: {
    position: 'relative',
  },
  drawerBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  drawerBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 12,
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  languageSelector: {
    marginRight: 8,
  },
});