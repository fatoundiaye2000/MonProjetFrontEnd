// src/types/event.types.ts

export interface TypeEventDTO {
  idTypeEvent?: number;
  nomType?: string;
}

export interface AdresseDTO {
  idAdresse?: number;
  rue?: string;
  ville?: string;
  codePostal?: string;
}

export interface TarifDTO {
  idTarif?: number;
  prix?: number;
  isPromotion?: boolean;
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
  description?: string;
  dateDebut: string;
  dateFin?: string;
  image?: string;
  nbPlace?: number;
  typeEvent?: TypeEventDTO;
  adresse?: AdresseDTO;
  tarif?: TarifDTO;
  organisateur?: UserDTO;
}

export interface CreateEvenementDto {
  titreEvent: string;
  description?: string;
  dateDebut: string;
  dateFin?: string;
  image?: string;
  nbPlace?: number;
  typeEvent?: TypeEventDTO;
  adresse?: AdresseDTO;
  tarif?: TarifDTO;
  organisateur?: UserDTO;
}

export interface UpdateEvenementDto {
  idEvent: number;
  titreEvent?: string;
  description?: string;
  dateDebut?: string;
  dateFin?: string;
  image?: string;
  nbPlace?: number;
  typeEvent?: TypeEventDTO;
  adresse?: AdresseDTO;
  tarif?: TarifDTO;
  organisateur?: UserDTO;
}