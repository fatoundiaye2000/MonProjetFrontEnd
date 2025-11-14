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
      // ⭐⭐⭐ CORRECTION : Utiliser "email" au lieu de "username" ⭐⭐⭐
      const loginData: LoginRequest = {
        email: username,  // Le backend Spring attend "email", pas "username"
        password: password
      };

      console.log('📤 Données envoyées au login:', loginData);

      // Appel API
      const response = await httpClient.post<LoginResponse>(
        API_ENDPOINTS.LOGIN,
        loginData
      );

      const { token } = response.data;

      // Stocker le token dans localStorage
      this.setToken(token);
      
      // Décoder le token pour extraire les infos utilisateur
      const decoded = this.decodeToken(token);
      
      // Stocker les infos utilisateur
      this.setUser(decoded);

      console.log('✅ Login réussi:', decoded);

      // Retourner les données décodées
      return decoded;

    } catch (error) {
      console.error('❌ Erreur login:', error);
      
      // Gestion propre des erreurs sans 'any'
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
      const response = await httpClient.post<Utilisateur>(
        API_ENDPOINTS.USERS,
        data
      );
      return response.data;
    } catch (error) {
      console.error('Erreur inscription:', error);
      
      // Gestion propre des erreurs sans 'any'
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
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    console.log('🔒 Déconnexion effectuée');
  }

  /**
   * MÉTHODE 4 : DÉCODER LE TOKEN JWT
   * Extrait les informations du token
   */
  decodeToken(token: string): DecodedToken {
    try {
      // Un JWT a 3 parties séparées par des points : header.payload.signature
      // On prend la 2ème partie (index 1)
      const payloadBase64 = token.split('.')[1];

      // Décoder le base64 en string JSON
      const payloadJson = atob(payloadBase64);

      // Parser le JSON en objet JavaScript
      const decoded: DecodedToken = JSON.parse(payloadJson);

      return decoded;
    } catch (error) {
      console.error('Erreur décodage token:', error);
      throw new Error('Token invalide');
    }
  }

  /**
   * MÉTHODE 5 : VÉRIFIER SI LE TOKEN EST EXPIRÉ
   */
  isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      const now = Date.now() / 1000; // Convertir milliseconds en secondes

      return decoded.exp < now; // true si expiré
    } catch {
      return true; // Si erreur de décodage = considérer comme expiré
    }
  }

  /**
   * MÉTHODE 6 : OBTENIR LE TOKEN ACTUEL
   */
  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  /**
   * MÉTHODE 7 : STOCKER LE TOKEN (privée)
   */
  private setToken(token: string): void {
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
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  /**
   * MÉTHODE 9 : OBTENIR LES INFOS UTILISATEUR
   */
  getUser(): { username: string; roles: string[] } | null {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * MÉTHODE 10 : VÉRIFIER SI L'UTILISATEUR EST AUTHENTIFIÉ
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  }

  /**
   * MÉTHODE 11 : VÉRIFIER SI L'UTILISATEUR A UN RÔLE SPÉCIFIQUE
   */
  hasRole(role: string): boolean {
    const user = this.getUser();
    if (!user) return false;
    return user.roles.includes(role);
  }
}

// Exporter une instance unique (singleton)
export default new AuthService();