import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import DashboardEvenements from './pages/DashboardEvenements';
import MesReservations from './pages/MesReservations';
import CreateEvent from './pages/CreateEvent';
import Statistiques from './pages/Statistiques';
import Parametres from './pages/Parametres';
import AdminUsers from './pages/AdminUsers';
import EventDetail from './pages/EventDetail';
import { ProtectedRoute } from './components/ProtectedRoute';

// ✅ Composant 404 séparé pour éviter les erreurs de parsing JSX
function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Page non trouvée</p>
        <a href="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium">
          Retour accueil
        </a>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard/evenements" element={<ProtectedRoute><DashboardEvenements /></ProtectedRoute>} />
        <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />

        {/* ✅ Route détail événement */}
        <Route path="/events/:id" element={<ProtectedRoute><EventDetail /></ProtectedRoute>} />

        <Route path="/mes-reservations" element={<ProtectedRoute><MesReservations /></ProtectedRoute>} />
        <Route path="/create-event" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
        <Route path="/statistiques" element={<ProtectedRoute><Statistiques /></ProtectedRoute>} />
        <Route path="/parametres" element={<ProtectedRoute><Parametres /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute requiredRole="ADMIN"><AdminUsers /></ProtectedRoute>} />

        {/* ✅ 404 en composant séparé — évite les erreurs de parsing */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;