import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Statistiques() {
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalUsers: 0,
    totalReservations: 0,
    revenue: 0,
    upcomingEvents: 0,
    pastEvents: 0
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month'); // month, year, all

  useEffect(() => {
    // Simuler le chargement des statistiques
    setTimeout(() => {
      setStats({
        totalEvents: 24,
        totalUsers: 156,
        totalReservations: 342,
        revenue: 12560,
        upcomingEvents: 8,
        pastEvents: 16
      });
      setLoading(false);
    }, 1000);
  }, [timeRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📊 Statistiques</h1>
              <p className="text-gray-600 mt-2">
                Analysez les performances de votre plateforme
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="month">Ce mois</option>
                <option value="year">Cette année</option>
                <option value="all">Tous le temps</option>
              </select>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 border border-gray-600 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Exporter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Cartes de statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Événements totaux</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalEvents}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-green-600">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>+12% depuis le mois dernier</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Utilisateurs inscrits</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-green-600">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>+23 nouveaux utilisateurs ce mois</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Revenus totaux</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(stats.revenue)}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-green-600">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>+18% depuis le mois dernier</span>
                </div>
              </div>
            </div>

            {/* Graphiques et détails */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Réservations par mois */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Réservations par mois</h3>
                <div className="space-y-4">
                  {[
                    { month: 'Janvier', reservations: 45, growth: '+12%' },
                    { month: 'Février', reservations: 67, growth: '+25%' },
                    { month: 'Mars', reservations: 89, growth: '+18%' },
                    { month: 'Avril', reservations: 102, growth: '+32%' },
                    { month: 'Mai', reservations: 124, growth: '+15%' },
                    { month: 'Juin', reservations: 156, growth: '+28%' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">{item.month}</span>
                          <span className="text-sm font-medium text-gray-900">{item.reservations}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(item.reservations / 200) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="ml-4 text-sm text-green-600">{item.growth}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Répartition par type d'événement */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Répartition par type</h3>
                <div className="space-y-4">
                  {[
                    { type: 'Festivals', count: 8, color: 'bg-purple-500' },
                    { type: 'Concerts', count: 6, color: 'bg-blue-500' },
                    { type: 'Expositions', count: 5, color: 'bg-green-500' },
                    { type: 'Spectacles', count: 3, color: 'bg-yellow-500' },
                    { type: 'Conférences', count: 2, color: 'bg-red-500' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center">
                      <div className={`w-3 h-3 ${item.color} rounded-full mr-3`}></div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">{item.type}</span>
                          <span className="text-sm font-medium text-gray-900">{item.count} événements</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`${item.color} h-2 rounded-full`}
                            style={{ width: `${(item.count / 24) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Informations supplémentaires */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Événements à venir</h3>
                <div className="space-y-3">
                  {[
                    { title: 'Festival de Jazz', date: '15 juin 2026', places: '45/250' },
                    { title: 'Exposition Photo', date: '22 juillet 2026', places: '120/150' },
                    { title: 'Concert Classique', date: '5 août 2026', places: '89/200' }
                  ].map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{event.title}</p>
                        <p className="text-sm text-gray-600">{event.date}</p>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                        {event.places} places
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <Link
                    to="/dashboard/evenements"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Voir tous les événements →
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Top utilisateurs</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Jean Dupont', reservations: 12, spent: '540€' },
                    { name: 'Marie Martin', reservations: 9, spent: '380€' },
                    { name: 'Pierre Bernard', reservations: 7, spent: '295€' }
                  ].map((user, index) => (
                    <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-bold text-gray-600">{user.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.reservations} réservations</p>
                        </div>
                      </div>
                      <span className="font-medium text-gray-900">{user.spent}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <p className="text-lg font-bold mb-2">Tableau de statistiques</p>
            <p className="text-gray-400 text-sm">
              Analyse détaillée des performances de votre plateforme
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}