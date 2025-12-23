import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, DollarSign, Plus, Trash2, Pencil, ArrowLeft, X, Layers } from 'lucide-react';
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

// --- MODAL COMPONENT (Design épuré) ---
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
            {isEditing ? "Modifier Tarif" : "Nouveau Tarif"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-500 ml-1">Article</label>
            <input
              type="text"
              name="article"
              value={formData.article}
              onChange={(e) => setFormData({...formData, article: e.target.value})}
              className="w-full rounded-2xl bg-gray-50 dark:bg-gray-800 border-none p-3 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Chemise"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-500 ml-1">Service</label>
            <select
              name="service"
              value={formData.service}
              onChange={(e) => setFormData({...formData, service: e.target.value})}
              className="w-full rounded-2xl bg-gray-50 dark:bg-gray-800 border-none p-3 text-sm focus:ring-2 focus:ring-blue-500 appearance-none"
              required
            >
              <option value="">Sélectionner...</option>
              {SERVICE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-500 ml-1">Prix (CFA)</label>
            <div className="relative">
              <input
                type="number"
                name="prix"
                value={formData.prix || ''}
                onChange={(e) => setFormData({...formData, prix: parseFloat(e.target.value) || 0})}
                className="w-full rounded-2xl bg-gray-50 dark:bg-gray-800 border-none p-3 pl-10 text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                required
              />
              <DollarSign className="absolute left-3 top-3 text-gray-400" size={16} />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1 rounded-2xl font-bold">Annuler</Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20">
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
    <div className="h-screen flex flex-col p-4 md:p-8 space-y-6 bg-white dark:bg-gray-950 overflow-hidden max-w-7xl mx-auto">
      
      {/* HEADER FIXE */}
      <div className="flex-none flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-gray-100 dark:bg-gray-900 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                <Tag size={24} />
              </div>
              Tarifications
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => navigate('/tarifs-kilo')}
            variant="outline"
            className="rounded-xl border-emerald-200 dark:border-emerald-800 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 font-bold"
          >
            <Layers size={18} className="mr-2" /> Au Kilo
          </Button>
          
          {isAdmin && (
            <Button
              onClick={() => { setEditingTarif(null); setIsModalOpen(true); }}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20"
            >
              <Plus size={18} className="mr-2" /> Nouveau Tarif
            </Button>
          )}
        </div>
      </div>

      {/* ZONE DE SCROLL INTERNE */}
      <div className="flex-1 overflow-y-auto scrollbar-thin pr-1 -mr-1 pb-10">
        <div className="rounded-3xl border border-gray-100 dark:border-gray-900 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-800/50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-xs font-black uppercase text-gray-500 tracking-wider">Article</th>
                <th className="px-6 py-4 text-xs font-black uppercase text-gray-500 tracking-wider">Service</th>
                <th className="px-6 py-4 text-xs font-black uppercase text-gray-500 tracking-wider">Prix Unitaire</th>
                {isAdmin && <th className="px-6 py-4 text-right text-xs font-black uppercase text-gray-500 tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {tarifs.map(tarif => (
                <tr key={tarif.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-bold text-gray-900 dark:text-gray-100">{tarif.article}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                      {tarif.service}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-black text-blue-600 dark:text-blue-400">
                    {tarif.prix.toLocaleString()} <span className="text-[10px] font-normal">FCFA</span>
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
            <div className="py-20 text-center">
              <div className="inline-flex p-4 bg-gray-50 dark:bg-gray-800 rounded-full mb-4 text-gray-400">
                <Tag size={32} />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium italic">Aucun tarif répertorié pour le moment.</p>
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