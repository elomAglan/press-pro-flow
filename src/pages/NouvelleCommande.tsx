import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Plus, Trash2, X, ShoppingCart, Loader2, Percent, Search, Check, 
  User, Tag, Scissors, Calendar, Wallet, CheckCircle2, Receipt, CreditCard, ArrowLeft,
  Scale
} from "lucide-react";
import { getAllClients } from "../services/client.service";
import { apiFetch } from "../services/api";
import { useNavigate } from "react-router-dom";

// ---- TYPES ----
interface Client { id: string; nom: string; telephone: string; }
interface Parametre { id: number; article: string; service: string; prix: number; }
interface Article { id: string; type: string; service: string; quantite: number; prixUnitaire: number; parametreId: number; }
interface CommandeState { clientId: string; dateReception: string; dateLivraison: string; remiseGlobale: number; montantPaye: number; }

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

// ---- SELECT RECHERCHABLE AMÉLIORÉ ----
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
        <Input 
          placeholder={placeholder} 
          className="pl-9 pr-8"
          value={search} 
          disabled={disabled}
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
export default function NouvelleCommande() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [tarifs, setTarifs] = useState<Parametre[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [clientName, setClientName] = useState("");
  const [dateError, setDateError] = useState<string>("");
  
  const [cmd, setCmd] = useState<CommandeState>({ 
    clientId: "", 
    dateReception: new Date().toISOString().slice(0, 10), 
    dateLivraison: "", 
    remiseGlobale: 0, 
    montantPaye: 0 
  });

  const [draft, setDraft] = useState({ type: "", service: "", qte: 1 });

  useEffect(() => {
    getAllClients().then(setClients).catch(console.error);
    apiFetch("/api/parametre").then(setTarifs).catch(console.error);
  }, []);

  const types = useMemo(() => [...new Set(tarifs.map(t => t.article))], [tarifs]);
  const srvs = useMemo(() => tarifs.filter(t => t.article === draft.type), [draft.type, tarifs]);
  const tBrut = useMemo(() => articles.reduce((s, a) => s + a.prixUnitaire * a.quantite, 0), [articles]);
  const tNet = Math.max(0, tBrut - cmd.remiseGlobale);

  const handleAdd = () => {
    const t = tarifs.find(x => x.article === draft.type && x.service === draft.service);
    if (!t) return;
    setArticles([...articles, { 
      id: crypto.randomUUID(), 
      type: draft.type, 
      service: draft.service, 
      quantite: draft.qte, 
      prixUnitaire: t.prix, 
      parametreId: t.id 
    }]);
    setDraft({ ...draft, service: "", qte: 1 });
  };

  const validateDateLivraison = () => {
    if (!cmd.dateLivraison) { setDateError("Requise"); return false; }
    if (cmd.dateLivraison < cmd.dateReception) { setDateError("Invalide"); return false; }
    setDateError(""); return true;
  };

  const handleOpenModal = () => {
    if (!validateDateLivraison()) return;
    if (articles.length === 0) { alert("Ajoutez au moins un article"); return; }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!validateDateLivraison()) return;
    if (!cmd.clientId) { alert("Sélectionnez un client"); return; }
    setLoading(true);
    try {
      const body = { 
        clientId: Number(cmd.clientId), 
        parametreIds: articles.map(a => a.parametreId), 
        quantites: articles.map(a => a.quantite), 
        remiseGlobale: cmd.remiseGlobale, 
        montantPaye: cmd.montantPaye, 
        dateReception: cmd.dateReception, 
        dateLivraison: cmd.dateLivraison 
      };
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/commande/pdf`, {
        method: "POST", 
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("authToken")}` },
        body: JSON.stringify(body),
      });
      const blob = await res.blob();
      window.open(window.URL.createObjectURL(blob), "_blank");
      navigate("/commandes");
    } catch (e) { alert("Erreur"); } 
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-48 md:pb-32">
      {/* HEADER RESPONSIVE */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white"><ShoppingCart size={18} /></div>
            <h1 className="text-base md:text-lg font-black text-slate-800 tracking-tight">Vente</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/commande-pesage")} className="p-2 text-blue-600 bg-blue-50 rounded-lg md:hidden"><Scale size={20} /></button>
            <Button variant="secondary" className="hidden md:flex" onClick={() => navigate("/commande-pesage")}><Scale size={16} /> Pesage</Button>
            <Button variant="secondary" className="px-3 md:px-4" onClick={() => navigate("/commandes")}><ArrowLeft size={16} /><span className="hidden sm:inline">Retour</span></Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
        {/* CLIENT & DATES */}
        <Card className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SearchableSelect label="Client" placeholder="Sélectionner..." value={clientName} options={clients} icon={User}
            onChange={(v: string, o: Client) => { setClientName(v); setCmd({ ...cmd, clientId: o?.id || "" }); }}
            renderOption={(c: Client) => (<div><p className="font-bold text-gray-800">{c.nom}</p><p className="text-[10px] text-gray-400">{c.telephone}</p></div>)}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label icon={Calendar}>Réception</Label>
              <Input type="date" value={cmd.dateReception} onChange={e => setCmd({...cmd, dateReception: e.target.value})} />
            </div>
            <div>
              <div className="flex items-center justify-between"><Label icon={Calendar}>Livraison</Label></div>
              <Input type="date" min={cmd.dateReception} value={cmd.dateLivraison} 
                onChange={e => { setCmd({...cmd, dateLivraison: e.target.value}); setDateError(""); }} 
                className={dateError ? "border-red-300 bg-red-50" : ""}
              />
            </div>
          </div>
        </Card>

        {/* AJOUT ARTICLE */}
        <Card className="flex flex-col md:grid md:grid-cols-12 gap-4 bg-blue-50/40 border-blue-100">
          <div className="md:col-span-4"><SearchableSelect label="Désignation" placeholder="Ex: Robe" value={draft.type} options={types} icon={Tag} onChange={(v: string) => setDraft({...draft, type: v, service: ""})} /></div>
          <div className="md:col-span-4"><SearchableSelect label="Prestation" placeholder="Ex: Repassage" value={draft.service} options={srvs} icon={Scissors} disabled={!draft.type} onChange={(v: string) => setDraft({...draft, service: v})} renderOption={(s: Parametre) => <div className="flex justify-between w-full font-bold"><span>{s.service}</span><span className="text-blue-600">{s.prix}F</span></div>} /></div>
          <div className="grid grid-cols-3 gap-2 md:col-span-4 md:flex md:items-end">
            <div className="col-span-1"><Label icon={Plus}>Qté</Label><Input type="number" min="1" value={draft.qte} onChange={e => setDraft({...draft, qte: +e.target.value})} /></div>
            <Button variant="success" className="col-span-2 h-[42px] md:flex-1 mt-auto" onClick={handleAdd} disabled={!draft.type || !draft.service}><Plus size={18} /> Ajouter</Button>
          </div>
        </Card>

        {/* LISTE ARTICLES (CARTES SUR MOBILE) */}
        <div className="space-y-3">
          <h3 className="text-xs font-black text-gray-400 uppercase px-1">Articles ajoutés ({articles.length})</h3>
          
          {/* Version Mobile */}
          <div className="block md:hidden space-y-2">
            {articles.map(a => (
              <div key={a.id} className="bg-white p-4 rounded-xl border border-gray-200 flex justify-between items-center shadow-sm">
                <div>
                  <p className="font-bold text-slate-800">{a.type}</p>
                  <p className="text-xs text-blue-600 font-bold uppercase">{a.service}</p>
                  <p className="text-xs text-gray-500 mt-1">{a.quantite} x {a.prixUnitaire} F</p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <span className="font-black text-slate-900">{(a.quantite * a.prixUnitaire).toLocaleString()} F</span>
                  <button onClick={() => setArticles(articles.filter(it => it.id !== a.id))} className="p-2 text-red-100 bg-red-50 rounded-lg text-red-500"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>

          {/* Version Desktop (Tableau) */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase border-b">
                <tr>
                  <th className="px-6 py-4">Article & Service</th>
                  <th className="px-6 py-4 text-center">Quantité</th>
                  <th className="px-6 py-4 text-right">Total</th>
                  <th className="px-6 py-4 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {articles.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4"><span className="font-bold text-slate-800">{a.type}</span> <span className="text-blue-500 font-medium ml-2">({a.service})</span></td>
                    <td className="px-6 py-4 text-center font-black text-slate-600">{a.quantite}</td>
                    <td className="px-6 py-4 text-right font-black text-slate-900">{(a.quantite * a.prixUnitaire).toLocaleString()} F</td>
                    <td className="px-6 py-4 text-right"><button onClick={() => setArticles(articles.filter(it => it.id !== a.id))} className="text-gray-300 hover:text-red-500"><Trash2 size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {articles.length === 0 && <div className="py-12 text-center text-gray-400 font-medium bg-white rounded-xl border-2 border-dashed border-gray-200">Aucun article sélectionné</div>}
        </div>
      </div>

      {/* BARRE FLOTTANTE OPTIMISÉE (PLUS FINE) */}
<div className="fixed bottom-4 left-0 right-0 z-40 px-4 md:left-auto md:right-6 md:bottom-6">
  <div className="max-w-md mx-auto md:mx-0 bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 p-3 md:p-4">
    <div className="flex items-center justify-between gap-4">
      {/* Infos montants - Plus compactes */}
      <div className="flex items-center gap-3 pl-2">
        <div className="bg-blue-500/20 p-2 rounded-lg hidden sm:block">
          <ShoppingCart size={18} className="text-blue-400" />
        </div>
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1">Total Net</p>
          <p className="text-lg md:text-xl font-black text-white leading-none">
            {tNet.toLocaleString()} <span className="text-xs font-medium text-blue-400">F</span>
          </p>
        </div>
      </div>

      {/* Bouton d'action - Plus compact */}
      <button 
        onClick={handleOpenModal} 
        disabled={articles.length === 0 || !cmd.dateLivraison}
        className={`
          flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all active:scale-95
          ${(articles.length === 0 || !cmd.dateLivraison)
            ? "bg-slate-800 text-slate-500 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20"
          }
        `}
      >
        <span>Encaisser</span>
        <CheckCircle2 size={18} />
      </button>
    </div>
  </div>
</div>

      {/* MODAL FULLSCREEN MOBILE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full h-[95vh] md:h-auto md:max-w-2xl rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-slate-900 px-6 py-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-2"><Wallet size={20} className="text-blue-400" /><h3 className="font-bold text-lg">Paiement</h3></div>
              <button onClick={() => setIsModalOpen(false)} className="bg-white/10 p-2 rounded-full"><X size={20} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-6">
                  <div>
                    <Label icon={Percent}>Remise Accordée</Label>
                    <Input type="number" className="text-orange-600 text-xl py-3" value={cmd.remiseGlobale} onChange={e => setCmd({...cmd, remiseGlobale: Math.min(+e.target.value, tBrut)})} />
                  </div>
                  <div>
                    <Label icon={CreditCard}>Montant Versé (Acompte)</Label>
                    <Input type="number" className="text-emerald-700 text-xl py-3 border-emerald-100 bg-emerald-50/50" placeholder="0" value={cmd.montantPaye} onChange={e => setCmd({...cmd, montantPaye: Math.min(+e.target.value, tNet)})} />
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col items-center justify-center">
                  <span className="text-xs font-black text-slate-400 uppercase mb-2">Net à Percevoir</span>
                  <div className="text-4xl font-black text-slate-900 mb-6">{tNet.toLocaleString()} F</div>
                  <div className="w-full space-y-3 text-sm font-bold border-t border-slate-200 pt-5">
                    <div className="flex justify-between text-slate-500"><span>Total Brut</span><span>{tBrut.toLocaleString()} F</span></div>
                    <div className="flex justify-between text-orange-600"><span>Remise</span><span>-{cmd.remiseGlobale.toLocaleString()} F</span></div>
                    <div className="flex justify-between text-blue-600 text-lg pt-2 border-t border-dashed border-slate-300">
                      <span>Reste à payer</span>
                      <span>{(tNet - cmd.montantPaye).toLocaleString()} F</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={handleSubmit} 
                disabled={loading}
                className="w-full py-4 rounded-2xl text-lg font-black shadow-xl flex items-center justify-center gap-3 bg-blue-600 text-white active:scale-95 transition-transform"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <><Receipt size={24} /> VALIDER & IMPRIMER</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}