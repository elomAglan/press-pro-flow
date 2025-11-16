import { apiFetch } from "./api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 🔹 Lister toutes les commandes
export async function getAllCommandes() {
  return apiFetch("/api/commande", { method: "GET" });
}

// 🔹 Créer une commande avec PDF
export async function createCommandeAvecPdf(commandeData: any) {
  const token = localStorage.getItem("authToken");

  const response = await fetch(`${API_BASE_URL}/api/commande/pdf`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(commandeData),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Erreur PDF:", response.status, text);
    throw new Error(`Erreur serveur: ${text || response.statusText}`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  window.open(url, "_blank");
  window.URL.revokeObjectURL(url);
}

// 🔹 Récupérer une commande par ID
export async function getCommandeById(id: number) {
  return apiFetch(`/api/commande/${id}`, { method: "GET" });
}

export async function updateStatutCommandeAvecMontant(id: number, payload: { statut: string; montantActuel: number }) {
  const token = localStorage.getItem("authToken");

  const res = await fetch(`${API_BASE_URL}/api/commande/${id}/statut`, {
    method: "POST",  
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Erreur lors de la mise à jour du statut");
  return res.json();
}


// 🔹 Supprimer une commande
export async function deleteCommande(id: number) {
  return apiFetch(`/api/commande/${id}`, { method: "DELETE" });
}

// ==================== STATISTIQUES ====================

// 🔹 Nombre total de commandes du jour
export async function getCommandesTotalParJour() {
  return apiFetch("/api/commande/total", { method: "GET" });
}

// 🔹 Nombre de commandes LIVRÉES du jour
export async function getCommandesLivreeParJour() {
  return apiFetch("/api/commande/livree", { method: "GET" });
}

// 🔹 Nombre de commandes EN COURS du jour
export async function getCommandesEnCoursParJour() {
  return apiFetch("/api/commande/cours", { method: "GET" });
}

// ==================== CHIFFRE D’AFFAIRES ====================

// 🔹 CA Journalier
export async function getCAJournalier() {
  return apiFetch("/api/commande/jour", { method: "GET" });
}

// 🔹 CA Hebdomadaire
export async function getCAHebdo() {
  return apiFetch("/api/commande/hebdo", { method: "GET" });
}

// 🔹 CA Mensuel
export async function getCAMensuel() {
  return apiFetch("/api/commande/mensuel", { method: "GET" });
}

// 🔹 CA Annuel
export async function getCAAnnuel() {
  return apiFetch("/api/commande/annuel", { method: "GET" });
}

// 🔹 Total des impayés
export async function getCAImpayes() {
  return apiFetch("/api/commande/impayes", { method: "GET" });
}

