import React, { useState, useMemo, useEffect } from "react";
import { Plus, Trash2, X, ShoppingCart, Scale, Percent, CreditCard, Loader2 } from "lucide-react";
import { apiFetch } from "../services/api";
import { getParametres } from "../services/commande.service";

// ---- TYPES ----
type Client = { id: string; nom: string; telephone: string };
type Parametre = { id: number; article: string; service: string; prix: number };
type ArticlePoids = { id: string; tranchePoids: string; service: string; prix: number; parametreId: number };
type CommandeState = { 
  clientId: string; 
  dateReception: string; 
  dateLivraison: string; 
  remiseGlobale: number; 
  montantPaye: number; 
};
type DraftArticlePoids = { tranchePoids: string; service: string; prix: number };

// ---- CONSTANTS ----
const WEIGHT_TRANCHES = ["1Kg-4Kg", "5Kg-9Kg", "10Kg-20Kg", "Supérieur à 20Kg"];
const SERVICES = ["Lavage simple", "Lavage + Séchage", "L+S + Repassage", "Lavage Express"];
const PRIX_MAP: Record<string, Record<string, number>> = {
  "1Kg-4Kg": { 
    "Lavage simple": 700, 
    "Lavage + Séchage": 800, 
    "L+S + Repassage": 1000, 
    "Lavage Express": 1200 
  },
  "5Kg-9Kg": { 
    "Lavage simple": 1200, 
    "Lavage + Séchage": 1500, 
    "L+S + Repassage": 2000, 
    "Lavage Express": 2200 
  },
  "10Kg-20Kg": { 
    "Lavage simple": 2000, 
    "Lavage + Séchage": 2500, 
    "L+S + Repassage": 3000, 
    "Lavage Express": 3500 
  },
  "Supérieur à 20Kg": { 
    "Lavage simple": 3500, 
    "Lavage + Séchage": 4000, 
    "L+S + Repassage": 4500, 
    "Lavage Express": 5000 
  },
};

// ---- UTILS ----
const getTodayString = () => new Date().toISOString().slice(0, 10);

const mockClients: Client[] = [
  { id: "1", nom: "Jean Dupont", telephone: "0123456789" },
  { id: "2", nom: "Marie Martin", telephone: "0987654321" },
  { id: "3", nom: "Paul Dubois", telephone: "0555123456" },
];

// ---- UI COMPONENTS ----
const Card = ({ children, className = "" }: any) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 ${className}`}>
    {children}
  </div>
);

const Label = ({ children }: any) => (
  <label className="font-semibold text-sm text-gray-700 dark:text-gray-300">
    {children}
  </label>
);

const Input = ({ className = "", ...props }: any) => (
  <input
    {...props}
    className={`w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 ${className}`}
  />
);

const Select = ({ value, onChange, children, disabled = false }: any) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    disabled={disabled}
    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {children}
  </select>
);

const Button = ({ children, className = "", ...props }: any) => (
  <button
    {...props}
    className={`px-4 py-2 rounded-lg text-white text-sm font-semibold shadow transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
);

// ---- MAIN COMPONENT ----
export default function CommandePesage() {
  const today = getTodayString();

  const [commande, setCommande] = useState<CommandeState>({
    clientId: "",
    dateReception: today,
    dateLivraison: "",
    remiseGlobale: 0,
    montantPaye: 0,
  });

  const [draftArticlePoids, setDraftArticlePoids] = useState<DraftArticlePoids>({
    tranchePoids: "",
    service: "",
    prix: 0,
  });

  const [articlesPoids, setArticlesPoids] = useState<ArticlePoids[]>([]);
  const [clients] = useState<Client[]>(mockClients);
  const [parametres, setParametres] = useState<Parametre[]>([]);
  const [loading, setLoading] = useState(false);

  // Chargement des paramètres
  useEffect(() => {
    getParametres()
      .then((data: Parametre[]) => setParametres(data))
      .catch(console.error);
  }, []);

  // Calcul automatique du prix
  useEffect(() => {
    if (draftArticlePoids.tranchePoids && draftArticlePoids.service) {
      const prix = PRIX_MAP[draftArticlePoids.tranchePoids]?.[draftArticlePoids.service] || 0;
      setDraftArticlePoids((prev) => ({ ...prev, prix }));
    }
  }, [draftArticlePoids.tranchePoids, draftArticlePoids.service]);

  const montantTotal = useMemo(
    () => articlesPoids.reduce((sum, a) => sum + (a.prix ?? 0), 0),
    [articlesPoids]
  );

  const montantNet = Math.max(0, montantTotal - (commande.remiseGlobale ?? 0));

  const updateCommande = (updates: Partial<CommandeState>) => {
    setCommande((prev) => ({ ...prev, ...updates }));
  };

  const updateDraftArticlePoids = (updates: Partial<DraftArticlePoids>) => {
    setDraftArticlePoids((prev) => ({ ...prev, ...updates }));
  };

  const handleAjouterArticlePoids = () => {
    if (!draftArticlePoids.tranchePoids || !draftArticlePoids.service) {
      alert("⚠️ Veuillez sélectionner une tranche de poids et un service.");
      return;
    }

    // Trouver le paramètre correspondant (tranchePoids = article, service = service)
    const parametre = parametres.find(
      (p) => p.article === draftArticlePoids.tranchePoids && p.service === draftArticlePoids.service
    );

    if (!parametre) {
      alert("⚠️ Paramètre introuvable pour cette combinaison tranche/service.");
      return;
    }

    const nouvelArticle: ArticlePoids = {
      id: crypto.randomUUID(),
      tranchePoids: draftArticlePoids.tranchePoids,
      service: draftArticlePoids.service,
      prix: draftArticlePoids.prix,
      parametreId: parametre.id,
    };

    setArticlesPoids((prev) => [...prev, nouvelArticle]);
    setDraftArticlePoids({ tranchePoids: "", service: "", prix: 0 });
  };

  const handleSupprimerArticlePoids = (id: string) => {
    setArticlesPoids((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = async () => {
    // Validation
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

    if (articlesPoids.length === 0) {
      alert("⚠️ Veuillez ajouter au moins un article à la commande.");
      return;
    }

    try {
      setLoading(true);

      // Extraire parametreIds et quantites (chaque article par pesage a une quantité de 1)
      const parametreIds = articlesPoids.map((a) => a.parametreId);
      const quantites = articlesPoids.map(() => 1); // Chaque article par pesage = quantité 1

      const body = {
        clientId: Number(commande.clientId),
        parametreIds,
        quantites,
        remiseGlobale: commande.remiseGlobale,
        montantPaye: commande.montantPaye,
        dateReception: commande.dateReception,
        dateLivraison: commande.dateLivraison,
      };

      console.log("📦 Données envoyées:", JSON.stringify(body, null, 2));

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
        throw new Error(text || "Erreur lors de la création de la commande");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      window.URL.revokeObjectURL(url);

      alert("✅ Commande par pesage créée avec succès !");

      // Reset
      setArticlesPoids([]);
      setCommande({
        clientId: "",
        dateReception: today,
        dateLivraison: "",
        remiseGlobale: 0,
        montantPaye: 0,
      });
    } catch (err: any) {
      alert("❌ " + (err.message || "Erreur lors de la création de la commande"));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (
      articlesPoids.length > 0 &&
      !confirm("Êtes-vous sûr de vouloir annuler ? Les données seront perdues.")
    ) {
      return;
    }
    setArticlesPoids([]);
    setCommande({
      clientId: "",
      dateReception: today,
      dateLivraison: "",
      remiseGlobale: 0,
      montantPaye: 0,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <ShoppingCart className="text-blue-600" />
            Nouvelle commande par pesage
          </h1>
          <Button className="bg-red-600 hover:bg-red-700" onClick={handleCancel}>
            <X size={18} /> Annuler
          </Button>
        </div>

        {/* CLIENT ET DATES */}
        <Card className="space-y-5">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Informations client
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            <div className="space-y-1">
              <Label>Client *</Label>
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
              <Label>Date de réception *</Label>
              <Input
                type="date"
                min={today}
                value={commande.dateReception}
                onChange={(e) => updateCommande({ dateReception: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <Label>Date de livraison *</Label>
              <Input
                type="date"
                min={commande.dateReception || today}
                value={commande.dateLivraison}
                onChange={(e) => updateCommande({ dateLivraison: e.target.value })}
              />
            </div>
          </div>
        </Card>

        {/* AJOUT PAR POIDS */}
        <Card className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Scale size={20} className="text-blue-600" />
            Ajouter par tranche de poids
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Tranche de poids *</Label>
              <Select
                value={draftArticlePoids.tranchePoids}
                onChange={(v) =>
                  updateDraftArticlePoids({ tranchePoids: v, service: "", prix: 0 })
                }
              >
                <option value="">Choisir une tranche...</option>
                {WEIGHT_TRANCHES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label>Service *</Label>
              <Select
                value={draftArticlePoids.service}
                onChange={(v) => updateDraftArticlePoids({ service: v })}
                disabled={!draftArticlePoids.tranchePoids}
              >
                <option value="">Choisir un service...</option>
                {SERVICES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>

            <Button
              className="bg-green-600 hover:bg-green-700 mt-6"
              onClick={handleAjouterArticlePoids}
              disabled={
                !draftArticlePoids.tranchePoids || !draftArticlePoids.service
              }
            >
              <Plus size={16} /> Ajouter
            </Button>
          </div>

          {draftArticlePoids.prix > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Prix calculé :{" "}
                <strong className="text-xl text-blue-600 dark:text-blue-400">
                  {draftArticlePoids.prix.toLocaleString()} FCFA
                </strong>
              </div>
            </div>
          )}
        </Card>

        {/* LISTE DES ARTICLES PAR POIDS */}
        <Card className="space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-white">
            Articles ajoutés ({articlesPoids.length})
          </h3>

          {articlesPoids.length === 0 ? (
            <div className="text-center py-8">
              <Scale size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                Aucun article ajouté pour le moment
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Sélectionnez une tranche de poids et un service pour commencer
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {articlesPoids.map((a, index) => (
                  <div
                    key={a.id}
                    className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">
                          {index + 1}
                        </span>
                        <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <Scale size={16} className="text-blue-600" />
                          {a.tranchePoids}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 ml-8">
                        {a.service}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {a.prix?.toLocaleString() ?? 0} FCFA
                      </span>
                      <button
                        onClick={() => handleSupprimerArticlePoids(a.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition"
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* RÉSUMÉ FINANCIER */}
              <div className="space-y-3 border-t border-gray-200 dark:border-gray-600 pt-4 mt-4">
                <div className="flex justify-between font-semibold text-lg text-gray-900 dark:text-white">
                  <span>Total brut :</span>
                  <span>{montantTotal.toLocaleString()} FCFA</span>
                </div>

                <div className="space-y-1">
                  <Label>
                    <div className="flex items-center gap-2">
                      <Percent size={16} /> Remise (optionnelle)
                    </div>
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    max={montantTotal}
                    value={commande.remiseGlobale}
                    onChange={(e) =>
                      updateCommande({ remiseGlobale: +e.target.value })
                    }
                    placeholder="0"
                  />
                </div>

                <div className="flex justify-between font-bold text-2xl text-blue-600 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <span>Total net :</span>
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
                    max={montantNet}
                    value={commande.montantPaye}
                    onChange={(e) =>
                      updateCommande({ montantPaye: +e.target.value })
                    }
                    placeholder="0"
                  />
                  {commande.montantPaye > 0 && commande.montantPaye < montantNet && (
                    <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                      ⚠️ Reste à payer : {(montantNet - commande.montantPaye).toLocaleString()} FCFA
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </Card>

        {/* BOUTON DE SOUMISSION */}
        <Button
          className={`w-full py-3 text-lg ${
            loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
          onClick={handleSubmit}
          disabled={loading || articlesPoids.length === 0}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Traitement en cours...
            </>
          ) : (
            <>
              <ShoppingCart size={20} />
              Confirmer la commande ({articlesPoids.length}{" "}
              {articlesPoids.length > 1 ? "articles" : "article"})
            </>
          )}
        </Button>
      </div>
    </div>
  );
}