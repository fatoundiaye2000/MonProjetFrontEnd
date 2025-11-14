// src/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import authService from '../services/auth.service';
import { RegisterRequest } from '../types/auth.types';

interface UseAuthReturn {
  token: string | null;
  user: { username: string; roles: string[] } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  hasRole: (role: string) => boolean;
}

export const useAuth = (): UseAuthReturn => {
  // États
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ username: string; roles: string[] } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * INITIALISATION : Vérifier si l'utilisateur est déjà connecté
   */
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedToken = authService.getToken();
        const storedUser = authService.getUser();
        
        if (storedToken && authService.isAuthenticated()) {
          setToken(storedToken);
          setUser(storedUser);
        } else {
          authService.logout();
        }
      } catch (err) {
        console.error('Erreur initialisation auth:', err);
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * FONCTION 1 : LOGIN
   */
  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const decoded = await authService.login(username, password);
      const newToken = authService.getToken();
      
      setToken(newToken);
      setUser({
        username: decoded.sub,
        roles: decoded.roles,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * FONCTION 2 : REGISTER
   */
  const register = useCallback(async (data: RegisterRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await authService.register(data);
      await login(data.nom, data.motDePasse);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur d\'inscription';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  /**
   * FONCTION 3 : LOGOUT
   */
  const logout = useCallback(() => {
    authService.logout();
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  /**
   * FONCTION 4 : CLEAR ERROR
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * FONCTION 5 : CHECK ROLE
   */
  const hasRole = useCallback((role: string): boolean => {
    return authService.hasRole(role);
  }, []);

  // État dérivé
  const isAuthenticated = !!token && !!user;

  return {
    token,
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
    hasRole,
  };
};