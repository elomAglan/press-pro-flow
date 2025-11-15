import React, { useEffect, useState } from "react";
import { CreditCard, Plus, Pencil, Trash2, X } from "lucide-react";
import {
  getAllCharges,
  createCharge,
  updateCharge,
  deleteCharge,
  Charge,
} from "../services/charge.service.ts";

const ChargeFormModal: React.FC<{
  chargeToEdit: Charge | null;
  onClose: () => void;
  onSave: (data: { description: string; montant: number }, id?: number) => void;
}> = ({ chargeToEdit, onClose, onSave }) => {
  const isEditing = Boolean(chargeToEdit);

  // 🚀 Formulaire SANS date (car date générée par le backend)
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {isEditing ? "Modifier la charge" : "Ajouter une charge"}
          </h2>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full border rounded-md p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Montant (CFA)</label>
            <input
              type="number"
              name="montant"
              value={formData.montant}
              onChange={handleChange}
              className="mt-1 block w-full border rounded-md p-2"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 rounded">
              Annuler
            </button>
            <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded">
              {isEditing ? "Enregistrer" : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function ChargePage() {
  const [charges, setCharges] = useState<Charge[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCharge, setEditingCharge] = useState<Charge | null>(null);

  const loadCharges = async () => {
    try {
      const data = await getAllCharges();
      setCharges(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      alert("Erreur lors du chargement des charges.");
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
      console.error(error);
      alert("Erreur lors de la suppression.");
    }
  };

  // 🚀 Enregistrement sans date (la date vient du backend)
  const handleSave = async (data: { description: string; montant: number }, id?: number) => {
    try {
      if (id) {
        await updateCharge(id, data); // pas de date envoyée
      } else {
        await createCharge(data); // pas de date envoyée
      }
      await loadCharges();
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l’enregistrement.");
    }
  };

  return (
    <div className="p-6 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard /> Charges
        </h1>

        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-purple-600 text-white rounded flex items-center gap-2"
        >
          <Plus /> Ajouter
        </button>
      </div>

      <div className="bg-white border rounded shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">Description</th>
              <th className="px-6 py-3 text-left">Montant (CFA)</th>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {charges.length > 0 ? (
              charges.map((charge) => (
                <tr key={charge.id} className="hover:bg-purple-50">
                  <td className="px-6 py-4">{charge.description}</td>

                  <td className="px-6 py-4 font-semibold">
                    {Number(charge.montant).toLocaleString()} CFA
                  </td>

                  <td className="px-6 py-4">
                    {charge.dateCharge
                      ? new Date(charge.dateCharge).toLocaleDateString("fr-FR")
                      : "—"}
                  </td>

                  <td className="px-6 py-4 text-right flex gap-2 justify-end">
                    <button
                      onClick={() => handleEdit(charge)}
                      className="p-2 text-indigo-600 hover:bg-indigo-100 rounded"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => handleDeleteCharge(charge.id!)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center p-6 text-gray-500">
                  Aucune charge définie
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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