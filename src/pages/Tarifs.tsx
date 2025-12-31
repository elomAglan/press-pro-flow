import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, DollarSign, Plus, Trash2, Pencil, ArrowLeft, X, Layers, MoreVertical } from 'lucide-react';
import { getAllTarifs, createTarif, updateTarif, deleteTarif } from '@/services/tarif.service.ts';
import { Button } from "@/components/ui/button";

interface Tarif {
  id: number;
  article: string;
  service: string;
  prix: number;
}

const SERVICE_OPTIONS = [
  "Lavage simple",
  "Lavage + sechage",
  "L+S + Repassage",
  "Lavage Express",
];

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
      <div className="bg-white dark:bg-gray-900 rounded-t-3xl md:rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-800 animate-in slide-in-from-bottom duration-300 md:zoom-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
            {isEditing ? "Modifier" : "Nouveau Tarif"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <X size={24} className="md:w-5 md:h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 pb-8 md:pb-0">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Nom de l'article</label>
            <input
              type="text"
              value={formData.article}
              onChange={(e) => setFormData({...formData, article: e.target.value})}
              className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 border-none p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Ex: Chemise, Pantalon..."
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Type de service</label>
            <select
              value={formData.service}
              onChange={(e) => setFormData({...formData, service: e.target.value})}
              className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 border-none p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 appearance-none transition-all"
              required
            >
              <option value="">Sélectionner...</option>
              {SERVICE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Prix unitaire (FCFA)</label>
            <div className="relative">
              <input
                type="number"
                value={formData.prix || ''}
                onChange={(e) => setFormData({...formData, prix: parseFloat(e.target.value) || 0})}
                className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 border-none p-4 pl-12 text-lg font-black text-blue-600 focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="0"
                required
              />
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>

          <div className="pt-4 flex flex-col-reverse md:flex-row gap-3">
            <Button type="button" variant="ghost" onClick={onClose} className="w-full md:flex-1 h-12 rounded-xl font-bold">Annuler</Button>
            <Button type="submit" className="w-full md:flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black shadow-lg shadow-blue-600/20">
              Valider
            </Button>
          </div>
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

  const isAdmin = (localStorage.getItem("role") || "").includes("ADMIN");

  React.useEffect(() => { fetchTarifs(); }, []);

  const fetchTarifs = async () => {
    try {
      const data = await getAllTarifs();
      setTarifs(data);
    } catch (error: any) { console.error(error.message); }
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
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 max-w-7xl mx-auto relative">
      
      {/* HEADER FIXE - Optimisé Mobile */}
      <div className="flex-none p-4 md:p-8 space-y-4 md:space-y-0 flex flex-col md:flex-row md:items-center md:justify-between border-b md:border-none border-gray-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 bg-gray-100 dark:bg-gray-900 rounded-xl active:scale-90 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20">
              <Tag size={20} className="md:w-6 md:h-6" />
            </div>
            <h1 className="text-xl md:text-3xl font-black tracking-tight">Tarifs</h1>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => navigate('/tarifs-kilo')}
            variant="outline"
            className="flex-1 md:flex-none h-11 rounded-xl border-emerald-200 text-emerald-600 font-black text-xs uppercase tracking-wider"
          >
            <Layers size={16} className="mr-2" /> Pesage (Kilo)
          </Button>
          
          {/* Bouton visible seulement sur Desktop dans le header */}
          {isAdmin && (
            <Button
              onClick={() => { setEditingTarif(null); setIsModalOpen(true); }}
              className="hidden md:flex bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black"
            >
              <Plus size={18} className="mr-2" /> Nouveau
            </Button>
          )}
        </div>
      </div>

      {/* ZONE DE LISTE */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-32">
        {/* Vue Desktop : Table */}
        <div className="hidden md:block rounded-3xl border border-gray-100 dark:border-gray-900 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Article</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Service</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Prix Unitaire</th>
                {isAdmin && <th className="px-6 py-4 text-right text-[10px] font-black uppercase text-gray-400">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {tarifs.map(tarif => (
                <tr key={tarif.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4 font-bold text-gray-900">{tarif.article}</td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black px-3 py-1 bg-gray-100 text-gray-500 rounded-lg uppercase tracking-wider">
                      {tarif.service}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-black text-blue-600">{tarif.prix.toLocaleString()} F</td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditingTarif(tarif); setIsModalOpen(true); }} className="h-8 w-8 text-indigo-600"><Pencil size={14} /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(tarif.id)} className="h-8 w-8 text-red-600"><Trash2 size={14} /></Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Vue Mobile : Grid de Cards */}
        <div className="md:hidden grid grid-cols-1 gap-3">
          {tarifs.map(tarif => (
            <div key={tarif.id} className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm active:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-black text-gray-900 dark:text-white text-lg leading-tight">{tarif.article}</h3>
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1">{tarif.service}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-gray-900 leading-none">{tarif.prix.toLocaleString()} F</p>
                </div>
              </div>
              
              {isAdmin && (
                <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-50 dark:border-gray-800">
                  <Button onClick={() => { setEditingTarif(tarif); setIsModalOpen(true); }} variant="secondary" className="h-9 px-4 rounded-lg font-bold text-xs bg-indigo-50 text-indigo-600 border-none"><Pencil size={14} className="mr-2" /> Modifier</Button>
                  <Button onClick={() => handleDelete(tarif.id)} variant="secondary" className="h-9 px-4 rounded-lg font-bold text-xs bg-red-50 text-red-600 border-none"><Trash2 size={14} className="mr-2" /> Supprimer</Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {tarifs.length === 0 && (
          <div className="py-20 text-center opacity-40">
            <Tag size={48} className="mx-auto mb-4" />
            <p className="font-bold italic uppercase text-xs tracking-widest">Aucun tarif répertorié</p>
          </div>
        )}
      </div>

      {/* BOUTON FLOTTANT (Mobile seulement) */}
      {isAdmin && (
        <button
          onClick={() => { setEditingTarif(null); setIsModalOpen(true); }}
          className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform z-50"
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