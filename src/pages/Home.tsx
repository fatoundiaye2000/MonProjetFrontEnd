import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import eventService from '../services/event.service';
import { Evenement } from '../types/event.types';

export default function Home() {
  const [events, setEvents] = useState<Evenement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        setError('');
        console.log('Chargement des événements...');
        const data = await eventService.getAllEvents();
        console.log('Événements chargés:', data);
        
        // Vérifier si nous avons des données valides
        if (Array.isArray(data) && data.length > 0) {
          // Prendre les 3 premiers événements pour la page d'accueil
          const validEvents = data.filter(event => 
            event.titre_event && event.titre_event.trim() !== ''
          );
          setEvents(validEvents.slice(0, 3));
        } else {
          console.warn('Aucun événement valide trouvé, utilisation des données mock');
          setEvents(getMockEvents());
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des événements';
        setError(errorMessage);
        console.error('Erreur de chargement:', err);
        // Données fictives pour le développement
        setEvents(getMockEvents());
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  // Données fictives pour développement
  const getMockEvents = (): Evenement[] => [
    {
      id_event: 1,
      titre_event: "Festival Arts & Cultures",
      description: "Festival multiculturel réunissant musique, danse et arts visuels du monde entier",
      date_debut: "2024-06-15T10:00:00",
      date_fin: "2024-06-17T22:00:00",
      image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format&fit=crop&q=80",
      nb_place: 500,
      type_event: { id_type_event: 1, nom_type: "Festival" },
      tarif: { id_tarif: 1, montant: 25 }
    },
    {
      id_event: 2,
      titre_event: "Jazz en Plein Air",
      description: "Concert de jazz avec des artistes internationaux dans un cadre exceptionnel",
      date_debut: "2024-07-22T19:00:00",
      date_fin: "2024-07-22T23:00:00",
      image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&auto=format&fit=crop&q=80",
      nb_place: 300,
      type_event: { id_type_event: 2, nom_type: "Concert" },
      tarif: { id_tarif: 2, montant: 35 }
    },
    {
      id_event: 3,
      titre_event: "Exposition Art Contemporain",
      description: "Découvrez les œuvres des artistes contemporains les plus prometteurs",
      date_debut: "2024-03-01T10:00:00",
      date_fin: "2024-03-30T18:00:00",
      image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&auto=format&fit=crop&q=80",
      nb_place: 100,
      type_event: { id_type_event: 3, nom_type: "Exposition" },
      tarif: { id_tarif: 3, montant: 0 }
    }
  ];

  // Fonction pour obtenir une image par défaut
  const getDefaultImage = (event: Evenement) => {
    // Si l'événement a déjà une image, l'utiliser
    if (event.image && event.image.trim() !== '') {
      return event.image;
    }
    
    // Sinon, choisir en fonction du type ou du titre
    const typeName = event.type_event?.nom_type || '';
    const title = event.titre_event?.toLowerCase() || '';
    
    if (typeName.includes('Festival') || title.includes('festival')) {
      return "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format&fit=crop&q=80";
    }
    if (typeName.includes('Concert') || title.includes('concert') || title.includes('jazz')) {
      return "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&auto=format&fit=crop&q=80";
    }
    if (typeName.includes('Exposition') || title.includes('exposition') || title.includes('art')) {
      return "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&auto=format&fit=crop&q=80";
    }
    if (typeName.includes('Spectacle') || title.includes('spectacle') || title.includes('danse')) {
      return "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&auto=format&fit=crop&q=80";
    }
    
    return "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80";
  };

  // Formatage de la date
  const formatDate = (dateString: string) => {
    try {
      // Convertir la date en format ISO si nécessaire
      const dateStr = dateString.includes('T') ? dateString : `${dateString}T00:00:00`;
      const date = new Date(dateStr);
      
      // Vérifier si la date est valide
      if (isNaN(date.getTime())) {
        return 'Date non disponible';
      }
      
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return 'Date non disponible';
    }
  };

  // Formatage de l'heure
  const formatTime = (dateString: string) => {
    try {
      const dateStr = dateString.includes('T') ? dateString : `${dateString}T00:00:00`;
      const date = new Date(dateStr);
      
      if (isNaN(date.getTime())) {
        return '';
      }
      
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  // Afficher le tarif correctement
  const displayTarif = (event: Evenement) => {
    if (event.tarif) {
      if (event.tarif.montant === 0 || event.tarif.montant === undefined) {
        return 'Gratuit';
      }
      return `${event.tarif.montant}€`;
    }
    
    // Fallback si tarif n'est pas défini
    return 'Tarif non spécifié';
  };

  // Catégories de services (gardées pour la section Services)
  const serviceCategories = [
    {
      icon: "🎭",
      title: "Festivals Culturels",
      description: "Festivals thématiques : musique, théâtre, danse, arts visuels",
      type: "Festival",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: "🎵",
      title: "Concerts & Spectacles",
      description: "Concerts en plein air, spectacles vivants, théâtre, danse contemporaine",
      type: "Concert",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: "🎨",
      title: "Arts & Expositions",
      description: "Expositions artistiques, photographie, arts plastiques, installations",
      type: "Exposition",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: "💼",
      title: "Événements Entreprises",
      description: "Team building culturel, soirées de gala, lancements de produits",
      type: "Conférence",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: "👥",
      title: "Ateliers Participatifs",
      description: "Ateliers danse, chant, peinture, création artistique pour tous niveaux",
      type: "Atelier",
      color: "from-yellow-500 to-amber-500"
    },
    {
      icon: "🎤",
      title: "Conférences Culturelles",
      description: "Tables rondes, conférences, débats sur des thématiques culturelles",
      type: "Conférence",
      color: "from-indigo-500 to-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation avec logo et barre de navigation */}
      <nav className="bg-white/90 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo avec titre */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">CE</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  CultureEvents
                </h1>
                <p className="text-xs text-gray-500">Gestion Événementielle Culturelle</p>
              </div>
            </div>

            {/* Barre de navigation horizontale - MODIFIÉE : Services supprimé */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#accueil" className="text-gray-700 hover:text-purple-600 font-medium transition-colors hover:scale-105">
                Accueil
              </a>
              <a href="#evenements" className="text-gray-700 hover:text-purple-600 font-medium transition-colors hover:scale-105">
                Événements {/* MODIFIÉ : (0) supprimé */}
              </a>
              <Link
                to="/login"
                className="px-5 py-2 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-all font-medium"
              >
                Connexion
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium shadow-lg hover:shadow-xl"
              >
                Inscription
              </Link>
            </div>

            {/* Menu mobile */}
            <div className="md:hidden">
              <button className="p-2 rounded-lg hover:bg-gray-100">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section avec ancrage - MODIFIÉE */}
      <section id="accueil" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32 relative">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Gestion Événementielle
              <span className="block bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent">
                Pour Professionnels Culturels
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {/* MODIFIÉ : "nos événements" au lieu de "nos 0 événements" */}
              Découvrez nos événements culturels à venir
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/register"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all font-bold text-lg shadow-xl hover:shadow-2xl"
              >
                Créer un compte
              </Link>
              <a
                href="#evenements"
                className="px-8 py-4 bg-white text-gray-800 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-gray-50 transition-all font-bold text-lg shadow-lg hover:shadow-xl"
              >
                {/* MODIFIÉ : "nos événements" au lieu de "nos 0 événements" */}
                Voir nos événements
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Section Événements déplacée avant Services pour plus de visibilité */}
      <section id="evenements" className="py-16 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Événements à Venir
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Découvrez nos prochains événements culturels
            </p>
          </div>

          {error && !loading && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg mb-6">
              {error} - Affichage des données de démonstration
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Aucun événement programmé pour le moment</p>
              <Link
                to="/register"
                className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Soyez le premier à créer un événement
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {events.map((event) => (
                <div 
                  key={event.id_event} 
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
                >
                  {/* Image de l'événement */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={getDefaultImage(event)}
                      alt={event.titre_event}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80";
                      }}
                    />
                    {event.nb_place > 0 && (
                      <div className="absolute top-3 right-3">
                        <span className="px-3 py-1 bg-white/90 text-gray-900 text-sm font-semibold rounded-lg shadow-sm">
                          {event.nb_place} places
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Contenu de l'événement */}
                  <div className="p-6">
                    {/* Type d'événement */}
                    {event.type_event?.nom_type && (
                      <div className="mb-2">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-lg">
                          {event.type_event.nom_type}
                        </span>
                      </div>
                    )}

                    {/* Titre */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                      {event.titre_event || 'Événement sans titre'}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                      {event.description || 'Aucune description disponible'}
                    </p>
                    
                    {/* Dates */}
                    <div className="space-y-2 mb-4">
                      {event.date_debut && (
                        <div className="flex items-center text-sm text-gray-700">
                          <svg className="w-4 h-4 mr-2 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <div className="truncate">
                            <div className="font-medium">{formatDate(event.date_debut)}</div>
                            {event.date_fin && event.date_fin !== event.date_debut && (
                              <div className="text-xs text-gray-500 truncate">au {formatDate(event.date_fin)}</div>
                            )}
                          </div>
                        </div>
                      )}

                      {event.date_debut && (
                        <div className="flex items-center text-sm text-gray-700">
                          <svg className="w-4 h-4 mr-2 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{formatTime(event.date_debut)}</span>
                        </div>
                      )}

                      {/* Tarif */}
                      <div className="flex items-center text-sm text-gray-700">
                        <svg className="w-4 h-4 mr-2 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-semibold">
                          {displayTarif(event)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Bouton d'action */}
                    <div className="flex justify-between items-center">
                      <Link
                        to={`/events/${event.id_event}`}
                        className="px-4 py-2 text-purple-600 border border-purple-600 text-sm rounded-lg hover:bg-purple-50 transition-colors font-medium"
                      >
                        Détails
                      </Link>
                      <Link
                        to="/register"
                        className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors font-medium"
                      >
                        Réserver
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Call to Action */}
          <div className="text-center mt-8">
            <Link
              to="/events"
              className="inline-flex items-center px-6 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg hover:border-purple-300 hover:bg-gray-50 transition-all font-medium shadow-sm"
            >
              <span>Voir tous les événements</span>
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section - DÉPLACÉE après Événements */}
      <section id="services" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nos Services Culturels
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Solutions complètes pour tous vos projets événementiels
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceCategories.map((service, index) => (
              <div 
                key={index}
                className="group bg-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center mb-4`}>
                  <span className="text-2xl">{service.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <span className="inline-block px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg">
                  Type: {service.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistiques */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {events.length}
              </div>
              <div className="text-gray-700">Événements actifs</div>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {events.reduce((total, event) => total + (event.nb_place || 0), 0)}
              </div>
              <div className="text-gray-700">Places disponibles</div>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {new Set(events.filter(e => e.type_event?.nom_type).map(e => e.type_event!.nom_type)).size}
              </div>
              <div className="text-gray-700">Catégories d'événements</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final - MODIFIÉ */}
      <section className="py-16 bg-gradient-to-r from-purple-700 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Prêt à organiser votre événement culturel ?
          </h2>
          <p className="text-lg text-purple-200 mb-8">
            Rejoignez-nous et découvrez nos événements culturels
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-4 bg-white text-purple-700 rounded-lg hover:bg-gray-100 transition-all font-bold shadow-lg"
            >
              S'inscrire gratuitement
            </Link>
            <Link
              to="/events"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white/10 transition-all font-bold"
            >
              Voir tous les événements
            </Link>
          </div>
        </div>
      </section>

      {/* Footer - MODIFIÉ */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">CE</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">CultureEvents</h3>
                  <p className="text-sm text-gray-400">Gestion événementielle</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Plateforme complète pour la gestion d'événements culturels
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Navigation</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#accueil" className="hover:text-white transition-colors">Accueil</a></li>
                <li><a href="#evenements" className="hover:text-white transition-colors">Événements</a></li>
                <li><Link to="/dashboard" className="hover:text-white transition-colors">Tableau de bord</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Connexion</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Événements</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/events" className="hover:text-white transition-colors">Voir tous les événements</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Créer un événement</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Gestion événements</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>contact@cultureevents.com</li>
                <li>+33 1 23 45 67 89</li>
                <li>Paris, France</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CultureEvents. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}