import httpClient from '../utils/httpClient';
import { API_ENDPOINTS, STORAGE_KEYS } from '../config/constants'; // ✅ IMPORTATION AJOUTÉE
import { Utilisateur, CreateUtilisateurDTO, UpdateUtilisateurDTO } from '../types/user.types';
import { Evenement, CreateEvenementDto, UpdateEvenementDto } from '../types/event.types';

class ApiService {
  async getAllUtilisateurs(): Promise<Utilisateur[]> {
    try {
      console.log('📡 [ApiService] getAllUtilisateurs');
      const response = await httpClient.get<Utilisateur[]>(API_ENDPOINTS.USERS);
      console.log(`✅ [ApiService] getAllUtilisateurs réussi: ${response.data.length} utilisateurs`);
      return response.data;
    } catch (error: unknown) {
      console.error('❌ [ApiService] Erreur getAllUtilisateurs:', error);
      
      // ✅ CORRIGÉ: Utilisez STORAGE_KEYS
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          // Token expiré ou invalide
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
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
      console.log(`📡 [ApiService] getUtilisateurById: ${id}`);
      const response = await httpClient.get<Utilisateur>(
        API_ENDPOINTS.USER_BY_ID(id)
      );
      console.log(`✅ [ApiService] getUtilisateurById réussi`);
      return response.data;
    } catch (error: unknown) {
      console.error('❌ [ApiService] Erreur getUtilisateurById:', error);
      throw new Error(`Utilisateur ${id} introuvable`);
    }
  }

  async createUtilisateur(data: CreateUtilisateurDTO): Promise<Utilisateur> {
    try {
      console.log('📡 [ApiService] createUtilisateur');
      const response = await httpClient.post<Utilisateur>(
        API_ENDPOINTS.USERS,
        data
      );
      console.log('✅ [ApiService] createUtilisateur réussi');
      return response.data;
    } catch (error: unknown) {
      console.error('❌ [ApiService] Erreur createUtilisateur:', error);
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        throw new Error(axiosError.response?.data?.message || 'Erreur lors de la création');
      }
      
      throw new Error('Erreur lors de la création');
    }
  }

  async updateUtilisateur(id: number, data: UpdateUtilisateurDTO): Promise<Utilisateur> {
    try {
      console.log(`📡 [ApiService] updateUtilisateur: ${id}`);
      const response = await httpClient.put<Utilisateur>(
        API_ENDPOINTS.USER_BY_ID(id),
        data
      );
      console.log('✅ [ApiService] updateUtilisateur réussi');
      return response.data;
    } catch (error: unknown) {
      console.error('❌ [ApiService] Erreur updateUtilisateur:', error);
      throw new Error('Erreur lors de la mise à jour');
    }
  }

  async deleteUtilisateur(id: number): Promise<void> {
    try {
      console.log(`📡 [ApiService] deleteUtilisateur: ${id}`);
      await httpClient.delete(API_ENDPOINTS.USER_BY_ID(id));
      console.log('✅ [ApiService] deleteUtilisateur réussi');
    } catch (error: unknown) {
      console.error('❌ [ApiService] Erreur deleteUtilisateur:', error);
      throw new Error('Erreur lors de la suppression');
    }
  }

  async getAllEvenements(): Promise<Evenement[]> {
    try {
      console.log('📡 [ApiService] getAllEvenements');
      const response = await httpClient.get<Evenement[]>(API_ENDPOINTS.EVENEMENTS);
      console.log(`✅ [ApiService] getAllEvenements réussi: ${response.data.length} événements`);
      return response.data;
    } catch (error: unknown) {
      console.error('❌ [ApiService] Erreur getAllEvenements:', error);
      throw new Error('Erreur lors de la récupération des événements');
    }
  }

  async getEvenementById(id: number): Promise<Evenement> {
    try {
      console.log(`📡 [ApiService] getEvenementById: ${id}`);
      const response = await httpClient.get<Evenement>(
        API_ENDPOINTS.EVENEMENT_BY_ID(id)
      );
      console.log('✅ [ApiService] getEvenementById réussi');
      return response.data;
    } catch (error: unknown) {
      console.error('❌ [ApiService] Erreur getEvenementById:', error);
      throw new Error(`Événement ${id} introuvable`);
    }
  }

  async createEvenement(data: CreateEvenementDto): Promise<Evenement> {
    try {
      console.log('📡 [ApiService] createEvenement');
      const response = await httpClient.post<Evenement>(
        API_ENDPOINTS.EVENEMENTS,
        data
      );
      console.log('✅ [ApiService] createEvenement réussi');
      return response.data;
    } catch (error: unknown) {
      console.error('❌ [ApiService] Erreur createEvenement:', error);
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        throw new Error(axiosError.response?.data?.message || 'Erreur lors de la création');
      }
      
      throw new Error('Erreur lors de la création');
    }
  }

  async updateEvenement(id: number, data: UpdateEvenementDto): Promise<Evenement> {
    try {
      console.log(`📡 [ApiService] updateEvenement: ${id}`);
      const response = await httpClient.put<Evenement>(
        API_ENDPOINTS.EVENEMENT_BY_ID(id),
        data
      );
      console.log('✅ [ApiService] updateEvenement réussi');
      return response.data;
    } catch (error: unknown) {
      console.error('❌ [ApiService] Erreur updateEvenement:', error);
      throw new Error('Erreur lors de la mise à jour');
    }
  }

  async deleteEvenement(id: number): Promise<void> {
    try {
      console.log(`📡 [ApiService] deleteEvenement: ${id}`);
      await httpClient.delete(API_ENDPOINTS.EVENEMENT_BY_ID(id));
      console.log('✅ [ApiService] deleteEvenement réussi');
    } catch (error: unknown) {
      console.error('❌ [ApiService] Erreur deleteEvenement:', error);
      throw new Error('Erreur lors de la suppression');
    }
  }
}

export default new ApiService();