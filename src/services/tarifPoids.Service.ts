import { apiFetch } from "./api";

const API_BASE = "/api/kilo";

/** GET - Lister tous les tarifs au kilo */
export async function getAllTarifPoids() {
return apiFetch(API_BASE);
}

/** GET - Récupérer un tarif au kilo par ID */
export async function getTarifPoidsById(id: number) {
return apiFetch(`${API_BASE}/${id}`);
}

/** POST - Créer un nouveau tarif au kilo */
export async function createTarifPoids(data: any) {
return apiFetch(API_BASE, {
method: "POST",
body: JSON.stringify(data),
});
}

/** PUT - Mettre à jour un tarif au kilo */
export async function updateTarifPoids(id: number, data: any) {
return apiFetch(`${API_BASE}/${id}`, {
method: "PUT",
body: JSON.stringify(data),
});
}

/** DELETE - Supprimer un tarif au kilo */
export async function deleteTarifPoids(id: number) {
return apiFetch(`${API_BASE}/${id}`, {
method: "DELETE",
});
}
