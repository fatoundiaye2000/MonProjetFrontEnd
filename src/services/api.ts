import httpClient from '../utils/httpClient';
import { API_ENDPOINTS } from '../config/constants';
import { Utilisateur, CreateUtilisateurDTO, UpdateUtilisateurDTO } from '../types/user.types';
import { Evenement, CreateEvenementDto, UpdateEvenementDto } from '../types/event.types';

class ApiService {
  async getAllUtilisateurs(): Promise<Utilisateur[]> {
    try {
      const response = await httpClient.get<Utilisateur[]>(API_ENDPOINTS.USERS);
      return response.data;
    } catch (error: unknown) {
      console.error('❌ Erreur getAllUtilisateurs:', error);
      
      // ✅ Vérifier si c'est une erreur d'authentification
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          // Token expiré ou invalide
          localStorage.removeItem('auth_token');
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        } else if (axiosError.response?.status === 500) {
          throw new Error('Erreur serveur. Veuillez réessayer plus tard.');
        }
      }
      
      throw new Error('Erreur lors de la récupération des utilisateurs');
    }
  }

  async getUtilisateurById(id: number): Promise<Utilisateur> {
    try {
      const response = await httpClient.get<Utilisateur>(
        API_ENDPOINTS.USER_BY_ID(id)
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Erreur getUtilisateurById:', error);
      throw new Error(`Utilisateur ${id} introuvable`);
    }
  }

  async createUtilisateur(data: CreateUtilisateurDTO): Promise<Utilisateur> {
    try {
      const response = await httpClient.post<Utilisateur>(
        API_ENDPOINTS.USERS,
        data
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Erreur createUtilisateur:', error);
      
      // ✅ Extraire le message d'erreur du backend
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        throw new Error(axiosError.response?.data?.message || 'Erreur lors de la création');
      }
      
      throw new Error('Erreur lors de la création');
    }
  }

  async updateUtilisateur(id: number, data: UpdateUtilisateurDTO): Promise<Utilisateur> {
    try {
      const response = await httpClient.put<Utilisateur>(
        API_ENDPOINTS.USER_BY_ID(id),
        data
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Erreur updateUtilisateur:', error);
      throw new Error('Erreur lors de la mise à jour');
    }
  }

  async deleteUtilisateur(id: number): Promise<void> {
    try {
      await httpClient.delete(API_ENDPOINTS.USER_BY_ID(id));
    } catch (error: unknown) {
      console.error('Erreur deleteUtilisateur:', error);
      throw new Error('Erreur lors de la suppression');
    }
  }

  async getAllEvenements(): Promise<Evenement[]> {
    try {
      const response = await httpClient.get<Evenement[]>(API_ENDPOINTS.EVENEMENTS);
      return response.data;
    } catch (error: unknown) {
      console.error('Erreur getAllEvenements:', error);
      throw new Error('Erreur lors de la récupération des événements');
    }
  }

  async getEvenementById(id: number): Promise<Evenement> {
    try {
      const response = await httpClient.get<Evenement>(
        API_ENDPOINTS.EVENEMENT_BY_ID(id)
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Erreur getEvenementById:', error);
      throw new Error(`Événement ${id} introuvable`);
    }
  }

  async createEvenement(data: CreateEvenementDto): Promise<Evenement> {
    try {
      const response = await httpClient.post<Evenement>(
        API_ENDPOINTS.EVENEMENTS,
        data
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Erreur createEvenement:', error);
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        throw new Error(axiosError.response?.data?.message || 'Erreur lors de la création');
      }
      
      throw new Error('Erreur lors de la création');
    }
  }

  async updateEvenement(id: number, data: UpdateEvenementDto): Promise<Evenement> {
    try {
      const response = await httpClient.put<Evenement>(
        API_ENDPOINTS.EVENEMENT_BY_ID(id),
        data
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Erreur updateEvenement:', error);
      throw new Error('Erreur lors de la mise à jour');
    }
  }

  async deleteEvenement(id: number): Promise<void> {
    try {
      await httpClient.delete(API_ENDPOINTS.EVENEMENT_BY_ID(id));
    } catch (error: unknown) {
      console.error('Erreur deleteEvenement:', error);
      throw new Error('Erreur lors de la suppression');
    }
  }
}

export default new ApiService();