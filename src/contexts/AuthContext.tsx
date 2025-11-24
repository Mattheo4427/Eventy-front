import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import { useAuthRequest, makeRedirectUri, ResponseType } from 'expo-auth-session';
import { jwtDecode } from 'jwt-decode'; // Importation nommée pour jwt-decode v3+
import { User } from '../types';
import { keycloakConfig, appSchema } from '../config'; // Importe depuis le nouveau fichier de config

WebBrowser.maybeCompleteAuthSession();

// Définition des endpoints Keycloak
const discovery = {
  authorizationEndpoint: `${keycloakConfig.baseUrl}/realms/${keycloakConfig.realm}/protocol/openid-connect/auth`,
  tokenEndpoint: `${keycloakConfig.baseUrl}/realms/${keycloakConfig.realm}/protocol/openid-connect/token`,
};

// Interface pour le token décodé
interface DecodedToken {
  sub: string; // C'est l'ID de l'utilisateur
  name: string;
  email: string;
  preferred_username: string;
  realm_access: {
    roles: string[];
  };
  app_role?: string; // Attribut personnalisé si utilisé
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Préparer la requête d'authentification vers Keycloak
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: keycloakConfig.clientId,
      scopes: ['openid', 'profile', 'email'],
      redirectUri: makeRedirectUri({ native: appSchema }),
      responseType: ResponseType.Code, // On demande un 'code'
      usePKCE: true, // Obligatoire pour la sécurité mobile
    },
    discovery
  );

  // 2. Fonction pour parser le token, créer l'utilisateur et mettre à jour l'état
  const setAuthState = async (accessToken: string | null) => {
    setToken(accessToken);

    if (accessToken) {
      try {
        // Décoder le token pour obtenir les infos de l'utilisateur
        const decoded = jwtDecode<DecodedToken>(accessToken);
        
              // --- MODIFICATION : AJOUT DE LOGS POUR DÉBUGGER ---
        console.log("Token décodé complet:", JSON.stringify(decoded, null, 2));
        console.log("Rôles trouvés:", decoded.realm_access?.roles);
        console.log("Attributs personnalisés (si présents):", (decoded as any).app_role);
        // --- CORRECTION : Vérification insensible à la casse et sécurisée ---
        // 1. Récupérer la liste des rôles (tableau vide par défaut si inexistant)
        const roles = decoded.realm_access?.roles || [];
        
        // 2. Vérifier si 'admin' ou 'ADMIN' est présent
        const isAdmin = roles.some(r => r.toUpperCase() === 'ADMIN');

        // 3. (Optionnel) Si vous utilisez l'attribut 'app_role' au lieu des rôles de royaume
        const isAdminAttr = (decoded as any).app_role === 'ADMIN';
        
        const role = isAdminAttr ? 'ADMIN' : 'USER';
        
        console.log("Rôle final attribué dans l'app:", role);
        
        // Créer l'objet User tel que défini dans vos types
        const appUser: User = {
          id: decoded.sub,
          name: decoded.name || decoded.preferred_username,
          email: decoded.email,
          role: role,
        };

        setUser(appUser);
        // Stocker le token de manière sécurisée
        await SecureStore.setItemAsync('accessToken', accessToken);
      } catch (e) {
        console.error("Erreur de décodage du token:", e);
        // En cas d'erreur (token corrompu), on nettoie tout
        await SecureStore.deleteItemAsync('accessToken');
        setUser(null);
      }
    } else {
      // Si pas de token, on nettoie tout
      setUser(null);
      await SecureStore.deleteItemAsync('accessToken');
    }
  };


  // 3. Gérer la réponse de Keycloak (après la redirection)
  useEffect(() => {
    const exchangeCodeForToken = async (code: string) => {
      if (!request?.codeVerifier) {
        console.error("Code verifier (PKCE) manquant. La requête est invalide.");
        return;
      }

      try {
        // Préparer la requête pour échanger le code contre un token
        const params = new URLSearchParams();
        params.append('client_id', keycloakConfig.clientId);
        params.append('grant_type', 'authorization_code');
        params.append('code', code);
        params.append('redirect_uri', makeRedirectUri({ native: appSchema }));
        params.append('code_verifier', request.codeVerifier);

        const tokenResponse = await fetch(discovery.tokenEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString(),
        });

        const data = await tokenResponse.json();
        
        if (data.access_token) {
          // On a le token ! On met à jour l'état
          await setAuthState(data.access_token);
        } else {
          console.error("Erreur d'échange de token:", data.error_description || 'Pas de access_token reçu');
        }
      } catch (e) {
        console.error("Exception lors de l'échange du token:", e);
      }
    };

    // Si la réponse de useAuthRequest est un succès
    if (response?.type === 'success') {
      const { code } = response.params;
      exchangeCodeForToken(code);
    } else if (response?.type === 'error') {
      console.error(
        "Erreur d'authentification Keycloak:",
        response.error?.message ?? response.errorCode ?? JSON.stringify(response.params ?? response)
      );
    }
  }, [response, request]); // Dépend de la 'response'

  // 4. Vérifier au démarrage si un token existe déjà en mémoire
  useEffect(() => {
    const bootstrapAsync = async () => {
      let userToken: string | null = null;
      try {
        userToken = await SecureStore.getItemAsync('accessToken');
      } catch (e) {
        console.error('Erreur de restauration du token:', e);
      }
      // Mettre à jour l'état avec le token (ou null)
      await setAuthState(userToken);
      setIsLoading(false);
    };
    bootstrapAsync();
  }, []);

  // 5. Définir les fonctions de login/logout
  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token, // Vrai si le token n'est pas null
    isLoading, // Pour afficher un écran de chargement
    login: () => {
      // Déclenche l'ouverture de la page de connexion Keycloak
      if (request) {
        promptAsync(); 
      }
    },
    logout: async () => {
      // Efface l'état et le token en mémoire
      await setAuthState(null);
      // Optionnel : Déconnecter aussi de Keycloak (nécessite le token d'ID et une config)
      // WebBrowser.openBrowserAsync(`${discovery.authorizationEndpoint}/logout?...`);
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};