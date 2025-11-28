import React, { useState, useMemo, useEffect } from "react";
import {
  Plus,
  Trash2,
  X,
  ShoppingCart,
  Shirt,
  Loader2,
  Percent,
  CreditCard,
} from "lucide-react";
import { getAllClients } from "../services/client.service";
import { apiFetch } from "../services/api";
import { useNavigate } from "react-router-dom";

// ---- TYPES ----------------------------------------------------
type Client = { id: string; nom: string; telephone: string };
type Parametre = { id: number; article: string; service: string; prix: number };
type Article = {
  id: string;
  type: string;
  service: string;
  quantite: number;
  prixUnitaire: number;
  parametreId: number;
};

type CommandeState = {
  clientId: string;
  dateReception: string;
  dateLivraison: string;
  remiseGlobale: number;
  montantPaye: number;
};

type DraftArticle = {
  type: string;
  service: string;
  quantite: number;
};

// ---- UTILS ----------------------------------------------------
const getTodayString = () => new Date().toISOString().slice(0, 10);

// ---- UI COMPONENTS --------------------------------------------
const Card = ({ children, className = "" }: any) => (
  <div
    className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 ${className}`}
  >
    {children}
  </div>
);

const Label = ({ children }: any) => (
  <label className="font-semibold text-sm text-gray-700 dark:text-gray-200">
    {children}
  </label>
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
    className={`px-4 py-2 rounded-lg text-white text-sm font-semibold shadow transition flex items-center justify-center gap-2 ${className}`}
  >
    {children}
  </button>
);

// ---- MAIN COMPONENT -------------------------------------------
export default function NouvelleCommande({ onCancel }: any) {
  const navigate = useNavigate();
  const today = getTodayString();

  // State principal propre et structuré
  const [commande, setCommande] = useState<CommandeState>({
    clientId: "",
    dateReception: today,
    dateLivraison: "",
    remiseGlobale: 0,
    montantPaye: 0,
  });

  const [draftArticle, setDraftArticle] = useState<DraftArticle>({
    type: "",
    service: "",
    quantite: 1,
  });

  const [articles, setArticles] = useState<Article[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [tarifs, setTarifs] = useState<Parametre[]>([]);
  const [loading, setLoading] = useState(false);

  // Chargement initial
  useEffect(() => {
    getAllClients().then(setClients).catch(console.error);
    apiFetch("/api/parametre")
      .then((data: Parametre[]) => setTarifs(data))
      .catch(console.error);
  }, []);

  // Extraction des types d'articles uniques
  const typesArticles = useMemo(
    () => [...new Set(tarifs.map((t) => t.article))],
    [tarifs]
  );

  // Services disponibles pour le type sélectionné
  const servicesDisponibles = useMemo(() => {
    if (!draftArticle.type) return [];
    return tarifs
      .filter((t) => t.article === draftArticle.type)
      .map((t) => ({ id: t.id, service: t.service, prix: t.prix }));
  }, [draftArticle.type, tarifs]);

  // Prix unitaire du draft actuel
  const prixUnitaireDraft = useMemo(() => {
    if (!draftArticle.type || !draftArticle.service) return 0;
    const tarif = tarifs.find(
      (t) => t.article === draftArticle.type && t.service === draftArticle.service
    );
    return tarif?.prix ?? 0;
  }, [draftArticle, tarifs]);

  // Calculs financiers
  const montantTotal = useMemo(
    () => articles.reduce((sum, a) => sum + a.prixUnitaire * a.quantite, 0),
    [articles]
  );

  const montantNet = Math.max(0, montantTotal - commande.remiseGlobale);

  // Handlers avec state propre
  const updateCommande = (updates: Partial<CommandeState>) => {
    setCommande((prev) => ({ ...prev, ...updates }));
  };

  const updateDraftArticle = (updates: Partial<DraftArticle>) => {
    setDraftArticle((prev) => ({ ...prev, ...updates }));
  };

  const handleAjouterArticle = () => {
    if (!draftArticle.type || !draftArticle.service) {
      alert("Veuillez sélectionner un article et un service.");
      return;
    }

    const tarif = tarifs.find(
      (t) =>
        t.article === draftArticle.type && t.service === draftArticle.service
    );

    if (!tarif) {
      alert("Paramètre introuvable pour cet article.");
      return;
    }

    const nouvelArticle: Article = {
      id: crypto.randomUUID(),
      type: draftArticle.type,
      service: draftArticle.service,
      quantite: draftArticle.quantite,
      prixUnitaire: tarif.prix,
      parametreId: tarif.id,
    };

    setArticles((prev) => [...prev, nouvelArticle]);
    setDraftArticle({ type: "", service: "", quantite: 1 });
  };

  const handleSupprimerArticle = (articleId: string) => {
    setArticles((prev) => prev.filter((a) => a.id !== articleId));
  };

  const handleSubmit = async () => {
    // Validation détaillée avec messages spécifiques
    if (!commande.clientId) {
      alert("⚠️ Veuillez sélectionner un client.");
      return;
    }

    if (!commande.dateReception) {
      alert("⚠️ Veuillez saisir la date de réception.");
      return;
    }

    if (!commande.dateLivraison) {
      alert("⚠️ Veuillez saisir la date de livraison.");
      return;
    }

    if (articles.length === 0) {
      alert("⚠️ Veuillez ajouter au moins un article à la commande.");
      return;
    }

    try {
      setLoading(true);

      const body = {
        clientId: Number(commande.clientId),
        parametreIds: articles.map((a) => a.parametreId),
        quantites: articles.map((a) => a.quantite),
        remiseGlobale: commande.remiseGlobale,
        montantPaye: commande.montantPaye,
        dateReception: commande.dateReception,
        dateLivraison: commande.dateLivraison,
      };

      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/commande/pdf`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Erreur lors du téléchargement du PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      window.URL.revokeObjectURL(url);

      navigate("/commandes");
    } catch (err: any) {
      alert(err.message || "Erreur lors de la création de la commande");
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

  <div className="flex gap-2">
    <Button
      className="bg-gray-600 hover:bg-gray-700"
      onClick={() => navigate("/commande-pesage")}
    >
      🏋️‍♂️ Commande par pesage
    </Button>

    <Button
      className="bg-red-600 hover:bg-red-700"
      onClick={() => navigate("/commandes")}
    >
      <X size={18} /> Annuler
    </Button>
  </div>
</div>

      {/* CLIENT ET DATES */}
      <Card className="space-y-5">
        <div className="grid md:grid-cols-3 gap-5">
          <div className="space-y-1">
            <Label>Client</Label>
            <Select
              value={commande.clientId}
              onChange={(v) => updateCommande({ clientId: v })}
            >
              <option value="">Sélectionner un client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.telephone} — {c.nom}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Date de réception</Label>
            <Input
              type="date"
              min={today}
              value={commande.dateReception}
              onChange={(e) => updateCommande({ dateReception: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <Label>Date de livraison</Label>
            <Input
              type="date"
              min={commande.dateReception || today}
              value={commande.dateLivraison}
              onChange={(e) => updateCommande({ dateLivraison: e.target.value })}
            />
          </div>
        </div>
      </Card>

      {/* AJOUTER UN ARTICLE */}
      <Card className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Shirt size={20} className="text-blue-600" /> Ajouter un article
        </h2>

        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <Label>Article</Label>
            <Select
              value={draftArticle.type}
              onChange={(v) => updateDraftArticle({ type: v, service: "" })}
            >
              <option value="">Choisir...</option>
              {typesArticles.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label>Service</Label>
            <Select
              value={draftArticle.service}
              onChange={(v) => updateDraftArticle({ service: v })}
              disabled={!draftArticle.type}
            >
              <option value="">Choisir...</option>
              {servicesDisponibles.map((s) => (
                <option key={s.id} value={s.service}>
                  {s.service} - {s.prix.toLocaleString()} FCFA
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label>Quantité</Label>
            <Input
              type="number"
              min={1}
              value={draftArticle.quantite}
              onChange={(e) =>
                updateDraftArticle({ quantite: +e.target.value })
              }
            />
          </div>

          <Button
            className="bg-green-600 hover:bg-green-700 mt-6"
            onClick={handleAjouterArticle}
            disabled={!draftArticle.type || !draftArticle.service}
          >
            <Plus size={16} /> Ajouter
          </Button>
        </div>

        {prixUnitaireDraft > 0 && (
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Prix unitaire :{" "}
            <strong>{prixUnitaireDraft.toLocaleString()} FCFA</strong>
          </div>
        )}
      </Card>

      {/* LISTE DES ARTICLES */}
      <Card className="space-y-4">
        {articles.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            Aucun article ajouté pour le moment
          </p>
        ) : (
          articles.map((a) => (
            <div
              key={a.id}
              className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border"
            >
              <div>
                <p className="font-semibold">
                  {a.type} — {a.service}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {a.quantite} × {a.prixUnitaire.toLocaleString()} FCFA ={" "}
                  {(a.quantite * a.prixUnitaire).toLocaleString()} FCFA
                </p>
              </div>

              <button
                onClick={() => handleSupprimerArticle(a.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}

        {articles.length > 0 && (
          <div className="space-y-3 border-t pt-3">
            <div className="flex justify-between font-semibold text-lg">
              <span>Total :</span>
              <span>{montantTotal.toLocaleString()} FCFA</span>
            </div>

            <div className="space-y-1">
              <Label>
                <div className="flex items-center gap-2">
                  <Percent size={16} /> Remise
                </div>
              </Label>
              <Input
                type="number"
                min={0}
                value={commande.remiseGlobale}
                onChange={(e) =>
                  updateCommande({ remiseGlobale: +e.target.value })
                }
              />
            </div>

            <div className="flex justify-between font-bold text-2xl text-blue-600 mt-2">
              <span>Total Net :</span>
              <span>{montantNet.toLocaleString()} FCFA</span>
            </div>

            <div className="space-y-1 mt-3">
              <Label>
                <div className="flex items-center gap-2">
                  <CreditCard size={16} /> Montant payé
                </div>
              </Label>
              <Input
                type="number"
                min={0}
                value={commande.montantPaye}
                onChange={(e) =>
                  updateCommande({ montantPaye: +e.target.value })
                }
              />
            </div>
          </div>
        )}
      </Card>

      {/* BOUTON DE SOUMISSION */}
      <Button
        className={`w-full py-3 text-lg ${
          loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
        }`}
        onClick={handleSubmit}
        disabled={loading || articles.length === 0}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={20} /> Traitement...
          </>
        ) : (
          "Confirmer la commande"
        )}
      </Button>
    </div>
  );
}