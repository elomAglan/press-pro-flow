import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getAllCommandes } from "../services/commande.service";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { List, Plus, Search, Calendar, FileText } from "lucide-react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Commandes() {
  const [commandes, setCommandes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllCommandes();
        setCommandes(data.sort((a, b) => b.id - a.id));
      } catch (err) {
        console.error("Erreur récupération commandes:", err);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return commandes.filter((c) => {
      const matchSearch = (c.clientNom ?? "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchDate = !filterDate || c.dateReception === filterDate;
      const matchStatus = !filterStatus || c.statut === filterStatus;
      return matchSearch && matchDate && matchStatus;
    });
  }, [commandes, searchTerm, filterDate, filterStatus]);

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Commandes Export PDF", 14, 20);

    doc.setFontSize(12);
    doc.text(`Exporté le : ${new Date().toLocaleString()}`, 14, 28);

    if (filterDate) doc.text(`Date filtrée : ${filterDate}`, 14, 36);
    if (filterStatus)
      doc.text(`Statut filtré : ${filterStatus}`, 14, filterDate ? 44 : 36);

    const tableColumn = [
      "ID",
      "Client",
      "Quantité totale",
      "Montant Net",
      "Date Livraison",
      "Statut",
    ];

    const tableRows = filtered.map((c) => [
      c.id,
      c.clientNom ?? "",
      c.articles?.reduce((sum: number, a: any) => sum + a.qte, 0) ?? 0,
      c.montantNetTotal != null ? String(c.montantNetTotal) : "0",
      c.dateLivraison ?? "",
      c.statut ?? "",
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: filterDate || filterStatus ? 50 : 36,
      styles: { fontSize: 10 },
    });

    doc.save(`commandes_${Date.now()}.pdf`);
  };

  const uniqueStatuses = Array.from(
    new Set(commandes.map((c) => c.statut).filter(Boolean))
  );

  return (
    <div className="p-6 space-y-6 dark:bg-gray-900 dark:text-gray-100 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <List className="text-blue-600 dark:text-blue-400" />
          Commandes
        </h1>

        <div className="flex gap-2">
          <Button
            className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white flex items-center gap-2"
            onClick={exportPDF}
          >
            <FileText className="h-4 w-4" /> Exporter PDF
          </Button>

          <Button
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white flex items-center gap-2"
            onClick={() => navigate("/commandes/nouvelle")}
          >
            <Plus className="h-4 w-4" /> Nouvelle Commande
          </Button>
        </div>
      </div>

      <Card className="p-4 flex gap-4 dark:bg-gray-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-300" />
          <Input
            placeholder="Rechercher par client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="relative w-48">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-300" />
          <Input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="pl-10 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-40 rounded-md border dark:bg-gray-700 dark:text-gray-100 px-3"
        >
          <option value="">Tous les statuts</option>
          {uniqueStatuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </Card>

      <Card className="overflow-hidden dark:bg-gray-800">
        <div className="max-h-[500px] overflow-y-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2 text-left dark:text-gray-100">ID</th>
                <th className="px-4 py-2 text-left dark:text-gray-100">Client</th>
                <th className="px-4 py-2 text-left dark:text-gray-100">QT</th>
                <th className="px-4 py-2 text-right dark:text-gray-100">Net</th>
                <th className="px-4 py-2 text-left dark:text-gray-100">Livraison</th>
                <th className="px-4 py-2 text-left dark:text-gray-100">Statut</th>
                <th className="px-4 py-2 text-center dark:text-gray-100">Détails</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length > 0 ? (
                filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="border-t hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-4 py-2">{c.id}</td>
                    <td className="px-4 py-2">{c.clientNom ?? ""}</td>
                    <td className="px-4 py-2">
                      {c.articles?.reduce((sum: number, a: any) => sum + a.qte, 0) ?? 0}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {c.montantNetTotal != null
                        ? c.montantNetTotal.toLocaleString("fr-FR")
                        : "0"}
                    </td>
                    <td className="px-4 py-2">{c.dateLivraison ?? ""}</td>
                    <td className="px-4 py-2">
                      <Badge className="bg-blue-200 dark:bg-blue-700 text-blue-800 dark:text-blue-100">
                        {c.statut ?? ""}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <Button
                        className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 p-1"
                        onClick={() => navigate(`/commandes/${c.id}`)}
                      >
                        <FileText size={16} />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500 dark:text-gray-300">
                    Aucune commande trouvée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}