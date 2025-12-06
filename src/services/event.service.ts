// /src/services/event.service.ts
import axios, { AxiosError } from 'axios';
import { 
  Evenement, 
  CreateEvenementDto, 
  UpdateEvenementDto,
  ApiEvenementResponse
} from '../types/event.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Convertir la réponse API vers notre format
const convertApiEventToEvent = (apiEvent: ApiEvenementResponse): Evenement => {
  // Extraire les valeurs avec gestion des noms de champs différents
  const id_event = apiEvent.idEvent || apiEvent.id_event || 0;
  const titre_event = apiEvent.titreEvent || apiEvent.titre_event || '';
  const description = apiEvent.description || '';
  const date_debut = apiEvent.dateDebut || apiEvent.date_debut || '';
  const date_fin = apiEvent.dateFin || apiEvent.date_fin || '';
  const image = apiEvent.image || '';
  const nb_place = apiEvent.nbPlace || apiEvent.nb_place || 0;
  
  // Construire l'objet tarif si disponible
  let tarif;
  if (apiEvent.tarif) {
    const tarifId = apiEvent.tarif.idTarif || apiEvent.tarif.id_tarif || 0;
    const montant = apiEvent.tarif.prix || apiEvent.tarif.montant || 0;
    const type_tarif = apiEvent.tarif.type_tarif || (apiEvent.tarif.is_promotion ? 'Promotion' : 'Standard');
    
    tarif = {
      id_tarif: tarifId,
      montant,
      devise: 'EUR',
      type_tarif
    };
  } else if (apiEvent.tarif_id_tarif) {
    tarif = {
      id_tarif: apiEvent.tarif_id_tarif,
      montant: 0,
      devise: 'EUR'
    };
  }
  
  // Construire l'objet type_event si disponible
  let type_event;
  if (apiEvent.type_event) {
    type_event = {
      id_type_event: apiEvent.type_event.idTypeEvent || apiEvent.type_event.id_type_event || 0,
      nom_type: apiEvent.type_event.nomType || apiEvent.type_event.nom_type || 'Non spécifié'
    };
  } else if (apiEvent.type_event_id_type_event) {
    type_event = {
      id_type_event: apiEvent.type_event_id_type_event,
      nom_type: 'Non spécifié'
    };
  }
  
  // Construire l'objet adresse si disponible
  let adresse;
  if (apiEvent.adresse) {
    adresse = {
      id_adresse: apiEvent.adresse.idAdresse || apiEvent.adresse.id_adresse || 0,
      rue: apiEvent.adresse.rue,
      ville: apiEvent.adresse.ville,
      code_postal: apiEvent.adresse.codePostal || apiEvent.adresse.code_postal
    };
  }
  
  // Construire l'objet organisateur si disponible
  let organisateur;
  if (apiEvent.organisateur) {
    organisateur = {
      id_user: apiEvent.organisateur.idUser || apiEvent.organisateur.id_user || 0,
      nom: apiEvent.organisateur.nom,
      prenom: apiEvent.organisateur.prenom,
      email: apiEvent.organisateur.email
    };
  }
  
  return {
    id_event,
    titre_event,
    description,
    date_debut,
    date_fin,
    image,
    nb_place,
    adresse_id_adresse: apiEvent.adresse_id_adresse,
    organisateur_id_user: apiEvent.organisateur_id_user,
    tarif_id_tarif: apiEvent.tarif_id_tarif,
    type_event_id_type_event: apiEvent.type_event_id_type_event,
    adresse,
    organisateur,
    tarif,
    type_event
  };
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const eventService = {
  async getAllEvents(): Promise<Evenement[]> {
    try {
      console.log('Fetching events from:', `${API_URL}/evenements/all`);
      const response = await axiosInstance.get<ApiEvenementResponse[]>('/evenements/all'); // CHANGÉ ICI
      console.log('API Response:', response.data);
      
      // Convertir les données de l'API vers le format attendu
      if (Array.isArray(response.data)) {
        const events = response.data
          .map(convertApiEventToEvent)
          .filter(event => event.titre_event && event.titre_event.trim() !== '');
        
        console.log('Events convertis:', events);
        return events;
      }
      
      console.warn('La réponse de l\'API n\'est pas un tableau:', response.data);
      return [];
    } catch (error: unknown) {
      console.error('Erreur lors du chargement des événements:');
      
      if (error instanceof Error) {
        console.error('Message:', error.message);
      }
      
      if (axios.isAxiosError(error)) {
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        console.error('URL:', error.config?.url);
      }
      
      throw new Error('Impossible de charger les événements. Veuillez réessayer.');
    }
  },

  async getEventById(id: number): Promise<Evenement> {
    try {
      const response = await axiosInstance.get<ApiEvenementResponse>(`/evenements/${id}`);
      return convertApiEventToEvent(response.data);
    } catch (error: unknown) {
      console.error(`Erreur lors du chargement de l'événement ${id}:`, error);
      
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error(`Événement avec ID ${id} non trouvé`);
      }
      
      throw new Error('Impossible de charger l\'événement. Veuillez réessayer.');
    }
  },

  async createEvent(event: CreateEvenementDto): Promise<Evenement> {
    try {
      // Convertir au format API
      const apiEvent = {
        titreEvent: event.titre_event,
        description: event.description,
        dateDebut: event.date_debut,
        dateFin: event.date_fin,
        image: event.image,
        nbPlace: event.nb_place,
        adresseIdAdresse: event.adresse_id_adresse,
        organisateurIdUser: event.organisateur_id_user,
        tarifIdTarif: event.tarif_id_tarif,
        typeEventIdTypeEvent: event.type_event_id_type_event
      };
      
      const response = await axiosInstance.post<ApiEvenementResponse>('/evenements', apiEvent);
      return convertApiEventToEvent(response.data);
    } catch (error: unknown) {
      console.error('Erreur lors de la création de l\'événement:', error);
      
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        throw new Error('Données invalides. Veuillez vérifier les informations saisies.');
      }
      
      throw new Error('Impossible de créer l\'événement. Veuillez réessayer.');
    }
  },

  async updateEvent(id: number, event: UpdateEvenementDto): Promise<Evenement> {
    try {
      const apiEvent = {
        titreEvent: event.titre_event,
        description: event.description,
        dateDebut: event.date_debut,
        dateFin: event.date_fin,
        image: event.image,
        nbPlace: event.nb_place,
        adresseIdAdresse: event.adresse_id_adresse,
        organisateurIdUser: event.organisateur_id_user,
        tarifIdTarif: event.tarif_id_tarif,
        typeEventIdTypeEvent: event.type_event_id_type_event
      };
      
      const response = await axiosInstance.put<ApiEvenementResponse>(`/evenements/${id}`, apiEvent);
      return convertApiEventToEvent(response.data);
    } catch (error: unknown) {
      console.error(`Erreur lors de la modification de l'événement ${id}:`, error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error(`Événement avec ID ${id} non trouvé`);
        }
        if (error.response?.status === 400) {
          throw new Error('Données invalides. Veuillez vérifier les informations saisies.');
        }
      }
      
      throw new Error('Impossible de modifier l\'événement. Veuillez réessayer.');
    }
  },

  async deleteEvent(id: number): Promise<void> {
    try {
      await axiosInstance.delete(`/evenements/${id}`);
    } catch (error: unknown) {
      console.error(`Erreur lors de la suppression de l'événement ${id}:`, error);
      
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error(`Événement avec ID ${id} non trouvé`);
      }
      
      throw new Error('Impossible de supprimer l\'événement. Veuillez réessayer.');
    }
  },

  async searchEvents(query: string): Promise<Evenement[]> {
    try {
      const response = await axiosInstance.get<ApiEvenementResponse[]>('/evenements/search', {
        params: { q: query }
      });
      
      if (Array.isArray(response.data)) {
        return response.data.map(convertApiEventToEvent);
      }
      
      return [];
    } catch (error: unknown) {
      console.error('Erreur lors de la recherche d\'événements:', error);
      throw new Error('Impossible d\'effectuer la recherche. Veuillez réessayer.');
    }
  },
};

export default eventService;