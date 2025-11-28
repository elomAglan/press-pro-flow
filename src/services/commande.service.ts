import { apiFetch } from "./api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ========================= PARAMETRES (CACHE) =========================
let parametresCache: any[] | null = null;

export async function getParametres() {
  if (!parametresCache) {
    parametresCache = await apiFetch("/api/parametre", { method: "GET" });
  }
  return parametresCache;
}

// ========================= MAPPING ARTICLES / SERVICES / KILO =========================
function mapCommande(c: any, parametres: any[]) {
  const articles = c.parametreIds?.map((id: number, idx: number) => {
    const param = parametres.find((p) => p.id === id);
    return {
      id,
      article:
        param?.article ?? param?.nom ?? param?.designation ?? param?.label ?? param?.type ?? "Inconnu",
      service:
        param?.service ?? param?.categorie ?? param?.type ?? param?.nom ?? "Inconnu",
      qte: c.quantites?.[idx] ?? c.qtes?.[idx] ?? 0,
      montantBrut: c.montantsBruts?.[idx] ?? 0,
      montantNet: c.montantsNets?.[idx] ?? 0,
      kilo: c.poids?.[idx] ?? 0,        // ✅ Ajouter poids par article
      tarifKiloId: c.tarifKiloIds?.[idx] ?? null // ✅ Ajouter l’ID du tarif kilo
    };
  }) ?? [];

  return {
    ...c,
    articles,
    articleListe: articles.map((a) => a.article).join(", "),
    serviceListe: articles.map((a) => a.service).join(", "),
    kiloTotal: articles.reduce((sum, a) => sum + a.kilo, 0), // ✅ Total kilos
    montantNetTotal: articles.reduce((sum, a) => sum + a.montantNet, 0),
  };
}

// ========================= GET COMMANDES (JSON) =========================
export async function getAllCommandes() {
  const commandes = await apiFetch("/api/commande", { method: "GET" });
  const parametres = await getParametres();
  return commandes.map((c: any) => mapCommande(c, parametres));
}

export async function getCommandeById(id: number) {
  const commande = await apiFetch(`/api/commande/${id}`, { method: "GET" });
  const parametres = await getParametres();
  return mapCommande(commande, parametres);
}

// ========================= CREATE COMMANDE =========================
export async function createCommande(payload: any) {
  const token = localStorage.getItem("authToken");

  const res = await fetch(`${API_BASE_URL}/api/commande`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Erreur lors de la création de la commande");
  }

  return res.json();
}

// ========================= CREATE COMMANDE + PDF =========================
export async function createCommandeAvecPdf(payload: any) {
  const token = localStorage.getItem("authToken");

  const response = await fetch(`${API_BASE_URL}/api/commande/pdf`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Erreur lors de la génération du PDF");
  }

  const blob = await response.blob();
  return blob;
}

// ========================= DOWNLOAD PDF EXISTANT =========================
export async function getCommandePdf(id: number) {
  const token = localStorage.getItem("authToken");
  const res = await fetch(`${API_BASE_URL}/api/commande/pdf/${id}`, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) throw new Error("Erreur téléchargement PDF");
  return res.blob();
}

// ========================= UPDATE STATUT =========================
export async function updateStatutCommandeAvecMontant(
  id: number,
  payload: { montantActuel: number }
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

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Erreur serveur: ${text || res.statusText}`);
  }

  const pdfBlob = await res.blob();
  const url = window.URL.createObjectURL(pdfBlob);
  window.open(url, "_blank");
  setTimeout(() => window.URL.revokeObjectURL(url), 1000);

  return true;
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
