import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllCommandes } from "../services/commande.service";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { List, Plus, Search, Calendar, FileText, ChevronLeft, ChevronRight } from "lucide-react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// --------------------
// UTILS : Fonction de formatage pour les nombres français pour PDF
// --------------------

/**
 * Formate un nombre en utilisant la locale française (fr-FR), sans décimales.
 * Remplace les espaces par des espaces insécables pour jsPDF.
 */
const formatNumberFr = (value: number) => {
  // Garantit le séparateur de milliers par espace, sans afficher de décimales.
  // Utilisation de replace(/\s/g, '\u00A0') pour éviter l'éclatement des chiffres dans jsPDF.
  return value.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace(/\s/g, '\u00A0');
};

export default function Commandes() {
  const [commandes, setCommandes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Nombre d’éléments par page
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const data = await getAllCommandes();
      setCommandes(data.sort((a, b) => b.id - a.id));
    }
    load();
  }, []);

  const filtered = commandes.filter((c) => {
    const matchSearch =
      c.clientNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.article?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchDate = !filterDate || c.dateReception === filterDate;

    return matchSearch && matchDate;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const displayedCommandes = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calcul du total par page
  const totalQte = displayedCommandes.reduce((sum, c) => sum + Number(c.qte), 0);
  const totalNet = displayedCommandes.reduce((sum, c) => sum + Number(c.montantNet), 0);

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Commandes Export PDF", 14, 20);

    doc.setFontSize(12);
    // 🎯 Correction : Utilisation de toLocaleString avec "fr-FR" pour la date
    doc.text(`Exporté le : ${new Date().toLocaleString("fr-FR")}`, 14, 28);
    if (filterDate) doc.text(`Date filtrée : ${filterDate}`, 14, 36);

    const tableColumn = [
      "ID",
      "Client",
      "Service",
      "Qté",
      "Net (FCFA)",
      "Mode",
      "Livraison",
      "Statut",
    ];

    const tableRows = filtered.map((c) => [
      c.id,
      c.clientNom,
      c.service,
      c.qte,
      // 🎯 Correction : Utilisation de formatNumberFr pour les montants dans le tableau
      formatNumberFr(Number(c.montantNet)),
      c.express ? "Express" : "Normal",
      c.dateLivraison,
      c.statut,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: filterDate ? 42 : 36,
      styles: { fontSize: 10 },
    });

    // Total global en bas du PDF
    const totalGlobalNet = filtered.reduce((sum, c) => sum + Number(c.montantNet), 0);
    // 🎯 Correction : Utilisation de formatNumberFr pour le total global
    doc.text(`Total Net : ${formatNumberFr(totalGlobalNet)} FCFA`, 14, doc.lastAutoTable.finalY + 10);

    doc.save(`commandes_${filterDate || "toutes"}_dates.pdf`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <List className="text-blue-600" /> Commandes
        </h1>

        <div className="flex gap-2">
          <Button
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            onClick={exportPDF}
          >
            <FileText className="h-4 w-4" /> Exporter PDF
          </Button>

          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            onClick={() => navigate("/commandes/nouvelle")}
          >
            <Plus className="h-4 w-4" /> Nouvelle Commande
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <Card className="p-4 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher par client ou article..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>

        <div className="relative w-48">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="date"
            value={filterDate}
            onChange={(e) => {
              setFilterDate(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Tableau */}
      <Card className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Client</th>
              <th className="px-4 py-2 text-left">Service</th>
              <th className="px-4 py-2 text-left">Qté</th>
              <th className="px-4 py-2 text-right">Net</th>
              <th className="px-4 py-2 text-left">Mode</th>
              <th className="px-4 py-2 text-left">Livraison</th>
              <th className="px-4 py-2 text-left">Statut</th>
              <th className="px-4 py-2 text-left">Détails</th>
            </tr>
          </thead>

          <tbody>
            {displayedCommandes.length > 0 ? (
              <>
                {displayedCommandes.map((c) => (
                  <tr key={c.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{c.id}</td>
                    <td className="px-4 py-2">{c.clientNom}</td>
                    <td className="px-4 py-2">{c.service}</td>
                    <td className="px-4 py-2">{c.qte}</td>
                    <td className="px-4 py-2 text-right">
                      {/* Affichage écran standard */}
                      {Number(c.montantNet).toLocaleString("fr-FR")}
                    </td>
                    <td className="px-4 py-2">{c.express ? "Express" : "Normal"}</td>
                    <td className="px-4 py-2">{c.dateLivraison}</td>
                    <td className="px-4 py-2">
                      <Badge className="bg-blue-200 text-blue-800">{c.statut}</Badge>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <Button
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 p-1"
                        onClick={() => navigate(`/commandes/${c.id}`)}
                      >
                        <FileText size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}

                {/* Ligne total par page */}
                <tr className="border-t font-bold bg-gray-50">
                  <td className="px-4 py-2" colSpan={3}>Total cette page</td>
                  <td className="px-4 py-2">{totalQte}</td>
                  <td className="px-4 py-2 text-right">
                    {/* Affichage écran standard */}
                    {totalNet.toLocaleString("fr-FR")}
                  </td>
                  <td colSpan={4}></td>
                </tr>
              </>
            ) : (
              <tr>
                <td colSpan={9} className="py-8 text-center text-gray-500">
                  Aucune commande trouvée
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-end items-center gap-2 mt-4">
            <Button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2"
            >
              <ChevronLeft size={16} />
            </Button>
            <span>
              Page {currentPage} / {totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}