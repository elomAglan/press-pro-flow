import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getCommandeById, updateStatutCommandeAvecMontant } from "../services/commande.service";

export default function CommandeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [commande, setCommande] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal paiement
  const [showModal, setShowModal] = useState(false);
  const [montantActuel, setMontantActuel] = useState("");
  const [nouveauStatut, setNouveauStatut] = useState<"EN_COURS" | "LIVREE">("EN_COURS");

  useEffect(() => {
    async function load() {
      try {
        const data = await getCommandeById(Number(id));
        setCommande(data);
        setNouveauStatut(data.statut); // initialiser le select
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!commande) {
    return <div className="p-8 text-center text-red-500">Commande introuvable</div>;
  }

  const c = commande;
  const resteAPayer = Number(c.resteAPayer ?? 0);
  const montantValide = montantActuel === "" || Number(montantActuel) <= resteAPayer;

  // ✅ Valider paiement + mise à jour du statut
  async function handleValiderPaiement() {
    if (!montantValide) return;

    try {
      const payload = {
        statut: nouveauStatut,
        montantActuel: Number(montantActuel || 0),
      };

      const updated = await updateStatutCommandeAvecMontant(c.id, payload);
      setCommande(updated); // actualise le front avec le backend
      setShowModal(false);
      setMontantActuel("");
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la mise à jour du paiement et du statut.");
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate("/commandes")}
          className="flex items-center gap-2 text-blue-700 hover:underline"
        >
          <ArrowLeft size={20} /> Retour
        </button>

        <Button
          className="bg-green-600 hover:bg-green-700 text-white"
          onClick={() => setShowModal(true)}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Mettre à jour le paiement/statut
        </Button>
      </div>

      {/* TITRE */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Commande #{c.id}</h1>
        <p className="text-gray-600 mt-1">
          Réception : <b>{c.dateReception}</b> — Livraison : <b>{c.dateLivraison}</b>
        </p>
      </div>

      {/* INFORMATIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CLIENT */}
        <Card className="p-6 shadow-sm border-l-4 border-blue-600">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Informations Client</h2>
          <div className="space-y-2 text-sm">
            <p><b>Nom :</b> {c.clientNom}</p>
            <p><b>Téléphone :</b> {c.clientTelephone}</p>
          </div>
        </Card>

        {/* ARTICLE */}
        <Card className="p-6 shadow-sm border-l-4 border-green-600">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Article & Service</h2>
          <div className="space-y-2 text-sm">
            <p><b>Article :</b> {c.article}</p>
            <p><b>Service :</b> {c.service}</p>
            <p><b>Quantité :</b> {c.qte}</p>
            <p><b>Prix unitaire :</b> {Number(c.prix).toLocaleString()} FCFA</p>
          </div>
        </Card>

        {/* MONTANTS */}
        <Card className="p-6 shadow-sm bg-gray-50 border">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Montants</h2>
          <div className="space-y-2 text-sm">
            <p><b>Montant brut :</b> {Number(c.montantBrut).toLocaleString()} FCFA</p>
            <p><b>Remise :</b> {Number(c.remise).toLocaleString()} FCFA</p>
            <p><b>Net :</b> {Number(c.montantNet).toLocaleString()} FCFA</p>
            <p><b>Payé :</b> {Number(c.montantPaye).toLocaleString()} FCFA</p>
            <p className={`font-bold ${resteAPayer === 0 ? "text-green-600" : "text-red-600"}`}>
              Reste à payer : {resteAPayer.toLocaleString()} FCFA
            </p>
            <p>
              <b>Statut paiement :</b>{" "}
              <Badge
                className={`px-3 py-1 text-white ${
                  c.statutPaiement === "Payé"
                    ? "bg-green-600"
                    : c.statutPaiement === "Partiel"
                    ? "bg-orange-500"
                    : "bg-red-500"
                }`}
              >
                {c.statutPaiement}
              </Badge>
            </p>
          </div>
        </Card>
      </div>

      {/* MODAL : Paiement et Statut */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">Confirmer le paiement et le statut</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant payé
              </label>
              <Input
                type="number"
                placeholder="Montant payé..."
                value={montantActuel}
                min={0}
                max={resteAPayer}
                onChange={(e) => setMontantActuel(e.target.value)}
              />
              {!montantValide && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle size={14} /> Montant invalide (ne peut pas dépasser le reste à payer)
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut commande
              </label>
              <Select
                value={nouveauStatut}
                onValueChange={(v) => setNouveauStatut(v as "EN_COURS" | "LIVREE")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner le statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EN_COURS">EN_COURS</SelectItem>
                  <SelectItem value="LIVREE">LIVREE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Annuler
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={!montantValide}
              onClick={handleValiderPaiement}
            >
              Valider
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
