import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyPressing,
  createPressing,
  updatePressing,
  Pressing
} from "../services/pressing.service";
import { Loader2, Pencil, Plus, Mail, Phone, MapPin, Building2, Tag, X, Smartphone } from "lucide-react";

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
    cel: "",
    adresse: "",
    logo: "", 
    id: undefined,
  });

  const [previewLogo, setPreviewLogo] = useState<string | null>(null);

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
        setError("Veuillez créer un compte pressing pour commencer.");
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

  const openDialog = (mode: "create" | "edit") => {
    setDialogMode(mode);
    if (mode === "edit" && pressing) {
      setForm({ ...pressing });
      setPreviewLogo(pressing.logo ? `data:image/png;base64,${pressing.logo}` : null);
    } else {
      setForm({ nom: "", telephone: "", cel: "", adresse: "", logo: "", id: undefined });
      setPreviewLogo(null);
    }
    setIsDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setPreviewLogo(result);
        const base64ForBackend = result.split(",")[1];
        setForm(prev => ({ ...prev, logo: base64ForBackend }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setPreviewLogo(null);
    setForm(prev => ({ ...prev, logo: "" }));
  };

  const handleSubmit = async () => {
    if (!form.nom || !form.telephone || !form.adresse) {
      alert("Veuillez remplir tous les champs obligatoires (Nom, Téléphone, Adresse).");
      return;
    }

    setIsLoading(true);
    const logoToSend = form.logo || null; 

    try {
      if (dialogMode === "create") {
        await createPressing({ ...form, logo: logoToSend }); 
      } else if (dialogMode === "edit" && pressing) {
        await updatePressing({ ...form, logo: logoToSend, id: pressing.id });
      }

      setIsDialogOpen(false);
      await loadPressing();
    } catch (e: any) {
      console.error("Erreur lors de l'enregistrement du pressing:", e);
      setError(e.message || "Erreur lors de l'enregistrement");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToTarifs = () => {
    navigate('/tarifs');
  };

  const getLogoSource = (logoBase64: string | undefined | null) => {
    if (previewLogo) return previewLogo;
    if (logoBase64 && logoBase64.startsWith('http')) return logoBase64;
    if (logoBase64) return `data:image/png;base64,${logoBase64}`;
    return "/logo-default.png";
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Paramètres du Pressing</h1>
            <p className="text-gray-500 mt-1">Gérez les informations de votre établissement</p>
          </div>

          <div className="flex gap-2">
            {pressing && (
              <button
                onClick={handleGoToTarifs}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition shadow-sm"
                title="Gérer les tarifs du pressing"
              >
                <Tag size={18} /> Tarifs
              </button>
            )}
            
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

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-medium">Erreur</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* PRESSING INFO */}
        {pressing ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6"> 
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-white border-4 border-white shadow-lg overflow-hidden flex-shrink-0 w-24 h-24 flex items-center justify-center">
                    <img 
                      src={getLogoSource(pressing.logo)} 
                      alt={pressing.nom} 
                      className="max-h-full max-w-full object-contain" 
                      onError={(e) => { (e.target as HTMLImageElement).src = "/logo-default.png" }}
                    />
                  </div>

                  <div className="mt-0"> 
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

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <MapPin size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Adresse</p>
                    <p className="text-sm text-gray-900">{pressing.adresse}</p>
                  </div>
                </div>

                {pressing.cel && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Smartphone size={20} className="text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Téléphone secondaire</p>
                      <p className="text-sm text-gray-900">{pressing.cel}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
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

        {/* MODAL */}
        {isDialogOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  {dialogMode === "edit" ? "Configurer le Pressing" : "Créer un Pressing"}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Renseignez les informations de votre établissement
                </p>
              </div>

              <div className="p-6 space-y-5">
                {/* Formulaire */}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone principal *</label>
                  <input
                    type="tel"
                    placeholder="+228 XX XX XX XX"
                    value={form.telephone}
                    onChange={e => setForm({ ...form, telephone: e.target.value })}
                    className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Adresse *</label>
                    <input
                      type="text"
                      placeholder="Ex: Lomé, Baguida"
                      value={form.adresse}
                      onChange={e => setForm({ ...form, adresse: e.target.value })}
                      className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone secondaire</label>
                    <input
                      type="tel"
                      placeholder="+228 XX XX XX XX"
                      value={form.cel || ""}
                      onChange={e => setForm({ ...form, cel: e.target.value })}
                      className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                  {!previewLogo ? (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="border border-gray-300 p-2 w-full rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  ) : (
                    <div className="relative inline-block">
                      <img
                        src={previewLogo}
                        className="h-24 w-24 rounded-lg object-contain border border-gray-200 shadow-md"
                        alt="Aperçu du logo"
                        onError={(e) => { (e.target as HTMLImageElement).src = "/logo-default.png" }}
                      />
                      <button
                        onClick={handleRemoveLogo}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition"
                        title="Supprimer le logo"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading || !form.nom || !form.telephone || !form.adresse}
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
