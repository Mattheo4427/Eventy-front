import Constants from 'expo-constants';

/**
 * ===================================================================
 * PARTIE 1: LECTURE DES VARIABLES STATIQUES DEPUIS .ENV
 * ===================================================================
 */

// Expo (SDK 49+) charge automatiquement .env dans process.env
// Les variables DOIVENT commencer par EXPO_PUBLIC_

// Lecture des URLs Keycloak et API Gateway depuis .env
const KEYCLOAK_URL = process.env.EXPO_PUBLIC_KEYCLOAK_URL || 'http://localhost:8090/';
const API_GATEWAY_URL = process.env.EXPO_PUBLIC_API_GATEWAY_URL || 'http://localhost:8080/api';

// Lecture du schéma de l'app
export const appSchema = process.env.EXPO_PUBLIC_APP_SCHEME || 'eventy';

// Lecture du realm et clientId Keycloak
export const keycloakRealm = process.env.EXPO_PUBLIC_KEYCLOAK_REALM || 'eventy-realm';
export const keycloakClientId = process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID || 'eventy-mobile';

/**
 * ===================================================================
 * PARTIE 2: CONSTRUCTION DE LA CONFIGURATION FINALE
 * ===================================================================
 */

// Configuration Keycloak
export const keycloakConfig = {
  baseUrl: KEYCLOAK_URL,
  realm: keycloakRealm,
  clientId: keycloakClientId,
};

// Configuration API Gateway
export const apiConfig = {
  baseUrl: API_GATEWAY_URL,
};