import httpClient from '../utils/httpClient';
import { API_ENDPOINTS } from '../config/constants';
import { Utilisateur, CreateUtilisateurDTO, UpdateUtilisateurDTO } from '../types/user.types';

class UserService {
  async getAllUsers(): Promise<Utilisateur[]> {
    try {
      const response = await httpClient.get<Utilisateur[]>(API_ENDPOINTS.USERS);
      return response.data;
    } catch (error: unknown) {
      console.error('Erreur getAllUsers:', error);
      throw new Error(error instanceof Error ? error.message : 'Erreur lors de la récupération des utilisateurs');
    }
  }

  async getUserById(id: number): Promise<Utilisateur> {
    try {
      const response = await httpClient.get<Utilisateur>(
        API_ENDPOINTS.USER_BY_ID(id)
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Erreur getUserById:', error);
      throw new Error(error instanceof Error ? error.message : `Utilisateur ${id} introuvable`);
    }
  }

  async createUser(data: CreateUtilisateurDTO): Promise<Utilisateur> {
    try {
      const response = await httpClient.post<Utilisateur>(
        API_ENDPOINTS.USERS,
        data
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Erreur createUser:', error);
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        throw new Error(axiosError.response?.data?.message || 'Erreur lors de la création');
      }
      throw new Error('Erreur lors de la création');
    }
  }

  async updateUser(id: number, data: UpdateUtilisateurDTO): Promise<Utilisateur> {
    try {
      const response = await httpClient.put<Utilisateur>(
        API_ENDPOINTS.USER_BY_ID(id),
        data
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Erreur updateUser:', error);
      throw new Error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour');
    }
  }

  async deleteUser(id: number): Promise<void> {
    try {
      await httpClient.delete(API_ENDPOINTS.USER_BY_ID(id));
    } catch (error: unknown) {
      console.error('Erreur deleteUser:', error);
      throw new Error(error instanceof Error ? error.message : 'Erreur lors de la suppression');
    }
  }
}

export default new UserService();
