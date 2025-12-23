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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <Scale size={22} className="text-emerald-500" />
            {isEditing ? "Modifier Tranche" : "Nouveau Tarif Kilo"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-500 ml-1">Tranche de poids</label>
            <select
              value={formData.tranchePoids}
              onChange={(e) => setFormData({...formData, tranchePoids: e.target.value})}
              className="w-full rounded-2xl bg-gray-50 dark:bg-gray-800 border-none p-3 text-sm focus:ring-2 focus:ring-emerald-500 appearance-none"
              required
            >
              <option value="">Choisir une tranche...</option>
              {WEIGHT_TRANCHES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-500 ml-1">Service</label>
            <select
              value={formData.service}
              onChange={(e) => setFormData({...formData, service: e.target.value})}
              className="w-full rounded-2xl bg-gray-50 dark:bg-gray-800 border-none p-3 text-sm focus:ring-2 focus:ring-emerald-500 appearance-none"
              required
            >
              <option value="">Sélectionner service...</option>
              {SERVICE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-500 ml-1">Prix Forfaitaire (CFA)</label>
            <div className="relative">
              <input
                type="number"
                value={formData.prix || ''}
                onChange={(e) => setFormData({...formData, prix: parseFloat(e.target.value) || 0})}
                className="w-full rounded-2xl bg-gray-50 dark:bg-gray-800 border-none p-3 pl-10 text-sm focus:ring-2 focus:ring-emerald-500"
                placeholder="Ex: 5000"
                required
              />
              <DollarSign className="absolute left-3 top-3 text-gray-400" size={16} />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1 rounded-2xl font-bold">Annuler</Button>
            <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-lg shadow-emerald-600/20">
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
    <div className="h-screen flex flex-col p-4 md:p-8 space-y-6 bg-white dark:bg-gray-950 overflow-hidden max-w-7xl mx-auto">
      
      {/* HEADER FIXE */}
      <div className="flex-none flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-gray-100 dark:bg-gray-900 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl">
                <Scale size={24} />
              </div>
              Tarifs au Kilo
            </h1>
          </div>
        </div>

        {isAdmin && (
          <Button
            onClick={() => { setEditingTarif(null); setIsModalOpen(true); }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20"
          >
            <Plus size={18} className="mr-2" /> Nouvelle Tranche
          </Button>
        )}
      </div>

      {/* ZONE DE SCROLL INTERNE */}
      <div className="flex-1 overflow-y-auto scrollbar-thin pr-1 -mr-1 pb-10">
        <div className="rounded-3xl border border-gray-100 dark:border-gray-900 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-800/50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-xs font-black uppercase text-gray-500 tracking-wider">Poids</th>
                <th className="px-6 py-4 text-xs font-black uppercase text-gray-500 tracking-wider">Service</th>
                <th className="px-6 py-4 text-xs font-black uppercase text-gray-500 tracking-wider">Tarif Fixe</th>
                {isAdmin && <th className="px-6 py-4 text-right text-xs font-black uppercase text-gray-500 tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {tarifs.map(tarif => (
                <tr key={tarif.id} className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <Layers size={14} className="text-emerald-500" />
                       <span className="font-bold text-gray-900 dark:text-gray-100">{tarif.tranchePoids}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black px-3 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-full uppercase">
                      {tarif.service}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-black text-emerald-600 dark:text-emerald-400">
                    {tarif.prix.toLocaleString()} <span className="text-[10px] font-normal italic">CFA</span>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => { setEditingTarif(tarif); setIsModalOpen(true); }}
                          className="h-8 w-8 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg"
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(tarif.id)}
                          className="h-8 w-8 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {tarifs.length === 0 && (
            <div className="py-24 text-center">
              <Scale size={48} className="mx-auto text-gray-200 dark:text-gray-800 mb-4" />
              <p className="text-gray-400 dark:text-gray-500 font-medium">Aucun tarif kilo configuré.</p>
            </div>
          )}
        </div>
      </div>

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