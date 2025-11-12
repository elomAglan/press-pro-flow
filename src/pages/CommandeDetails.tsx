import React, { useState, useMemo, useEffect } from "react";
import { getAllCommandes, changerStatutCommande } from "../services/commande.service.ts";
import NouvelleCommande from "./NouvelleCommande";

// UI
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";

// Icons
import { List, Plus, Search, Calendar, FileText, ArrowLeft } from "lucide-react";

// --- Types ---
interface Article {
  id: string;
  type: string;
  service: string;
  quantite: number;
  prixUnitaire: number;
}

export type StatutCommande = "en_attente" | "en_cours" | "pret" | "livre";
type StatutPaiement = "non_paye" | "partiel" | "paye";

export interface Commande {
  id: string;
  numero: string;
  clientId: string;
  articles: Article[];
  total: number;
  statut: StatutCommande;
  statutPaiement: StatutPaiement;
  montantPaye: number;
  dateCreation: string | Date;
}

type View = "list" | "create" | "details";

// Helpers
const getClientName = (clientId: string) => clientId; // à améliorer
const getStatutBadge = (statut: StatutCommande) => {
  const base = "uppercase text-xs font-semibold px-2 py-0.5 rounded-full border";
  switch (statut) {
    case "pret":
      return <Badge className={`${base} bg-green-100 text-green-700 border-green-300`}>Prêt</Badge>;
    case "livre":
      return <Badge className={`${base} bg-green-200 text-green-800 border-green-400`}>Livré</Badge>;
    case "en_cours":
      return <Badge className={`${base} bg-blue-100 text-blue-700 border-blue-300`}>En cours</Badge>;
    default:
      return <Badge className={`${base} bg-yellow-100 text-yellow-700 border-yellow-300`}>En attente</Badge>;
  }
};

// ✅ VUE DETAILS
function CommandeDetails({
  commande,
  onBack,
  onChangeStatut
}: {
  commande: Commande;
  onBack: () => void;
  onChangeStatut: (id: string, newStatut: "en_cours" | "livre") => void;
}) {
  const reste = commande.total - commande.montantPaye;

  const toggleStatut = () => {
    const newStatut = commande.statut === "en_cours" ? "livre" : "en_cours";
    onChangeStatut(commande.id, newStatut);
  };

  return (
    <div className="space-y-6 p-6">
      <Button
        onClick={onBack}
        className="flex items-center gap-2 bg-gray-700 text-white hover:bg-gray-800"
      >
        <ArrowLeft size={18} /> Retour
      </Button>

      <Card className="p-6 space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-blue-600">Commande #{commande.numero}</h2>
          <p className="text-gray-500">
            Créée le {new Date(commande.dateCreation).toLocaleDateString()}
          </p>
        </div>

        <div className="border-l-4 border-blue-500 pl-4">
          <h3 className="text-xl font-bold mb-2">Client</h3>
          <p>{getClientName(commande.clientId)}</p>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-3">Articles</h3>
          <div className="space-y-3">
            {commande.articles.map(a => (
              <div key={a.id} className="flex justify-between bg-gray-100 p-3 rounded-lg border">
                <div>
                  <p className="font-bold">{a.type} — {a.service}</p>
                  <p className="text-xs text-gray-500">Quantité : {a.quantite}</p>
                </div>
                <p className="font-semibold text-blue-600">
                  {(a.prixUnitaire * a.quantite).toLocaleString()} FCFA
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between text-lg">
            <span>Total :</span>
            <span className="font-bold">{commande.total.toLocaleString()} FCFA</span>
          </div>
          <div className="flex justify-between text-lg">
            <span>Payé :</span>
            <span className="font-bold text-green-600">{commande.montantPaye.toLocaleString()} FCFA</span>
          </div>
          <div className={`flex justify-between text-xl font-bold ${reste > 0 ? "text-red-600" : "text-green-700"}`}>
            <span>Reste :</span>
            <span>{reste.toLocaleString()} FCFA</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Statut</h3>
            {getStatutBadge(commande.statut)}
          </div>
          <Button onClick={toggleStatut} className="bg-yellow-500 text-white hover:bg-yellow-600">
            {commande.statut === "en_cours" ? "Marquer Livrée" : "Repasser En Cours"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

// ✅ VUE LISTE
export default function Commandes() {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [currentView, setCurrentView] = useState<View>("list");
  const [selectedCommandeId, setSelectedCommandeId] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<StatutCommande | "all">("all");
  const [filterDate, setFilterDate] = useState("");

  // Chargement commandes
  useEffect(() => {
    getAllCommandes().then((data) => {
      const formatted = data.map((c: any) => ({
        ...c,
        dateCreation: new Date(c.dateCreation)
      }));
      setCommandes(formatted);
    });
  }, []);

  // 🔹 Changer le statut
  const handleChangeStatut = async (id: string, newStatut: "en_cours" | "livre") => {
    try {
      await changerStatutCommande(id, newStatut.toUpperCase() as "EN_COURS" | "LIVREE");
      setCommandes(prev => prev.map(c => c.id === id ? { ...c, statut: newStatut } : c));
    } catch (error) {
      console.error("Erreur changement de statut :", error);
    }
  };

  // 🔹 Filtrage sécurisé
  const filtered = useMemo(() => {
    return commandes.filter(c => {
      const matchSearch = (c.id || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filterStatus === "all" || c.statut === filterStatus;
      const matchDate = !filterDate || new Date(c.dateCreation).toISOString().split("T")[0] === filterDate;

      return matchSearch && matchStatus && matchDate;
    });
  }, [commandes, searchTerm, filterStatus, filterDate]);

  // 🟥 VUE CREATE
  if (currentView === "create") {
    return <NouvelleCommande onCancel={() => setCurrentView("list")} />;
  }

  // 🟦 VUE DETAILS
  if (currentView === "details" && selectedCommandeId) {
    const commande = commandes.find(c => c.id === selectedCommandeId);
    if (!commande) return null;

    return <CommandeDetails
      commande={commande}
      onBack={() => setCurrentView("list")}
      onChangeStatut={handleChangeStatut}
    />;
  }

  // ✅ VUE LISTE
  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <List className="text-blue-600" /> Commandes
        </h1>
        <Button className="bg-blue-600 text-white" onClick={() => setCurrentView("create")}>
          <Plus size={16} /> Nouvelle Commande
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 grid grid-cols-3 gap-4">
        <div className="relative col-span-2">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input className="pl-10" placeholder="Rechercher..." onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input className="pl-10" type="date" onChange={e => setFilterDate(e.target.value)} />
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Numéro</th>
              <th className="px-4 py-2 text-left">Client</th>
              <th className="px-4 py-2 text-left">Statut</th>
              <th className="px-4 py-2 text-right">Total</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map(c => (
                <tr key={c.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-semibold text-blue-600">{c.numero}</td>
                  <td className="px-4 py-2">{getClientName(c.clientId)}</td>
                  <td className="px-4 py-2">{getStatutBadge(c.statut)}</td>
                  <td className="px-4 py-2 text-right">{c.total.toLocaleString()} FCFA</td>
                  <td className="px-4 py-2 text-right flex gap-2">
                    <Button
                      onClick={() => {
                        setSelectedCommandeId(c.id);
                        setCurrentView("details");
                      }}
                      className="bg-gray-200 text-gray-800 hover:bg-gray-300"
                    >
                      Détails
                    </Button>
                    {(c.statut === "en_cours" || c.statut === "livre") && (
                      <Button
                        onClick={() => handleChangeStatut(c.id, c.statut === "en_cours" ? "livre" : "en_cours")}
                        className="bg-yellow-500 text-white hover:bg-yellow-600"
                      >
                        {c.statut === "en_cours" ? "Marquer Livrée" : "Repasser En Cours"}
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">
                  <FileText className="mx-auto mb-2" /> Aucune commande trouvée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
