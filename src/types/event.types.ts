// /src/types/event.types.ts

// Interface pour l'adresse
export interface Adresse {
  id_adresse: number;
  rue?: string;
  ville?: string;
  code_postal?: string;
  pays?: string;
}

// Interface pour le tarif
export interface Tarif {
  id_tarif: number;
  montant?: number;
  devise?: string;
  type_tarif?: string;
}

// Interface pour le type d'événement
export interface TypeEvent {
  id_type_event: number;
  nom_type?: string;
  description?: string;
}

// Interface pour l'organisateur (utilisateur)
export interface Organisateur {
  id_user: number;
  nom?: string;
  prenom?: string;
  email?: string;
}

// Interface principale Evenement
export interface Evenement {
  id_event: number;
  titre_event: string;
  description: string;
  date_debut: string;
  date_fin: string;
  image?: string;
  nb_place: number;
  
  // IDs des relations
  adresse_id_adresse?: number;
  organisateur_id_user?: number;
  tarif_id_tarif?: number;
  type_event_id_type_event?: number;
  
  // Objets complets (optionnels)
  adresse?: Adresse;
  organisateur?: Organisateur;
  tarif?: Tarif;
  type_event?: TypeEvent;
}

// DTO pour créer un événement
export interface CreateEvenementDto {
  titre_event: string;
  description: string;
  date_debut: string;
  date_fin: string;
  image?: string;
  nb_place: number;
  adresse_id_adresse?: number;
  organisateur_id_user?: number;
  tarif_id_tarif?: number;
  type_event_id_type_event?: number;
}

// DTO pour mettre à jour un événement
export interface UpdateEvenementDto extends Partial<CreateEvenementDto> {
  id_event: number;
}

// Types pour la réponse API
export interface ApiAdresse {
  idAdresse?: number;
  id_adresse?: number;
  rue?: string;
  ville?: string;
  codePostal?: string;
  code_postal?: string;
}

export interface ApiTarif {
  idTarif?: number;
  id_tarif?: number;
  prix?: number;
  montant?: number;
  is_promotion?: boolean;
  type_tarif?: string;
}

export interface ApiTypeEvent {
  idTypeEvent?: number;
  id_type_event?: number;
  nomType?: string;
  nom_type?: string;
  description?: string;
}

export interface ApiOrganisateur {
  idUser?: number;
  id_user?: number;
  nom?: string;
  prenom?: string;
  email?: string;
}

export interface ApiEvenementResponse {
  idEvent?: number;
  id_event?: number;
  titreEvent?: string;
  titre_event?: string;
  description?: string;
  dateDebut?: string;
  date_debut?: string;
  dateFin?: string;
  date_fin?: string;
  image?: string;
  nbPlace?: number;
  nb_place?: number;
  adresse_id_adresse?: number;
  organisateur_id_user?: number;
  tarif_id_tarif?: number;
  type_event_id_type_event?: number;
  adresse?: ApiAdresse;
  tarif?: ApiTarif;
  type_event?: ApiTypeEvent;
  organisateur?: ApiOrganisateur;
}