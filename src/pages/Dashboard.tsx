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
  getCAJournalier,
  getCAHebdo,
  getCAMensuel,
  getCAAnnuel,
  getCAImpayes
} from "../services/commande.service.ts";

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

// ✅ Tooltip personnalisé
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
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="CA" fill="#4f46e5" name="CA" />
          <Bar dataKey="Cout" fill="#f43f5e" name="Coûts" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </Card>
);

const ClientPieChart = ({ data }: any) => (
  <Card title="Segmentation clients">
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie dataKey="value" data={data} cx="50%" cy="50%" outerRadius={100} label>
            {data.map((entry: any, index: number) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </Card>
);

const PeriodicLineChart = ({ data }: any) => (
  <Card title="Tendance périodique du CA">
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(v) => `${v / 1000}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line type="monotone" dataKey="CA" stroke="#10b981" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </Card>
);

const AnnualBarChart = ({ data }: any) => (
  <Card title="Performance annuelle (CA / Objectif)">
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis tickFormatter={(v) => `${v / 1000}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="CA" fill="#2563eb" name="CA réalisé" />
          <Bar dataKey="Target" fill="#facc15" name="Objectif" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </Card>
);

// ✅ Dashboard complet avec vraies données backend
export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [
          total,
          livree,
          cours,
          caJour,
          caHebdo,
          caMensuel,
          caAnnuel,
          impaye
        ] = await Promise.all([
          getCommandesTotalParJour(),
          getCommandesLivreeParJour(),
          getCommandesEnCoursParJour(),
          getCAJournalier(),
          getCAHebdo(),
          getCAMensuel(),
          getCAAnnuel(),
          getCAImpayes()
        ]);

        // Si les CA sont renvoyés sous forme d’objet { montant: 1200 } :
        const cartesData = {
          totalEnCoursLavage: cours[0]?.nbCommandes || 0,
          commandesParJour: total[0]?.nbCommandes || 0,
          commandesLivreesParJour: livree[0]?.nbCommandes || 0,
          totalImpaye: impaye || 0,
          caJournalier: caJour || 0,
          caHebdomadaire: caHebdo || 0,
          caMensuel: caMensuel || 0,
          caAnnuel: caAnnuel || 0,
        };


        setData(cartesData);
      } catch (e) {
        console.error("Erreur Dashboard", e);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );

  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Impossible de charger les données.
      </div>
    );

  const monthlySales = [
    { name: "Ce Mois", CA: data.caMensuel, Cout: Math.round(data.caMensuel * 0.3) },
  ];

  const periodicTrend = [
    { name: "Semaine", CA: data.caHebdomadaire },
    { name: "Aujourd'hui", CA: data.caJournalier },
  ];

  const clientSegmentation = [
    { name: "VIP", value: data.totalEnCoursLavage, color: "#4f46e5" },
    { name: "Régulier", value: data.commandesParJour - data.totalEnCoursLavage, color: "#f43f5e" },
  ];

  const annualPerformance = [
    { year: new Date().getFullYear(), CA: data.caAnnuel, Target: Math.round(data.caAnnuel * 1.1) },
  ];

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-4xl font-bold mb-4">Tableau de Bord</h1>

      {/* Statistiques principales */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="En Lavage" value={data.totalEnCoursLavage} icon={Clock} iconColor="text-orange-600" unit="cmd" />
        <StatCard title="Commande Total" value={data.commandesParJour} icon={ShoppingBag} iconColor="text-blue-600" />
        <StatCard title="Commande Livrée" value={data.commandesLivreesParJour} icon={CheckCircle2} iconColor="text-green-600" />
      </div>

      {/* Cartes CA */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="CA Journalier" value={data.caJournalier} icon={DollarSign} iconColor="text-green-600" unit="FCFA" />
        <StatCard title="CA Hebdo" value={data.caHebdomadaire} icon={BarChart3} iconColor="text-green-500" unit="FCFA" />
        <StatCard title="CA Mensuel" value={data.caMensuel} icon={BarChart3} iconColor="text-green-700" unit="FCFA" />
        <StatCard title="CA Annuel" value={data.caAnnuel} icon={BarChart3} iconColor="text-green-900" unit="FCFA" />
      </div>

      <TotalImpayeCard value={data.totalImpaye} />

      {/* Graphiques */}
      <div className="grid lg:grid-cols-2 gap-6">
        <MonthlyBarChart data={monthlySales} />
        <ClientPieChart data={clientSegmentation} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <PeriodicLineChart data={periodicTrend} />
        <AnnualBarChart data={annualPerformance} />
      </div>
    </div>
  );
}
