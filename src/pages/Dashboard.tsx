import React, { useEffect, useState } from "react";
import {
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import jsPDF from "jspdf";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
} from "recharts";

import {
  getCommandesTotalParJour,
  getCommandesLivreeParJour,
  getCommandesEnCoursParJour,
  getCAJournalier,
  getCAHebdo,
  getCAMensuel,
  getCAAnnuel,
  getCAImpayes,
} from "../services/commande.service.ts";

// --------------------
// UTILS
// --------------------
const formatNumberFr = (value: number) =>
  value
    .toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    .replace(/\s/g, "\u00A0");

// --------------------
// Composants UI
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
// Graphiques pour Admin
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
          impaye,
        ] = await Promise.all([
          getCommandesTotalParJour(),
          getCommandesLivreeParJour(),
          getCommandesEnCoursParJour(),
          getCAJournalier(),
          getCAHebdo(),
          getCAMensuel(),
          getCAAnnuel(),
          getCAImpayes(),
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

  // -----------------------------
  // PDF PROFESSIONNEL
  // -----------------------------
  const handleDownloadPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let yPos = margin;

    // En-tête
    doc.setFillColor(31, 41, 55); // Couleur sombre
    doc.rect(0, 0, pageWidth, 25, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("courier", "bold");
    doc.text("TABLEAU DE BORD", pageWidth / 2, 12, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("courier", "normal");
    const now = new Date();
    const dateStr = now.toLocaleDateString("fr-FR");
    const timeStr = now.toLocaleTimeString("fr-FR");
    doc.text(`Genere le ${dateStr} a ${timeStr}`, 
      pageWidth / 2, 20, { align: "center" });

    yPos = 35;

    // Fonction pour ajouter une section
    const addSection = (title: string) => {
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = margin;
      }
      
      doc.setTextColor(31, 41, 55);
      doc.setFontSize(13);
      doc.setFont("courier", "bold");
      doc.text(title, margin, yPos);
      
      doc.setDrawColor(79, 70, 229);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos + 2, pageWidth - margin, yPos + 2);
      
      yPos += 10;
    };

    // Fonction pour ajouter une ligne
    const addLine = (label: string, value: string, color: number[] = [50, 50, 50]) => {
      if (yPos > pageHeight - 15) {
        doc.addPage();
        yPos = margin;
      }
      
      doc.setTextColor(color[0], color[1], color[2]);
      doc.setFontSize(11);
      doc.setFont("courier", "normal");
      doc.text(label, margin + 5, yPos);
      
      doc.setFont("courier", "bold");
      doc.text(value, pageWidth - margin - 10, yPos, { align: "right" });
      
      yPos += 8;
    };

    // Section Commandes
    addSection("COMMANDES");
    addLine("En lavage aujourd'hui", `${data.totalEnCoursLavage} commandes`, [241, 89, 35]);
    addLine("Commandes du jour", `${data.commandesParJour} commandes`, [37, 99, 235]);
    addLine("Livrees aujourd'hui", `${data.commandesLivreesParJour} commandes`, [34, 197, 94]);

    yPos += 3;

    // Section Chiffre d'affaires
    addSection("CHIFFRE D'AFFAIRES");
    addLine("CA Journalier", `${formatNumberFr(data.caJournalier)} FCFA`, [34, 197, 94]);
    addLine("CA Hebdomadaire", `${formatNumberFr(data.caHebdomadaire)} FCFA`, [34, 197, 94]);
    addLine("CA Mensuel", `${formatNumberFr(data.caMensuel)} FCFA`, [34, 197, 94]);
    if (isAdmin) {
      addLine("CA Annuel", `${formatNumberFr(data.caAnnuel)} FCFA`, [37, 99, 235]);
    }

    yPos += 3;

    // Section Impayés
    addSection("IMPAYES");
    doc.setTextColor(220, 38, 38);
    doc.setFontSize(12);
    doc.setFont("courier", "bold");
    doc.text(`Total Impaye: ${formatNumberFr(data.totalImpaye)} FCFA`, margin + 5, yPos);
    doc.setDrawColor(220, 38, 38);
    doc.setLineWidth(1);
    doc.rect(margin, yPos - 4, pageWidth - 2 * margin, 8, "S");

    yPos += 15;

    // Pied de page
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.setFont("courier", "normal");
    doc.text("Confidentiel - Reserve au personnel autorise", pageWidth / 2, pageHeight - 5, { align: "center" });

    doc.save("Tableau-de-bord.pdf");
  };

  // Données graphiques admin
  const monthlySales = [{ name: "Mois", CA: data.caMensuel, Cout: Math.round(data.caMensuel * 0.3) }];
  const periodicTrend = [{ name: "Semaine", CA: data.caHebdomadaire }, { name: "Aujourd'hui", CA: data.caJournalier }];
  const clientSegmentation = [
    { name: "VIP", value: data.totalEnCoursLavage, color: "#4f46e5" },
    { name: "Régulier", value: data.commandesParJour - data.totalEnCoursLavage, color: "#f43f5e" },
  ];
  const annualPerformance = [{ year: new Date().getFullYear(), CA: data.caAnnuel, Target: Math.round(data.caAnnuel * 1.1) }];

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold mb-4">Tableau de Bord</h1>
        {isAdmin && (
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Télécharger PDF
          </button>
        )}
      </div>

      {/* Commandes */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="En Lavage Aujourd'hui"
          value={data.totalEnCoursLavage}
          icon={Clock}
          iconColor="text-orange-600"
          unit="cmd"
        />
        <StatCard
          title="Commandes du Jour"
          value={data.commandesParJour}
          icon={ShoppingBag}
          iconColor="text-blue-600"
        />
        <StatCard
          title="Livrées Aujourd'hui"
          value={data.commandesLivreesParJour}
          icon={CheckCircle2}
          iconColor="text-green-600"
        />
      </div>

      {/* CA Journalier et Hebdomadaire pour tous */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        <StatCard
          title="CA Journalier"
          value={data.caHebdomadaire}
          icon={DollarSign}
          iconColor="text-green-600"
          unit="FCFA"
        />
        <StatCard
          title="CA Hebdomadaire"
          value={data.caJournalier}
          icon={DollarSign}
          iconColor="text-green-500"
          unit="FCFA"
        />
        {isAdmin && (
          <StatCard
            title="CA Mensuel"
            value={data.caMensuel}
            icon={DollarSign}
            iconColor="text-green-700"
            unit="FCFA"
          />
        )}
      </div>

      {/* Impayés après les cartes */}
      <TotalImpayeCard value={data.totalImpaye} />

      {/* Graphiques visibles uniquement pour ADMIN */}
      {isAdmin && (
        <>
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