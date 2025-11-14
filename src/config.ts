import Constants from 'expo-constants';

/**
 * ===================================================================
 * PARTIE 1: DÉTECTION DYNAMIQUE DE L'HÔTE (IP LOCALE)
 * Nous gardons cette logique car l'IP change, mais un .env est statique.
 * ===================================================================
 */
const getDevHost = (): string => {
  // `Constants.expoConfig.hostUri` est fourni par Expo Go
  // et contient l'IP du PC qui fait tourner Metro.
  const hostUri = Constants.expoConfig?.hostUri;
  
  // @ts-ignore (Fallback pour les anciennes versions)
  const debuggerHost = Constants.manifest?.debuggerHost;

  if (hostUri) {
    return hostUri.split(':')[0]; // Extrait l'IP de "192.168.1.10:8081"
  }
  
  if (debuggerHost) {
    return debuggerHost.split(':')[0]; // Extrait l'IP de "192.168.1.10:19000"
  }

  // Si tout échoue, ce qui ne devrait pas arriver en dev avec Expo Go
  return 'localhost';
};

/**
 * ===================================================================
 * PARTIE 2: LECTURE DES VARIABLES STATIQUES DEPUIS .ENV
 * ===================================================================
 */

// Expo (SDK 49+) charge automatiquement .env dans process.env
// Les variables DOIVENT commencer par EXPO_PUBLIC_

// Lecture des variables Keycloak avec fallback (au cas où .env n'est pas lu)
const KEYCLOAK_REALM = process.env.EXPO_PUBLIC_KEYCLOAK_REALM || 'eventy-realm';
const KEYCLOAK_CLIENT_ID = process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID || 'eventy-mobile';
const KEYCLOAK_DEV_PORT = process.env.EXPO_PUBLIC_KEYCLOAK_DEV_PORT || '8090';

// Lecture des variables API Gateway
const API_GATEWAY_DEV_PORT = process.env.EXPO_PUBLIC_API_GATEWAY_DEV_PORT || '8080';

// Lecture du schéma de l'app
export const appSchema = process.env.EXPO_PUBLIC_APP_SCHEME || 'eventy';

/**
 * ===================================================================
 * PARTIE 3: CONSTRUCTION DE LA CONFIGURATION FINALE
 * ===================================================================
 */

// `__DEV__` est 'true' quand on est en mode 'npx expo start'
const IS_DEV = __DEV__;

// Hôte (IP dynamique en dev, domaine fixe en prod)
const API_HOST = IS_DEV 
  ? getDevHost() 
  : 'api.eventy.com'; // <--- VOTRE FUTUR DOMAINE DE PRODUCTION

// Ports (Ports du .env en dev, port 443 en prod)
const KEYCLOAK_PORT = IS_DEV ? KEYCLOAK_DEV_PORT : 443;
const API_GATEWAY_PORT = IS_DEV ? API_GATEWAY_DEV_PORT : 443;

// Protocole (http en dev, https en prod)
const PROTOCOL = IS_DEV ? 'http' : 'https';

/**
 * Configuration de Keycloak, générée dynamiquement.
 */
export const keycloakConfig = {
  // En dev: http://[IP_AUTO_DETECTEE]:8090
  // En prod: https://api.eventy.com
  baseUrl: `${PROTOCOL}://${API_HOST}${IS_DEV ? `:${KEYCLOAK_PORT}` : ''}`,
  realm: KEYCLOAK_REALM, // Lu depuis .env
  clientId: KEYCLOAK_CLIENT_ID, // Lu depuis .env
};

/**
 * Configuration de l'API Gateway, générée dynamiquement.
 */
export const apiConfig = {
  // En dev: http://[IP_AUTO_DETECTEE]:8080/api
  // En prod: https://api.eventy.com/api
  baseUrl: `${PROTOCOL}://${API_HOST}${IS_DEV ? `:${API_GATEWAY_PORT}` : ''}/api`,
};