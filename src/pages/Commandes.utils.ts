// ====================================================================
// Fichier d'utilitaires (Mock Data & Types)
// Contient les définitions de types et des données simulées (Mocks)
// pour les Commandes, Clients et Tarifs.
// ====================================================================

// --- 1. Définitions des Types ---

/** Type pour un article d'une commande */
export interface Article {
    id: string;
    type: string; // Ex: 'Impression', 'Design' (Le Linge dans l'exemple Pressing)
    service: string; // Ex: 'Affiche A3', 'Logo' (Le Service de Lavage dans l'exemple Pressing)
    quantite: number;
    prixUnitaire: number;
}

/** Type de statut pour la commande */
export type StatutCommande = "en_attente" | "en_cours" | "termine" | "annule";

/** Type de statut pour le paiement */
export type StatutPaiement = "non_paye" | "partiel" | "paye";

/** Type pour l'objet Commande complet (🚨 MISE À JOUR IMPORTANTE) */
export interface Commande {
    id: string;
    numero: string;
    clientId: string;
    articles: Article[];
    total: number; // Total Brut (avant remise)
    
    // 🚨 NOUVEAUX CHAMPS DE COMMANDE REQUIS
    dateReception: string; // Date de réception du linge (format 'YYYY-MM-DD')
    dateLivraisonPrevue: string; // Date de livraison prévue (format 'YYYY-MM-DD')
    pressingId: string; // ID du Pressing / Atelier sélectionné
    remise: number; // Montant de la remise appliquée (en FCFA ou autre unité monétaire)
    totalNet: number; // Total après remise (Ceci est le champ qui corrige l'erreur TypeScript)
    // ------------------------------------

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

/** Type pour un Pressing/Atelier */
export interface Pressing {
    id: string;
    nom: string;
}


// --- 2. Données Simulées (Mock Data) ---

// Clients simulés
export const allClients: Client[] = [
    { id: "c1", nom: "Dupont Jean", telephone: "77 123 45 67", email: "jean.dupont@exemple.com" },
    { id: "c2", nom: "Diallo Mariam", telephone: "78 987 65 43", email: "m.diallo@societe.com" },
    { id: "c3", nom: "Kouame Patrice", telephone: "70 555 11 22", email: "patrice.kouame@mail.net" },
];

// Tarifs simulés (Linge & Services)
export const allTarifs: Tarif[] = [
    { id: "t1", typeArticle: "Chemise", service: "Lavage + Repassage", prix: 1500 },
    { id: "t2", typeArticle: "Pantalon", service: "Nettoyage à sec", prix: 2000 },
    { id: "t3", typeArticle: "Robe de Soirée", service: "Nettoyage à sec spécial", prix: 10000 },
    { id: "t4", typeArticle: "Couverture", service: "Lavage seul", prix: 4500 },
    { id: "t5", typeArticle: "Costume", service: "Nettoyage à sec", prix: 6000 },
];

// 🚨 Pressings simulés (Nouveau)
export const allPressings: Pressing[] = [
    { id: "p1", nom: "Atelier Principal (A)" },
    { id: "p2", nom: "Atelier Secondaire (B)" },
    { id: "p3", nom: "Partenaire Express" },
];


// Commandes simulées (pour la démo - mise à jour pour inclure les nouveaux champs)
let commandesData: Commande[] = [
    // Exemple de commande existante pour la démo
    {
        id: "cmd001",
        numero: "P-2023-001",
        clientId: "c1",
        articles: [
            { id: "a1", type: "Chemise", service: "Lavage + Repassage", quantite: 5, prixUnitaire: 1500 },
            { id: "a2", type: "Costume", service: "Nettoyage à sec", quantite: 1, prixUnitaire: 6000 },
        ],
        total: 13500, // 5*1500 + 6000 = 13500
        statut: "en_cours",
        statutPaiement: "partiel",
        montantPaye: 10000,
        dateCreation: new Date("2023-11-01"),
        // Nouveaux champs pour la cohérence
        dateReception: "2023-11-01",
        dateLivraisonPrevue: "2023-11-05",
        pressingId: "p1",
        remise: 500,
        totalNet: 13000,
    }
];

// --- 3. Fonctions Utilitaires de Commande ---

/**
 * Génère un numéro de commande unique (simulé).
 */
export const generateCommandeNumber = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const nextIndex = commandesData.length + 1; 
    return `P-${year}-${String(nextIndex).padStart(3, '0')}`;
};

/**
 * Simule l'ajout d'une nouvelle commande.
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
    return [...commandesData]; 
};

/**
 * Récupère un client par son ID.
 */
export const getClientById = (clientId: string): Client | undefined => {
    return allClients.find(c => c.id === clientId);
};

// --- 4. Fonctions de Rendu UI (Badges) ---

interface BadgeData {
    text: string;
    className: string;
}

/** * Retourne les données (texte et classes CSS) pour le statut de la commande. */
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
    return { text, className: `inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase ${className}` };
};

/** * Retourne les données (texte et classes CSS) pour le statut de paiement. */
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
    return { text, className: `inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase ${className}` };
};