// URL de base de votre API backend
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

// Endpoints de l'API
export const API_ENDPOINTS = {
  // Authentification
  LOGIN: '/login',

  // Utilisateurs - ✅ CORRECTION: /api/users → /api/users/all
  USERS: '/api/users/all',
  USER_BY_ID: (id: number) => `/api/users/getById/${id}`,

  // Événements
  EVENEMENTS: '/api/evenements/all',
  EVENEMENT_BY_ID: (id: number) => `/api/evenements/${id}`,
} as const;

// Clés du localStorage
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_data',
} as const;

// Configuration JWT
export const JWT_CONFIG = {
  HEADER_NAME: 'Authorization',
  TOKEN_PREFIX: 'Bearer ',
} as const;

// Messages d'erreur
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erreur de connexion au serveur',
  INVALID_CREDENTIALS: 'Identifiants incorrects',
  UNAUTHORIZED: 'Accès non autorisé',
  SERVER_ERROR: 'Erreur serveur',
  TOKEN_EXPIRED: 'Session expirée, veuillez vous reconnecter',
  EMAIL_EXISTS: 'Cet email est déjà utilisé',
  REQUIRED_FIELD: 'Ce champ est obligatoire',
} as const;