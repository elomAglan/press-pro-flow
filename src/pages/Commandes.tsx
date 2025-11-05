import React, { useState, useMemo, useCallback } from "react";
// Assumes the following components and utilities are available
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, QrCode, Search, FileText, Calendar } from "lucide-react";

// Remplacement du composant externe 'qrcode.react' par un placeholder
const QRCodePlaceholder = ({ value, size }) => (
    <div 
        style={{ width: size, height: size }}
        className="mx-auto flex items-center justify-center bg-gray-200 dark:bg-gray-600 rounded-lg border-2 border-dashed border-gray-400 dark:border-gray-500 p-2"
    >
        <span className="text-center text-xs font-mono text-gray-700 dark:text-gray-300 break-all p-1">
            QR Code: {value}
        </span>
    </div>
);

// --- DÉFINITIONS ET DONNÉES SIMULÉES (services/mockData.ts) ---

interface Client { id: string; nom: string; telephone: string; email: string; adresse: string; createdAt: Date; status: string; }
interface Tarif { typeArticle: string; service: string; prix: number; }
interface Article { id: string; type: string; service: string; quantite: number; prixUnitaire: number; }
type StatutCommande = "en_attente" | "en_cours" | "pret" | "livre";
type StatutPaiement = "non_paye" | "partiel" | "paye";
interface Commande { id: string; numero: string; clientId: string; articles: Article[]; total: number; statut: StatutCommande; statutPaiement: StatutPaiement; montantPaye: number; dateCreation: Date; }

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

const generateCommandeNumber = (): string => {
    const timestamp = Date.now().toString().slice(-6);
    return `CMD-${timestamp}`;
};

const mockCommandes: Commande[] = [
    { id: "1", numero: "CMD-0001", clientId: "C1", articles: [{ id: "a1", type: "Chemise", service: "Nettoyage à sec", quantite: 2, prixUnitaire: 1500 }], total: 3000, statut: "pret", statutPaiement: "paye", montantPaye: 3000, dateCreation: new Date(2024, 4, 1) },
    { id: "2", numero: "CMD-0002", clientId: "C2", articles: [{ id: "a2", type: "Pantalon", service: "Lavage + Repassage", quantite: 1, prixUnitaire: 2500 }, { id: "a3", type: "Robe", service: "Nettoyage à sec", quantite: 1, prixUnitaire: 3000 }], total: 5500, statut: "en_cours", statutPaiement: "partiel", montantPaye: 2000, dateCreation: new Date(2024, 4, 5) },
    { id: "3", numero: "CMD-0003", clientId: "C1", articles: [{ id: "a4", type: "Couette", service: "Lavage seul", quantite: 1, prixUnitaire: 4500 }], total: 4500, statut: "en_attente", statutPaiement: "non_paye", montantPaye: 0, dateCreation: new Date(2024, 4, 10) },
    { id: "4", numero: "CMD-0004", clientId: "C3", articles: [{ id: "a5", type: "Tapis", service: "Nettoyage à sec", quantite: 1, prixUnitaire: 8000 }], total: 8000, statut: "livre", statutPaiement: "paye", montantPaye: 8000, dateCreation: new Date(2024, 5, 1) },
    { id: "5", numero: "CMD-0005", clientId: "C2", articles: [{ id: "a6", type: "Chemise", service: "Nettoyage à sec", quantite: 5, prixUnitaire: 1500 }], total: 7500, statut: "en_attente", statutPaiement: "partiel", montantPaye: 1000, dateCreation: new Date(2024, 5, 15) },
];

const getClientName = (clientId: string) => mockClients.find(c => c.id === clientId)?.nom || "Client Inconnu";
const getArticleTypes = (articles: Article[]) => {
    // Regroupe les types d'articles (e.g., "Chemise (2), Pantalon (1)")
    const counts = articles.reduce((acc, article) => {
        acc[article.type] = (acc[article.type] || 0) + article.quantite;
        return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([type, count]) => `${type} (${count})`).join(', ');
};

const getArticleServices = (articles: Article[]) => {
    // Regroupe les services uniques (e.g., "Nettoyage à sec, Lavage + Repassage")
    const services = new Set(articles.map(article => article.service));
    return Array.from(services).join(', ');
};
// --- FIN DES DONNÉES SIMULÉES ---

export default function Commandes() {
    const [commandes, setCommandes] = useState<Commande[]>(mockCommandes);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    // Supprimez l'état lié au QR Code car il est retiré du tableau et de la demande principale
    // const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
    // const [selectedCommande, setSelectedCommande] = useState<Commande | null>(null);
    // const [etiquetteType, setEtiquetteType] = useState<"commande" | "article">("commande");

    const [selectedClient, setSelectedClient] = useState("");
    const [articles, setArticles] = useState<Article[]>([]);
    const [currentArticle, setCurrentArticle] = useState({
        type: "",
        service: "",
        quantite: 1,
    });
    const [searchTerm, setSearchTerm] = useState("");
    
    // Nouveaux états pour le filtrage
    const [filterStatus, setFilterStatus] = useState<StatutCommande | "all">("all");
    const [filterDate, setFilterDate] = useState<string>(""); // Format YYYY-MM-DD

    const types = useMemo(() => [...new Set(mockTarifs.map(t => t.typeArticle))], []);
    const services = useMemo(() => [...new Set(mockTarifs.map(t => t.service))], []);
    
    // --- Logique de Filtrage Mise à Jour ---
    const filteredCommandes = useMemo(() => {
        return commandes.filter(commande => {
            const clientName = getClientName(commande.clientId).toLowerCase();
            const lowerCaseSearch = searchTerm.toLowerCase();
            const dateCreation = new Date(commande.dateCreation).toISOString().split('T')[0];
            
            // 1. Recherche par terme (numéro ou nom du client)
            const matchesSearch = commande.numero.toLowerCase().includes(lowerCaseSearch) ||
                                 clientName.includes(lowerCaseSearch);

            // 2. Filtre par statut
            const matchesStatus = filterStatus === "all" || commande.statut === filterStatus;
            
            // 3. Filtre par date
            const matchesDate = !filterDate || dateCreation === filterDate;

            return matchesSearch && matchesStatus && matchesDate;
            
        }).sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime());
    }, [commandes, searchTerm, filterStatus, filterDate]);


    const getPrixUnitaire = useCallback(() => {
        const tarif = mockTarifs.find(
            t => t.typeArticle === currentArticle.type && t.service === currentArticle.service
        );
        return tarif?.prix || 0;
    }, [currentArticle.type, currentArticle.service]);

    const addArticle = () => {
        if (!currentArticle.type || !currentArticle.service) {
            console.error("Veuillez sélectionner un type et un service");
            return;
        }

        const newArticle: Article = {
            id: `a${articles.length + 1}`,
            ...currentArticle,
            prixUnitaire: getPrixUnitaire(),
        };

        setArticles([...articles, newArticle]);
        setCurrentArticle({ type: "", service: "", quantite: 1 });
        console.log("L'article a été ajouté à la commande");
    };

    const removeArticle = (id: string) => {
        setArticles(articles.filter(a => a.id !== id));
    };

    const calculateTotal = () => {
        return articles.reduce((sum, article) => sum + (article.prixUnitaire * article.quantite), 0);
    };

    const handleSubmit = () => {
        if (!selectedClient || articles.length === 0) {
            console.error("Veuillez sélectionner un client et ajouter au moins un article");
            return;
        }

        const newCommande: Commande = {
            id: String(commandes.length + 1),
            numero: generateCommandeNumber(),
            clientId: selectedClient,
            articles,
            total: calculateTotal(),
            statut: "en_attente",
            statutPaiement: "non_paye",
            montantPaye: 0,
            dateCreation: new Date(),
        };

        setCommandes([newCommande, ...commandes]);
        // setSelectedCommande(newCommande); // Plus nécessaire sans l'ouverture auto de la modale QR
        setArticles([]);
        setSelectedClient("");
        setIsDialogOpen(false);
        // setIsQRDialogOpen(true); // Plus d'ouverture auto de la modale QR
        console.log(`Commande ${newCommande.numero} créée avec succès`);
    };

    // --- UTILITIES POUR LE STYLE (Responsive & Couleurs) ---

    // Badges de statut (utilisant des classes Tailwind standard pour la couleur)
    const getStatutBadge = (statut: StatutCommande) => {
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

    const getPaiementBadge = (statut: StatutPaiement) => {
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
    
    const allStatuses: { value: StatutCommande | "all"; label: string }[] = [
        { value: "all", label: "Tous les statuts" },
        { value: "en_attente", label: "En attente" },
        { value: "en_cours", label: "En cours" },
        { value: "pret", label: "Prêt" },
        { value: "livre", label: "Livré" },
    ];

    // --- COMPOSANT PRINCIPAL ---

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-8 space-y-8 font-sans">
            
            {/* Header and Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Commandes</h1>
                    <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 mt-1">
                        Historique et gestion des ordres de nettoyage (<strong className="text-blue-600 dark:text-blue-400">Affichés: {filteredCommandes.length} / Total: {commandes.length}</strong>)
                    </p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all text-xs sm:text-sm">
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">Nouvelle Commande</span>
                            <span className="inline sm:hidden">Ajouter</span>
                        </Button>
                    </DialogTrigger>
                    
                    {/* Dialogue de Création de Commande (Conservé) - Non modifié pour la concision */}
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6">
                        <DialogHeader>
                            <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Créer une commande</DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-6">
                            {/* Client Selection */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Client</Label>
                                <Select value={selectedClient} onValueChange={setSelectedClient}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Sélectionner un client" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {mockClients.map(client => (
                                            <SelectItem key={client.id} value={client.id}>
                                                {client.nom} - {client.telephone}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Article Form */}
                            <Card className="p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                                <h3 className="mb-4 font-semibold text-lg border-b pb-2 text-gray-800 dark:text-white">Ajouter un article</h3>
                                <div className="grid gap-4 sm:grid-cols-4">
                                    <div className="space-y-2 sm:col-span-1">
                                        <Label className="text-xs">Type</Label>
                                        <Select value={currentArticle.type} onValueChange={(v) => setCurrentArticle({...currentArticle, type: v})}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {types.map(type => (
                                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2 sm:col-span-1">
                                        <Label className="text-xs">Service</Label>
                                        <Select value={currentArticle.service} onValueChange={(v) => setCurrentArticle({...currentArticle, service: v})}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Service" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {services.map(service => (
                                                    <SelectItem key={service} value={service}>{service}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2 sm:col-span-1">
                                        <Label className="text-xs">Quantité</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={currentArticle.quantite}
                                            onChange={(e) => setCurrentArticle({...currentArticle, quantite: parseInt(e.target.value) || 1})}
                                        />
                                    </div>
                                    <div className="flex items-end sm:col-span-1">
                                        <Button type="button" onClick={addArticle} className="w-full bg-green-500 hover:bg-green-600">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Ajouter
                                        </Button>
                                    </div>
                                </div>
                                {currentArticle.type && currentArticle.service && (
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        Prix unitaire: **{getPrixUnitaire().toLocaleString()} FCFA**
                                    </p>
                                )}
                            </Card>

                            {/* Articles List */}
                            {articles.length > 0 && (
                                <Card className="p-4 shadow-md border border-gray-100 dark:border-gray-700">
                                    <h3 className="mb-4 font-semibold text-lg text-gray-800 dark:text-white">Articles dans la commande ({articles.length})</h3>
                                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                                        {articles.map(article => (
                                            <div key={article.id} className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-700 p-3 border border-gray-200 dark:border-gray-600">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 dark:text-white truncate">
                                                        {article.type} - {article.service}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {article.quantite} x {article.prixUnitaire.toLocaleString()} = **{(article.quantite * article.prixUnitaire).toLocaleString()} FCFA**
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500 hover:bg-red-50 p-2 ml-4"
                                                    onClick={() => removeArticle(article.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 border-t border-gray-200 dark:border-gray-600 pt-4">
                                        <div className="flex justify-between text-xl font-bold">
                                            <span>Total:</span>
                                            <span className="text-blue-600 dark:text-blue-400">{calculateTotal().toLocaleString()} FCFA</span>
                                        </div>
                                    </div>
                                </Card>
                            )}

                            <Button onClick={handleSubmit} className="w-full bg-blue-600 hover:bg-blue-700 font-semibold">
                                Créer la commande
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
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
                                {/* <th className="px-3 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[10%]">
                                    Actions (Retiré)
                                </th> */}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredCommandes.length > 0 ? (
                                filteredCommandes.map((commande) => (
                                    <tr key={commande.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition duration-150">
                                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-900 dark:text-white">{commande.numero}</div>
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
                                        {/* Colonne Actions (QR Code) RETIRÉE */}
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

            {/* Le Dialogue QR Code est conservé mais n'est plus appelé par le tableau */}
            {/* <Dialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen}>
                ... contenu de la modale QR Code ...
            </Dialog> */}
        </div>
    );
}