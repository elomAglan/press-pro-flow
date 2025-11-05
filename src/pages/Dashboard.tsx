import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, Clock, CheckCircle2, BarChart3, AlertTriangle, Loader2 } from "lucide-react";
import {
    BarChart, Bar, PieChart, Pie, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
} from 'recharts';

// --- STRUCTURE DE DONNÉES DU BACKEND (API RESPONSE) ---

// La structure que votre API devrait idéalement retourner
interface DashboardData {
    // Stat Card Data
    totalEnCoursLavage: number;
    commandesParJour: number;
    commandesLivreesParJour: number;
    totalImpaye: number;
    caJournalier: number;
    caHebdomadaire: number;
    caMensuel: number;
    caAnnuel: number;
    
    // Chart Data (Idéalement formaté pour Recharts)
    monthlySales: { name: string; CA: number; Coût: number; }[];
    clientSegmentation: { name: string; value: number; color: string; }[];
    periodicTrend: { name: string; CA: number; }[];
    annualPerformance: { year: number; CA: number; Target: number; }[];
}

// --- MOCK DATA POUR SIMULER LA RÉPONSE API ---
// Ces données seront remplacées par de vrais appels API
const initialMockData: DashboardData = {
    totalEnCoursLavage: 3,
    commandesParJour: 5,
    commandesLivreesParJour: 2,
    totalImpaye: 25000,
    caJournalier: 9000, // Nouvelle donnée basée sur les mocks précédents
    caHebdomadaire: 45000,
    caMensuel: 180000,
    caAnnuel: 2160000,
    
    monthlySales: [
        { name: 'Juil', CA: 220, Coût: 85 },
        { name: 'Août', CA: 180, Coût: 70 },
        { name: 'Sep', CA: 250, Coût: 95 },
        { name: 'Oct', CA: 310, Coût: 120 },
        { name: 'Nov', CA: 350, Coût: 130 },
        { name: 'Déc', CA: 400, Coût: 150 },
    ],
    clientSegmentation: [
        { name: 'Fidèles (A)', value: 40, color: '#3b82f6' }, 
        { name: 'Réguliers (B)', value: 35, color: '#f59e0b' },
        { name: 'Nouveaux (C)', value: 25, color: '#10b981' },
    ],
    periodicTrend: [
        { name: 'S1', CA: 150000 },
        { name: 'S2', CA: 180000 },
        { name: 'S3', CA: 165000 },
        { name: 'S4', CA: 200000 },
        { name: 'S5', CA: 230000 },
        { name: 'S6', CA: 215000 },
        { name: 'S7', CA: 250000 },
        { name: 'S8', CA: 280000 },
    ],
    annualPerformance: [
        { year: 2023, CA: 2.4, Target: 2.5 },
        { year: 2024, CA: 3.0, Target: 3.2 },
        { year: 2025, CA: 3.5, Target: 4.0 },
    ],
};


// --- UTILITY COMPONENTS (Non modifiés) ---

interface CardProps { children: React.ReactNode; className?: string; title?: string; }
const Card: React.FC<CardProps> = ({ children, className = "", title }) => (
    <div className={`rounded-xl bg-white dark:bg-gray-800 shadow-lg p-6 ${className}`}>
        {title && (
            <h2 className="text-xl font-bold mb-4 border-b pb-2 border-gray-100 dark:border-gray-700 text-gray-800 dark:text-white">
                {title}
            </h2>
        )}
        {children}
    </div>
);

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    iconColor: string;
    unit?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, iconColor, unit = "" }) => (
    <Card className="hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
        <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</h3>
            <div className={`p-2 rounded-full ${iconColor} bg-opacity-10`}>
                <Icon className={`w-5 h-5 ${iconColor.replace('text-', 'text-')}`} />
            </div>
        </div>
        <div className="mt-2">
            <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                {typeof value === 'number' ? value.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) : value}
            </span>
            {unit && <span className="ml-2 text-xl font-semibold text-gray-500 dark:text-gray-400">{unit}</span>}
        </div>
    </Card>
);

const TotalImpayeCard: React.FC<{ value: number }> = ({ value }) => (
    <Card className="col-span-full border-2 border-red-300 bg-red-50 dark:bg-gray-700 dark:border-red-700 shadow-lg transition-all duration-300 transform hover:scale-[1.01]">
        <div className="flex items-center justify-between">
            <div className="flex items-center">
                <AlertTriangle className="w-8 h-8 text-red-700 dark:text-red-400 mr-4" />
                <div>
                    <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 uppercase tracking-wider">
                        Total Général des Impayés Clients
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Cette somme représente les commandes facturées mais non entièrement réglées.
                    </p>
                </div>
            </div>
            <div className="text-right">
                <span className="text-5xl font-extrabold text-red-800 dark:text-red-300">
                    {value.toLocaleString("fr-FR", { maximumFractionDigits: 0 })}
                </span>
                <span className="ml-2 text-2xl font-bold text-red-600 dark:text-red-400">FCFA</span>
            </div>
        </div>
    </Card>
);

// --- CHART COMPONENTS (Adaptés pour utiliser les données passées en props) ---

// Helper pour le formatage des Tooltips (affichage FCFA)
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-700 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-md text-sm">
                <p className="font-semibold text-gray-800 dark:text-white">{label}</p>
                {payload.map((p: any, index: number) => (
                    <p key={index} style={{ color: p.color }} className="mt-1">
                        {p.name}: <span className="font-bold">{p.value.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} {p.name.includes("Target") || p.name.includes("CA") ? 'M FCFA' : 'FCFA'}</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// Adaptation du composant pour prendre les données via `props`
const MonthlyBarChart: React.FC<{ data: DashboardData['monthlySales'] }> = ({ data }) => (
    <Card title="Rapport Mensuel (CA vs Coût - k FCFA)">
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis dataKey="name" stroke="#6b7280" className="text-xs dark:stroke-gray-400 dark:text-gray-400" />
                <YAxis stroke="#6b7280" className="text-xs dark:stroke-gray-400 dark:text-gray-400" tickFormatter={(value) => `${value}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="CA" fill="#059669" name="Chiffre d'Affaires" radius={[10, 10, 0, 0]} />
                <Bar dataKey="Coût" fill="#ef4444" name="Coûts Opérationnels" radius={[10, 10, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    </Card>
);

const ClientPieChart: React.FC<{ data: DashboardData['clientSegmentation'] }> = ({ data }) => {
    const PIE_COLORS = data.map(d => d.color);

    return (
        <Card title="Segmentation Clients (Commandes %)">
            <ResponsiveContainer width="100%" height={300}>
                <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={false}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} formatter={(value: number) => `${value}%`} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                </PieChart>
            </ResponsiveContainer>
        </Card>
    );
}

const PeriodicLineChart: React.FC<{ data: DashboardData['periodicTrend'] }> = ({ data }) => (
    <Card title="Rapport Périodique (Tendance CA Hebdomadaire)">
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis dataKey="name" stroke="#6b7280" className="text-xs dark:stroke-gray-400 dark:text-gray-400" />
                <YAxis stroke="#6b7280" className="text-xs dark:stroke-gray-400 dark:text-gray-400" tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                    type="monotone"
                    dataKey="CA"
                    stroke="#8b5cf6" // Violet
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 8 }}
                    name="Chiffre d'Affaires"
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
            </LineChart>
        </ResponsiveContainer>
    </Card>
);

const AnnualBarChart: React.FC<{ data: DashboardData['annualPerformance'] }> = ({ data }) => (
    <Card title="Rapport Annuel (CA vs Objectif - M FCFA)">
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis dataKey="year" stroke="#6b7280" className="text-xs dark:stroke-gray-400 dark:text-gray-400" />
                <YAxis stroke="#6b7280" className="text-xs dark:stroke-gray-400 dark:text-gray-400" tickFormatter={(value) => `${value}M`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="CA" fill="#1d4ed8" name="CA Réalisé" radius={[10, 10, 0, 0]} />
                <Bar dataKey="Target" fill="#facc15" name="Objectif" radius={[10, 10, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    </Card>
);


// --- DASHBOARD COMPONENT ---

// Fonction de simulation pour l'appel API. Remplacez ceci par votre appel `fetch` réel.
const fetchDashboardData = async (): Promise<DashboardData> => {
    // Simule un délai de chargement réseau
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    
    // Remplacez 'return initialMockData' par:
    // const response = await fetch('/api/dashboard/metrics'); 
    // const data = await response.json();
    // return data; 

    return initialMockData; 
};


export default function App() {
    // État pour stocker les données réelles du tableau de bord
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Effect Hook pour appeler l'API lors du montage du composant
    useEffect(() => {
        setIsLoading(true);
        fetchDashboardData()
            .then(fetchedData => {
                setData(fetchedData);
                setError(null);
            })
            .catch(err => {
                console.error("Erreur lors du chargement des données :", err);
                setError("Impossible de charger les données du tableau de bord.");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []); // Le tableau vide [] assure que l'effet ne s'exécute qu'une seule fois au montage.

    const TODAY = "2023-11-05";

    // Affichage de l'état de chargement
    if (isLoading) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-8">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                <p className="ml-4 text-xl font-semibold text-gray-700 dark:text-gray-300">
                    Chargement des données...
                </p>
            </div>
        );
    }

    // Affichage de l'état d'erreur
    if (error) {
        return (
            <div className="min-h-screen bg-red-100 dark:bg-gray-900 flex items-center justify-center p-8">
                <AlertTriangle className="w-10 h-10 text-red-500" />
                <p className="ml-4 text-xl font-semibold text-red-700 dark:text-red-400">
                    {error}
                </p>
            </div>
        );
    }
    
    // Vérification de sécurité (bien que 'error' devrait couvrir cela)
    if (!data) return null;


    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-8 space-y-10 font-sans">
            
            {/* Header */}
            <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    Tableau de Bord Pressing
                </h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 mt-1">
                    Métriques clés et Visualisations (date de référence: {TODAY})
                </p>
            </div>

            {/* --- GRILLE 1: Commandes et Opérations (3 colonnes) --- */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <StatCard
                    title="En Cours de Lavage"
                    value={data.totalEnCoursLavage} // Utilisation des données de l'API
                    icon={Clock}
                    iconColor="text-orange-600"
                    unit="Commandes"
                />

                <StatCard
                    title="Commandes du Jour"
                    value={data.commandesParJour} // Utilisation des données de l'API
                    icon={ShoppingBag}
                    iconColor="text-blue-600"
                    unit="Commandes"
                />

                <StatCard
                    title="Commandes Livrées (Jour)"
                    value={data.commandesLivreesParJour} // Utilisation des données de l'API
                    icon={CheckCircle2}
                    iconColor="text-teal-600"
                    unit="Commandes"
                />
            </div>

            {/* --- GRILLE 2: Chiffre d'Affaires (4 colonnes) --- */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="CA Journalier"
                    value={data.caJournalier} // Utilisation des données de l'API
                    icon={DollarSign}
                    iconColor="text-green-600"
                    unit="FCFA"
                />
                <StatCard
                    title="CA Hebdomadaire (Est.)"
                    value={data.caHebdomadaire} // Utilisation des données de l'API
                    icon={BarChart3}
                    iconColor="text-green-500"
                    unit="FCFA"
                />
                <StatCard
                    title="CA Mensuel (Est.)"
                    value={data.caMensuel} // Utilisation des données de l'API
                    icon={BarChart3}
                    iconColor="text-green-700"
                    unit="FCFA"
                />
                <StatCard
                    title="CA Annuel (Est.)"
                    value={data.caAnnuel} // Utilisation des données de l'API
                    icon={BarChart3}
                    iconColor="text-green-900"
                    unit="FCFA"
                />
            </div>
            
            {/* --- GRILLE 3: Total Impayé (Full-Width) --- */}
            <div className="grid">
                <TotalImpayeCard value={data.totalImpaye} /> {/* Utilisation des données de l'API */}
            </div>

            {/* --- GRILLE 4: Nouveaux Rapports (2 colonnes) --- */}
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white pt-4 border-t border-gray-200 dark:border-gray-700">
                Visualisations des Performances
            </h2>
            
            {/* Passage des données de l'API aux composants de graphiques */}
            <div className="grid gap-6 lg:grid-cols-2">
                <MonthlyBarChart data={data.monthlySales} />
                <ClientPieChart data={data.clientSegmentation} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <PeriodicLineChart data={data.periodicTrend} />
                <AnnualBarChart data={data.annualPerformance} />
            </div>
            
        </div>
    );
}