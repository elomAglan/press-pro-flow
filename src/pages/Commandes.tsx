import React, { useState, useEffect } from "react";
import {
  getAllCommandes,
  getCommandeById,
  updateStatutCommande, // ✅ on l’importe ici
} from "../services/commande.service.ts";

import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";

import {
  List,
  Plus,
  Search,
  Calendar,
  FileText,
  ArrowLeft,
} from "lucide-react";

import NouvelleCommande from "./NouvelleCommande";

export default function Commandes() {
  const [commandes, setCommandes] = useState<any[]>([]);
  const [selectedCommande, setSelectedCommande] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [currentView, setCurrentView] = useState<"list" | "create" | "details">(
    "list"
  );

  // Charger les commandes
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getAllCommandes();
        const sorted = [...data].sort((a, b) => b.id - a.id);
        setCommandes(sorted);
      } catch (e) {
        console.error("Erreur chargement commandes:", e);
      }
    }
    fetchData();
  }, []);

  // Filtrage local
  const filtered = commandes.filter((c) => {
    const matchSearch =
      c.clientNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.article && c.article.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchDate = !filterDate || c.dateReception === filterDate;
    return matchSearch && matchDate;
  });

  // Charger la commande par ID et afficher les détails
  const handleViewDetails = async (id: number) => {
    try {
      const data = await getCommandeById(id);
      setSelectedCommande(data);
      setCurrentView("details");
    } catch (error) {
      console.error("Erreur récupération commande :", error);
    }
  };

  // 🔹 Gérer le clic sur le statut
  const handleStatutClick = async () => {
    if (!selectedCommande) return;
    try {
      const nouveauStatut = "LIVREE";
      const updated = await updateStatutCommande(selectedCommande.id, nouveauStatut);

      // 🧠 Mettre à jour l'état local (pour refléter instantanément le changement)
      setSelectedCommande(updated);

      // 🔁 Met à jour la liste principale
      setCommandes((prev) =>
        prev.map((cmd) => (cmd.id === updated.id ? updated : cmd))
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut :", error);
      alert("Impossible de changer le statut de la commande.");
    }
  };

  // ✅ Vue création
  if (currentView === "create") {
    return <NouvelleCommande onCancel={() => setCurrentView("list")} />;
  }

  // ✅ Vue détails
  if (currentView === "details" && selectedCommande) {
    const c = selectedCommande;
    const resteAPayer = Number(c.resteAPayer ?? 0);
    const isPaid = resteAPayer === 0;

    return (
      <div className="p-8 max-w-6xl mx-auto space-y-8">
        {/* 🔙 Bouton retour + Statut */}
        <div className="flex items-center justify-between">
          <Button
            onClick={() => setCurrentView("list")}
            variant="outline"
            className="flex items-center gap-2 text-gray-700 hover:text-blue-700"
          >
            <ArrowLeft size={18} /> Retour
          </Button>

          <Badge
            onClick={handleStatutClick}
            className={`cursor-pointer transition text-lg px-4 py-1 font-semibold hover:scale-105 ${
              c.statut === "LIVREE"
                ? "bg-green-100 text-green-700"
                : c.statut === "EN_COURS"
                ? "bg-orange-100 text-orange-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {c.statut}
          </Badge>
        </div>

        {/* 🧾 En-tête */}
        <div>
          <h1 className="text-3xl font-bold text-blue-700">
            Commande #{c.id}
          </h1>
          <p className="text-gray-600">
            Réception : <b>{c.dateReception}</b> — Livraison :{" "}
            <b>{c.dateLivraison}</b>
          </p>
        </div>

        {/* 📦 CONTENU EN DEUX COLONNES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* COLONNE GAUCHE */}
          <div className="space-y-6">
            {/* CLIENT */}
            <Card className="p-6 border-l-4 border-blue-600">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Client</h2>
              <div className="space-y-2 text-sm">
                <p>
                  <b>ID Client :</b> {c.clientId}
                </p>
                <p>
                  <b>Nom :</b> {c.clientNom}
                </p>
                <p>
                  <b>Téléphone :</b> {c.clientTelephone}
                </p>
              </div>
            </Card>

            {/* ARTICLE & SERVICE */}
            <Card className="p-6 border-l-4 border-green-600">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Article & Service
              </h2>
              <div className="space-y-2 text-sm">
                <p>
                  <b>Article :</b> {c.article}
                </p>
                <p>
                  <b>Service :</b> {c.service}
                </p>
                <p>
                  <b>Quantité :</b> {c.qte}
                </p>
                <p>
                  <b>Prix unitaire :</b>{" "}
                  {Number(c.prix ?? 0).toLocaleString()} FCFA
                </p>
              </div>
            </Card>
          </div>

          {/* COLONNE DROITE */}
          <div className="space-y-6">
            {/* MONTANTS */}
            <Card className="p-6 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Montants</h2>
              <div className="space-y-2 text-sm">
                <p>
                  <b>Montant Brut :</b>{" "}
                  {Number(c.montantBrut ?? 0).toLocaleString()} FCFA
                </p>
                <p>
                  <b>Remise :</b> {Number(c.remise ?? 0).toLocaleString()} FCFA
                </p>
                <p className="text-blue-700 font-bold">
                  Montant Net : {Number(c.montantNet ?? 0).toLocaleString()} FCFA
                </p>
                <p className="text-green-600 font-bold">
                  Montant Payé : {Number(c.montantPaye ?? 0).toLocaleString()} FCFA
                </p>
                <p
                  className={`font-bold ${
                    isPaid ? "text-green-600" : "text-red-600"
                  }`}
                >
                  Reste à payer : {resteAPayer.toLocaleString()} FCFA
                </p>
              </div>
            </Card>

            {/* STATUT PAIEMENT */}
            <Card className="p-6 border-l-4 border-yellow-500">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Mode & Paiement
              </h2>
              <div className="space-y-2">
                <p>
                  <b>Mode :</b> {c.express ? "Express" : "Normal"}
                </p>
                <p>
                  <b>Statut de paiement :</b>
                </p>
                <Badge
                  className={`text-base px-3 py-1 ${
                    c.statutPaiement === "Payé"
                      ? "bg-green-500 text-white"
                      : c.statutPaiement === "Partiel"
                      ? "bg-orange-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {c.statutPaiement}
                </Badge>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Vue liste
  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
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

      {/* FILTRES */}
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

      {/* TABLEAU */}
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
            {filtered.length > 0 ? (
              filtered.map((c) => (
                <tr key={c.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{c.id}</td>
                  <td className="px-4 py-2">{c.clientNom}</td>
                  <td className="px-4 py-2">{c.service}</td>
                  <td className="px-4 py-2">{c.qte}</td>
                  <td className="px-4 py-2 text-right">
                    {Number(c.montantNet ?? 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">{c.express ? "Express" : "Normal"}</td>
                  <td className="px-4 py-2">{c.dateLivraison}</td>
                  <td className="px-4 py-2">
                    <Badge className="bg-blue-200 text-blue-800">{c.statut}</Badge>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <Button
                      onClick={() => handleViewDetails(c.id)}
                      className="bg-gray-200 text-gray-800 hover:bg-gray-300 p-1 rounded"
                    >
                      <FileText size={16} />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="py-8 text-center text-gray-500">
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
