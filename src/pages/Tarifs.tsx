// Tarifs.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, DollarSign, Plus, Trash2, Pencil, ArrowLeft, X } from 'lucide-react';
import { getAllTarifs, createTarif, updateTarif, deleteTarif } from '@/services/tarif.service.ts';

interface Tarif {
  id: number;
  article: string;
  service: string;
  prix: number;
}

const SERVICE_OPTIONS = [
  "Lavage & Repassage",
  "Lavage & Repassage (Express)",
  "Lavage simple",
  "Lavage simple (Express)",
];

interface TarifFormModalProps {
  tarifToEdit: Tarif | null;
  onClose: () => void;
  onSave: (data: Omit<Tarif, 'id'>, id?: number) => void;
}

const TarifFormModal: React.FC<TarifFormModalProps> = ({ tarifToEdit, onClose, onSave }) => {
  const isEditing = !!tarifToEdit;
  const initialData = tarifToEdit || { article: '', service: '', prix: 0 };
  const [formData, setFormData] = React.useState<Omit<Tarif, 'id'>>({
    ...initialData,
    service: initialData.service || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'prix' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.article || !formData.service || formData.prix <= 0) {
      alert("Veuillez remplir tous les champs. Le prix doit être supérieur à zéro.");
      return;
    }
    onSave(formData, tarifToEdit?.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? `Modifier : ${tarifToEdit?.article}` : "Ajouter un nouveau tarif"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="article" className="block text-sm font-medium text-gray-700">Type d'article</label>
            <input
              type="text"
              id="article"
              name="article"
              value={formData.article}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              placeholder="Ex: Chemise en coton"
              required
            />
          </div>

          <div>
            <label htmlFor="service" className="block text-sm font-medium text-gray-700">Service</label>
            <select
              id="service"
              name="service"
              value={formData.service}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border bg-white appearance-none pr-8"
              required
            >
              <option value="" disabled>Sélectionner un service</option>
              {SERVICE_OPTIONS.map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="prix" className="block text-sm font-medium text-gray-700">Prix (CFA)</label>
            <input
              type="number"
              id="prix"
              name="prix"
              value={formData.prix || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              placeholder="Ex: 5000"
              step="1"
              required
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition shadow-md"
            >
              {isEditing ? "Enregistrer les modifications" : "Créer le Tarif"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function Tarifs() {
  const navigate = useNavigate();
  const [tarifs, setTarifs] = React.useState<Tarif[]>([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingTarif, setEditingTarif] = React.useState<Tarif | null>(null);

  // Récupérer le rôle depuis localStorage
  const role = localStorage.getItem("role") || "COMPTOIR";
  const isAdmin = role === "ADMIN" || role === "ADMINISTRATEUR";

  React.useEffect(() => {
    fetchTarifs();
  }, []);

  const fetchTarifs = async () => {
    try {
      const data = await getAllTarifs();
      setTarifs(data);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleAdd = () => {
    setEditingTarif(null);
    setIsModalOpen(true);
  };

  const handleEdit = (tarif: Tarif) => {
    setEditingTarif(tarif);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTarif(null);
  };

  const handleSave = async (tarifData: Omit<Tarif, 'id'>, id?: number) => {
    try {
      if (id) {
        await updateTarif(id, tarifData);
      } else {
        await createTarif(tarifData);
      }
      await fetchTarifs();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce tarif ?")) {
      try {
        await deleteTarif(id);
        setTarifs(tarifs.filter(t => t.id !== id));
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  const handleGoBack = () => navigate(-1);

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleGoBack}
              className="p-3 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-full transition shadow-sm"
              title="Retour"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Tag size={28} className="text-blue-600" />
                Gestion des Tarifs
              </h1>
              <p className="text-gray-500 mt-1">Définissez et ajustez les prix des services de votre pressing.</p>
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition shadow-md"
            >
              <Plus size={20} /> Ajouter un Tarif
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Article</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix (CFA)</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {tarifs.map(tarif => (
                <tr key={tarif.id} className="hover:bg-blue-50 transition duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{tarif.article}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{tarif.service}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">
                    <div className="flex items-center justify-between gap-2">
                      {/* Prix */}
                      <div className="flex items-center gap-1">
                        <DollarSign size={14} className="text-green-600"/>
                        {tarif.prix.toFixed(0)} CFA
                      </div>

                      {/* Boutons actions pour admin */}
                      {isAdmin && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(tarif)}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-100 transition"
                            title="Modifier"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(tarif.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100 transition"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {tarifs.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              <p className="font-medium">Aucun tarif défini.</p>
              {isAdmin && <p className="text-sm">Cliquez sur "Ajouter un Tarif" pour commencer.</p>}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <TarifFormModal
          tarifToEdit={editingTarif}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
