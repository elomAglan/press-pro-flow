import { apiFetch } from "./api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 🔹 Lister toutes les commandes
export async function getAllCommandes() {
  return apiFetch("/api/commande", { method: "GET" });
}


// 🔹 Créer une commande et télécharger le PDF directement
export async function createCommandeAvecPdf(commandeData: any) {
  const token = localStorage.getItem("authToken");

  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/commande/pdf`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(commandeData),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Fetch PDF erreur", response.status, text);
    throw new Error(`Erreur serveur: ${text || response.statusText}`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "commande.pdf";
  a.click();
  window.URL.revokeObjectURL(url);

  return true;
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




// ==================== 📊 STATISTIQUES ====================

// 🔹 Nombre total de commandes par jour
export async function getCommandesTotalParJour() {
  return apiFetch("/api/commande/total", { method: "GET" });
}

// 🔹 Nombre de commandes livrées par jour
export async function getCommandesLivreeParJour() {
  return apiFetch("/api/commande/livree", { method: "GET" });
}

// 🔹 Nombre de commandes en cours par jour
export async function getCommandesEnCoursParJour() {
  return apiFetch("/api/commande/cours", { method: "GET" });
}
