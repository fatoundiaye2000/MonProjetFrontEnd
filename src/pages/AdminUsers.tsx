import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import { Utilisateur } from '../types/user.types';

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiService.getAllUtilisateurs();
      setUsers(data);
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fonction pour obtenir le rôle de l'utilisateur
  const getUserRole = (user: Utilisateur): string => {
    // Nouvelle structure Spring Boot : roles est un tableau
    if (user.roles && user.roles.length > 0) {
      const hasAdmin = user.roles.some(r => r.role === 'ADMIN' || r.nom === 'ADMIN');
      if (hasAdmin) return 'ADMIN';
    }
    // Ancienne structure (pour compatibilité)
    if (user.role?.nom === 'ADMIN' || user.role?.role === 'ADMIN') return 'ADMIN';
    // Fallback pour l'admin système
    if (user.email === 'admin@example.com') return 'ADMIN';
    return 'UTILISATEUR';
  };

  // ✅ Vérifier si l'utilisateur est admin
  const isAdmin = (user: Utilisateur): boolean => {
    return getUserRole(user) === 'ADMIN';
  };

  // ✅ Rôle formaté pour l'affichage
  const getDisplayRole = (user: Utilisateur): string => {
    return isAdmin(user) ? 'Administrateur' : 'Utilisateur';
  };

  // ✅ Filtrage des utilisateurs
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.nom?.toLowerCase().includes(search.toLowerCase()) ||
      user.prenom?.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    
    const userRole = getUserRole(user);
    const matchesRole = 
      selectedRole === 'ALL' || 
      (selectedRole === 'ADMIN' && userRole === 'ADMIN') ||
      (selectedRole === 'UTILISATEUR' && userRole === 'UTILISATEUR');

    return matchesSearch && matchesRole;
  });

  // ✅ Suppression d'un utilisateur
  const handleDelete = async (id: number, email: string) => {
    if (email === 'admin@example.com') {
      alert('❌ Impossible de supprimer l\'administrateur système');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    try {
      await apiService.deleteUtilisateur(id);
      await loadUsers();
      alert('✅ Utilisateur supprimé avec succès');
    } catch (err) {
      const error = err as Error;
      alert(`❌ Erreur: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">👨‍💼 Gestion des utilisateurs</h1>
              <p className="text-gray-600 mt-2">
                Gérez tous les utilisateurs de la plateforme
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 border border-gray-600 text-gray-600 rounded-lg hover:bg-gray-50 transition-all font-medium"
            >
              Retour au tableau de bord
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Filtres et recherche */}
        <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nom, prénom ou email..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrer par rôle
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">Tous les rôles</option>
                <option value="ADMIN">Administrateurs</option>
                <option value="UTILISATEUR">Utilisateurs</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={loadUsers}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Actualiser
              </button>
            </div>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <span className="font-semibold">{filteredUsers.length}</span> utilisateur{filteredUsers.length > 1 ? 's' : ''} trouvé{filteredUsers.length > 1 ? 's' : ''}
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-purple-600">
                {users.filter(u => isAdmin(u)).length}
              </span> administrateur{users.filter(u => isAdmin(u)).length > 1 ? 's' : ''} •{' '}
              <span className="font-semibold text-blue-600">
                {users.filter(u => !isAdmin(u)).length}
              </span> utilisateur{users.filter(u => !isAdmin(u)).length > 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* En-tête du tableau */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">Liste des utilisateurs</h2>
            </div>

            {/* Tableau */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prénom
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rôle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        Aucun utilisateur trouvé
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const isUserAdmin = isAdmin(user);
                      const isSystemAdmin = user.email === 'admin@example.com';
                      
                      return (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.nom || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.prenom || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              isUserAdmin
                                ? 'bg-purple-100 text-purple-800 border border-purple-300' 
                                : 'bg-blue-100 text-blue-800 border border-blue-300'
                            }`}>
                              {getDisplayRole(user)}
                            </span>
                            {isSystemAdmin && (
                              <span className="ml-2 text-xs text-gray-500">
                                (Système)
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                            <button
                              onClick={() => navigate(`/admin/users/${user.id}`)}
                              className="text-blue-600 hover:text-blue-900 hover:underline transition-colors"
                            >
                              Détails
                            </button>
                            
                            {!isSystemAdmin && (
                              <button
                                onClick={() => handleDelete(user.id, user.email)}
                                className="text-red-600 hover:text-red-900 hover:underline transition-colors"
                              >
                                Supprimer
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Statistiques */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {users.length}
            </div>
            <div className="text-gray-700">Utilisateurs totaux</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {users.filter(u => isAdmin(u)).length}
            </div>
            <div className="text-gray-700">Administrateurs</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {users.filter(u => !isAdmin(u)).length}
            </div>
            <div className="text-gray-700">Utilisateurs normaux</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-2">
              {users.filter(u => u.email === 'admin@example.com').length}
            </div>
            <div className="text-gray-700">Admin système</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <p className="text-lg font-bold mb-2">Gestion des utilisateurs</p>
            <p className="text-gray-400 text-sm">
              Administration complète des utilisateurs de la plateforme
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}