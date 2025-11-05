import React, { useState, useMemo } from "react";
// Assumes the following components and utilities are available from their respective paths
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Mail, Phone, MapPin, Pencil, Trash, Download, X, Users, Star, UserX } from "lucide-react";
// Assuming 'toast' is available, otherwise this line would cause an error in a standalone environment
// import { toast } from "@/hooks/use-toast"; 

// --- DÉFINITION LOCALE DE L'INTERFACE ET DES DONNÉES SIMULÉES ---
type ClientStatus = 'Actif' | 'Inactif'; 

interface Client {
    id: string;
    nom: string;
    telephone: string;
    email: string;
    adresse: string;
    createdAt: Date;
    status: ClientStatus;
}

const initialClients: Client[] = [
    { id: "CL001", nom: "Dupont Jean", telephone: "0612345678", email: "jean.dupont@mail.com", adresse: "15 Rue de la Paix, Paris", createdAt: new Date(2023, 0, 15), status: 'Actif' }, 
    { id: "CL002", nom: "Martin Sophie", telephone: "0798765432", email: "sophie.martin@mail.com", adresse: "2 Bd de la Liberté, Lyon", createdAt: new Date(2023, 2, 20), status: 'Actif' },
    { id: "CL003", nom: "Lefevre Marc", telephone: "0667890123", email: "marc.lefevre@mail.com", adresse: "45 Av. des Champs, Marseille", createdAt: new Date(2023, 8, 5), status: 'Inactif' },
    { id: "CL004", nom: "Dubois Alice", telephone: "0711223344", email: "alice.dubois@mail.com", adresse: "10 Rue du Commerce, Lille", createdAt: new Date(2024, 1, 1), status: 'Actif' }, 
    { id: "CL005", nom: "Garnier Thomas", telephone: "0655667788", email: "thomas.garnier@mail.com", adresse: "8 Place Centrale, Nantes", createdAt: new Date(2024, 3, 10), status: 'Actif' },
    { id: "CL006", nom: "Leroy Paul", telephone: "0601020304", email: "paul.leroy@mail.com", adresse: "6 Rue des Lilas, Rennes", createdAt: new Date(2024, 3, 15), status: 'Actif' },
    { id: "CL007", nom: "Petit Emma", telephone: "0720304050", email: "emma.petit@mail.com", adresse: "7 Av. du Soleil, Nice", createdAt: new Date(2024, 4, 1), status: 'Inactif' },
    { id: "CL008", nom: "Durand Lucas", telephone: "0688776655", email: "lucas.durand@mail.com", adresse: "22 Rue Verte, Strasbourg", createdAt: new Date(2024, 4, 10), status: 'Actif' },
    { id: "CL009", nom: "Moreau Chloé", telephone: "0799887766", email: "chloe.moreau@mail.com", adresse: "1 Impasse Bleue, Bordeaux", createdAt: new Date(2024, 5, 1), status: 'Actif' }, 
    { id: "CL010", nom: "Fournier Alex", telephone: "0640404040", email: "alex.fournier@mail.com", adresse: "33 Pl. du Marché, Toulouse", createdAt: new Date(2024, 5, 5), status: 'Actif' },
    { id: "CL011", nom: "Roux Jeanne", telephone: "0750505050", email: "jeanne.roux@mail.com", adresse: "12 Rue des Fleurs, Metz", createdAt: new Date(2024, 5, 15), status: 'Inactif' },
    { id: "CL012", nom: "Giraud Louis", telephone: "0660606060", email: "louis.giraud@mail.com", adresse: "9 Av. Principale, Reims", createdAt: new Date(2024, 6, 1), status: 'Actif' },
];
// --- FIN DES DONNÉES SIMULÉES ---

const emptyFormData = { nom: "", telephone: "", email: "", adresse: "" };
type FilterType = 'all' | 'actif' | 'inactive'; 

export default function Clients() {
    const [searchTerm, setSearchTerm] = useState("");
    const [clients, setClients] = useState<Client[]>(initialClients);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState(emptyFormData);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [filterBy, setFilterBy] = useState<FilterType>('all'); 

    // Mappe le filtre interne vers le statut du client
    const statusMap: Record<FilterType, ClientStatus | null> = {
        'all': null,
        'actif': 'Actif', 
        'inactive': 'Inactif'
    };

    // Filtrage des clients (optimisé avec useMemo)
    const filteredClients = useMemo(() => {
        const searchFiltered = clients.filter(
            (client) =>
                client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.telephone.includes(searchTerm) ||
                client.email.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const requiredStatus = statusMap[filterBy];

        if (!requiredStatus) {
            return searchFiltered; // 'all'
        }

        return searchFiltered.filter(client => client.status === requiredStatus);
    }, [clients, searchTerm, filterBy]);

    // Handler de changement pour le formulaire
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
    };

    // Ouvre le dialogue en mode édition
    const handleEdit = (client: Client) => {
        setEditingClient(client);
        setFormData({
            nom: client.nom,
            telephone: client.telephone,
            email: client.email,
            adresse: client.adresse,
        });
        setIsDialogOpen(true);
    };

    // Supprime un client
    const handleDelete = (id: string) => {
        setClients(clients.filter(c => c.id !== id));
        console.log(`Client ${id} supprimé.`); 
    };

    // Gestion de la soumission (Ajout ou Modification)
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Simule un statut par défaut pour les nouveaux clients
        const defaultStatus: ClientStatus = 'Actif';

        if (editingClient) {
            // Logique de modification
            setClients(clients.map(c => 
                c.id === editingClient.id ? { ...c, ...formData } : c
            ));
            console.log(`Client ${formData.nom} mis à jour.`); 

        } else {
            // Logique d'ajout
            const newClient: Client = {
                id: `CL${String(clients.length + 1).padStart(3, '0')}`,
                ...formData,
                createdAt: new Date(),
                status: defaultStatus,
            };
            setClients([...clients, newClient]);
            console.log(`Client ${newClient.nom} ajouté.`); 
        }

        setFormData(emptyFormData);
        setEditingClient(null);
        setIsDialogOpen(false);
    };

    // Fonction d'exportation vers CSV (garde la date pour l'export complet)
    const handleExport = () => {
        const headers = ["ID", "Nom", "Telephone", "Email", "Adresse", "Statut", "Date d_ajout"];
        
        const csvRows = filteredClients.map(client => ([
            client.id,
            client.nom,
            client.telephone,
            client.email,
            client.adresse.replace(/,/g, ''), 
            client.status,
            client.createdAt.toLocaleDateString("fr-FR"),
        ].map(field => `"${field}"`).join(','))); 
        
        const csvContent = [headers.join(','), ...csvRows].join('\n');
        
        const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'liste_clients.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log("Exportation CSV réussie."); 
    };

    // Réinitialise le formulaire lors de la fermeture du dialogue
    const onOpenChange = (open: boolean) => {
        if (!open) {
            setEditingClient(null);
            setFormData(emptyFormData);
        }
        setIsDialogOpen(open);
    };

    const dialogTitle = editingClient ? "Modifier le client" : "Ajouter un nouveau client";
    const submitButtonText = editingClient ? "Sauvegarder les modifications" : "Ajouter le client";
    
    // Fonction utilitaire pour le style du badge de statut
    const getStatusBadge = (status: ClientStatus) => {
        switch (status) {
            case 'Inactif':
                return <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-200">Inactif</Badge>;
            case 'Actif':
            default:
                return <Badge className="bg-green-500 hover:bg-green-600 text-green-900">Actif</Badge>;
        }
    };
    
    // Fonction utilitaire pour le style des boutons de filtre
    const getFilterButtonClass = (type: FilterType) => 
        `px-4 py-2 rounded-full font-medium transition-all ${
            filterBy === type
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600'
        }`;

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-8 space-y-8 font-sans">
            
            {/* Header and Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                    <h1 className="text-4xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Clients</h1>
                    <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 mt-1">
                        Gestion complète des fiches clients (<strong className="text-blue-600 dark:text-blue-400">Total: {clients.length}</strong>)
                    </p>
                </div>

                <div className="flex gap-3">
                    {/* Bouton Exporter */}
                    <Button 
                        onClick={handleExport}
                        className="gap-2 bg-yellow-500 hover:bg-yellow-600 text-white shadow-md hover:shadow-lg transition-all text-xs sm:text-sm"
                    >
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Exporter CSV</span>
                        <span className="inline sm:hidden">Export</span>
                    </Button>
                    
                    {/* Bouton Nouveau Client */}
                    <Dialog open={isDialogOpen} onOpenChange={onOpenChange}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all text-xs sm:text-sm">
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">Nouveau Client</span>
                                <span className="inline sm:hidden">Ajouter</span>
                            </Button>
                        </DialogTrigger>
                        
                        {/* Dialogue d'ajout/modification */}
                        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6">
                            <DialogHeader>
                                <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">{dialogTitle}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nom" className="text-sm font-medium text-gray-700 dark:text-gray-300">Nom complet</Label>
                                    <Input id="nom" value={formData.nom} onChange={handleFormChange} required placeholder="Ex: Jean Dupont" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="telephone" className="text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone</Label>
                                    <Input id="telephone" type="tel" value={formData.telephone} onChange={handleFormChange} required placeholder="Ex: 0612345678" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</Label>
                                    <Input id="email" type="email" value={formData.email} onChange={handleFormChange} required placeholder="Ex: jean.dupont@mail.com" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="adresse" className="text-sm font-medium text-gray-700 dark:text-gray-300">Adresse</Label>
                                    <Input id="adresse" value={formData.adresse} onChange={handleFormChange} required placeholder="Ex: 15 Rue de la Paix" />
                                </div>
                                <DialogFooter className="pt-4">
                                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                                        {submitButtonText}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4">
                <Card className="p-4 shadow-xl border border-gray-100 dark:border-gray-700">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                        <Input
                            placeholder="Rechercher par nom, téléphone, email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-10 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </Card>
                
                {/* Boutons de Filtres Rapides (Actif remplace VIP) */}
                <div className="flex flex-wrap gap-2">
                    <button 
                        onClick={() => setFilterBy('all')} 
                        className={getFilterButtonClass('all') + " text-sm"}
                    >
                        <Users className="h-4 w-4 mr-1 inline sm:mr-2" /> <span className="hidden sm:inline">Tous les clients</span><span className="inline sm:hidden">Tous</span>
                    </button>
                    <button 
                        onClick={() => setFilterBy('actif')} 
                        className={getFilterButtonClass('actif') + " text-sm"}
                    >
                        <Star className="h-4 w-4 mr-1 inline text-green-400 sm:mr-2" /> <span className="hidden sm:inline">Clients Actifs</span><span className="inline sm:hidden">Actifs</span>
                    </button>
                    <button 
                        onClick={() => setFilterBy('inactive')} 
                        className={getFilterButtonClass('inactive') + " text-sm"}
                    >
                        <UserX className="h-4 w-4 mr-1 inline sm:mr-2" /> <span className="hidden sm:inline">Clients Inactifs</span><span className="inline sm:hidden">Inactifs</span>
                    </button>
                </div>
            </div>

            {/* Stats (Actif remplace VIP) */}
            <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3">
                <Card className="p-4 sm:p-6 shadow-xl border border-gray-100 dark:border-gray-700">
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">Clients Actifs</p>
                    <p className="text-2xl sm:text-3xl font-extrabold text-green-600 dark:text-green-400 mt-1">
                        {clients.filter(c => c.status === 'Actif').length}
                    </p>
                </Card>
                <Card className="p-4 sm:p-6 shadow-xl border border-gray-100 dark:border-gray-700">
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">Clients Inactifs</p>
                    <p className="text-2xl sm:text-3xl font-extrabold text-red-600 dark:text-red-400 mt-1">
                        {clients.filter(c => c.status === 'Inactif').length}
                    </p>
                </Card>
                <Card className="p-4 sm:p-6 shadow-xl border border-gray-100 dark:border-gray-700">
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">Résultats affichés</p>
                    <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">{filteredClients.length}</p>
                </Card>
            </div>

            {/* Clients Table (Tableau) */}
            <Card className="p-0 overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-700">
                {/* Conteneur pour le défilement vertical et horizontal (si nécessaire sur mobile) */}
                <div className="w-full overflow-x-auto max-h-[600px] overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 shadow-sm z-10">
                            <tr>
                                {/* Padding ajusté pour mobile */}
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[10%]">ID</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[25%] sm:w-[20%]">Nom</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[20%] sm:w-[15%]">Tél.</th> {/* Raccourci sur mobile */}
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[20%] sm:w-[15%]">Statut</th>
                                {/* Colonne email cachée sur mobile et tablette (md) */}
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[25%] sm:w-[25%] hidden md:table-cell">Email</th> 
                                <th className="px-3 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[15%]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredClients.length > 0 ? (
                                filteredClients.map((client) => (
                                    <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition duration-150">
                                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                            <Badge variant="secondary" className="font-mono text-xs">{client.id}</Badge>
                                        </td>
                                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">{client.nom}</td>
                                        
                                        {/* Téléphone cliquable sur mobile */}
                                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                            <a href={`tel:${client.telephone}`} className="text-blue-600 hover:underline">
                                                {client.telephone}
                                            </a>
                                        </td>
                                        
                                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">{getStatusBadge(client.status)}</td>
                                        
                                        {/* Cellule email cachée sur mobile et tablette (md) */}
                                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400 truncate max-w-xs hidden md:table-cell">{client.email}</td>
                                        
                                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-center gap-2">
                                                <Button 
                                                    onClick={() => handleEdit(client)}
                                                    size="sm"
                                                    variant="ghost" 
                                                    className="p-1 h-8 w-8 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-gray-700"
                                                    aria-label={`Éditer ${client.nom}`}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button 
                                                    onClick={() => handleDelete(client.id)}
                                                    size="sm"
                                                    variant="ghost" 
                                                    className="p-1 h-8 w-8 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-gray-700"
                                                    aria-label={`Supprimer ${client.nom}`}
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <X className="h-8 w-8 mx-auto mb-2" />
                                        Aucun client trouvé pour votre recherche et/ou filtre.
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