// src/services/mockData.ts

// ================= TYPES =================
export interface Client {
  id: number;
  nom: string;
  telephone: string;
}

export interface Article {
  type: string;
  service: string;
  quantite: number;
  montantNet: number; // Ajout pour calcul du total
}

export interface Commande {
  id: number;
  numero: string;
  clientId: number;
  clientNom: string;
  dateCreation: string; // ISO
  montantPaye: number;
  total: number;
  statutPaiement: "non_paye" | "partiel" | "paye";
  express: boolean;
  dateLivraison: string;
  statut: "En cours" | "Livrée" | "Annulée";
  articles: Article[];
}

export interface Charge {
  id: number;
  description: string;
  montant: number;
  dateCharge: string; // ISO
}

// ================= MOCK CLIENTS =================
export const mockClients: Client[] = [
  { id: 1, nom: "Alice", telephone: "12345678" },
  { id: 2, nom: "Bob", telephone: "87654321" },
  { id: 3, nom: "Charlie", telephone: "11223344" },
];

// ================= MOCK COMMANDES =================
export const mockCommandes: Commande[] = [
  {
    id: 1,
    numero: "CMD001",
    clientId: 1,
    clientNom: "Alice",
    dateCreation: "2025-11-12",
    montantPaye: 20000,
    total: 50000,
    statutPaiement: "partiel",
    express: false,
    dateLivraison: "2025-11-14",
    statut: "En cours",
    articles: [
      { type: "Chemise", service: "Repassage", quantite: 3, montantNet: 15000 },
      { type: "Pantalon", service: "Nettoyage", quantite: 2, montantNet: 35000 },
    ],
  },
  {
    id: 2,
    numero: "CMD002",
    clientId: 2,
    clientNom: "Bob",
    dateCreation: "2025-11-13",
    montantPaye: 50000,
    total: 50000,
    statutPaiement: "paye",
    express: true,
    dateLivraison: "2025-11-14",
    statut: "Livrée",
    articles: [
      { type: "Robe", service: "Nettoyage", quantite: 1, montantNet: 50000 },
    ],
  },
  {
    id: 3,
    numero: "CMD003",
    clientId: 1,
    clientNom: "Alice",
    dateCreation: "2025-11-14",
    montantPaye: 0,
    total: 30000,
    statutPaiement: "non_paye",
    express: false,
    dateLivraison: "2025-11-16",
    statut: "En cours",
    articles: [
      { type: "Chemise", service: "Nettoyage", quantite: 2, montantNet: 30000 },
    ],
  },
];

// ================= MOCK CHARGES =================
export const mockCharges: Charge[] = [
  { id: 1, description: "Loyer pressing", montant: 50000, dateCharge: "2025-11-01" },
  { id: 2, description: "Électricité", montant: 12000, dateCharge: "2025-11-05" },
  { id: 3, description: "Produits lessive", montant: 8000, dateCharge: "2025-11-07" },
  { id: 4, description: "Salaires", montant: 30000, dateCharge: "2025-11-10" },
  { id: 5, description: "Entretien machines", montant: 7000, dateCharge: "2025-11-12" },
];

// ================= UTILITAIRES =================
export function getClientById(id: number) {
  return mockClients.find(c => c.id === id);
}

// Total des charges (optionnel par date)
export function getTotalCharges(date?: string) {
  if (date) {
    return mockCharges
      .filter(c => c.dateCharge === date)
      .reduce((sum, c) => sum + c.montant, 0);
  }
  return mockCharges.reduce((sum, c) => sum + c.montant, 0);
}

// Résultat net (optionnel par date)
export function getResultatNet(date?: string) {
  const totalRevenus = date
    ? mockCommandes
        .filter(c => c.dateCreation === date)
        .reduce((sum, c) => sum + c.montantPaye, 0)
    : mockCommandes.reduce((sum, c) => sum + c.montantPaye, 0);
  const totalCharges = getTotalCharges(date);
  return totalRevenus - totalCharges;
}
