import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import apiService from '../services/api';
import { Utilisateur } from '../types/user.types';
import { Evenement } from '../types/event.types';
import { useNavigate } from 'react-router-dom';

// Interface pour l'utilisateur stocké dans localStorage
interface LocalStorageUser {
  email?: string;
  username?: string;
  role?: string;
  nom?: string;
  prenom?: string;
}

export default function Dashboard() {
  const [users, setUsers] = useState<Utilisateur[]>([]);
  const [events, setEvents] = useState<Evenement[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [userError, setUserError] = useState('');
  const [eventError, setEventError] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<LocalStorageUser | null>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Récupérer les infos utilisateur depuis localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser: LocalStorageUser = JSON.parse(userData);
        setCurrentUser(parsedUser);
      } catch (err) {
        console.error('Erreur parsing user data:', err);
        setCurrentUser(null);
      }
    }
    
    loadUsers();
    loadEvents();
    
    // Fermer le dropdown quand on clique ailleurs
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setUserError('');
      const data = await apiService.getAllUtilisateurs();
      setUsers(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.includes('401') || err.message.includes('token')) {
          setUserError('Session expirée. Veuillez vous reconnecter.');
        } else {
          setUserError(`Erreur: ${err.message}`);
        }
      } else {
        setUserError('Erreur lors du chargement des utilisateurs');
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      setLoadingEvents(true);
      setEventError('');
      const data = await apiService.getAllEvenements();
      setEvents(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setEventError(`Erreur lors du chargement des événements: ${errorMessage}`);
      console.error('Erreur lors du chargement des événements:', err);
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    try {
      await apiService.deleteUtilisateur(id);
      await loadUsers();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setUserError(errorMessage);
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      return;
    }

    try {
      await apiService.deleteEvenement(id);
      await loadEvents();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setEventError(errorMessage);
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // ⭐⭐⭐ FONCTION MISE À JOUR POUR TOUTES LES ROUTES ⭐⭐⭐
  const handleMenuAction = (action: string) => {
    setDropdownOpen(false);
    
    switch (action) {
      case 'accueil':
        // Retour à la page publique avec ancre #accueil
        navigate('/');
        // Attendre un peu pour que la navigation se fasse
        setTimeout(() => {
          const accueilSection = document.getElementById('accueil');
          if (accueilSection) {
            accueilSection.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
        break;
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'evenements':
        navigate('/dashboard/evenements');
        break;
      case 'inscription':
        navigate('/events');
        break;
      case 'mes-reservations':
        navigate('/mes-reservations');
        break;
      case 'creer':
        navigate('/create-event');
        break;
      case 'statistiques':
        navigate('/statistiques');
        break;
      case 'parametres':
        navigate('/parametres');
        break;
      case 'gestion-utilisateurs':
        navigate('/admin/users');
        break;
      default:
        break;
    }
  };

  // Obtenir l'email de l'utilisateur actuel
  const getCurrentUserEmail = () => {
    if (currentUser?.email) return currentUser.email;
    if (currentUser?.username) return currentUser.username;
    if (user?.username) return user.username;
    return 'Administrateur';
  };

  // Obtenir le rôle de l'utilisateur actuel
  const getCurrentUserRole = () => {
    if (currentUser?.role) return currentUser.role;
    if (user?.roles?.length) return user.roles.join(', ');
    return 'ADMIN';
  };

  // Vérifier si l'utilisateur est admin
  const isAdmin = () => {
    const role = getCurrentUserRole();
    return role.includes('ADMIN') || currentUser?.role === 'ADMIN';
  };

  // Fonction pour obtenir la ville de l'adresse
  const getEventLocation = (event: Evenement) => {
    if (event.adresse?.ville) {
      return event.adresse.ville;
    }
    return event.adresse_id_adresse ? `Adresse #${event.adresse_id_adresse}` : '-';
  };

  // Fonction pour obtenir la date formatée
  const getFormattedDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return dateString;
    }
  };

  // Fonction pour vérifier si un événement est à venir
  const isEventUpcoming = (event: Evenement) => {
    try {
      return new Date(event.date_debut) > new Date();
    } catch {
      return false;
    }
  };

  // Fonction pour compter les événements à venir
  const countUpcomingEvents = () => {
    return events.filter(event => isEventUpcoming(event)).length;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tableau de bord - Administration</h1>
              <p className="text-sm text-gray-600 mt-1">
                Bienvenue, {getCurrentUserEmail()} ({getCurrentUserRole()})
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Menu déroulant */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium shadow-lg"
                >
                  {/* Icône hamburger sans texte "Menu" */}
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    <div className="py-2">
                      {/* Accueil */}
                      <button
                        onClick={() => handleMenuAction('accueil')}
                        className="w-full text-left px-4 py-3 hover:bg-purple-50 transition-colors flex items-center"
                      >
                        <svg className="w-5 h-5 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className="font-medium">🏠 Accueil</span>
                      </button>

                      <div className="border-t border-gray-100 my-1"></div>

                      {/* Tableau de bord */}
                      <button
                        onClick={() => handleMenuAction('dashboard')}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center"
                      >
                        <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span className="font-medium">📊 Tableau de bord</span>
                      </button>

                      {/* Voir les événements */}
                      <button
                        onClick={() => handleMenuAction('evenements')}
                        className="w-full text-left px-4 py-3 hover:bg-green-50 transition-colors flex items-center"
                      >
                        <svg className="w-5 h-5 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium">📅 Voir les événements</span>
                      </button>

                      {/* Inscription */}
                      <button
                        onClick={() => handleMenuAction('inscription')}
                        className="w-full text-left px-4 py-3 hover:bg-yellow-50 transition-colors flex items-center"
                      >
                        <svg className="w-5 h-5 mr-3 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        <span className="font-medium">👥 Inscription événement</span>
                      </button>

                      {/* Les réservations */}
                      <button
                        onClick={() => handleMenuAction('mes-reservations')}
                        className="w-full text-left px-4 py-3 hover:bg-teal-50 transition-colors flex items-center"
                      >
                        <svg className="w-5 h-5 mr-3 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span className="font-medium">🎫 Les réservations</span>
                      </button>

                      {/* Créer un événement */}
                      <button
                        onClick={() => handleMenuAction('creer')}
                        className="w-full text-left px-4 py-3 hover:bg-emerald-50 transition-colors flex items-center"
                      >
                        <svg className="w-5 h-5 mr-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="font-medium">➕ Créer un événement</span>
                      </button>

                      {/* Statistiques */}
                      <button
                        onClick={() => handleMenuAction('statistiques')}
                        className="w-full text-left px-4 py-3 hover:bg-indigo-50 transition-colors flex items-center"
                      >
                        <svg className="w-5 h-5 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span className="font-medium">📊 Statistiques</span>
                      </button>

                      {/* Paramètres */}
                      <button
                        onClick={() => handleMenuAction('parametres')}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center"
                      >
                        <svg className="w-5 h-5 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="font-medium">⚙️ Paramètres</span>
                      </button>

                      {/* ⭐⭐⭐ Gestion utilisateurs (uniquement pour admin) ⭐⭐⭐ */}
                      {isAdmin() && (
                        <>
                          <div className="border-t border-gray-100 my-1"></div>
                          <button
                            onClick={() => handleMenuAction('gestion-utilisateurs')}
                            className="w-full text-left px-4 py-3 hover:bg-red-50 transition-colors flex items-center"
                          >
                            <svg className="w-5 h-5 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium">👨‍💼 Gestion utilisateurs</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Bouton Déconnexion */}
              <button
                onClick={logout}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all font-medium shadow-lg"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Affichage des erreurs globales */}
        {(userError || eventError) && (
          <div className="mb-6">
            {userError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-2">
                {userError}
              </div>
            )}
            {eventError && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                {eventError}
              </div>
            )}
          </div>
        )}

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">{events.length}</div>
            <div className="text-lg font-medium text-gray-700">Événements actifs</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">{users.length}</div>
            <div className="text-lg font-medium text-gray-700">Utilisateurs inscrits</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">124</div>
            <div className="text-lg font-medium text-gray-700">Réservations totales</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-4xl font-bold text-orange-600 mb-2">{countUpcomingEvents()}</div>
            <div className="text-lg font-medium text-gray-700">Événements à venir</div>
          </div>
        </div>

        {/* Section événements */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Liste des événements</h2>
            <p className="text-sm text-gray-600 mt-1">
              {countUpcomingEvents()} événements à venir
            </p>
          </div>

          <div className="p-6">
            {loadingEvents ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        TITRE
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        DATE DEBUT
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        LIEU
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        PLACES
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        STATUT
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {events.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                          Aucun événement trouvé
                        </td>
                      </tr>
                    ) : (
                      events.slice(0, 5).map((event) => (
                        <tr key={event.id_event} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {event.id_event}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                            {event.titre_event}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {getFormattedDate(event.date_debut)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {getEventLocation(event)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {event.nb_place} places
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              isEventUpcoming(event)
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {isEventUpcoming(event) ? 'À venir' : 'Terminé'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => navigate(`/events/${event.id_event}`)}
                              className="text-blue-600 hover:text-blue-900 hover:underline transition-colors mr-4"
                            >
                              Voir
                            </button>
                            {isAdmin() && (
                              <button
                                onClick={() => handleDeleteEvent(event.id_event)}
                                className="text-red-600 hover:text-red-900 hover:underline transition-colors"
                              >
                                Supprimer
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {events.length > 5 && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => navigate('/dashboard/evenements')}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium"
                    >
                      Voir tous les événements ({events.length})
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Section utilisateurs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Liste des utilisateurs</h2>
            <p className="text-sm text-gray-600 mt-1">
              {users.filter(u => u.role?.nom === 'ADMIN').length} administrateurs
            </p>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IDENTIFIANT
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        NOM
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        PRÉNOM
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        E-MAIL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        RÔLE
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          Aucun utilisateur trouvé
                        </td>
                      </tr>
                    ) : (
                      users.slice(0, 10).map((userItem) => (
                        <tr key={userItem.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {userItem.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {userItem.nom || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {userItem.prenom || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {userItem.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              userItem.role?.nom === 'ADMIN' || userItem.email === 'admin@example.com'
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {userItem.role?.nom || (userItem.email === 'admin@example.com' ? 'ADMIN' : 'UTILISATEUR')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {userItem.email === 'admin@example.com' ? (
                              <span className="text-gray-400">Non supprimable</span>
                            ) : (
                              <button
                                onClick={() => handleDeleteUser(userItem.id)}
                                className="text-red-600 hover:text-red-900 hover:underline transition-colors"
                              >
                                Supprimer
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {users.length > 10 && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => navigate('/admin/users')}
                      className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all font-medium"
                    >
                      Voir tous les utilisateurs ({users.length})
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <p className="text-lg font-bold mb-2">CultureEvents Dashboard</p>
            <p className="text-gray-400 text-sm">
              Dashboard d'administration - Gestion des utilisateurs et événements
            </p>
            <p className="text-gray-500 text-xs mt-4">
              {window.location.hostname}:{window.location.port}
            </p>
            <p className="text-gray-500 text-xs mt-2">
              {users.length} utilisateurs • {events.length} événements • 124 réservations
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}                                                                                                                          