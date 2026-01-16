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
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Page d'accueil SANS Layout */}
        <Route path="/" element={<Home />} />
        
        {/* Routes publiques */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Routes protégées SANS Layout (elles ont leur propre navigation) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/dashboard/evenements"
          element={
            <ProtectedRoute>
              <DashboardEvenements />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <Events />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/mes-reservations"
          element={
            <ProtectedRoute>
              <MesReservations />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/create-event"
          element={
            <ProtectedRoute>
              <CreateEvent />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/statistiques"
          element={
            <ProtectedRoute>
              <Statistiques />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/parametres"
          element={
            <ProtectedRoute>
              <Parametres />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminUsers />
            </ProtectedRoute>
          }
        />

        {/* Route 404 */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-xl text-gray-600 mb-8">Page non trouvée</p>
              <a 
                href="/" 
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium"
              >
                Retour à l'accueil
              </a>
            </div>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;   