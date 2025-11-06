import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
// Imports UI
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// Note: Assurez-vous que X, Plus, Trash2, etc. sont bien importés
import { Plus, Trash2, FileText, ShoppingCart, X } from "lucide-react"; 

// 🚨 VÉRIFICATION DE L'IMPORTATION: Importez TOUT depuis le fichier d'utilitaires 'Commandes.utils'
import { 
    allClients, 
    allTarifs, 
    generateCommandeNumber, 
    addCommande, // Fonction d'ajout simulée
    Commande, 
    Article, 
    StatutCommande
} from "./Commandes.utils"; 

// --- COMPOSANT ---



type NouvelleCommandeProps = {
    onCancel?: () => void;
    onSubmit?: (newCommande: Omit<Commande, 'id'>) => any;
    clients?: any[];
    tarifs?: any[];
}

export default function NouvelleCommande(props: NouvelleCommandeProps = {}) {
    // Hooks de routage
    const navigate = useNavigate();

    // Accès direct aux données (simulées) — allow parent to inject via props when embedded
    const clients = props.clients ?? allClients;
    const tarifs = props.tarifs ?? allTarifs;

    // États locaux
    const [selectedClient, setSelectedClient] = useState("");
    const [articles, setArticles] = useState<Article[]>([]);
    const [currentArticle, setCurrentArticle] = useState({
        type: "",
        service: "",
        quantite: 1,
    });

    // Types et Services disponibles basés sur les tarifs
    const types = useMemo(() => [...new Set(tarifs.map(t => t.typeArticle))], [tarifs]);
    const services = useMemo(() => [...new Set(tarifs.map(t => t.service))], [tarifs]);
    
    // Logique de prix et calculs
    const getPrixUnitaire = useCallback(() => {
        const tarif = tarifs.find(
            t => t.typeArticle === currentArticle.type && t.service === currentArticle.service
        );
        return tarif?.prix || 0;
    }, [currentArticle.type, currentArticle.service, tarifs]);

    const addArticle = () => {
        if (!selectedClient) {
            console.error("Veuillez d'abord sélectionner un client.");
            return;
        }
        if (!currentArticle.type || !currentArticle.service) {
            console.error("Veuillez sélectionner un type et un service valides.");
            return;
        }
        if (currentArticle.quantite <= 0) {
            console.error("La quantité doit être supérieure à zéro.");
            return;
        }

        const newArticle: Article = {
            id: `a${articles.length + 1}-${Date.now()}`,
            ...currentArticle,
            prixUnitaire: getPrixUnitaire(),
        };

        setArticles([...articles, newArticle]);
        // Réinitialisation du formulaire d'ajout d'article
        setCurrentArticle({ type: "", service: "", quantite: 1 }); 
    };

    const removeArticle = (id: string) => {
        setArticles(articles.filter(a => a.id !== id));
    };

    const calculateTotal = useMemo(() => {
        return articles.reduce((sum, article) => sum + (article.prixUnitaire * article.quantite), 0);
    }, [articles]);

    const handleCancel = () => {
        if (props.onCancel) return props.onCancel();
        navigate("/commandes"); // Redirection vers la liste
    }

    const handleSubmit = () => {
        if (!selectedClient || articles.length === 0) {
            console.error("Veuillez sélectionner un client et ajouter au moins un article.");
            return;
        }

        const newCommande: Omit<Commande, 'id'> = {
            numero: generateCommandeNumber(),
            clientId: selectedClient,
            articles,
            total: calculateTotal,
            statut: "en_attente" as StatutCommande, 
            statutPaiement: "non_paye",
            montantPaye: 0,
            dateCreation: new Date(),
        };

        // If a parent provided an onSubmit handler, call it and let the parent decide what to do (view change, navigation)
        if (props.onSubmit) {
            props.onSubmit(newCommande);
            return;
        }

        // Fallback: use the local mock addCommande util and navigate to its details
        const savedCommande = addCommande(newCommande);
        navigate(`/commandes/${savedCommande.id}`);
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-8 space-y-8 font-sans max-w-4xl mx-auto">
            <div className="flex items-center justify-between border-b pb-4 mb-6">
                <h1 className="text-4xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                    <ShoppingCart className="h-7 w-7 text-blue-600" /> Nouvelle Commande
                </h1>
                <Button 
                    variant="outline" 
                    onClick={handleCancel} 
                    className="gap-2 text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-gray-800"
                >
                    <X className="h-4 w-4" /> Annuler
                </Button>
            </div>

            <Card className="p-6 shadow-2xl space-y-6">
                {/* Section Client */}
                <div className="space-y-2">
                    <Label className="text-sm font-bold text-gray-700 dark:text-gray-300">Sélection du Client</Label>
                    <Select value={selectedClient} onValueChange={setSelectedClient}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Sélectionner un client" />
                        </SelectTrigger>
                        <SelectContent>
                            {clients.map(client => (
                                <SelectItem key={client.id} value={client.id}>
                                    {client.nom} - {client.telephone}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Section Ajout Article */}
                <Card className="p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="mb-4 font-semibold text-lg border-b pb-2 text-gray-800 dark:text-white">Ajouter un article à la liste</h3>
                    <div className="grid gap-4 sm:grid-cols-4">
                        {/* Type */}
                        <div className="space-y-2 sm:col-span-1">
                            <Label className="text-xs">Type</Label>
                            <Select value={currentArticle.type} onValueChange={(v) => setCurrentArticle({...currentArticle, type: v})}>
                                <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                                <SelectContent>{types.map(type => (<SelectItem key={type} value={type}>{type}</SelectItem>))}</SelectContent>
                            </Select>
                        </div>
                        {/* Service */}
                        <div className="space-y-2 sm:col-span-1">
                            <Label className="text-xs">Service</Label>
                            <Select value={currentArticle.service} onValueChange={(v) => setCurrentArticle({...currentArticle, service: v})}>
                                <SelectTrigger><SelectValue placeholder="Service" /></SelectTrigger>
                                <SelectContent>{services.map(service => (<SelectItem key={service} value={service}>{service}</SelectItem>))}</SelectContent>
                            </Select>
                        </div>
                        {/* Quantité */}
                        <div className="space-y-2 sm:col-span-1">
                            <Label className="text-xs">Quantité</Label>
                            <Input
                                type="number"
                                min="1"
                                value={currentArticle.quantite}
                                onChange={(e) => setCurrentArticle({...currentArticle, quantite: parseInt(e.target.value) || 1})}
                            />
                        </div>
                        {/* Bouton Ajouter */}
                        <div className="flex items-end sm:col-span-1">
                            <Button type="button" onClick={addArticle} className="w-full bg-green-500 hover:bg-green-600" disabled={!selectedClient || !currentArticle.type || !currentArticle.service}>
                                <Plus className="mr-2 h-4 w-4" /> Ajouter
                            </Button>
                        </div>
                    </div>
                    {currentArticle.type && currentArticle.service && (
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Prix unitaire: **{getPrixUnitaire().toLocaleString()} FCFA**
                        </p>
                    )}
                </Card>

                {/* Articles List & Total */}
                <Card className="p-4 shadow-md border border-gray-200 dark:border-gray-700">
                    <h3 className="mb-4 font-semibold text-lg text-gray-800 dark:text-white">Articles dans la commande ({articles.length})</h3>
                    {articles.length === 0 ? (
                        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                            <FileText className="h-6 w-6 mx-auto mb-2" />
                            Ajoutez des articles pour commencer.
                        </div>
                    ) : (
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
                                        variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 p-2 ml-4"
                                        onClick={() => removeArticle(article.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    <div className="mt-4 border-t border-gray-300 dark:border-gray-600 pt-4">
                        <div className="flex justify-between text-2xl font-bold">
                            <span>TOTAL COMMANDE:</span>
                            <span className="text-blue-600 dark:text-blue-400">{calculateTotal.toLocaleString()} FCFA</span>
                        </div>
                    </div>
                </Card>

                {/* Bouton de Soumission */}
                <Button onClick={handleSubmit} className="w-full bg-blue-600 hover:bg-blue-700 font-semibold text-lg py-3" disabled={articles.length === 0 || !selectedClient}>
                    Confirmer et Créer la Commande
                </Button>
            </Card>
        </div>
    );
}