import { apiFetch } from "./api";

// Création d'un utilisateur
export async function signup(email: string, password: string, role: string) {
  return apiFetch("/api/auth/save", {
    method: "POST",
    body: JSON.stringify({ email, password, role }),
  });
}

// Connexion
export async function login(email: string, password: string) {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// Récupérer tous les comptes
export async function getComptes() {
  return apiFetch("/api/auth/comptes", {
    method: "GET",
  });
}

// Modifier un utilisateur existant
export async function updateCompte(
  id: number,
  email: string,
  password: string,
  role: string
) {
  return apiFetch(`/api/auth/${id}`, {
    method: "PUT",
    body: JSON.stringify({ email, password, role }),
  });
}

// Supprimer un utilisateur
export async function deleteCompte(id: number) {
  return apiFetch(`/api/auth/${id}`, {
    method: "DELETE",
  });
}

// Création d'un compte public (API ouverte)
export async function publicSignup(email: string, password: string, role: string) {
  return apiFetch("/api/auth/public/save", {
    method: "POST",
    body: JSON.stringify({ email, password, role }),
  });
}

// Récupérer les rôles
export async function getRoles() {
  return apiFetch("/api/auth/role", {
    method: "GET",
  });
}
