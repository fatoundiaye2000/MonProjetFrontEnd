// src/types/auth.types.ts

export interface RegisterRequest {
  nom: string;
  prenom?: string;
  email: string;
  motDePasse: string;
  telephone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  roles: string[];
  username?: string;
  email?: string;
}

export interface User {
  id?: number;
  username: string;
  email: string;
  roles: string[];
  enabled?: boolean;
}

export interface DecodedToken {
  sub: string;
  roles: string[];
  exp: number;
  iat: number;
}