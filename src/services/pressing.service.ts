import { apiFetch } from "./api";

// Interface Pressing
export interface Pressing {
  id?: number;
  nom: string;
  email?: string; // email de l’admin, optionnel côté frontend
  telephone: string;
  adresse: string;
  logo?: string; // URL du logo
}

// ✅ Récupérer le pressing de l’utilisateur connecté (admin ou simple user)
export async function getMyPressing(): Promise<Pressing> {
  return apiFetch("/api/pressing/me", { method: "GET" });
}

// ✅ Création d'un pressing (admin uniquement)
export async function createPressing(p: Pressing): Promise<Pressing> {
  return apiFetch("/api/pressing/create", {
    method: "POST",
    body: JSON.stringify(p),
  });
}

// ✅ Mise à jour d'un pressing existant (admin uniquement)
export async function updatePressing(id: number, p: Pressing): Promise<Pressing> {
  return apiFetch(`/api/pressing/update/${id}`, {
    method: "PUT",
    body: JSON.stringify(p),
  });
}

// ✅ Suppression d'un pressing (admin uniquement)
export async function deletePressing(id: number): Promise<void> {
  return apiFetch(`/api/pressing/delete/${id}`, { method: "DELETE" });
}
