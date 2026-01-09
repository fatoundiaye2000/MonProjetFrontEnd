import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import apiService from '../services/api';
import DashboardNav from '../components/DashboardNav';
import EventModal from '../components/EventModal';
import { Evenement, CreateEvenementDto, UpdateEvenementDto } from '../types/event.types';
import uploadService from '../services/upload.service';

export default function Events() {
  const [events, setEvents] = useState<Evenement[]>([]);
  const [backendImages, setBackendImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Evenement | undefined>();

  const { user, logout } = useAuth();

  useEffect(() => {
    loadEvents();
    loadBackendImages();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiService.getAllEvenements();
      setEvents(data);
      console.log(`✅ ${data.length} événements chargés`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des événements';
      setError(errorMessage);
      console.error('❌ Erreur chargement événements:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadBackendImages = async () => {
    try {
      console.log('🔄 Chargement images backend depuis Events...');
      const images = await uploadService.getAllImages();
      setBackendImages(images);
      console.log(`✅ ${images.length} images réelles chargées depuis le backend`);
    } catch (err) {
      console.error('❌ Erreur chargement images:', err);
      setBackendImages(uploadService.BACKEND_IMAGES);
    }
  };

  const handleOpenCreateModal = () => {
    setSelectedEvent(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (event: Evenement) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(undefined);
  };

  const handleSaveEvent = async (data: CreateEvenementDto | UpdateEvenementDto) => {
    try {
      setModalLoading(true);
      
      if (selectedEvent) {
        const updateData: UpdateEvenementDto = {
          ...data,
          id_event: selectedEvent.id_event
        };
        await apiService.updateEvenement(selectedEvent.id_event, updateData);
        console.log(`📝 Événement ${selectedEvent.id_event} mis à jour`);
      } else {
        await apiService.createEvenement(data as CreateEvenementDto);
        console.log('📝 Nouvel événement créé');
      }
      
      await loadEvents();
      await loadBackendImages(); // 🚨 RAFRAÎCHIR les images après création/modification
      setIsModalOpen(false);
      setSelectedEvent(undefined);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement';
      console.error('❌ Erreur sauvegarde:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      return;
    }

    try {
      await apiService.deleteEvenement(id);
      console.log(`🗑️ Événement ${id} supprimé`);
      await loadEvents();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(errorMessage);
      console.error('❌ Erreur suppression:', err);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString || dateString.trim() === '') {
        return 'Date non définie';
      }
      
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return 'Date invalide';
      }
      
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Date invalide';
    }
  };

  // 🔥 FONCTION CORRIGÉE : Utilise UNIQUEMENT vos VRAIES images Spring Boot
  const getEventImage = (event: Evenement): string => {
    console.log(`🖼️ Recherche image pour: ${event.titre_event}`);
    
    // 1. Si l'événement a déjà une image
    if (event.image && event.image.trim() !== '') {
      const url = uploadService.getImageUrl(event.image);
      console.log(`   → Image spécifique: ${event.image}`);
      return url;
    }
    
    // 2. Vérifier si une image similaire existe dans le backend
    if (backendImages.length > 0) {
      const eventType = event.type_event?.nom_type?.toLowerCase() || '';
      const eventTitle = event.titre_event?.toLowerCase() || '';
      
      // Chercher une image pertinente
      const relevantImage = backendImages.find(img => {
        const imgLower = img.toLowerCase();
        return (
          imgLower.includes(eventType) ||
          imgLower.includes(eventTitle.split(' ')[0]) ||
          imgLower.includes('festival') && eventTitle.includes('festival') ||
          imgLower.includes('concert') && eventTitle.includes('concert') ||
          imgLower.includes('art') && eventTitle.includes('art') ||
          imgLower.includes('danse') && eventTitle.includes('danse')
        );
      });
      
      if (relevantImage) {
        console.log(`   → Image pertinente trouvée: ${relevantImage}`);
        return uploadService.getImageUrl(relevantImage);
      }
    }
    
    // 3. Basé sur le type d'événement (avec vos VRAIES images Spring Boot)
    const typeName = event.type_event?.nom_type || '';
    const title = event.titre_event?.toLowerCase() || '';
    
    console.log(`   → Type: ${typeName}, Titre: ${title}`);
    
    // 🚨 MAPPING AVEC VOS VRAIES IMAGES DU BACKEND
    if (typeName.includes('Festival') || title.includes('festival') || title.includes('jazz')) {
      console.log('   → Festival → image festival');
      return uploadService.getImageUrl("event_1767732256076_7594c16a.jpg");
    }
    if (typeName.includes('Exposition') || title.includes('exposition') || title.includes('art')) {
      console.log('   → Exposition → image exposition');
      return uploadService.getImageUrl("event_1767732541267_a1d12c20.png");
    }
    if (typeName.includes('Spectacle') || title.includes('spectacle') || title.includes('danse')) {
      console.log('   → Spectacle → image spectacle');
      return uploadService.getImageUrl("event_1767732304324_ee1f3d49.jpg");
    }
    if (typeName.includes('Concert') || title.includes('concert')) {
      console.log('   → Concert → image concert');
      return uploadService.getImageUrl("event_1767732568405_8b853f8f.jpg");
    }
    if (typeName.includes('Conférence') || title.includes('conférence') || title.includes('atelier')) {
      console.log('   → Conférence → image conférence');
      return uploadService.getImageUrl("event_1767731725433_f04f6f9c.jpg");
    }
    
    // 4. Image aléatoire de VOTRE collection réelle du backend
    const randomImage = uploadService.getRandomBackendImage();
    console.log(`   → Image aléatoire: ${randomImage}`);
    return randomImage;
  };

  // 🔥 Gestion d'erreur améliorée
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    console.warn('❌ Erreur chargement image, fallback...');
    
    // FALLBACK SUR VOTRE BACKEND SPRING BOOT
    const fallbackImage = uploadService.getRandomBackendImage();
    target.src = fallbackImage;
    target.onerror = null; // Éviter les boucles infinies
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardNav userName={user?.username} userRoles={user?.roles} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Liste des événements</h2>
          <div className="flex gap-2">
            <button
              onClick={loadEvents}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Chargement...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Actualiser
                </>
              )}
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded hover:from-green-700 hover:to-emerald-700 transition-all flex items-center shadow-lg"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ajouter un événement
            </button>
          </div>
        </div>

        {/* Section information Backend */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm text-blue-800 font-medium">
                  <strong>Images Spring Boot :</strong> {backendImages.length} images disponibles
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Toutes les images viennent de votre backend à{' '}
                  <code className="bg-blue-100 px-1.5 py-0.5 rounded">localhost:8081/files/</code>
                </p>
              </div>
            </div>
            <a
              href="http://localhost:8081/files/list"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-700 hover:text-blue-900 flex items-center"
            >
              Voir la liste API
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 animate-pulse">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600">Chargement des événements...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {events.length === 0 ? (
              <div className="p-12 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun événement trouvé</h3>
                <p className="text-gray-500 mb-4">Commencez par créer votre premier événement !</p>
                <button
                  onClick={handleOpenCreateModal}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors shadow-lg"
                >
                  Créer un événement
                </button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Image
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Titre
                        </th>
                        <th className="px 6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date début
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date fin
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Places
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {events.map((event) => (
                        <tr key={event.id_event} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="relative group">
                              <img
                                src={getEventImage(event)}
                                alt={event.titre_event}
                                className="w-20 h-20 object-cover rounded-lg border border-gray-200 shadow-sm"
                                onError={handleImageError}
                                loading="lazy"
                              />
                              {event.image && (
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-lg transition-opacity flex items-center justify-center">
                                  <span className="text-white text-xs px-2 py-1 bg-black bg-opacity-70 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    {event.image.substring(0, 15)}...
                                  </span>
                                </div>
                              )}
                              {/* Badge type d'événement */}
                              {event.type_event?.nom_type && (
                                <div className="absolute -top-1 -right-1">
                                  <span className="px-2 py-1 text-xs bg-purple-600 text-white rounded-full">
                                    {event.type_event.nom_type.charAt(0)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <div className="text-sm font-semibold text-gray-900">{event.titre_event}</div>
                              <div className="text-gray-500 text-xs truncate max-w-xs mt-1 line-clamp-2">
                                {event.description || 'Aucune description'}
                              </div>
                              {event.type_event?.nom_type && (
                                <div className="mt-2">
                                  <span className="inline-block px-2 py-1 text-xs bg-purple-50 text-purple-700 border border-purple-100 rounded">
                                    {event.type_event.nom_type}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="font-medium">{formatDate(event.date_debut)}</div>
                            {event.date_fin && event.date_fin !== event.date_debut && (
                              <div className="text-xs text-gray-500 mt-1">
                                au {formatDate(event.date_fin)}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {event.date_fin ? (
                              <span className="px-2 py-1 text-xs bg-green-50 text-green-800 border border-green-100 rounded">
                                {formatDate(event.date_fin)}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">Non définie</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                event.nb_place > 50 
                                  ? 'bg-green-100 text-green-800 border border-green-200' 
                                  : event.nb_place > 10 
                                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                  : 'bg-red-100 text-red-800 border border-red-200'
                              }`}>
                                {event.nb_place} {event.nb_place === 1 ? 'place' : 'places'}
                              </span>
                              {event.nb_place < 20 && event.nb_place > 0 && (
                                <span className="ml-2 text-xs text-red-500 animate-pulse">
                                  ⚠️ Bientôt complet
                                </span>
                              )}
                              {event.nb_place === 0 && (
                                <span className="ml-2 text-xs text-gray-500">
                                  Illimité
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleOpenEditModal(event)}
                                className="px-3 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors flex items-center text-xs"
                                title="Modifier"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Modifier
                              </button>
                              <button
                                onClick={() => handleDelete(event.id_event)}
                                className="px-3 py-1.5 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors flex items-center text-xs"
                                title="Supprimer"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Supprimer
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Résumé en bas du tableau */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{events.length}</span> événement{events.length > 1 ? 's' : ''} au total •{' '}
                      <span className="font-medium">{backendImages.length}</span> images disponibles
                    </div>
                    <div className="text-xs text-gray-500 flex items-center">
                      <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Images servies par Spring Boot</span>
                      <code className="ml-2 bg-gray-100 px-1.5 py-0.5 rounded">localhost:8081</code>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      <EventModal
        isOpen={isModalOpen}
        event={selectedEvent}
        onClose={handleCloseModal}
        onSave={handleSaveEvent}
        isLoading={modalLoading}
      />
    </div>
  );
}