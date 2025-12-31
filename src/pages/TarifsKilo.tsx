import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Plus, Trash2, Pencil, ArrowLeft, Scale, X, Layers } from 'lucide-react';
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

// --- MODAL COMPONENT (Optimisée Mobile) ---
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
      <div className="bg-white dark:bg-gray-900 rounded-t-3xl md:rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <Scale size={22} className="text-emerald-500" />
            {isEditing ? "Modifier" : "Nouveau Tarif Kilo"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 pb-10 md:pb-0">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Tranche de poids</label>
            <select
              value={formData.tranchePoids}
              onChange={(e) => setFormData({...formData, tranchePoids: e.target.value})}
              className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 border-none p-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500 appearance-none"
              required
            >
              <option value="">Choisir une tranche...</option>
              {WEIGHT_TRANCHES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Type de service</label>
            <select
              value={formData.service}
              onChange={(e) => setFormData({...formData, service: e.target.value})}
              className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 border-none p-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500 appearance-none"
              required
            >
              <option value="">Sélectionner service...</option>
              {SERVICE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Prix Forfaitaire (FCFA)</label>
            <div className="relative">
              <input
                type="number"
                value={formData.prix || ''}
                onChange={(e) => setFormData({...formData, prix: parseFloat(e.target.value) || 0})}
                className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 border-none p-4 pl-12 text-lg font-black text-emerald-600 focus:ring-2 focus:ring-emerald-500"
                placeholder="Ex: 5000"
                required
              />
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>

          <div className="pt-4 flex flex-col-reverse md:flex-row gap-3">
            <Button type="button" variant="ghost" onClick={onClose} className="h-12 rounded-xl font-bold">Annuler</Button>
            <Button type="submit" className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-lg shadow-emerald-600/20">
              Valider
            </Button>
          </div>
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

  const isAdmin = (localStorage.getItem("role") || "").includes("ADMIN");

  React.useEffect(() => { fetchTarifs(); }, []);

  const fetchTarifs = async () => {
    try {
      const data = await getAllTarifPoids();
      setTarifs(data);
    } catch (error: any) { console.error(error.message); }
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
    if (!window.confirm("Supprimer ce tarif kilo ?")) return;
    try {
      await deleteTarifPoids(id);
      setTarifs(prev => prev.filter(t => t.id !== id));
    } catch (error: any) { alert(error.message); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 max-w-7xl mx-auto relative">
      
      {/* HEADER FIXE */}
      <div className="flex-none p-4 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between border-b md:border-none border-gray-100 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 bg-gray-100 dark:bg-gray-900 rounded-xl active:scale-90 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-600/20">
              <Scale size={20} className="md:w-6 md:h-6" />
            </div>
            <h1 className="text-xl md:text-3xl font-black tracking-tight">Tarifs au Kilo</h1>
          </div>
        </div>

        {isAdmin && (
          <Button
            onClick={() => { setEditingTarif(null); setIsModalOpen(true); }}
            className="hidden md:flex bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-lg shadow-emerald-600/20"
          >
            <Plus size={18} className="mr-2" /> Nouvelle Tranche
          </Button>
        )}
      </div>

      {/* ZONE DE LISTE */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-32">
        
        {/* VUE DESKTOP (TABLEAU) */}
        <div className="hidden md:block rounded-3xl border border-gray-100 dark:border-gray-900 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Poids</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Service</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Tarif Fixe</th>
                {isAdmin && <th className="px-6 py-4 text-right text-[10px] font-black uppercase text-gray-400">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {tarifs.map(tarif => (
                <tr key={tarif.id} className="hover:bg-emerald-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Layers size={14} className="text-emerald-500" />
                      <span className="font-bold text-gray-900">{tarif.tranchePoids}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg uppercase">
                      {tarif.service}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-black text-emerald-600">{tarif.prix.toLocaleString()} CFA</td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditingTarif(tarif); setIsModalOpen(true); }} className="h-8 w-8 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Pencil size={14} /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(tarif.id)} className="h-8 w-8 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* VUE MOBILE (CARDS) */}
        <div className="md:hidden grid grid-cols-1 gap-3">
          {tarifs.map(tarif => (
            <div key={tarif.id} className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm active:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Layers size={16} className="text-emerald-500" />
                    <span className="font-black text-gray-900 dark:text-white text-lg">{tarif.tranchePoids}</span>
                  </div>
                  <span className="inline-block text-[10px] font-black px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md uppercase tracking-wider">
                    {tarif.service}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-emerald-600 leading-none">{tarif.prix.toLocaleString()} F</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Forfait</p>
                </div>
              </div>

              {isAdmin && (
                <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-50 dark:border-gray-800">
                  <Button onClick={() => { setEditingTarif(tarif); setIsModalOpen(true); }} variant="secondary" className="h-9 flex-1 rounded-xl font-bold text-xs bg-indigo-50 text-indigo-600 border-none">
                    <Pencil size={14} className="mr-2" /> Modifier
                  </Button>
                  <Button onClick={() => handleDelete(tarif.id)} variant="secondary" className="h-9 flex-1 rounded-xl font-bold text-xs bg-red-50 text-red-600 border-none">
                    <Trash2 size={14} className="mr-2" /> Supprimer
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {tarifs.length === 0 && (
          <div className="py-20 text-center opacity-40">
            <Scale size={48} className="mx-auto mb-4" />
            <p className="font-bold italic uppercase text-xs tracking-widest">Aucune tranche configurée</p>
          </div>
        )}
      </div>

      {/* BOUTON FLOTTANT (Mobile seulement) */}
      {isAdmin && (
        <button
          onClick={() => { setEditingTarif(null); setIsModalOpen(true); }}
          className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform z-50"
        >
          <Plus size={28} />
        </button>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <TarifFormModal
          tarifToEdit={editingTarif}
          onClose={() => { setIsModalOpen(false); setEditingTarif(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}