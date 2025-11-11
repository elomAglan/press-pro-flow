import { apiFetch } from "./api";

export interface Charge {
  id?: number;
  description: string;
  montant: number;
}

/**
 * ✅ Récupérer toutes les charges
 */
export async function getAllCharges() {
  return await apiFetch("/api/charge");
}

/**
 * ✅ Récupérer une charge par ID
 */
export async function getChargeById(id: number) {
  return await apiFetch(`/api/charge/${id}`);
}

/**
 * ✅ Créer une nouvelle charge
 * (Le pressing est automatiquement ajouté côté backend via l'utilisateur connecté)
 */
export async function createCharge(charge: Charge) {
  return await apiFetch("/api/charge", {
    method: "POST",
    body: JSON.stringify(charge),
  });
}

/**
 * ✅ Mettre à jour une charge
 */
export async function updateCharge(id: number, charge: Charge) {
  return await apiFetch(`/api/charge/${id}`, {
    method: "PUT",
    body: JSON.stringify(charge),
  });
}

/**
 * ✅ Supprimer une charge
 */
export async function deleteCharge(id: number) {
  return await apiFetch(`/api/charge/${id}`, {
    method: "DELETE",
  });
}
