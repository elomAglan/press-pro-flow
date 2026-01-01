import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { CreditCard, Plus, Pencil, Trash2, X, ArrowLeft, Calendar, DollarSign, RefreshCw } from "lucide-react";
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

// --- MODAL COMPONENT (Full Responsive) ---
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
      <div className="bg-white dark:bg-gray-900 rounded-t-[2.5rem] md:rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl animate-in slide-in-from-bottom duration-300 md:zoom-in">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
            <CreditCard size={22} className="text-purple-600" />
            {isEditing ? "Modifier Charge" : "Nouvelle Charge"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 pb-10 md:pb-0">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full rounded-2xl bg-gray-50 dark:bg-gray-800 border-none p-4 text-sm font-bold focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="Ex: Électricité, Loyer..."
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Montant (F)</label>
            <div className="relative">
              <input
                type="number"
                value={formData.montant || ''}
                onChange={(e) => setFormData({...formData, montant: Number(e.target.value)})}
                className="w-full rounded-2xl bg-gray-50 dark:bg-gray-800 border-none p-4 pl-12 text-lg font-black text-purple-600 focus:ring-2 focus:ring-purple-500 outline-none"
                required
              />
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Date</label>
            <input
              type="date"
              value={formData.dateCharge}
              onChange={(e) => setFormData({...formData, dateCharge: e.target.value})}
              className="w-full rounded-2xl bg-gray-50 dark:bg-gray-800 border-none p-4 text-sm font-bold focus:ring-2 focus:ring-purple-500 outline-none"
              required
            />
          </div>

          <Button type="submit" className="w-full h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black shadow-lg">
            Valider
          </Button>
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
  const [loading, setLoading] = useState(false);

  const isAdmin = (localStorage.getItem("role") || "").includes("ADMIN");

  const loadCharges = async () => {
    setLoading(true);
    try {
      const data = await getAllCharges();
      setCharges(Array.isArray(data) ? data : []);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
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
    } catch (error) { alert("Erreur d’enregistrement"); }
  };

  const handleDeleteCharge = async (id: number) => {
    if (!window.confirm("Supprimer cette dépense ?")) return;
    try {
      await deleteCharge(id);
      await loadCharges();
    } catch (error) { alert("Erreur de suppression"); }
  };

  return (
    <div className="space-y-8 pb-24">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white dark:bg-gray-900 border border-gray-100 rounded-2xl shadow-sm">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Charges & Frais</h1>
            <p className="hidden sm:block text-gray-500 italic">Suivi des dépenses du pressing</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={loadCharges} className="p-3.5 bg-white dark:bg-gray-900 border border-gray-100 rounded-2xl text-gray-400">
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          {isAdmin && (
            <Button onClick={() => { setEditingCharge(null); setIsModalOpen(true); }} className="h-12 px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black shadow-lg">
              <Plus size={20} className="mr-2" /> <span className="hidden sm:inline">Nouvelle Charge</span><span className="sm:hidden">Ajouter</span>
            </Button>
          )}
        </div>
      </div>

      {/* --- VUE MOBILE (CARDS) --- */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {charges.map((charge) => (
          <div key={charge.id} className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-1">
                <h3 className="font-black text-gray-900 dark:text-white text-lg">{charge.description}</h3>
                <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                  <Calendar size={14} className="text-purple-500" />
                  {charge.dateCharge ? new Date(charge.dateCharge).toLocaleDateString("fr-FR") : "—"}
                </div>
              </div>
              <p className="text-xl font-black text-purple-600">{Number(charge.montant).toLocaleString()} F</p>
            </div>
            
            {isAdmin && (
              <div className="flex gap-2 pt-4 border-t border-gray-50 dark:border-gray-800">
                <Button onClick={() => { setEditingCharge(charge); setIsModalOpen(true); }} className="flex-1 bg-indigo-50 text-indigo-600 font-bold rounded-xl h-10 border-none shadow-none">Modifier</Button>
                <Button onClick={() => handleDeleteCharge(charge.id!)} className="bg-red-50 text-red-600 font-bold rounded-xl h-10 border-none shadow-none"><Trash2 size={16}/></Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* --- VUE DESKTOP (TABLEAU) --- */}
      <div className="hidden md:block bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50">
              <th className="px-8 py-6 text-[11px] font-black uppercase text-gray-400 tracking-widest">Description</th>
              <th className="px-8 py-6 text-[11px] font-black uppercase text-gray-400 tracking-widest">Date</th>
              <th className="px-8 py-6 text-[11px] font-black uppercase text-gray-400 tracking-widest">Montant</th>
              {isAdmin && <th className="px-8 py-6 text-right text-[11px] font-black uppercase text-gray-400 tracking-widest">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {charges.map((charge) => (
              <tr key={charge.id} className="hover:bg-purple-50/30 transition-colors">
                <td className="px-8 py-6 font-black text-gray-900 dark:text-gray-100 text-lg">{charge.description}</td>
                <td className="px-8 py-6 text-gray-500 font-medium">
                  {charge.dateCharge ? new Date(charge.dateCharge).toLocaleDateString("fr-FR") : "—"}
                </td>
                <td className="px-8 py-6 font-black text-purple-600 text-xl">
                  {Number(charge.montant).toLocaleString()} F
                </td>
                {isAdmin && (
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-3">
                      <Button variant="ghost" onClick={() => { setEditingCharge(charge); setIsModalOpen(true); }} className="h-11 w-11 rounded-xl text-indigo-600 bg-indigo-50"><Pencil size={18} /></Button>
                      <Button variant="ghost" onClick={() => handleDeleteCharge(charge.id!)} className="h-11 w-11 rounded-xl text-red-600 bg-red-50"><Trash2 size={18} /></Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EMPTY STATE */}
      {!loading && charges.length === 0 && (
        <div className="py-24 text-center opacity-30">
          <CreditCard size={64} className="mx-auto mb-4" />
          <p className="font-black uppercase text-xs tracking-[0.2em]">Aucune dépense enregistrée</p>
        </div>
      )}

      {/* BOUTON FLOTTANT MOBILE */}
      {isAdmin && (
        <button
          onClick={() => { setEditingCharge(null); setIsModalOpen(true); }}
          className="md:hidden fixed bottom-8 right-8 w-16 h-16 bg-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50 active:scale-90 transition-transform"
        >
          <Plus size={32} />
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