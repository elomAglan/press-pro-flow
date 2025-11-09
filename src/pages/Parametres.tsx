import { useState, useEffect } from "react";
import {
  getPressingById,
  createPressing,
  updatePressing,
  deletePressing,
  Pressing
} from "../services/pressing.service";
import { Loader2, Pencil, Plus, Trash2, Mail, Phone, MapPin } from "lucide-react";

export default function Parametres() {
  const [pressing, setPressing] = useState<Pressing | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [form, setForm] = useState<Pressing>({
    nom: "",
    email: "",
    telephone: "",
    adresse: "",
    logo: "",
  });

  const userId = 1; // ⚠️ remplacer par l'ID de l'utilisateur courant

  // Charger le pressing lié à l'utilisateur
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("Utilisateur non connecté");

        const p = await getPressingById(userId);
        if (p) setPressing(p);
      } catch (e) {
        console.error("Erreur récupération pressing:", e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const openDialog = () => {
    if (pressing) setForm(pressing);
    setIsDialogOpen(true);
  };

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm(prev => ({ ...prev, logo: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const saved = pressing?.id
        ? await updatePressing(pressing.id, form)
        : await createPressing(form);
      setPressing(saved);
      setIsDialogOpen(false);
      alert("Pressing sauvegardé avec succès !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!pressing?.id) return;
    if (!confirm("Supprimer ce pressing ?")) return;
    setIsLoading(true);
    try {
      await deletePressing(pressing.id);
      setPressing(null);
    } catch {
      alert("Erreur lors de la suppression");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Paramètres du Pressing</h1>

      {pressing ? (
        <div className="p-4 border rounded-lg shadow bg-white">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden">
              {pressing.logo ? (
                <img src={pressing.logo} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-xl">
                  {pressing.nom.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h2 className="font-bold text-xl">{pressing.nom}</h2>
              <p className="text-sm text-gray-500">{pressing.email}</p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <p className="flex items-center gap-2"><Mail size={16} /> {pressing.email}</p>
            <p className="flex items-center gap-2"><Phone size={16} /> {pressing.telephone}</p>
            <p className="flex items-center gap-2"><MapPin size={16} /> {pressing.adresse}</p>
          </div>

          <div className="flex gap-3 mt-4">
            <button onClick={openDialog} className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2">
              <Pencil size={16} /> Modifier
            </button>
            <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded flex items-center gap-2">
              <Trash2 size={16} /> Supprimer
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={openDialog}
          className="px-6 py-3 bg-blue-600 text-white rounded flex items-center gap-2"
        >
          <Plus size={16} /> Ajouter un Pressing
        </button>
      )}

      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow">
            <h2 className="text-xl font-bold mb-4">
              {pressing ? "Modifier le Pressing" : "Créer le Pressing"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Nom" required value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} className="border p-2 w-full rounded" />
              <input type="email" placeholder="Email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="border p-2 w-full rounded" />
              <input type="text" placeholder="Téléphone" required value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} className="border p-2 w-full rounded" />
              <input type="text" placeholder="Adresse" required value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })} className="border p-2 w-full rounded" />
              <input type="file" accept="image/*" onChange={handleLogo} />
              {form.logo && <img src={form.logo} className="h-20 mt-2 rounded" />}
              <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-2 rounded flex items-center justify-center gap-2">
                {isLoading && <Loader2 size={18} className="animate-spin" />}
                Sauvegarder
              </button>
            </form>

            <button onClick={() => setIsDialogOpen(false)} className="mt-4 text-gray-600 underline w-full text-center">
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
