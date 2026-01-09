// src/pages/DashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface Evenement {
  id_event: number;
  titre_event: string;
  description: string;
  date_debut: string;
  date_fin: string;
  nb_place: number;
  image: string;
  type_event: {
    nom_type: string;
  };
  tarif: {
    montant: number;
  };
}

interface Reservation {
  id: number;
  nom: string;
  email: string;
  evenement: string;
  date: string;
  places: number;
  montant: number;
  statut: 'confirmé' | 'en attente' | 'annulé';
}

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'organisateur' | 'utilisateur';
  status: 'actif' | 'inactif' | 'suspendu';
  date_inscription: string;
  evenements_inscrits: number;
}

// ==================== ICÔNES SVG ====================
const Icon = ({ 
  path, 
  className = "w-4 h-4" 
}: { 
  path: string | string[]; 
  className?: string;
}) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    {Array.isArray(path) ? (
      path.map((d, i) => (
        <path key={i} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
      ))
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
    )}
  </svg>
);

const ICONS = {
  calendar: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  users: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
  ticket: "M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z",
  logout: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
  plusCircle: "M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z",
  eye: ["M15 12a3 3 0 11-6 0 3 3 0 016 0z", "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"],
  settings: ["M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z", "M15 12a3 3 0 11-6 0 3 3 0 016 0z"],
  bell: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  dollar: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  trash: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  edit: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  barChart: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  filter: "M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z",
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  download: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
  user: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  userPlus: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z",
  refresh: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  chartPie: ["M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z", "M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"]
};

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser, logout, isAuthenticated, isLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'accueil' | 'evenements' | 'reservations' | 'utilisateurs' | 'statistiques' | 'parametres'>('accueil');
  const [searchTerm, setSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('Tous les rôles');
  const [statusFilter, setStatusFilter] = useState<string>('Tous les statuts');
  
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState('');

  const stats = {
    totalEvents: 8,
    upcomingEvents: 5,
    totalReservations: 124,
    availablePlaces: 76,
    revenue: 8450,
    totalUsers: 156,
    activeUsers: 142
  };

  const [evenements, setEvenements] = useState<Evenement[]>([
    {
      id_event: 1,
      titre_event: "Festival de Jazz International",
      description: "Concert de jazz avec des artistes internationaux",
      date_debut: new Date('2026-06-15T18:00:00').toISOString(),
      date_fin: new Date('2026-06-17T23:00:00').toISOString(),
      nb_place: 150,
      image: "festival_jazz.jpg",
      type_event: { nom_type: "Festival" },
      tarif: { montant: 35 }
    },
    {
      id_event: 2,
      titre_event: "Exposition d'Art Contemporain",
      description: "Collection exceptionnelle d'œuvres d'art",
      date_debut: new Date('2026-03-10T10:00:00').toISOString(),
      date_fin: new Date('2026-05-10T18:00:00').toISOString(),
      nb_place: 100,
      image: "exposition_art.jpg",
      type_event: { nom_type: "Exposition" },
      tarif: { montant: 0 }
    },
    {
      id_event: 3,
      titre_event: "Spectacle de Danse Moderne",
      description: "Performance captivante",
      date_debut: new Date('2026-09-22T20:00:00').toISOString(),
      date_fin: new Date('2026-09-22T22:00:00').toISOString(),
      nb_place: 200,
      image: "spectacle_danse.jpg",
      type_event: { nom_type: "Spectacle" },
      tarif: { montant: 25 }
    }
  ]);

  const [reservations, setReservations] = useState<Reservation[]>([
    { id: 1, nom: "Dupont", email: "dupont@email.com", evenement: "Festival de Jazz", date: "2026-06-15", places: 2, montant: 70, statut: 'confirmé' },
    { id: 2, nom: "Martin", email: "martin@email.com", evenement: "Exposition Art", date: "2026-03-10", places: 1, montant: 0, statut: 'confirmé' },
    { id: 3, nom: "Bernard", email: "bernard@email.com", evenement: "Spectacle Danse", date: "2026-09-22", places: 4, montant: 100, statut: 'en attente' },
  ]);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      setUsersError('');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUsers: User[] = [
        { id: 1, name: "Marie Dupont", email: "marie.dupont@email.com", role: 'admin', status: 'actif', date_inscription: "2024-01-15", evenements_inscrits: 8 },
        { id: 2, name: "Jean Martin", email: "jean.martin@email.com", role: 'organisateur', status: 'actif', date_inscription: "2024-02-20", evenements_inscrits: 5 },
        { id: 3, name: "Sophie Bernard", email: "sophie.bernard@email.com", role: 'utilisateur', status: 'actif', date_inscription: "2024-03-10", evenements_inscrits: 12 },
        { id: 4, name: "Pierre Leroy", email: "pierre.leroy@email.com", role: 'utilisateur', status: 'inactif', date_inscription: "2024-01-30", evenements_inscrits: 3 },
        { id: 5, name: "Julie Petit", email: "julie.petit@email.com", role: 'organisateur', status: 'actif', date_inscription: "2024-02-15", evenements_inscrits: 7 },
        { id: 6, name: "Thomas Moreau", email: "thomas.moreau@email.com", role: 'utilisateur', status: 'suspendu', date_inscription: "2024-03-05", evenements_inscrits: 4 },
      ];
      
      setUsers(mockUsers);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setUsersError(`Erreur: ${err.message}`);
      } else {
        setUsersError('Erreur lors du chargement des utilisateurs');
      }
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteEvent = (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      setEvenements(evenements.filter(event => event.id_event !== id));
    }
  };

  const handleDeleteReservation = (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) {
      setReservations(reservations.filter(res => res.id !== id));
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }
    try {
      setUsers(users.filter(u => u.id !== id));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setUsersError(errorMessage);
    }
  };

  const handleUpdateUserStatus = (id: number, newStatus: User['status']) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
  };

  const handleUpdateUserRole = (id: number, newRole: User['role']) => {
    setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
  };

  const filteredEvents = evenements.filter(event =>
    event.titre_event.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.type_event.nom_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReservations = reservations.filter(res =>
    res.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.evenement.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'Tous les rôles' || 
      (roleFilter === 'Admin' && user.role === 'admin') ||
      (roleFilter === 'Organisateur' && user.role === 'organisateur') ||
      (roleFilter === 'Utilisateur' && user.role === 'utilisateur');
    
    const matchesStatus = statusFilter === 'Tous les statuts' ||
      (statusFilter === 'Actif' && user.status === 'actif') ||
      (statusFilter === 'Inactif' && user.status === 'inactif') ||
      (statusFilter === 'Suspendu' && user.status === 'suspendu');
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'accueil':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center">
                  <Icon path={ICONS.calendar} className="h-8 w-8 text-blue-600 mr-4" />
                  <div>
                    <p className="text-sm text-gray-500">Événements à venir</p>
                    <p className="text-2xl font-bold">{stats.upcomingEvents}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center">
                  <Icon path={ICONS.ticket} className="h-8 w-8 text-green-600 mr-4" />
                  <div>
                    <p className="text-sm text-gray-500">Réservations totales</p>
                    <p className="text-2xl font-bold">{stats.totalReservations}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center">
                  <Icon path={ICONS.users} className="h-8 w-8 text-purple-600 mr-4" />
                  <div>
                    <p className="text-sm text-gray-500">Utilisateurs actifs</p>
                    <p className="text-2xl font-bold">{stats.activeUsers}/{stats.totalUsers}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center">
                  <Icon path={ICONS.dollar} className="h-8 w-8 text-yellow-600 mr-4" />
                  <div>
                    <p className="text-sm text-gray-500">Revenus estimés</p>
                    <p className="text-2xl font-bold">{stats.revenue}€</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold">Événements récents</h2>
                <p className="text-gray-500">Derniers événements créés</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {evenements.slice(0, 3).map(event => (
                    <div key={event.id_event} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Icon path={ICONS.calendar} className="w-6 h-6 text-gray-500" />
                        </div>
                        <div>
                          <h3 className="font-medium">{event.titre_event}</h3>
                          <p className="text-sm text-gray-500">{event.type_event.nom_type}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <Icon path={ICONS.clock} className="w-3 h-3" />
                            {new Date(event.date_debut).toLocaleDateString('fr-FR')}
                            {event.tarif.montant > 0 && (
                              <span className="font-semibold"> • {event.tarif.montant}€</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/dashboard/evenements/modifier/${event.id_event}`)}
                          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => navigate(`/events/${event.id_event}`)}
                          className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center justify-center"
                        >
                          <Icon path={ICONS.eye} className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'evenements':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow">
              <div className="p-6 border-b flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">Gestion des Événements</h2>
                  <p className="text-gray-500">Créez, modifiez ou supprimez des événements</p>
                </div>
                <button
                  onClick={() => navigate('/dashboard/evenements/nouveau')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Icon path={ICONS.plusCircle} className="w-4 h-4" />
                  Nouvel Événement
                </button>
              </div>

              <div className="p-6 border-b">
                <div className="flex items-center space-x-4">
                  <div className="flex-1 relative">
                    <Icon path={ICONS.search} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un événement..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button className="flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50">
                    <Icon path={ICONS.filter} className="h-5 w-5 mr-2" />
                    Filtres
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Événement</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Places</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEvents.map(event => (
                      <tr key={event.id_event} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{event.titre_event}</div>
                              <div className="text-sm text-gray-500">{event.description.substring(0, 50)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(event.date_debut).toLocaleDateString('fr-FR')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {event.type_event.nom_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{event.nb_place} places</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {event.tarif.montant === 0 ? 'Gratuit' : `${event.tarif.montant}€`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => navigate(`/events/${event.id_event}`)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Voir"
                            >
                              <Icon path={ICONS.eye} className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/dashboard/evenements/modifier/${event.id_event}`)}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Modifier"
                            >
                              <Icon path={ICONS.edit} className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event.id_event)}
                              className="text-red-600 hover:text-red-900"
                              title="Supprimer"
                            >
                              <Icon path={ICONS.trash} className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'reservations':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold">Gestion des Réservations</h2>
                <p className="text-gray-500">Consultez et gérez toutes les réservations</p>
              </div>

              <div className="p-6 border-b">
                <div className="flex items-center space-x-4">
                  <div className="flex-1 relative">
                    <Icon path={ICONS.search} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher une réservation..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button className="flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50">
                    <Icon path={ICONS.download} className="h-5 w-5 mr-2" />
                    Exporter
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Événement</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Places</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredReservations.map(res => (
                      <tr key={res.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{res.nom}</div>
                            <div className="text-sm text-gray-500">{res.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{res.evenement}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{res.date}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{res.places} places</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{res.montant}€</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            res.statut === 'confirmé' ? 'bg-green-100 text-green-800' :
                            res.statut === 'en attente' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {res.statut}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => navigate(`/dashboard/reservations/${res.id}`)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Voir détails"
                            >
                              <Icon path={ICONS.eye} className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteReservation(res.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Supprimer"
                            >
                              <Icon path={ICONS.trash} className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'utilisateurs':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow">
              <div className="p-6 border-b flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">Gestion des Utilisateurs</h2>
                  <p className="text-gray-500">Gérez les comptes et permissions des utilisateurs</p>
                  {usersError && (
                    <div className="mt-2 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                      {usersError}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={loadUsers}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    disabled={loadingUsers}
                  >
                    <Icon path={ICONS.refresh} className={`w-4 h-4 ${loadingUsers ? 'animate-spin' : ''}`} />
                    {loadingUsers ? 'Chargement...' : 'Actualiser'}
                  </button>
                  <button
                    onClick={() => navigate('/dashboard/utilisateurs/nouveau')}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Icon path={ICONS.userPlus} className="w-4 h-4" />
                    Nouvel Utilisateur
                  </button>
                </div>
              </div>

              <div className="p-6 border-b">
                <div className="flex items-center space-x-4">
                  <div className="flex-1 relative">
                    <Icon path={ICONS.search} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un utilisateur..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <select 
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-4 py-2 border rounded-lg bg-white"
                  >
                    <option>Tous les rôles</option>
                    <option>Admin</option>
                    <option>Organisateur</option>
                    <option>Utilisateur</option>
                  </select>
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border rounded-lg bg-white"
                  >
                    <option>Tous les statuts</option>
                    <option>Actif</option>
                    <option>Inactif</option>
                    <option>Suspendu</option>
                  </select>
                </div>
              </div>

              {loadingUsers ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  {users.length === 0 ? 'Aucun utilisateur trouvé.' : 'Aucun utilisateur ne correspond aux critères de recherche.'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inscription</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Événements</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.id}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={user.role}
                              onChange={(e) => handleUpdateUserRole(user.id, e.target.value as User['role'])}
                              className="text-sm font-medium rounded border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="admin">Admin</option>
                              <option value="organisateur">Organisateur</option>
                              <option value="utilisateur">Utilisateur</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={user.status}
                              onChange={(e) => handleUpdateUserStatus(user.id, e.target.value as User['status'])}
                              className="text-sm font-medium rounded border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="actif">Actif</option>
                              <option value="inactif">Inactif</option>
                              <option value="suspendu">Suspendu</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.date_inscription}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.evenements_inscrits}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => navigate(`/dashboard/utilisateurs/${user.id}`)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Voir profil"
                              >
                                <Icon path={ICONS.eye} className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => navigate(`/dashboard/utilisateurs/modifier/${user.id}`)}
                                className="text-yellow-600 hover:text-yellow-900"
                                title="Modifier"
                              >
                                <Icon path={ICONS.edit} className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Supprimer"
                              >
                                <Icon path={ICONS.trash} className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );

      case 'statistiques':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold mb-4">Statistiques</h2>
              <p className="text-gray-500 mb-6">Analyses et rapports d'activité</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border rounded-lg p-6">
                  <h3 className="font-bold text-lg mb-4">Tendance des réservations</h3>
                  <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                    <Icon path={ICONS.barChart} className="h-16 w-16 text-gray-400" />
                    <span className="ml-4 text-gray-500">Graphique des réservations</span>
                  </div>
                </div>
                
                <div className="border rounded-lg p-6">
                  <h3 className="font-bold text-lg mb-4">Répartition par type d'événement</h3>
                  <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                    <Icon path={ICONS.chartPie} className="h-16 w-16 text-gray-400" />
                    <span className="ml-4 text-gray-500">Diagramme circulaire</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'parametres':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold mb-4">Paramètres</h2>
              <p className="text-gray-500 mb-6">Configurez votre compte et vos préférences</p>
              
              <div className="space-y-6">
                <div className="border rounded-lg p-6">
                  <h3 className="font-bold text-lg mb-4">Informations du compte</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nom d'utilisateur</label>
                      <input type="text" value={authUser?.username || ''} readOnly className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Rôles</label>
                      <input type="text" value={authUser?.roles?.join(', ') || 'UTILISATEUR'} readOnly className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md" />
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-6">
                  <h3 className="font-bold text-lg mb-4">Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg">
                      Modifier mon mot de passe
                    </button>
                    <button className="w-full text-left p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg">
                      Notifications par email
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left p-3 bg-red-50 hover:bg-red-100 rounded-lg text-red-700"
                    >
                      Se déconnecter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center p-8">
            <h2 className="text-xl font-bold text-gray-700">Contenu non disponible</h2>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Icon path={ICONS.calendar} className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Tableau de bord</h1>
                <p className="text-sm text-gray-500">Gestion des événements culturels</p>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Icon path={ICONS.bell} className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-900">{authUser?.username || 'Utilisateur'}</p>
                <p className="text-xs text-gray-500">{authUser?.roles?.join(', ') || 'UTILISATEUR'}</p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {(authUser?.username || 'U').charAt(0).toUpperCase()}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Icon path={ICONS.logout} className="w-4 h-4" />
                <span className="hidden md:inline">Déconnexion</span>
              </button>
            </div>
          </div>

          <div className="mt-4 flex space-x-1 overflow-x-auto">
            {[
              { id: 'accueil', label: 'Accueil', icon: ICONS.home },
              { id: 'evenements', label: 'Événements', icon: ICONS.calendar },
              { id: 'reservations', label: 'Réservations', icon: ICONS.ticket },
              { id: 'utilisateurs', label: 'Utilisateurs', icon: ICONS.user },
              { id: 'statistiques', label: 'Statistiques', icon: ICONS.barChart },
              { id: 'parametres', label: 'Paramètres', icon: ICONS.settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon path={tab.icon} className="w-4 h-4 inline mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default DashboardPage;