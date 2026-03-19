// src/pages/Dashboard.tsx

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import apiService from '../services/api';
import { Utilisateur } from '../types/user.types';
import { Evenement } from '../types/event.types';
import { useNavigate } from 'react-router-dom';
import { STORAGE_KEYS } from '../config/constants';

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
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
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
        setUserError(`Erreur: ${err.message}`);
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
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    try {
      await apiService.deleteUtilisateur(id);
      await loadUsers();
    } catch (err: unknown) {
      setUserError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;
    try {
      await apiService.deleteEvenement(id);
      await loadEvents();
    } catch (err: unknown) {
      setEventError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleMenuAction = (action: string) => {
    setDropdownOpen(false);
    switch (action) {
      case 'accueil': navigate('/'); break;
      case 'dashboard': navigate('/dashboard'); break;
      case 'evenements': navigate('/dashboard/evenements'); break;
      case 'inscription': navigate('/events'); break;
      case 'mes-reservations': navigate('/mes-reservations'); break;
      case 'creer': navigate('/create-event'); break;
      case 'statistiques': navigate('/statistiques'); break;
      case 'parametres': navigate('/parametres'); break;
      case 'gestion-utilisateurs': navigate('/admin/users'); break;
    }
  };

  const getCurrentUserEmail = () => {
    if (currentUser?.email) return currentUser.email;
    if (currentUser?.username) return currentUser.username;
    if (user?.username) return user.username;
    return 'Administrateur';
  };

  const getCurrentUserRole = () => {
    if (currentUser?.role) return currentUser.role;
    if (user?.roles?.length) return user.roles.join(', ');
    return 'ADMIN';
  };

  const isAdmin = () => {
    const role = getCurrentUserRole();
    return role.includes('ADMIN');
  };

  // ✅ CORRECTION : lit roles[] (tableau) renvoyé par le backend Spring
  // Le backend renvoie : { roles: [{id, role: "ADMIN", type: "..."}, ...] }
  // et NON pas : { role: { nom: "ADMIN" } }
  const getUserRole = (userItem: Utilisateur): string => {
    // Nouvelle structure Spring : roles est un tableau d'objets { id, role, type }
    if (userItem.roles && userItem.roles.length > 0) {
      const hasAdmin = userItem.roles.some(
        (r) => r.role === 'ADMIN' || r.nom === 'ADMIN'
      );
      return hasAdmin ? 'ADMIN' : 'UTILISATEUR';
    }
    // Ancienne structure : role est un objet { nom }
    if (userItem.role?.nom) return userItem.role.nom;
    if (userItem.role?.role) return userItem.role.role;
    // Fallback par email
    if (userItem.email === 'admin@example.com') return 'ADMIN';
    return 'UTILISATEUR';
  };

  const getEventLocation = (event: Evenement) => {
    return event.adresse?.ville || '-';
  };

  const getFormattedDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return dateString;
    }
  };

  const isEventUpcoming = (event: Evenement) => {
    try {
      return new Date(event.dateDebut) > new Date();
    } catch {
      return false;
    }
  };

  const countUpcomingEvents = () => events.filter(e => isEventUpcoming(e)).length;

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
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium shadow-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    <div className="py-2">
                      {[
                        { action: 'accueil',           label: '🏠 Accueil',               color: 'purple'  },
                        { action: 'dashboard',          label: '📊 Tableau de bord',        color: 'blue'    },
                        { action: 'evenements',         label: '📅 Voir les événements',    color: 'green'   },
                        { action: 'inscription',        label: '👥 Inscription événement',  color: 'yellow'  },
                        { action: 'mes-reservations',   label: '🎫 Les réservations',       color: 'teal'    },
                        { action: 'creer',              label: '➕ Créer un événement',     color: 'emerald' },
                        { action: 'statistiques',       label: '📊 Statistiques',           color: 'indigo'  },
                        { action: 'parametres',         label: '⚙️ Paramètres',             color: 'gray'    },
                      ].map(item => (
                        <button
                          key={item.action}
                          onClick={() => handleMenuAction(item.action)}
                          className={`w-full text-left px-4 py-3 hover:bg-${item.color}-50 transition-colors`}
                        >
                          <span className="font-medium">{item.label}</span>
                        </button>
                      ))}

                      {isAdmin() && (
                        <>
                          <div className="border-t border-gray-100 my-1"></div>
                          <button
                            onClick={() => handleMenuAction('gestion-utilisateurs')}
                            className="w-full text-left px-4 py-3 hover:bg-red-50 transition-colors"
                          >
                            <span className="font-medium">👨‍💼 Gestion utilisateurs</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

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

      <main className="max-w-7xl mx-auto px-4 py-8">
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

        {/* Statistiques */}
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
            <p className="text-sm text-gray-600 mt-1">{countUpcomingEvents()} événements à venir</p>
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
                      {['ID', 'TITRE', 'DATE DEBUT', 'LIEU', 'PLACES', 'STATUT', 'ACTIONS'].map(h => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
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
                        <tr key={event.idEvent} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{event.idEvent}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.titreEvent}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getFormattedDate(event.dateDebut)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getEventLocation(event)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{event.nbPlace} places</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              isEventUpcoming(event) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {isEventUpcoming(event) ? 'À venir' : 'Terminé'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => navigate(`/events/${event.idEvent}`)}
                              className="text-blue-600 hover:text-blue-900 hover:underline mr-4"
                            >
                              Voir
                            </button>
                            {isAdmin() && (
                              <button
                                onClick={() => handleDeleteEvent(event.idEvent)}
                                className="text-red-600 hover:text-red-900 hover:underline"
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
            {/* ✅ CORRECTION : utilise getUserRole() au lieu de role?.nom */}
            <p className="text-sm text-gray-600 mt-1">
              {users.filter(u => getUserRole(u) === 'ADMIN').length} administrateurs
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
                      {['IDENTIFIANT', 'NOM', 'PRÉNOM', 'E-MAIL', 'RÔLE', 'ACTIONS'].map(h => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
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
                            {/* ✅ CORRECTION : getUserRole() lit roles[] du backend */}
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              getUserRole(userItem) === 'ADMIN'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {getUserRole(userItem)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {userItem.email === 'admin@example.com' ? (
                              <span className="text-gray-400">Non supprimable</span>
                            ) : (
                              <button
                                onClick={() => handleDeleteUser(userItem.id)}
                                className="text-red-600 hover:text-red-900 hover:underline"
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

      <footer className="mt-12 bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-lg font-bold mb-2">CultureEvents Dashboard</p>
          <p className="text-gray-400 text-sm">Dashboard d'administration</p>
          <p className="text-gray-500 text-xs mt-4">
            {users.length} utilisateurs • {events.length} événements • 124 réservations
          </p>
        </div>
      </footer>
    </div>
  );
}