import { apiFetch } from "./api";

// Interface Pressing
export interface Pressing {
  id?: number;
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
  logo?: string; // base64 ou URL
}

// ✅ Récupération d'un pressing par son ID
export async function getPressingById(id: number): Promise<Pressing> {
  return apiFetch(`/api/pressing/${id}`, { method: "GET" });
}

// ✅ Création d'un pressing
export async function createPressing(p: Pressing): Promise<Pressing> {
  return apiFetch("/api/pressing", {
    method: "POST",
    body: JSON.stringify(p),
  });
}

// ✅ Mise à jour d'un pressing existant
export async function updatePressing(id: number, p: Pressing): Promise<Pressing> {
  return apiFetch(`/api/pressing/${id}`, {
    method: "PUT",
    body: JSON.stringify(p),
  });
}

// ✅ Suppression d'un pressing
export async function deletePressing(id: number): Promise<void> {
  return apiFetch(`/api/pressing/${id}`, { method: "DELETE" });
}
