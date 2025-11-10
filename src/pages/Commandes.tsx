import React, { useState, useEffect } from "react";
import { getAllCommandes } from "../services/commande.service.ts";

import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";

import { List, Plus, Search, Calendar, FileText } from "lucide-react";
import NouvelleCommande from "./NouvelleCommande";

export default function Commandes() {
  const [commandes, setCommandes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [currentView, setCurrentView] = useState<"list" | "create">("list");

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getAllCommandes();
        setCommandes(data);
      } catch (e) {
        console.error("Erreur chargement commandes:", e);
      }
    }
    fetchData();
  }, []);

  const filtered = commandes.filter((c) => {
    const matchSearch =
      c.clientNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.article.toLowerCase().includes(searchTerm.toLowerCase());

    const matchDate = !filterDate || c.dateReception === filterDate;

    return matchSearch && matchDate;
  });

  if (currentView === "create") {
    return <NouvelleCommande onCancel={() => setCurrentView("list")} />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <List className="text-blue-600" /> Commandes
        </h1>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => setCurrentView("create")}
        >
          <Plus className="h-4 w-4" /> Nouvelle Commande
        </Button>
      </div>

      {/* Filtres */}
      <Card className="p-4 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher par client ou article..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="relative w-48">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
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
            </tr>
          </thead>

          <tbody>
            {filtered.length > 0 ? (
              filtered.map((c) => (
                <tr key={c.id} className="border-t hover:bg-gray-50 cursor-pointer">
                  <td className="px-4 py-2">{c.id}</td>
                  <td className="px-4 py-2">{c.clientNom}</td>
                  <td className="px-4 py-2">{c.service}</td>
                  <td className="px-4 py-2">{c.qte}</td>
                  <td className="px-4 py-2 text-right">{Number(c.montantNet).toLocaleString()}</td>
                  <td className="px-4 py-2">
                    {c.express ? (
                      <span className="text-red-600 font-semibold">Express</span>
                    ) : (
                      <span className="text-gray-500">Normal</span>
                    )}
                  </td>
                  <td className="px-4 py-2">{c.dateLivraison}</td>
                  <td className="px-4 py-2">
                    <Badge className="bg-blue-200 text-blue-800">{c.statut}</Badge>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-500">
                  Aucune commande trouvée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
