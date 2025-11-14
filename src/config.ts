import Constants from 'expo-constants';

/**
 * Détermine l'adresse IP de l'hôte pour le développement.
 *
 * En mode de développement (avec Expo Go), `Constants.expoConfig.hostUri` est
 * fourni par le bundler Metro. Il ressemble à "192.168.1.10:8081".
 *
 * Nous extrayons juste la partie "192.168.1.10" (l'adresse IP du PC).
 *
 * En production, `hostUri` n'existe pas, nous utilisons donc un fallback.
 */
const getDevHost = (): string => {
  // `Constants.expoConfig.hostUri` est la nouvelle façon (SDK 49+)
  // Il est fourni par Expo Go et contient l'IP du PC qui fait tourner Metro.
  const hostUri = Constants.expoConfig?.hostUri;
  
  // `Constants.manifest.debuggerHost` est l'ancienne façon (peut servir de fallback)
  // @ts-ignore
  const debuggerHost = Constants.manifest?.debuggerHost;

  if (hostUri) {
    return hostUri.split(':')[0]; // Extrait l'IP de "192.168.1.10:8081"
  }
  
  if (debuggerHost) {
    return debuggerHost.split(':')[0]; // Extrait l'IP de "192.168.1.10:19000"
  }

  // Fallback si tout échoue (ne devrait pas arriver en dev)
  return 'localhost';
};

// --- Configuration des URLs ---

// `__DEV__` est une variable globale fournie par React Native.
// Elle est 'true' quand on est en mode 'npx expo start'.
const IS_DEV = __DEV__;

// 1. Définir l'hôte (IP)
// En dev: Découvert automatiquement
// En prod: Votre futur nom de domaine
const API_HOST = IS_DEV
  ? getDevHost()
  : 'api.eventy.com'; // <--- VOTRE FUTUR DOMAINE DE PRODUCTION

// 2. Définir les ports
// En dev: Ports locaux
// En prod: Ports standards (80 pour http, 443 pour https)
const KEYCLOAK_PORT = IS_DEV ? 8090 : 443;
const API_GATEWAY_PORT = IS_DEV ? 8080 : 443;

// 3. Définir le protocole
const PROTOCOL = IS_DEV ? 'http' : 'https';

// --- Exports finaux ---

/**
 * Configuration de Keycloak, générée dynamiquement.
 */
export const keycloakConfig = {
  // En dev: http://192.168.1.10:8090
  // En prod: https://api.eventy.com
  baseUrl: `${PROTOCOL}://${API_HOST}${IS_DEV ? `:${KEYCLOAK_PORT}` : ''}`,
  realm: 'eventy-realm',
  clientId: 'eventy-mobile',
};

/**
 * Configuration de l'API Gateway, générée dynamiquement.
 */
export const apiConfig = {
  // En dev: http://192.168.1.10:8080/api
  // En prod: https://api.eventy.com/api
  baseUrl: `${PROTOCOL}://${API_HOST}${IS_DEV ? `:${API_GATEWAY_PORT}` : ''}/api`,
};

/**
 * Schéma de l'application (ne change pas).
 */
export const appSchema = 'eventy';