import { apiFetch } from "./api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ========================= PARAMETRES (CACHE) =========================

let parametresCache: any[] | null = null;

async function getParametres() {
  if (!parametresCache) {
    parametresCache = await apiFetch("/api/parametre", { method: "GET" });
  }
  return parametresCache;
}

// ========================= MAPPING ARTICLES / SERVICES =========================

function mapCommande(c: any, parametres: any[]) {
  const articles = c.parametreIds?.map((id: number, idx: number) => {
    const param = parametres.find((p) => p.id === id);

    return {
      id,

      // 🔹 Détection automatique du nom d’article selon le backend
      article:
        param?.article ??
        param?.nom ??
        param?.designation ??
        param?.label ??
        param?.type ??
        "Inconnu",

      // 🔹 Détection automatique du service
      service:
        param?.service ??
        param?.categorie ??
        param?.type ??
        param?.nom ??
        "Inconnu",

      qte: c.qtes?.[idx] ?? 0,
      montantBrut: c.montantsBruts?.[idx] ?? 0,
      montantNet: c.montantsNets?.[idx] ?? 0,
    };
  }) ?? [];

  return {
    ...c,
    articles,
    articleListe: articles.map((a) => a.article).join(", "),
    serviceListe: articles.map((a) => a.service).join(", "),
    montantNetTotal: articles.reduce((sum, a) => sum + a.montantNet, 0),
  };
}

// ========================= GET ALL COMMANDES =========================

export async function getAllCommandes() {
  const commandes = await apiFetch("/api/commande", { method: "GET" });
  const parametres = await getParametres();

  return commandes.map((c: any) => mapCommande(c, parametres));
}

// ========================= GET COMMANDE BY ID =========================

export async function getCommandeById(id: number) {
  const commande = await apiFetch(`/api/commande/${id}`, { method: "GET" });
  const parametres = await getParametres();

  return mapCommande(commande, parametres);
}

// ========================= CREATE COMMANDE + PDF =========================

export async function createCommandeAvecPdf() {
  const token = localStorage.getItem("authToken");

  const bodyData = JSON.stringify({
    clientId: 1,
    parametreIds: [60, 63, 21],
    qtes: [2, 3, 1],
    remiseGlobale: 500,
    montantPaye: 0,
    dateReception: "2025-11-25",
    dateLivraison: "2025-11-28",
  });

  const response = await fetch(`${API_BASE_URL}/api/commande/pdf`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: bodyData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Erreur serveur: ${text || response.statusText}`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  window.open(url, "_blank");
  window.URL.revokeObjectURL(url);
}

// ========================= UPDATE STATUT =========================

export async function updateStatutCommandeAvecMontant(
  id: number,
  payload: { statut: string; montantActuel: number }
) {
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

// ========================= DELETE =========================

export async function deleteCommande(id: number) {
  return apiFetch(`/api/commande/${id}`, { method: "DELETE" });
}

// ========================= STATS =========================

export async function getCommandesTotalParJour() {
  return apiFetch("/api/commande/total", { method: "GET" });
}

export async function getCommandesLivreeParJour() {
  return apiFetch("/api/commande/livree", { method: "GET" });
}

export async function getCommandesEnCoursParJour() {
  return apiFetch("/api/commande/cours", { method: "GET" });
}

// ========================= CHIFFRE D'AFFAIRES =========================

export async function getCAJournalier() {
  return apiFetch("/api/commande/jour", { method: "GET" });
}

export async function getCAHebdo() {
  return apiFetch("/api/commande/hebdo", { method: "GET" });
}

export async function getCAMensuel() {
  return apiFetch("/api/commande/mensuel", { method: "GET" });
}

export async function getCAAnnuel() {
  return apiFetch("/api/commande/annuel", { method: "GET" });
}

export async function getCAImpayes() {
  return apiFetch("/api/commande/impayes", { method: "GET" });
}
