import React, { useEffect, useState } from "react";
import { CreditCard, Plus, Pencil, Trash2, X, Calendar, DollarSign, FileText } from "lucide-react";
import {
  getAllCharges,
  createCharge,
  updateCharge,
  deleteCharge,
  Charge,
} from "../services/charge.service.ts";

// ========= MODAL FORMULAIRE =========
const ChargeFormModal: React.FC<{
  chargeToEdit: Charge | null;
  onClose: () => void;
  onSave: (data: { description: string; montant: number }, id?: number) => void;
}> = ({ chargeToEdit, onClose, onSave }) => {
  const isEditing = Boolean(chargeToEdit);
  const [formData, setFormData] = useState({
    description: chargeToEdit?.description || "",
    montant: chargeToEdit?.montant || 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "montant" ? Number(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim()) return alert("Veuillez saisir une description.");
    if (formData.montant <= 0) return alert("Le montant doit être supérieur à zéro.");
    onSave(formData, chargeToEdit?.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold dark:text-gray-100">
            {isEditing ? "Modifier la charge" : "Nouvelle charge"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase ml-1 mb-1">
              Description
            </label>
            <input
              type="text"
              name="description"
              autoFocus
              value={formData.description}
              onChange={handleChange}
              placeholder="Ex: Loyer, Electricité..."
              className="w-full border-none bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase ml-1 mb-1">
              Montant (CFA)
            </label>
            <input
              type="number"
              name="montant"
              value={formData.montant}
              onChange={handleChange}
              className="w-full border-none bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500 dark:text-gray-100 font-mono"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-lg shadow-purple-600/20 transition"
            >
              {isEditing ? "Enregistrer" : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ========= PAGE PRINCIPALE =========
export default function ChargePage() {
  const [charges, setCharges] = useState<Charge[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCharge, setEditingCharge] = useState<Charge | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadCharges = async () => {
    setIsLoading(true);
    try {
      const data = await getAllCharges();
      setCharges(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCharges();
  }, []);

  const handleAdd = () => {
    setEditingCharge(null);
    setIsModalOpen(true);
  };

  const handleEdit = (charge: Charge) => {
    setEditingCharge(charge);
    setIsModalOpen(true);
  };

  const handleDeleteCharge = async (id: number) => {
    if (!window.confirm("Supprimer cette charge ?")) return;
    try {
      await deleteCharge(id);
      await loadCharges();
    } catch (error) {
      alert("Erreur lors de la suppression.");
    }
  };

  const handleSave = async (data: { description: string; montant: number }, id?: number) => {
    try {
      if (id) {
        await updateCharge(id, data);
      } else {
        await createCharge(data);
      }
      await loadCharges();
    } catch (error) {
      alert("Erreur lors de l’enregistrement.");
    }
  };

  return (
    /* h-screen + flex-col + overflow-hidden pour bloquer le scroll du navigateur */
    <div className="h-screen flex flex-col p-4 md:p-8 space-y-6 bg-white dark:bg-gray-950 overflow-hidden max-w-7xl mx-auto">
      
      {/* HEADER SECTION (Fixe) */}
      <div className="flex-none flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl">
              <CreditCard size={24} />
            </div>
            Gestion des Charges
          </h1>
          <p className="text-muted-foreground text-sm">{charges.length} charges enregistrées</p>
        </div>

        <button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
        >
          <Plus size={20} /> Ajouter une charge
        </button>
      </div>

      {/* ZONE DE CONTENU SCROLLABLE (Interne) */}
      <div className="flex-1 overflow-y-auto scrollbar-thin pr-1 -mr-1">
        {isLoading ? (
          <div className="flex justify-center py-20 animate-pulse text-purple-600">Chargement...</div>
        ) : (
          <>
            {/* VUE MOBILE (Cartes) */}
            <div className="grid grid-cols-1 gap-4 md:hidden pb-10">
              {charges.map((charge) => (
                <div key={charge.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                        <FileText size={18} className="text-gray-400" />
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-gray-100">{charge.description}</h3>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(charge)} className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDeleteCharge(charge.id!)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Montant</span>
                      <span className="text-sm font-black text-purple-600">{Number(charge.montant).toLocaleString()} CFA</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <Calendar size={12} />
                        {charge.dateCharge ? new Date(charge.dateCharge).toLocaleDateString("fr-FR") : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* VUE DESKTOP (Tableau avec Header Collant) */}
            <div className="hidden md:block rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800 text-left">
                <thead className="bg-gray-50 dark:bg-gray-800/50 sticky top-0 z-10 backdrop-blur-md">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Montant</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {charges.length > 0 ? (
                    charges.map((charge) => (
                      <tr key={charge.id} className="hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-800 dark:text-gray-200">{charge.description}</td>
                        <td className="px-6 py-4 font-black text-purple-600">{Number(charge.montant).toLocaleString()} CFA</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-gray-400" />
                            {charge.dateCharge ? new Date(charge.dateCharge).toLocaleDateString("fr-FR") : "—"}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-1 justify-end">
                            <button
                              onClick={() => handleEdit(charge)}
                              className="p-2 text-indigo-600 hover:bg-white dark:hover:bg-gray-800 shadow-sm hover:shadow rounded-lg transition"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteCharge(charge.id!)}
                              className="p-2 text-red-600 hover:bg-white dark:hover:bg-gray-800 shadow-sm hover:shadow rounded-lg transition"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-20 text-gray-400 italic">
                        Aucune charge enregistrée pour le moment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <ChargeFormModal
          chargeToEdit={editingCharge}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}