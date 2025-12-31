import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { CreditCard, Plus, Pencil, Trash2, X, ArrowLeft, Calendar, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getAllCharges,
  createCharge,
  updateCharge,
  deleteCharge,
  Charge,
} from "../services/charge.service.ts";

interface ChargeFormData {
  description: string;
  montant: number;
  dateCharge: string;
  pressingId: number;
}

// --- MODAL COMPONENT (Style modernisé et Responsive) ---
const ChargeFormModal: React.FC<{
  chargeToEdit: Charge | null;
  onClose: () => void;
  onSave: (data: ChargeFormData, id?: number) => void;
  pressingId: number;
}> = ({ chargeToEdit, onClose, onSave, pressingId }) => {
  const isEditing = Boolean(chargeToEdit);
  const [formData, setFormData] = useState<ChargeFormData>({
    description: chargeToEdit?.description || "",
    montant: chargeToEdit?.montant || 0,
    dateCharge: chargeToEdit?.dateCharge || new Date().toISOString().slice(0, 10),
    pressingId,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim() || formData.montant <= 0) return;
    onSave(formData, chargeToEdit?.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-[100] p-0 md:p-4">
      <div className="bg-white dark:bg-gray-900 rounded-t-3xl md:rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-800 animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <CreditCard size={22} className="text-purple-600" />
            {isEditing ? "Modifier Charge" : "Nouvelle Charge"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 pb-10 md:pb-0">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Description du frais</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 border-none p-4 text-sm font-bold focus:ring-2 focus:ring-purple-500 transition-all"
              placeholder="Ex: Facture CIE, Loyer..."
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Montant (FCFA)</label>
            <div className="relative">
              <input
                type="number"
                name="montant"
                value={formData.montant || ''}
                onChange={(e) => setFormData({...formData, montant: Number(e.target.value)})}
                className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 border-none p-4 pl-12 text-lg font-black text-purple-600 focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="0"
                required
              />
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Date de la dépense</label>
            <div className="relative">
              <input
                type="date"
                name="dateCharge"
                value={formData.dateCharge}
                onChange={(e) => setFormData({...formData, dateCharge: e.target.value})}
                className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 border-none p-4 pl-12 text-sm font-bold focus:ring-2 focus:ring-purple-500 transition-all"
                required
              />
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>

          <div className="pt-4 flex flex-col-reverse md:flex-row gap-3">
            <Button type="button" variant="ghost" onClick={onClose} className="h-12 rounded-xl font-bold">Annuler</Button>
            <Button type="submit" className="h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black shadow-lg shadow-purple-600/20">
              Valider
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function ChargePage({ pressingId }: { pressingId: number }) {
  const navigate = useNavigate();
  const [charges, setCharges] = useState<Charge[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCharge, setEditingCharge] = useState<Charge | null>(null);

  const isAdmin = (localStorage.getItem("role") || "").includes("ADMIN");

  const loadCharges = async () => {
    try {
      const data = await getAllCharges();
      setCharges(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => { loadCharges(); }, []);

  const handleSave = async (data: ChargeFormData, id?: number) => {
    try {
      const payload = {
        description: data.description,
        montant: data.montant,
        dateCharge: data.dateCharge,
        pressing: { id: pressingId },
      };
      id ? await updateCharge(id, payload) : await createCharge(payload);
      await loadCharges();
    } catch (error) {
      alert("Erreur lors de l’enregistrement.");
    }
  };

  const handleDeleteCharge = async (id: number) => {
    if (!window.confirm("Supprimer cette dépense ?")) return;
    try {
      await deleteCharge(id);
      await loadCharges();
    } catch (error) {
      alert("Erreur lors de la suppression.");
    }
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
            <div className="p-2 bg-purple-600 text-white rounded-xl shadow-lg shadow-purple-600/20">
              <CreditCard size={20} className="md:w-6 md:h-6" />
            </div>
            <h1 className="text-xl md:text-3xl font-black tracking-tight">Gestion des Charges</h1>
          </div>
        </div>

        {isAdmin && (
          <Button
            onClick={() => { setEditingCharge(null); setIsModalOpen(true); }}
            className="hidden md:flex bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black shadow-lg shadow-purple-600/20"
          >
            <Plus size={18} className="mr-2" /> Nouvelle Charge
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
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Description</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Date</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Montant</th>
                <th className="px-6 py-4 text-right text-[10px] font-black uppercase text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {charges.map((charge) => (
                <tr key={charge.id} className="hover:bg-purple-50/30 transition-colors group">
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100">{charge.description}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {charge.dateCharge ? new Date(charge.dateCharge).toLocaleDateString("fr-FR") : "—"}
                  </td>
                  <td className="px-6 py-4 font-black text-purple-600">
                    {Number(charge.montant).toLocaleString()} <span className="text-[10px] font-normal">CFA</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingCharge(charge); setIsModalOpen(true); }} className="h-8 w-8 text-indigo-600"><Pencil size={14} /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteCharge(charge.id!)} className="h-8 w-8 text-red-600"><Trash2 size={14} /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* VUE MOBILE (CARDS) */}
        <div className="md:hidden grid grid-cols-1 gap-3">
          {charges.map((charge) => (
            <div key={charge.id} className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm active:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="font-black text-gray-900 dark:text-white text-lg leading-tight">{charge.description}</h3>
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Calendar size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                       {charge.dateCharge ? new Date(charge.dateCharge).toLocaleDateString("fr-FR") : "—"}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-purple-600 leading-none">{Number(charge.montant).toLocaleString()} F</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-50 dark:border-gray-800">
                <Button onClick={() => { setEditingCharge(charge); setIsModalOpen(true); }} variant="secondary" className="h-9 flex-1 rounded-xl font-bold text-xs bg-indigo-50 text-indigo-600 border-none">
                  <Pencil size={14} className="mr-2" /> Modifier
                </Button>
                <Button onClick={() => handleDeleteCharge(charge.id!)} variant="secondary" className="h-9 flex-1 rounded-xl font-bold text-xs bg-red-50 text-red-600 border-none">
                  <Trash2 size={14} className="mr-2" /> Supprimer
                </Button>
              </div>
            </div>
          ))}
        </div>

        {charges.length === 0 && (
          <div className="py-20 text-center opacity-40">
            <CreditCard size={48} className="mx-auto mb-4" />
            <p className="font-bold italic uppercase text-xs tracking-widest">Aucune charge enregistrée</p>
          </div>
        )}
      </div>

      {/* BOUTON FLOTTANT (Mobile seulement) */}
      {isAdmin && (
        <button
          onClick={() => { setEditingCharge(null); setIsModalOpen(true); }}
          className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-transform z-50"
        >
          <Plus size={28} />
        </button>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <ChargeFormModal
          chargeToEdit={editingCharge}
          onClose={() => { setIsModalOpen(false); setEditingCharge(null); }}
          onSave={handleSave}
          pressingId={pressingId}
        />
      )}
    </div>
  );
}