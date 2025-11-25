// src/pages/Rapports.tsx
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, FileText } from "lucide-react";

import { getTotalCharges, getTotalCommandes, getNet } from "@/services/rapport.service";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Rapports() {
  const [charges, setCharges] = useState(0);
  const [commandes, setCommandes] = useState(0);
  const [net, setNet] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const totalCharges = await getTotalCharges();
        const totalCommandes = await getTotalCommandes();
        const totalNet = await getNet();

        setCharges(totalCharges);
        setCommandes(totalCommandes);
        setNet(totalNet);
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
      }
    }

    loadData();
  }, []);

  const generatePDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    doc.setFont("helvetica", "normal");

    doc.setFontSize(18);
    doc.text("État", 40, 40);

    doc.setFontSize(12);
    doc.text(
      `Date d'exportation : ${new Date().toLocaleDateString("fr-FR")} ${new Date().toLocaleTimeString("fr-FR")}`,
      40,
      60
    );

    const formatNumber = (num: number) =>
      num.toLocaleString("fr-FR").replace(/\u202f/g, " ");

    autoTable(doc, {
      startY: 80,
      head: [["Catégorie", "Montant (FCFA)"]],
      body: [
        ["Chiffre d'affaires", formatNumber(commandes)],
        ["Total des charges", formatNumber(charges)],
        ["Résultat net", formatNumber(net)],
      ],
      styles: { font: "helvetica", fontStyle: "normal", fontSize: 12, cellPadding: 6 },
      headStyles: { fillColor: [54, 162, 235], textColor: 255 },
      columnStyles: { 1: { halign: "right" } },
    });

    doc.save(`etat_${new Date().toISOString()}.pdf`);
  };

  return (
    <div className="p-6 space-y-6 dark:bg-gray-900 dark:text-gray-100">
      <h1 className="text-3xl font-bold flex items-center gap-2 dark:text-gray-100">
        <DollarSign className="text-blue-600 dark:text-blue-400" /> État
      </h1>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-white dark:bg-gray-800 p-6 shadow-md">
          <p className="text-sm opacity-90 dark:text-gray-300">Chiffre d'affaires</p>
          <p className="text-3xl font-bold dark:text-gray-100">
            {commandes.toLocaleString("fr-FR")} FCFA
          </p>
        </Card>

        <Card className="bg-white dark:bg-gray-800 p-6 shadow-md">
          <p className="text-sm text-muted-foreground dark:text-gray-300">Total Charges</p>
          <p className="text-3xl font-bold dark:text-gray-100">
            {charges.toLocaleString("fr-FR")} FCFA
          </p>
        </Card>

        <Card className="bg-white dark:bg-gray-800 p-6 shadow-md">
          <p className="text-sm text-muted-foreground dark:text-gray-300">Résultat Net</p>
          <p className="text-3xl font-bold dark:text-gray-100">
            {net.toLocaleString("fr-FR")} FCFA
          </p>
        </Card>
      </div>

      <Button
        onClick={generatePDF}
        className="mt-6 flex items-center gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white"
      >
        <FileText className="w-4 h-4" />
        Télécharger l’état
      </Button>
    </div>
  );
}
