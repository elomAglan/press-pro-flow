import React, { useState, useEffect, useMemo } from "react";
import { getAllCommandes } from "../services/commande.service.ts";
import { getAllClients } from "../services/client.service";
import { apiFetch } from "../services/api";

import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";

import { List, Plus, Search, Calendar, ShoppingCart, X, User, Shirt, Loader2 } from "lucide-react";

// ---- TYPES ----
type Client = { id: string; nom: string; telephone: string };
type Parametre = { id: number; article: string; service: string; prix: number };
type Article = {
  id: string;
  type: string;
  service: string;
  quantite: number;
  prixUnitaire: number;
  priceBasis: "standard" | "express";
};

// ---- HELPERS ----
const calcDelivery = (date: string, mode: "standard" | "express") => {
  if (mode === "express") return date;
  const d = new Date(date);
  d.setDate(d.getDate() + 3);
  return d.toISOString().slice(0, 10);
};

// ---- NOUVELLE COMMANDE ----
type NouvelleCommandeProps = {
  onCancel: () => void;
};

function NouvelleCommande({ onCancel }: NouvelleCommandeProps) {
  const [cmd, setCmd] = useState({
    client: "",
    dateReception: new Date().toISOString().slice(0, 10),
    type: "standard" as "standard" | "express",
    remise: 0,
    montantPaye: 0,
  });

  const [draft, setDraft] = useState({ type: "", service: "", quantite: 1 });
  const [articles, setArticles] = useState<Article[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [tarifs, setTarifs] = useState<Parametre[]>([]);
  const [loading, setLoading] = useState(false);

  // Charger clients & paramètres
  useEffect(() => {
    getAllClients().then(setClients).catch(console.error);
    apiFetch("/api/parametre")
      .then((data: Parametre[]) => setTarifs(data))
      .catch(console.error);
  }, []);

  const types = useMemo(() => [...new Set(tarifs.map((t) => t.article))], [tarifs]);
  const services = useMemo(() => [...new Set(tarifs.map((t) => t.service))], [tarifs]);

  const getPrice = (article: string, service: string, mode: "standard" | "express") => {
    return (
      tarifs.find(
        (t) =>
          t.article === article &&
          t.service === service &&
          (mode === "express"
            ? t.service.toLowerCase().includes("express")
            : !t.service.toLowerCase().includes("express"))
      )?.prix ?? 0
    );
  };

  const draftPrice = useMemo(() => getPrice(draft.type, draft.service, cmd.type), [draft, cmd.type, tarifs]);

  const addArticle = () => {
    if (!draft.type || !draft.service) return;

    setArticles((a) => [
      ...a,
      {
        id: crypto.randomUUID(),
        type: draft.type,
        service: draft.service,
        quantite: draft.quantite,
        prixUnitaire: draftPrice,
        priceBasis: cmd.type,
      },
    ]);

    setDraft({ type: "", service: "", quantite: 1 });
  };

  useEffect(() => {
    setArticles((list) =>
      list.map((a) => ({
        ...a,
        prixUnitaire: getPrice(a.type, a.service, cmd.type),
        priceBasis: cmd.type,
      }))
    );
  }, [cmd.type, tarifs]);

  const total = useMemo(() => articles.reduce((s, a) => s + a.prixUnitaire * a.quantite, 0), [articles]);
  const totalNet = Math.max(0, total - cmd.remise);
  const livraison = calcDelivery(cmd.dateReception, cmd.type);

  const handleSubmit = async () => {
    if (!cmd.client || articles.length === 0) {
      alert("Veuillez sélectionner un client et ajouter au moins un article.");
      return;
    }

    try {
      setLoading(true);

      const firstArticle = articles[0];
      const tarif = tarifs.find(
        (t) => t.article === firstArticle.type && t.service === firstArticle.service
      );
      if (!tarif) {
        alert("Paramètre introuvable pour cet article.");
        setLoading(false);
        return;
      }

      const body = {
        clientId: Number(cmd.client),
        parametreId: tarif.id,
        qte: articles.reduce((sum, a) => sum + a.quantite, 0),
        remise: cmd.remise,
        express: cmd.type === "express",
        montantPaye: cmd.montantPaye,
      };

      const token = localStorage.getItem("authToken");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/commande/pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Erreur lors du téléchargement du PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      window.URL.revokeObjectURL(url);

      setCmd({
        client: "",
        dateReception: new Date().toISOString().slice(0, 10),
        type: "standard",
        remise: 0,
        montantPaye: 0,
      });
      setArticles([]);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "❌ Erreur lors de la création de la commande");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-extrabold flex items-center gap-2">
          <ShoppingCart className="text-blue-600" /> Nouvelle commande
        </h1>
        <Button className="bg-red-600 hover:bg-red-700" onClick={onCancel}>
          <X size={18} /> Annuler
        </Button>
      </div>

      {/* CLIENT & DATE */}
      <Card className="space-y-5">
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-1">
            <label className="font-semibold flex items-center gap-2 text-sm">
              <User size={16} /> Client
            </label>
            <select
              value={cmd.client}
              onChange={(e) => setCmd({ ...cmd, client: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Sélectionner un client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.telephone} — {c.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold flex items-center gap-2 text-sm">
              <Calendar size={16} /> Réception
            </label>
            <Input
              type="date"
              value={cmd.dateReception}
              onChange={(e) => setCmd({ ...cmd, dateReception: e.target.value })}
            />
            <p className="text-xs mt-1 text-blue-600 font-medium">Livraison prévue : {livraison}</p>
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-sm">Type de commande</label>
          <select
            value={cmd.type}
            onChange={(e) => setCmd({ ...cmd, type: e.target.value as "standard" | "express" })}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          >
            <option value="standard">Standard (J+3)</option>
            <option value="express">Express (Jour J)</option>
          </select>
        </div>
      </Card>

      {/* ARTICLES */}
      <Card className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Shirt size={20} className="text-blue-600" /> Ajouter un article
        </h2>

        <div className="grid md:grid-cols-4 gap-4">
          <select
            value={draft.type}
            onChange={(e) => setDraft({ ...draft, type: e.target.value })}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">Ligne</option>
            {types.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>

          <select
            value={draft.service}
            onChange={(e) => setDraft({ ...draft, service: e.target.value })}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">Service</option>
            {services.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <Input
            type="number"
            min={1}
            value={draft.quantite}
            onChange={(e) => setDraft({ ...draft, quantite: +e.target.value })}
          />

          <Button className="bg-green-600 hover:bg-green-700" onClick={addArticle}>
            <Plus size={16} /> Ajouter
          </Button>
        </div>

        {draft.type && draft.service && (
          <p className={`text-sm font-semibold ${cmd.type === "express" ? "text-red-600" : "text-gray-700"}`}>
            Prix unitaire ({cmd.type}) : {draftPrice.toLocaleString()} FCFA
          </p>
        )}
      </Card>

      {/* LISTE ARTICLES */}
      <Card className="space-y-4">
        <h2 className="text-lg font-bold">Articles ({articles.length})</h2>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {articles.map((a) => (
            <div key={a.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border">
              <div>
                <p className="font-semibold">{a.type} — {a.service}</p>
                <p className={`text-sm ${a.priceBasis === "express" ? "text-red-600 font-semibold" : "text-gray-600"}`}>
                  {a.quantite} × {a.prixUnitaire.toLocaleString()} FCFA
                </p>
              </div>
              <button onClick={() => setArticles((x) => x.filter((i) => i.id !== a.id))} className="text-red-600 hover:text-red-800">
                X
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-3 border-t pt-3">
          <div className="flex justify-between font-semibold text-lg">
            <span>Total :</span>
            <span>{total.toLocaleString()} FCFA</span>
          </div>

          <Input
            type="number"
            min={0}
            value={cmd.remise}
            onChange={(e) => setCmd({ ...cmd, remise: +e.target.value })}
            placeholder="Remise"
          />

          <div className="flex justify-between font-bold text-2xl text-blue-600 mt-2">
            <span>Total Net :</span>
            <span>{totalNet.toLocaleString()} FCFA</span>
          </div>

          <div className="space-y-1 mt-3">
            <label className="font-semibold text-sm">Montant payé</label>
            <Input
              type="number"
              min={0}
              value={cmd.montantPaye}
              onChange={(e) => setCmd({ ...cmd, montantPaye: +e.target.value })}
              placeholder="Entrez le montant payé"
            />
          </div>
        </div>
      </Card>

      <Button
        className={`w-full py-3 text-lg ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={20} /> Traitement en cours...
          </>
        ) : (
          "Confirmer la commande"
        )}
      </Button>
    </div>
  );
}

// ---- COMPOSANT PRINCIPAL COMMANDES ----
export default function Commandes() {
  const [commandes, setCommandes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [currentView, setCurrentView] = useState<"list" | "create">("list");

  // Charger les commandes
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getAllCommandes();
        setCommandes([...data].sort((a, b) => b.id - a.id));
      } catch (e) {
        console.error("Erreur chargement commandes:", e);
      }
    }
    fetchData();
  }, []);

  const filtered = commandes.filter((c) => {
    const matchSearch =
      c.clientNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.article && c.article.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchDate = !filterDate || c.dateReception === filterDate;
    return matchSearch && matchDate;
  });

  if (currentView === "create") {
    return <NouvelleCommande onCancel={() => setCurrentView("list")} />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <List className="text-blue-600" /> Commandes
        </h1>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setCurrentView("create")}>
          <Plus className="h-4 w-4" /> Nouvelle Commande
        </Button>
      </div>

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
                    {c.express ? <span className="text-red-600 font-semibold">Express</span> : <span className="text-gray-500">Normal</span>}
                  </td>
                  <td className="px-4 py-2">{c.dateLivraison}</td>
                  <td className="px-4 py-2"><Badge className="bg-blue-200 text-blue-800">{c.statut}</Badge></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-500">Aucune commande trouvée</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
