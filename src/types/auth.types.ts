// Requête de login (ce qu'on envoie au backend)
export interface LoginRequest {
  email: string;
  password: string;
}

// Réponse du backend après login réussi
export interface LoginResponse {
  token: string;
}

// Requête d'inscription
export interface RegisterRequest {
  nom: string;
  prenom: string;
  dateDeNaissance: string;
  email: string;
  motDePasse: string;
  role: {
    id: number;
  };
  entreprise?: {
    id: number;
  } | null;
}

// Données décodées du JWT token
export interface DecodedToken {
  sub: string;
  roles: string[];
  exp: number;
}