import { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { STORAGE_KEYS } from '../config/constants'; // ✅ IMPORTATION AJOUTÉE

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Récupérer les infos utilisateur depuis localStorage
  const getUser = () => {
    // ✅ CORRIGÉ: Utilisez STORAGE_KEYS.USER au lieu de 'user'
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  };

  const user = getUser();
  const isAdmin = user?.role === 'ADMIN';

  // 🔥 Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
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

  // Fermer le menu mobile quand la route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    // ✅ CORRIGÉ: Utilisez STORAGE_KEYS.TOKEN et STORAGE_KEYS.USER
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    navigate('/login');
  };

  const handleDropdownToggle = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  // Vérifier si l'utilisateur a un token valide
  const isAuthenticated = () => {
    // ✅ CORRIGÉ: Utilisez STORAGE_KEYS.TOKEN
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    return !!token;
  };

  // Fonction pour gérer la navigation avec vérification d'authentification
  const handleProtectedNavigate = (path: string) => {
    if (!isAuthenticated()) {
      // Si pas authentifié, rediriger vers login
      navigate('/login');
      setDropdownOpen(false);
      setMobileMenuOpen(false);
    } else {
      // Si authentifié, naviguer normalement
      navigate(path);
      setDropdownOpen(false);
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo et marque */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">CE</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">CultureEvents</h1>
                  <p className="text-xs text-gray-500">
                    {user ? `Connecté en tant que ${user.email}` : 'Plateforme événementielle'}
                  </p>
                </div>
              </Link>
            </div>

            {/* Navigation desktop - MENU UNIQUE */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Info utilisateur (si connecté) */}
              {user && (
                <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    isAdmin ? 'bg-gradient-to-r from-red-600 to-pink-600' : 'bg-gradient-to-r from-purple-600 to-blue-600'
                  }`}>
                    {user?.nom?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-900">
                      {user?.nom ? `${user.nom} ${user.prenom || ''}`.trim() : user?.email}
                    </div>
                    <div className="text-xs text-gray-600">
                      {isAdmin ? 'ADMINISTRATEUR' : 'UTILISATEUR'}
                    </div>
                  </div>
                </div>
              )}

              {/* 🔥 Menu déroulant UNIQUE avec TOUTES les options */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={handleDropdownToggle}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium shadow-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                {/* Dropdown Menu COMPLET */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    <div className="py-2">
                      {/* Accueil */}
                      <button
                        onClick={() => handleNavigate('/')}
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
                        onClick={() => handleProtectedNavigate('/dashboard')}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center"
                      >
                        <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span className="font-medium">📊 Tableau de bord</span>
                      </button>

                      {/* Voir les événements */}
                      <button
                        onClick={() => handleProtectedNavigate('/dashboard/evenements')}
                        className="w-full text-left px-4 py-3 hover:bg-green-50 transition-colors flex items-center"
                      >
                        <svg className="w-5 h-5 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium">📅 Voir les événements</span>
                      </button>

                      {/* Inscription */}
                      <button
                        onClick={() => handleProtectedNavigate('/events')}
                        className="w-full text-left px-4 py-3 hover:bg-yellow-50 transition-colors flex items-center"
                      >
                        <svg className="w-5 h-5 mr-3 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        <span className="font-medium">👥 Inscription événement</span>
                      </button>

                      {/* Les réservations */}
                      <button
                        onClick={() => handleProtectedNavigate('/mes-reservations')}
                        className="w-full text-left px-4 py-3 hover:bg-teal-50 transition-colors flex items-center"
                      >
                        <svg className="w-5 h-5 mr-3 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span className="font-medium">🎫 Les réservations</span>
                      </button>

                      {/* Créer un événement */}
                      <button
                        onClick={() => handleProtectedNavigate('/create-event')}
                        className="w-full text-left px-4 py-3 hover:bg-emerald-50 transition-colors flex items-center"
                      >
                        <svg className="w-5 h-5 mr-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="font-medium">➕ Créer un événement</span>
                      </button>

                      {/* Statistiques */}
                      <button
                        onClick={() => handleProtectedNavigate('/statistiques')}
                        className="w-full text-left px-4 py-3 hover:bg-indigo-50 transition-colors flex items-center"
                      >
                        <svg className="w-5 h-5 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span className="font-medium">📊 Statistiques</span>
                      </button>

                      {/* Paramètres */}
                      <button
                        onClick={() => handleProtectedNavigate('/parametres')}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center"
                      >
                        <svg className="w-5 h-5 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="font-medium">⚙️ Paramètres</span>
                      </button>

                      {/* Gestion utilisateurs (uniquement pour admin) */}
                      {isAdmin && (
                        <>
                          <div className="border-t border-gray-100 my-1"></div>
                          <button
                            onClick={() => handleProtectedNavigate('/admin/users')}
                            className="w-full text-left px-4 py-3 hover:bg-red-50 transition-colors flex items-center"
                          >
                            <svg className="w-5 h-5 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium">👨‍💼 Gestion utilisateurs</span>
                          </button>
                        </>
                      )}

                      {/* Déconnexion/Connexion */}
                      <div className="border-t border-gray-100 my-1"></div>
                      {user ? (
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-3 hover:bg-red-50 transition-colors flex items-center text-red-600"
                        >
                          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span className="font-medium">🚪 Déconnexion</span>
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleNavigate('/login')}
                            className="w-full text-left px-4 py-3 hover:bg-green-50 transition-colors flex items-center text-green-600"
                          >
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                            <span className="font-medium">🔑 Connexion</span>
                          </button>
                          
                          <button
                            onClick={() => handleNavigate('/register')}
                            className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center text-blue-600"
                          >
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            <span className="font-medium">📝 Inscription</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bouton menu mobile */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Menu mobile - TOUTES LES OPTIONS */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 pt-4 pb-4">
              {user && (
                <div className="mb-4 flex items-center px-3 py-2 bg-gray-50 rounded-lg">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    isAdmin ? 'bg-gradient-to-r from-red-600 to-pink-600' : 'bg-gradient-to-r from-purple-600 to-blue-600'
                  }`}>
                    {user?.nom?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="ml-3 text-left">
                    <div className="text-sm font-semibold text-gray-900">
                      {user?.nom ? `${user.nom} ${user.prenom || ''}`.trim() : user?.email}
                    </div>
                    <div className="text-xs text-gray-600">
                      {isAdmin ? 'ADMINISTRATEUR' : 'UTILISATEUR'}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {/* Accueil */}
                <button
                  onClick={() => handleNavigate('/')}
                  className="w-full text-left px-4 py-3 bg-purple-100 text-purple-700 rounded-lg font-medium flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  🏠 Accueil
                </button>

                {/* Tableau de bord */}
                <button
                  onClick={() => handleProtectedNavigate('/dashboard')}
                  className="w-full text-left px-4 py-3 border border-blue-600 text-blue-600 rounded-lg font-medium flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  📊 Tableau de bord
                </button>
                
                {/* Voir les événements */}
                <button
                  onClick={() => handleProtectedNavigate('/dashboard/evenements')}
                  className="w-full text-left px-4 py-3 border border-green-600 text-green-600 rounded-lg font-medium flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  📅 Voir les événements
                </button>
                
                {/* Inscription */}
                <button
                  onClick={() => handleProtectedNavigate('/events')}
                  className="w-full text-left px-4 py-3 border border-yellow-600 text-yellow-600 rounded-lg font-medium flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  👥 Inscription événement
                </button>
                
                {/* Les réservations */}
                <button
                  onClick={() => handleProtectedNavigate('/mes-reservations')}
                  className="w-full text-left px-4 py-3 border border-teal-600 text-teal-600 rounded-lg font-medium flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  🎫 Les réservations
                </button>
                
                {/* Créer un événement */}
                <button
                  onClick={() => handleProtectedNavigate('/create-event')}
                  className="w-full text-left px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-medium flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  ➕ Créer événement
                </button>
                
                {/* Statistiques */}
                <button
                  onClick={() => handleProtectedNavigate('/statistiques')}
                  className="w-full text-left px-4 py-3 border border-indigo-600 text-indigo-600 rounded-lg font-medium flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  📊 Statistiques
                </button>

                {/* Paramètres */}
                <button
                  onClick={() => handleProtectedNavigate('/parametres')}
                  className="w-full text-left px-4 py-3 border border-gray-600 text-gray-600 rounded-lg font-medium flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  ⚙️ Paramètres
                </button>

                {/* Gestion utilisateurs (admin seulement) */}
                {isAdmin && (
                  <button
                    onClick={() => handleProtectedNavigate('/admin/users')}
                    className="w-full text-left px-4 py-3 border border-red-600 text-red-600 rounded-lg font-medium flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    👨‍💼 Gestion utilisateurs
                  </button>
                )}

                {/* Déconnexion/Connexion */}
                <div className="pt-2">
                  {user ? (
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg font-medium"
                    >
                      🚪 Déconnexion
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleNavigate('/login')}
                        className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium mb-2"
                      >
                        🔑 Connexion
                      </button>
                      
                      <button
                        onClick={() => handleNavigate('/register')}
                        className="w-full px-4 py-3 border border-purple-600 text-purple-600 rounded-lg font-medium"
                      >
                        📝 Inscription
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-600 text-sm">
                © {new Date().getFullYear()} CultureEvents. Tous droits réservés.
              </p>
              <p className="text-gray-500 text-xs">
                Plateforme de gestion événementielle culturelle
              </p>
            </div>
            
            <div className="flex space-x-4">
              <a 
                href="/" 
                className="text-gray-600 hover:text-purple-600 text-sm"
              >
                Accueil
              </a>
              {user && (
                <>
                  <Link to="/dashboard" className="text-gray-600 hover:text-purple-600 text-sm">
                    Dashboard
                  </Link>
                  <Link to="/dashboard/evenements" className="text-gray-600 hover:text-purple-600 text-sm">
                    Événements
                  </Link>
                  <Link to="/mes-reservations" className="text-gray-600 hover:text-purple-600 text-sm">
                    Les réservations
                  </Link>
                </>
              )}
              <a 
                href="http://localhost:8081/files/list" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                API Images
              </a>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-xs text-gray-500 flex flex-wrap gap-4">
              <div>
                <span className="font-medium">Backend:</span> Spring Boot (localhost:8081)
              </div>
              <div>
                <span className="font-medium">Frontend:</span> React TypeScript
              </div>
              <div>
                <span className="font-medium">Images:</span> Stockées sur backend
              </div>
              {user && (
                <div>
                  <span className="font-medium">Utilisateur:</span> {user.email}
                </div>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}