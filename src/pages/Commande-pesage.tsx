import React, { useState, useMemo, useEffect } from "react";
import { Plus, Trash2, X, ShoppingCart, Scale, Percent, CreditCard, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAllClients } from "../services/client.service";
import { createCommandeAvecPdf } from "../services/commande.service";
import { getAllTarifPoids } from "../services/tarifPoids.Service";

// ---- TYPES ----
type Client = { id: string; nom: string; telephone: string };
type TarifKilo = { id: number; tranchePoids: string; service: string; prix: number };
type ArticlePoids = { 
  id: string; 
  tarifKiloId: number;
  tranchePoids: string; 
  service: string; 
  prix: number;
  poids: number;
};
type CommandeState = { 
  clientId: string; 
  dateReception: string; 
  dateLivraison: string; 
  remiseGlobale: number; 
  montantPaye: number; 
};
type DraftArticlePoids = { 
  tarifKiloId: number;
  tranchePoids: string; 
  service: string; 
  prix: number;
  poids: number;
};

// ---- UTILS ----
const getTodayString = () => new Date().toISOString().slice(0, 10);

// Retourne la valeur maximale autorisée pour une tranche donnée
const getMaxWeightForTranche = (tranche: string) => {
  if (!tranche) return Infinity;
  if (tranche.includes("1Kg-4Kg")) return 4;
  if (tranche.includes("5Kg-9Kg")) return 9;
  if (tranche.includes("10Kg-20Kg")) return 20;
  if (tranche.includes("Supérieur à 20Kg")) return Infinity;
  return Infinity;
};

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
  const navigate = useNavigate();
  const today = getTodayString();

  const [commande, setCommande] = useState<CommandeState>({
    clientId: "",
    dateReception: today,
    dateLivraison: "",
    remiseGlobale: 0,
    montantPaye: 0,
  });

  const [draftArticlePoids, setDraftArticlePoids] = useState<DraftArticlePoids>({
    tarifKiloId: 0,
    tranchePoids: "",
    service: "",
    prix: 0,
    poids: 0,
  });

  const [articlesPoids, setArticlesPoids] = useState<ArticlePoids[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [tarifsKilo, setTarifsKilo] = useState<TarifKilo[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Charger les clients et les tarifs au kilo depuis le backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const [clientsData, tarifsData] = await Promise.all([
          getAllClients(),
          getAllTarifPoids(),
        ]);
        setClients(clientsData);
        setTarifsKilo(tarifsData);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        alert("❌ Impossible de charger les données nécessaires");
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  // Obtenir les tranches de poids uniques disponibles
  const tranchesDisponibles = useMemo(() => {
    const tranches = [...new Set(tarifsKilo.map((t) => t.tranchePoids))];
    return tranches.sort();
  }, [tarifsKilo]);

  // Filtrer les services disponibles selon la tranche sélectionnée
  const servicesDisponibles = useMemo(() => {
    if (!draftArticlePoids.tranchePoids) return [];
    return tarifsKilo
      .filter((t) => t.tranchePoids === draftArticlePoids.tranchePoids)
      .map((t) => ({ service: t.service, id: t.id, prix: t.prix }));
  }, [draftArticlePoids.tranchePoids, tarifsKilo]);

  // Calcul du montant total (le poids est informatif et n'affecte pas le prix)
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

  const handleServiceChange = (serviceValue: string) => {
    const tarif = servicesDisponibles.find((s) => s.service === serviceValue);
    if (tarif) {
      updateDraftArticlePoids({
        service: tarif.service,
        tarifKiloId: tarif.id,
        prix: tarif.prix,
      });
    }
  };

  const handleAjouterArticlePoids = () => {
    if (!draftArticlePoids.tranchePoids || !draftArticlePoids.service) {
      alert("⚠️ Veuillez sélectionner une tranche de poids et un service.");
      return;
    }

    if (!draftArticlePoids.poids || draftArticlePoids.poids <= 0) {
      alert("⚠️ Veuillez saisir un poids valide.");
      return;
    }

    // Vérifier la contrainte de tranche — le poids ne doit pas dépasser la borne supérieure
    const maxAllowed = getMaxWeightForTranche(draftArticlePoids.tranchePoids);
    if (Number.isFinite(maxAllowed) && draftArticlePoids.poids > maxAllowed) {
      alert(`⚠️ Le poids ne doit pas dépasser ${maxAllowed} Kg pour la tranche sélectionnée.`);
      return;
    }

    const nouvelArticle: ArticlePoids = {
      id: crypto.randomUUID(),
      tarifKiloId: draftArticlePoids.tarifKiloId,
      tranchePoids: draftArticlePoids.tranchePoids,
      service: draftArticlePoids.service,
      prix: draftArticlePoids.prix,
      poids: draftArticlePoids.poids,
    };

    setArticlesPoids((prev) => [...prev, nouvelArticle]);
    setDraftArticlePoids({ 
      tarifKiloId: 0,
      tranchePoids: "", 
      service: "", 
      prix: 0, 
      poids: 0 
    });
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

    if (commande.remiseGlobale > montantTotal) {
      alert("⚠️ La remise ne peut pas dépasser le montant total de la commande.");
      return;
    }

    if (commande.montantPaye > montantNet) {
      alert("⚠️ Le montant payé ne peut pas dépasser le total net de la commande.");
      return;
    }

    try {
      setLoading(true);

      // Préparer le payload selon le format backend attendu
      const payload = {
        clientId: Number(commande.clientId),
        tarifKiloIds: articlesPoids.map((a) => a.tarifKiloId),
        poids: articlesPoids.map((a) => a.poids),
        remiseGlobale: commande.remiseGlobale,
        dateReception: commande.dateReception,
        dateLivraison: commande.dateLivraison,
        montantPaye: commande.montantPaye,
      };

      console.log("📦 Données envoyées au backend:", JSON.stringify(payload, null, 2));

      // Appel au backend avec génération du PDF
      const pdfBlob = await createCommandeAvecPdf(payload);

      // Ouvrir le PDF dans un nouvel onglet
      const url = window.URL.createObjectURL(pdfBlob);
      window.open(url, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);

      alert("✅ Commande par pesage créée avec succès !");

      // Rediriger vers la liste des commandes
      navigate("/commandes");
    } catch (err: any) {
      console.error("Erreur lors de la création:", err);
      alert("❌ " + (err.message || "Erreur lors de la création de la commande"));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (
      articlesPoids.length > 0 &&
      !window.confirm("Êtes-vous sûr de vouloir annuler ? Les données seront perdues.")
    ) {
      return;
    }
    navigate("/commandes");
  };

  // Afficher un loader pendant le chargement des données
  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
          <p className="text-gray-600 dark:text-gray-400">Chargement des données...</p>
        </div>
      </div>
    );
  }

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

          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <Label>Tranche de poids *</Label>
              <Select
                value={draftArticlePoids.tranchePoids}
                onChange={(v) =>
                  updateDraftArticlePoids({ 
                    tranchePoids: v, 
                    service: "", 
                    prix: 0,
                    tarifKiloId: 0 
                  })
                }
              >
                <option value="">Choisir une tranche...</option>
                {tranchesDisponibles.map((t) => (
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
                onChange={handleServiceChange}
                disabled={!draftArticlePoids.tranchePoids}
              >
                <option value="">Choisir un service...</option>
                {servicesDisponibles.map((s) => (
                  <option key={s.id} value={s.service}>
                    {s.service}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label>Poids (Kg) *</Label>
              <Input
                type="number"
                min="0.1"
                step="0.1"
                value={draftArticlePoids.poids || ""}
                max={
                  Number.isFinite(getMaxWeightForTranche(draftArticlePoids.tranchePoids))
                    ? getMaxWeightForTranche(draftArticlePoids.tranchePoids)
                    : undefined
                }
                onChange={(e) => {
                  const raw = parseFloat(e.target.value) || 0;
                  const max = getMaxWeightForTranche(draftArticlePoids.tranchePoids);
                  if (Number.isFinite(max) && raw > max) {
                    updateDraftArticlePoids({ poids: max });
                    alert(`⚠️ Le poids ne doit pas dépasser ${max} Kg pour la tranche sélectionnée.`);
                  } else {
                    updateDraftArticlePoids({ poids: raw });
                  }
                }}
                placeholder="Ex: 2.5"
              />
            </div>

            <Button
              className="bg-green-600 hover:bg-green-700 mt-6"
              onClick={handleAjouterArticlePoids}
              disabled={
                !draftArticlePoids.tranchePoids || 
                !draftArticlePoids.service || 
                !draftArticlePoids.poids
              }
            >
              <Plus size={16} /> Ajouter
            </Button>
          </div>

          {draftArticlePoids.prix > 0 && draftArticlePoids.poids > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Prix unitaire : <strong>{draftArticlePoids.prix.toLocaleString()} FCFA</strong>
                {" • "}
                Poids (info) : <strong>{draftArticlePoids.poids} Kg</strong>
                <div className="text-xs text-gray-500 mt-1">Le poids est informatif et n'affecte pas le prix.</div>
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
                Sélectionnez une tranche de poids, un service et saisissez le poids
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
                        {a.service} • {a.poids} Kg • Prix : {a.prix.toLocaleString()} FCFA
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {a.prix.toLocaleString()} FCFA
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
                      <Percent size={16} /> Remise (max: {montantTotal.toLocaleString()} FCFA)
                    </div>
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    max={montantTotal}
                    value={commande.remiseGlobale}
                    onChange={(e) =>
                      updateCommande({ remiseGlobale: Math.min(+e.target.value, montantTotal) })
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
                      <CreditCard size={16} /> Montant payé (max: {montantNet.toLocaleString()} FCFA)
                    </div>
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    max={montantNet}
                    value={commande.montantPaye}
                    onChange={(e) =>
                      updateCommande({ montantPaye: Math.min(+e.target.value, montantNet) })
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