import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import uploadService from '../services/upload.service';

type FilesListResponse = {
  folder: string;
  count: number;
  files: string[];
  timestamp: number;
};

export default function BackendImagesGallery() {
  const [images, setImages] = useState<string[]>([]);
  const [filesInfo, setFilesInfo] = useState<FilesListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadImages = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Récupérer les infos détaillées
      const info = await uploadService.getFilesInfo();
      if (info) {
        setFilesInfo(info);
      }
      
      // Récupérer la liste des images
      const backendImages = await uploadService.getAllImages();
      setImages(backendImages);
      console.log(`✅ ${backendImages.length} images chargées depuis le backend`);
    } catch (err) {
      setError('Erreur lors du chargement des images depuis le backend');
      console.error('❌ Erreur:', err);
      setImages(uploadService.BACKEND_IMAGES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  const handleRefresh = () => {
    loadImages();
  };

  const handleDelete = async (filename: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'image "${filename}" ?`)) return;
    
    try {
      setDeleting(filename);
      await uploadService.deleteImage(filename);
      
      // Rafraîchir la liste des images du service
      await uploadService.refreshBackendImages();
      
      // Recharger la liste affichée
      await loadImages();
      
      alert('✅ Image supprimée avec succès');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      alert(`❌ ${errorMessage}`);
    } finally {
      setDeleting(null);
    }
  };

  const handleUploadNew = () => {
    // Rediriger vers la page de création d'événement pour uploader
    window.location.href = '/create-event';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📁 Gestion des Images Backend</h1>
              <p className="text-gray-600 mt-2">
                Images stockées sur votre serveur Spring Boot
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Rafraîchir
              </button>
              <button
                onClick={handleUploadNew}
                className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Uploader une image
              </button>
              <Link
                to="/"
                className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Retour
              </Link>
            </div>
          </div>

          {/* Informations backend */}
          {filesInfo && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Informations du Backend</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Dossier de stockage</div>
                  <div className="text-lg font-mono text-gray-900 truncate" title={filesInfo.folder}>
                    {filesInfo.folder}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Nombre d'images</div>
                  <div className="text-3xl font-bold text-purple-600">{filesInfo.count}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Dernière mise à jour</div>
                  <div className="text-lg font-medium text-gray-900">
                    {new Date(filesInfo.timestamp).toLocaleString('fr-FR')}
                  </div>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                <p>📌 Toutes les images sont servies depuis : <code className="bg-gray-200 px-2 py-1 rounded">http://localhost:8081/files/</code></p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}
        </div>

        {/* Galerie d'images */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">🎨 Galerie des Images ({images.length})</h2>
            <div className="text-sm text-gray-500">
              Cliquez sur une image pour l'ouvrir
            </div>
          </div>

          {images.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Aucune image disponible</h3>
              <p className="text-gray-600 mb-6">Le backend ne contient aucune image pour le moment.</p>
              <button
                onClick={handleUploadNew}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 font-medium"
              >
                Uploader votre première image
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {images.map((filename, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {/* Image */}
                  <div className="h-48 overflow-hidden bg-gray-100 relative">
                    <a 
                      href={uploadService.getImageUrl(filename)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block w-full h-full"
                    >
                      <img
                        src={uploadService.getImageUrl(filename)}
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = uploadService.getDefaultFallback();
                        }}
                      />
                    </a>
                    {/* Badge de suppression en cours */}
                    {deleting === filename && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>
                  
                  {/* Informations */}
                  <div className="p-4">
                    <div className="mb-2">
                      <div className="text-xs text-gray-500 truncate mb-1" title={filename}>
                        {filename}
                      </div>
                      <div className="text-sm font-medium text-gray-900 truncate">
                        Image {index + 1}
                      </div>
                    </div>
                    
                    {/* Boutons d'action */}
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <a
                          href={uploadService.getImageUrl(filename)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          Ouvrir
                        </a>
                        <button
                          onClick={() => navigator.clipboard.writeText(uploadService.getImageUrl(filename))}
                          className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                          title="Copier l'URL"
                        >
                          Copier URL
                        </button>
                      </div>
                      
                      <button
                        onClick={() => handleDelete(filename)}
                        disabled={deleting === filename}
                        className="px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                        title="Supprimer"
                      >
                        {deleting === filename ? 'Suppression...' : 'Supprimer'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pied de page de la galerie */}
          {images.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  <p>📌 Conseil : Utilisez le nom de fichier dans vos événements pour référencer ces images.</p>
                </div>
                <div className="text-sm">
                  <a
                    href="http://localhost:8081/files/list"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-800"
                  >
                    Voir la liste API complète →
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">📚 Comment utiliser ces images</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">1. Dans vos événements</h4>
              <p className="text-sm text-gray-600">
                Lorsque vous créez un événement, utilisez simplement le nom du fichier (ex: <code className="bg-gray-200 px-1 py-0.5 rounded">event_1767732256076_7594c16a.jpg</code>) dans le champ "image".
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">2. Dans votre code</h4>
              <p className="text-sm text-gray-600">
                Utilisez <code className="bg-gray-200 px-1 py-0.5 rounded">uploadService.getImageUrl(filename)</code> pour obtenir l'URL complète de l'image.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}