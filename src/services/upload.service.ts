// src/services/upload.service.ts
import axios, { AxiosError } from 'axios';
import { STORAGE_KEYS } from '../config/constants'; // ✅ IMPORTATION AJOUTÉE

// URL DIRECTE vers votre backend Spring Boot
const BACKEND_URL = 'http://localhost:8081';

const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
  timeout: 10000,
});

// Intercepteur pour ajouter le token - ✅ CORRIGÉ: STORAGE_KEYS.TOKEN
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN); // ✅ CORRIGÉ
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

type UploadResponse = {
  filename: string;
  url: string;
  message: string;
};

// Type pour la réponse de listage des fichiers
type FilesListResponse = {
  folder: string;
  count: number;
  files: string[];
  timestamp: number;
};

// Définir le type pour les erreurs de l'API
type ApiError = {
  message: string;
  [key: string]: unknown;
};

// Type pour la validation d'image
type ImageValidation = {
  valid: boolean;
  error?: string;
};

const uploadService = {
  // URL DE BASE - IMPORTEMENT VOTRE BACKEND
  BASE_URL: BACKEND_URL,
  
  // 🚨 VOS VRAIES IMAGES DU BACKEND
  BACKEND_IMAGES: [
    "event_1767731725433_f04f6f9c.jpg",
    "event_1767732256076_7594c16a.jpg",
    "event_1767732304324_ee1f3d49.jpg",
    "event_1767732541267_a1d12c20.png",
    "event_1767732568405_8b853f8f.jpg"
  ],

  // 🔥 FONCTION PRINCIPALE : Obtenir l'URL d'une image
  getImageUrl(filename: string): string {
    if (!filename || filename.trim() === '') {
      return this.getRandomBackendImage();
    }
    
    // Si déjà une URL complète
    if (filename.startsWith('http')) {
      return filename;
    }
    
    // URL VERS VOTRE BACKEND SPRING BOOT
    return `${this.BASE_URL}/files/${filename}`;
  },

  // 🔥 Récupérer une image aléatoire de VOTRE backend RÉEL
  getRandomBackendImage(): string {
    if (this.BACKEND_IMAGES.length === 0) {
      return `${this.BASE_URL}/files/default.jpg`;
    }
    const randomIndex = Math.floor(Math.random() * this.BACKEND_IMAGES.length);
    return `${this.BASE_URL}/files/${this.BACKEND_IMAGES[randomIndex]}`;
  },

  // 🔥 Récupérer une image par type d'événement (maintenant avec vos VRAIES images)
  getImageForEventType(eventType: string): string {
    const lowerType = eventType.toLowerCase();
    
    // Mapping avec vos VRAIES images du backend
    if (lowerType.includes('festival') || lowerType.includes('jazz') || lowerType.includes('concert')) {
      return `${this.BASE_URL}/files/event_1767732256076_7594c16a.jpg`;
    }
    if (lowerType.includes('exposition') || lowerType.includes('art') || lowerType.includes('galerie')) {
      return `${this.BASE_URL}/files/event_1767732541267_a1d12c20.png`;
    }
    if (lowerType.includes('spectacle') || lowerType.includes('danse') || lowerType.includes('théâtre')) {
      return `${this.BASE_URL}/files/event_1767732304324_ee1f3d49.jpg`;
    }
    if (lowerType.includes('conférence') || lowerType.includes('séminaire') || lowerType.includes('atelier')) {
      return `${this.BASE_URL}/files/event_1767732568405_8b853f8f.jpg`;
    }
    
    // Par défaut, image aléatoire
    return this.getRandomBackendImage();
  },

  // 🔥 Valider une image localement
  validateImage(file: File): ImageValidation {
    // Vérifier le type MIME
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Type de fichier non supporté. Utilisez: ${allowedTypes.join(', ')}`
      };
    }

    // Vérifier la taille (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB en bytes
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Fichier trop volumineux. Maximum 5MB.'
      };
    }

    // Vérifier le nom de fichier
    if (file.name.length > 100) {
      return {
        valid: false,
        error: 'Nom de fichier trop long. Maximum 100 caractères.'
      };
    }

    return { valid: true };
  },

  // Upload image vers le backend
  async uploadImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axiosInstance.post('/files/upload-simple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      const err = error as AxiosError<ApiError>;
      const errorMessage = err.response?.data?.message || 'Erreur lors de l\'upload';
      throw new Error(errorMessage);
    }
  },

  // 🔥 Supprimer une image
  async deleteImage(filename: string): Promise<void> {
    try {
      await axiosInstance.delete(`/files/${filename}`);
    } catch (error) {
      const err = error as AxiosError<ApiError>;
      const errorMessage = err.response?.data?.message || 'Erreur lors de la suppression';
      throw new Error(errorMessage);
    }
  },

  // 🚨 MODIFIÉ : Obtenir toutes les images du backend
  async getAllImages(): Promise<string[]> {
    try {
      const response = await axiosInstance.get<FilesListResponse>('/files/list');
      // Utiliser les images réelles du backend
      if (response.data.files && response.data.files.length > 0) {
        return response.data.files;
      }
      return this.BACKEND_IMAGES; // Fallback sur la liste fixe
    } catch {
      return this.BACKEND_IMAGES; // Fallback sur vos images
    }
  },

  // Tester si le backend répond
  async testBackendConnection(): Promise<boolean> {
    try {
      await axiosInstance.get('/files/list');
      return true;
    } catch {
      return false;
    }
  },

  // Fallback (seulement si tout échoue)
  getDefaultFallback(): string {
    // Même les fallbacks viennent de VOTRE backend
    return `${this.BASE_URL}/files/event_1767731725433_f04f6f9c.jpg`;
  },

  // 🔥 NOUVELLE MÉTHODE : Récupérer l'URL complète d'une image
  getFullImageUrl(filename: string): string {
    return `${this.BASE_URL}/files/${filename}`;
  },

  // 🔥 NOUVELLE MÉTHODE : Mettre à jour dynamiquement la liste d'images
  async refreshBackendImages(): Promise<void> {
    try {
      const response = await axiosInstance.get<FilesListResponse>('/files/list');
      if (response.data.files && response.data.files.length > 0) {
        // Ne pas réassigner, mais mettre à jour la propriété
        (this.BACKEND_IMAGES as string[]) = response.data.files;
        console.log('🔄 Liste des images rafraîchie:', this.BACKEND_IMAGES.length, 'images');
      }
    } catch (error) {
      console.warn('Impossible de rafraîchir la liste des images:', error);
    }
  },

  // 🔥 NOUVELLE MÉTHODE : Obtenir les informations détaillées des fichiers
  async getFilesInfo(): Promise<FilesListResponse | null> {
    try {
      const response = await axiosInstance.get<FilesListResponse>('/files/list');
      return response.data;
    } catch {
      return null;
    }
  }
};

export default uploadService;