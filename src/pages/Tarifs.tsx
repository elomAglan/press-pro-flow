import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, DollarSign, Plus, Trash2, Pencil, ArrowLeft, X, Layers, RefreshCw } from 'lucide-react';
import { getAllTarifs, createTarif, updateTarif, deleteTarif } from '@/services/tarif.service.ts';
import { Button } from "@/components/ui/button";

interface Tarif {
  id: number;
  article: string;
  service: string;
  prix: number;
}

const SERVICE_OPTIONS = ["Lavage simple", "Lavage + sechage", "L+S + Repassage", "Lavage Express"];

// --- MODAL COMPONENT ---
interface TarifFormModalProps {
  tarifToEdit: Tarif | null;
  onClose: () => void;
  onSave: (data: Omit<Tarif, 'id'>, id?: number) => void;
}

const TarifFormModal: React.FC<TarifFormModalProps> = ({ tarifToEdit, onClose, onSave }) => {
  const isEditing = !!tarifToEdit;
  const [formData, setFormData] = React.useState<Omit<Tarif, 'id'>>({
    article: tarifToEdit?.article || '',
    service: tarifToEdit?.service || '',
    prix: tarifToEdit?.prix || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.article || !formData.service || formData.prix <= 0) return;
    onSave(formData, tarifToEdit?.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-[100] p-0 md:p-4">
      <div className="bg-white dark:bg-gray-900 rounded-t-[2.5rem] md:rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl animate-in slide-in-from-bottom duration-300 md:zoom-in">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
            {isEditing ? "Modifier Tarif" : "Nouveau Tarif"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 pb-10 md:pb-0">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400">Article</label>
            <input
              type="text"
              value={formData.article}
              onChange={(e) => setFormData({...formData, article: e.target.value})}
              className="w-full rounded-2xl bg-gray-50 dark:bg-gray-800 border-none p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ex: Chemise"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400">Service</label>
            <select
              value={formData.service}
              onChange={(e) => setFormData({...formData, service: e.target.value})}
              className="w-full rounded-2xl bg-gray-50 dark:bg-gray-800 border-none p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 appearance-none outline-none"
              required
            >
              <option value="">Sélectionner...</option>
              {SERVICE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400">Prix (F)</label>
            <div className="relative">
              <input
                type="number"
                value={formData.prix || ''}
                onChange={(e) => setFormData({...formData, prix: parseFloat(e.target.value) || 0})}
                className="w-full rounded-2xl bg-gray-50 dark:bg-gray-800 border-none p-4 pl-12 text-lg font-black text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>
          <Button type="submit" className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-lg shadow-blue-500/20">
            Valider
          </Button>
        </form>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function Tarifs() {
  const navigate = useNavigate();
  const [tarifs, setTarifs] = React.useState<Tarif[]>([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingTarif, setEditingTarif] = React.useState<Tarif | null>(null);
  const [loading, setLoading] = React.useState(true);

  const isAdmin = (localStorage.getItem("role") || "").includes("ADMIN");

  React.useEffect(() => { fetchTarifs(); }, []);

  const fetchTarifs = async () => {
    setLoading(true);
    try {
      const data = await getAllTarifs();
      setTarifs(data);
    } catch (error: any) { console.error(error.message); }
    finally { setLoading(false); }
  };

  const handleSave = async (tarifData: Omit<Tarif, 'id'>, id?: number) => {
    try {
      id ? await updateTarif(id, tarifData) : await createTarif(tarifData);
      fetchTarifs();
    } catch (error: any) { alert(error.message); }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Supprimer ce tarif ?")) {
      try {
        await deleteTarif(id);
        setTarifs(tarifs.filter(t => t.id !== id));
      } catch (error: any) { alert(error.message); }
    }
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* HEADER ADAPTATIF */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm"><ArrowLeft size={20} /></button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Grille Tarifaire</h1>
            <p className="hidden sm:block text-gray-500 font-medium italic">Gestion des prix par article</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => navigate('/tarifs-kilo')} variant="outline" className="h-12 px-4 md:px-6 rounded-2xl border-emerald-100 bg-emerald-50/30 text-emerald-600 font-black text-xs uppercase tracking-widest">
            <Layers size={18} className="mr-2" /> Kilo
          </Button>
          <button onClick={fetchTarifs} className="p-3.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-gray-400 hover:text-blue-600 transition-all shadow-sm">
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          {isAdmin && (
            <Button onClick={() => { setEditingTarif(null); setIsModalOpen(true); }} className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-lg">
              <Plus size={20} className="mr-2" /> <span className="hidden sm:inline">Nouveau</span>
            </Button>
          )}
        </div>
      </div>

      {/* --- VUE MOBILE (Cartes) --- */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {tarifs.map(tarif => (
          <div key={tarif.id} className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase">{tarif.article}</h3>
                <span className="inline-block mt-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 text-[10px] font-black text-gray-500 rounded-lg uppercase tracking-widest">
                  {tarif.service}
                </span>
              </div>
              <span className="text-xl font-black text-blue-600">{tarif.prix.toLocaleString()} F</span>
            </div>
            {isAdmin && (
              <div className="flex gap-2 pt-4 border-t border-gray-50 dark:border-gray-800">
                <Button onClick={() => { setEditingTarif(tarif); setIsModalOpen(true); }} className="flex-1 bg-indigo-50 text-indigo-600 font-bold rounded-xl h-10 border-none shadow-none"><Pencil size={14} className="mr-2"/>Éditer</Button>
                <Button onClick={() => handleDelete(tarif.id)} className="bg-red-50 text-red-600 font-bold rounded-xl h-10 border-none shadow-none"><Trash2 size={14}/></Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* --- VUE DESKTOP (Tableau Large) --- */}
      <div className="hidden md:block bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <th className="px-8 py-6 text-[11px] font-black uppercase text-gray-400 tracking-widest">Article</th>
                <th className="px-8 py-6 text-[11px] font-black uppercase text-gray-400 tracking-widest">Type de Service</th>
                <th className="px-8 py-6 text-[11px] font-black uppercase text-gray-400 tracking-widest">Prix Unitaire</th>
                {isAdmin && <th className="px-8 py-6 text-right text-[11px] font-black uppercase text-gray-400 tracking-widest">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {tarifs.map(tarif => (
                <tr key={tarif.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-8 py-6 font-black text-gray-900 dark:text-gray-100 text-lg">{tarif.article}</td>
                  <td className="px-8 py-6"><span className="px-4 py-1.5 bg-gray-100 text-[10px] font-black text-gray-500 rounded-xl uppercase">{tarif.service}</span></td>
                  <td className="px-8 py-6"><span className="text-xl font-black text-blue-600">{tarif.prix.toLocaleString()} F</span></td>
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

      {/* BOUTON FLOTTANT MOBILE */}
      {isAdmin && (
        <button onClick={() => { setEditingTarif(null); setIsModalOpen(true); }} className="md:hidden fixed bottom-8 right-8 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50">
          <Plus size={32} />
        </button>
      )}

      {/* MODAL */}
      {isModalOpen && <TarifFormModal tarifToEdit={editingTarif} onClose={() => { setIsModalOpen(false); setEditingTarif(null); }} onSave={handleSave} />}
    </div>
  );
}