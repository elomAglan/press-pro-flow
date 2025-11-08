import React, { useState, useMemo, useCallback } from 'react';
import { Plus, Pencil, Trash2, Mail, Phone, MapPin, Tag, Euro, Ruler, Factory, User, Edit2, Zap } from 'lucide-react';

// --- TYPES GLOBALES ---
type Pressing = {
  nom: string;
  adresse: string;
  telephone: string;
  email: string;
  logoBase64?: string; // Utilisé pour la simulation d'upload
};

type Tariff = {
  id: string;
  article: string; 
  service: string; 
  prix: number; 
  // NOTE: 'unite' est conservée dans le type pour compatibilité mais sera omise dans le formulaire
  unite: string; 
};

type ActiveTab = 'pressings' | 'tarifs';

// --- MOCK DATA GLOBALE ---
const initialPressing: Pressing | null = { nom: "Net'Express Central", adresse: "Rue de la République, 12345 Ville", telephone: "+33 1 23 45 67 89", email: "contact@netexpress.com", logoBase64: undefined }; 

const mockTariffs: Tariff[] = [
  // Les données mockées sont mises à jour pour ne pas dépendre de l'unité
  { id: "t1", article: "Chemise", service: "Lavage simple", prix: 1500, unite: "Pièce" }, // L'unité sera ignorée dans l'affichage
  { id: "t2", article: "Pantalon", service: "Repassage", prix: 1000, unite: "Pièce" },
  { id: "t3", article: "Robe de soirée", service: "Lavage avec teinture", prix: 5000, unite: "Pièce" },
];

// --- UTILITAIRES & COMPOSANTS FONDATIONNELS ---

// Card Component (Support Dark Mode)
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

// Toast / Notification 
const showToast = (title: string, description: string, isDestructive = false) => {
  console.log(`[TOAST] ${title}: ${description}`);
  alert(`${title}\n${description}`);
};

// Modal / Dialog (Support Dark Mode)
const Dialog: React.FC<{isOpen: boolean, onClose: () => void, children: React.ReactNode, title: string}> = ({ isOpen, onClose, children, title }) => {
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

// =================================================================================
// COMPOSANT 1/2 : GestionPressings (inchangé, sauf l'état maintenant dans le parent)
// =================================================================================
interface GestionPressingsProps {
  pressing: Pressing | null;
  setPressing: (p: Pressing | null) => void;
}

const GestionPressings: React.FC<GestionPressingsProps> = ({ pressing, setPressing }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // Utilisation de l'état local pour le formulaire de modification
  const [formData, setFormData] = useState<Pressing>({ nom: "", adresse: "", telephone: "", email: "" });

  const isEditing = !!pressing;

  const resetDialog = useCallback(() => { 
    setIsDialogOpen(false); 
    setFormData({ nom: "", adresse: "", telephone: "", email: "", logoBase64: undefined }); 
  }, []);

  const handleOpenDialog = useCallback(() => {
    if (pressing) {
        // Initialiser formData avec les valeurs du pressing si on modifie
        setFormData(pressing);
    } else {
        // Réinitialiser si on ajoute
        setFormData({ nom: "", adresse: "", telephone: "", email: "", logoBase64: undefined });
    }
    setIsDialogOpen(true);
  }, [pressing]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast("Erreur Fichier", "Veuillez sélectionner un fichier image valide.", true);
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoBase64: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom || !formData.adresse || !formData.telephone || !formData.email) {
      showToast("Erreur", "Le nom, l'adresse, le téléphone et l'e-mail sont requis.", true);
      return;
    }
    if (!formData.email.includes('@')) {
      showToast("Erreur", "L'adresse e-mail n'est pas valide.", true);
      return;
    }

    setPressing(formData);
    showToast(isEditing ? "Profil modifié" : "Pressing créé", `Le profil "${formData.nom}" a été mis à jour.`);
    resetDialog();
  };

  const handleDelete = useCallback(() => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le profil de votre pressing ? Cette action est irréversible.`)) return; 
    setPressing(null);
    showToast("Profil supprimé", `Le profil de l'établissement a été supprimé.`, true);
  }, [setPressing]);

  const dataFields: { key: keyof Pressing, label: string, icon: React.ElementType, type: string, required: boolean }[] = [
    { key: 'adresse', label: 'Adresse Complète', icon: MapPin, type: 'text', required: true },
    { key: 'telephone', label: 'Numéro de Téléphone', icon: Phone, type: 'tel', required: true },
    { key: 'email', label: 'Adresse E-mail', icon: Mail, type: 'email', required: true },
  ];

  // Composant Avatar/Logo
  const LogoDisplay: React.FC<{ pressing: Pressing, sizeClass: string }> = ({ pressing, sizeClass }) => (
    <div className={`flex-shrink-0 flex items-center justify-center ${sizeClass} rounded-full bg-blue-600 text-white font-bold border-4 border-blue-100 dark:border-blue-900 shadow-md`}>
        {pressing.logoBase64 ? (
            <img 
                src={pressing.logoBase64} 
                alt={`${pressing.nom} logo`}
                className={`w-full h-full rounded-full object-cover`}
            />
        ) : (
            <span className="text-3xl">
                {pressing.nom.charAt(0).toUpperCase()}
            </span>
        )}
    </div>
  );


  return (
    <div className="space-y-6">
      
      {pressing ? (
        // --- AFFICHAGE DU PROFIL EXISTANT ---
        <Card title="Profil de votre Pressing">
            <div className="flex items-center space-x-4 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <LogoDisplay pressing={pressing} sizeClass="w-20 h-20" /> 
                <div className="flex-grow">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{pressing.nom}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Informations détaillées de votre établissement.</p>
                </div>
            </div>

            <div className="space-y-4">
                {dataFields.map(field => (
                    <div key={field.key} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <field.icon className="h-5 w-5 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{field.label}</p>
                            <p className="font-semibold text-gray-900 dark:text-gray-100 break-words">{pressing[field.key]}</p>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* BOUTONS D'ACTION CLAIRS ET VISIBLES */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={handleDelete}
                    className="px-4 py-2 rounded-lg font-semibold text-red-600 border border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition flex items-center gap-2"
                >
                    <Trash2 className="h-4 w-4" /> Supprimer
                </button>
                <button
                    onClick={handleOpenDialog}
                    className="px-4 py-2 rounded-lg font-bold text-white transition duration-300 shadow-md bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                >
                    <Pencil className="h-4 w-4" /> Modifier le Profil
                </button>
            </div>
        </Card>
      ) : (
        // --- AFFICHAGE DE L'ÉTAT VIDE (inchangé) ---
        <Card>
            <div className="text-center p-10 space-y-4">
                <Factory className="h-10 w-10 text-gray-400 mx-auto" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Aucun Pressing Configuré</h3>
                <p className="text-gray-500 dark:text-gray-400">
                    Veuillez ajouter le profil de votre établissement pour configurer le reste de l'application.
                </p>
                <button
                    onClick={handleOpenDialog}
                    className="mt-4 px-6 py-3 rounded-lg font-bold text-white transition duration-300 shadow-xl bg-blue-600 hover:bg-blue-700 flex items-center gap-2 mx-auto"
                >
                    <Plus className="h-5 w-5" /> Ajouter mon Pressing
                </button>
            </div>
        </Card>
      )}

      {/* Modal (Utilisé pour Ajouter/Modifier) - Inchangé */}
      <Dialog isOpen={isDialogOpen} onClose={resetDialog} title={isEditing ? "Modifier le Profil" : "Ajouter mon Pressing"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Champ d'Upload de Fichier (Logo) */}
          <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Logo de l'Établissement <span className="text-gray-400">(Facultatif - Fichier Image)</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-gray-900 dark:text-gray-100 dark:bg-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300 dark:hover:file:bg-blue-800"
              />
              {formData.logoBase64 && (
                <div className="mt-2 flex items-center gap-3">
                    <img src={formData.logoBase64} alt="Aperçu du logo" className="h-10 w-10 rounded-full object-cover border border-gray-300 dark:border-gray-600" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">Logo chargé localement.</span>
                    <button 
                        type="button" 
                        onClick={() => setFormData(p => ({...p, logoBase64: undefined}))}
                        className="text-red-500 text-sm hover:text-red-700 transition"
                    >
                        [Retirer]
                    </button>
                </div>
              )}
          </div>
          
          {/* Champs de Données (Nom, Adresse, etc.) */}
          <div className="space-y-1"> 
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nom de l'Établissement <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nom || ''} 
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder={`Entrez le nom de l'établissement`}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-gray-900 dark:text-gray-100 dark:bg-gray-800"
              />
          </div>
          {dataFields.map((field) => ( // Les autres champs
            <div className="space-y-1" key={field.key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label} <span className="text-red-500">*</span>
              </label>
              <input
                type={field.type}
                value={formData[field.key] || ''} 
                onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                placeholder={`Entrez le ${field.label.toLowerCase()}`}
                required={field.required}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-gray-900 dark:text-gray-100 dark:bg-gray-800"
              />
            </div>
          ))}
          <button type="submit" className="w-full mt-6 px-4 py-2 rounded-lg font-bold text-white transition duration-300 shadow-md bg-blue-600 hover:bg-blue-700">
            {isEditing ? "Sauvegarder les Modifications" : "Ajouter le Pressing"}
          </button>
        </form>
      </Dialog>
    </div>
  );
};









// =================================================================================
// COMPOSANT 2/2 : GestionTarifs (MODIFIÉ)
// =================================================================================
interface GestionTarifsProps {
    isPressingConfigured: boolean;
}

const GestionTarifs: React.FC<GestionTarifsProps> = ({ isPressingConfigured }) => {
  const [tariffs, setTariffs] = useState<Tariff[]>(mockTariffs);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTariff, setEditingTariff] = useState<Tariff | null>(null);
  
  // Omet 'unite' du formulaire car elle n'est plus demandée, mais est conservée dans l'objet Tariff avec une valeur par défaut
  const [formData, setFormData] = useState<Omit<Tariff, 'id' | 'unite'> & { unite: string }>({ 
      article: "", 
      service: "", 
      prix: 0, 
      unite: "Pièce" // Valeur par défaut pour l'objet Tariff, non affichée dans le form
  });
  
  // SERVICES MIS À JOUR
  const availableServices = [
    "Lavage simple", 
    "Lavage avec teinture", 
    "Lavage avec Repassage"
  ];

  // Si le pressing n'est pas configuré, on affiche un message d'erreur (inchangé)
  if (!isPressingConfigured) {
    return (
        <Card>
            <div className="text-center p-10 space-y-4 border border-blue-200 dark:border-blue-900 rounded-xl bg-blue-50 dark:bg-blue-950">
                <Zap className="h-10 w-10 text-blue-500 mx-auto" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Accès Refusé</h3>
                <p className="text-gray-600 dark:text-gray-300">
                    Veuillez **configurer le profil de votre pressing** dans l'onglet "Mon Pressing" avant de pouvoir gérer la grille tarifaire.
                </p>
            </div>
        </Card>
    );
  }

  const resetDialog = useCallback(() => { 
    setIsDialogOpen(false); 
    setEditingTariff(null); 
    setFormData({ article: "", service: "", prix: 0, unite: "Pièce" }); 
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // La vérification de 'unite' est retirée car elle est maintenant gérée par défaut
    if (!formData.article || !formData.service || formData.prix <= 0) {
      showToast("Erreur", "Veuillez remplir tous les champs correctement.", true);
      return;
    }

    if (editingTariff) {
        // Assurez-vous que l'unité est conservée (même si elle est "Pièce" par défaut)
      setTariffs(tariffs.map(t => t.id === editingTariff.id ? { ...t, ...formData } : t));
      showToast("Tarif modifié", `Le tarif pour "${formData.article}" a été mis à jour.`);
    } else {
      const newTariff: Tariff = { id: String(Date.now()), ...formData };
      setTariffs([...tariffs, newTariff]);
      showToast("Tarif ajouté", `Nouveau tarif pour "${formData.article}" ajouté.`);
    }
    resetDialog();
  };

  const handleEdit = useCallback((tariff: Tariff) => {
    setEditingTariff(tariff);
    setFormData({ article: tariff.article, service: tariff.service, prix: tariff.prix, unite: tariff.unite });
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback((id: string, article: string, service: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le tarif pour "${article} - ${service}" ?`)) return;
    setTariffs(tariffs.filter(t => t.id !== id));
    showToast("Tarif supprimé", `Le tarif pour "${article} - ${service}" a été supprimé.`, true);
  }, [tariffs]);
  
  const stats = useMemo(() => ({
    total: tariffs.length,
    articles: [...new Set(tariffs.map(t => t.article))].length,
  }), [tariffs]);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => { resetDialog(); setIsDialogOpen(true); }} // Utiliser resetDialog pour une réinitialisation propre
          className="px-6 py-2 rounded-lg font-semibold text-white transition duration-300 shadow-md bg-green-600 hover:bg-green-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Ajouter un Tarif
        </button>
      </div>

      {/* Stats Cards (inchangées) */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:shadow-xl border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Tarifs Totaux</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.total}</p>
            </div>
            <Tag className="h-7 w-7 text-green-500 opacity-60" />
          </div>
        </Card>
        <Card className="hover:shadow-xl border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Articles Couverts</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.articles}</p>
            </div>
            <Ruler className="h-7 w-7 text-yellow-500 opacity-60" />
          </div>
        </Card>
      </div>

      {/* Table (Colonne Unité retirée) */}
      <Card title="Liste des Tarifs Article/Service">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Article</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Prix (Unité)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {tariffs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 text-center italic">Aucun tarif n'est enregistré.</td>
                </tr>
              ) : (
                tariffs.map((tariff) => (
                  <tr key={tariff.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{tariff.article}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{tariff.service}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-gray-100 text-right">
                        <div className="flex items-center justify-end gap-1">
                            {/* Affichage de l'unité si elle existe, ou "Pièce" par défaut, sans la colonne dédiée */}
                            {(tariff.prix / 100).toFixed(2)}€ / {tariff.unite} 
                        </div>
                    </td>
                    
                    <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                            <button onClick={() => handleEdit(tariff)} className="p-2 rounded-full text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-gray-700 transition" title="Modifier">
                                <Pencil className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDelete(tariff.id, tariff.article, tariff.service)} className="p-2 rounded-full text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-gray-700 transition" title="Supprimer">
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

      {/* Modal Tarifs (Champs Service et Prix ajustés) */}
      <Dialog isOpen={isDialogOpen} onClose={resetDialog} title={editingTariff ? "Modifier le Tarif" : "Ajouter un Tarif"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Article</label>
              <input
                type="text"
                value={formData.article}
                onChange={(e) => setFormData({ ...formData, article: e.target.value })}
                placeholder="Ex: Chemise, Tapis"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 p-2 text-gray-900 dark:text-gray-100 dark:bg-gray-800"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Service</label>
              <select
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 p-2 text-gray-900 dark:text-gray-100 dark:bg-gray-800"
              >
                <option value="">Sélectionner un service</option>
                {/* Services MIS À JOUR */}
                {availableServices.map(service => (
                    <option key={service} value={service}>{service}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Prix (en devise locale - par Pièce par défaut)</label>
              <input
                type="number"
                value={formData.prix === 0 ? "" : formData.prix}
                onChange={(e) => setFormData({ ...formData, prix: Number(e.target.value) })}
                placeholder="Ex: 1500"
                required
                min="1"
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 p-2 text-gray-900 dark:text-gray-100 dark:bg-gray-800"
              />
          </div>

          {/* Le champ UNITE DE MESURE a été RETIRÉ ici */}

          <button type="submit" className="w-full mt-6 px-4 py-2 rounded-lg font-bold text-white transition duration-300 shadow-md bg-green-600 hover:bg-green-700">
            {editingTariff ? "Sauvegarder le Tarif" : "Ajouter le Tarif"}
          </button>
        </form>
      </Dialog>
    </div>
  );
}


// =================================================================================
// COMPOSANT PRINCIPAL (ParametresPressing) - Gère la navigation et l'état global
// =================================================================================
export default function ParametresPressing() {
  const [pressing, setPressing] = useState<Pressing | null>(initialPressing); 
  const [activeTab, setActiveTab] = useState<ActiveTab>('pressings'); 
  
  const isPressingConfigured = !!pressing;

  const tabs = [
    { id: 'pressings', name: 'Mon Pressing', icon: User },
    { id: 'tarifs', name: 'Grille Tarifaire', icon: Tag },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'pressings':
        return <GestionPressings pressing={pressing} setPressing={setPressing} />;
      case 'tarifs':
        return <GestionTarifs isPressingConfigured={isPressingConfigured} />;
      default:
        return <GestionPressings pressing={pressing} setPressing={setPressing} />;
    }
  };

  return (
    // CONTENEUR PRINCIPAL: Support Dark Mode
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 p-4 sm:p-8 space-y-6 font-sans">
      
      {/* Header */}
      <div className="pb-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Paramètres de Configuration</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Gérez le profil de votre unique établissement et ses prix.</p>
      </div>

      {/* Tab Navigation Bar */}
      <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-700 mb-8 overflow-x-auto">
        {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            
            const isDisabled = tab.id === 'tarifs' && !isPressingConfigured;

            return (
                <button
                    key={tab.id}
                    onClick={() => { if (!isDisabled) setActiveTab(tab.id as ActiveTab); }}
                    disabled={isDisabled}
                    className={`
                        flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors duration-200
                        ${isActive 
                            ? 'border-b-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }
                        ${isDisabled ? 'opacity-50 cursor-not-allowed hover:bg-transparent dark:hover:bg-transparent' : ''}
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
    </div>
  );
}
