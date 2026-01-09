import { useState, useRef, useEffect } from 'react';
import uploadService from '../services/upload.service';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageFilename: string) => void;
  onImageDelete?: () => void;
  disabled?: boolean;
}

export default function ImageUpload({ 
  currentImage, 
  onImageChange, 
  onImageDelete,
  disabled = false
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mettre à jour la preview quand currentImage change
  useEffect(() => {
    console.log('🔄 ImageUpload - currentImage changé:', currentImage);
    
    if (currentImage) {
      // Si currentImage est déjà une URL complète
      if (currentImage.startsWith('http') || currentImage.startsWith('data:')) {
        setPreview(currentImage);
        console.log('🔗 Preview définie (URL complète):', currentImage.substring(0, 50) + '...');
      } else {
        // Sinon, construire l'URL via le service
        const imageUrl = uploadService.getImageUrl(currentImage);
        setPreview(imageUrl);
        console.log('🔗 Preview construite:', imageUrl);
      }
    } else {
      setPreview('');
      console.log('🔄 Preview réinitialisée');
    }
  }, [currentImage]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('📤 ImageUpload - Fichier sélectionné:', file.name);
    setError('');

    // Valider le fichier
    const validation = uploadService.validateImage(file);
    if (!validation.valid) {
      setError(validation.error || 'Fichier invalide');
      console.error('❌ Validation échouée:', validation.error);
      return;
    }

    console.log('✅ Fichier validé, création preview locale...');

    // Créer un aperçu local immédiatement
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      console.log('🖼️ Preview locale créée');
    };
    reader.readAsDataURL(file);

    // Upload le fichier vers le backend
    try {
      console.log('🚀 Début upload vers backend Spring Boot...');
      setUploading(true);
      
      const response = await uploadService.uploadImage(file);
      
      console.log('✅ Upload réussi, réponse:', response);
      
      // Le backend doit retourner response.filename
      if (!response.filename) {
        throw new Error('Le backend n\'a pas retourné de nom de fichier');
      }
      
      console.log('📤 Passage du filename au parent:', response.filename);
      onImageChange(response.filename);
      
      // 🚨 RAFRAÎCHIR la liste des images du backend
      try {
        await uploadService.refreshBackendImages();
        console.log('🔄 Liste des images du backend rafraîchie');
      } catch (refreshError) {
        console.warn('⚠️ Impossible de rafraîchir la liste d\'images:', refreshError);
      }
      
      // Mettre à jour l'aperçu
      if (response.url) {
        setPreview(response.url);
        console.log('🔗 Preview mise à jour avec URL API:', response.url);
      } else {
        const fallbackUrl = uploadService.getImageUrl(response.filename);
        setPreview(fallbackUrl);
        console.log('🔗 Preview mise à jour avec URL Spring Boot:', fallbackUrl);
      }
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'upload';
      console.error('❌ Erreur upload:', errorMessage);
      setError(errorMessage);
      
      // En cas d'erreur, restaurer l'ancienne image si elle existe
      if (currentImage) {
        const oldPreview = uploadService.getImageUrl(currentImage);
        setPreview(oldPreview);
        console.log('↩️ Restauration ancienne preview:', oldPreview);
      } else {
        setPreview('');
      }
    } finally {
      setUploading(false);
      // Réinitialiser l'input file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      console.log('🏁 Upload terminé (succès ou échec)');
    }
  };

  const handleDelete = async () => {
    if (!currentImage) {
      console.log('⚠️ Aucune image à supprimer');
      return;
    }

    console.log('🗑️ Demande suppression:', currentImage);

    try {
      // Appeler le service de suppression
      await uploadService.deleteImage(currentImage);
      
      // 🚨 RAFRAÎCHIR la liste des images du backend
      try {
        await uploadService.refreshBackendImages();
        console.log('🔄 Liste des images rafraîchie après suppression');
      } catch (refreshError) {
        console.warn('⚠️ Impossible de rafraîchir la liste d\'images:', refreshError);
      }
      
      // Réinitialiser les états
      setPreview('');
      setError('');
      
      // Notifier le parent
      if (onImageDelete) {
        onImageDelete();
      }
      
      console.log('✅ Suppression réussie côté frontend');
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      console.error('❌ Erreur suppression:', errorMessage);
      setError(errorMessage);
    }
  };

  const handleClick = () => {
    if (!disabled && !uploading) {
      console.log('🖱️ Clic sur zone upload');
      fileInputRef.current?.click();
    } else {
      console.log('⏸️ Upload désactivé ou en cours');
    }
  };

  // Fonction fallback avec vos images Spring Boot
  const getFallbackImage = (): string => {
    return uploadService.getRandomBackendImage();
  };

  // Gestion d'erreur améliorée
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    console.error('❌ Erreur chargement image preview:', preview);
    
    // FALLBACK SUR VOTRE BACKEND SPRING BOOT
    const fallbackImage = getFallbackImage();
    target.src = fallbackImage;
    target.onerror = null; // Éviter les boucles infinies
    
    console.log('🔄 Fallback vers:', fallbackImage);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Image de l'événement
      </label>

      {/* Zone d'aperçu */}
      <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-purple-400 transition-colors">
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Aperçu"
              className="w-full h-48 object-cover rounded-lg"
              onError={handleImageError}
            />
            {/* Boutons d'action sur l'image */}
            <div className="absolute top-2 right-2 flex gap-2">
              {/* Bouton Modifier */}
              <button
                type="button"
                onClick={handleClick}
                className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                disabled={disabled || uploading}
                title="Changer l'image"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              {/* Bouton Supprimer */}
              <button
                type="button"
                onClick={handleDelete}
                className="p-2 bg-white rounded-lg shadow-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                disabled={disabled || uploading}
                title="Supprimer l'image"
              >
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          // Zone de clic pour ajouter une image
          <button
            type="button"
            onClick={handleClick}
            className="w-full h-48 flex flex-col items-center justify-center text-gray-500 hover:text-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={disabled || uploading}
          >
            <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium">
              {uploading ? 'Upload en cours...' : 'Cliquez pour sélectionner une image'}
            </span>
            <span className="text-xs text-gray-400 mt-1">
              JPG, PNG, GIF ou WebP (max 5MB)
            </span>
            <span className="text-xs text-blue-500 mt-2">
              Stocké sur Spring Boot: localhost:8081/files/
            </span>
          </button>
        )}
      </div>

      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      {/* Message d'erreur */}
      {error && (
        <div className="text-sm text-red-600 mt-2 bg-red-50 border border-red-200 rounded p-2 animate-pulse">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Indicateur de chargement */}
      {uploading && (
        <div className="flex items-center gap-2 text-sm text-purple-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
          <span>Upload vers Spring Boot... Patientez</span>
        </div>
      )}

      {/* Info debug */}
      {currentImage && (
        <div className="text-xs text-gray-500 mt-1">
          <div className="truncate">
            <strong>Fichier Spring Boot:</strong> {currentImage}
          </div>
          <div className="truncate">
            <strong>URL:</strong> {uploadService.getImageUrl(currentImage).substring(0, 60)}...
          </div>
          {currentImage && !currentImage.startsWith('http') && (
            <div className="mt-1 text-blue-600">
              <a 
                href={uploadService.getImageUrl(currentImage)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs hover:text-blue-800"
              >
                🔗 Ouvrir l'image dans un nouvel onglet
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}