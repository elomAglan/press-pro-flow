import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyPressing,
  createPressing,
  Pressing
} from "../services/pressing.service";
import { 
  Loader2, Plus, Mail, Phone, MapPin, 
  Building2, Tag, X, Smartphone, RefreshCw 
} from "lucide-react";

// --- COMPOSANTS UI STYLISÉS ---

const Card = ({ children, className = "", title, icon: Icon }: any) => (
  <div className={`rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-6 ${className}`}>
    {title && (
      <div className="flex items-center gap-3 mb-6">
        {Icon && <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl"><Icon size={18} className="text-blue-600" /></div>}
        <h2 className="text-sm font-black uppercase tracking-widest text-gray-500">{title}</h2>
      </div>
    )}
    {children}
  </div>
);

const InfoCard = ({ label, value, icon: Icon }: any) => (
  <div className="group p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:shadow-xl hover:shadow-gray-200/50">
    <div className="flex items-center gap-4">
      <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 transition-transform group-hover:scale-110">
        <Icon size={24} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter mb-1">{label}</p>
        <p className="text-lg font-black text-gray-900 dark:text-white truncate">{value}</p>
      </div>
    </div>
  </div>
);

export default function Parametres() {
  const [pressing, setPressing] = useState<Pressing | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [form, setForm] = useState<Pressing>({
    nom: "", telephone: "", cel: "", adresse: "", logo: "", id: undefined,
  });
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);

  const loadPressing = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const p = await getMyPressing();
      setPressing(p || null);
    } catch (e: any) {
      if (!e.message?.includes("404") && e.status !== 404) {
        setError("Erreur lors de la récupération des données.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadPressing(); }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setPreviewLogo(result);
        setForm(prev => ({ ...prev, logo: result.split(",")[1] }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!form.nom || !form.telephone || !form.adresse) return;
    setIsLoading(true);
    try {
      await createPressing(form);
      setIsDialogOpen(false);
      await loadPressing();
    } catch (e: any) {
      setError(e.message || "Erreur lors de la création");
    } finally {
      setIsLoading(false);
    }
  };

  const getLogoSource = (logo: string | undefined | null) => {
    if (logo) return `data:image/png;base64,${logo}`;
    return null;
  };

  if (isLoading && !pressing) return (
    <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Chargement des paramètres...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      {/* HEADER : Largeur totale sans bridage */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Paramètres</h1>
          <p className="text-gray-500 font-medium">Gestion et identité de votre pressing</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={loadPressing} 
            className="p-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm hover:text-blue-600 transition-colors"
          >
            <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
          </button>
          {pressing && (
            <button
              onClick={() => navigate('/tarifs')}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all"
            >
              <Tag size={18} /> Tarifs des prestations
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-2 border-red-100 text-red-600 rounded-2xl font-bold flex items-center gap-3">
          <X size={20} /> {error}
        </div>
      )}

      {/* CONTENU PRINCIPAL */}
      {pressing ? (
        <div className="space-y-8">
          {/* BANNIÈRE ET IDENTITÉ */}
          <Card className="overflow-hidden !p-0">
            <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 w-full" />
            <div className="px-8 pb-8">
              <div className="relative -mt-12 mb-6 flex flex-col md:flex-row md:items-end gap-6">
                <div className="w-32 h-32 rounded-[2rem] bg-white dark:bg-gray-900 p-2 shadow-2xl border-4 border-white dark:border-gray-900 flex items-center justify-center">
                  {pressing.logo ? (
                    <img src={getLogoSource(pressing.logo)!} className="w-full h-full object-contain" alt="Logo" />
                  ) : (
                    <Building2 size={50} className="text-gray-200" />
                  )}
                </div>
                <div className="pb-2">
                  <h2 className="text-4xl font-black text-gray-900 dark:text-white">{pressing.nom}</h2>
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <span className="w-2 h-2 rounded-full bg-green-500" /> Profil Actif
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* GRILLE D'INFORMATIONS : 4 colonnes sur PC, 2 sur tablette, 1 sur mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <InfoCard label="Téléphone Principal" value={pressing.telephone} icon={Phone} />
            <InfoCard label="Mobile / WhatsApp" value={pressing.cel || "Non renseigné"} icon={Smartphone} />
            <InfoCard label="Adresse" value={pressing.adresse} icon={MapPin} />
            <InfoCard label="Email Contact" value={pressing.email || "Non renseigné"} icon={Mail} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-gray-900 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-800 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <Plus size={40} className="text-blue-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">Aucun pressing configuré</h2>
          <p className="text-gray-500 max-w-sm mt-2 mb-8 font-medium">Créez votre profil pour commencer à gérer vos tarifs et vos rapports.</p>
          <button 
            onClick={() => setIsDialogOpen(true)}
            className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/30"
          >
            Créer mon profil maintenant
          </button>
        </div>
      )}

      {/* MODAL DE CRÉATION (S'affiche par-dessus) */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black">Nouveau Pressing</h3>
                <button onClick={() => setIsDialogOpen(false)} className="text-gray-400 hover:text-gray-900"><X size={24} /></button>
              </div>
              
              <div className="space-y-5">
                <div className="flex flex-col items-center mb-4">
                  <div className="relative w-24 h-24 rounded-3xl bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                    {previewLogo ? <img src={previewLogo} className="w-full h-full object-contain" /> : <Plus className="text-gray-300" />}
                    <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                  <span className="text-[10px] text-gray-400 mt-2 uppercase font-black">Ajouter un logo</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase ml-1">Nom de l'établissement</label>
                    <input className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none mt-1" value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-black text-gray-400 uppercase ml-1">Téléphone</label>
                      <input className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none mt-1" value={form.telephone} onChange={e => setForm({...form, telephone: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-xs font-black text-gray-400 uppercase ml-1">WhatsApp</label>
                      <input className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none mt-1" value={form.cel || ""} onChange={e => setForm({...form, cel: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase ml-1">Adresse physique</label>
                    <input className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none mt-1" value={form.adresse} onChange={e => setForm({...form, adresse: e.target.value})} />
                  </div>
                </div>

                <button 
                  onClick={handleSubmit}
                  disabled={!form.nom || !form.telephone || !form.adresse || isLoading}
                  className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 hover:bg-blue-700 disabled:bg-gray-200 transition-all mt-6"
                >
                  {isLoading ? <Loader2 className="animate-spin mx-auto" /> : "Finaliser la configuration"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}