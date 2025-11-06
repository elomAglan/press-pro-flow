// src/services/pressingService.ts
import { apiFetch } from "./api";

export interface Pressing {
  id?: number;
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
  logo?: string;
}

// Helper pour inclure le token
function authOptions(options: RequestInit = {}): RequestInit {
  const token = localStorage.getItem("authToken");
  return {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  };
}

// 🔹 Lister tous les pressings
export async function getAllPressings(): Promise<Pressing[]> {
  return apiFetch("/api/pressing", authOptions({ method: "GET" }));
}

// 🔹 Obtenir un pressing par ID
export async function getPressingById(id: number): Promise<Pressing> {
  return apiFetch(`/api/pressing/${id}`, authOptions({ method: "GET" }));
}

// 🔹 Créer un nouveau pressing
export async function createPressing(pressing: Pressing): Promise<Pressing> {
  return apiFetch("/api/pressing", authOptions({
    method: "POST",
    body: JSON.stringify(pressing),
  }));
}

// 🔹 Mettre à jour un pressing existant
export async function updatePressing(id: number, pressing: Pressing): Promise<Pressing> {
  return apiFetch(`/api/pressing/${id}`, authOptions({
    method: "PUT",
    body: JSON.stringify(pressing),
  }));
}

// 🔹 Supprimer un pressing
export async function deletePressing(id: number): Promise<void> {
  return apiFetch(`/api/pressing/${id}`, authOptions({ method: "DELETE" }));
}
