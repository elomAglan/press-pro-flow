import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
// Imports UI
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, FileText, ShoppingCart, X, Calendar, Factory } from "lucide-react"; 

// 🚨 VÉRIFICATION DE L'IMPORTATION: Assurez-vous d'importer les types et fonctions
// NOTE: J'utilise les types et données simulées définies ci-dessus (et qui devraient exister dans Commandes.utils)
import { 
    allClients, 
    allTarifs, 
    generateCommandeNumber, 
    addCommande, // Fonction d'ajout simulée
    Commande, 
    Article, 
    StatutCommande
} from "./Commandes.utils"; 

// Simulation des données supplémentaires (à importer depuis Commandes.utils dans la réalité)
const mockPressings: { id: string; nom: string; }[] = [
    { id: "P1", nom: "Pressing Central" },
    { id: "P2", nom: "Pressing Express" },
    { id: "P3", nom: "Pressing Quartier" },
];

// --- DÉFINITION DES PROPS (Nettoyées pour la clarté) ---
type NouvelleCommandeProps = {
    onCancel?: () => void;
    onSubmit?: (newCommande: Omit<Commande, 'id'>) => any;
    clients?: any[];
    tarifs?: any[];
}

export default function NouvelleCommande(props: NouvelleCommandeProps = {}) {
    const navigate = useNavigate();

    // Accès aux données
    const clients = props.clients ?? allClients;
    const tarifs = props.tarifs ?? allTarifs;
    const pressings = mockPressings; // Utilisation des données simulées

    // --- ÉTATS DE LA COMMANDE GLOBALE ---
    const [selectedClient, setSelectedClient] = useState("");
    const [dateReception, setDateReception] = useState(new Date().toISOString().split('T')[0]); // Aujourd'hui
    const [dateLivraisonPrevue, setDateLivraisonPrevue] = useState('');
    const [typeCommande, setTypeCommande] = useState<"standard" | "express">("standard");
    const [selectedPressing, setSelectedPressing] = useState("");
    const [statut, setStatut] = useState<StatutCommande>("en_attente");
    const [remise, setRemise] = useState<number>(0); // Remise en FCFA (ou % si vous préférez)
    const [typeLavage, setTypeLavage] = useState(""); // Type de lavage général de la commande (ex: Nettoyage à Sec, Lavage + Repassage)
    
    // --- ÉTATS DES ARTICLES ---
    const [articles, setArticles] = useState<Article[]>([]);
    const [currentArticle, setCurrentArticle] = useState({
        type: "", // Le linge (Chemise, Pantalon, etc.)
        service: "", // Le type de lavage spécifique (Nettoyage à sec, Lavage seul, etc.)
        quantite: 1,
    });

    // Types et Services disponibles
    const typesLinge = useMemo(() => [...new Set(tarifs.map(t => t.typeArticle))], [tarifs]);
    const servicesLavage = useMemo(() => [...new Set(tarifs.map(t => t.service))], [tarifs]);
    
    // Logique de prix et calculs
    const getPrixUnitaire = useCallback(() => {
        const tarif = tarifs.find(
            t => t.typeArticle === currentArticle.type && t.service === currentArticle.service
        );
        return tarif?.prix || 0;
    }, [currentArticle.type, currentArticle.service, tarifs]);

    const addArticle = () => {
        if (!selectedClient || !currentArticle.type || !currentArticle.service || currentArticle.quantite <= 0) {
            console.error("Veuillez remplir les champs d'article correctement.");
            return;
        }

        const newArticle: Article = {
            id: `a${articles.length + 1}-${Date.now()}`,
            ...currentArticle,
            prixUnitaire: getPrixUnitaire(),
        };

        setArticles([...articles, newArticle]);
        setCurrentArticle({ type: "", service: "", quantite: 1 }); 
    };

    const removeArticle = (id: string) => {
        setArticles(articles.filter(a => a.id !== id));
    };

    const totalBrut = useMemo(() => {
        return articles.reduce((sum, article) => sum + (article.prixUnitaire * article.quantite), 0);
    }, [articles]);

    const totalNet = useMemo(() => {
        const net = totalBrut - remise;
        return Math.max(0, net); // Le total ne doit pas être négatif
    }, [totalBrut, remise]);
    
    // --- ACTIONS DE COMMANDE ---
    
    const handleCancel = () => {
        if (props.onCancel) return props.onCancel();
        navigate("/commandes");
    }

    const handleSubmit = () => {
        if (!selectedClient || articles.length === 0 || !dateLivraisonPrevue || !selectedPressing) {
            alert("Veuillez sélectionner un client, ajouter des articles, choisir un pressing et définir une date de livraison.");
            return;
        }

        const newCommande: Omit<Commande, 'id'> = {
            numero: generateCommandeNumber(),
            clientId: selectedClient,
            articles,
            total: totalBrut, // Le total brut est enregistré dans `total`
            totalNet: totalNet, // Le total final est enregistré dans `totalNet`
            statut: statut, 
            statutPaiement: "non_paye",
            montantPaye: 0,
            dateCreation: new Date(),
            dateReception: dateReception,
            dateLivraisonPrevue: dateLivraisonPrevue,
            pressingId: selectedPressing,
            remise: remise,
        };

        if (props.onSubmit) {
            props.onSubmit(newCommande);
            return;
        }

        const savedCommande = addCommande(newCommande);
        navigate(`/commandes/${savedCommande.id}`);
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-8 space-y-8 font-sans max-w-4xl mx-auto">
            <div className="flex items-center justify-between border-b pb-4 mb-6">
                <h1 className="text-4xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                    <ShoppingCart className="h-7 w-7 text-blue-600" /> Nouvelle Commande 📝
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
                
                {/* 1. INFORMATIONS GÉNÉRALES ET CLIENT */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Client */}
                    <div className="space-y-2">
                        <Label>Client</Label>
                        <Select value={selectedClient} onValueChange={setSelectedClient}>
                            <SelectTrigger className="w-full"><SelectValue placeholder="Sélectionner un client" /></SelectTrigger>
                            <SelectContent>
                                {clients.map(client => (
                                    <SelectItem key={client.id} value={client.id}>
                                        {client.nom}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date de Réception */}
                    <div className="space-y-2">
                        <Label>Date de Réception</Label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                            <Input
                                type="date"
                                value={dateReception}
                                onChange={(e) => setDateReception(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Type de Commande (Standard/Express) */}
                    <div className="space-y-2">
                        <Label>Type de Commande</Label>
                        <Select value={typeCommande} onValueChange={(v: "standard" | "express") => setTypeCommande(v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="standard">Standard</SelectItem>
                                <SelectItem value="express">Express (Urgent)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date de Livraison Prévue */}
                    <div className="space-y-2">
                        <Label>Date de Livraison Prévue</Label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                            <Input
                                type="date"
                                value={dateLivraisonPrevue}
                                onChange={(e) => setDateLivraisonPrevue(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Sélection du Pressing */}
                    <div className="space-y-2">
                        <Label>Pressing/Atelier</Label>
                        <div className="relative">
                            <Factory className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                            <Select value={selectedPressing} onValueChange={setSelectedPressing}>
                                <SelectTrigger className="w-full pl-10"><SelectValue placeholder="Sélectionner l'atelier" /></SelectTrigger>
                                <SelectContent>
                                    {pressings.map(p => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.nom}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Statut Initial */}
                    <div className="space-y-2">
                        <Label>Statut Initial</Label>
                        <Select value={statut} onValueChange={(v: StatutCommande) => setStatut(v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {/* Permettre de définir "En attente" ou "En cours" à la création */}
                                <SelectItem value="en_attente">En Attente</SelectItem>
                                <SelectItem value="en_cours">En Cours de Traitement</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* 2. AJOUT D'ARTICLE (Utilisation de TypeLinge et ServiceLavage pour plus de clarté) */}
                <Card className="p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="mb-4 font-semibold text-lg border-b pb-2 text-gray-800 dark:text-white">Ajouter un Article (Linge & Service)</h3>
                    <div className="grid gap-4 sm:grid-cols-4">
                        {/* Linge (Type) */}
                        <div className="space-y-2 sm:col-span-1">
                            <Label className="text-xs">Type de Linge</Label>
                            <Select value={currentArticle.type} onValueChange={(v) => setCurrentArticle({...currentArticle, type: v})}>
                                <SelectTrigger><SelectValue placeholder="Linge" /></SelectTrigger>
                                <SelectContent>{typesLinge.map(type => (<SelectItem key={type} value={type}>{type}</SelectItem>))}</SelectContent>
                            </Select>
                        </div>
                        {/* Service (Lavage) */}
                        <div className="space-y-2 sm:col-span-1">
                            <Label className="text-xs">Service de Lavage</Label>
                            <Select value={currentArticle.service} onValueChange={(v) => setCurrentArticle({...currentArticle, service: v})}>
                                <SelectTrigger><SelectValue placeholder="Service" /></SelectTrigger>
                                <SelectContent>{servicesLavage.map(service => (<SelectItem key={service} value={service}>{service}</SelectItem>))}</SelectContent>
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
                            <Button type="button" onClick={addArticle} className="w-full bg-green-500 hover:bg-green-600" disabled={!currentArticle.type || !currentArticle.service}>
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

                {/* 3. RÉCAPITULATIF & TOTAL */}
                <Card className="p-4 shadow-md border border-gray-200 dark:border-gray-700">
                    <h3 className="mb-4 font-semibold text-lg text-gray-800 dark:text-white">Articles ({articles.length})</h3>
                    {articles.length === 0 ? (
                        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                            <FileText className="h-6 w-6 mx-auto mb-2" />
                            Liste des articles vide.
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                            {articles.map(article => (
                                <div key={article.id} className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-700 p-3 border border-gray-200 dark:border-gray-600">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 dark:text-white truncate">
                                            {article.type} ({article.service})
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
                    
                    {/* Totaux et Remise */}
                    <div className="mt-6 border-t border-gray-300 dark:border-gray-600 pt-4 space-y-2">
                        {/* Remise Input */}
                        <div className="flex items-center justify-between">
                            <Label className="text-lg font-semibold">Remise (FCFA)</Label>
                            <div className="w-1/3">
                                <Input
                                    type="number"
                                    min="0"
                                    value={remise}
                                    onChange={(e) => setRemise(parseFloat(e.target.value) || 0)}
                                    className="text-right"
                                />
                            </div>
                        </div>

                        <div className="flex justify-between text-xl font-bold text-gray-700 dark:text-gray-300">
                            <span>Total Brut:</span>
                            <span>{totalBrut.toLocaleString()} FCFA</span>
                        </div>
                        
                        <div className="flex justify-between text-3xl font-extrabold pt-2">
                            <span>TOTAL NET:</span>
                            <span className="text-blue-600 dark:text-blue-400">{totalNet.toLocaleString()} FCFA</span>
                        </div>
                    </div>
                </Card>

                {/* Bouton de Soumission */}
                <Button onClick={handleSubmit} className="w-full bg-blue-600 hover:bg-blue-700 font-semibold text-lg py-3" disabled={articles.length === 0 || !selectedClient || totalNet === 0}>
                    Confirmer et Créer la Commande
                </Button>
            </Card>
        </div>
    );
}