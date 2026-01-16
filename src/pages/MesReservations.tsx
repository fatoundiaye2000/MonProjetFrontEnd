import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Définition du type pour les réservations
interface Reservation {
  id: number;
  event: string;
  date: string;
  status: 'Confirmée' | 'En attente' | 'Annulée';
  places: number;
  prix: string;
}

export default function MesReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler le chargement des réservations
    setTimeout(() => {
      setReservations([
        {
          id: 1,
          event: "Festival de Jazz International",
          date: "15 juin 2026",
          status: "Confirmée",
          places: 2,
          prix: "70€"
        },
        {
          id: 2,
          event: "Exposition d'Art Contemporain",
          date: "10 mars 2026",
          status: "Confirmée",
          places: 1,
          prix: "Gratuit"
        },
        {
          id: 3,
          event: "Spectacle de Danse Moderne",
          date: "22 septembre 2026",
          status: "En attente",
          places: 4,
          prix: "100€"
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleAnnulerReservation = (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      setReservations(reservations.filter(r => r.id !== id));
      alert('Réservation annulée avec succès');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🎫 Réservations</h1>
              <p className="text-gray-600 mt-2">
                Gérez toutes vos réservations d'événements
              </p>
            </div>
            <Link
              to="/events"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium shadow-lg flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Voir les événements
            </Link>
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
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* En-tête */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {reservations.length} réservation{reservations.length > 1 ? 's' : ''}
                </h2>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Total : </span>
                  {reservations.filter(r => r.status === "Confirmée").length} confirmée(s)
                </div>
              </div>
            </div>

            {/* Liste des réservations */}
            <div className="divide-y divide-gray-200">
              {reservations.length === 0 ? (
                <div className="p-12 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune réservation</h3>
                  <p className="mt-1 text-sm text-gray-500">Réservez votre premier événement dès maintenant.</p>
                  <div className="mt-6">
                    <Link
                      to="/events"
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700"
                    >
                      Voir les événements
                    </Link>
                  </div>
                </div>
              ) : (
                reservations.map((reservation) => (
                  <div key={reservation.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-bold text-gray-900">{reservation.event}</h3>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            reservation.status === "Confirmée" 
                              ? 'bg-green-100 text-green-800' 
                              : reservation.status === "En attente"
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {reservation.status}
                          </span>
                        </div>
                        
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <div>
                              <div className="text-sm text-gray-600">Date</div>
                              <div className="text-sm font-medium text-gray-900">{reservation.date}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <div>
                              <div className="text-sm text-gray-600">Places</div>
                              <div className="text-sm font-medium text-gray-900">{reservation.places} personne(s)</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                              <div className="text-sm text-gray-600">Prix total</div>
                              <div className="text-sm font-medium text-gray-900">{reservation.prix}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                              <div className="text-sm text-gray-600">N° Réservation</div>
                              <div className="text-sm font-medium text-gray-900">RES-{reservation.id.toString().padStart(6, '0')}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-6 flex flex-col space-y-2">
                        <button
                          onClick={() => {
                            // Télécharger le billet
                            alert(`Téléchargement du billet RES-${reservation.id.toString().padStart(6, '0')}`);
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          Télécharger billet
                        </button>
                        {reservation.status !== 'Annulée' && (
                          <button
                            onClick={() => handleAnnulerReservation(reservation.id)}
                            className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
                          >
                            Annuler réservation
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <p className="text-lg font-bold mb-2">Mes réservations</p>
            <p className="text-gray-400 text-sm">
              Consultez et gérez toutes vos réservations d'événements culturels
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}