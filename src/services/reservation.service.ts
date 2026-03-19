// src/services/reservation.service.ts

import httpClient from '../utils/httpClient';
import { API_ENDPOINTS } from '../config/constants';

// ============================================================
// TYPES correspondant exactement à ReservationDTO
// ============================================================

export interface UserDTO {
  idUser?: number;
  nom?: string;
  prenom?: string;
  email?: string;
}

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

export interface EvenementDTO {
  idEvent?: number;
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

export interface Reservation {
  idReservation: number;
  dateReservation: string;   // LocalDate Java → string ISO "YYYY-MM-DD"
  nbrPersonnes: number;
  user?: UserDTO;
  evenement?: EvenementDTO;
}

export interface CreateReservationDto {
  dateReservation: string;   // "YYYY-MM-DD"
  nbrPersonnes: number;
  user?: UserDTO;
  evenement?: EvenementDTO;
}

export interface UpdateReservationDto {
  idReservation: number;     // ⚠️ OBLIGATOIRE — backend identifie par idReservation dans le body
  dateReservation?: string;
  nbrPersonnes?: number;
  user?: UserDTO;
  evenement?: EvenementDTO;
}

// ============================================================
// ReservationService
// ============================================================
// GET    /api/reservations/all          → getAllReservations
// GET    /api/reservations/getById/{id} → getReservationById
// POST   /api/reservations/save         → createReservation
// PUT    /api/reservations/update       → updateReservation  (id dans le body)
// DELETE /api/reservations/delete/{id}  → deleteReservation

class ReservationService {

  // GET /api/reservations/all
  async getAllReservations(): Promise<Reservation[]> {
    try {
      const response = await httpClient.get<Reservation[]>(
        API_ENDPOINTS.RESERVATIONS_ALL
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Erreur getAllReservations:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Erreur lors de la récupération des réservations'
      );
    }
  }

  // GET /api/reservations/getById/{id}
  async getReservationById(id: number): Promise<Reservation> {
    try {
      const response = await httpClient.get<Reservation>(
        API_ENDPOINTS.RESERVATION_BY_ID(id)
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Erreur getReservationById:', error);
      throw new Error(
        error instanceof Error ? error.message : `Réservation ${id} introuvable`
      );
    }
  }

  // POST /api/reservations/save
  async createReservation(data: CreateReservationDto): Promise<void> {
    try {
      await httpClient.post(API_ENDPOINTS.RESERVATION_SAVE, data);
    } catch (error: unknown) {
      console.error('Erreur createReservation:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Erreur lors de la création de la réservation'
      );
    }
  }

  // PUT /api/reservations/update  ← l'id est dans le BODY (pas dans l'URL)
  async updateReservation(id: number, data: Omit<UpdateReservationDto, 'idReservation'>): Promise<void> {
    try {
      const payload: UpdateReservationDto = {
        ...data,
        idReservation: id,   // ✅ on injecte l'id dans le body pour le backend
      };
      await httpClient.put(API_ENDPOINTS.RESERVATION_UPDATE, payload);
    } catch (error: unknown) {
      console.error('Erreur updateReservation:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Erreur lors de la mise à jour de la réservation'
      );
    }
  }

  // DELETE /api/reservations/delete/{id}
  async deleteReservation(id: number): Promise<void> {
    try {
      await httpClient.delete(API_ENDPOINTS.RESERVATION_DELETE(id));
    } catch (error: unknown) {
      console.error('Erreur deleteReservation:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Erreur lors de la suppression de la réservation'
      );
    }
  }
}

export default new ReservationService();