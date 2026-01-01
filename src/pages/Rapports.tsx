import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  FileText, 
  TrendingUp, 
  Wallet, 
  PieChart,
  Download,
  RefreshCw,
  FileSpreadsheet 
} from "lucide-react";

import { getTotalCharges, getTotalCommandes, getNet } from "@/services/rapport.service";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export default function Rapports() {
  const [charges, setCharges] = useState(0);
  const [commandes, setCommandes] = useState(0);
  const [net, setNet] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const formatNumberManual = (val: number) => {
    if (val === undefined || val === null) return "0";
    return Math.floor(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [totalCharges, totalCommandes, totalNet] = await Promise.all([
        getTotalCharges(),
        getTotalCommandes(),
        getNet()
      ]);
      setCharges(totalCharges);
      setCommandes(totalCommandes);
      setNet(totalNet);
    } catch (error) {
      console.error("Erreur :", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const generatePDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("RAPPORT FINANCIER", 40, 50);
    
    autoTable(doc, {
      startY: 70,
      head: [["DESIGNATION", "MONTANT (FCFA)"]],
      body: [
        ["Chiffre d'affaires", formatNumberManual(commandes)],
        ["Total des charges", formatNumberManual(charges)],
        ["Resultat net", formatNumberManual(net)],
      ],
      headStyles: { fillColor: [37, 99, 235], fontStyle: 'bold' },
      styles: { font: "helvetica", fontSize: 11 },
      columnStyles: { 1: { halign: 'right' } }
    });
    doc.save(`rapport_${new Date().getTime()}.pdf`);
  };

  const generateExcel = () => {
    const data = [
      { "Categorie": "Rapport Financier", "Valeur": "" },
      { "Categorie": "Date d'export", "Valeur": new Date().toLocaleDateString("fr-FR") },
      { "Categorie": "", "Valeur": "" },
      { "Categorie": "Designation", "Valeur": "Montant (FCFA)" },
      { "Categorie": "Chiffre d'affaires", "Valeur": commandes },
      { "Categorie": "Total des charges", "Valeur": charges },
      { "Categorie": "Resultat net", "Valeur": net },
    ];
    const ws = XLSX.utils.json_to_sheet(data, { skipHeader: true });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Etat Financier");
    XLSX.writeFile(wb, `etat_financier_${new Date().getTime()}.xlsx`);
  };

  return (
    // Suppression de h-screen et overflow-hidden pour la fluidité mobile
    <div className="space-y-8 pb-24">
      
      {/* HEADER : Empilé sur mobile, ligne sur PC */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200 dark:shadow-none">
            <PieChart size={24} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 dark:text-white">Rapports & États</h1>
            <p className="text-sm text-gray-500 font-medium italic">Analyse de la santé financière</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={loadData} 
            className="p-3.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-gray-400 hover:text-blue-600 transition-all shadow-sm active:rotate-180 duration-500"
          >
            <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
          </button>
          
          <Button
            onClick={generateExcel}
            className="flex-1 md:flex-none h-12 bg-emerald-600 hover:bg-emerald-700 text-white px-5 rounded-2xl font-black shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <FileSpreadsheet size={18} />
            <span className="text-xs uppercase tracking-widest">Excel</span>
          </Button>

          <Button
            onClick={generatePDF}
            className="flex-1 md:flex-none h-12 bg-red-600 hover:bg-red-700 text-white px-5 rounded-2xl font-black shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Download size={18} />
            <span className="text-xs uppercase tracking-widest">PDF</span>
          </Button>
        </div>
      </div>

      {/* GRILLE DE CARTES : 1 colonne mobile, 3 colonnes PC */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Carte CA */}
        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-blue-600 to-blue-700 p-7 text-white shadow-xl rounded-[2rem]">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase opacity-70 mb-2 tracking-[0.2em]">Chiffre d'affaires</p>
            <p className="text-3xl md:text-4xl font-black">{formatNumberManual(commandes)} <span className="text-xs font-normal">FCFA</span></p>
          </div>
          <TrendingUp className="absolute -right-2 -bottom-2 w-24 h-24 opacity-10 rotate-12" />
        </Card>

        {/* Carte Charges */}
        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-orange-500 to-orange-600 p-7 text-white shadow-xl rounded-[2rem]">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase opacity-70 mb-2 tracking-[0.2em]">Total Charges</p>
            <p className="text-3xl md:text-4xl font-black">{formatNumberManual(charges)} <span className="text-xs font-normal">FCFA</span></p>
          </div>
          <Wallet className="absolute -right-2 -bottom-2 w-24 h-24 opacity-10 rotate-12" />
        </Card>

        {/* Carte Net */}
        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-emerald-500 to-emerald-600 p-7 text-white shadow-xl rounded-[2rem]">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase opacity-70 mb-2 tracking-[0.2em]">Résultat Net</p>
            <p className="text-3xl md:text-4xl font-black">{formatNumberManual(net)} <span className="text-xs font-normal">FCFA</span></p>
          </div>
          <DollarSign className="absolute -right-2 -bottom-2 w-24 h-24 opacity-10 rotate-12" />
        </Card>
      </div>

      {/* RECAPITULATIF : Design propre en liste sur mobile */}
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-6 md:p-10 border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="font-black text-lg mb-8 flex items-center gap-3 text-gray-900 dark:text-white uppercase tracking-tighter">
            <FileText size={22} className="text-blue-600" /> 
            Détails des flux
          </h3>
          
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-l-4 border-blue-600 transition-all hover:translate-x-1">
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1 sm:mb-0">Ventes Totales (+)</span>
              <span className="font-black text-xl text-blue-600">{formatNumberManual(commandes)} FCFA</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-l-4 border-red-500 transition-all hover:translate-x-1">
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1 sm:mb-0">Charges Totales (-)</span>
              <span className="font-black text-xl text-red-500">{formatNumberManual(charges)} FCFA</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800 transition-all">
              <span className="text-sm font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-widest mb-1 sm:mb-0">Bénéfice Réel</span>
              <span className="font-black text-2xl text-emerald-700 dark:text-emerald-400">{formatNumberManual(net)} FCFA</span>
            </div>
          </div>
      </div>
    </div>
  );
}