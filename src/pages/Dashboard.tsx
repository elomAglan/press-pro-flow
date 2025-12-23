import React, { useEffect, useState } from "react";
import {
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  TrendingUp,
  Download,
  Calendar,
} from "lucide-react";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
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
  getCAParMois,
  getCAParSemaine,
  getRepartitionStatuts,
} from "../services/commande.service.ts";

// --- UTILS CORRIGÉ ---
// Cette fonction utilise une expression régulière pour séparer les milliers par un espace standard
// Cela évite les caractères spéciaux (insécables) générés par .toLocaleString()
const formatNumberFr = (value: number) => {
  if (value === undefined || value === null) return "0";
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

// --- COMPOSANTS UI ---
const Card = ({ children, className = "", title, icon: Icon }: any) => (
  <div className={`rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-6 ${className}`}>
    {title && (
      <div className="flex items-center gap-3 mb-6">
        {Icon && <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl"><Icon size={18} className="text-blue-600" /></div>}
        <h2 className="text-sm font-black uppercase tracking-widest text-gray-500">{title}</h2>
      </div>
    )}
    {children}
  </div>
);

const StatCard = ({ title, value, icon: Icon, colorClass, unit }: any) => (
  <Card className="relative overflow-hidden group transition-all hover:shadow-xl hover:shadow-gray-200/50">
    <div className="flex justify-between items-start relative z-10">
      <div className="space-y-1">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{title}</h3>
        <p className="text-3xl font-black text-gray-900 dark:text-white">
          {formatNumberFr(value)}
          {unit && <span className="text-sm font-medium text-gray-400 ml-1 italic">{unit}</span>}
        </p>
      </div>
      <div className={`p-3 rounded-2xl ${colorClass} bg-opacity-10 transition-transform group-hover:scale-110`}>
        <Icon size={24} className={colorClass.replace('bg-', 'text-')} />
      </div>
    </div>
  </Card>
);

const ImpayeAlert = ({ value }: { value: number }) => (
  <div className="relative overflow-hidden bg-white dark:bg-gray-900 border-2 border-red-100 dark:border-red-900/30 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6">
    <div className="flex items-center gap-5">
      <div className="p-4 bg-red-500 rounded-2xl text-white shadow-lg shadow-red-500/20">
        <AlertTriangle size={32} />
      </div>
      <div>
        <h3 className="text-lg font-black text-gray-900 dark:text-white leading-tight">Total des Impayes</h3>
        <p className="text-sm text-gray-500 font-medium">Chiffre d'affaires en attente de recouvrement</p>
      </div>
    </div>
    <div className="text-center md:text-right">
      <p className="text-4xl font-black text-red-600 dark:text-red-500">
        {formatNumberFr(value)} <span className="text-sm font-bold uppercase tracking-widest">FCFA</span>
      </p>
    </div>
  </div>
);

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [graphData, setGraphData] = useState<any>({ caParMois: [], caParSemaine: [], repartitionStatuts: [] });

  const isAdmin = (localStorage.getItem("role") || "").includes("ADMIN");

  useEffect(() => {
    async function loadData() {
      try {
        const [total, livree, cours, caJour, caHebdo, caMensuel, caAnnuel, impaye] = await Promise.all([
          getCommandesTotalParJour(), getCommandesLivreeParJour(), getCommandesEnCoursParJour(),
          getCAJournalier(), getCAHebdo(), getCAMensuel(), getCAAnnuel(), getCAImpayes(),
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

        if (isAdmin) {
          const [caM, caS, repS] = await Promise.all([
            getCAParMois().catch(() => []),
            getCAParSemaine().catch(() => []),
            getRepartitionStatuts().catch(() => []),
          ]);
          setGraphData({ caParMois: caM, caParSemaine: caS, repartitionStatuts: repS });
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    loadData();
  }, [isAdmin]);

  const handleDownloadPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Utilisation de la fonction corrigée pour le PDF
    const safeFormat = (val: number) => formatNumberFr(val);

    // HEADER
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, pageWidth, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("RAPPORT D'ACTIVITE", pageWidth / 2, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const dateStr = new Date().toLocaleDateString("fr-FR");
    doc.text(`Genere le ${dateStr}`, pageWidth / 2, 30, { align: "center" });

    let yPos = 55;
    doc.setTextColor(0, 0, 0);

    // SECTION 1: COMMANDES
    doc.setFillColor(245, 245, 245);
    doc.rect(15, yPos - 5, pageWidth - 30, 10, "F");
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("ACTIVITE COMMANDES", 20, yPos);
    
    yPos += 15;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    const cmdList = [
      ["En cours de lavage", `${safeFormat(data.totalEnCoursLavage)} commandes`],
      ["Recues aujourd'hui", `${safeFormat(data.commandesParJour)} commandes`],
      ["Livrees aujourd'hui", `${safeFormat(data.commandesLivreesParJour)} commandes`]
    ];

    cmdList.forEach(row => {
      doc.text(row[0], 20, yPos);
      doc.text(row[1], pageWidth - 20, yPos, { align: "right" });
      yPos += 8;
    });

    yPos += 10;

    // SECTION 2: FINANCE
    doc.setFillColor(245, 245, 245);
    doc.rect(15, yPos - 5, pageWidth - 30, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.text("CHIFFRE D'AFFAIRES", 20, yPos);
    
    yPos += 15;
    doc.setFont("helvetica", "normal");
    const finances = [
      ["CA Journalier", `${safeFormat(data.caJournalier)} FCFA`],
      ["CA Hebdomadaire", `${safeFormat(data.caHebdomadaire)} FCFA`],
      ["CA Mensuel", `${safeFormat(data.caMensuel)} FCFA`],
      ["CA Annuel", `${safeFormat(data.caAnnuel)} FCFA`]
    ];

    finances.forEach(item => {
      doc.text(item[0], 20, yPos);
      doc.text(item[1], pageWidth - 20, yPos, { align: "right" });
      yPos += 8;
    });

    yPos += 10;

    // SECTION 3: IMPAYES
    if (data.totalImpaye > 0) {
      doc.setFillColor(254, 242, 242);
      doc.setDrawColor(239, 68, 68);
      doc.rect(15, yPos - 5, pageWidth - 30, 18, "FD");
      doc.setTextColor(220, 38, 38);
      doc.setFont("helvetica", "bold");
      doc.text("TOTAL IMPAYES", 20, yPos + 6);
      doc.setFontSize(14);
      doc.text(`${safeFormat(data.totalImpaye)} FCFA`, pageWidth - 20, yPos + 6, { align: "right" });
      doc.setTextColor(0, 0, 0);
      yPos += 30;
    }

    // SECTION 4: TABLEAU EVOLUTION
    if (isAdmin && graphData.caParMois.length > 0) {
      if (yPos > pageHeight - 40) { doc.addPage(); yPos = 20; }
      doc.setFillColor(245, 245, 245);
      doc.rect(15, yPos - 5, pageWidth - 30, 10, "F");
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("EVOLUTION MENSUELLE", 20, yPos);
      yPos += 15;
      
      doc.setFontSize(9);
      graphData.caParMois.forEach((item: any) => {
        if (yPos > pageHeight - 15) { doc.addPage(); yPos = 20; }
        doc.setFont("helvetica", "normal");
        doc.text(item.name, 20, yPos);
        doc.setFont("helvetica", "bold");
        doc.text(`${safeFormat(item.CA)} FCFA`, pageWidth - 20, yPos, { align: "right" });
        yPos += 7;
      });
    }

    doc.save(`Rapport-Activite.pdf`);
  };

  if (loading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Chargement...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Tableau de Bord</h1>
          <p className="text-gray-500 font-medium">Gestion du pressing en temps reel</p>
        </div>
        {isAdmin && (
          <Button onClick={handleDownloadPDF} className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-12 px-6 shadow-lg shadow-blue-500/20 font-bold gap-2">
            <Download size={18} /> Exporter Rapport
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="En Lavage" value={data.totalEnCoursLavage} icon={Clock} colorClass="bg-orange-500" unit="cmd" />
        <StatCard title="Commandes Jour" value={data.commandesParJour} icon={ShoppingBag} colorClass="bg-blue-500" />
        <StatCard title="Livrees Jour" value={data.commandesLivreesParJour} icon={CheckCircle2} colorClass="bg-emerald-500" />
      </div>

      <div className="flex items-center gap-4">
        <TrendingUp className="text-blue-600" size={20} />
        <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">Finance</h2>
        <div className="h-px bg-gray-100 dark:bg-gray-800 flex-1" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="CA Aujourd'hui" value={data.caJournalier} icon={DollarSign} colorClass="bg-emerald-600" unit="FCFA" />
        <StatCard title="CA Semaine" value={data.caHebdomadaire} icon={Calendar} colorClass="bg-indigo-600" unit="FCFA" />
        <StatCard title="CA Mensuel" value={data.caMensuel} icon={TrendingUp} colorClass="bg-blue-600" unit="FCFA" />
      </div>

      <ImpayeAlert value={data.totalImpaye} />

      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card title="Evolution Mensuelle" icon={TrendingUp}>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={graphData.caParMois}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} tickFormatter={(v) => `${v/1000}k`} />
                  <Tooltip cursor={{fill: '#f8fafc'}} />
                  <Bar dataKey="CA" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Statuts Commandes" icon={ShoppingBag}>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={graphData.repartitionStatuts} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    {graphData.repartitionStatuts.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}