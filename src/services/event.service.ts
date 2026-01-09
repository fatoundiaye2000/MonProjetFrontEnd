import httpClient from '../utils/httpClient';
import { API_ENDPOINTS } from '../config/constants';
import { Evenement, CreateEvenementDto, UpdateEvenementDto } from '../types/event.types';

class EventService {
  async getAllEvents(): Promise<Evenement[]> {
    try {
      const response = await httpClient.get<Evenement[]>(API_ENDPOINTS.EVENEMENTS);
      return response.data;
    } catch (error: unknown) {
      console.error('Erreur getAllEvents:', error);
      throw new Error(error instanceof Error ? error.message : 'Erreur lors de la récupération des événements');
    }
  }

  async getEventById(id: number): Promise<Evenement> {
    try {
      const response = await httpClient.get<Evenement>(
        API_ENDPOINTS.EVENEMENT_BY_ID(id)
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Erreur getEventById:', error);
      throw new Error(error instanceof Error ? error.message : `Événement ${id} introuvable`);
    }
  }

  async createEvent(data: CreateEvenementDto): Promise<Evenement> {
    try {
      const response = await httpClient.post<Evenement>(
        API_ENDPOINTS.EVENEMENTS,
        data
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Erreur createEvent:', error);
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        throw new Error(axiosError.response?.data?.message || 'Erreur lors de la création');
      }
      throw new Error('Erreur lors de la création');
    }
  }

  async updateEvent(id: number, data: UpdateEvenementDto): Promise<Evenement> {
    try {
      const response = await httpClient.put<Evenement>(
        API_ENDPOINTS.EVENEMENT_BY_ID(id),
        data
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Erreur updateEvent:', error);
      throw new Error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour');
    }
  }

  async deleteEvent(id: number): Promise<void> {
    try {
      await httpClient.delete(API_ENDPOINTS.EVENEMENT_BY_ID(id));
    } catch (error: unknown) {
      console.error('Erreur deleteEvent:', error);
      throw new Error(error instanceof Error ? error.message : 'Erreur lors de la suppression');
    }
  }
}

export default new EventService();