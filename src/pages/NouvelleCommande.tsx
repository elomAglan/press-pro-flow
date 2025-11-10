import React, { useState, useCallback, useMemo } from "react";
import { Plus, Trash2, FileText, ShoppingCart, X } from "lucide-react"; 

// --- INTERFACES POUR LES COMPOSANTS SIMULÉS (POUR SATISFAIRE TSX) ---

interface InputProps {
    type?: string;
    value: string | number;
    // FIX: Typage explicite de l'événement de changement pour garantir 'e.target.value' est accessible
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
    placeholder: string;
    className?: string;
    min?: string | number;
    max?: string | number;
    disabled?: boolean;
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; 
    className?: string;
    variant?: "default" | "outline" | "ghost";
    size?: "default" | "sm";
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
}

interface SelectProps {
    value: string;
    // La fonction de changement renvoie uniquement la valeur (string)
    onValueChange: (value: string) => void; 
    children: React.ReactNode;
}

// --- SIMULATION DES COMPOSANTS UI DE BASE (FIXÉS POUR TSX) ---

const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = "" }) => <div className={`rounded-xl border bg-card text-card-foreground shadow ${className}`}>{children}</div>;

const Button: React.FC<ButtonProps> = ({ children, onClick, className = "", variant = "default", size = "default", disabled = false, type = "button", ...props }) => {
    let baseStyle = "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";
    let style = "";
    
    if (variant === "outline") style = "border border-input bg-background hover:bg-accent hover:text-accent-foreground";
    else if (variant === "ghost") style = "hover:bg-accent hover:text-accent-foreground";
    else style = "bg-primary text-primary-foreground hover:bg-primary/90";

    let sizeStyle = "h-10 px-4 py-2";
    if (size === "sm") sizeStyle = "h-9 rounded-md px-3";

    return (
        <button type={type} onClick={onClick} className={`${baseStyle} ${style} ${sizeStyle} ${className}`} disabled={disabled} {...props}>
            {children}
        </button>
    );
};

// FIX: Input component avec typage strict
const Input: React.FC<InputProps> = ({ type = "text", value, onChange, placeholder, className = "", min = undefined, max = undefined, disabled = false }) => (
    <input
        type={type}
        value={value}
        onChange={onChange} // L'événement passé ici est maintenant React.ChangeEvent<HTMLInputElement>
        placeholder={placeholder}
        min={min as string}
        max={max as string}
        className={`flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${className}`}
        disabled={disabled}
    />
);

const Label: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = "" }) => <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}>{children}</label>;

// FIX: Select component avec typage strict
const Select: React.FC<SelectProps> = ({ value, onValueChange, children }) => {
    return (
        <select 
            value={value} 
            // FIX: Typage de l'événement 'e' en React.ChangeEvent<HTMLSelectElement>
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onValueChange(e.target.value)} 
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        >
            {children}
        </select>
    );
};

// Composants helpers pour Select
const SelectTrigger: React.FC<{ children: React.ReactNode, className?: string }> = ({ children }) => <div className="hidden">{children}</div>; 
const SelectContent: React.FC<{ children: React.ReactNode, className?: string }> = ({ children }) => <>{children}</>; 
const SelectItem: React.FC<{ value: string, children: React.ReactNode }> = ({ value, children }) => <option value={value}>{children}</option>;
const SelectValue: React.FC<{ placeholder: string }> = ({ placeholder }) => <option value="" disabled>{placeholder}</option>; 

// --- SIMULATION DES DONNÉES ET TYPES (MISE À JOUR) ---
type StatutCommande = "en_attente" | "en_cours" | "pret" | "livre" | "annule";
type Client = { id: string; nom: string; };
type Tarif = { typeArticle: string; service: string; prix: number; };
type Article = { id: string; type: string; service: string; quantite: number; prixUnitaire: number; };
type Commande = {
    id: string; numero: string; clientId: string; articles: Article[]; total: number; totalNet: number; 
    statut: StatutCommande; statutPaiement: string; montantPaye: number; dateCreation: Date; 
    dateReception: string; dateLivraisonPrevue: string; 
    remise: number;
    typeCommande: "standard" | "express"; expressFee?: number;
};

const allClients: Client[] = [{ id: "C1", nom: "Dupont Jean" }, { id: "C2", nom: "Traoré Aminata" }];
const allTarifs: Tarif[] = [
    { typeArticle: "Chemise", service: "Lavage + Repassage", prix: 1500 },
    { typeArticle: "Chemise", service: "Nettoyage à Sec", prix: 2500 },
    { typeArticle: "Pantalon", service: "Lavage + Repassage", prix: 2000 },
    { typeArticle: "Pantalon", service: "Nettoyage à Sec", prix: 3000 },
    { typeArticle: "Robe", service: "Nettoyage à Sec", prix: 4500 },
];

const generateCommandeNumber = () => `CMD-${Date.now().toString().slice(-6)}`;
const addCommande = (newCommande: Omit<Commande, 'id'>): Commande => {
    console.log("Commande Enregistrée (Simulation):", newCommande);
    return { ...newCommande, id: `ID-${Date.now()}` };
};

// --- LOGIQUE DE CALCUL DE DATE DE LIVRAISON ---
const calculateDeliveryDate = (receptionDateString: string, type: "standard" | "express"): string => {
    if (!receptionDateString) return '';

    const date = new Date(receptionDateString);
    if (isNaN(date.getTime())) return '';

    let daysToAdd = type === 'express' ? 1 : 3;
    date.setDate(date.getDate() + daysToAdd);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

// --- DÉFINITION DES PROPS DU COMPOSANT PRINCIPAL ---
type NouvelleCommandeProps = {
    onCancel?: () => void;
    onSubmit?: (newCommande: Omit<Commande, 'id'>) => any;
    clients?: Client[];
    tarifs?: Tarif[];
}

export default function NouvelleCommande(props: NouvelleCommandeProps = {}) {
    const navigate = (path: string) => console.log(`Navigation simulée vers: ${path}`);

    const clients = props.clients ?? allClients;
    const tarifs = props.tarifs ?? allTarifs;

    // --- ÉTATS DE LA COMMANDE GLOBALE ---
    const [selectedClient, setSelectedClient] = useState("");
    const [dateReception, setDateReception] = useState(new Date().toISOString().split('T')[0]);
    const [typeCommande, setTypeCommande] = useState<"standard" | "express">("standard");
    const [remise, setRemise] = useState<number>(0); 
    const [expressFee, setExpressFee] = useState<number>(0);

    // --- ÉTATS DES ARTICLES ---
    const [articles, setArticles] = useState<Article[]>([]);
    const [currentArticle, setCurrentArticle] = useState({
        type: "", 
        service: "", 
        quantite: 1,
    });
    
    // Date de livraison automatique
    const dateLivraisonPrevue = useMemo(() => {
        return calculateDeliveryDate(dateReception, typeCommande);
    }, [dateReception, typeCommande]);

    const typesLinge = useMemo(() => [...new Set(tarifs.map(t => t.typeArticle))], [tarifs]);
    const servicesLavage = useMemo(() => [...new Set(tarifs.map(t => t.service))], [tarifs]);
    
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

    const totalArticles = useMemo(() => {
        return articles.reduce((sum, article) => sum + (article.prixUnitaire * article.quantite), 0);
    }, [articles]);
    
    const totalBrut = useMemo(() => {
        const total = totalArticles + (typeCommande === 'express' ? expressFee : 0);
        return total;
    }, [totalArticles, typeCommande, expressFee]);
    
    const totalNet = useMemo(() => {
        const net = totalBrut - remise;
        return Math.max(0, net); 
    }, [totalBrut, remise]);
    
    // --- HANDLERS DE MISE À JOUR (Typage automatique grâce aux InputProps/SelectProps) ---

    const handleDateReceptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDateReception(e.target.value);
    };

    const handleExpressFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setExpressFee(parseFloat(e.target.value) || 0);
    };

    const handleRemiseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRemise(parseFloat(e.target.value) || 0);
    };
    
    const handleQuantiteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentArticle({...currentArticle, quantite: parseInt(e.target.value) || 1});
    };
    
    const handleTypeChange = (value: string) => {
        setCurrentArticle({...currentArticle, type: value});
    };
    
    const handleServiceChange = (value: string) => {
        setCurrentArticle({...currentArticle, service: value});
    };
    
    // --- ACTIONS DE COMMANDE ---
    
    const handleCancel = () => {
        if (props.onCancel) return props.onCancel();
        navigate("/commandes");
    }

    const handleSubmit = () => {
        if (!selectedClient || articles.length === 0 || !dateLivraisonPrevue) {
            alert("Veuillez sélectionner un client et ajouter des articles.");
            return;
        }

        const newCommande: Omit<Commande, 'id'> = {
            numero: generateCommandeNumber(),
            clientId: selectedClient,
            articles,
            total: totalBrut, 
            totalNet: totalNet, 
            statut: "en_attente", 
            statutPaiement: "non_paye",
            montantPaye: 0,
            dateCreation: new Date(),
            dateReception: dateReception,
            dateLivraisonPrevue: dateLivraisonPrevue,
            remise: remise,
            typeCommande: typeCommande,
            expressFee: typeCommande === 'express' ? expressFee : 0,
        };

        if (props.onSubmit) {
            props.onSubmit(newCommande);
            return;
        }

        const savedCommande = addCommande(newCommande);
        navigate(`/commandes/${savedCommande.id}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-8 space-y-8 font-sans max-w-4xl mx-auto">
            <div className="flex items-center justify-between border-b pb-4 mb-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
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
                            <Input
                                type="date"
                                placeholder="Date de réception" 
                                value={dateReception}
                                // Utilisation du handler typé
                                onChange={handleDateReceptionChange} 
                                className="pl-3"
                                disabled={articles.length > 0} 
                            />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Livraison prévue: <span className="font-bold text-blue-500">{dateLivraisonPrevue}</span> ({typeCommande === 'express' ? 'J+1 Express' : 'J+3 Standard'})
                        </p>
                    </div>

                    {/* Type de Commande (Standard/Express) */}
                    <div className="space-y-2">
                        <Label>Type de Commande</Label>
                        <Select value={typeCommande} onValueChange={(v: "standard" | "express") => {
                            setTypeCommande(v);
                            if (v === 'standard') setExpressFee(0);
                        }}>
                            <SelectTrigger><SelectValue placeholder="Choisir type" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="standard">Standard (Inclus)</SelectItem>
                                <SelectItem value="express">Express (Coût supplémentaire)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    {/* Input Prix Express (Conditionnel) */}
                    {typeCommande === 'express' && (
                        <div className="space-y-2 md:col-span-2 p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700">
                            <Label className="text-sm font-bold text-yellow-700 dark:text-yellow-300">Prime Commande Express (FCFA)</Label>
                            <Input
                                type="number"
                                min="0"
                                placeholder="Coût Express" 
                                value={expressFee}
                                // Utilisation du handler typé
                                onChange={handleExpressFeeChange}
                                className="text-right"
                            />
                        </div>
                    )}
                </div>

                {/* 2. AJOUT D'ARTICLE */}
                <Card className="p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="mb-4 font-semibold text-lg border-b pb-2 text-gray-800 dark:text-white">Ajouter un Article (Linge & Service)</h3>
                    <div className="grid gap-4 sm:grid-cols-4">
                        {/* Linge (Type) */}
                        <div className="space-y-2 sm:col-span-1">
                            <Label className="text-xs">Type de Linge</Label>
                            <Select value={currentArticle.type} onValueChange={handleTypeChange}>
                                <SelectTrigger><SelectValue placeholder="Linge" /></SelectTrigger>
                                <SelectContent className="z-50">{typesLinge.map(type => (<SelectItem key={type} value={type}>{type}</SelectItem>))}</SelectContent>
                            </Select>
                        </div>
                        {/* Service (Lavage) */}
                        <div className="space-y-2 sm:col-span-1">
                            <Label className="text-xs">Service de Lavage</Label>
                            <Select value={currentArticle.service} onValueChange={handleServiceChange}>
                                <SelectTrigger><SelectValue placeholder="Service" /></SelectTrigger>
                                <SelectContent className="z-50">{servicesLavage.map(service => (<SelectItem key={service} value={service}>{service}</SelectItem>))}</SelectContent>
                            </Select>
                        </div>
                        {/* Quantité */}
                        <div className="space-y-2 sm:col-span-1">
                            <Label className="text-xs">Quantité</Label>
                            <Input
                                type="number"
                                min="1"
                                placeholder="1" 
                                value={currentArticle.quantite}
                                // Utilisation du handler typé
                                onChange={handleQuantiteChange}
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
                        {/* Coût des articles */}
                        <div className="flex justify-between text-lg font-medium text-gray-700 dark:text-gray-300">
                            <span>Total Articles:</span>
                            <span>{totalArticles.toLocaleString()} FCFA</span>
                        </div>

                        {/* Coût Express (si applicable) */}
                        {typeCommande === 'express' && (
                            <div className="flex justify-between text-lg font-medium text-yellow-700 dark:text-yellow-300 border-b border-dashed pb-1">
                                <span>Prime Express:</span>
                                <span>+{expressFee.toLocaleString()} FCFA</span>
                            </div>
                        )}

                        {/* Total Brut */}
                        <div className="flex justify-between text-xl font-bold text-gray-700 dark:text-gray-300">
                            <span>Total Brut:</span>
                            <span>{totalBrut.toLocaleString()} FCFA</span>
                        </div>

                        {/* Remise Input */}
                        <div className="flex items-center justify-between">
                            <Label className="text-lg font-semibold">Remise (FCFA)</Label>
                            <div className="w-1/3">
                                <Input
                                    type="number"
                                    min="0"
                                    max={totalBrut} 
                                    placeholder="0" 
                                    value={remise}
                                    // Utilisation du handler typé
                                    onChange={handleRemiseChange}
                                    className="text-right"
                                />
                            </div>
                        </div>
                        
                        {/* TOTAL NET */}
                        <div className="flex justify-between text-3xl font-extrabold pt-2">
                            <span>TOTAL NET À PAYER:</span>
                            <span className="text-blue-600 dark:text-blue-400">{totalNet.toLocaleString()} FCFA</span>
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