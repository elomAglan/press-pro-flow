import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Plus, Trash2, Pencil, ArrowLeft, Scale, X, Layers, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";

import {
  getAllTarifPoids,
  createTarifPoids,
  updateTarifPoids,
  deleteTarifPoids
} from "@/services/tarifPoids.Service";

export interface TarifPoids {
  id: number;
  tranchePoids: string;
  service: string;
  prix: number;
}

const SERVICE_OPTIONS = ["Lavage simple", "Lavage + Séchage", "L+S + Repassage", "Lavage Express"];
const WEIGHT_TRANCHES = ["1Kg-4Kg", "5Kg-9Kg", "10Kg-20Kg", "Supérieur à 20Kg"];

// --- MODAL COMPONENT ---
interface TarifFormModalProps {
  tarifToEdit: TarifPoids | null;
  onClose: () => void;
  onSave: (data: Omit<TarifPoids, 'id'>, id?: number) => void;
}

const TarifFormModal: React.FC<TarifFormModalProps> = ({ tarifToEdit, onClose, onSave }) => {
  const isEditing = !!tarifToEdit;
  const [formData, setFormData] = React.useState<Omit<TarifPoids, 'id'>>({
    tranchePoids: tarifToEdit?.tranchePoids || '',
    service: tarifToEdit?.service || '',
    prix: tarifToEdit?.prix || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tranchePoids || !formData.service || formData.prix <= 0) return;
    onSave(formData, tarifToEdit?.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-[100] p-0 md:p-4">
      <div className="bg-white dark:bg-gray-900 rounded-t-[2.5rem] md:rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl animate-in slide-in-from-bottom duration-300 md:zoom-in">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
            <Scale size={22} className="text-emerald-500" />
            {isEditing ? "Modifier Forfait" : "Nouveau Forfait"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 pb-10 md:pb-0">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Tranche de poids</label>
            <select
              value={formData.tranchePoids}
              onChange={(e) => setFormData({...formData, tranchePoids: e.target.value})}
              className="w-full rounded-2xl bg-gray-50 dark:bg-gray-800 border-none p-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500 appearance-none"
              required
            >
              <option value="">Choisir une tranche...</option>
              {WEIGHT_TRANCHES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Service</label>
            <select
              value={formData.service}
              onChange={(e) => setFormData({...formData, service: e.target.value})}
              className="w-full rounded-2xl bg-gray-50 dark:bg-gray-800 border-none p-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500 appearance-none"
              required
            >
              <option value="">Sélectionner service...</option>
              {SERVICE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Prix (F)</label>
            <div className="relative">
              <input
                type="number"
                value={formData.prix || ''}
                onChange={(e) => setFormData({...formData, prix: parseFloat(e.target.value) || 0})}
                className="w-full rounded-2xl bg-gray-50 dark:bg-gray-800 border-none p-4 pl-12 text-lg font-black text-emerald-600 focus:ring-2 focus:ring-emerald-500"
                required
              />
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>

          <Button type="submit" className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black shadow-lg">
            Valider
          </Button>
        </form>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function TarifsKilo() {
  const navigate = useNavigate();
  const [tarifs, setTarifs] = React.useState<TarifPoids[]>([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingTarif, setEditingTarif] = React.useState<TarifPoids | null>(null);
  const [loading, setLoading] = React.useState(true);

  const isAdmin = (localStorage.getItem("role") || "").includes("ADMIN");

  React.useEffect(() => { fetchTarifs(); }, []);

  const fetchTarifs = async () => {
    setLoading(true);
    try {
      const data = await getAllTarifPoids();
      setTarifs(data);
    } catch (error: any) { console.error(error.message); }
    finally { setLoading(false); }
  };

  const handleSave = async (tarifData: Omit<TarifPoids, 'id'>, id?: number) => {
    try {
      if (id) {
        const updated = await updateTarifPoids(id, tarifData);
        setTarifs(prev => prev.map(t => (t.id === id ? updated : t)));
      } else {
        const created = await createTarifPoids(tarifData);
        setTarifs(prev => [...prev, created]);
      }
    } catch (error: any) { alert(error.message); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Supprimer ce tarif ?")) return;
    try {
      await deleteTarifPoids(id);
      setTarifs(prev => prev.filter(t => t.id !== id));
    } catch (error: any) { alert(error.message); }
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm"><ArrowLeft size={20} /></button>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow-lg"><Scale size={24} /></div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Tarifs au Kilo</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={fetchTarifs} className="p-3.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-gray-400 hover:text-emerald-600 transition-all shadow-sm">
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          {isAdmin && (
            <Button onClick={() => { setEditingTarif(null); setIsModalOpen(true); }} className="h-12 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black shadow-lg">
              <Plus size={20} className="mr-2" /> <span className="hidden sm:inline">Nouvelle Tranche</span><span className="sm:hidden">Ajouter</span>
            </Button>
          )}
        </div>
      </div>

      {/* --- VUE MOBILE (Cartes empilées) : Uniquement visible sur petit écran --- */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {tarifs.map(tarif => (
          <div key={tarif.id} className="bg-white dark:bg-gray-900 p-5 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-emerald-500" />
                <span className="font-black text-gray-900 dark:text-white text-lg">{tarif.tranchePoids}</span>
              </div>
              <span className="text-xl font-black text-emerald-600">{tarif.prix.toLocaleString()} F</span>
            </div>
            <div className="inline-flex px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-[10px] font-black text-emerald-600 dark:text-emerald-400 rounded-lg uppercase tracking-widest">
              {tarif.service}
            </div>
            {isAdmin && (
              <div className="flex gap-2 pt-4 border-t border-gray-50 dark:border-gray-800">
                <Button onClick={() => { setEditingTarif(tarif); setIsModalOpen(true); }} className="flex-1 bg-indigo-50 text-indigo-600 font-bold rounded-xl h-10 border-none shadow-none"><Pencil size={14} className="mr-2"/>Modifier</Button>
                <Button onClick={() => handleDelete(tarif.id)} className="bg-red-50 text-red-600 font-bold rounded-xl h-10 border-none shadow-none"><Trash2 size={14}/></Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* --- VUE DESKTOP (Tableau large) : Uniquement visible sur PC (md et plus) --- */}
      <div className="hidden md:block bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <th className="px-8 py-6 text-[11px] font-black uppercase text-gray-400 tracking-widest">Tranche</th>
                <th className="px-8 py-6 text-[11px] font-black uppercase text-gray-400 tracking-widest">Service</th>
                <th className="px-8 py-6 text-[11px] font-black uppercase text-gray-400 tracking-widest">Prix Fixe</th>
                {isAdmin && <th className="px-8 py-6 text-right text-[11px] font-black uppercase text-gray-400 tracking-widest">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {tarifs.map(tarif => (
                <tr key={tarif.id} className="hover:bg-emerald-50/30 transition-colors group">
                  <td className="px-8 py-6"><div className="flex items-center gap-3"><Layers size={18} className="text-emerald-500" /><span className="font-black text-gray-900 dark:text-gray-100 text-lg">{tarif.tranchePoids}</span></div></td>
                  <td className="px-8 py-6"><span className="px-4 py-1.5 bg-emerald-50 text-[10px] font-black text-emerald-600 rounded-xl uppercase">{tarif.service}</span></td>
                  <td className="px-8 py-6"><span className="text-xl font-black text-emerald-600">{tarif.prix.toLocaleString()} F</span></td>
                  {isAdmin && (
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => { setEditingTarif(tarif); setIsModalOpen(true); }} className="h-11 w-11 rounded-xl text-indigo-600 bg-indigo-50"><Pencil size={18} /></Button>
                        <Button variant="ghost" onClick={() => handleDelete(tarif.id)} className="h-11 w-11 rounded-xl text-red-600 bg-red-50"><Trash2 size={18} /></Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && <TarifFormModal tarifToEdit={editingTarif} onClose={() => { setIsModalOpen(false); setEditingTarif(null); }} onSave={handleSave} />}
    </div>
  );
}