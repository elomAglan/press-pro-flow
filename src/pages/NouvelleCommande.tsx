import React, { useState, useMemo, useEffect } from "react";
import { Plus, Trash2, X, Calendar, User, ShoppingCart, Shirt } from "lucide-react";
import { getAllClients } from "../services/client.service";
import { apiFetch } from "../services/api";

// ---- TYPES ----------------------------------------------------
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

// ---- HELPERS --------------------------------------------------
const calcDelivery = (date: string, mode: "standard" | "express") => {
  if (mode === "express") return date;
  const d = new Date(date);
  d.setDate(d.getDate() + 3);
  return d.toISOString().slice(0, 10);
};

// ---- UI COMPONENTS -------------------------------------------
const Card = ({ children, className = "" }: any) => (
  <div
    className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 ${className}`}
  >
    {children}
  </div>
);

const Input = ({ className = "", ...props }: any) => (
  <input
    {...props}
    className={`w-full border rounded-lg px-3 py-2 text-sm transition bg-white dark:bg-gray-700 dark:text-white ${className}`}
  />
);

const Select = ({ value, onChange, children }: any) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-white"
  >
    {children}
  </select>
);

const Button = ({ children, className = "", ...props }: any) => (
  <button
    {...props}
    className={`px-4 py-2 rounded-lg text-white text-sm font-semibold shadow transition ${className}`}
  >
    {children}
  </button>
);

// ---- MAIN COMPONENT ------------------------------------------
export default function NouvelleCommande() {
  const [cmd, setCmd] = useState({
    client: "",
    dateReception: new Date().toISOString().slice(0, 10),
    type: "standard" as "standard" | "express",
    remise: 0,
  });

  const [draft, setDraft] = useState({ type: "", service: "", quantite: 1 });
  const [articles, setArticles] = useState<Article[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [tarifs, setTarifs] = useState<Parametre[]>([]);

  // Charger clients & paramètres
  useEffect(() => {
    getAllClients().then(setClients).catch(console.error);
    apiFetch("/api/parametre")
      .then((data: Parametre[]) => setTarifs(data))
      .catch(console.error);
  }, []);

  // Extraire types & services uniques
  const types = useMemo(() => [...new Set(tarifs.map((t) => t.article))], [tarifs]);
  const services = useMemo(() => [...new Set(tarifs.map((t) => t.service))], [tarifs]);

  // Calcul du prix unitaire selon type/service/mode
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

  const draftPrice = useMemo(
    () => getPrice(draft.type, draft.service, cmd.type),
    [draft, cmd.type, tarifs]
  );

  // Ajouter article
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

  // Met à jour les prix si mode change
  useEffect(() => {
    setArticles((list) =>
      list.map((a) => ({
        ...a,
        prixUnitaire: getPrice(a.type, a.service, cmd.type),
        priceBasis: cmd.type,
      }))
    );
  }, [cmd.type, tarifs]);

  // Totaux
  const total = useMemo(
    () => articles.reduce((s, a) => s + a.prixUnitaire * a.quantite, 0),
    [articles]
  );
  const totalNet = Math.max(0, total - cmd.remise);
  const livraison = calcDelivery(cmd.dateReception, cmd.type);

  // Soumission + PDF
  const handleSubmit = async () => {
    if (!cmd.client || articles.length === 0) {
      alert("Veuillez sélectionner un client et ajouter au moins un article.");
      return;
    }

    try {
      const firstArticle = articles[0];
      const tarif = tarifs.find(
        (t) => t.article === firstArticle.type && t.service === firstArticle.service
      );
      if (!tarif) {
        alert("Paramètre introuvable pour cet article.");
        return;
      }

      const body = {
        clientId: Number(cmd.client),
        parametreId: tarif.id,
        qte: articles.reduce((sum, a) => sum + a.quantite, 0),
        remise: cmd.remise,
        express: cmd.type === "express",
      };

      console.log("📤 Données envoyées :", body);

      // Création commande
      const created = await apiFetch("/api/commande", {
        method: "POST",
        body: JSON.stringify(body),
      });

      alert("✅ Commande créée avec succès !");

      // 🧾 Génération du PDF
      const pdfResponse = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/commande/pdf/${created.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
          },
        }
      );

      if (!pdfResponse.ok) throw new Error("Erreur lors du téléchargement du PDF");
      const blob = await pdfResponse.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");

      // Réinitialisation
      setCmd({
        client: "",
        dateReception: new Date().toISOString().slice(0, 10),
        type: "standard",
        remise: 0,
      });
      setArticles([]);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "❌ Erreur lors de la création de la commande");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-extrabold flex items-center gap-2">
          <ShoppingCart className="text-blue-600" /> Nouvelle commande
        </h1>
        <Button className="bg-red-600 hover:bg-red-700 flex items-center gap-1">
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
            <Select value={cmd.client} onChange={(v) => setCmd({ ...cmd, client: v })}>
              <option value="">Sélectionner un client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.telephone} — {c.nom}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold flex items-center gap-2 text-sm">
              <Calendar size={16} /> Réception
            </label>
            <Input
              type="date"
              value={cmd.dateReception}
              onChange={(e) =>
                setCmd({ ...cmd, dateReception: e.target.value })
              }
            />
            <p className="text-xs mt-1 text-blue-600 font-medium">
              Livraison prévue : {livraison}
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-sm">Type de commande</label>
          <Select value={cmd.type} onChange={(v) => setCmd({ ...cmd, type: v })}>
            <option value="standard">Standard (J+3)</option>
            <option value="express">Express (Jour J)</option>
          </Select>
        </div>
      </Card>

      {/* ARTICLES */}
      <Card className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Shirt size={20} className="text-blue-600" /> Ajouter un article
        </h2>

        <div className="grid md:grid-cols-4 gap-4">
          <Select
            value={draft.type}
            onChange={(v) => setDraft({ ...draft, type: v })}
          >
            <option value="">Ligne</option>
            {types.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </Select>

          <Select
            value={draft.service}
            onChange={(v) => setDraft({ ...draft, service: v })}
          >
            <option value="">Service</option>
            {services.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>

          <Input
            type="number"
            min={1}
            value={draft.quantite}
            onChange={(e) =>
              setDraft({ ...draft, quantite: +e.target.value })
            }
          />

          <Button
            className="bg-green-600 hover:bg-green-700 flex items-center justify-center gap-1"
            onClick={addArticle}
          >
            <Plus size={16} /> Ajouter
          </Button>
        </div>

        {draft.type && draft.service && (
          <p
            className={`text-sm font-semibold ${
              cmd.type === "express" ? "text-red-600" : "text-gray-700"
            }`}
          >
            Prix unitaire ({cmd.type}) : {draftPrice.toLocaleString()} FCFA
          </p>
        )}
      </Card>

      {/* LISTE ARTICLES */}
      <Card className="space-y-4">
        <h2 className="text-lg font-bold">Articles ({articles.length})</h2>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {articles.map((a) => (
            <div
              key={a.id}
              className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border"
            >
              <div>
                <p className="font-semibold">
                  {a.type} — {a.service}
                </p>
                <p
                  className={`text-sm ${
                    a.priceBasis === "express"
                      ? "text-red-600 font-semibold"
                      : "text-gray-600"
                  }`}
                >
                  {a.quantite} × {a.prixUnitaire.toLocaleString()} FCFA
                </p>
              </div>
              <button
                onClick={() =>
                  setArticles((x) => x.filter((i) => i.id !== a.id))
                }
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-2 border-t pt-3">
          <div className="flex justify-between font-semibold text-lg">
            <span>Total :</span>
            <span>{total.toLocaleString()} FCFA</span>
          </div>

          <Input
            type="number"
            min={0}
            value={cmd.remise}
            onChange={(e) => setCmd({ ...cmd, remise: +e.target.value })}
          />

          <div className="flex justify-between font-bold text-2xl text-blue-600 mt-2">
            <span>Total Net :</span>
            <span>{totalNet.toLocaleString()} FCFA</span>
          </div>
        </div>
      </Card>

      <Button
        className="bg-blue-600 w-full py-3 hover:bg-blue-700 text-lg"
        onClick={handleSubmit}
      >
        Confirmer la commande
      </Button>
    </div>
  );
}
