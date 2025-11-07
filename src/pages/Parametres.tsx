import React, { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Home, Mail, Phone, MapPin, CheckCircle2, Shirt, Tag, Briefcase } from 'lucide-react';

// --- Types ---
type Pressing = {
  id: string;
  nom: string;
  adresse: string;
  telephone: string;
  email: string;
};

type ActiveTab = 'pressings' | 'linge' | 'tarifs' | 'services';

// --- Mock Data ---
const mockPressings: Pressing[] = [
  { id: "1", nom: "Net'Express Dakar", adresse: "Rue 42, Liberté VI, Dakar", telephone: "+221 77 123 45 67", email: "dakar@netexpress.com" },
  { id: "2", nom: "Clean Pro Abidjan", adresse: "Boulevard de Marseille, Zone 4", telephone: "+225 07 00 98 76 54", email: "abidjan@cleanpro.ci" },
  { id: "3", nom: "La Maison du Propre", adresse: "Avenue du 2 Février, Lomé", telephone: "+228 90 11 22 33", email: "contact@lamaisondupropre.tg" },
];

// --- Card Component (Dark Mode Support) ---
interface CardProps { children: React.ReactNode; className?: string; title?: string; }
const Card: React.FC<CardProps> = ({ children, className = "", title }) => (
  <div className={`rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 p-6 ${className}`}>
    {title && (
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 border-b pb-2 border-gray-100 dark:border-gray-700">
        {title}
      </h2>
    )}
    {children}
  </div>
);

// --- Toast / Notification ---
const showToast = (title: string, description: string, isDestructive = false) => {
  console.log(`[TOAST] ${title}: ${description}`);
  // Remplacement de window.alert par une simple alerte pour l'environnement Canvas
  alert(`${title}\n${description}`);
};

// --- Modal / Dialog (Dark Mode Support) ---
const PressingDialog: React.FC<{isOpen: boolean, onClose: () => void, children: React.ReactNode, title: string}> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 p-4" onClick={onClose}>
      <div 
        className="w-full max-w-lg rounded-xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-100 dark:border-gray-700" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4 border-b pb-3 border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h3>
            <button 
                onClick={onClose} 
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition" 
                aria-label="Fermer"
            >
              <Plus className="h-5 w-5 rotate-45" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---
export default function ParametresPressing() {
  const [pressings, setPressings] = useState<Pressing[]>(mockPressings);
  const [activeTab, setActiveTab] = useState<ActiveTab>('pressings'); // Nouvelle gestion de la tabulation
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPressing, setEditingPressing] = useState<Pressing | null>(null);
  const [formData, setFormData] = useState({ nom: "", adresse: "", telephone: "", email: "" });

  const tabs = [
    { id: 'pressings', name: 'Pressings', icon: Home },
    { id: 'linge', name: 'Articles (Linge)', icon: Shirt },
    { id: 'tarifs', name: 'Tarifs', icon: Tag },
    { id: 'services', name: 'Services', icon: Briefcase },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom || !formData.adresse || !formData.telephone || !formData.email) {
      showToast("Erreur", "Tous les champs sont requis.", true);
      return;
    }
    if (!formData.email.includes('@')) {
      showToast("Erreur", "L'adresse e-mail n'est pas valide.", true);
      return;
    }

    if (editingPressing) {
      setPressings(pressings.map(p => p.id === editingPressing.id ? { ...p, ...formData } : p));
      showToast("Pressing modifié", `Le pressing "${formData.nom}" a été mis à jour.`);
    } else {
      const newPressing: Pressing = { id: String(pressings.length + 1), ...formData };
      setPressings([...pressings, newPressing]);
      showToast("Pressing ajouté", `Le nouveau pressing "${formData.nom}" a été créé avec succès.`);
    }

    setFormData({ nom: "", adresse: "", telephone: "", email: "" });
    setEditingPressing(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (pressing: Pressing) => {
    setEditingPressing(pressing);
    setFormData({ nom: pressing.nom, adresse: pressing.adresse, telephone: pressing.telephone, email: pressing.email });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string, nom: string) => {
    // Utilisation de window.confirm() car nous avons remplacé alert()
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le pressing "${nom}" ?`)) return;
    setPressings(pressings.filter(p => p.id !== id));
    showToast("Pressing supprimé", `Le pressing "${nom}" a été supprimé avec succès.`, true);
  };

  const resetDialog = () => { setIsDialogOpen(false); setEditingPressing(null); setFormData({ nom: "", adresse: "", telephone: "", email: "" }); };

  const stats = useMemo(() => ({
    total: pressings.length,
    villes: [...new Set(pressings.map(p => p.adresse.split(',').pop()?.trim() || 'Inconnue'))].length
  }), [pressings]);

  // --- CONTENU SPECIFIQUE A LA GESTION DES PRESSINGS ---
  const renderPressingsContent = () => (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => { setEditingPressing(null); setFormData({ nom: "", adresse: "", telephone: "", email: "" }); setIsDialogOpen(true); }}
          className="px-6 py-2 rounded-lg font-semibold text-white transition duration-300 shadow-md bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Ajouter un Pressing
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Carte 1: Total Pressings */}
        <Card className="hover:shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Total Pressings</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.total}</p>
            </div>
            <Home className="h-7 w-7 text-blue-500 opacity-60" />
          </div>
        </Card>

        {/* Carte 2: Villes/Zones Gérées */}
        <Card className="hover:shadow-lg border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Villes/Zones Gérées</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.villes}</p>
            </div>
            <MapPin className="h-7 w-7 text-purple-500 opacity-60" />
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card title="Liste des Établissements">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nom du Pressing</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Adresse</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">E-mail</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Téléphone</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {pressings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 text-center italic">Aucun pressing n'est enregistré.</td>
                </tr>
              ) : (
                pressings.map((pressing) => (
                  <tr key={pressing.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{pressing.nom}</td>
                    
                    {/* Colonne Adresse */}
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-start gap-1">
                            <MapPin className="h-3 w-3 text-gray-400 dark:text-gray-500 shrink-0 mt-1" />
                            {pressing.adresse}
                        </div>
                    </td>
                    {/* Colonne E-mail */}
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-start gap-1">
                            <Mail className="h-3 w-3 text-gray-400 dark:text-gray-500 shrink-0 mt-1" />
                            {pressing.email}
                        </div>
                    </td>
                    {/* Colonne Téléphone */}
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-start gap-1">
                            <Phone className="h-3 w-3 text-gray-400 dark:text-gray-500 shrink-0 mt-1" />
                            {pressing.telephone}
                        </div>
                    </td>
                    
                    <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                            <button onClick={() => handleEdit(pressing)} className="p-2 rounded-full text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-gray-700 transition">
                                <Pencil className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDelete(pressing.id, pressing.nom)} className="p-2 rounded-full text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-gray-700 transition">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  // --- CONTENU DES NOUVELLES ZONES (Placeholders) ---
  const renderContent = () => {
    switch (activeTab) {
      case 'pressings':
        return renderPressingsContent();
      case 'linge':
        return (
          <Card title="Gestion des Articles (Linge)">
            <p className="text-gray-500 dark:text-gray-400">
              C'est ici que vous définirez la liste de tous les articles que vous traitez (Ex: Chemise, Pantalon, Tapis, Rideaux).
            </p>
            <p className="mt-4 text-sm text-gray-400 dark:text-gray-500">
              <span className="font-bold">Prochaine étape :</span> Implémenter le tableau et le formulaire pour ajouter/modifier les articles.
            </p>
          </Card>
        );
      case 'tarifs':
        return (
          <Card title="Gestion des Tarifs">
            <p className="text-gray-500 dark:text-gray-400">
              Cette section permettra de configurer les prix pour chaque combinaison article/service, potentiellement par zone de pressing.
            </p>
            <p className="mt-4 text-sm text-gray-400 dark:text-gray-500">
              <span className="font-bold">Prochaine étape :</span> Implémenter la logique tarifaire.
            </p>
          </Card>
        );
      case 'services':
        return (
          <Card title="Gestion des Services">
            <p className="text-gray-500 dark:text-gray-400">
              Configurez les services offerts par votre entreprise (Ex: Lavage simple, Repassage seul, Lavage à sec, Livraison/Collecte).
            </p>
            <p className="mt-4 text-sm text-gray-400 dark:text-gray-500">
              <span className="font-bold">Prochaine étape :</span> Implémenter la gestion des services.
            </p>
          </Card>
        );
      default:
        return null;
    }
  };

  // --- JSX Global ---
  return (
    // CONTENEUR PRINCIPAL: Support Dark Mode
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 p-4 sm:p-8 space-y-6 font-sans">
      
      {/* Header */}
      <div className="pb-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Paramètres de l'Application</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Configurez les fondations de votre activité de blanchisserie.</p>
      </div>

      {/* Tab Navigation Bar */}
      <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-700 mb-8 overflow-x-auto">
        {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as ActiveTab)}
                    className={`
                        flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors duration-200
                        ${isActive 
                            ? 'border-b-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }
                        rounded-t-lg whitespace-nowrap
                    `}
                >
                    <Icon className="h-4 w-4" />
                    {tab.name}
                </button>
            );
        })}
      </div>

      {/* Content based on activeTab */}
      {renderContent()}

      {/* Modal - Uniquement utilisé pour la gestion des Pressings */}
      <PressingDialog isOpen={isDialogOpen} onClose={resetDialog} title={editingPressing ? "Modifier le Pressing" : "Ajouter un Pressing"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {['nom', 'adresse', 'email', 'telephone'].map((field) => (
            <div className="space-y-1" key={field}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                {field === 'email' ? 'Adresse E-mail' : field === 'telephone' ? 'Numéro de Téléphone' : field === 'nom' ? 'Nom du Pressing' : 'Adresse Complète'}
              </label>
              <input
                type={field === 'email' ? 'email' : field === 'telephone' ? 'tel' : 'text'}
                value={formData[field as keyof typeof formData]}
                onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                placeholder={field === 'nom' ? "Ex: Net'Express Central" : field === 'adresse' ? "Ex: Rue 42, Plateau, Abidjan" : field === 'email' ? "contact@pressing.com" : "+225 00 00 00 00 00"}
                required
                // Champs de formulaire en mode sombre
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-gray-900 dark:text-gray-100 dark:bg-gray-800"
              />
            </div>
          ))}
          <button type="submit" className="w-full mt-6 px-4 py-2 rounded-lg font-bold text-white transition duration-300 shadow-md bg-blue-600 hover:bg-blue-700">
            {editingPressing ? "Sauvegarder les Modifications" : "Ajouter le Pressing"}
          </button>
        </form>
      </PressingDialog>
    </div>
  );
}