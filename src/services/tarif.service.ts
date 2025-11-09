// tarifService.ts

import { apiFetch } from "./api";

const API_BASE = "/api/parametre";

/** GET - Récupérer un tarif par ID */
export async function getTarifById(id: number) {
  return apiFetch(`${API_BASE}/${id}`);
}

/** PUT - Mettre à jour un tarif */
export async function updateTarif(id: number, data: any) {
  return apiFetch(`${API_BASE}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/** DELETE - Supprimer un tarif par ID */
export async function deleteTarif(id: number) {
  return apiFetch(`${API_BASE}/${id}`, {
    method: "DELETE",
  });
}

/** GET - Lister tous les tarifs du pressing connecté */
export async function getAllTarifs() {
  return apiFetch(API_BASE);
}

/** POST - Créer un nouveau tarif */
export async function createTarif(data: any) {
  return apiFetch(API_BASE, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
