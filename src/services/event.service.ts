import httpClient from '../utils/httpClient';

// ============================================================
// TYPES correspondant exactement à EvenementDTO
// ============================================================

export interface TypeEventDTO {
  idTypeEvent?: number;
  libelleTypeEvent?: string;
}

export interface AdresseDTO {
  idAdresse?: number;
  rue?: string;
  ville?: string;
  codePostal?: string;
  pays?: string;
}

export interface TarifDTO {
  idTarif?: number;
  prix?: number;
  description?: string;
}

export interface UserDTO {
  idUser?: number;
  nom?: string;
  prenom?: string;
  email?: string;
}

export interface Evenement {
  idEvent: number;
  titreEvent: string;
  description: string;
  dateDebut: Date | string;
  dateFin: Date | string;
  image?: string;
  nbPlace: number;
  typeEvent?: TypeEventDTO;
  adresse?: AdresseDTO;
  tarif?: TarifDTO;
  organisateur?: UserDTO;
}

export interface CreateEvenementDto {
  titreEvent: string;
  description: string;
  dateDebut: Date | string;
  dateFin: Date | string;
  image?: string;
  nbPlace: number;
  typeEvent?: TypeEventDTO;
  adresse?: AdresseDTO;
  tarif?: TarifDTO;
  organisateur?: UserDTO;
}

export interface UpdateEvenementDto {
  idEvent: number;        // ⚠️ OBLIGATOIRE — le backend identifie l'event par idEvent dans le body
  titreEvent?: string;
  description?: string;
  dateDebut?: Date | string;
  dateFin?: Date | string;
  image?: string;
  nbPlace?: number;
  typeEvent?: TypeEventDTO;
  adresse?: AdresseDTO;
  tarif?: TarifDTO;
  organisateur?: UserDTO;
}

// ============================================================
// API ENDPOINTS correspondant à EvenementController
// ============================================================
// GET    /api/evenements/all          → getAllEvenements
// GET    /api/evenements/getById/{id} → getEvenementById
// POST   /api/evenements/save         → createEvenement
// PUT    /api/evenements/update       → updateEvenement  (id dans le body)
// DELETE /api/evenements/delete/{id}  → deleteEvenement

const BASE = '/api/evenements';

const EVENEMENT_ENDPOINTS = {
  getAll:       `${BASE}/all`,
  getById:      (id: number) => `${BASE}/getById/${id}`,
  save:         `${BASE}/save`,
  update:       `${BASE}/update`,
  delete:       (id: number) => `${BASE}/delete/${id}`,
};

// ============================================================
// EventService
// ============================================================

class EventService {

  // GET /api/evenements/all
  async getAllEvents(): Promise<Evenement[]> {
    try {
      const response = await httpClient.get<Evenement[]>(EVENEMENT_ENDPOINTS.getAll);
      return response.data;
    } catch (error: unknown) {
      console.error('Erreur getAllEvents:', error);
      throw new Error(error instanceof Error ? error.message : 'Erreur lors de la récupération des événements');
    }
  }

  // GET /api/evenements/getById/{id}
  async getEventById(id: number): Promise<Evenement> {
    try {
      const response = await httpClient.get<Evenement>(EVENEMENT_ENDPOINTS.getById(id));
      return response.data;
    } catch (error: unknown) {
      console.error('Erreur getEventById:', error);
      throw new Error(error instanceof Error ? error.message : `Événement ${id} introuvable`);
    }
  }

  // POST /api/evenements/save
  async createEvent(data: CreateEvenementDto): Promise<Evenement> {
    try {
      const response = await httpClient.post<Evenement>(EVENEMENT_ENDPOINTS.save, data);
      return response.data;
    } catch (error: unknown) {
      console.error('Erreur createEvent:', error);
      throw new Error(error instanceof Error ? error.message : 'Erreur lors de la création');
    }
  }

  // PUT /api/evenements/update  ← l'id est dans le BODY (pas dans l'URL)
  async updateEvent(id: number, data: Omit<UpdateEvenementDto, 'idEvent'>): Promise<Evenement> {
    try {
      const payload: UpdateEvenementDto = {
        ...data,
        idEvent: id,   // ✅ on injecte l'id dans le body pour le backend
      };
      const response = await httpClient.put<Evenement>(EVENEMENT_ENDPOINTS.update, payload);
      return response.data;
    } catch (error: unknown) {
      console.error('Erreur updateEvent:', error);
      throw new Error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour');
    }
  }

  // DELETE /api/evenements/delete/{id}
  async deleteEvent(id: number): Promise<void> {
    try {
      await httpClient.delete(EVENEMENT_ENDPOINTS.delete(id));
    } catch (error: unknown) {
      console.error('Erreur deleteEvent:', error);
      throw new Error(error instanceof Error ? error.message : 'Erreur lors de la suppression');
    }
  }
}

export default new EventService();