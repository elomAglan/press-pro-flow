// src/pages/Rapports.tsx
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DollarSign, Calendar, FileText } from "lucide-react";
import { mockCommandes, getTotalCharges } from "@/services/mockData";

export default function Rapports() {
  const [filterDate, setFilterDate] = useState("");

  // Filtrer les commandes par date
  const commandesFiltrees = filterDate
    ? mockCommandes.filter(c => c.dateCreation === filterDate)
    : mockCommandes;

  // Calculs financiers
  const totalChiffreAffaire = commandesFiltrees.reduce((sum, c) => sum + c.montantPaye, 0);
  const totalCharges = getTotalCharges(filterDate);
  const resultatNet = totalChiffreAffaire - totalCharges;

  // Simulation téléchargement PDF
  const handleDownload = () => {
    alert(`Simulation téléchargement PDF - Date: ${filterDate || "Toutes les dates"}`);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <DollarSign className="text-blue-600" /> État Financier
      </h1>

      {/* Filtre par date */}
      <Card className="p-4 flex items-center gap-4 w-64">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="pl-10"
        />
      </Card>

      {/* Totaux financiers */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gradient-primary p-6 text-primary-foreground shadow-glow">
          <p className="text-sm opacity-90">Chiffre d'affaires</p>
          <p className="text-3xl font-bold">{totalChiffreAffaire.toLocaleString()} FCFA</p>
          <Button onClick={handleDownload} className="mt-4 flex items-center gap-2 text-sm text-white hover:underline">
            <FileText className="h-4 w-4" /> Télécharger PDF
          </Button>
        </Card>

        <Card className="bg-gradient-card p-6 shadow-md">
          <p className="text-sm text-muted-foreground">Total Charges</p>
          <p className="text-3xl font-bold">{totalCharges.toLocaleString()} FCFA</p>
          <Button onClick={handleDownload} className="mt-4 flex items-center gap-2 text-sm text-primary hover:underline">
            <FileText className="h-4 w-4" /> Télécharger PDF
          </Button>
        </Card>

        <Card className="bg-gradient-card p-6 shadow-md">
          <p className="text-sm text-muted-foreground">Résultat Net</p>
          <p className="text-3xl font-bold">{resultatNet.toLocaleString()} FCFA</p>
          <Button onClick={handleDownload} className="mt-4 flex items-center gap-2 text-sm text-success hover:underline">
            <FileText className="h-4 w-4" /> Télécharger PDF
          </Button>
        </Card>
      </div>
    </div>
  );
}
