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

  // --- FONCTION DE FORMATAGE MANUELLE (ANTI-BUG PDF) ---
  const formatNumberManual = (val: number) => {
    if (val === undefined || val === null) return "0";
    // Utilise une Regex pour insérer un espace standard tous les 3 chiffres
    // Évite l'utilisation de toLocaleString qui génère des espaces insécables invisibles
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

  // --- EXPORT PDF CORRIGÉ ---
  const generatePDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    
    // Utilisation d'une police standard sans accents pour le titre
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
      columnStyles: {
        1: { halign: 'right' } // Aligne les montants à droite
      }
    });
    
    doc.save(`rapport_${new Date().getTime()}.pdf`);
  };

  // --- EXPORT EXCEL ---
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
    <div className="h-screen flex flex-col p-4 md:p-8 space-y-6 bg-white dark:bg-gray-950 overflow-hidden max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="flex-none flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
              <PieChart size={24} />
            </div>
            Rapports & États
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="icon" onClick={loadData} className="rounded-xl">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          
          <Button
            onClick={generateExcel}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95"
          >
            <FileSpreadsheet size={18} />
            <span className="hidden sm:inline">Excel</span>
          </Button>

          <Button
            onClick={generatePDF}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95"
          >
            <Download size={18} />
            <span className="hidden sm:inline">PDF</span>
          </Button>
        </div>
      </div>

      {/* CONTENU SCROLLABLE */}
      <div className="flex-1 overflow-y-auto pr-1">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3 mb-8">
          {/* Carte CA */}
          <Card className="relative overflow-hidden border-none bg-blue-600 p-6 text-white shadow-xl">
            <p className="text-xs font-bold uppercase opacity-80 mb-1">Chiffre d'affaires</p>
            <p className="text-3xl font-black">{formatNumberManual(commandes)} <span className="text-sm font-normal">FCFA</span></p>
            <TrendingUp className="absolute -right-4 -bottom-4 w-20 h-20 opacity-10 rotate-12" />
          </Card>

          {/* Carte Charges */}
          <Card className="relative overflow-hidden border-none bg-orange-500 p-6 text-white shadow-xl">
            <p className="text-xs font-bold uppercase opacity-80 mb-1">Total Charges</p>
            <p className="text-3xl font-black">{formatNumberManual(charges)} <span className="text-sm font-normal">FCFA</span></p>
            <Wallet className="absolute -right-4 -bottom-4 w-20 h-20 opacity-10 rotate-12" />
          </Card>

          {/* Carte Net */}
          <Card className="relative overflow-hidden border-none bg-emerald-500 p-6 text-white shadow-xl">
            <p className="text-xs font-bold uppercase opacity-80 mb-1">Résultat Net</p>
            <p className="text-3xl font-black">{formatNumberManual(net)} <span className="text-sm font-normal">FCFA</span></p>
            <DollarSign className="absolute -right-4 -bottom-4 w-20 h-20 opacity-10 rotate-12" />
          </Card>
        </div>

        {/* Détails Visuels */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <FileText size={18} /> Récapitulatif détaillé
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
                <span>Total des Ventes (+)</span>
                <span className="font-bold text-blue-600">{formatNumberManual(commandes)} FCFA</span>
              </div>
              <div className="flex justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
                <span>Total des Dépenses (-)</span>
                <span className="font-bold text-red-500">{formatNumberManual(charges)} FCFA</span>
              </div>
              <div className="flex justify-between p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                <span className="font-bold text-emerald-800 dark:text-emerald-400">Bénéfice Réel</span>
                <span className="font-black text-emerald-800 dark:text-emerald-400">{formatNumberManual(net)} FCFA</span>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}