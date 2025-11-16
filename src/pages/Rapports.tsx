// src/pages/Rapports.tsx
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, FileText } from "lucide-react";
import { mockCommandes, getTotalCharges } from "@/services/mockData";

// JS PDF et AutoTable
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Rapports() {
  // Données mock
  const commandesFiltrees = mockCommandes;

  const totalChiffreAffaire = commandesFiltrees.reduce(
    (sum, c) => sum + c.montantPaye,
    0
  );
  const totalCharges = getTotalCharges();
  const resultatNet = totalChiffreAffaire - totalCharges;

  const generatePDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("État Financier", 14, 20);

    // Date d'exportation
    doc.setFontSize(12);
    doc.text(
      `Date d'exportation : ${new Date().toLocaleDateString("fr-FR")} ${new Date().toLocaleTimeString("fr-FR")}`,
      14,
      28
    );

    // 🔹 Corps du tableau avec chiffres formatés en string avant insertion
    autoTable(doc, {
      startY: 35,
      head: [["Catégorie", "Montant (FCFA)"]] as string[][],
      body: [
        ["Chiffre d'affaires", totalChiffreAffaire.toLocaleString("fr-FR")],
        ["Total des charges", totalCharges.toLocaleString("fr-FR")],
        ["Résultat net", resultatNet.toLocaleString("fr-FR")],
      ],
      styles: { fontSize: 12, cellPadding: 3 },
      headStyles: { fillColor: [54, 162, 235], textColor: 255 },
      columnStyles: {
        1: { halign: "right" }, // aligner Montant à droite
      },
    });

    doc.save(`etat_financier_${new Date().toISOString()}.pdf`);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <DollarSign className="text-blue-600" /> État Financier
      </h1>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-white p-6 shadow-md">
          <p className="text-sm opacity-90">Chiffre d'affaires</p>
          <p className="text-3xl font-bold">
            {totalChiffreAffaire.toLocaleString("fr-FR")} FCFA
          </p>
        </Card>

        <Card className="bg-white p-6 shadow-md">
          <p className="text-sm text-muted-foreground">Total Charges</p>
          <p className="text-3xl font-bold">
            {totalCharges.toLocaleString("fr-FR")} FCFA
          </p>
        </Card>

        <Card className="bg-white p-6 shadow-md">
          <p className="text-sm text-muted-foreground">Résultat Net</p>
          <p className="text-3xl font-bold">
            {resultatNet.toLocaleString("fr-FR")} FCFA
          </p>
        </Card>
      </div>

      <Button
        onClick={generatePDF}
        className="mt-6 flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
      >
        <FileText className="w-4 h-4" />
        Télécharger l’état financier
      </Button>
    </div>
  );
}
