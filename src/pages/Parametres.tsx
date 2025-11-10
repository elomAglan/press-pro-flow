import { useState, useEffect } from "react";
// Import de useNavigate pour la navigation
import { useNavigate } from "react-router-dom";
import {
  getMyPressing,
  createPressing,
  updatePressing,
  deletePressing,
  Pressing
} from "../services/pressing.service";
import { Loader2, Pencil, Plus, Trash2, Mail, Phone, MapPin, Building2, Tag } from "lucide-react";

export default function Parametres() {
  const [pressing, setPressing] = useState<Pressing | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");

  const navigate = useNavigate();

  const [form, setForm] = useState<Pressing>({
    nom: "",
    telephone: "",
    adresse: "",
    logo: "",
    id: undefined,
  });

  // Charger le pressing lié à l'utilisateur
  const loadPressing = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const p = await getMyPressing();
      setPressing(p || null);
    } catch (e: any) {
      console.error("Erreur récupération pressing:", e);
      if (e.message?.includes("404") || e.status === 404 || e.message?.includes("Not Found")) {
        setPressing(null);
        setError(null);
      } else if (e.message?.includes("500")) {
        setError("Erreur serveur. Vérifiez que vous êtes bien authentifié.");
      } else {
        setError(e.message || "Erreur lors de la récupération des données");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPressing();
  }, []);

  // Ouvrir modal
  const openDialog = (mode: "create" | "edit") => {
    setDialogMode(mode);
    if (mode === "edit" && pressing) {
      setForm({ ...pressing });
    } else {
      setForm({ nom: "", telephone: "", adresse: "", logo: "" });
    }
    setIsDialogOpen(true);
  };

  // Soumettre formulaire
  const handleSubmit = async () => {
    if (!form.nom || !form.telephone || !form.adresse) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let saved: Pressing;
      if (dialogMode === "edit") {
        if (!pressing?.id) throw new Error("Impossible de modifier : pressing introuvable");
        saved = await updatePressing(pressing.id, form);
        setPressing(saved);
        alert("Pressing modifié avec succès !");
      } else {
        saved = await createPressing(form);
        setPressing(saved);
        alert("Pressing créé avec succès !");
      }

      setForm(saved);
      setIsDialogOpen(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur lors de la sauvegarde");
      alert(`Erreur: ${err.message || "Erreur lors de la sauvegarde"}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Supprimer pressing
  const handleDelete = async () => {
    if (!pressing?.id) return;
    if (!confirm("Supprimer ce pressing ?")) return;

    setIsLoading(true);
    setError(null);
    try {
      await deletePressing(pressing.id);
      setPressing(null);
      alert("Pressing supprimé avec succès");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur lors de la suppression");
      alert(`Erreur: ${err.message || "Erreur lors de la suppression"}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour naviguer vers la page Tarifs
  const handleGoToTarifs = () => {
    navigate('/tarifs');
  };

  return (
    // FIX SCROLL: Retrait de la classe min-h-screen
    <div className="p-6 bg-white">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* En-tête avec les boutons d'action groupés */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Paramètres du Pressing</h1>
            <p className="text-gray-500 mt-1">Gérez les informations de votre établissement</p>
          </div>

          <div className="flex gap-2">
            {/* Bouton Tarifs (visible uniquement si pressing existe) */}
            {pressing && (
              <button
                onClick={handleGoToTarifs}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition shadow-sm"
                title="Gérer les tarifs du pressing"
              >
                <Tag size={18} /> Tarifs
              </button>
            )}

            {/* Bouton Actualiser */}
            <button
              onClick={loadPressing}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2 transition"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              )}
              Actualiser
            </button>
          </div>
        </div>
        
        {/* --- */}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-medium">Erreur</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Affichage du pressing configuré */}
        {pressing ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Rétablissement d'un fond de couleur pour l'en-tête de la carte */}
            <div className="bg-blue-500 h-24"></div> 

            <div className="p-6 -mt-12">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-lg overflow-hidden">
                    {pressing.logo ? (
                      <img src={pressing.logo} className="w-full h-full object-cover" alt={pressing.nom} />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-2xl font-bold bg-blue-100 text-blue-600">
                        {pressing.nom.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="mt-8">
                    <h2 className="text-2xl font-bold text-gray-900">{pressing.nom}</h2>
                    {pressing.email && <p className="text-gray-500 text-sm mt-1">{pressing.email}</p>}
                  </div>
                </div>
                


              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {pressing.email && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Mail size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Email</p>
                      <p className="text-sm text-gray-900">{pressing.email}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Phone size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Téléphone</p>
                    <p className="text-sm text-gray-900">{pressing.telephone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <MapPin size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Adresse</p>
                    <p className="text-sm text-gray-900">{pressing.adresse}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Affichage "Aucun pressing configuré" */
          !isLoading && (
            <div className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 p-12 text-center">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Building2 size={40} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun pressing configuré</h3>
                <p className="text-gray-500 mb-6 max-w-md">
                  Commencez par créer votre pressing pour gérer vos services et vos clients
                </p>
                <button
                  onClick={() => openDialog("create")}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition shadow-sm text-lg"
                >
                  <Plus size={20} /> Créer mon Pressing
                </button>
              </div>
            </div>
          )
        )}
        
        {/* --- */}

        {/* Modal Ajouter / Modifier */}
        {isDialogOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            {/* NOTE : max-h-[90vh] overflow-y-auto est conservé pour garantir que la modale scroll si le contenu est trop long */}
            <div className="bg-white rounded-xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  {dialogMode === "edit" ? "Modifier le Pressing" : "Créer un Pressing"}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Renseignez les informations de votre établissement
                </p>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom du pressing *</label>
                  <input
                    type="text"
                    placeholder="Ex: Pressing du Centre"
                    value={form.nom}
                    onChange={e => setForm({ ...form, nom: e.target.value })}
                    className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
                  <input
                    type="tel"
                    placeholder="+228 XX XX XX XX"
                    value={form.telephone}
                    onChange={e => setForm({ ...form, telephone: e.target.value })}
                    className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Adresse *</label>
                  <input
                    type="text"
                    placeholder="Ex: 123 Avenue de la République, Lomé"
                    value={form.adresse}
                    onChange={e => setForm({ ...form, adresse: e.target.value })}
                    className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Logo (URL optionnel)</label>
                  <input
                    type="url"
                    placeholder="Ex: https://exemple.com/logo.png"
                    value={form.logo}
                    onChange={e => setForm({ ...form, logo: e.target.value })}
                    className="border border-gray-300 p-3 w-full rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {form.logo && (
                    <div className="mt-3">
                      <img
                        src={form.logo}
                        className="h-24 w-24 rounded-lg object-cover border border-gray-200"
                        alt="Aperçu"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition font-medium disabled:opacity-50"
                  >
                    {isLoading && <Loader2 size={18} className="animate-spin" />}
                    {dialogMode === "edit" ? "Mettre à jour" : "Créer"}
                  </button>
                  <button
                    onClick={() => setIsDialogOpen(false)}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-medium"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}