import { apiFetch } from "./api";

// 📌 Total des charges
export async function getTotalCharges() {
  return apiFetch("/api/charge/totaux", {
    method: "GET",
  });
}

// 📌 Total des commandes (chiffre d'affaires)
export async function getTotalCommandes() {
  return apiFetch("/api/commande/totaux", {
    method: "GET",
  });
}

// 📌 Total net (CA - Charges)
export async function getNet() {
  return apiFetch("/api/net", {
    method: "GET",
  });
}
