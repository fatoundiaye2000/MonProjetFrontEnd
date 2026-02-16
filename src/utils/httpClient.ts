import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, JWT_CONFIG, STORAGE_KEYS, ERROR_MESSAGES } from '../config/constants';

// Créer une instance Axios personnalisée
const httpClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * INTERCEPTEUR DE REQUÊTE
 * Ajoute automatiquement le token JWT à chaque requête
 */
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Récupérer le token du localStorage
    // ✅ CORRIGÉ: Utilisez STORAGE_KEYS.TOKEN
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

    // Si un token existe, l'ajouter au header Authorization
    if (token && config.headers) {
      config.headers[JWT_CONFIG.HEADER_NAME] = `${JWT_CONFIG.TOKEN_PREFIX}${token}`;
    }
    
    // Debug
    console.log('🔐 [httpClient] Requête:', config.url);
    console.log('   Token présent:', token ? 'Oui' : 'Non');
    console.log('   Header Authorization:', config.headers?.[JWT_CONFIG.HEADER_NAME] ? 'Oui' : 'Non');
    
    return config;
  },
  (error) => {
    console.error('❌ [httpClient] Erreur requête:', error);
    return Promise.reject(error);
  }
);

/**
 * INTERCEPTEUR DE RÉPONSE
 * Gère les erreurs globalement
 */
httpClient.interceptors.response.use(
  (response) => {
    console.log(`✅ [httpClient] Réponse ${response.status}: ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    console.error('❌ [httpClient] Erreur réponse:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });

    // Erreur 401 : Token invalide ou expiré
    if (error.response?.status === 401) {
      console.log('⚠️ [httpClient] Token expiré ou invalide (401)');
      // ✅ CORRIGÉ: Utilisez STORAGE_KEYS
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }

      return Promise.reject({
        message: ERROR_MESSAGES.TOKEN_EXPIRED,
        status: 401,
      });
    }

    // Erreur 403 : Accès interdit
    if (error.response?.status === 403) {
      console.log('🚫 [httpClient] Accès interdit (403)');
      return Promise.reject({
        message: ERROR_MESSAGES.UNAUTHORIZED,
        status: 403,
      });
    }

    // Erreur 500+ : Erreur serveur
    if (error.response?.status && error.response.status >= 500) {
      console.log('💥 [httpClient] Erreur serveur (500+)');
      return Promise.reject({
        message: ERROR_MESSAGES.SERVER_ERROR,
        status: error.response.status,
      });
    }

    // Erreur réseau (pas de réponse du serveur)
    if (!error.response) {
      console.log('🌐 [httpClient] Erreur réseau');
      return Promise.reject({
        message: ERROR_MESSAGES.NETWORK_ERROR,
        status: 0,
      });
    }

    // Autres erreurs
    return Promise.reject(error);
  }
);

export default httpClient;