import { useState, useEffect } from "react";
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

export default function Parametres() {
  const [pressing, setPressing] = useState<Pressing | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const [form, setForm] = useState<Pressing>({
    nom: "",
    telephone: "",
    cel: "",
    adresse: "",
    logo: "",
    id: undefined,
  });

  const [previewLogo, setPreviewLogo] = useState<string | null>(null);

  const loadPressing = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const p = await getMyPressing();
      setPressing(p || null);
    } catch (e: any) {
      if (e.message?.includes("404") || e.status === 404) {
        setPressing(null);
      } else {
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

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-950 min-h-screen">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* HEADER SIMPLE */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Paramètres</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Informations de votre établissement</p>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={loadPressing} 
              className="p-2.5 text-gray-500 hover:bg-white dark:hover:bg-gray-800 rounded-full transition border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
            >
              <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
            </button>
            {pressing && (
              <button
                onClick={() => navigate('/tarifs')}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold transition hover:bg-indigo-700 shadow-md"
              >
                <Tag size={18} /> <span className="hidden sm:inline">Tarifs</span>
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {/* AFFICHAGE DES INFOS (MODE LECTURE) */}
        {pressing ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="h-20 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 w-full" />
            
            <div className="px-6 pb-8">
              <div className="relative -mt-10 mb-6">
                <div className="w-24 h-24 rounded-2xl bg-white dark:bg-gray-800 p-1.5 shadow-md border border-gray-100 dark:border-gray-700 flex items-center justify-center overflow-hidden">
                  {pressing.logo ? (
                    <img 
                      src={getLogoSource(pressing.logo)!} 
                      alt="Logo" 
                      className="w-full h-full object-contain" // Pas de zoom
                    />
                  ) : (
                    <Building2 size={40} className="text-gray-300" />
                  )}
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{pressing.nom}</h2>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full text-xs font-bold uppercase tracking-wider">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Compte Actif
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DisplayField icon={<Phone size={18}/>} label="Téléphone Principal" value={pressing.telephone} />
                <DisplayField icon={<Smartphone size={18}/>} label="Mobile / WhatsApp" value={pressing.cel || "Non renseigné"} />
                <DisplayField icon={<MapPin size={18}/>} label="Adresse" value={pressing.adresse} />
                <DisplayField icon={<Mail size={18}/>} label="Email" value={pressing.email || "Non renseigné"} />
              </div>
            </div>
          </div>
        ) : (
          !isLoading && <EmptyState onCreate={() => setIsDialogOpen(true)} />
        )}

        {/* MODAL DE CRÉATION UNIQUEMENT */}
        {isDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm" onClick={() => setIsDialogOpen(false)} />
            <div className="relative bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold dark:text-white">Créer mon Pressing</h3>
                  <button onClick={() => setIsDialogOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>

                <div className="space-y-5">
                  <div className="flex flex-col items-center mb-4">
                    <div className="relative w-20 h-20 rounded-xl bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden">
                      {previewLogo ? <img src={previewLogo} className="w-full h-full object-contain" /> : <Plus className="text-gray-400" />}
                      <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                    <span className="text-[10px] text-gray-500 mt-2 uppercase font-bold tracking-tight">Ajouter un logo</span>
                  </div>

                  <SimpleInput label="Nom du pressing" value={form.nom} onChange={v => setForm({...form, nom: v})} />
                  <SimpleInput label="Téléphone" value={form.telephone} onChange={v => setForm({...form, telephone: v})} type="tel" />
                  <SimpleInput label="Adresse" value={form.adresse} onChange={v => setForm({...form, adresse: v})} />
                  <SimpleInput label="Second Téléphone" value={form.cel || ""} onChange={v => setForm({...form, cel: v})} type="tel" />

                  <button 
                    onClick={handleSubmit} 
                    disabled={!form.nom || !form.telephone || !form.adresse}
                    className="w-full bg-blue-600 disabled:bg-gray-300 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold transition mt-4"
                  >
                    {isLoading ? <Loader2 className="animate-spin mx-auto" /> : "Finaliser la création"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Composant pour l'affichage pur
function DisplayField({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50">
      <div className="text-blue-600 dark:text-blue-400">{icon}</div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-200">{value}</p>
      </div>
    </div>
  );
}

function SimpleInput({ label, value, onChange, type = "text" }: any) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-bold text-gray-600 dark:text-gray-400 ml-1 uppercase">{label}</label>
      <input 
        type={type} 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-blue-500 dark:text-white"
      />
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800 text-center">
      <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
        <Plus size={32} className="text-blue-600 dark:text-blue-400" />
      </div>
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">Aucun pressing configuré</h2>
      <p className="text-gray-500 text-sm max-w-xs mt-1 mb-6">Créez votre profil pour commencer à gérer vos tarifs et commandes.</p>
      <button onClick={onCreate} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition">
        Créer mon profil
      </button>
    </div>
  );
}