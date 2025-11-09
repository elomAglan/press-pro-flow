import React from 'react';
import { useNavigate } from 'react-router-dom';
// Import des icônes nécessaires
import { Tag, DollarSign, Plus, Trash2, Pencil, ArrowLeft, X } from 'lucide-react';

// 1. Définition de l'interface Tarif (sans 'unite')
interface Tarif {
  id: number;
  linge: string;
  service: string;
  prix: number;
}

// Liste des options de service disponibles
const SERVICE_OPTIONS = [
    "Lavage & Repassage",
    "Lavage simple",
    // Vous pourrez ajouter ici d'autres services standard comme "Nettoyage à sec" si nécessaire
];

// Composant Modal de Formulaire pour l'ajout et la modification
interface TarifFormModalProps {
    tarifToEdit: Tarif | null;
    onClose: () => void;
    onSave: (data: Omit<Tarif, 'id'>, id?: number) => void;
}

const TarifFormModal: React.FC<TarifFormModalProps> = ({ tarifToEdit, onClose, onSave }) => {
    const isEditing = !!tarifToEdit;
    
    // Initialiser les données du formulaire avec le tarif à éditer ou des valeurs par défaut
    const initialData = tarifToEdit || { linge: '', service: '', prix: 0 };
    // Assurez-vous que le service par défaut est vide si on ajoute, sinon prenez la valeur existante
    const [formData, setFormData] = React.useState<Omit<Tarif, 'id'>>({
        ...initialData,
        service: initialData.service || '', // Assurez-vous qu'une nouvelle entrée commence sans sélection
    });


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ 
        ...prev, 
        // Conversion en nombre pour le prix
        [name]: name === 'prix' ? parseFloat(value) || (value === '' ? 0 : prev.prix) : value 
      }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Validation simple
        if (!formData.linge || !formData.service || formData.prix <= 0) {
            // Remplacer alert() par une méthode d'affichage d'erreur intégrée (comme les toasts) dans une application réelle
            alert("Veuillez remplir tous les champs. Le prix doit être supérieur à zéro.");
            return;
        }

        // Appel de la fonction de sauvegarde avec les données et l'ID si c'est une modification
        onSave(formData, tarifToEdit?.id);
        onClose(); // Fermer le modal après la sauvegarde
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                        {isEditing ? `Modifier : ${tarifToEdit?.linge}` : "Ajouter un nouveau tarif"}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
                        <X size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="linge" className="block text-sm font-medium text-gray-700">Type de Linge</label>
                        <input
                            type="text"
                            id="linge"
                            name="linge"
                            value={formData.linge}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-2 border"
                            placeholder="Ex: Chemise en coton"
                            required
                        />
                    </div>
                    
                    {/* MODIFICATION : INPUT REMPLACÉ PAR UN SELECT */}
                    <div>
                        <label htmlFor="service" className="block text-sm font-medium text-gray-700">Service</label>
                        <select
                            id="service"
                            name="service"
                            value={formData.service}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-2 border bg-white appearance-none pr-8"
                            required
                        >
                            <option value="" disabled>Sélectionner un service</option>
                            {SERVICE_OPTIONS.map(service => (
                                <option key={service} value={service}>{service}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label htmlFor="prix" className="block text-sm font-medium text-gray-700">Prix (€)</label>
                        <input
                            type="number"
                            id="prix"
                            name="prix"
                            value={formData.prix || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-2 border"
                            placeholder="Ex: 8.50"
                            step="0.01"
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
                            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition shadow-md"
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

  // MISE À JOUR : Les données de démo utilisent les nouveaux services
  const [tarifs, setTarifs] = React.useState<Tarif[]>([
    { id: 1, linge: "Chemise en coton", service: "Lavage & Repassage", prix: 5.50 },
    { id: 2, linge: "Pantalon en laine", service: "Lavage simple", prix: 8.00 },
    { id: 3, linge: "Housse de Couette (Double)", service: "Lavage & Repassage", prix: 12.00 },
    { id: 4, linge: "Robe de soirée (Soie)", service: "Lavage simple", prix: 15.00 },
  ]);

  // État pour gérer le modal
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingTarif, setEditingTarif] = React.useState<Tarif | null>(null);

  // Ouvre le modal pour ajouter un nouveau tarif
  const handleAdd = () => {
    setEditingTarif(null);
    setIsModalOpen(true);
  };
  
  // Ouvre le modal pour modifier un tarif existant
  const handleEdit = (tarif: Tarif) => {
    setEditingTarif(tarif);
    setIsModalOpen(true);
  };

  // Ferme le modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTarif(null);
  };
  
  // Gère la logique de sauvegarde (ajout ou modification)
  const handleSave = (tarifData: Omit<Tarif, 'id'>, id?: number) => {
    if (id) {
        // Modification
        setTarifs(tarifs.map(t => t.id === id ? { ...t, ...tarifData } : t));
    } else {
        // Ajout
        const newId = Math.max(0, ...tarifs.map(t => t.id)) + 1;
        setTarifs([...tarifs, { id: newId, ...tarifData }]);
    }
    // Note: Le modal est fermé dans TarifFormModal.handleSubmit
  };


  const handleDelete = (id: number) => {
    // Remplacer window.confirm par un composant modal de confirmation
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce tarif ?")) {
      setTarifs(tarifs.filter(tarif => tarif.id !== id));
    }
  };

  // Fonction pour gérer le retour
  const handleGoBack = () => {
    navigate(-1); // Revenir à la page précédente
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Bouton Retour */}
            <button
                onClick={handleGoBack}
                className="p-3 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-full transition shadow-sm"
                title="Retour"
            >
                <ArrowLeft size={20} />
            </button>
            <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Tag size={28} className="text-purple-600" />
                    Gestion des Tarifs
                </h1>
                <p className="text-gray-500 mt-1">Définissez et ajustez les prix des services de votre pressing.</p>
            </div>
          </div>

          {/* Bouton AJOUTER MAINTENANT FONCTIONNEL */}
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition shadow-md"
          >
            <Plus size={20} /> Ajouter un Tarif
          </button>
        </div>

        <hr className="my-6" />

        {/* Tableau des Tarifs */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Linge
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix (€)
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tarifs.map((tarif) => (
                <tr key={tarif.id} className="hover:bg-purple-50 transition duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{tarif.linge}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{tarif.service}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold flex items-center gap-1">
                    <DollarSign size={14} className="text-green-600"/>
                    {tarif.prix.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {/* Bouton MODIFIER MAINTENANT FONCTIONNEL */}
                    <button
                      onClick={() => handleEdit(tarif)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4 p-2 rounded-full hover:bg-indigo-100 transition"
                      title="Modifier"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(tarif.id)}
                      className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-100 transition"
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tarifs.length === 0 && (
            <div className="p-6 text-center text-gray-500">
                <p className="font-medium">Aucun tarif défini.</p>
                <p className="text-sm">Cliquez sur "Ajouter un Tarif" pour commencer.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* 3. Intégration du modal conditionnel */}
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