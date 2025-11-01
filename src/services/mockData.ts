export interface Client {
  id: string;
  nom: string;
  telephone: string;
  email: string;
  adresse: string;
  createdAt: Date;
}

export interface Article {
  id: string;
  type: string;
  service: string;
  quantite: number;
  prixUnitaire: number;
}

export interface Commande {
  id: string;
  numero: string;
  clientId: string;
  articles: Article[];
  total: number;
  statut: "en_attente" | "en_cours" | "pret" | "livre";
  statutPaiement: "non_paye" | "partiel" | "paye";
  montantPaye: number;
  modePaiement?: "especes" | "mobile_money" | "carte";
  dateCreation: Date;
  dateLivraison?: Date;
}

export interface Tarif {
  id: string;
  typeArticle: string;
  service: string;
  prix: number;
}

// Mock Data
export const mockClients: Client[] = [
  {
    id: "1",
    nom: "Kouassi Jean",
    telephone: "+225 07 12 34 56 78",
    email: "kouassi.jean@email.com",
    adresse: "Cocody, Abidjan",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    nom: "Traoré Marie",
    telephone: "+225 05 98 76 54 32",
    email: "traore.marie@email.com",
    adresse: "Plateau, Abidjan",
    createdAt: new Date("2024-02-20"),
  },
  {
    id: "3",
    nom: "Diallo Ibrahim",
    telephone: "+225 01 45 67 89 01",
    email: "diallo.ibrahim@email.com",
    adresse: "Marcory, Abidjan",
    createdAt: new Date("2024-03-10"),
  },
];

export const mockTarifs: Tarif[] = [
  { id: "1", typeArticle: "Chemise", service: "Nettoyage", prix: 1500 },
  { id: "2", typeArticle: "Chemise", service: "Repassage", prix: 500 },
  { id: "3", typeArticle: "Pantalon", service: "Nettoyage", prix: 2000 },
  { id: "4", typeArticle: "Pantalon", service: "Repassage", prix: 750 },
  { id: "5", typeArticle: "Robe", service: "Nettoyage", prix: 3000 },
  { id: "6", typeArticle: "Robe", service: "Repassage", prix: 1000 },
  { id: "7", typeArticle: "Costume", service: "Nettoyage", prix: 5000 },
  { id: "8", typeArticle: "Costume", service: "Repassage", prix: 2000 },
];

export const mockCommandes: Commande[] = [
  {
    id: "1",
    numero: "CMD-2024-001",
    clientId: "1",
    articles: [
      { id: "a1", type: "Chemise", service: "Nettoyage", quantite: 3, prixUnitaire: 1500 },
      { id: "a2", type: "Pantalon", service: "Nettoyage", quantite: 2, prixUnitaire: 2000 },
    ],
    total: 8500,
    statut: "pret",
    statutPaiement: "paye",
    montantPaye: 8500,
    modePaiement: "mobile_money",
    dateCreation: new Date("2024-10-28"),
    dateLivraison: new Date("2024-10-30"),
  },
  {
    id: "2",
    numero: "CMD-2024-002",
    clientId: "2",
    articles: [
      { id: "a3", type: "Robe", service: "Nettoyage", quantite: 2, prixUnitaire: 3000 },
    ],
    total: 6000,
    statut: "en_cours",
    statutPaiement: "non_paye",
    montantPaye: 0,
    dateCreation: new Date("2024-10-29"),
  },
  {
    id: "3",
    numero: "CMD-2024-003",
    clientId: "3",
    articles: [
      { id: "a4", type: "Costume", service: "Nettoyage", quantite: 1, prixUnitaire: 5000 },
      { id: "a5", type: "Chemise", service: "Repassage", quantite: 5, prixUnitaire: 500 },
    ],
    total: 7500,
    statut: "en_attente",
    statutPaiement: "partiel",
    montantPaye: 3000,
    modePaiement: "especes",
    dateCreation: new Date("2024-10-30"),
  },
];

export const getClientById = (id: string): Client | undefined => {
  return mockClients.find(client => client.id === id);
};

export const generateCommandeNumber = (): string => {
  const year = new Date().getFullYear();
  const count = mockCommandes.length + 1;
  return `CMD-${year}-${String(count).padStart(3, "0")}`;
};
