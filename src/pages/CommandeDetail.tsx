import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, CheckCircle, Scale, Shirt, Trash2 } from "lucide-react";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import {
  getCommandeById,
  updateStatutCommandeAvecPaiement,
  getCommandePdf,
  deleteCommande,
} from "../services/commande.service";
import { getClientById } from "../services/client.service";

export default function CommandeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const storedRole = localStorage.getItem("role") || "";
  const isAdmin = storedRole.toUpperCase() === "ADMIN";

  const [commande, setCommande] = useState<any | null>(null);
  const [client, setClient] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [montantActuel, setMontantActuel] = useState("");
  const [reliquat, setReliquat] = useState<number>(0);
  const [nouveauStatut, setNouveauStatut] = useState<"EN_COURS" | "LIVREE">("EN_COURS");
  const [showMontantWarning, setShowMontantWarning] = useState(false);

  // =================== CHARGEMENT COMMANDE & CLIENT ===================
  useEffect(() => {
    async function load() {
      try {
        const data = await getCommandeById(Number(id));
        setCommande(data);
        setNouveauStatut(data.statut);

        if (data.clientId) {
          const clientData = await getClientById(data.clientId);
          setClient(clientData);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh] dark:bg-gray-900">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  if (!commande) {
    return (
      <div className="p-8 text-center text-red-500 dark:text-red-400 dark:bg-gray-900">
        Commande introuvable
      </div>
    );
  }

  const resteAPayer = commande?.resteAPayer ?? 0;
  const montantValide = montantActuel === "" || Number(montantActuel) <= resteAPayer;

  const estCommandePesage = commande?.articles?.some(
    (a: any) => a.tranchePoids !== null && a.tranchePoids !== undefined
  );

  // =================== VALIDER PAIEMENT ===================
  async function handleValiderPaiement() {
    if (!commande || !montantValide) return;

    try {
      const payload = {
        montantActuel: Number(montantActuel || 0),
        reliquat: reliquat > 0 ? reliquat : undefined,
        nouveauStatut,
      };

      await updateStatutCommandeAvecPaiement(commande.id, payload);

      // Recharger la commande et le client après mise à jour
      const data = await getCommandeById(commande.id);
      setCommande(data);
      if (data.clientId) {
        const updatedClient = await getClientById(data.clientId);
        setClient(updatedClient);
      }

      // Reset modal
      setMontantActuel("");
      setReliquat(0);
      setShowModal(false);
      setShowMontantWarning(false);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour du paiement/statut");
    }
  }

  // =================== PDF ===================
  async function handleDownloadPdf() {
    if (!commande) return;

    try {
      const blob = await getCommandePdf(commande.id);
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (err: any) {
      alert(err.message || "Erreur lors du téléchargement du PDF");
    }
  }

  // =================== SUPPRESSION ===================
  async function handleSupprimerCommande() {
    if (!commande) return;

    const confirmed = window.confirm(`Confirmer la suppression de la commande #${commande.id} ?`);
    if (!confirmed) return;

    try {
      await deleteCommande(commande.id);
      alert("La commande a été supprimée.");
      navigate("/commandes");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression de la commande.");
    }
  }

  // =================== RENDER ===================
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 dark:bg-gray-900 dark:text-gray-100">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate("/commandes")}
          className="flex items-center gap-2 text-blue-700 hover:underline dark:text-blue-400"
        >
          <ArrowLeft size={20} /> Retour
        </button>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <Button
              className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white flex items-center gap-2"
              onClick={handleSupprimerCommande}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Supprimer
            </Button>
          )}

          <Button
            className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white flex items-center gap-2"
            onClick={() => setShowModal(true)}
          >
            <CheckCircle className="h-4 w-4 mr-2" /> Mettre à jour le paiement/statut
          </Button>
        </div>
      </div>

      {/* TITRE */}
      <div>
        <h1 className="text-3xl font-bold dark:text-gray-100 flex items-center gap-3">
          Commande #{commande.id}
          {estCommandePesage ? (
            <Badge className="bg-purple-600 text-white flex items-center gap-1">
              <Scale size={14} /> Par pesage
            </Badge>
          ) : (
            <Badge className="bg-blue-600 text-white flex items-center gap-1">
              <Shirt size={14} /> Standard
            </Badge>
          )}
        </h1>
        <p className="text-gray-600 mt-1 dark:text-gray-300">
          Réception : <b>{commande.dateReception}</b> — Livraison : <b>{commande.dateLivraison}</b>
        </p>
      </div>

      {/* CLIENT & ARTICLES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 shadow-sm border-l-4 border-blue-600 dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">Informations Client</h2>
          <div className="space-y-2 text-sm">
            <p><b>Nom :</b> {client?.nom}</p>
            <p><b>Téléphone :</b> {client?.telephone}</p>
          </div>
        </Card>

        <Card className="p-6 shadow-sm border-l-4 border-green-600 dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-4 dark:text-gray-100 flex items-center gap-2">
            {estCommandePesage ? <Scale size={20} className="text-purple-600" /> : <Shirt size={20} className="text-blue-600" />}
            Articles & Services
          </h2>
          <div className="space-y-3">
            {commande.articles?.map((a: any, index: number) => {
              const tranchePoids = a.tranchePoids || a.tranche_poids || null;
              const service = a.service || "Service non spécifié";
              const article = a.article || "Article non spécifié";
              const estPesage = (a.kilo ?? 0) > 0 || tranchePoids !== null;
              const quantite = estPesage ? a.kilo ?? 0 : a.qte ?? 0;

              return (
                <div key={a.id || index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border dark:border-gray-600">
                  {estPesage ? (
                    <>
                      <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Scale size={16} className="text-purple-600" /> {tranchePoids || "Tranche de poids"}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300"><b>Poids :</b> {quantite} kg</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300"><b>Prix :</b> {(a.montantBrut || 0).toLocaleString()} FCFA</p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Shirt size={16} className="text-blue-600" /> {article} / {service}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1"><b>Quantité :</b> {quantite} pcs</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300"><b>Montant :</b> {(a.montantBrut || 0).toLocaleString()} FCFA</p>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* MONTANTS */}
        <Card className="p-6 shadow-sm bg-gray-50 border dark:bg-gray-800 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">Montants</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p><b>Montant brut :</b> {commande.articles?.reduce((sum: number, a: any) => sum + a.montantBrut, 0).toLocaleString()} FCFA</p>
              <p><b>Remise :</b> {commande.remiseGlobale?.toLocaleString() ?? 0} FCFA</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400"><b>Net :</b> {commande.montantNetTotal?.toLocaleString() ?? 0} FCFA</p>
            </div>
            <div className="space-y-2">
              <p><b>Payé :</b> {(commande.montantPaye ?? 0).toLocaleString()} FCFA</p>
              <p className={`font-bold text-lg ${resteAPayer === 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                Reste à payer : {resteAPayer.toLocaleString()} FCFA
              </p>
              <p className="flex items-center gap-2">
                <b>Statut paiement :</b>
                <Badge className={`px-3 py-1 text-white ${
                  commande.statutPaiement === "Payé" ? "bg-green-600 dark:bg-green-700" :
                  commande.statutPaiement === "Partiel" ? "bg-orange-500 dark:bg-orange-600" :
                  "bg-red-500 dark:bg-red-600"}`}>
                  {commande.statutPaiement}
                </Badge>
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* MODAL PAIEMENT/STATUT */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md dark:bg-gray-800 dark:text-gray-100">
          <DialogHeader>
            <DialogTitle className="text-lg dark:text-gray-100">Confirmer le paiement et le statut</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Montant payé */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Montant payé (max: {resteAPayer.toLocaleString()} FCFA)
              </label>
              <Input
                type="number"
                placeholder="Montant payé..."
                value={montantActuel}
                min={0}
                onChange={(e) => {
                  const valeur = Number(e.target.value);
                  if (valeur > resteAPayer) {
                    setShowMontantWarning(true);
                    setMontantActuel(resteAPayer.toString());
                    setTimeout(() => setShowMontantWarning(false), 3000);
                  } else {
                    setShowMontantWarning(false);
                    setMontantActuel(e.target.value);
                  }
                }}
                className="dark:bg-gray-700 dark:text-white"
              />
              {showMontantWarning && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2 mt-2 flex items-start gap-2">
                  <span className="text-lg">⚠️</span>
                  <span>
                    Le montant payé ne peut pas dépasser le reste à payer.
                    <br />
                    <strong>Montant ajusté à : {resteAPayer.toLocaleString()} FCFA</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Reliquat 
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Reliquat (optionnel)
              </label>
              <Input
                type="number"
                placeholder="Montant du reliquat..."
                value={reliquat || ""}
                min={0}
                onChange={(e) => setReliquat(Number(e.target.value))}
                className="dark:bg-gray-700 dark:text-white"
              />
              {reliquat > 0 && (
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Ce reliquat sera conservé pour le client.
                </div>
              )}
            </div>
            */}

            {/* Statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Statut commande
              </label>
              <Select value={nouveauStatut} onValueChange={(v) => setNouveauStatut(v as "EN_COURS" | "LIVREE")}>
                <SelectTrigger className="w-full dark:bg-gray-700 dark:text-white">
                  <SelectValue placeholder="Sélectionner le statut" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:text-white">
                  <SelectItem value="EN_COURS">EN COURS</SelectItem>
                  <SelectItem value="LIVREE">LIVRÉE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowModal(false)} className="dark:border-gray-600 dark:text-gray-100">
              Annuler
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white"
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
