import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import eventService from '../services/event.service';
import uploadService from '../services/upload.service';
import { Evenement } from '../types/event.types';

export default function DashboardEvenements() {
  const [events, setEvents] = useState<Evenement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getAllEvents();
      setEvents(data);
    } catch (err: unknown) {
      // Méthode 1: Vérification du type
      if (err instanceof Error) {
        setError(err.message || 'Erreur lors du chargement des événements');
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        setError('Erreur lors du chargement des événements');
      }
      
      // Méthode alternative 2: Utilisation d'un type personnalisé
      // const error = err as { message?: string };
      // setError(error?.message || 'Erreur lors du chargement des événements');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return 'Date non disponible';
    }
  };

  const getEventImage = (event: Evenement) => {
    if (event.image && event.image.trim() !== '') {
      return uploadService.getImageUrl(event.image);
    }
    return uploadService.getRandomBackendImage();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des événements</h1>
              <p className="text-gray-600 mt-2">
                Gérez tous vos événements culturels
              </p>
            </div>
            <Link
              to="/create-event"
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all font-medium shadow-lg flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nouvel événement
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* En-tête du tableau */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {events.length} événement{events.length > 1 ? 's' : ''} trouvé{events.length > 1 ? 's' : ''}
                </h2>
                <button
                  onClick={loadEvents}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Actualiser
                </button>
              </div>
            </div>

            {/* Liste des événements */}
            <div className="divide-y divide-gray-200">
              {events.length === 0 ? (
                <div className="p-12 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun événement</h3>
                  <p className="mt-1 text-sm text-gray-500">Commencez par créer votre premier événement.</p>
                  <div className="mt-6">
                    <Link
                      to="/create-event"
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700"
                    >
                      Créer un événement
                    </Link>
                  </div>
                </div>
              ) : (
                events.map((event) => (
                  <div key={event.id_event} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start space-x-6">
                      {/* Image */}
                      <div className="flex-shrink-0">
                        <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-200">
                          <img
                            src={getEventImage(event)}
                            alt={event.titre_event}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = uploadService.getDefaultFallback();
                            }}
                          />
                        </div>
                      </div>

                      {/* Détails */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{event.titre_event}</h3>
                            <p className="text-gray-600 mt-1 line-clamp-2">{event.description}</p>
                          </div>
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
                            {event.type_event?.nom_type || 'Non spécifié'}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm text-gray-700">{formatDate(event.date_debut)}</span>
                          </div>
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            <span className="text-sm text-gray-700">{event.adresse?.ville || 'Lieu non spécifié'}</span>
                          </div>
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm text-gray-700">
                              {event.tarif?.montant === 0 ? 'Gratuit' : `${event.tarif?.montant || '?'}€`}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span className="text-sm text-gray-700">{event.nb_place || '?'} places</span>
                          </div>
                        </div>

                        <div className="mt-6 flex space-x-3">
                          <Link
                            to={`/events/${event.id_event}`}
                            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                          >
                            Voir détails
                          </Link>
                          <Link
                            to={`/events/${event.id_event}/edit`}
                            className="px-4 py-2 border border-yellow-600 text-yellow-600 rounded-lg hover:bg-yellow-50 transition-colors text-sm"
                          >
                            Modifier
                          </Link>
                          <button
                            onClick={() => {
                              if (window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
                                // Ajouter la logique de suppression ici
                              }
                            }}
                            className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <p className="text-lg font-bold mb-2">Gestion des événements</p>
            <p className="text-gray-400 text-sm">
              Gérez tous vos événements culturels depuis cette interface
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}