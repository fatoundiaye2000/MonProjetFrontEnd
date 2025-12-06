import { Link } from 'react-router-dom';

interface DashboardNavProps {
  userName?: string;
  userRoles?: string[];
  onLogout: () => void;
}

export default function DashboardNav({ userName, userRoles, onLogout }: DashboardNavProps) {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold">
              <Link to="/dashboard" className="text-blue-600 hover:text-blue-700">
                Tableau de bord
              </Link>
            </h1>
            <div className="flex gap-4">
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Utilisateurs
              </Link>
              <Link
                to="/events"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Événements
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm text-gray-600">
                {userName} ({userRoles?.join(', ')})
              </p>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
