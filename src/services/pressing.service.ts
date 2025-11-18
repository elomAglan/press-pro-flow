import { apiFetch } from "./api";

// Interface Pressing
export interface Pressing {
  id?: number;
  nom: string;
  email?: string;       // email de l'admin, optionnel côté frontend
  telephone: string;
  cel?: string;         // Numéro de téléphone secondaire (cellulaire)
  adresse: string;
  logo?: string;        // URL du logo
}

// Récupérer le pressing de l'utilisateur connecté
export async function getMyPressing(): Promise<Pressing | null> {
  try {
    return await apiFetch("/api/pressing/me", { method: "GET" });
  } catch (error: any) {
    if (error.status === 404) {
      // Aucun pressing trouvé
      return null;
    }
    throw error;
  }
}

// Création d'un pressing (admin uniquement)
export async function createPressing(p: Pressing): Promise<Pressing> {
  return apiFetch("/api/pressing/create", {
    method: "POST",
    body: JSON.stringify(p),
  });
}

// Mise à jour d'un pressing
export async function updatePressing(p: Pressing): Promise<Pressing> {
  if (!p.id) throw new Error("L'ID du pressing est requis pour la mise à jour.");
  return apiFetch(`/api/pressing/${p.id}`, {
    method: "PUT",
    body: JSON.stringify(p),
  });
}