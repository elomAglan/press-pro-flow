// tarifService.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("authToken"); // récupère le token

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    },
    ...options,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {}

  if (!response.ok) {
    throw new Error(data?.message || "Erreur serveur");
  }

  return data;
}

// -------------------------
// Services pour les tarifs
// -------------------------

const API_BASE = "/api/parametre";

/** Récupérer un tarif par ID */
export async function getTarifById(id: number) {
  return apiFetch(`${API_BASE}/${id}`);
}

/** Mettre à jour un tarif existant */
export async function updateTarif(id: number, data: any) {
  return apiFetch(`${API_BASE}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/** Supprimer un tarif par ID */
export async function deleteTarif(id: number) {
  return apiFetch(`${API_BASE}/${id}`, {
    method: "DELETE",
  });
}

/** Lister tous les tarifs */
export async function getAllTarifs() {
  return apiFetch(`${API_BASE}`);
}

/** Créer un nouveau tarif */
export async function createTarif(data: any) {
  return apiFetch(`${API_BASE}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
