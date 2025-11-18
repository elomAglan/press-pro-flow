import React, { useEffect, useState } from "react";
import {
  DollarSign, ShoppingBag, Clock, CheckCircle2, AlertTriangle, Loader2
} from "lucide-react";
import jsPDF from "jspdf";

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

// --------------------
// UTILS : Nouvelle fonction de formatage pour les nombres français
// --------------------

/**
 * Formate un nombre en utilisant la locale française (fr-FR), sans décimales.
 */
const formatNumberFr = (value: number) => {
  // Garantit le séparateur de milliers par espace, sans afficher de décimales.
  // Utilise replace(/\s/g, '\u00A0') pour remplacer les espaces par des espaces insécables
  // afin d'éviter l'éclatement des chiffres dans jsPDF.
  return value.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace(/\s/g, '\u00A0');
};

// --------------------
// Composants réutilisables
// --------------------
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

const StatCard = ({ title, value, icon: Icon, iconColor, unit }: any) => (
  <Card className="border border-gray-200 dark:border-gray-700">
    <div className="flex justify-between items-center">
      <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase">{title}</h3>
      <Icon className={`w-6 h-6 ${iconColor}`} />
    </div>
    <p className="text-3xl font-extrabold mt-3">
      {/* Utilisation du formatage FR pour l'affichage écran */}
      {typeof value === "number" ? value.toLocaleString("fr-FR") : value} 
      {unit && <span className="text-lg text-gray-500 ml-1">{unit}</span>}
    </p>
  </Card>
);

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

// --------------------
// Graphiques
// --------------------
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

// --------------------
// Dashboard Principal
// --------------------
export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const role = localStorage.getItem("role") || "COMPTOIR";
  const isAdmin = role === "ADMIN" || role === "ADMINISTRATEUR";

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

        setData({
          totalEnCoursLavage: cours?.nbCommandes || 0,
          commandesParJour: total?.nbCommandes || 0,
          commandesLivreesParJour: livree?.nbCommandes || 0,
          totalImpaye: impaye || 0,
          caJournalier: caJour || 0,
          caHebdomadaire: caHebdo || 0,
          caMensuel: caMensuel || 0,
          caAnnuel: caAnnuel || 0,
        });
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

  const monthlySales = [{ name: "Mois", CA: data.caMensuel, Cout: Math.round(data.caMensuel * 0.3) }];
  const periodicTrend = [{ name: "Semaine", CA: data.caHebdomadaire }, { name: "Aujourd'hui", CA: data.caJournalier }];
  const clientSegmentation = [
    { name: "VIP", value: data.totalEnCoursLavage, color: "#4f46e5" },
    { name: "Régulier", value: data.commandesParJour - data.totalEnCoursLavage, color: "#f43f5e" },
  ];
  const annualPerformance = [{ year: new Date().getFullYear(), CA: data.caAnnuel, Target: Math.round(data.caAnnuel * 1.1) }];

  // ✅ Télécharger PDF avec encodage correct
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // En-tête
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("TABLEAU DE BORD", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const dateStr = new Date().toLocaleDateString("fr-FR", { 
      day: "2-digit", 
      month: "long", 
      year: "numeric" 
    });
    doc.text("Date: " + dateStr, 105, 28, { align: "center" });
    
    // Ligne de séparation
    doc.setLineWidth(0.5);
    doc.line(20, 32, 190, 32);
    
    let yPos = 45;
    
    // Section Commandes
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("COMMANDES", 20, yPos);
    yPos += 8;
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("En Lavage Aujourd'hui : " + data.totalEnCoursLavage + " commandes", 25, yPos);
    yPos += 7;
    doc.text("Commandes du Jour : " + data.commandesParJour + " commandes", 25, yPos);
    yPos += 7;
    doc.text("Livrées Aujourd'hui : " + data.commandesLivreesParJour + " commandes", 25, yPos);
    yPos += 12;

    // Section Chiffre d'Affaires
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("CHIFFRE D'AFFAIRES", 20, yPos);
    yPos += 8;
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    
    // CORRECTION APPLIQUÉE ICI : Utilisation de formatNumberFr pour la compacticité
    doc.text("CA Journalier : " + formatNumberFr(data.caJournalier) + " FCFA", 25, yPos);
    yPos += 7;
    doc.text("CA Hebdomadaire : " + formatNumberFr(data.caHebdomadaire) + " FCFA", 25, yPos);
    yPos += 7;
    doc.text("CA Mensuel : " + formatNumberFr(data.caMensuel) + " FCFA", 25, yPos);
    yPos += 7;
    doc.text("CA Annuel : " + formatNumberFr(data.caAnnuel) + " FCFA", 25, yPos);
    yPos += 12;

    // Section Impayés (si admin)
    if (isAdmin) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(220, 38, 38); // Rouge
      doc.text("IMPAYÉS", 20, yPos);
      yPos += 8;
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      
      // CORRECTION APPLIQUÉE ICI : Utilisation de formatNumberFr pour la compacticité
      doc.text("Total Impayé : " + formatNumberFr(data.totalImpaye) + " FCFA", 25, yPos);
      doc.setTextColor(0, 0, 0); // Retour au noir
    }

    // Pied de page
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text("Document généré automatiquement", 105, 280, { align: "center" });

    // Télécharger
    const filename = "Dashboard_" + new Date().toISOString().slice(0, 10) + ".pdf";
    doc.save(filename);
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold mb-4">Tableau de Bord</h1>
        <button
          onClick={handleDownloadPDF}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Télécharger PDF
        </button>
      </div>

      {/* Statistiques principales */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="En Lavage Aujourd'hui" value={data.totalEnCoursLavage} icon={Clock} iconColor="text-orange-600" unit="cmd" />
        <StatCard title="Commandes du Jour" value={data.commandesParJour} icon={ShoppingBag} iconColor="text-blue-600" />
        <StatCard title="Livrées Aujourd'hui" value={data.commandesLivreesParJour} icon={CheckCircle2} iconColor="text-green-600" />
      </div>

      {/* CA visible par Admin et Comptoir */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="CA Journalier" value={data.caJournalier} icon={DollarSign} iconColor="text-green-600" unit="FCFA" />
        <StatCard title="CA Hebdomadaire" value={data.caHebdomadaire} icon={DollarSign} iconColor="text-green-500" unit="FCFA" />
        <StatCard title="CA Mensuel" value={data.caMensuel} icon={DollarSign} iconColor="text-green-700" unit="FCFA" />
      </div>

      {isAdmin && (
        <>
          <TotalImpayeCard value={data.totalImpaye} />
          <div className="grid lg:grid-cols-2 gap-6">
            <MonthlyBarChart data={monthlySales} />
            <ClientPieChart data={clientSegmentation} />
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <PeriodicLineChart data={periodicTrend} />
            <AnnualBarChart data={annualPerformance} />
          </div>
        </>
      )}
    </div>
  );
}