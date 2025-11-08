// src/services/pressing.service.ts
import { apiFetch } from "./api";

export interface Pressing {
  id?: number;
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
  logo?: string;        // URL renvoyée par l'API
  logoBase64?: string;  // côté client uniquement
}

// ✅ On N'UTILISE PAS JSON → multipart/form-data
function pressingToFormData(p: Pressing): FormData {
  const fd = new FormData();
  fd.append("nom", p.nom);
  fd.append("email", p.email);
  fd.append("telephone", p.telephone);
  fd.append("adresse", p.adresse);

  // si logo présent en base64 → on convertit en fichier
  if (p.logoBase64) {
    const arr = p.logoBase64.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8 = new Uint8Array(n);
    while (n--) u8[n] = bstr.charCodeAt(n);

    const file = new File([u8], "logo.png", { type: mime });
    fd.append("logo", file);
  }

  return fd;
}

export async function getAllPressings(): Promise<Pressing[]> {
  return apiFetch("/api/pressing", {
    method: "GET",
  });
}

export async function createPressing(p: Pressing): Promise<Pressing> {
  return apiFetch("/api/pressing", {
    method: "POST",
    body: pressingToFormData(p),
  });
}

export async function updatePressing(id: number, p: Pressing): Promise<Pressing> {
  return apiFetch(`/api/pressing/${id}`, {
    method: "PUT",
    body: pressingToFormData(p),
  });
}

export async function deletePressing(id: number): Promise<void> {
  return apiFetch(`/api/pressing/${id}`, {
    method: "DELETE",
  });
}
