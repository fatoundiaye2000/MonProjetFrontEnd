// src/services/auth.service.ts
import httpClient from '../utils/httpClient';
import { API_ENDPOINTS, STORAGE_KEYS } from '../config/constants';
import { LoginRequest, LoginResponse, RegisterRequest, DecodedToken } from '../types/auth.types';
import { Utilisateur } from '../types/user.types';

class AuthService {
  /**
   * MÉTHODE 1 : LOGIN
   * Envoie les credentials au backend et stocke le token
   */
  async login(username: string, password: string): Promise<DecodedToken> {
    try {
      console.log('📡 [AUTH SERVICE] Début login pour:', username);
      
      // Le backend Spring attend "email", pas "username"
      const loginData: LoginRequest = {
        email: username,
        password: password
      };

      console.log('📤 [AUTH SERVICE] Données envoyées:', { email: username, password: '***' });

      // Appel API
      const response = await httpClient.post<LoginResponse>(
        API_ENDPOINTS.LOGIN,
        loginData
      );

      console.log('📥 [AUTH SERVICE] Réponse reçue:', { 
        token: response.data.token ? '✓ Présent' : '✗ Absent',
        roles: response.data.roles 
      });

      const { token } = response.data;

      if (!token) {
        console.error('❌ [AUTH SERVICE] Token manquant dans la réponse!');
        throw new Error('Token manquant dans la réponse du serveur');
      }

      // Stocker le token dans localStorage
      console.log('💾 [AUTH SERVICE] Stockage du token...');
      this.setToken(token);
      
      // Vérifier immédiatement
      const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
      console.log('🔍 [AUTH SERVICE] Vérification stockage:', storedToken ? 'OK' : 'ÉCHEC');
      
      if (!storedToken) {
        console.error('❌ [AUTH SERVICE] CRITIQUE: Token non stocké!');
        throw new Error('Impossible de stocker le token');
      }
      
      // Décoder le token pour extraire les infos utilisateur
      console.log('🔓 [AUTH SERVICE] Décodage du token...');
      const decoded = this.decodeToken(token);
      
      // Stocker les infos utilisateur
      console.log('💾 [AUTH SERVICE] Stockage des infos user...');
      this.setUser(decoded);
      
      // Vérifier
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      console.log('🔍 [AUTH SERVICE] User stocké:', storedUser ? 'OK' : 'ÉCHEC');

      console.log('✅ [AUTH SERVICE] Login terminé avec succès:', {
        username: decoded.sub,
        roles: decoded.roles
      });

      return decoded;

    } catch (error) {
      console.error('❌ [AUTH SERVICE] Erreur login:', error);
      
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error('Erreur de connexion');
      }
    }
  }

  /**
   * MÉTHODE 2 : REGISTER
   * Créer un nouveau compte utilisateur
   */
  async register(data: RegisterRequest): Promise<Utilisateur> {
    try {
      console.log('📡 [AUTH SERVICE] Inscription pour:', data.email);
      const response = await httpClient.post<Utilisateur>(
        API_ENDPOINTS.USERS,
        data
      );
      console.log('✅ [AUTH SERVICE] Inscription réussie');
      return response.data;
    } catch (error) {
      console.error('❌ [AUTH SERVICE] Erreur inscription:', error);
      
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("Erreur lors de l'inscription");
      }
    }
  }

  /**
   * MÉTHODE 3 : LOGOUT
   * Déconnexion : nettoie le localStorage
   */
  logout(): void {
    console.log('👋 [AUTH SERVICE] Déconnexion...');
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    console.log('🔒 [AUTH SERVICE] LocalStorage nettoyé');
  }

  /**
   * MÉTHODE 4 : DÉCODER LE TOKEN JWT
   * Extrait les informations du token
   */
  decodeToken(token: string): DecodedToken {
    try {
      const payloadBase64 = token.split('.')[1];
      const payloadJson = atob(payloadBase64);
      const decoded: DecodedToken = JSON.parse(payloadJson);
      
      console.log('🔓 [AUTH SERVICE] Token décodé:', {
        sub: decoded.sub,
        roles: decoded.roles,
        exp: new Date(decoded.exp * 1000).toLocaleString()
      });
      
      return decoded;
    } catch (error) {
      console.error('❌ [AUTH SERVICE] Erreur décodage token:', error);
      throw new Error('Token invalide');
    }
  }

  /**
   * MÉTHODE 5 : VÉRIFIER SI LE TOKEN EST EXPIRÉ
   */
  isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      const now = Date.now() / 1000;
      const isExpired = decoded.exp < now;
      
      if (isExpired) {
        console.log('⏰ [AUTH SERVICE] Token expiré');
      }
      
      return isExpired;
    } catch {
      console.log('⚠️ [AUTH SERVICE] Token invalide ou corrompu');
      return true;
    }
  }

  /**
   * MÉTHODE 6 : OBTENIR LE TOKEN ACTUEL
   */
  getToken(): string | null {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    console.log('🔑 [AUTH SERVICE] getToken:', token ? 'Présent' : 'Absent');
    return token;
  }

  /**
   * MÉTHODE 7 : STOCKER LE TOKEN (privée)
   */
  private setToken(token: string): void {
    console.log('💾 [AUTH SERVICE] setToken - Longueur:', token.length);
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  }

  /**
   * MÉTHODE 8 : STOCKER LES INFOS UTILISATEUR (privée)
   */
  private setUser(decoded: DecodedToken): void {
    const user = {
      username: decoded.sub,
      roles: decoded.roles,
    };
    console.log('💾 [AUTH SERVICE] setUser:', user);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  /**
   * MÉTHODE 9 : OBTENIR LES INFOS UTILISATEUR
   */
  getUser(): { username: string; roles: string[] } | null {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    console.log('👤 [AUTH SERVICE] getUser:', userStr ? 'Présent' : 'Absent');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      console.error('❌ [AUTH SERVICE] Erreur parsing user');
      return null;
    }
  }

  /**
   * MÉTHODE 10 : VÉRIFIER SI L'UTILISATEUR EST AUTHENTIFIÉ
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      console.log('🔒 [AUTH SERVICE] isAuthenticated: false (pas de token)');
      return false;
    }
    const isAuth = !this.isTokenExpired(token);
    console.log('🔒 [AUTH SERVICE] isAuthenticated:', isAuth);
    return isAuth;
  }

  /**
   * MÉTHODE 11 : VÉRIFIER SI L'UTILISATEUR A UN RÔLE SPÉCIFIQUE
   */
  hasRole(role: string): boolean {
    const user = this.getUser();
    if (!user) return false;
    
    const hasRole = user.roles.some(r => 
      r.toUpperCase() === role.toUpperCase() || 
      r.toUpperCase() === `ROLE_${role.toUpperCase()}`
    );
    
    console.log(`🔐 [AUTH SERVICE] hasRole(${role}):`, hasRole, 'Roles:', user.roles);
    return hasRole;
  }
}

// Exporter une instance unique (singleton)
export default new AuthService();  