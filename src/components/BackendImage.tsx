import { useState, useEffect } from 'react';
import uploadService from '../services/upload.service';

interface BackendImageProps {
  /** Nom du fichier image dans Spring Boot (ex: "event_1767377238051_45570901.jpg") */
  filename?: string;
  
  /** Type d'événement pour choisir une image appropriée */
  eventType?: string;
  
  /** Classes CSS pour le conteneur de l'image */
  className?: string;
  
  /** Texte alternatif pour l'accessibilité */
  alt?: string;
  
  /** Fonction appelée quand l'image est chargée */
  onLoad?: () => void;
  
  /** Fonction appelée en cas d'erreur de chargement */
  onError?: () => void;
}

/**
 * Composant intelligent pour afficher les images depuis le backend Spring Boot
 * - Utilise uniquement les images de votre backend
 * - Fallback intelligent en cas d'erreur
 * - Choix d'image basé sur le type d'événement
 */
export default function BackendImage({ 
  filename, 
  eventType, 
  className = '', 
  alt = 'Image événement culturel',
  onLoad,
  onError
}: BackendImageProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Charger l'image
  useEffect(() => {
    const loadImage = () => {
      setLoading(true);
      setError(false);

      try {
        let url = '';
        
        console.log('🖼️ BackendImage - Chargement image:', { filename, eventType });

        // 1. Priorité : Filename spécifique
        if (filename && filename.trim() !== '') {
          url = uploadService.getImageUrl(filename);
          console.log('   → URL spécifique:', url);
        }
        // 2. Sinon : Basé sur le type d'événement
        else if (eventType && eventType.trim() !== '') {
          url = uploadService.getImageForEventType(eventType);
          console.log('   → URL par type:', url, 'pour', eventType);
        }
        // 3. Sinon : Image aléatoire du backend
        else {
          url = uploadService.getRandomBackendImage();
          console.log('   → URL aléatoire:', url);
        }

        // 🔥 CORRECTION : Ne pas tester avec fetch pour éviter les problèmes CORS
        // Simplement définir l'URL, la balise <img> gérera l'erreur
        setImageUrl(url);
        console.log('   ✅ URL définie, chargement par <img>');
        
      } catch (err) {
        console.error('❌ Erreur dans loadImage:', err);
        setError(true);
        
        // Fallback sur une image sûre du backend
        const fallbackUrl = uploadService.getDefaultFallback();
        setImageUrl(fallbackUrl);
        console.log('   🔄 Fallback sur image par défaut:', fallbackUrl);
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [filename, eventType]); // 🔥 Supprimé attempts des dépendances

  // Gestion d'erreur côté client
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    console.warn('⚠️ Erreur chargement côté client pour:', imageUrl);
    
    if (onError) {
      onError();
    }

    setError(true);
    
    // 🔥 AMÉLIORATION : Fallback intelligent selon le type
    let fallbackUrl = '';
    
    if (eventType) {
      // Essayer une image par type
      fallbackUrl = uploadService.getImageForEventType(eventType);
    } else if (filename && filename.includes('festival')) {
      fallbackUrl = uploadService.getImageUrl("event_1767732256076_7594c16a.jpg");
    } else if (filename && (filename.includes('exposition') || filename.includes('art'))) {
      fallbackUrl = uploadService.getImageUrl("event_1767732541267_a1d12c20.png");
    } else {
      // Image par défaut
      fallbackUrl = uploadService.getDefaultFallback();
    }
    
    target.src = fallbackUrl;
    
    // Ne pas permettre plus d'une tentative de fallback
    target.onerror = () => {
      target.src = uploadService.getDefaultFallback();
      target.onerror = null;
    };
    
    console.log('   🔄 Fallback client vers:', fallbackUrl);
  };

  // Gestion du chargement réussi
  const handleImageLoad = () => {
    console.log('✅ Image chargée avec succès:', imageUrl);
    setError(false);
    if (onLoad) {
      onLoad();
    }
  };

  // État de chargement
  if (loading) {
    return (
      <div className={`${className} bg-gray-200 animate-pulse rounded-lg flex items-center justify-center`}>
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"></div>
          <span className="text-xs text-gray-600">Chargement...</span>
          <span className="text-xs text-gray-400 mt-1">
            {filename ? filename.substring(0, 20) + '...' : 'Image Spring Boot'}
          </span>
        </div>
      </div>
    );
  }

  // État d'erreur (après chargement)
  if (error && !imageUrl) {
    return (
      <div className={`${className} bg-red-50 border border-red-200 rounded-lg flex flex-col items-center justify-center p-4`}>
        <svg className="w-12 h-12 text-red-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm text-red-600">Image non disponible</span>
        <span className="text-xs text-red-500 mt-1">Spring Boot: localhost:8081</span>
      </div>
    );
  }

  // Affichage normal de l'image
  return (
    <div className="relative">
      <img
        src={imageUrl}
        alt={alt}
        className={className}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
      />
      
      {/* Badge d'information debug (seulement en développement) */}
      {process.env.NODE_ENV === 'development' && filename && (
        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-50 hover:opacity-100 transition-opacity cursor-help"
             title={`Fichier: ${filename}\nURL: ${imageUrl}`}>
          📁 {filename.substring(0, 10)}...
        </div>
      )}
      
      {/* Badge d'erreur si problème */}
      {error && (
        <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded animate-pulse">
          ⚠️ Fallback
        </div>
      )}
    </div>
  );
}