import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { STORAGE_KEYS } from '../config/constants'; // ✅ IMPORTATION AJOUTÉE

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole
}) => {
  const { isAuthenticated, isLoading, hasRole } = useAuth();

  // Debug
  console.log('🔒 [ProtectedRoute] Statut:');
  console.log('  isLoading:', isLoading);
  console.log('  isAuthenticated:', isAuthenticated);
  console.log('  localStorage token:', localStorage.getItem(STORAGE_KEYS.TOKEN));
  console.log('  localStorage user:', localStorage.getItem(STORAGE_KEYS.USER));

  // Pendant le chargement, afficher un loader
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si pas authentifié, rediriger vers login
  if (!isAuthenticated) {
    console.log('⚠️ [ProtectedRoute] Redirection vers /login');
    return <Navigate to="/login" replace />;
  }

  // Si un rôle est requis et que l'utilisateur ne l'a pas
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Accès Refusé
          </h1>
          <p className="text-gray-600">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
        </div>
      </div>
    );
  }

  // Si tout est OK, afficher le contenu
  console.log('✅ [ProtectedRoute] Accès autorisé');
  return <>{children}</>;
};