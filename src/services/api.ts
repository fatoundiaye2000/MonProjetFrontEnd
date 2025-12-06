import httpClient from '../utils/httpClient';  // ✅ ../ au lieu de ./
import { API_ENDPOINTS } from '../config/constants';
import { Utilisateur, CreateUtilisateurDTO, UpdateUtilisateurDTO } from '../types/user.types';
import { Evenement, CreateEvenementDTO, UpdateEvenementDTO } from '../types/event.types';

class ApiService {
  /**
   * MÉTHODE 1 : GET ALL UTILISATEURS
   * GET /api/users
   */
  async getAllUtilisateurs(): Promise<Utilisateur[]> {
    try {
      const response = await httpClient.get<Utilisateur[]>(API_ENDPOINTS.USERS);
      return response.data;
    } catch (error: unknown) {
      console.error('Erreur getAllUtilisateurs:', error);
      throw new Error(error instanceof Error ? error.message : 'Erreur lors de la récupération des utilisateurs');
    }
  }

  /**
   * MÉTHODE 2 : GET UTILISATEUR BY ID
   * GET /api/users/{id}
   */
  async getUtilisateurById(id: number): Promise<Utilisateur> {
    try {
      const response = await httpClient.get<Utilisateur>(
        API_ENDPOINTS.USER_BY_ID(id)
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Erreur getUtilisateurById:', error);
      throw new Error(error instanceof Error ? error.message : `Utilisateur ${id} introuvable`);
    }
  }

  /**
   * MÉTHODE 3 : CREATE UTILISATEUR
   * POST /api/users
   */
  async createUtilisateur(data: CreateUtilisateurDTO): Promise<Utilisateur> {
    try {
      const response = await httpClient.post<Utilisateur>(
        API_ENDPOINTS.USERS,
        data
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Erreur createUtilisateur:', error);
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        throw new Error(axiosError.response?.data?.message || 'Erreur lors de la création');
      }
      throw new Error('Erreur lors de la création');
    }
  }

  /**
   * MÉTHODE 4 : UPDATE UTILISATEUR
   * PUT /api/users/{id}
   */
  async updateUtilisateur(id: number, data: UpdateUtilisateurDTO): Promise<Utilisateur> {
    try {
      const response = await httpClient.put<Utilisateur>(
        API_ENDPOINTS.USER_BY_ID(id),
        data
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Erreur updateUtilisateur:', error);
      throw new Error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour');
    }
  }

  /**
   * MÉTHODE 5 : DELETE UTILISATEUR
   * DELETE /api/users/{id}
   */
  async deleteUtilisateur(id: number): Promise<void> {
    try {
      await httpClient.delete(API_ENDPOINTS.USER_BY_ID(id));
    } catch (error: unknown) {
      console.error('Erreur deleteUtilisateur:', error);
      throw new Error(error instanceof Error ? error.message : 'Erreur lors de la suppression');
    }
  }

  /**
   * MÉTHODE 6 : GET ALL ÉVÉNEMENTS
   * GET /api/evenements
   */
  async getAllEvenements(): Promise<Evenement[]> {
    try {
      const response = await httpClient.get<Evenement[]>(API_ENDPOINTS.EVENEMENTS);
      return response.data;
    } catch (error: unknown) {
      console.error('Erreur getAllEvenements:', error);
      throw new Error(error instanceof Error ? error.message : 'Erreur lors de la récupération des événements');
    }
  }

  /**
   * MÉTHODE 7 : GET ÉVÉNEMENT BY ID
   * GET /api/evenements/{id}
   */
  async getEvenementById(id: number): Promise<Evenement> {
    try {
      const response = await httpClient.get<Evenement>(
        API_ENDPOINTS.EVENEMENT_BY_ID(id)
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Erreur getEvenementById:', error);
      throw new Error(error instanceof Error ? error.message : `Événement ${id} introuvable`);
    }
  }

  /**
   * MÉTHODE 8 : CREATE ÉVÉNEMENT
   * POST /api/evenements
   */
  async createEvenement(data: CreateEvenementDTO): Promise<Evenement> {
    try {
      const response = await httpClient.post<Evenement>(
        API_ENDPOINTS.EVENEMENTS,
        data
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Erreur createEvenement:', error);
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        throw new Error(axiosError.response?.data?.message || 'Erreur lors de la création');
      }
      throw new Error('Erreur lors de la création');
    }
  }

  /**
   * MÉTHODE 9 : UPDATE ÉVÉNEMENT
   * PUT /api/evenements/{id}
   */
  async updateEvenement(id: number, data: UpdateEvenementDTO): Promise<Evenement> {
    try {
      const response = await httpClient.put<Evenement>(
        API_ENDPOINTS.EVENEMENT_BY_ID(id),
        data
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Erreur updateEvenement:', error);
      throw new Error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour');
    }
  }

  /**
   * MÉTHODE 10 : DELETE ÉVÉNEMENT
   * DELETE /api/evenements/{id}
   */
  async deleteEvenement(id: number): Promise<void> {
    try {
      await httpClient.delete(API_ENDPOINTS.EVENEMENT_BY_ID(id));
    } catch (error: unknown) {
      console.error('Erreur deleteEvenement:', error);
      throw new Error(error instanceof Error ? error.message : 'Erreur lors de la suppression');
    }
  }
}

export default new ApiService();