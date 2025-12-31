import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Plus, Trash2, X, ShoppingCart, Scale, Percent, CreditCard, Loader2,
  Calendar, User, Check, Wallet, CheckCircle2, Receipt, ArrowLeft, Info, Search
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAllClients } from "../services/client.service";
import { createCommandeAvecPdf } from "../services/commande.service";
import { getAllTarifPoids } from "../services/tarifPoids.Service";

// ---- TYPES ----
type Client = { id: string; nom: string; telephone: string };
type TarifKilo = { id: number; tranchePoids: string; service: string; prix: number };
type ArticlePoids = { id: string; tarifKiloId: number; tranchePoids: string; service: string; prix: number; poids: number; };
type CommandeState = { clientId: string; dateReception: string; dateLivraison: string; remiseGlobale: number; montantPaye: number; };
type DraftArticlePoids = { tarifKiloId: number; tranchePoids: string; service: string; prix: number; poids: number; };

// ---- MINI-COMPOSANTS UI ----
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-4 ${className}`}>{children}</div>
);

const Label = ({ children, icon: Icon }: { children: React.ReactNode; icon?: any }) => (
  <label className="flex items-center gap-2 text-[10px] md:text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1.5">
    {Icon && <Icon size={12} className="text-blue-500" />} {children}
  </label>
);

const Input = ({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={`w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-3 py-2.5 text-sm font-bold focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all outline-none ${className}`} />
);

const Button = ({ children, variant = "primary", className = "", ...props }: any) => {
  const variants: any = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50",
    success: "bg-emerald-600 text-white hover:bg-emerald-700",
  };
  return (
    <button {...props} className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

// ---- SELECT RECHERCHABLE ----
const SearchableSelect = ({ label, value, onChange, options, placeholder, icon: Icon, renderOption, disabled }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(value || "");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setSearch(value); }, [value]);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    if (!options) return [];
    return options.filter((opt: any) => {
      const text = typeof opt === "string" ? opt : (opt.service || opt.nom || "");
      return text.toLowerCase().includes(search.toLowerCase());
    });
  }, [options, search]);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearch("");
    onChange("", null);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <Label icon={Icon}>{label}</Label>
      <div className="relative">
        <Input placeholder={placeholder} className="pl-9 pr-8" value={search} disabled={disabled}
          onChange={(e: any) => { setSearch(e.target.value); setIsOpen(true); if (!e.target.value) onChange("", null); }}
          onFocus={() => !disabled && setIsOpen(true)}
        />
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        {value && !disabled && (
          <button onClick={handleClear} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400"><X size={14} /></button>
        )}
      </div>
      {isOpen && !disabled && filtered.length > 0 && (
        <div className="absolute z-[60] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {filtered.map((opt: any, i: number) => (
            <div key={i} onClick={() => { 
              const v = typeof opt === "string" ? opt : (opt.service || opt.nom);
              onChange(v, opt); setSearch(v); setIsOpen(false);
            }} className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm border-b last:border-0 border-gray-100 flex justify-between items-center">
              {renderOption ? renderOption(opt) : <span className="font-bold text-gray-700">{opt}</span>}
              {((typeof opt === "string" ? opt : (opt.service || opt.nom)) === value) && <Check size={14} className="text-blue-600" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ---- COMPOSANT PRINCIPAL ----
export default function CommandePesage() {
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [dateError, setDateError] = useState<string>("");

  const [clients, setClients] = useState<Client[]>([]);
  const [tarifsKilo, setTarifsKilo] = useState<TarifKilo[]>([]);
  const [articlesPoids, setArticlesPoids] = useState<ArticlePoids[]>([]);
  const [clientName, setClientName] = useState("");

  const [commande, setCommande] = useState<CommandeState>({
    clientId: "", dateReception: today, dateLivraison: "", remiseGlobale: 0, montantPaye: 0,
  });

  const [draft, setDraft] = useState<DraftArticlePoids>({
    tarifKiloId: 0, tranchePoids: "", service: "", prix: 0, poids: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const [clientsData, tarifsData] = await Promise.all([getAllClients(), getAllTarifPoids()]);
        setClients(clientsData);
        setTarifsKilo(tarifsData);
      } catch (error) { console.error(error); } 
      finally { setLoadingData(false); }
    };
    fetchData();
  }, []);

  const tranchesDisponibles = useMemo(() => [...new Set(tarifsKilo.map((t) => t.tranchePoids))].sort(), [tarifsKilo]);
  const servicesDisponibles = useMemo(() => {
    if (!draft.tranchePoids) return [];
    return tarifsKilo.filter((t) => t.tranchePoids === draft.tranchePoids).map((t) => ({ service: t.service, id: t.id, prix: t.prix }));
  }, [draft.tranchePoids, tarifsKilo]);

  const tBrut = useMemo(() => articlesPoids.reduce((sum, a) => sum + (a.prix ?? 0), 0), [articlesPoids]);
  const tNet = Math.max(0, tBrut - commande.remiseGlobale);

  const handleAdd = () => {
    if (!draft.tranchePoids || !draft.service || !draft.poids) return;
    setArticlesPoids([...articlesPoids, {
      id: crypto.randomUUID(),
      tarifKiloId: draft.tarifKiloId,
      tranchePoids: draft.tranchePoids,
      service: draft.service,
      prix: draft.prix * draft.poids,
      poids: draft.poids,
    }]);
    setDraft({ tarifKiloId: 0, tranchePoids: "", service: "", prix: 0, poids: 0 });
  };

  const validateDateLivraison = () => {
    if (!commande.dateLivraison) { setDateError("Requise"); return false; }
    if (commande.dateLivraison < commande.dateReception) { setDateError("Invalide"); return false; }
    setDateError(""); return true;
  };

  const handleOpenModal = () => {
    if (!validateDateLivraison()) return;
    if (articlesPoids.length === 0) { alert("Ajoutez au moins un article"); return; }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        clientId: Number(commande.clientId),
        tarifKiloIds: articlesPoids.map((a) => a.tarifKiloId),
        poids: articlesPoids.map((a) => a.poids),
        remiseGlobale: commande.remiseGlobale,
        dateReception: commande.dateReception,
        dateLivraison: commande.dateLivraison,
        montantPaye: commande.montantPaye,
      };
      const pdfBlob = await createCommandeAvecPdf(payload);
      window.open(window.URL.createObjectURL(pdfBlob), "_blank");
      navigate("/commandes");
    } catch (err) { alert("Erreur"); } 
    finally { setLoading(false); }
  };

  if (loadingData) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-48 md:pb-32">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white"><Scale size={18} /></div>
            <h1 className="text-base md:text-lg font-black text-slate-800">Vente au Kilo</h1>
          </div>
          <Button variant="secondary" className="px-3" onClick={() => navigate("/commandes")}>
            <ArrowLeft size={16} /> <span className="hidden sm:inline">Retour</span>
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
        {/* CLIENT & DATES */}
        <Card className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SearchableSelect label="Client" placeholder="Sélectionner..." value={clientName} options={clients} icon={User}
            onChange={(v: string, o: Client) => { setClientName(v); setCommande({ ...commande, clientId: o?.id || "" }); }}
            renderOption={(c: Client) => (<div><p className="font-bold text-gray-800">{c.nom}</p><p className="text-[10px] text-gray-400">{c.telephone}</p></div>)}
          />
          <div className="grid grid-cols-2 gap-3">
            <div><Label icon={Calendar}>Réception</Label><Input type="date" value={commande.dateReception} onChange={e => setCommande({...commande, dateReception: e.target.value})} /></div>
            <div>
              <Label icon={Calendar}>Livraison</Label>
              <Input type="date" min={commande.dateReception} value={commande.dateLivraison} 
                onChange={e => { setCommande({...commande, dateLivraison: e.target.value}); setDateError(""); }}
                className={dateError ? "border-red-300 bg-red-50" : ""}
              />
            </div>
          </div>
        </Card>

        {/* AJOUT ARTICLE */}
        <Card className="flex flex-col md:grid md:grid-cols-12 gap-4 bg-blue-50/40 border-blue-100">
          <div className="md:col-span-4"><SearchableSelect label="Tranche de poids" placeholder="Choisir..." value={draft.tranchePoids} options={tranchesDisponibles} icon={Scale} onChange={(v: string) => setDraft({...draft, tranchePoids: v, service: "", tarifKiloId: 0, prix: 0})} /></div>
          <div className="md:col-span-4"><SearchableSelect label="Service" placeholder="Choisir..." value={draft.service} options={servicesDisponibles} icon={Check} disabled={!draft.tranchePoids} onChange={(v: string, opt: any) => setDraft({...draft, service: v, tarifKiloId: opt?.id || 0, prix: opt?.prix || 0})} renderOption={(s: any) => <div className="flex justify-between w-full font-bold"><span>{s.service}</span><span className="text-blue-600">{s.prix}F/Kg</span></div>} /></div>
          <div className="grid grid-cols-3 gap-2 md:col-span-4 md:flex md:items-end">
            <div className="col-span-1"><Label icon={Info}>Poids</Label><Input type="number" step="0.1" value={draft.poids || ""} onChange={e => setDraft({...draft, poids: parseFloat(e.target.value) || 0})} /></div>
            <Button variant="success" className="col-span-2 h-[42px] mt-auto md:flex-1" onClick={handleAdd} disabled={!draft.tranchePoids || !draft.service || !draft.poids}><Plus size={18} /> Ajouter</Button>
          </div>
        </Card>

        {/* LISTE ARTICLES */}
        <div className="space-y-3">
          <h3 className="text-xs font-black text-gray-400 uppercase px-1">Articles ({articlesPoids.length})</h3>
          
          {/* Mobile */}
          <div className="md:hidden space-y-2">
            {articlesPoids.map(a => (
              <div key={a.id} className="bg-white p-4 rounded-xl border border-gray-200 flex justify-between items-center shadow-sm">
                <div>
                  <p className="font-bold text-slate-800">{a.tranchePoids}</p>
                  <p className="text-xs text-blue-600 font-bold uppercase">{a.service} • {a.poids} Kg</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-black text-slate-900">{a.prix.toLocaleString()} F</span>
                  <button onClick={() => setArticlesPoids(articlesPoids.filter(it => it.id !== a.id))} className="p-2 text-red-500 bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase border-b">
                <tr><th className="px-6 py-4">Tranche & Service</th><th className="px-6 py-4 text-center">Poids</th><th className="px-6 py-4 text-right">Total</th><th className="px-6 py-4 w-10"></th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {articlesPoids.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4"><span className="font-bold text-slate-800">{a.tranchePoids}</span> <span className="text-blue-500 font-medium ml-2">({a.service})</span></td>
                    <td className="px-6 py-4 text-center font-black">{a.poids} Kg</td>
                    <td className="px-6 py-4 text-right font-black">{a.prix.toLocaleString()} F</td>
                    <td className="px-6 py-4 text-right"><button onClick={() => setArticlesPoids(articlesPoids.filter(it => it.id !== a.id))} className="text-gray-300 hover:text-red-500"><Trash2 size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {articlesPoids.length === 0 && <div className="py-12 text-center text-gray-400 bg-white rounded-xl border-2 border-dashed border-gray-200">Aucun article au kilo</div>}
        </div>
      </div>

      {/* BARRE D'ENCAISSEMENT PILULE (COMPACTE) */}
      <div className="fixed bottom-4 left-0 right-0 z-40 px-4 md:left-auto md:right-6 md:bottom-6">
        <div className="max-w-md mx-auto md:mx-0 bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 p-3 md:p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 pl-2">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1">Total à payer</p>
                <p className="text-lg md:text-xl font-black text-white leading-none">
                  {tNet.toLocaleString()} <span className="text-xs font-medium text-blue-400">F</span>
                </p>
              </div>
            </div>
            <button 
              onClick={handleOpenModal} 
              disabled={articlesPoids.length === 0 || !commande.dateLivraison}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all active:scale-95
                ${(articlesPoids.length === 0 || !commande.dateLivraison) ? "bg-slate-800 text-slate-500" : "bg-blue-600 text-white shadow-lg shadow-blue-900/20"}`}
            >
              <span>Encaisser</span><CheckCircle2 size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL ENCAISSEMENT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full h-[95vh] md:h-auto md:max-w-2xl rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-slate-900 px-6 py-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-2"><Wallet size={20} className="text-blue-400" /><h3 className="font-bold text-lg">Paiement Pesage</h3></div>
              <button onClick={() => setIsModalOpen(false)} className="bg-white/10 p-2 rounded-full"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-6">
                  <div><Label icon={Percent}>Remise</Label><Input type="number" className="text-orange-600 text-xl py-3" value={commande.remiseGlobale} onChange={e => setCommande({...commande, remiseGlobale: Math.min(+e.target.value, tBrut)})} /></div>
                  <div><Label icon={CreditCard}>Versé</Label><Input type="number" className="text-emerald-700 text-xl py-3 border-emerald-100 bg-emerald-50/50" value={commande.montantPaye} onChange={e => setCommande({...commande, montantPaye: Math.min(+e.target.value, tNet)})} /></div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col items-center justify-center">
                  <span className="text-xs font-black text-slate-400 uppercase mb-2">Net à percevoir</span>
                  <div className="text-4xl font-black text-slate-900 mb-6">{tNet.toLocaleString()} F</div>
                  <div className="w-full space-y-3 text-sm font-bold border-t pt-5">
                    <div className="flex justify-between text-slate-500"><span>Brut</span><span>{tBrut.toLocaleString()} F</span></div>
                    <div className="flex justify-between text-blue-600 text-lg border-t border-dashed pt-2"><span>Reste</span><span>{(tNet - commande.montantPaye).toLocaleString()} F</span></div>
                  </div>
                </div>
              </div>
              <button onClick={handleSubmit} disabled={loading} className="w-full py-4 rounded-2xl text-lg font-black bg-blue-600 text-white shadow-xl active:scale-95 transition-all">
                {loading ? <Loader2 className="animate-spin" size={24} /> : <><Receipt size={24} /> VALIDER & IMPRIMER</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}