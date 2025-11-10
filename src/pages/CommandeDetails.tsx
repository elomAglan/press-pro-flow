import React, { useState, useMemo, useEffect } from "react";
import { getAllCommandes } from "../services/commande.service.ts";

// Imports UI séparés
import { Card, CardHeader, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import { Badge } from "../components/ui/badge";

// Icônes
import { List, Plus, Search, Calendar, FileText } from "lucide-react";

// --- Interfaces ---
interface Client { id: string; nom: string; telephone: string; email: string; adresse: string; createdAt: Date; status: string; }
interface Article { id: string; type: string; service: string; quantite: number; prixUnitaire: number; }
export type StatutCommande = "en_attente" | "en_cours" | "pret" | "livre";
type StatutPaiement = "non_paye" | "partiel" | "paye";
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

type View = "list" | "create" | "details";

// --- Fonctions utilitaires ---
const getClientName = (clientId: string) => clientId; // TODO: remplacer par fetch réel
const getArticleServices = (articles: Article[]) => Array.from(new Set(articles.map(a => a.service))).join(", ");
const getArticleTypes = (articles: Article[]) => {
    const counts = articles.reduce((acc, a) => { acc[a.type] = (acc[a.type] || 0) + a.quantite; return acc; }, {} as Record<string, number>);
    return Object.entries(counts).map(([type, count]) => `${type} (${count})`).join(", ");
};
const getStatutBadge = (statut: StatutCommande) => {
    let classes = "uppercase text-xs font-semibold px-2 py-0.5 rounded-full border";
    switch(statut){
        case "pret": return <Badge className={`${classes} bg-green-100 text-green-700 border-green-300`}>{statut}</Badge>;
        case "livre": return <Badge className={`${classes} bg-green-200 text-green-800 border-green-400`}>{statut}</Badge>;
        case "en_cours": return <Badge className={`${classes} bg-blue-100 text-blue-700 border-blue-300`}>{statut}</Badge>;
        default: return <Badge className={`${classes} bg-yellow-100 text-yellow-700 border-yellow-300`}>{statut}</Badge>;
    }
};

export default function Commandes() {
    const [commandes, setCommandes] = useState<Commande[]>([]);
    const [currentView, setCurrentView] = useState<View>("list");
    const [selectedCommandeId, setSelectedCommandeId] = useState<string | null>(null);

    // États de filtre
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<StatutCommande | "all">("all");
    const [filterDate, setFilterDate] = useState<string>("");

    // 🔹 Charger les commandes depuis l'API
    useEffect(() => {
        async function fetchCommandes() {
            try {
                const data = await getAllCommandes();
                const commandesWithDates = data.map((c: any) => ({ ...c, dateCreation: new Date(c.dateCreation) }));
                setCommandes(commandesWithDates);
            } catch (error) {
                console.error("Erreur lors du chargement des commandes :", error);
            }
        }
        fetchCommandes();
    }, []);

    // 🔹 Filtrage des commandes
    const filteredCommandes = useMemo(() => {
        return commandes.filter(c => {
            const clientName = getClientName(c.clientId).toLowerCase();
            const lowerSearch = searchTerm.toLowerCase();
            const dateCreation = new Date(c.dateCreation).toISOString().split("T")[0];

            const matchesSearch = c.numero.toLowerCase().includes(lowerSearch) || clientName.includes(lowerSearch);
            const matchesStatus = filterStatus === "all" || c.statut === filterStatus;
            const matchesDate = !filterDate || dateCreation === filterDate;

            return matchesSearch && matchesStatus && matchesDate;
        }).sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime());
    }, [commandes, searchTerm, filterStatus, filterDate]);

    const allStatuses: { value: StatutCommande | "all"; label: string }[] = [
        { value: "all", label: "Tous les statuts" },
        { value: "en_attente", label: "En attente" },
        { value: "en_cours", label: "En cours" },
        { value: "pret", label: "Prêt" },
        { value: "livre", label: "Livré" },
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-8 space-y-8 font-sans">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                        <List className="h-7 w-7 text-blue-600" /> Commandes
                    </h1>
                    <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 mt-1">
                        Historique et gestion des ordres de nettoyage (<strong className="text-blue-600 dark:text-blue-400">Affichés: {filteredCommandes.length} / Total: {commandes.length}</strong>)
                    </p>
                </div>

                <Button
                    onClick={() => setCurrentView("create")}
                    className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all text-xs sm:text-sm"
                >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Nouvelle Commande</span>
                    <span className="inline sm:hidden">Ajouter</span>
                </Button>
            </div>

            {/* Filtres */}
            <Card className="p-4 shadow-xl border border-gray-100 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div className="relative md:col-span-2">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                        <Input
                            placeholder="Rechercher par N° Commande ou nom de client..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-10 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <Select value={filterStatus} onValueChange={(v: StatutCommande | "all") => setFilterStatus(v)}>
                        <SelectTrigger className="w-full h-10 border-gray-300 dark:border-gray-600">
                            <SelectValue placeholder="Filtrer par statut" />
                        </SelectTrigger>
                        <SelectContent>
                            {allStatuses.map(status => (
                                <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

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

            {/* Tableau des commandes */}
            <Card className="p-0 overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-700">
                <div className="w-full overflow-x-auto max-h-[70vh] overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 shadow-sm z-10">
                            <tr>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[15%]">N° Commande</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[20%]">Client</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[20%] hidden sm:table-cell">Type de Lavage</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[15%] hidden lg:table-cell">Type de Commande</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[15%]">Statut</th>
                                <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[15%]">Sous-total</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredCommandes.length > 0 ? (
                                filteredCommandes.map(c => (
                                    <tr key={c.id} className="hover:bg-gray-100 dark:hover:bg-gray-800 transition duration-150 cursor-pointer"
                                        onClick={() => { setSelectedCommandeId(c.id); setCurrentView("details"); }}
                                    >
                                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">{c.numero}</div>
                                        </td>
                                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">{getClientName(c.clientId)}</td>
                                        <td className="px-3 sm:px-6 py-4 whitespace-normal hidden sm:table-cell">{getArticleServices(c.articles)}</td>
                                        <td className="px-3 sm:px-6 py-4 whitespace-normal hidden lg:table-cell">{getArticleTypes(c.articles)}</td>
                                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">{getStatutBadge(c.statut)}</td>
                                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right">{c.total.toLocaleString()} FCFA</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <FileText className="h-8 w-8 mx-auto mb-2" /> Aucune commande trouvée.
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
