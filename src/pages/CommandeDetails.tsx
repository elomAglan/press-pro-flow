import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCommandeById } from "../services/commande.service.ts";

// AVANT (ce qui provoque l'erreur)
// import Card from "../components/ui/card";
// import Button from "../components/ui/button";
// import Input from "../components/ui/input";

// APRÈS (correct)
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";


import { List, Calendar, Search, Plus } from "lucide-react";

type Article = {
  id: string;
  type: string;
  service: string;
  quantite: number;
  prixUnitaire: number;
  priceBasis: "standard" | "express";
};

type Commande = {
  id: number;
  clientNom: string;
  articles: Article[];
  qte: number;
  montantNet: number;
  express: boolean;
  dateReception: string;
  dateLivraison: string;
  statut: string;
};

export default function CommandeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [commande, setCommande] = useState<Commande | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!id) return;
    async function fetchData() {
      try {
        const data = await getCommandeById(Number(id));
        setCommande(data);
      } catch (err) {
        console.error("Erreur chargement commande:", err);
      }
    }
    fetchData();
  }, [id]);

  if (!commande) return <p>Chargement...</p>;

  // Filtrage sécurisé pour éviter 'undefined.toLowerCase()'
  const filteredArticles = commande.articles.filter((a) => {
    const type = a.type || "";
    const service = a.service || "";
    return (
      type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <List className="text-blue-600" /> Détails de la commande #{commande.id}
        </h1>
        <Button
          className="bg-red-600 hover:bg-red-700"
          onClick={() => navigate(-1)}
        >
          Retour
        </Button>
      </div>

      {/* FILTRE ARTICLES */}
      <Card className="p-4 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher un article..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* LISTE ARTICLES */}
      <Card className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Service</th>
              <th className="px-4 py-2 text-left">Qté</th>
              <th className="px-4 py-2 text-right">Prix Unitaire</th>
              <th className="px-4 py-2 text-left">Mode</th>
            </tr>
          </thead>
          <tbody>
            {filteredArticles.length > 0 ? (
              filteredArticles.map((a) => (
                <tr key={a.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{a.type}</td>
                  <td className="px-4 py-2">{a.service}</td>
                  <td className="px-4 py-2">{a.quantite}</td>
                  <td className="px-4 py-2 text-right">
                    {a.prixUnitaire.toLocaleString()} FCFA
                  </td>
                  <td className="px-4 py-2">
                    {a.priceBasis === "express" ? (
                      <span className="text-red-600 font-semibold">Express</span>
                    ) : (
                      <span className="text-gray-500">Standard</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  Aucun article trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {/* INFOS COMMANDE */}
      <Card className="space-y-2">
        <p>
          <strong>Client :</strong> {commande.clientNom}
        </p>
        <p>
          <strong>Date de réception :</strong> {commande.dateReception}
        </p>
        <p>
          <strong>Date de livraison :</strong> {commande.dateLivraison}
        </p>
        <p>
          <strong>Statut :</strong>{" "}
          <Badge className="bg-blue-200 text-blue-800">{commande.statut}</Badge>
        </p>
        <p>
          <strong>Total Net :</strong> {commande.montantNet.toLocaleString()} FCFA
        </p>
      </Card>
    </div>
  );
}
