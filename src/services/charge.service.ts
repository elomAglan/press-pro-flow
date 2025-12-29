import { apiFetch } from "./api";

export interface Charge {
  id?: number;
  description: string;
  montant: number;
  dateCharge?: string | null; // optionnel selon backend
}

/**
 * 🔹 Récupérer toutes les charges
 */
export async function getAllCharges(): Promise<Charge[]> {
  return await apiFetch("/api/charge");
}

/**
 * 🔹 Récupérer une charge par ID
 */
export async function getChargeById(id: number): Promise<Charge> {
  return await apiFetch(`/api/charge/${id}`);
}

/**
 * 🔹 Créer une nouvelle charge
 */
export async function createCharge(
  charge: { description: string; montant: number }
): Promise<Charge> {
  return await apiFetch("/api/charge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(charge),
  });
}

/**
 * 🔹 Mettre à jour une charge
 * ⚠️ change PUT → PATCH si ton backend attend PATCH
 */
export async function updateCharge(
  id: number,
  charge: { description: string; montant: number }
): Promise<Charge> {
  return await apiFetch(`/api/charge/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(charge),
  });
}

/**
 * 🔹 Supprimer une charge
 */
export async function deleteCharge(id: number): Promise<void> {
  await apiFetch(`/api/charge/${id}`, {
    method: "DELETE",
  });
}
