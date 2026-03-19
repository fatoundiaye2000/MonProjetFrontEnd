// src/config/constants.ts

// URL de base de votre API backend
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

// Endpoints de l'API
export const API_ENDPOINTS = {
  // Authentification
  LOGIN: '/login',

  // Utilisateurs
  USERS: '/api/users/all',
  USER_BY_ID: (id: number) => `/api/users/getById/${id}`,

  // ✅ Événements — correspond à EvenementController
  EVENEMENTS_ALL:        '/api/evenements/all',
  EVENEMENT_BY_ID:       (id: number) => `/api/evenements/getById/${id}`,
  EVENEMENT_SAVE:        '/api/evenements/save',
  EVENEMENT_UPDATE:      '/api/evenements/update',        // ⚠️ id dans le BODY
  EVENEMENT_DELETE:      (id: number) => `/api/evenements/delete/${id}`,
  EVENEMENT_TEST:        '/api/evenements/test',
  EVENEMENT_CHECK:       '/api/evenements/check',

  // ✅ Réservations — correspond à ReservationController
  RESERVATIONS_ALL:      '/api/reservations/all',
  RESERVATION_BY_ID:     (id: number) => `/api/reservations/getById/${id}`,
  RESERVATION_SAVE:      '/api/reservations/save',
  RESERVATION_UPDATE:    '/api/reservations/update',      // ⚠️ id dans le BODY
  RESERVATION_DELETE:    (id: number) => `/api/reservations/delete/${id}`,

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