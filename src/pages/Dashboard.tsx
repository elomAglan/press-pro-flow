import React from 'react';
import { DollarSign, ShoppingBag, Users, Clock, CheckCircle2, Package, RefreshCw, BarChart3, TrendingUp } from "lucide-react";

// --- MOCK DATA FOR DEMONSTRATION ---

// Définitions de types simplifiées
interface Article { id: number; nom: string; prix: number; }
interface Commande {
    id: number;
    numero: string;
    clientId: number;
    dateCreation: string;
    total: number;
    montantPaye: number;
    statut: "en_attente" | "en_cours" | "pret" | "livre";
    statutPaiement: "paye" | "partiel" | "non_paye";
    articles: Article[];
}
interface Client { id: number; nom: string; telephone: string; }

const mockArticles: Article[] = [
    { id: 1, nom: "Chemise", prix: 1500 },
    { id: 2, nom: "Pantalon", prix: 2000 },
    { id: 3, nom: "Robe", prix: 3000 },
];

const mockClients: Client[] = [
    { id: 101, nom: "Jean Dupont", telephone: "77 123 45 67" },
    { id: 102, nom: "Marie Lebrun", telephone: "76 987 65 43" },
    { id: 103, nom: "Alpha Diallo", telephone: "78 555 44 33" },
];

const mockCommandes: Commande[] = [
    { id: 1, numero: "CMD-001", clientId: 101, dateCreation: "2023-11-05", total: 5000, montantPaye: 5000, statut: "livre", statutPaiement: "paye", articles: [mockArticles[0], mockArticles[1]] },
    { id: 2, numero: "CMD-002", clientId: 102, dateCreation: "2023-11-05", total: 8000, montantPaye: 4000, statut: "en_cours", statutPaiement: "partiel", articles: [mockArticles[2]] },
    { id: 3, numero: "CMD-003", clientId: 101, dateCreation: "2023-11-04", total: 3000, montantPaye: 0, statut: "pret", statutPaiement: "non_paye", articles: [mockArticles[0], mockArticles[0]] },
    { id: 4, numero: "CMD-004", clientId: 103, dateCreation: "2023-11-03", total: 12000, montantPaye: 12000, statut: "pret", statutPaiement: "paye", articles: [mockArticles[1], mockArticles[2], mockArticles[0]] },
    { id: 5, numero: "CMD-005", clientId: 102, dateCreation: "2023-11-03", total: 4000, montantPaye: 0, statut: "en_attente", statutPaiement: "non_paye", articles: [mockArticles[1]] },
];

const getClientById = (id: number) => mockClients.find(c => c.id === id);


// --- UTILITY COMPONENTS (FOR SINGLE FILE REQUIREMENT) ---

interface CardProps { children: React.ReactNode; className?: string; }
const Card: React.FC<CardProps> = ({ children, className = "" }) => (
    <div className={`rounded-xl bg-white shadow-lg p-6 ${className}`}>
        {children}
    </div>
);

interface BadgeProps { children: React.ReactNode; className?: string; variant?: "default" | "secondary" | "outline" | "destructive"; }
const Badge: React.FC<BadgeProps> = ({ children, className = "", variant = "default" }) => {
    let baseStyle = "px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-full";
    switch (variant) {
        case "secondary": baseStyle += " bg-gray-100 text-gray-800 border border-gray-200"; break;
        case "outline": baseStyle += " text-gray-600 border border-gray-300"; break;
        case "destructive": baseStyle += " bg-red-100 text-red-800 border border-red-200"; break;
        case "default":
        default: baseStyle += " bg-blue-500 text-white shadow-md"; break;
    }
    return <span className={`${baseStyle} ${className}`}>{children}</span>;
};

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    iconColor: string;
    trend?: { value: string; positive: boolean };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, iconColor, trend }) => (
    <Card className="hover:shadow-xl transition-all duration-300 border border-gray-100">
        <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <div className={`p-2 rounded-full ${iconColor} bg-opacity-10`}>
                <Icon className={`w-5 h-5 ${iconColor.replace('text-', 'text-')}`} />
            </div>
        </div>
        <div className="mt-2 flex items-end justify-between">
            <span className="text-3xl font-bold text-gray-900">
                {typeof value === 'number' ? value.toLocaleString("fr-FR") : value}
            </span>
            {trend && (
                <div className={`flex items-center text-sm font-medium ${trend.positive ? 'text-green-500' : 'text-red-500'}`}>
                    <TrendingUp className={`w-4 h-4 mr-1 ${trend.positive ? '' : 'rotate-180'}`} />
                    {trend.value}
                </div>
            )}
        </div>
    </Card>
);

interface ProgressDistributionProps {
    title: string;
    total: number;
    data: { key: string; count: number; percentage: number; colorClass: string; label: string }[];
}

// Nouveau composant pour simuler un diagramme de distribution (barres de progression empilées)
const ProgressDistribution: React.FC<ProgressDistributionProps> = ({ title, total, data }) => (
    <Card className="hover:shadow-xl transition-all duration-300 border border-gray-100 p-6 space-y-4 h-full flex flex-col">
        <h3 className="text-xl font-bold text-gray-800 border-b pb-3">{title}</h3>
        <p className="text-sm text-gray-500">Total : {total} commandes</p>
        
        {/* Progress Bar Container */}
        <div className="flex h-6 rounded-lg overflow-hidden w-full bg-gray-100 shadow-inner">
            {data.map(item => (
                <div 
                    key={item.key}
                    style={{ width: `${item.percentage}%` }}
                    className={`h-full transition-all duration-500 ${item.colorClass}`}
                    title={`${item.label}: ${item.count} (${item.percentage.toFixed(1)}%)`}
                >
                    {/* Afficher le pourcentage sur les grandes sections */}
                    {item.percentage > 10 && (
                        <span className="flex items-center justify-center h-full text-xs font-bold text-white p-1">
                            {item.percentage.toFixed(0)}%
                        </span>
                    )}
                </div>
            ))}
        </div>
        
        {/* Legend */}
        <div className="grid grid-cols-2 gap-3 pt-2">
            {data.map(item => (
                <div key={item.key} className="flex items-center text-sm">
                    <span className={`w-3 h-3 rounded-full mr-2 ${item.colorClass}`}></span>
                    <span className="text-gray-700 font-medium">{item.label}</span>
                    <span className="ml-auto font-bold text-gray-900">{item.count}</span>
                    <span className="text-gray-500 ml-1">({item.percentage.toFixed(0)}%)</span>
                </div>
            ))}
        </div>
    </Card>
);

// --- DASHBOARD COMPONENT ---

export default function App() {
    // 1. Calcul des statistiques principales
    const totalRevenu = mockCommandes.reduce((acc, cmd) => acc + cmd.montantPaye, 0);
    const totalCommandes = mockCommandes.length;
    const totalClients = mockClients.length;
    const commandesEnAttente = mockCommandes.filter(cmd => cmd.statut === "en_attente").length;
    
    // 2. Calcul des statistiques détaillées
    const commandesTerminees = mockCommandes.filter(cmd => cmd.statut === "pret" || cmd.statut === "livre").length;
    const totalArticles = mockCommandes.reduce((acc, cmd) => acc + cmd.articles.length, 0);
    const revenuMoyen = totalCommandes > 0 ? totalRevenu / totalCommandes : 0;
    const commandesEnLavage = mockCommandes.filter(cmd => cmd.statut === "en_cours").length;

    // 3. Calculs et couleurs pour les diagrammes
    const paymentDistribution = mockCommandes.reduce((acc, cmd) => {
        acc[cmd.statutPaiement] = (acc[cmd.statutPaiement] || 0) + 1;
        return acc;
    }, {} as Record<Commande['statutPaiement'], number>);

    const statutDistribution = mockCommandes.reduce((acc, cmd) => {
        acc[cmd.statut] = (acc[cmd.statut] || 0) + 1;
        return acc;
    }, {} as Record<Commande['statut'], number>);

    const paymentColors = {
        'paye': 'bg-green-500',
        'partiel': 'bg-yellow-500',
        'non_paye': 'bg-red-500',
    };

    const statutColors = {
        'livre': 'bg-teal-500',
        'pret': 'bg-blue-500',
        'en_cours': 'bg-indigo-500',
        'en_attente': 'bg-gray-500',
    };
    
    const getDistributionData = (data: Record<string, number>, total: number, colors: Record<string, string>) => {
        return Object.entries(data).map(([key, count]) => ({
            key,
            count,
            percentage: total > 0 ? (count / total) * 100 : 0,
            colorClass: colors[key] || 'bg-gray-300',
            label: key.replace("_", " ").charAt(0).toUpperCase() + key.replace("_", " ").slice(1),
        })).filter(item => item.count > 0);
    };

    const paymentData = getDistributionData(paymentDistribution, totalCommandes, paymentColors);
    const statutData = getDistributionData(statutDistribution, totalCommandes, statutColors);


    // Helper pour le style des badges (comme dans votre original)
    const getStatutBadgeVariant = (statut: Commande['statut']) => {
        switch (statut) {
            case "pret":
            case "livre": return "default";
            case "en_cours": return "secondary";
            case "en_attente": return "outline";
            default: return "secondary";
        }
    };

    const getPaiementBadgeClass = (statut: Commande['statutPaiement']) => {
        switch (statut) {
            case "paye": return "bg-green-100 text-green-700 border border-green-200";
            case "partiel": return "bg-yellow-100 text-yellow-700 border border-yellow-200";
            case "non_paye": return "bg-red-100 text-red-700 border border-red-200";
            default: return "";
        }
    };

    return (
        // Suppression du fond cendre (bg-gray-50)
        <div className="min-h-screen bg-white p-4 sm:p-8 space-y-10 font-sans">
            
            {/* Header */}
            <div className="pb-4 border-b border-gray-200">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Tableau de Bord</h1>
                <p className="text-lg text-gray-500 mt-1">Vue d'ensemble et métriques clés de votre activité Pressing.</p>
            </div>

            {/* --- GRILLE 1 : STATS PRINCIPALES --- */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Revenu Total (FCFA)"
                    value={totalRevenu.toLocaleString("fr-FR")}
                    icon={DollarSign}
                    iconColor="text-green-600"
                    trend={{ value: "+12.5%", positive: true }}
                />
                <StatCard
                    title="Total Commandes"
                    value={totalCommandes}
                    icon={ShoppingBag}
                    iconColor="text-blue-600"
                    trend={{ value: "+8", positive: true }}
                />
                <StatCard
                    title="Total Clients"
                    value={totalClients}
                    icon={Users}
                    iconColor="text-purple-600"
                />
                <StatCard
                    title="Commandes à Démarrer"
                    value={commandesEnAttente}
                    icon={Clock}
                    iconColor="text-yellow-600"
                    trend={{ value: "5 en +", positive: false }}
                />
            </div>

            {/* --- GRILLE 2 : STATS DÉTAILLÉES --- */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Commandes Terminées"
                    value={commandesTerminees}
                    icon={CheckCircle2}
                    iconColor="text-teal-600"
                />
                <StatCard
                    title="Articles Lavés (Total)"
                    value={totalArticles}
                    icon={Package}
                    iconColor="text-indigo-600"
                />
                <StatCard
                    title="Revenu Moyen/Cmd"
                    value={`${revenuMoyen.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} FCFA`}
                    icon={BarChart3}
                    iconColor="text-pink-600"
                />
                <StatCard
                    title="En Cours de Lavage"
                    value={commandesEnLavage}
                    icon={RefreshCw}
                    iconColor="text-orange-600"
                />
            </div>

            {/* --- GRILLE 3 : DIAGRAMMES / DISTRIBUTION (NOUVEAUTÉ) --- */}
            <div className="grid gap-8 lg:grid-cols-2">
                <ProgressDistribution 
                    title="Distribution des Paiements"
                    total={totalCommandes}
                    data={paymentData}
                />
                <ProgressDistribution
                    title="Distribution des Statuts de Commande"
                    total={totalCommandes}
                    data={statutData}
                />
            </div>


            {/* --- COMMANDES RÉCENTES & ACTIONS RAPIDES --- */}
            <div className="grid gap-8 lg:grid-cols-3">
                
                {/* 1. Commandes Récentes (2/3 de la largeur) */}
                <Card className="lg:col-span-2">
                    <div className="mb-6 flex items-center justify-between border-b pb-4">
                        <h2 className="text-xl font-bold text-gray-800">Commandes Récentes</h2>
                        <Badge variant="secondary" className="border-blue-500 text-blue-600 bg-blue-50">
                            {totalCommandes} commandes
                        </Badge>
                    </div>

                    <div className="space-y-4">
                        {mockCommandes.slice(0, 5).map((commande) => {
                            const client = getClientById(commande.clientId);
                            return (
                                <div
                                    key={commande.id}
                                    className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-4 transition-all hover:bg-blue-50 hover:shadow-md"
                                >
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-3">
                                            <p className="font-bold text-gray-800">{commande.numero}</p>
                                            <Badge variant={getStatutBadgeVariant(commande.statut)}>
                                                {commande.statut.replace("_", " ")}
                                            </Badge>
                                            <Badge className={getPaiementBadgeClass(commande.statutPaiement)}>
                                                {commande.statutPaiement === "non_paye" && "Non payé"}
                                                {commande.statutPaiement === "partiel" && "Partiel"}
                                                {commande.statutPaiement === "paye" && "Payé"}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Client: {client?.nom || "Inconnu"}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-green-600">{commande.total.toLocaleString("fr-FR")} FCFA</p>
                                        <p className="text-sm text-gray-400">
                                            Payé: {commande.montantPaye.toLocaleString("fr-FR")} FCFA
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {/* 2. Actions Rapides (1/3 de la largeur) */}
                <div className="space-y-6 lg:col-span-1">
                    <h2 className="text-xl font-bold text-gray-800">Actions Rapides</h2>
                    
                    {/* Nouvelle Commande */}
                    <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-xl hover:shadow-2xl cursor-pointer transform hover:scale-[1.02] transition-all duration-300">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-white/30 p-4">
                                <ShoppingBag className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm opacity-90">Démarrer une</p>
                                <p className="text-xl font-bold">Nouvelle Commande</p>
                            </div>
                        </div>
                    </Card>

                    {/* Commandes Prêtes */}
                    <Card className="bg-white shadow-lg hover:shadow-xl cursor-pointer transition-all duration-300">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-teal-100 p-4 text-teal-600">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Voir les</p>
                                <p className="text-xl font-bold text-gray-800">Commandes Prêtes ({commandesTerminees})</p>
                            </div>
                        </div>
                    </Card>

                    {/* Gérer les Clients */}
                    <Card className="bg-white shadow-lg hover:shadow-xl cursor-pointer transition-all duration-300">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-purple-100 p-4 text-purple-600">
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Ajouter ou Gérer les</p>
                                <p className="text-xl font-bold text-gray-800">Clients</p>
                            </div>
                        </div>
                    </Card>

                </div>
            </div>
        </div>
    );
}
