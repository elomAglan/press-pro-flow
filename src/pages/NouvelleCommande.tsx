import React, { useState, useMemo, useEffect } from "react";
import { Plus, Trash2, X, Calendar, User, ShoppingCart, Shirt  } from "lucide-react";

// ---- TYPES ----------------------------------------------------

type Client = { id: string; nom: string; telephone: string };
type Tarif = { typeArticle: string; service: string; prix: number };
type TarifSet = Record<"standard" | "express", Tarif[]>;

type Article = {
  id: string;
  type: string;
  service: string;
  quantite: number;
  prixUnitaire: number;
  priceBasis: "standard" | "express";
};

// ---- DATA -----------------------------------------------------

const clients: Client[] = [
  { id: "1", nom: "Jean Dupont", telephone: "77 000 00 00" },
  { id: "2", nom: "Aminata Traoré", telephone: "77 111 11 11" },
  { id: "3", nom: "Moussa Diallo", telephone: "78 222 22 22" },
];

const tarifs: TarifSet = {
  standard: [
    { typeArticle: "Chemise", service: "Lavage + Repassage", prix: 1500 },
    { typeArticle: "Pantalon", service: "Lavage + Repassage", prix: 2000 },
    { typeArticle: "Robe", service: "Nettoyage à Sec", prix: 4500 },
  ],
  express: [
    { typeArticle: "Chemise", service: "Lavage + Repassage", prix: 2000 },
    { typeArticle: "Pantalon", service: "Lavage + Repassage", prix: 2700 },
    { typeArticle: "Robe", service: "Nettoyage à Sec", prix: 6000 },
  ],
};

// ---- HELPERS --------------------------------------------------

const getPrice = (t: string, s: string, mode: "standard" | "express") =>
  tarifs[mode].find(x => x.typeArticle === t && x.service === s)?.prix ?? 0;

const calcDelivery = (date: string, mode: "standard" | "express") => {
  if (mode === "express") return date;
  const d = new Date(date);
  d.setDate(d.getDate() + 3);
  return d.toISOString().slice(0, 10);
};

// ---- UI ELEMENTS (épurés + premium) ---------------------------

const Card = ({ children, className = "" }: any) =>
  <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 ${className}`}>
    {children}
  </div>;

const Input = (p: any) =>
  <input {...p}
    className={`w-full border rounded-lg px-3 py-2 text-sm transition bg-white dark:bg-gray-700 dark:text-white ${p.className}`}
  />;

const Select = ({ value, onChange, children }: any) =>
  <select value={value} onChange={e => onChange(e.target.value)}
    className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-white">
    {children}
  </select>;

const Button = ({ children, className = "", ...props }: any) =>
  <button {...props}
    className={`px-4 py-2 rounded-lg text-white text-sm font-semibold shadow transition ${className}`}>
    {children}
  </button>;

// ---- PRINCIPAL COMPONENT --------------------------------------

export default function NouvelleCommande() {

  const [cmd, setCmd] = useState({
    client: "",
    dateReception: new Date().toISOString().slice(0, 10),
    type: "standard" as "standard" | "express",
    remise: 0,
  });

  const [draft, setDraft] = useState({ type: "", service: "", quantite: 1 });
  const [articles, setArticles] = useState<Article[]>([]);

  const types = [...new Set(tarifs.standard.map(t => t.typeArticle))];
  const services = [...new Set(tarifs.standard.map(t => t.service))];

  const draftPrice = useMemo(
    () => getPrice(draft.type, draft.service, cmd.type),
    [draft, cmd.type]
  );

  // Ajouter linge
  const addArticle = () => {
    if (!draft.type || !draft.service) return;
    setArticles(a => [
      ...a,
      {
        id: crypto.randomUUID(),
        ...draft,
        prixUnitaire: draftPrice,
        priceBasis: cmd.type,
      },
    ]);
    setDraft({ type: "", service: "", quantite: 1 });
  };

  // Recalcul des prix selon Standard / Express
  useEffect(() => {
    setArticles(list =>
      list.map(a => ({
        ...a,
        prixUnitaire: getPrice(a.type, a.service, cmd.type),
        priceBasis: cmd.type,
      }))
    );
  }, [cmd.type]);

  const total = useMemo(
    () => articles.reduce((s, a) => s + a.prixUnitaire * a.quantite, 0),
    [articles]
  );

  const livraison = calcDelivery(cmd.dateReception, cmd.type);
  const totalNet = Math.max(0, total - cmd.remise);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-extrabold flex items-center gap-2">
          <ShoppingCart className="text-blue-600" /> Nouvelle commande
        </h1>
        <Button className="bg-red-600 hover:bg-red-700 flex items-center gap-1">
          <X size={18}/> Annuler
        </Button>
      </div>

      {/* --- INFOS CLIENT ET COMMANDES --- */}
      <Card className="space-y-5">

        <div className="grid md:grid-cols-2 gap-5">

          {/* Client */}
          <div className="space-y-1">
            <label className="font-semibold flex items-center gap-2 text-sm">
              <User size={16}/> Client
            </label>
            <Select value={cmd.client} onChange={v => setCmd({ ...cmd, client: v })}>
              <option value="">Sélectionner un client</option>
              {clients.map(c => (
                <option key={c.id} value={c.telephone}>
                  {c.telephone} — {c.nom}
                </option>
              ))}
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-1">
            <label className="font-semibold flex items-center gap-2 text-sm"><Calendar size={16}/> Réception</label>
            <Input type="date" value={cmd.dateReception}
              onChange={e => setCmd({ ...cmd, dateReception: e.target.value })} />

            <p className="text-xs mt-1 text-blue-600 font-medium">
              Livraison prévue : {livraison}
            </p>
          </div>
        </div>

        {/* Type commande */}
        <div className="space-y-1">
          <label className="font-semibold text-sm">Type de commande</label>
          <Select value={cmd.type} onChange={v => setCmd({ ...cmd, type: v })}>
            <option value="standard">Standard (J+3)</option>
            <option value="express">Express (Jour J)</option>
          </Select>
        </div>

      </Card>

      {/* --- AJOUT LINGE --- */}
      <Card className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
            <Shirt size={20} className="text-blue-600" />
        </h2>

        <div className="grid md:grid-cols-4 gap-4">

          {/* Linge */}
          <Select value={draft.type}
            onChange={v => setDraft({ ...draft, type: v })}>
            <option value="">Linge</option>
            {types.map(l => <option key={l}>{l}</option>)}
          </Select>

          {/* Service */}
          <Select value={draft.service}
            onChange={v => setDraft({ ...draft, service: v })}>
            <option value="">Service</option>
            {services.map(s => <option key={s}>{s}</option>)}
          </Select>

          {/* Quantité */}
          <Input type="number" min={1}
            value={draft.quantite}
            onChange={e => setDraft({ ...draft, quantite: +e.target.value })} />

          {/* Add button */}
          <Button className="bg-green-600 hover:bg-green-700 flex items-center justify-center gap-1"
            onClick={addArticle}>
            <Plus size={16}/> Ajouter
          </Button>

        </div>

        {draft.type && draft.service && (
          <p className={`text-sm font-semibold ${cmd.type === "express" ? "text-red-600" : "text-gray-700"}`}>
            Prix unitaire ({cmd.type}) : {draftPrice.toLocaleString()} FCFA
          </p>
        )}
      </Card>

      {/* --- LISTE ARTICLES --- */}
      <Card className="space-y-4">
        <h2 className="text-lg font-bold">Articles ({articles.length})</h2>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {articles.map(a => (
            <div key={a.id}
              className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border">

              <div>
                <p className="font-semibold">{a.type} — {a.service}</p>
                <p className={`text-sm ${a.priceBasis === "express"
                    ? "text-red-600 font-semibold"
                    : "text-gray-600"}`}>
                  {a.quantite} × {a.prixUnitaire.toLocaleString()} FCFA
                </p>
              </div>

              <button
                onClick={() => setArticles(x => x.filter(i => i.id !== a.id))}
                className="text-red-600 hover:text-red-700">
                <Trash2 size={18}/>
              </button>
            </div>
          ))}
        </div>

        {/* Totaux */}
        <div className="space-y-2 border-t pt-3">
          <div className="flex justify-between font-semibold text-lg">
            <span>Total :</span> 
            <span>{total.toLocaleString()} FCFA</span>
          </div>

          <Input type="number" min={0} value={cmd.remise}
            onChange={e => setCmd({ ...cmd, remise: +e.target.value })} />

          <div className="flex justify-between font-bold text-2xl text-blue-600 mt-2">
            <span>Total Net :</span> 
            <span>{totalNet.toLocaleString()} FCFA</span>
          </div>
        </div>
      </Card>

      <Button className="bg-blue-600 w-full py-3 hover:bg-blue-700 text-lg">
        Confirmer la commande
      </Button>

    </div>
  );
}
