import React, { useEffect, useState } from "react";
import {
  DollarSign, ShoppingBag, Clock, CheckCircle2, BarChart3,
  AlertTriangle, Loader2
} from "lucide-react";

import {
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, LineChart, Line,
  XAxis, YAxis, Tooltip, Legend, CartesianGrid, Cell
} from "recharts";

import {
  getCommandesTotalParJour,
  getCommandesLivreeParJour,
  getCommandesEnCoursParJour,
} from "../services/commande.service.ts";

// ✅ Types
interface DashboardData {
  totalEnCoursLavage: number;
  commandesParJour: number;
  commandesLivreesParJour: number;
  totalImpaye: number;
  caJournalier: number;
  caHebdomadaire: number;
  caMensuel: number;
  caAnnuel: number;

  monthlySales: { name: string; CA: number; Coût: number }[];
  clientSegmentation: { name: string; value: number; color: string }[];
  periodicTrend: { name: string; CA: number }[];
  annualPerformance: { year: number; CA: number; Target: number }[];
}

// ✅ Card générique
const Card = ({ children, className = "", title }: any) => (
  <div className={`rounded-xl bg-white dark:bg-gray-800 shadow-lg p-6 ${className}`}>
    {title && (
      <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
        {title}
      </h2>
    )}
    {children}
  </div>
);

// ✅ StatCard
const StatCard = ({ title, value, icon: Icon, iconColor, unit }: any) => (
  <Card className="border border-gray-200 dark:border-gray-700">
    <div className="flex justify-between items-center">
      <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase">{title}</h3>
      <Icon className={`w-6 h-6 ${iconColor}`} />
    </div>
    <p className="text-3xl font-extrabold mt-3">
      {typeof value === "number" ? value.toLocaleString("fr-FR") : value}
      {unit && <span className="text-lg text-gray-500 ml-1">{unit}</span>}
    </p>
  </Card>
);

// ✅ Impayés
const TotalImpayeCard = ({ value }: { value: number }) => (
  <Card className="border-2 border-red-400 bg-red-50 dark:bg-gray-800 dark:border-red-700">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-10 h-10 text-red-600" />
        <div>
          <h3 className="text-lg font-semibold text-red-700">Total Impayé</h3>
          <p className="text-sm text-gray-600">Commandes non réglées</p>
        </div>
      </div>
      <p className="text-4xl font-extrabold text-red-700">
        {value.toLocaleString("fr-FR")} FCFA
      </p>
    </div>
  </Card>
);

// ✅ Tooltip
const CustomTooltip = ({ active, payload, label }: any) =>
  active && payload ? (
    <div className="p-3 bg-white shadow rounded border text-sm">
      <p className="font-bold">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-gray-800">
          {p.name} : {p.value.toLocaleString("fr-FR")}
        </p>
      ))}
    </div>
  ) : null;

// ✅ Graphiques
const MonthlyBarChart = ({ data }: any) => (
  <Card title="Chiffre d'affaires mensuel">
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="CA" fill="#4f46e5" name="CA" />
        <Bar dataKey="Coût" fill="#f43f5e" name="Coûts" />
      </BarChart>
    </ResponsiveContainer>
  </Card>
);

const ClientPieChart = ({ data }: any) => (
  <Card title="Segmentation clients">
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie dataKey="value" data={data} cx="50%" cy="50%" outerRadius={110} label>
          {data.map((entry: any, index: number) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  </Card>
);

const PeriodicLineChart = ({ data }: any) => (
  <Card title="Tendance périodique du CA">
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(v) => `${v / 1000}k`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line type="monotone" dataKey="CA" stroke="#10b981" strokeWidth={3} />
      </LineChart>
    </ResponsiveContainer>
  </Card>
);

const AnnualBarChart = ({ data }: any) => (
  <Card title="Performance annuelle (CA / Objectif)">
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis tickFormatter={(v) => `${v}M`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="CA" fill="#2563eb" name="CA réalisé" />
        <Bar dataKey="Target" fill="#facc15" name="Objectif" />
      </BarChart>
    </ResponsiveContainer>
  </Card>
);

// ✅ DASHBOARD FINAL
export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // 🔹 Appel des trois endpoints API distincts
        const total = await getCommandesTotalParJour();
        const livree = await getCommandesLivreeParJour();
        const cours = await getCommandesEnCoursParJour();

        // 🔹 Exemple de traitement simplifié pour récupérer le total du jour
        const today = new Date().toISOString().split("T")[0];
        const totalJour = total.find((t: any) => t.dateReception === today)?.nbCommandes || 0;
        const livreeJour = livree.find((t: any) => t.dateReception === today)?.nbCommandes || 0;
        const coursJour = cours.find((t: any) => t.dateReception === today)?.nbCommandes || 0;

        setData({
          totalEnCoursLavage: coursJour,
          commandesParJour: totalJour,
          commandesLivreesParJour: livreeJour,
          totalImpaye: 0, // tu pourras l'ajouter plus tard
          caJournalier: 0,
          caHebdomadaire: 0,
          caMensuel: 0,
          caAnnuel: 0,
          monthlySales: [],
          clientSegmentation: [],
          periodicTrend: [],
          annualPerformance: [],
        });
      } catch (e) {
        console.error("Erreur Dashboard", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Impossible de charger les données.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-4xl font-bold mb-4">Tableau de Bord</h1>

      {/* Statistiques principales */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="En Lavage" value={data.totalEnCoursLavage} icon={Clock} iconColor="text-orange-600" unit="cmd" />
        <StatCard title="Commandes du Jour" value={data.commandesParJour} icon={ShoppingBag} iconColor="text-blue-600" />
        <StatCard title="Livrées Aujourd'hui" value={data.commandesLivreesParJour} icon={CheckCircle2} iconColor="text-green-600" />
      </div>

      {/* Les cartes CA et les graphiques sont gardés */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="CA Journalier" value={data.caJournalier} icon={DollarSign} iconColor="text-green-600" unit="FCFA" />
        <StatCard title="CA Hebdo" value={data.caHebdomadaire} icon={BarChart3} iconColor="text-green-500" unit="FCFA" />
        <StatCard title="CA Mensuel" value={data.caMensuel} icon={BarChart3} iconColor="text-green-700" unit="FCFA" />
        <StatCard title="CA Annuel" value={data.caAnnuel} icon={BarChart3} iconColor="text-green-900" unit="FCFA" />
      </div>

      <TotalImpayeCard value={data.totalImpaye} />

      <div className="grid lg:grid-cols-2 gap-6">
        <MonthlyBarChart data={data.monthlySales} />
        <ClientPieChart data={data.clientSegmentation} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <PeriodicLineChart data={data.periodicTrend} />
        <AnnualBarChart data={data.annualPerformance} />
      </div>
    </div>
  );
}
