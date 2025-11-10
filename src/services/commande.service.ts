import { apiFetch } from "./api";

// 🔹 Lister toutes les commandes
export async function getAllCommandes() {
  return apiFetch("/api/commande", { method: "GET" });
}

// 🔹 Créer une nouvelle commande
export async function createCommande(commandeData: any) {
  return apiFetch("/api/commande", {
    method: "POST",
    body: JSON.stringify(commandeData),
  });
}

// 🔹 Récupérer une commande par ID
export async function getCommandeById(id: number) {
  return apiFetch(`/api/commande/${id}`, { method: "GET" });
}

// 🔹 Mettre à jour une commande
export async function updateCommande(id: number, commandeData: any) {
  return apiFetch(`/api/commande/${id}`, {
    method: "PUT",
    body: JSON.stringify(commandeData),
  });
}

// 🔹 Supprimer une commande
export async function deleteCommande(id: number) {
  return apiFetch(`/api/commande/${id}`, { method: "DELETE" });
}
