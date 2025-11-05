import React from 'react';
import { DollarSign, ShoppingBag, Clock, CheckCircle2, BarChart3, AlertTriangle } from "lucide-react";

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

const mockCommandes: Commande[] = [
    // Utilisé 2023-11-05 comme "Aujourd'hui"
    { id: 1, numero: "CMD-001", clientId: 101, dateCreation: "2023-11-05", total: 5000, montantPaye: 5000, statut: "livre", statutPaiement: "paye", articles: [{ id: 1, nom: "Chemise", prix: 1500 }] },
    { id: 2, numero: "CMD-002", clientId: 102, dateCreation: "2023-11-05", total: 8000, montantPaye: 4000, statut: "en_cours", statutPaiement: "partiel", articles: [{ id: 2, nom: "Pantalon", prix: 2000 }] },
    { id: 3, numero: "CMD-003", clientId: 101, dateCreation: "2023-11-04", total: 3000, montantPaye: 0, statut: "pret", statutPaiement: "non_paye", articles: [{ id: 3, nom: "Robe", prix: 3000 }] },
    { id: 4, numero: "CMD-004", clientId: 103, dateCreation: "2023-11-03", total: 12000, montantPaye: 12000, statut: "livre", statutPaiement: "paye", articles: [{ id: 1, nom: "Chemise", prix: 1500 }] },
    { id: 5, numero: "CMD-005", clientId: 102, dateCreation: "2023-11-03", total: 4000, montantPaye: 0, statut: "en_attente", statutPaiement: "non_paye", articles: [{ id: 2, nom: "Pantalon", prix: 2000 }] },
    { id: 6, numero: "CMD-006", clientId: 104, dateCreation: "2023-11-04", total: 15000, montantPaye: 1000, statut: "en_cours", statutPaiement: "partiel", articles: [{ id: 4, nom: "Costume", prix: 15000 }] },
];


// --- UTILITY COMPONENTS ---

interface CardProps { children: React.ReactNode; className?: string; }
const Card: React.FC<CardProps> = ({ children, className = "" }) => (
    // DARK MODE: bg-white -> dark:bg-gray-800
    <div className={`rounded-xl bg-white dark:bg-gray-800 shadow-lg p-6 ${className}`}>
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
            {/* DARK MODE: text-gray-500 -> dark:text-gray-400 */}
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</h3>
            <div className={`p-2 rounded-full ${iconColor} bg-opacity-10`}>
                <Icon className={`w-5 h-5 ${iconColor.replace('text-', 'text-')}`} />
            </div>
        </div>
        <div className="mt-2">
            {/* DARK MODE: text-gray-900 -> dark:text-white */}
            <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                {/* Formatting for long sums: use toLocaleString("fr-FR") for thousands separator */}
                {typeof value === 'number' ? value.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) : value}
            </span>
            {/* DARK MODE: text-gray-500 -> dark:text-gray-400 */}
            {unit && <span className="ml-2 text-xl font-semibold text-gray-500 dark:text-gray-400">{unit}</span>}
        </div>
    </Card>
);

// --- COMPONENT DÉDIÉ AU TOTAL IMPAYÉ (Full-Width) - Design SIMPLE ---
const TotalImpayeCard: React.FC<{ value: number }> = ({ value }) => (
    // Style SIMPLE : Couleurs neutres et icône d'alerte maintenue pour la signification
    <Card className="col-span-full border-2 border-blue-300 bg-blue-50 dark:bg-gray-800 dark:border-gray-700 shadow-lg transition-all duration-300 transform hover:scale-[1.01]">
        <div className="flex items-center justify-between">
            <div className="flex items-center">
                {/* Icône maintenue pour la signification, mais de couleur neutre */}
                <AlertTriangle className="w-8 h-8 text-blue-700 dark:text-blue-400 mr-4" />
                <div>
                    <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                        Total Général des Impayés Clients
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Cette somme représente les commandes facturées mais non entièrement réglées.
                    </p>
                </div>
            </div>
            <div className="text-right">
                <span className="text-5xl font-extrabold text-blue-800 dark:text-blue-300">
                    {/* Formatting for long sums */}
                    {value.toLocaleString("fr-FR", { maximumFractionDigits: 0 })}
                </span>
                <span className="ml-2 text-2xl font-bold text-blue-600 dark:text-blue-400">FCFA</span>
            </div>
        </div>
    </Card>
);


// --- DASHBOARD COMPONENT ---

export default function App() {
    // Définir la date du jour pour les calculs (correspond à la dernière date dans les mocks)
    const TODAY = "2023-11-05";

    // 1. Total en cours de lavage
    const totalEnCoursLavage = mockCommandes.filter(cmd => cmd.statut === "en_cours").length;

    // Commandes du jour (2023-11-05)
    const commandesAujourdhui = mockCommandes.filter(cmd => cmd.dateCreation === TODAY);

    // 2. Total des commandes par jour
    const commandesParJour = commandesAujourdhui.length;

    // 3. Commandes livrées par jour
    const commandesLivreesParJour = commandesAujourdhui.filter(cmd => cmd.statut === "livre").length;

    // 4. Total Impayé (calcul de la dette totale client)
    const totalImpaye = mockCommandes.reduce((acc, cmd) => acc + (cmd.total - cmd.montantPaye), 0);
    // Résultat du mock : 25000 FCFA

    // 5, 6, 7, 8. Chiffre d'Affaire (CA)
    // CA Journalier (basé sur l'argent payé pour les commandes du jour)
    const caJournalier = commandesAujourdhui.reduce((acc, cmd) => acc + cmd.montantPaye, 0);

    // Extrapolation (pour avoir des chiffres réalistes dans un mock)
    // Hypothèses: 5 jours ouvrés/semaine, 4 semaines/mois, 12 mois/an
    const caHebdomadaire = caJournalier * 5;
    const caMensuel = caJournalier * 20; // 5 jours * 4 semaines
    const caAnnuel = caMensuel * 12;


    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-8 space-y-10 font-sans">
            
            {/* Header */}
            <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    Dashoard
                </h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 mt-1">
                    Métriques Pressing clés (date de référence: {TODAY})
                </p>
            </div>

            {/* --- GRILLE 1: Commandes et Opérations (3 colonnes pour laisser la place) --- */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <StatCard
                    title="En Cours de Lavage"
                    value={totalEnCoursLavage}
                    icon={Clock}
                    iconColor="text-orange-600"
                    unit="Commandes"
                />

                <StatCard
                    title="Commandes du Jour"
                    value={commandesParJour}
                    icon={ShoppingBag}
                    iconColor="text-blue-600"
                    unit="Commandes"
                />

                <StatCard
                    title="Commandes Livrées (Jour)"
                    value={commandesLivreesParJour}
                    icon={CheckCircle2}
                    iconColor="text-teal-600"
                    unit="Commandes"
                />
            </div>

            {/* --- GRILLE 2: Chiffre d'Affaires (4 colonnes) --- */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="CA Journalier"
                    value={caJournalier}
                    icon={DollarSign}
                    iconColor="text-green-600"
                    unit="FCFA"
                />
                <StatCard
                    title="CA Hebdomadaire (Est.)"
                    value={caHebdomadaire}
                    icon={BarChart3}
                    iconColor="text-green-500"
                    unit="FCFA"
                />
                <StatCard
                    title="CA Mensuel (Est.)"
                    value={caMensuel}
                    icon={BarChart3}
                    iconColor="text-green-700"
                    unit="FCFA"
                />
                <StatCard
                    title="CA Annuel (Est.)"
                    value={caAnnuel}
                    icon={BarChart3}
                    iconColor="text-green-900"
                    unit="FCFA"
                />
            </div>
            
            {/* --- GRILLE 3: Le "1" allongé (Total Impayé) avec le design simple --- */}
            <div className="grid">
                <TotalImpayeCard value={totalImpaye} />
            </div>
            
        </div>
    );
}