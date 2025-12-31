import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Plus,
  Trash2,
  X,
  ShoppingCart,
  Shirt,
  Loader2,
  Percent,
  CreditCard,
  Search,
  Check,
  User,
  Tag,       // 🏷️ Pour l'article
  Scissors   // ✂️ Pour le service
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
  <label className="font-semibold text-sm text-gray-700 dark:text-gray-200 mb-1 block">
    {children}
  </label>
);

const Input = ({ className = "", ...props }: any) => (
  <input
    {...props}
    className={`w-full border rounded-lg px-3 py-2 text-sm transition bg-white dark:bg-gray-700 dark:text-white ${className}`}
  />
);

const Button = ({ children, className = "", ...props }: any) => (
  <button
    {...props}
    className={`px-4 py-2 rounded-lg text-white text-sm font-semibold shadow transition flex items-center justify-center gap-2 ${className}`}
  >
    {children}
  </button>
);

// ---- COMPOSANT RÉUTILISABLE : SEARCHABLE SELECT ----------------
// C'est ici que la magie opère pour dynamiser n'importe quel champ
const SearchableSelect = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  renderOption, // Fonction optionnelle pour personnaliser l'affichage dans la liste
  icon: Icon = Search // Icône par défaut
}: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(value || "");
  const containerRef = useRef<HTMLDivElement>(null);

  // Synchroniser la recherche si la valeur externe change (ex: reset)
  useEffect(() => {
    setSearch(value);
  }, [value]);

  // Fermer si clic dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Si l'utilisateur a tapé un truc qui n'est pas sélectionné, on peut soit laisser, soit reset.
        // Ici on laisse le texte pour permettre la recherche libre si besoin, ou on force la synchro.
        if (!value) setSearch(""); 
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  // Filtrage
  const filteredOptions = useMemo(() => {
    if (!options) return [];
    return options.filter((opt: any) => {
      const text = typeof opt === "string" ? opt : (opt.label || opt.service || opt.nom);
      return text.toLowerCase().includes(search.toLowerCase());
    });
  }, [options, search]);

  const handleSelect = (option: any) => {
    // Si l'option est un string, on l'utilise directement, sinon on cherche la propriété pertinente
    const valueToSet = typeof option === "string" ? option : (option.service || option.nom);
    onChange(valueToSet, option); // On renvoie aussi l'objet complet si besoin
    setSearch(valueToSet);
    setIsOpen(false);
  };

  return (
    <div className="space-y-1 relative" ref={containerRef}>
      <Label>{label}</Label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder={placeholder}
          className="pl-9 pr-8"
          value={search}
          disabled={disabled}
          onChange={(e: any) => {
            setSearch(e.target.value);
            setIsOpen(true);
            if (e.target.value === "") onChange("", null);
          }}
          onFocus={() => !disabled && setIsOpen(true)}
        />
        {search && !disabled && (
          <button
            onClick={() => {
              setSearch("");
              onChange("", null);
              setIsOpen(true);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && !disabled && filteredOptions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {filteredOptions.map((opt: any, idx: number) => {
            const isSelected = (typeof opt === "string" ? opt : (opt.service || opt.nom)) === value;
            return (
              <div
                key={idx}
                onClick={() => handleSelect(opt)}
                className="px-4 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-600 flex justify-between items-center transition-colors border-b dark:border-gray-600 last:border-0"
              >
                {renderOption ? renderOption(opt) : (
                  <span className="text-gray-900 dark:text-gray-100 font-medium">
                    {typeof opt === "string" ? opt : (opt.service || opt.nom)}
                  </span>
                )}
                {isSelected && <Check size={16} className="text-green-600" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ---- MAIN COMPONENT -------------------------------------------
export default function NouvelleCommande({ onCancel }: any) {
  const navigate = useNavigate();
  const today = getTodayString();

  // State principal
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
  const [showMontantWarning, setShowMontantWarning] = useState(false);

  // --- RECHERCHE CLIENT ---
  // On garde le state du client séparé pour gérer l'affichage du nom vs l'ID stocké
  const [clientSearchName, setClientSearchName] = useState("");

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

  // Handlers
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
    // Reset partiel pour enchainer rapidement
    setDraftArticle({ type: "", service: "", quantite: 1 });
  };

  const handleSupprimerArticle = (articleId: string) => {
    setArticles((prev) => prev.filter((a) => a.id !== articleId));
  };

  const handleSubmit = async () => {
    if (!commande.clientId) return alert("⚠️ Veuillez sélectionner un client.");
    if (!commande.dateReception) return alert("⚠️ Date de réception manquante.");
    if (!commande.dateLivraison) return alert("⚠️ Date de livraison manquante.");
    if (articles.length === 0) return alert("⚠️ Ajoutez au moins un article.");
    if (commande.remiseGlobale > montantTotal) return alert("⚠️ Remise invalide.");
    if (commande.montantPaye > montantNet) return alert("⚠️ Montant payé trop élevé.");

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

      if (!response.ok) throw new Error("Erreur serveur");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      window.URL.revokeObjectURL(url);
      navigate("/commandes");
    } catch (err: any) {
      alert(err.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 pb-20">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-extrabold flex items-center gap-2">
          <ShoppingCart className="text-blue-600" /> Nouvelle commande
        </h1>
        <div className="flex gap-2">
          <Button className="bg-gray-600 hover:bg-gray-700" onClick={() => navigate("/commande-pesage")}>
            🏋️‍♂️ Commande par pesage
          </Button>
          <Button className="bg-red-600 hover:bg-red-700" onClick={() => navigate("/commandes")}>
            <X size={18} /> Annuler
          </Button>
        </div>
      </div>

      {/* CLIENT ET DATES */}
      <Card className="space-y-5">
        <div className="grid md:grid-cols-3 gap-5">
          
          {/* CHAMP CLIENT DYNAMISÉ AVEC LE NOUVEAU COMPOSANT */}
          <SearchableSelect
            label="Client"
            placeholder="Rechercher nom ou tél..."
            value={clientSearchName}
            options={clients}
            icon={User}
            onChange={(val: string, obj: Client | null) => {
              setClientSearchName(val);
              updateCommande({ clientId: obj ? obj.id : "" });
            }}
            renderOption={(c: Client) => (
              <div>
                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{c.nom}</p>
                <p className="text-xs text-gray-500">{c.telephone}</p>
              </div>
            )}
          />

          <div className="space-y-1">
            <Label>Date de réception</Label>
            <Input
              type="date"
              min={today}
              value={commande.dateReception}
              onChange={(e: any) => updateCommande({ dateReception: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <Label>Date de livraison</Label>
            <Input
              type="date"
              min={commande.dateReception || today}
              value={commande.dateLivraison}
              onChange={(e: any) => updateCommande({ dateLivraison: e.target.value })}
            />
          </div>
        </div>
      </Card>

      {/* AJOUTER UN ARTICLE */}
      <Card className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Shirt size={20} className="text-blue-600" /> Ajouter un article
        </h2>

        <div className="grid md:grid-cols-4 gap-4 items-end">
          
          {/* CHAMP ARTICLE DYNAMISÉ */}
          <SearchableSelect
            label="Article"
            placeholder="Ex: Chemise, Pantalon..."
            value={draftArticle.type}
            options={typesArticles} // Liste de strings simple
            icon={Tag}
            onChange={(val: string) => updateDraftArticle({ type: val, service: "" })} 
          />

          {/* CHAMP SERVICE DYNAMISÉ */}
          <SearchableSelect
            label="Service"
            placeholder="Ex: Lavage, Repassage..."
            value={draftArticle.service}
            options={servicesDisponibles} // Liste d'objets {service, prix}
            icon={Scissors}
            disabled={!draftArticle.type}
            onChange={(val: string) => updateDraftArticle({ service: val })}
            renderOption={(s: any) => (
              <div className="flex justify-between w-full">
                <span className="font-medium text-gray-700 dark:text-gray-200">{s.service}</span>
                <span className="text-blue-600 font-bold text-sm">{s.prix.toLocaleString()} FCFA</span>
              </div>
            )}
          />

          <div className="space-y-1">
            <Label>Quantité</Label>
            <Input
              type="number"
              min={1}
              value={draftArticle.quantite}
              onChange={(e: any) => updateDraftArticle({ quantite: +e.target.value })}
            />
          </div>

          <Button
            className="bg-green-600 hover:bg-green-700 h-[38px]"
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

        {/* RESTE DU CALCUL DU PRIX IDENTIQUE À AVANT... */}
        {articles.length > 0 && (
          <div className="space-y-3 border-t pt-3">
            <div className="flex justify-between font-semibold text-lg">
              <span>Total :</span>
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
                onChange={(e: any) =>
                  updateCommande({ remiseGlobale: Math.min(+e.target.value, montantTotal) })
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
                onChange={(e: any) => {
                  const value = +e.target.value;
                  if (value > montantNet) {
                    setShowMontantWarning(true);
                    updateCommande({ montantPaye: montantNet });
                    setTimeout(() => setShowMontantWarning(false), 3000);
                  } else {
                    setShowMontantWarning(false);
                    updateCommande({ montantPaye: value });
                  }
                }}
              />
              {showMontantWarning && (
                <div className="text-sm text-red-600 mt-2">
                  ⚠️ Montant ajusté au total net.
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      <Button
        className={`w-full py-3 text-lg ${
          loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
        }`}
        onClick={handleSubmit}
        disabled={loading || articles.length === 0}
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : "Confirmer la commande"}
      </Button>
    </div>
  );
}