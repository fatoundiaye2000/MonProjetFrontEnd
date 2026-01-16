import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import eventService from '../services/event.service';
import uploadService from '../services/upload.service';
import { Evenement } from '../types/event.types';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [backendImages, setBackendImages] = useState<string[]>([]);
  const [backendInfo, setBackendInfo] = useState<{folder: string; count: number} | null>(null);
  const navigate = useNavigate();

  // États pour le menu hamburger
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Événements démo fixes avec dates en 2026 AVEC VOS VRAIES IMAGES
  const demoEvents: Evenement[] = [
    {
      id_event: 1,
      titre_event: "Festival de Jazz International",
      description: "Découvrez les plus grands noms du jazz dans un cadre unique. Trois jours de concerts exceptionnels avec des artistes internationaux.",
      date_debut: new Date('2026-06-15T18:00:00').toISOString(),
      date_fin: new Date('2026-06-17T23:00:00').toISOString(),
      nb_place: 250,
      // 🔥 VOTRE IMAGE RÉELLE DU BACKEND
      image: "event_1767732541267_a1d12c20.png",
      adresse_id_adresse: 1,
      organisateur_id_user: 1,
      tarif_id_tarif: 1,
      type_event_id_type_event: 1,
      tarif: { 
        id_tarif: 1,
        montant: 35,
        devise: "EUR",
        type_tarif: "Standard"
      },
      type_event: { 
        id_type_event: 1,
        nom_type: "Festival",
        description: "Festivals culturels"
      },
      adresse: {
        id_adresse: 1,
        ville: "Paris",
        code_postal: "75015",
        pays: "France"
      },
      organisateur: {
        id_user: 1,
        nom: "Admin",
        prenom: "Culture",
        email: "admin@cultureevents.com"
      }
    },
    {
      id_event: 2,
      titre_event: "Exposition d'Art Contemporain",
      description: "Une collection exceptionnelle d'œuvres d'art contemporain d'artistes émergents et confirmés.",
      date_debut: new Date('2026-03-10T10:00:00').toISOString(),
      date_fin: new Date('2026-05-10T18:00:00').toISOString(),
      nb_place: 150,
      // 🔥 VOTRE IMAGE RÉELLE DU BACKEND
      image: "event_1767732256076_7594c16a.jpg",
      adresse_id_adresse: 2,
      organisateur_id_user: 1,
      tarif_id_tarif: 2,
      type_event_id_type_event: 2,
      tarif: { 
        id_tarif: 2,
        montant: 0,
        devise: "EUR",
        type_tarif: "Gratuit"
      },
      type_event: { 
        id_type_event: 2,
        nom_type: "Exposition",
        description: "Expositions artistiques"
      },
      adresse: {
        id_adresse: 2,
        ville: "Lyon",
        code_postal: "69001",
        pays: "France"
      },
      organisateur: {
        id_user: 1,
        nom: "Admin",
        prenom: "Culture",
        email: "admin@cultureevents.com"
      }
    },
    {
      id_event: 3,
      titre_event: "Spectacle de Danse Moderne",
      description: "Une performance captivante mêlant danse contemporaine et nouvelles technologies.",
      date_debut: new Date('2026-09-22T20:00:00').toISOString(),
      date_fin: new Date('2026-09-22T22:00:00').toISOString(),
      nb_place: 200,
      // 🔥 VOTRE IMAGE RÉELLE DU BACKEND
      image: "event_1767732304324_ee1f3d49.jpg",
      adresse_id_adresse: 3,
      organisateur_id_user: 1,
      tarif_id_tarif: 3,
      type_event_id_type_event: 3,
      tarif: { 
        id_tarif: 3,
        montant: 25,
        devise: "EUR",
        type_tarif: "Standard"
      },
      type_event: { 
        id_type_event: 3,
        nom_type: "Spectacle",
        description: "Spectacles vivants"
      },
      adresse: {
        id_adresse: 3,
        ville: "Marseille",
        code_postal: "13001",
        pays: "France"
      },
      organisateur: {
        id_user: 1,
        nom: "Admin",
        prenom: "Culture",
        email: "admin@cultureevents.com"
      }
    }
  ];

  // Récupérer les infos utilisateur depuis localStorage
  const getUser = () => {
    const userStr = localStorage.getItem('user');
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

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        setIsLoggedIn(true);
        setUserName(userData.nom || userData.email || 'Utilisateur');
      } catch (error) {
        console.error('Erreur de parsing user data:', error);
        setIsLoggedIn(false);
        setUserName('');
      }
    } else {
      setIsLoggedIn(false);
      setUserName('');
    }
  };

  useEffect(() => {
    checkAuthStatus();

    let isMounted = true;

    // Charger les événements
    const loadEvents = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await eventService.getAllEvents();
        
        if (isMounted) {
          if (Array.isArray(data) && data.length > 0) {
            const validEvents = data.filter(event => 
              event.titre_event && event.titre_event.trim() !== ''
            );
            console.log('✅ Événements chargés:', validEvents.length);
          } else {
            console.warn('Aucun événement valide trouvé');
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des événements';
          setError(errorMessage);
          console.error('Erreur de chargement:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Charger les images et infos du backend
    const loadBackendImages = async () => {
      try {
        console.log('🔄 Chargement images backend...');
        
        // Récupérer les infos détaillées
        const info = await uploadService.getFilesInfo();
        if (info && isMounted) {
          setBackendInfo({
            folder: info.folder,
            count: info.count
          });
        }
        
        // Récupérer la liste des images
        const images = await uploadService.getAllImages();
        
        if (isMounted) {
          if (images.length > 0) {
            setBackendImages(images);
            console.log(`✅ ${images.length} images réelles chargées depuis le backend`);
          } else {
            console.log('⚠️ Utilisation images par défaut');
            setBackendImages(uploadService.BACKEND_IMAGES);
          }
        }
      } catch (err) {
        console.error('❌ Erreur chargement images:', err);
        if (isMounted) {
          setBackendImages(uploadService.BACKEND_IMAGES);
        }
      }
    };

    loadEvents();
    loadBackendImages();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDropdownToggle = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Vérifier si l'utilisateur a un token valide
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!token;
  };

  // Fonction pour gérer la navigation avec vérification d'authentification
  const handleProtectedNavigate = (path: string) => {
    if (!isAuthenticated()) {
      // Si pas authentifié, rediriger vers login
      navigate('/login');
      setDropdownOpen(false);
    } else {
      // Si authentifié, naviguer normalement
      navigate(path);
      setDropdownOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserName('');
    navigate('/');
    setDropdownOpen(false);
  };

  // 🔥 FONCTION CORRIGÉE : Utilise UNIQUEMENT vos images réelles du backend Spring Boot
  const getEventImage = useCallback((event: Evenement): string => {
    console.log(`🖼️ Recherche image pour: ${event.titre_event}`);
    
    // 1. Si l'événement a déjà une image
    if (event.image && event.image.trim() !== '') {
      const url = uploadService.getImageUrl(event.image);
      console.log(`   → Image spécifique: ${event.image}`);
      return url;
    }
    
    // 2. Vérifier si l'image existe dans les images du backend
    if (backendImages.length > 0) {
      // Chercher une image avec un nom similaire
      const similarImage = backendImages.find(img => 
        img.toLowerCase().includes(event.type_event?.nom_type?.toLowerCase() || '') ||
        img.toLowerCase().includes(event.titre_event?.toLowerCase().split(' ')[0] || '')
      );
      
      if (similarImage) {
        console.log(`   → Image similaire trouvée: ${similarImage}`);
        return uploadService.getImageUrl(similarImage);
      }
    }
    
    // 3. Basé sur le type d'événement (avec vos images réelles du backend)
    const typeName = event.type_event?.nom_type || '';
    const title = event.titre_event?.toLowerCase() || '';
    
    console.log(`   → Type: ${typeName}, Titre: ${title}`);
    
    // Mapping avec vos VRAIES images du backend
    if (typeName.includes('Festival') || title.includes('festival') || title.includes('jazz')) {
      console.log('   → Festival → image festival');
      return uploadService.getImageUrl("event_1767732256076_7594c16a.jpg");
    }
    if (typeName.includes('Exposition') || title.includes('exposition') || title.includes('art')) {
      console.log('   → Exposition → image exposition');
      return uploadService.getImageUrl("event_1767732541267_a1d12c20.png");
    }
    if (typeName.includes('Spectacle') || title.includes('spectacle') || title.includes('danse')) {
      console.log('   → Spectacle → image spectacle');
      return uploadService.getImageUrl("event_1767732304324_ee1f3d49.jpg");
    }
    if (typeName.includes('Concert') || title.includes('concert')) {
      console.log('   → Concert → image concert');
      return uploadService.getImageUrl("event_1767732568405_8b853f8f.jpg");
    }
    
    // 4. Image aléatoire de VOTRE collection réelle du backend
    const randomImage = uploadService.getRandomBackendImage();
    console.log(`   → Image aléatoire: ${randomImage}`);
    return randomImage;
  }, [backendImages]);

  // 🔥 GESTION D'ERREUR CORRIGÉE : Fallback sur VOS images réelles du backend
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    console.warn('❌ Erreur chargement image, fallback...');
    
    // FALLBACK SUR VOTRE BACKEND SPRING BOOT
    const fallbackImage = uploadService.getRandomBackendImage();
    target.src = fallbackImage;
    target.onerror = null; // Éviter les boucles infinies
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString || dateString.trim() === '') {
        return 'Date non disponible';
      }
      
      const date = new Date(dateString);
      
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

  const formatTime = (dateString: string) => {
    try {
      if (!dateString || dateString.trim() === '') {
        return '';
      }
      
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return '';
      }
      
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${hours}h${minutes}`;
    } catch {
      return '';
    }
  };

  const displayTarif = (event: Evenement) => {
    if (event.tarif) {
      if (event.tarif.montant === 0 || event.tarif.montant === undefined) {
        return 'Gratuit';
      }
      return `${event.tarif.montant}€`;
    }
    
    return 'Tarif non spécifié';
  };

  const serviceCategories = [
    {
      icon: "🎭",
      title: "Festivals Culturels",
      description: "Festivals thématiques : musique, théâtre, danse, arts visuels",
      type: "Festival",
      color: "from-purple-500 to-pink-500",
      image: "event_1767732256076_7594c16a.jpg"
    },
    {
      icon: "🎵",
      title: "Concerts & Spectacles",
      description: "Concerts en plein air, spectacles vivants, théâtre, danse contemporaine",
      type: "Concert",
      color: "from-blue-500 to-cyan-500",
      image: "event_1767732568405_8b853f8f.jpg"
    },
    {
      icon: "🎨",
      title: "Arts & Expositions",
      description: "Expositions artistiques, photographie, arts plastiques, installations",
      type: "Exposition",
      color: "from-green-500 to-emerald-500",
      image: "event_1767732541267_a1d12c20.png"
    },
    {
      icon: "💼",
      title: "Événements Entreprises",
      description: "Team building culturel, soirées de gala, lancements de produits",
      type: "Conférence",
      color: "from-orange-500 to-red-500",
      image: "event_1767731725433_f04f6f9c.jpg"
    },
    {
      icon: "👥",
      title: "Ateliers Participatifs",
      description: "Ateliers danse, chant, peinture, création artistique pour tous niveaux",
      type: "Atelier",
      color: "from-yellow-500 to-amber-500",
      image: "event_1767732304324_ee1f3d49.jpg"
    },
    {
      icon: "🎤",
      title: "Conférences Culturelles",
      description: "Tables rondes, conférences, débats sur des thématiques culturelles",
      type: "Conférence",
      color: "from-indigo-500 to-purple-500",
      image: "event_1767731725433_f04f6f9c.jpg"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
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

            {/* Navigation Desktop */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Navigation principale */}
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => {
                    const accueilSection = document.getElementById('accueil');
                    if (accueilSection) {
                      accueilSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="text-gray-700 hover:text-purple-600 font-medium transition-colors px-3 py-2"
                >
                  Accueil
                </button>
                <a href="#evenements" className="text-gray-700 hover:text-purple-600 font-medium transition-colors px-3 py-2">Événements</a>
                <a href="#services" className="text-gray-700 hover:text-purple-600 font-medium transition-colors px-3 py-2">Services culturels</a>
              </div>

              {/* 🔥 MENU HAMBURGER UNIQUE AVEC TOUTES LES OPTIONS */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={handleDropdownToggle}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium shadow-lg ml-4"
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
                        onClick={() => {
                          const accueilSection = document.getElementById('accueil');
                          if (accueilSection) {
                            accueilSection.scrollIntoView({ behavior: 'smooth' });
                          }
                          setDropdownOpen(false);
                        }}
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
                          onClick={() => {
                            handleLogout();
                            setDropdownOpen(false);
                          }}
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
                            onClick={() => {
                              navigate('/login');
                              setDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-green-50 transition-colors flex items-center text-green-600"
                          >
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                            <span className="font-medium">🔑 Connexion</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              navigate('/register');
                              setDropdownOpen(false);
                            }}
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

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button 
                onClick={handleDropdownToggle}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Menu mobile */}
          {dropdownOpen && (
            <div className="lg:hidden border-t border-gray-200 pt-4 pb-4">
              <div className="space-y-2">
                {/* Navigation principale mobile */}
                <button
                  onClick={() => {
                    const accueilSection = document.getElementById('accueil');
                    if (accueilSection) {
                      accueilSection.scrollIntoView({ behavior: 'smooth' });
                    }
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 bg-purple-100 text-purple-700 rounded-lg font-medium flex items-center"
                >
                  🏠 Accueil
                </button>
                
                <a 
                  href="#evenements" 
                  onClick={() => setDropdownOpen(false)}
                  className="w-full text-left px-4 py-3 border border-purple-600 text-purple-600 rounded-lg font-medium flex items-center"
                >
                  📅 Événements
                </a>
                
                <a 
                  href="#services" 
                  onClick={() => setDropdownOpen(false)}
                  className="w-full text-left px-4 py-3 border border-blue-600 text-blue-600 rounded-lg font-medium flex items-center"
                >
                  🎨 Services culturels
                </a>

                <div className="border-t border-gray-100 my-2"></div>

                {/* Options du menu hamburger pour mobile */}
                <button
                  onClick={() => handleProtectedNavigate('/dashboard')}
                  className="w-full text-left px-4 py-3 border border-blue-600 text-blue-600 rounded-lg font-medium flex items-center"
                >
                  📊 Tableau de bord
                </button>
                
                <button
                  onClick={() => handleProtectedNavigate('/dashboard/evenements')}
                  className="w-full text-left px-4 py-3 border border-green-600 text-green-600 rounded-lg font-medium flex items-center"
                >
                  📅 Voir les événements
                </button>
                
                <button
                  onClick={() => handleProtectedNavigate('/events')}
                  className="w-full text-left px-4 py-3 border border-yellow-600 text-yellow-600 rounded-lg font-medium flex items-center"
                >
                  👥 Inscription événement
                </button>
                
                <button
                  onClick={() => handleProtectedNavigate('/mes-reservations')}
                  className="w-full text-left px-4 py-3 border border-teal-600 text-teal-600 rounded-lg font-medium flex items-center"
                >
                  🎫 Les réservations
                </button>
                
                <button
                  onClick={() => handleProtectedNavigate('/create-event')}
                  className="w-full text-left px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-medium flex items-center"
                >
                  ➕ Créer événement
                </button>
                
                <button
                  onClick={() => handleProtectedNavigate('/statistiques')}
                  className="w-full text-left px-4 py-3 border border-indigo-600 text-indigo-600 rounded-lg font-medium flex items-center"
                >
                  📊 Statistiques
                </button>

                <button
                  onClick={() => handleProtectedNavigate('/parametres')}
                  className="w-full text-left px-4 py-3 border border-gray-600 text-gray-600 rounded-lg font-medium flex items-center"
                >
                  ⚙️ Paramètres
                </button>

                {/* Gestion utilisateurs (admin seulement) */}
                {isAdmin && (
                  <button
                    onClick={() => handleProtectedNavigate('/admin/users')}
                    className="w-full text-left px-4 py-3 border border-red-600 text-red-600 rounded-lg font-medium flex items-center"
                  >
                    👨‍💼 Gestion utilisateurs
                  </button>
                )}

                {/* Déconnexion/Connexion */}
                <div className="pt-2">
                  {user ? (
                    <button
                      onClick={() => {
                        handleLogout();
                        setDropdownOpen(false);
                      }}
                      className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg font-medium"
                    >
                      🚪 Déconnexion
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          navigate('/login');
                          setDropdownOpen(false);
                        }}
                        className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium mb-2"
                      >
                        🔑 Connexion
                      </button>
                      
                      <button
                        onClick={() => {
                          navigate('/register');
                          setDropdownOpen(false);
                        }}
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

      {/* Hero Section */}
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
              {isLoggedIn 
                ? `Bienvenue ${userName}, découvrez nos événements culturels à venir en 2026`
                : "Découvrez nos événements culturels à venir en 2026"
              }
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {isLoggedIn ? (
                <>
                  <Link to="/dashboard/evenements" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all font-bold text-lg shadow-xl hover:shadow-2xl">Voir tous les événements</Link>
                  <Link to="/dashboard" className="px-8 py-4 bg-white text-gray-800 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-gray-50 transition-all font-bold text-lg shadow-lg hover:shadow-xl">Tableau de bord</Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all font-bold text-lg shadow-xl hover:shadow-2xl">Créer un compte</Link>
                  <a href="#evenements" className="px-8 py-4 bg-white text-gray-800 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-gray-50 transition-all font-bold text-lg shadow-lg hover:shadow-xl">Voir nos événements</a>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Section Événements */}
      <section id="evenements" className="py-16 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Événements à Venir en 2026</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">Découvrez nos prochains événements culturels</p>
          </div>

          {error && !loading && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg mb-6">{error}</div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {demoEvents.map((event) => (
                <div key={event.id_event} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                  {/* Image de l'événement - AVEC VOS IMAGES RÉELLES */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={getEventImage(event)}
                      alt={event.titre_event}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      onError={handleImageError}
                      loading="lazy"
                    />
                    {event.nb_place && event.nb_place > 0 && (
                      <div className="absolute top-3 right-3">
                        <span className="px-3 py-1 bg-white/90 text-gray-900 text-sm font-semibold rounded-lg shadow-sm">{event.nb_place} places</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Contenu de l'événement */}
                  <div className="p-6">
                    {event.type_event?.nom_type && (
                      <div className="mb-2">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-lg">{event.type_event.nom_type}</span>
                      </div>
                    )}

                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{event.titre_event}</h3>
                    <p className="text-gray-600 mb-4 text-sm line-clamp-2">{event.description}</p>
                    
                    {/* Lieu */}
                    {event.adresse && (
                      <div className="flex items-center text-sm text-gray-700 mb-2">
                        <svg className="w-4 h-4 mr-2 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate">{event.adresse.ville}</span>
                      </div>
                    )}
                    
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

                      <div className="flex items-center text-sm text-gray-700">
                        <svg className="w-4 h-4 mr-2 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-semibold">{displayTarif(event)}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <Link to={`/events/${event.id_event}`} className="px-4 py-2 text-purple-600 border border-purple-600 text-sm rounded-lg hover:bg-purple-50 transition-colors font-medium">Détails</Link>
                      {isLoggedIn ? (
                        <Link to={`/events/${event.id_event}/reservation`} className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors font-medium">Réserver</Link>
                      ) : (
                        <Link to="/register" className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors font-medium">S'inscrire pour réserver</Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            {isLoggedIn ? (
              <Link to="/dashboard/evenements" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium shadow-lg hover:shadow-xl">
                <span>Gérer mes événements</span>
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            ) : (
              <Link to="/events" className="inline-flex items-center px-6 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg hover:border-purple-300 hover:bg-gray-50 transition-all font-medium shadow-sm">
                <span>Voir tous les événements</span>
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Section Galerie des images du backend */}
      <section className="py-12 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">🖼️ Galerie des images uploadées</h2>
            <p className="text-gray-600 mb-6">
              Ces images sont stockées sur votre backend Spring Boot et servies depuis{' '}
              <code className="bg-gray-200 px-2 py-1 rounded">
                {backendInfo?.folder || 'C:\\Users\\Utente\\Documents\\workspace-spring-tool-suite-4-4.28.1.RELEASE\\demo-4\\uploads\\images'}
              </code>
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {backendImages.slice(0, 4).map((filename, index) => (
                <div key={index} className="bg-white rounded-lg overflow-hidden shadow-lg">
                  <img
                    src={uploadService.getImageUrl(filename)}
                    alt={`Image ${index + 1}`}
                    className="w-full h-40 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = uploadService.getDefaultFallback();
                    }}
                  />
                  <div className="p-3 text-center">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {filename.length > 20 ? filename.substring(0, 20) + '...' : filename}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center gap-4">
                <button
                  onClick={() => window.open('http://localhost:8081/files/list', '_blank')}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-lg"
                >
                  📋 Voir la liste complète des fichiers
                </button>
                <button
                  onClick={() => window.open('http://localhost:8081/files/' + backendImages[0], '_blank')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg"
                >
                  🔗 Tester une image
                </button>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                <p>Total: <span className="font-bold">{backendImages.length}</span> images</p>
                {backendInfo && (
                  <p>Dossier backend: <code>{backendInfo.folder}</code></p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Nos Services Culturels</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">Solutions complètes pour tous vos projets événementiels</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceCategories.map((service, index) => (
              <div key={index} className="group bg-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className={`w-14 h-14 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center mb-4`}>
                  <span className="text-2xl">{service.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <div className="flex items-center justify-between">
                  <span className="inline-block px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg">Type: {service.type}</span>
                  <div className="text-xs text-gray-500">Image: {service.image.substring(0, 10)}...</div>
                </div>
              </div>
            ))}
          </div>

          {isLoggedIn && (
            <div className="text-center mt-12">
              <Link to="/create-event" className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all font-bold text-lg shadow-xl hover:shadow-2xl">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Créer un nouvel événement
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Statistiques */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-purple-600 mb-2">{demoEvents.length}</div>
              <div className="text-gray-700">Événements à venir</div>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {demoEvents.reduce((total, event) => total + (event.nb_place || 0), 0)}
              </div>
              <div className="text-gray-700">Places disponibles</div>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {new Set(demoEvents.filter(e => e.type_event?.nom_type).map(e => e.type_event!.nom_type)).size}
              </div>
              <div className="text-gray-700">Catégories d'événements</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-gradient-to-r from-purple-700 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            {isLoggedIn ? 'Prêt à créer votre propre événement ?' : 'Prêt à organiser votre événement culturel ?'}
          </h2>
          <p className="text-lg text-purple-200 mb-8">
            {isLoggedIn 
              ? 'Commencez dès maintenant à créer et gérer vos événements culturels'
              : 'Rejoignez-nous et découvrez tous nos événements pour 2026'
            }
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {isLoggedIn ? (
              <>
                <Link to="/create-event" className="px-8 py-4 bg-white text-purple-700 rounded-lg hover:bg-gray-100 transition-all font-bold shadow-lg">Créer un événement</Link>
                <Link to="/dashboard/evenements" className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white/10 transition-all font-bold">Voir mes événements</Link>
              </>
            ) : (
              <>
                <Link to="/register" className="px-8 py-4 bg-white text-purple-700 rounded-lg hover:bg-gray-100 transition-all font-bold shadow-lg">S'inscrire gratuitement</Link>
                <Link to="/events" className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white/10 transition-all font-bold">Voir tous les événements</Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
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
              <p className="text-gray-400 text-sm">Plateforme complète pour la gestion d'événements culturels</p>
              <div className="mt-2 text-xs text-gray-500">
                <div>Images: {backendImages.length} du backend</div>
                <div>API: http://localhost:8081/files/</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Navigation</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button
                  onClick={() => {
                    const accueilSection = document.getElementById('accueil');
                    if (accueilSection) {
                      accueilSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Accueil
                </button></li>
                <li><a href="#evenements" className="hover:text-white transition-colors">Événements</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Services culturels</a></li>
                <li><button
                  onClick={() => handleProtectedNavigate('/dashboard')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Tableau de bord
                </button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Événements</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button
                  onClick={() => handleProtectedNavigate('/events')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Voir tous les événements
                </button></li>
                <li><button
                  onClick={() => handleProtectedNavigate('/create-event')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Créer un événement
                </button></li>
                <li><button
                  onClick={() => handleProtectedNavigate('/dashboard')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Gestion événements
                </button></li>
                <li><button
                  onClick={() => navigate('/login')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Se connecter
                </button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Technique</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Backend: Spring Boot 3.5.0</li>
                <li>Frontend: React TypeScript</li>
                <li>Base: MySQL 5.7.24</li>
                <li>Images: {backendImages.length} fichiers</li>
                <li>
                  <a href="http://localhost:8081/files/list" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Voir API images</a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} CultureEvents. Tous droits réservés.</p>
            <p className="text-xs mt-2">Projet BTS SIO SLAM - Intégration complète frontend/backend</p>
          </div>
        </div>
      </footer>
    </div>
  );
}     