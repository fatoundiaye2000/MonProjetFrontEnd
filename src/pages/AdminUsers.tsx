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

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.nom?.toLowerCase().includes(search.toLowerCase()) ||
      user.prenom?.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    
    const matchesRole = 
      selectedRole === 'ALL' || 
      (selectedRole === 'ADMIN' && (user.role?.nom === 'ADMIN' || user.email === 'admin@example.com')) ||
      (selectedRole === 'UTILISATEUR' && user.role?.nom !== 'ADMIN');

    return matchesSearch && matchesRole;
  });

  const handleDelete = async (id: number) => {
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

  const handleRoleChange = async (id: number, newRole: string) => {
    if (!confirm(`Changer le rôle de cet utilisateur en ${newRole} ?`)) {
      return;
    }

    try {
      // Ici, vous devriez appeler votre API pour changer le rôle
      alert(`Rôle changé en ${newRole} pour l'utilisateur ${id}`);
      await loadUsers(); // Recharger les données
    } catch {
      alert('❌ Erreur lors du changement de rôle');
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
              Retour
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
          
          <div className="mt-4 text-sm text-gray-600">
            {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} trouvé{filteredUsers.length > 1 ? 's' : ''}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg">
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
                <h2 className="text-xl font-bold text-gray-900">Liste des utilisateurs</h2>
                <button
                  onClick={() => {
                    // Fonction pour ajouter un utilisateur
                    alert('Fonctionnalité d\'ajout d\'utilisateur - En développement');
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  + Ajouter un utilisateur
                </button>
              </div>
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
                      Date d'inscription
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        Aucun utilisateur trouvé
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
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
                          <select
                            value={user.role?.nom || (user.email === 'admin@example.com' ? 'ADMIN' : 'UTILISATEUR')}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            disabled={user.email === 'admin@example.com'}
                            className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                              user.role?.nom === 'ADMIN' || user.email === 'admin@example.com'
                                ? 'bg-purple-100 text-purple-800 border-purple-300' 
                                : 'bg-blue-100 text-blue-800 border-blue-300'
                            }`}
                          >
                            <option value="ADMIN">ADMIN</option>
                            <option value="UTILISATEUR">UTILISATEUR</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {/* Correction sans any */}
                          {'createdAt' in user ? new Date(user.createdAt as string).toLocaleDateString('fr-FR') : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => {
                              // Voir le profil
                              alert(`Voir le profil de ${user.email}`);
                            }}
                            className="text-blue-600 hover:text-blue-900 hover:underline transition-colors"
                          >
                            Voir
                          </button>
                          <button
                            onClick={() => {
                              // Modifier
                              alert(`Modifier ${user.email}`);
                            }}
                            className="text-yellow-600 hover:text-yellow-900 hover:underline transition-colors"
                          >
                            Modifier
                          </button>
                          {user.email !== 'admin@example.com' && (
                            <button
                              onClick={() => handleDelete(user.id)}
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
              {users.filter(u => u.role?.nom === 'ADMIN' || u.email === 'admin@example.com').length}
            </div>
            <div className="text-gray-700">Administrateurs</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {users.filter(u => u.role?.nom !== 'ADMIN' && u.email !== 'admin@example.com').length}
            </div>
            <div className="text-gray-700">Utilisateurs normaux</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-2xl font-bold text-red-600 mb-2">
              {users.filter(u => !u.email.includes('@example.com')).length}
            </div>
            <div className="text-gray-700">Utilisateurs actifs</div>
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