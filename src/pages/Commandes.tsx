import React, { useState, useMemo, useCallback } from "react";
// Importez vos composants UI (Card, Button, Input, Select, Badge, etc.)
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, FileText, Calendar, List, X } from "lucide-react";


// Ces lignes ont été supprimées :
import NouvelleCommande from "./NouvelleCommande.tsx";
import CommandeDetails from "./CommandeDetails";
// --- DÉFINITIONS ET DONNÉES SIMULÉES (Réutilisées) ---

interface Client { id: string; nom: string; telephone: string; email: string; adresse: string; createdAt: Date; status: string; }
interface Tarif { typeArticle: string; service: string; prix: number; }
interface Article { id: string; type: string; service: string; quantite: number; prixUnitaire: number; }
export type StatutCommande = "en_attente" | "en_cours" | "pret" | "livre"; // Exporté pour les autres fichiers
type StatutPaiement = "non_paye" | "partiel" | "paye";
export interface Commande { id: string; numero: string; clientId: string; articles: Article[]; total: number; statut: StatutCommande; statutPaiement: StatutPaiement; montantPaye: number; dateCreation: Date; }

const mockClients: Client[] = [
    { id: "C1", nom: "Dupont Jean", telephone: "0612345678", email: "jean.dupont@mail.com", adresse: "15 Rue de la Paix, Paris", createdAt: new Date(2023, 0, 15), status: 'Actif' },
    { id: "C2", nom: "Martin Sophie", telephone: "0798765432", email: "sophie.martin@mail.com", adresse: "2 Bd de la Liberté, Lyon", createdAt: new Date(2023, 2, 20), status: 'Actif' },
    { id: "C3", nom: "Lefevre Marc", telephone: "0667890123", email: "marc.lefevre@mail.com", adresse: "45 Av. des Champs, Marseille", createdAt: new Date(2023, 8, 5), status: 'Inactif' },
];

const mockTarifs: Tarif[] = [
    { typeArticle: "Chemise", service: "Nettoyage à sec", prix: 1500 },
    { typeArticle: "Pantalon", service: "Lavage + Repassage", prix: 2500 },
    { typeArticle: "Robe", service: "Nettoyage à sec", prix: 3000 },
    { typeArticle: "Couette", service: "Lavage seul", prix: 4500 },
    { typeArticle: "Tapis", service: "Nettoyage à sec", prix: 8000 },
    { typeArticle: "Tapis", service: "Lavage seul", prix: 6000 },
];

const mockCommandes: Commande[] = [
    { id: "1", numero: "CMD-0001", clientId: "C1", articles: [{ id: "a1", type: "Chemise", service: "Nettoyage à sec", quantite: 2, prixUnitaire: 1500 }], total: 3000, statut: "pret", statutPaiement: "paye", montantPaye: 3000, dateCreation: new Date(2024, 4, 1) },
    { id: "2", numero: "CMD-0002", clientId: "C2", articles: [{ id: "a2", type: "Pantalon", service: "Lavage + Repassage", quantite: 1, prixUnitaire: 2500 }, { id: "a3", type: "Robe", service: "Nettoyage à sec", quantite: 1, prixUnitaire: 3000 }], total: 5500, statut: "en_cours", statutPaiement: "partiel", montantPaye: 2000, dateCreation: new Date(2024, 4, 5) },
    { id: "3", numero: "CMD-0003", clientId: "C1", articles: [{ id: "a4", type: "Couette", service: "Lavage seul", quantite: 1, prixUnitaire: 4500 }], total: 4500, statut: "en_attente", statutPaiement: "non_paye", montantPaye: 0, dateCreation: new Date(2024, 4, 10) },
    { id: "4", numero: "CMD-0004", clientId: "C3", articles: [{ id: "a5", type: "Tapis", service: "Nettoyage à sec", quantite: 1, prixUnitaire: 8000 }], total: 8000, statut: "livre", statutPaiement: "paye", montantPaye: 8000, dateCreation: new Date(2024, 5, 1) },
    { id: "5", numero: "CMD-0005", clientId: "C2", articles: [{ id: "a6", type: "Chemise", service: "Nettoyage à sec", quantite: 5, prixUnitaire: 1500 }], total: 7500, statut: "en_attente", statutPaiement: "partiel", montantPaye: 1000, dateCreation: new Date(2024, 5, 15) },
];

// Export des utilitaires pour les autres fichiers
export const getClientName = (clientId: string) => mockClients.find(c => c.id === clientId)?.nom || "Client Inconnu";
export const getClientById = (clientId: string) => mockClients.find(c => c.id === clientId) || null;
export const getArticleTypes = (articles: Article[]) => {
    const counts = articles.reduce((acc, article) => {
        acc[article.type] = (acc[article.type] || 0) + article.quantite;
        return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([type, count]) => `${type} (${count})`).join(', ');
};
export const getArticleServices = (articles: Article[]) => {
    const services = new Set(articles.map(article => article.service));
    return Array.from(services).join(', ');
};
export const generateCommandeNumber = (): string => {
    const timestamp = Date.now().toString().slice(-6);
    return `CMD-${timestamp}`;
};
export const allClients = mockClients;
export const allTarifs = mockTarifs;

// Badges de statut (Réutilisés dans les trois composants)
export const getStatutBadge = (statut: StatutCommande) => {
    let text = statut.replace("_", " ");
    let classes = "uppercase text-xs font-semibold px-2 py-0.5 rounded-full border";
    switch (statut) {
        case "pret":
            return <Badge className={`${classes} bg-green-100 text-green-700 border-green-300`}>{text}</Badge>;
        case "livre":
            return <Badge className={`${classes} bg-green-200 text-green-800 border-green-400`}>{text}</Badge>;
        case "en_cours":
            return <Badge className={`${classes} bg-blue-100 text-blue-700 border-blue-300`}>{text}</Badge>;
        case "en_attente":
        default:
            return <Badge className={`${classes} bg-yellow-100 text-yellow-700 border-yellow-300`}>{text}</Badge>;
    }
};

export const getPaiementBadge = (statut: StatutPaiement) => {
    let classes = "uppercase text-xs font-semibold px-2 py-0.5 rounded-full border";
    switch (statut) {
        case "paye":
            return <Badge className={`${classes} bg-green-100 text-green-700 border-green-300`}>Payé</Badge>;
        case "partiel":
            return <Badge className={`${classes} bg-yellow-100 text-yellow-700 border-yellow-300`}>Partiel</Badge>;
        case "non_paye":
        default:
            return <Badge className={`${classes} bg-red-100 text-red-700 border-red-300`}>Non Payé</Badge>;
    }
};

// --- Composant principal COMMANDES ---

type View = 'list' | 'create' | 'details';

export default function Commandes() {
    const [commandes, setCommandes] = useState<Commande[]>(mockCommandes);
    const [currentView, setCurrentView] = useState<View>('list');
    const [selectedCommandeId, setSelectedCommandeId] = useState<string | null>(null);

    // États de filtre (conservés de la demande précédente)
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<StatutCommande | "all">("all");
    const [filterDate, setFilterDate] = useState<string>("");
    
    // Fonction pour ajouter une commande (sera passée à CreateCommande)
    const addCommande = (newCommande: Omit<Commande, 'id'>) => {
        const nextId = String(commandes.length + 1);
        const commandeWithId: Commande = { ...newCommande, id: nextId };
        setCommandes([commandeWithId, ...commandes]);
        setCurrentView('list'); // Retour à la liste après création
        setSelectedCommandeId(nextId); // Afficher les détails de la nouvelle commande si désiré
    };

    // Logique de Filtrage (conservée)
    const filteredCommandes = useMemo(() => {
        return commandes.filter(commande => {
            const clientName = getClientName(commande.clientId).toLowerCase();
            const lowerCaseSearch = searchTerm.toLowerCase();
            const dateCreation = new Date(commande.dateCreation).toISOString().split('T')[0];
            
            const matchesSearch = commande.numero.toLowerCase().includes(lowerCaseSearch) ||
                                 clientName.includes(lowerCaseSearch);
            const matchesStatus = filterStatus === "all" || commande.statut === filterStatus;
            const matchesDate = !filterDate || dateCreation === filterDate;

            return matchesSearch && matchesStatus && matchesDate;
        }).sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime());
    }, [commandes, searchTerm, filterStatus, filterDate]);

    // Affichage conditionnel des vues
    if (currentView === 'create') {
        return (
<NouvelleCommande 
  onCancel={() => setCurrentView('list')} 
  onSubmit={addCommande} 
  clients={allClients} 
  tarifs={allTarifs} 
/>

        );
    }
    
    if (currentView === 'details' && selectedCommandeId) {
        const selectedCommande = commandes.find(c => c.id === selectedCommandeId);
        if (selectedCommande) {
            return (
                <CommandeDetails 
                    commande={selectedCommande} 
                    onBack={() => setCurrentView('list')} 
                    // Passez une fonction de mise à jour si nécessaire
                    onUpdate={(updatedCommande) => { 
                         setCommandes(commandes.map(c => c.id === updatedCommande.id ? updatedCommande : c));
                         // Revenir à la liste après mise à jour si désiré, ou rester sur les détails
                         // setCurrentView('list');
                    }}
                />
            );
        }
    }


    // --- Vue par défaut : LISTE DES COMMANDES ---

    const allStatuses: { value: StatutCommande | "all"; label: string }[] = [
        { value: "all", label: "Tous les statuts" },
        { value: "en_attente", label: "En attente" },
        { value: "en_cours", label: "En cours" },
        { value: "pret", label: "Prêt" },
        { value: "livre", label: "Livré" },
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-8 space-y-8 font-sans">
            
            {/* Header and Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                        <List className="h-7 w-7 text-blue-600" /> Commandes
                    </h1>
                    <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 mt-1">
                        Historique et gestion des ordres de nettoyage (<strong className="text-blue-600 dark:text-blue-400">Affichés: {filteredCommandes.length} / Total: {commandes.length}</strong>)
                    </p>
                </div>

                {/* Bouton pour aller à la page de création */}
                <Button 
                    onClick={() => setCurrentView('create')} 
                    className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all text-xs sm:text-sm"
                >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Nouvelle Commande</span>
                    <span className="inline sm:hidden">Ajouter</span>
                </Button>
            </div>

            {/* Barre de recherche et Filtres */}
            <Card className="p-4 shadow-xl border border-gray-100 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    {/* Search Bar */}
                    <div className="relative md:col-span-2">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                        <Input
                            placeholder="Rechercher par N° Commande ou nom de client..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-10 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    
                    {/* Filter Status */}
                    <Select value={filterStatus} onValueChange={(v: StatutCommande | "all") => setFilterStatus(v)}>
                        <SelectTrigger className="w-full h-10 border-gray-300 dark:border-gray-600">
                            <SelectValue placeholder="Filtrer par statut" />
                        </SelectTrigger>
                        <SelectContent>
                            {allStatuses.map(status => (
                                <SelectItem key={status.value} value={status.value}>
                                    {status.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Filter Date (Ajout du filtre par date) */}
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                        <Input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="pl-10 h-10 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>
            </Card>

            {/* Commandes Table */}
            <Card className="p-0 overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-700">
                <div className="w-full overflow-x-auto max-h-[70vh] overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 shadow-sm z-10">
                            <tr>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[15%]">
                                    N° Commande
                                </th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[20%]">
                                    Client
                                </th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[20%] hidden sm:table-cell">
                                    Type de Lavage
                                </th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[15%] hidden lg:table-cell">
                                    Type de Commande
                                </th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[15%]">
                                    Statut
                                </th>
                                <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[15%]">
                                    Sous-total
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredCommandes.length > 0 ? (
                                filteredCommandes.map((commande) => (
                                    <tr 
                                        key={commande.id} 
                                        className="hover:bg-gray-100 dark:hover:bg-gray-800 transition duration-150 cursor-pointer"
                                        onClick={() => {
                                            setSelectedCommandeId(commande.id);
                                            setCurrentView('details');
                                        }} // Ajout du clic pour les détails
                                    >
                                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">{commande.numero}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 sm:hidden">
                                                {getClientName(commande.clientId)}
                                            </div>
                                        </td>
                                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">{getClientName(commande.clientId)}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-500">
                                                {new Date(commande.dateCreation).toLocaleDateString("fr-FR")}
                                            </div>
                                        </td>
                                        <td className="px-3 sm:px-6 py-4 whitespace-normal hidden sm:table-cell">
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                {getArticleServices(commande.articles)}
                                            </div>
                                        </td>
                                        <td className="px-3 sm:px-6 py-4 whitespace-normal hidden lg:table-cell">
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                {getArticleTypes(commande.articles)}
                                            </div>
                                        </td>
                                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                            {getStatutBadge(commande.statut)}
                                        </td>
                                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right">
                                            <div className="text-md font-bold text-gray-900 dark:text-white">
                                                {commande.total.toLocaleString()} FCFA
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <FileText className="h-8 w-8 mx-auto mb-2" />
                                        Aucune commande trouvée.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}