// ====================================================================
// Fichier d'utilitaires (Mock Data & Types)
// Contient les définitions de types et des données simulées (Mocks)
// pour les Commandes, Clients et Tarifs.
// Ce fichier sera remplacé par la logique Firestore (Firebase) plus tard.
// ====================================================================

// --- 1. Définitions des Types ---

/** Type pour un article d'une commande */
export interface Article {
    id: string;
    type: string; // Ex: 'Impression', 'Design'
    service: string; // Ex: 'Affiche A3', 'Logo'
    quantite: number;
    prixUnitaire: number;
}

/** Type de statut pour la commande */
export type StatutCommande = "en_attente" | "en_cours" | "termine" | "annule";

/** Type de statut pour le paiement */
export type StatutPaiement = "non_paye" | "partiel" | "paye";

/** Type pour l'objet Commande complet */
export interface Commande {
    id: string;
    numero: string;
    clientId: string;
    articles: Article[];
    total: number;
    statut: StatutCommande;
    statutPaiement: StatutPaiement;
    montantPaye: number;
    dateCreation: Date;
}

/** Type pour l'objet Client */
export interface Client {
    id: string;
    nom: string;
    telephone: string;
    email: string;
}

/** Type pour les Tarifs */
export interface Tarif {
    id: string;
    typeArticle: string;
    service: string;
    prix: number;
}

// --- 2. Données Simulées (Mock Data) ---

// Clients simulés
export const allClients: Client[] = [
    { id: "c1", nom: "Dupont Jean", telephone: "77 123 45 67", email: "jean.dupont@exemple.com" },
    { id: "c2", nom: "Diallo Mariam", telephone: "78 987 65 43", email: "m.diallo@societe.com" },
    { id: "c3", nom: "Kouame Patrice", telephone: "70 555 11 22", email: "patrice.kouame@mail.net" },
];

// Tarifs simulés
export const allTarifs: Tarif[] = [
    { id: "t1", typeArticle: "Impression", service: "Affiche A3", prix: 500 },
    { id: "t2", typeArticle: "Impression", service: "Carte de Visite (x100)", prix: 15000 },
    { id: "t3", typeArticle: "Impression", service: "T-shirt Personnalisé", prix: 8000 },
    { id: "t4", typeArticle: "Design", service: "Création Logo", prix: 30000 },
    { id: "t5", typeArticle: "Design", service: "Bannière Web", prix: 10000 },
];


// Commandes simulées (pour la démo)
let commandesData: Commande[] = [
    // Exemple de commande existante pour la démo
    {
        id: "cmd001",
        numero: "P-2023-001",
        clientId: "c1",
        articles: [
            { id: "a1", type: "Impression", service: "Affiche A3", quantite: 50, prixUnitaire: 500 },
            { id: "a2", type: "Design", service: "Création Logo", quantite: 1, prixUnitaire: 30000 },
        ],
        total: 55000,
        statut: "en_cours",
        statutPaiement: "partiel",
        montantPaye: 30000,
        dateCreation: new Date("2023-11-01"),
    }
];

// --- 3. Fonctions Utilitaires de Commande ---

/**
 * Génère un numéro de commande unique (simulé).
 * @returns Le numéro de commande.
 */
export const generateCommandeNumber = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    // Simule un incrément basé sur le nombre de commandes
    const nextIndex = commandesData.length + 1; 
    return `P-${year}-${String(nextIndex).padStart(3, '0')}`;
};

/**
 * Simule l'ajout d'une nouvelle commande (push dans le tableau).
 * @param newCommande La nouvelle commande (sans ID).
 * @returns La commande complète avec un ID généré.
 */
export const addCommande = (newCommande: Omit<Commande, 'id'>): Commande => {
    const id = `cmd${String(commandesData.length + 1).padStart(3, '0')}`;
    const savedCommande: Commande = { ...newCommande, id };
    commandesData.push(savedCommande);
    console.log("Nouvelle commande ajoutée (Mock):", savedCommande);
    return savedCommande;
};

/**
 * Récupère toutes les commandes simulées.
 */
export const getCommandes = (): Commande[] => {
    // Retourne une copie du tableau pour éviter les modifications directes non intentionnelles
    return [...commandesData]; 
};

/**
 * Récupère un client par son ID.
 */
export const getClientById = (clientId: string): Client | undefined => {
    return allClients.find(c => c.id === clientId);
};

// --- 4. Fonctions de Rendu UI (Badges) ---

// Nouveaux types de retour pour éviter les erreurs de syntaxe React/JSX dans les fichiers .ts
interface BadgeData {
    text: string;
    className: string;
}

/** * Retourne les données (texte et classes CSS) pour le statut de la commande.
 */
export const getStatutBadge = (statut: StatutCommande): BadgeData => {
    let className = "";
    let text = "";
    switch (statut) {
        case "en_attente":
            className = "bg-yellow-100 text-yellow-800 border-yellow-400";
            text = "En Attente";
            break;
        case "en_cours":
            className = "bg-blue-100 text-blue-800 border-blue-400";
            text = "En Cours";
            break;
        case "termine":
            className = "bg-green-100 text-green-800 border-green-400";
            text = "Terminée";
            break;
        case "annule":
            className = "bg-red-100 text-red-800 border-red-400";
            text = "Annulée";
            break;
    }
    // Retourne l'objet simple pour un rendu dans CommandeDetails.tsx
    return { text, className: `inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase ${className}` };
};

/** * Retourne les données (texte et classes CSS) pour le statut de paiement.
 */
export const getPaiementBadge = (statut: StatutPaiement): BadgeData => {
    let className = "";
    let text = "";
    switch (statut) {
        case "non_paye":
            className = "bg-red-100 text-red-800 border-red-400";
            text = "Non Payé";
            break;
        case "partiel":
            className = "bg-orange-100 text-orange-800 border-orange-400";
            text = "Partiel";
            break;
        case "paye":
            className = "bg-green-100 text-green-800 border-green-400";
            text = "Payé";
            break;
    }
    // Retourne l'objet simple pour un rendu dans CommandeDetails.tsx
    return { text, className: `inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase ${className}` };
};