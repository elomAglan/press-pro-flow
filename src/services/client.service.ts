import { apiFetch } from "./api";

// Lister tous les clients du pressing
export async function getAllClients() {
  return apiFetch("/api/client", {
    method: "GET",
  });
}

// Créer un client lié au pressing de l'utilisateur connecté
export async function createClient(clientData: any) {
  return apiFetch("/api/client", {
    method: "POST",
    body: JSON.stringify(clientData),
  });
}

// Récupérer un client par ID
export async function getClientById(id: number) {
  return apiFetch(`/api/client/${id}`, { method: "GET" });
}

// Mettre à jour un client
export async function updateClient(id: number, clientData: any) {
  return apiFetch(`/api/client/${id}`, {
    method: "PUT",
    body: JSON.stringify(clientData),
  });
}

// Supprimer un client
export async function deleteClient(id: number) {
  return apiFetch(`/api/client/${id}`, { method: "DELETE" });
}
