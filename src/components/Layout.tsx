import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Récupérer les infos utilisateur depuis localStorage
  const getUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  };

  const user = getUser();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
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
                  <p className="text-xs text-gray-500">Dashboard</p>
                </div>
              </Link>
            </div>

            {/* Navigation desktop - seulement si connecté */}
            {user && (
              <div className="hidden md:flex items-center space-x-4">
                {/* Info utilisateur */}
                <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    user?.role === 'ADMIN' ? 'bg-gradient-to-r from-red-600 to-pink-600' : 'bg-gradient-to-r from-purple-600 to-blue-600'
                  }`}>
                    {user?.nom?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-900">{user?.email}</div>
                    <div className="text-xs text-gray-600">
                      {user?.role === 'ADMIN' ? 'ADMINISTRATEUR' : 'UTILISATEUR'}
                    </div>
                  </div>
                </div>

                {/* Menu principal */}
                <div className="flex items-center space-x-2">
                  <Link
                    to="/dashboard"
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 font-medium"
                  >
                    Tableau de bord
                  </Link>
                  
                  <Link
                    to="/events"
                    className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 font-medium"
                  >
                    Événements
                  </Link>
                  
                  <Link
                    to="/create-event"
                    className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 font-medium"
                  >
                    Créer
                  </Link>

                  {/* 🚨 NOUVEAU : Bouton Galerie Images Backend */}
                  <Link
                    to="/backend-images"
                    className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-all font-medium flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Galerie Images
                  </Link>

                  {/* Bouton Admin (seulement pour ADMIN) */}
                  {user?.role === 'ADMIN' && (
                    <Link
                      to="/admin/users"
                      className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 font-medium"
                    >
                      Utilisateurs
                    </Link>
                  )}
                  
                  {/* Bouton Retour à l'accueil */}
                  <Link
                    to="/"
                    className="px-4 py-2 border border-gray-600 text-gray-600 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Accueil
                  </Link>

                  {/* Bouton Déconnexion */}
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 font-medium"
                  >
                    Déconnexion
                  </button>
                </div>
              </div>
            )}

            {/* Si non connecté, afficher bouton login */}
            {!user && (
              <div className="hidden md:flex items-center">
                <Link
                  to="/login"
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 font-medium"
                >
                  Se connecter
                </Link>
              </div>
            )}

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

          {/* Menu mobile */}
          {mobileMenuOpen && user && (
            <div className="md:hidden border-t border-gray-200 pt-4 pb-4">
              {/* Info utilisateur mobile */}
              <div className="mb-4 flex items-center px-3 py-2 bg-gray-50 rounded-lg">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                  user?.role === 'ADMIN' ? 'bg-gradient-to-r from-red-600 to-pink-600' : 'bg-gradient-to-r from-purple-600 to-blue-600'
                }`}>
                  {user?.nom?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="ml-3 text-left">
                  <div className="text-sm font-semibold text-gray-900">{user?.email}</div>
                  <div className="text-xs text-gray-600">
                    {user?.role === 'ADMIN' ? 'ADMINISTRATEUR' : 'UTILISATEUR'}
                  </div>
                </div>
              </div>

              {/* Liens mobile */}
              <div className="space-y-2">
                <Link
                  to="/dashboard"
                  className="block px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Tableau de bord
                </Link>
                
                <Link
                  to="/events"
                  className="block px-4 py-3 border border-purple-600 text-purple-600 rounded-lg font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Événements
                </Link>
                
                <Link
                  to="/create-event"
                  className="block px-4 py-3 border border-green-600 text-green-600 rounded-lg font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Créer un événement
                </Link>

                {/* 🚨 NOUVEAU : Bouton Galerie Images Backend (mobile) */}
                <Link
                  to="/backend-images"
                  className="block px-4 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-medium flex items-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Galerie Images
                </Link>

                {/* Bouton Admin (seulement pour ADMIN) */}
                {user?.role === 'ADMIN' && (
                  <Link
                    to="/admin/users"
                    className="block px-4 py-3 border border-red-600 text-red-600 rounded-lg font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Gestion utilisateurs
                  </Link>
                )}
                
                <Link
                  to="/"
                  className="block px-4 py-3 border border-gray-600 text-gray-600 rounded-lg font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Retour à l'accueil
                </Link>
                
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg font-medium"
                >
                  Déconnexion
                </button>
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
              <Link to="/" className="text-gray-600 hover:text-purple-600 text-sm">
                Accueil
              </Link>
              {user && (
                <>
                  <Link to="/dashboard" className="text-gray-600 hover:text-purple-600 text-sm">
                    Dashboard
                  </Link>
                  <Link to="/events" className="text-gray-600 hover:text-purple-600 text-sm">
                    Événements
                  </Link>
                  <Link to="/backend-images" className="text-blue-600 hover:text-blue-800 text-sm">
                    Galerie Images
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
          
          {/* Information technique */}
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