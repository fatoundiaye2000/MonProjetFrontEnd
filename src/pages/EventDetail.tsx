// src/pages/EventDetail.tsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import reservationService from '../services/reservation.service';
import { Evenement } from '../types/event.types';
import { STORAGE_KEYS } from '../config/constants';

interface LocalStorageUser {
  username?: string;
  email?: string;
  roles?: string[];
}

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Evenement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [nbrPersonnes, setNbrPersonnes] = useState(1);
  const [reservationLoading, setReservationLoading] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState('');
  const [reservationError, setReservationError] = useState('');

  const [currentUser, setCurrentUser] = useState<LocalStorageUser | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    if (userData) {
      try {
        const parsed: LocalStorageUser = JSON.parse(userData);
        setCurrentUser(parsed);
        loadUserIdByEmail(parsed.username || parsed.email || '');
      } catch {
        setCurrentUser(null);
      }
    }
    if (id) loadEvent(parseInt(id));
  }, [id]);

  // ✅ Récupère l'id depuis le backend par email
  const loadUserIdByEmail = async (email: string) => {
    try {
      const users = await apiService.getAllUtilisateurs();
      const found = users.find(u => u.email === email);
      if (found) {
        // ✅ user.types.ts utilise 'id' comme champ principal
        const userId = found.id || found.idUser;
        setCurrentUserId(userId ?? null);
        console.log('✅ userId trouvé:', userId);
      } else {
        console.warn('⚠️ Utilisateur non trouvé pour:', email);
      }
    } catch (err) {
      console.error('❌ Erreur loadUserIdByEmail:', err);
    }
  };

  const loadEvent = async (eventId: number) => {
    try {
      setLoading(true);
      setError('');
      const data = await apiService.getEvenementById(eventId);
      setEvent(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Événement introuvable');
    } finally {
      setLoading(false);
    }
  };

  const handleReservation = async () => {
    if (!event) return;

    if (!currentUser) {
      setReservationError('Vous devez être connecté pour réserver.');
      return;
    }

    if (nbrPersonnes < 1) {
      setReservationError('Le nombre de personnes doit être au moins 1.');
      return;
    }

    if (event.nbPlace && nbrPersonnes > event.nbPlace) {
      setReservationError(`Seulement ${event.nbPlace} places disponibles.`);
      return;
    }

    try {
      setReservationLoading(true);
      setReservationError('');
      setReservationSuccess('');

      await reservationService.createReservation({
        dateReservation: new Date().toISOString().split('T')[0],
        nbrPersonnes,
        user: { idUser: currentUserId ?? undefined }, // ✅ id récupéré depuis le backend
        evenement: { idEvent: event.idEvent },
      });

      setReservationSuccess(`✅ Réservation confirmée pour ${nbrPersonnes} personne(s) !`);
    } catch (err: unknown) {
      setReservationError(err instanceof Error ? err.message : 'Erreur lors de la réservation');
    } finally {
      setReservationLoading(false);
    }
  };

  const getFormattedDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      });
    } catch { return dateString; }
  };

  const isUpcoming = () => {
    if (!event?.dateDebut) return false;
    return new Date(event.dateDebut) > new Date();
  };

  // ========================
  // LOADING
  // ========================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  // ========================
  // ERREUR
  // ========================
  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-10 rounded-xl shadow-lg max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Événement introuvable</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            ← Retour
          </button>
        </div>
      </div>
    );
  }

  // ========================
  // PAGE PRINCIPALE
  // ========================
  return (
    <div className="min-h-screen bg-gray-100">

      {/* Header */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </button>
          <span className="text-sm text-gray-500">Détail de l'événement</span>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-blue-600 hover:underline"
          >
            Dashboard
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ======================== */}
          {/* COLONNE GAUCHE — Détails */}
          {/* ======================== */}
          <div className="lg:col-span-2 space-y-6">

            {/* Image */}
            {event.image && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <img
                  src={`http://localhost:8081/files/${event.image}`}
                  alt={event.titreEvent}
                  className="w-full h-64 object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}

            {/* Titre + statut */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900 flex-1">{event.titreEvent}</h1>
                <span className={`ml-4 px-4 py-2 text-sm font-semibold rounded-full shrink-0 ${
                  isUpcoming() ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {isUpcoming() ? '✅ À venir' : '⏹ Terminé'}
                </span>
              </div>
              {event.typeEvent && (
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mb-4">
                  {event.typeEvent.nomType}
                </span>
              )}
              <p className="text-gray-600 text-lg leading-relaxed">{event.description}</p>
            </div>

            {/* Informations */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Informations</h2>
              <div className="space-y-4">

                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Date de début</p>
                    <p className="text-gray-900 capitalize">{getFormattedDate(event.dateDebut)}</p>
                  </div>
                </div>

                {event.dateFin && (
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3 shrink-0">
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Date de fin</p>
                      <p className="text-gray-900 capitalize">{getFormattedDate(event.dateFin)}</p>
                    </div>
                  </div>
                )}

                {event.adresse && (
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3 shrink-0">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Lieu</p>
                      <p className="text-gray-900">
                        {[event.adresse.rue, event.adresse.ville, event.adresse.codePostal]
                          .filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                )}

                {event.nbPlace !== undefined && (
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3 shrink-0">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Places disponibles</p>
                      <p className="text-gray-900 font-semibold">{event.nbPlace} places</p>
                    </div>
                  </div>
                )}

                {event.organisateur && (
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3 shrink-0">
                      <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Organisateur</p>
                      <p className="text-gray-900">
                        {[event.organisateur.prenom, event.organisateur.nom].filter(Boolean).join(' ')}
                        {event.organisateur.email && (
                          <span className="text-gray-500 text-sm ml-1">({event.organisateur.email})</span>
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tarif */}
            {event.tarif && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">💰 Tarif</h2>
                <p className="text-3xl font-bold text-green-600">
                  {event.tarif.prix === 0 ? 'Gratuit' : `${event.tarif.prix} €`}
                </p>
                {event.tarif.isPromotion && (
                  <span className="inline-block mt-2 px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                    🏷️ Promotion en cours
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ======================== */}
          {/* COLONNE DROITE — Réservation */}
          {/* ======================== */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">🎫 Réserver</h2>

              {reservationSuccess && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
                  {reservationSuccess}
                </div>
              )}

              {reservationError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {reservationError}
                </div>
              )}

              {!isUpcoming() ? (
                <div className="text-center py-6">
                  <div className="text-4xl mb-3">⏹</div>
                  <p className="text-gray-500">Cet événement est terminé.</p>
                </div>
              ) : !currentUser ? (
                <div className="text-center py-6">
                  <div className="text-4xl mb-3">🔒</div>
                  <p className="text-gray-500 mb-4">Connectez-vous pour réserver.</p>
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium"
                  >
                    Se connecter
                  </button>
                </div>
              ) : (
                <div className="space-y-4">

                  {/* Résumé */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-semibold text-gray-900 text-sm">{event.titreEvent}</p>
                    <p className="text-gray-500 text-xs mt-1 capitalize">
                      {getFormattedDate(event.dateDebut)}
                    </p>
                    {event.adresse?.ville && (
                      <p className="text-gray-500 text-xs">📍 {event.adresse.ville}</p>
                    )}
                    {/* ✅ Afficher l'utilisateur connecté sans bloquer */}
                    <p className="text-gray-500 text-xs mt-2">
                      👤 {currentUser.username || currentUser.email}
                    </p>
                  </div>

                  {/* Nombre de personnes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de personnes
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setNbrPersonnes(Math.max(1, nbrPersonnes - 1))}
                        className="px-4 py-3 bg-gray-100 hover:bg-gray-200 transition-colors font-bold text-lg"
                      >
                        −
                      </button>
                      <span className="flex-1 text-center font-semibold text-lg py-3">
                        {nbrPersonnes}
                      </span>
                      <button
                        onClick={() => setNbrPersonnes(Math.min(event.nbPlace || 99, nbrPersonnes + 1))}
                        className="px-4 py-3 bg-gray-100 hover:bg-gray-200 transition-colors font-bold text-lg"
                      >
                        +
                      </button>
                    </div>
                    {event.nbPlace && (
                      <p className="text-xs text-gray-500 mt-1">Max : {event.nbPlace} places</p>
                    )}
                  </div>

                  {/* Prix total */}
                  {event.tarif && (
                    <div className="bg-blue-50 rounded-lg p-4 flex justify-between items-center">
                      <span className="text-gray-700 font-medium">Total</span>
                      <span className="text-xl font-bold text-blue-700">
                        {event.tarif.prix === 0
                          ? 'Gratuit'
                          : `${(event.tarif.prix! * nbrPersonnes).toFixed(2)} €`}
                      </span>
                    </div>
                  )}

                  {/* ✅ Bouton sans blocage sur currentUserId */}
                  <button
                    onClick={handleReservation}
                    disabled={reservationLoading || !!reservationSuccess}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {reservationLoading
                      ? '⏳ Réservation en cours...'
                      : reservationSuccess
                      ? '✅ Réservé !'
                      : '🎫 Confirmer la réservation'}
                  </button>

                  {reservationSuccess && (
                    <button
                      onClick={() => navigate('/mes-reservations')}
                      className="w-full py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                    >
                      Voir mes réservations
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}