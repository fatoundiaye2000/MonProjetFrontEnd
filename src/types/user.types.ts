// Interface Role (correspond à Role.java)
export interface Role {
  id: number;
  nom: string;
  role?: string;  // ✅ AJOUT: Pour la nouvelle structure
  type?: string;  // ✅ AJOUT: Pour la nouvelle structure
}

// Interface Utilisateur (correspond à User.java Spring - CORRIGÉE)
export interface Utilisateur {
  id: number;           // ✅ GARDER: ancienne structure
  idUser?: number;      // ✅ AJOUT: nouvelle structure Spring
  nom: string;
  prenom: string;
  email: string;
  password?: string;
  enabled?: boolean;
  role: Role;           // ✅ GARDER: ancienne structure (objet unique)
  roles?: Role[];       // ✅ AJOUT: nouvelle structure (tableau)
}

// DTO pour créer un utilisateur
export interface CreateUtilisateurDTO {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role: {
    id: number;
  };
}

// DTO pour mettre à jour un utilisateur
export interface UpdateUtilisateurDTO {
  nom?: string;
  prenom?: string;
  email?: string;
  password?: string;
  role?: {
    id: number;
  };
}