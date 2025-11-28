import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Plus, Trash2, Pencil, ArrowLeft, Scale, X } from 'lucide-react';

// 👉 1. IMPORTATION DU SERVICE
import {
  getAllTarifPoids,
  createTarifPoids,
  updateTarifPoids,
  deleteTarifPoids
} from "@/services/tarifPoids.Service"; // Adaptez le chemin d'accès à votre structure de projet !

// --- TYPES & CONSTANTES INTERNES ---
// --- TYPES & CONSTANTES INTERNES ---
// Définition locale du type TarifPoids si non exporté par le service
export interface TarifPoids {
  id: number;
  tranchePoids: string;
  service: string;
  prix: number;
}
type Tarif = TarifPoids; // On utilise le type local.
const SERVICE_OPTIONS = [
  "Lavage simple",
  "Lavage + Séchage",
  "L+S + Repassage",
  "Lavage Express",
];

const WEIGHT_TRANCHES = [
  "1Kg-4Kg",
  "5Kg-9Kg",
  "10Kg-20Kg",
  "Supérieur à 20Kg"
];

// --- COMPOSANT MODAL (TarifFormModal Kilo) ---
// (Aucun changement dans la modal, elle reste la même)
interface TarifFormModalProps {
  tarifToEdit: TarifPoids | null;
  onClose: () => void;
onSave: (data: Omit<TarifPoids, 'id'>, id?: number) => void;
}

const TarifFormModal: React.FC<TarifFormModalProps> = ({ tarifToEdit, onClose, onSave }) => {
  const isEditing = !!tarifToEdit;
  
  // Initialisation des données pour le mode 'poids'
  const initialData = tarifToEdit 
    ? { tranchePoids: tarifToEdit.tranchePoids, service: tarifToEdit.service, prix: tarifToEdit.prix }
    : { tranchePoids: '', service: '', prix: 0 };

  const [formData, setFormData] = React.useState<typeof initialData>(initialData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'prix' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.tranchePoids || !formData.service || formData.prix <= 0) {
      alert("Veuillez remplir tous les champs. Le prix doit être supérieur à zéro.");
      return;
    }
    
      onSave({ ...formData }, tarifToEdit?.id);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Scale size={20} />
            {isEditing ? "Modifier la Tranche de Poids" : "Ajouter un Tarif Au Kilo"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="tranchePoids" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tranche de poids
            </label>
            <select
              id="tranchePoids"
              name="tranchePoids"
              value={formData.tranchePoids}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              required
            >
              <option value="" disabled>Choisir une tranche</option>
              {WEIGHT_TRANCHES.map(tranche => (
                <option key={tranche} value={tranche}>{tranche}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="service" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Service
            </label>
            <select
              id="service"
              name="service"
              value={formData.service}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              required
            >
              <option value="" disabled>Sélectionner un service</option>
              {SERVICE_OPTIONS.map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="prix" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Prix (CFA)
            </label>
            <input
              type="number"
              id="prix"
              name="prix"
              value={formData.prix || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              placeholder="Ex: 700"
              step="1"
              required
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition shadow-md"
            >
              {isEditing ? "Enregistrer" : "Créer le Tarif"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- COMPOSANT PRINCIPAL ---
export default function TarifsKilo() {
  const navigate = useNavigate();
  const [tarifs, setTarifs] = React.useState<TarifPoids[]>([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingTarif, setEditingTarif] = React.useState<TarifPoids | null>(null);

  const role = "ADMIN"; // Simulez le rôle pour l'administration
  const isAdmin = role === "ADMIN" || role === "ADMINISTRATEUR";

  // ✅ 2. RETRAIT DU MOCK - REMPLACEMENT DU useEffect PAR L'APPEL API
  React.useEffect(() => {
    async function loadTarifs() {
      try {
        const data = await getAllTarifPoids();
        setTarifs(data);
      } catch (error: any) {
        // Le `error.message` dépend de la structure de l'erreur renvoyée par `tarifPoids.Service`
        alert("❌ Impossible de charger les tarifs au kilo : " + error.message);
      }
    }

    loadTarifs();
  }, []); // Dépendance vide pour n'appeler qu'une seule fois au montage

  const handleAdd = () => {
    setEditingTarif(null);
    setIsModalOpen(true);
  };

  const handleEdit = (tarif: TarifPoids) => {
    setEditingTarif(tarif);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTarif(null);
  };

  // ✅ 3. INTÉGRATION DU CREATE + UPDATE (Remplacement de handleSave)
  const handleSave = async (tarifData: Omit<TarifPoids, 'id'>, id?: number) => {
    try {
      if (id) {
        // === UPDATE ===
        const updated = await updateTarifPoids(id, tarifData);
        // Mise à jour de l'état local avec le tarif mis à jour
        setTarifs(prev => prev.map(t => (t.id === id ? updated : t)));
        alert("✅ Tarif au kilo modifié avec succès");
      } else {
        // === CREATE ===
        const created = await createTarifPoids(tarifData);
        // Ajout du nouveau tarif créé (avec son nouvel ID) à l'état local
        setTarifs(prev => [...prev, created]);
        alert("✅ Tarif au kilo créé avec succès");
      }

      handleCloseModal(); // Fermer la modal après succès
    } catch (error: any) {
      alert("❌ Erreur : " + error.message);
    }
  };

  // ✅ 4. INTÉGRATION DU DELETE (Remplacement de handleDelete)
  const handleDelete = async (id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce tarif au kilo ?")) return;

    try {
      await deleteTarifPoids(id);
      // Filtrage de l'état local pour retirer le tarif supprimé
      setTarifs(prev => prev.filter(t => t.id !== id));
      alert("🗑️ Tarif au kilo supprimé");
    } catch (error: any) {
      alert("❌ Erreur lors de la suppression : " + error.message);
    }
  };

  const handleGoBack = () => navigate(-1);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleGoBack}
              className="p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full transition shadow-sm"
              title="Retour"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Scale size={28} className="text-green-600 dark:text-green-400" />
                Gestion des Tarifs Au Kilo
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Définissez les prix pour le service de lavage par tranche de poids
              </p>
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition shadow-md"
            >
              <Plus size={18} /> Ajouter un Tarif Au Kilo
            </button>
          )}
        </div>
        
        <hr className="border-gray-200 dark:border-gray-700"/>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Tranche de Poids (Kg)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Prix (CFA)
                </th>
                {isAdmin && <th className="px-6 py-3"></th>}
              </tr>
            </thead>

            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {tarifs.map(tarif => (
                <tr 
                  key={tarif.id} 
                  className="bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900/30 transition duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                      <Scale size={14} /> {tarif.tranchePoids}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {tarif.service}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 font-semibold">
                    <div className="flex items-center gap-1">
                      <DollarSign size={14} className="text-green-600 dark:text-green-400"/>
                      {tarif.prix.toFixed(0)} CFA
                    </div>
                  </td>

                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => handleEdit(tarif)}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 p-1 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900 transition"
                          title="Modifier"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(tarif.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {tarifs.length === 0 && (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              <p className="font-medium">Aucun tarif au kilo n'est défini pour le moment.</p>
              {isAdmin && <p className="text-sm">Cliquez sur **Ajouter un Tarif Au Kilo** pour ajouter la première tranche.</p>}
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