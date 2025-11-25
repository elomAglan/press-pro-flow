import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, CheckCircle, AlertCircle, FileText } from "lucide-react";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { getCommandeById, updateStatutCommandeAvecMontant, getCommandePdf } from "../services/commande.service";
import { getClientById } from "../services/client.service";

export default function CommandeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [commande, setCommande] = useState<any | null>(null);
  const [client, setClient] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [montantActuel, setMontantActuel] = useState("");
  const [nouveauStatut, setNouveauStatut] = useState<"EN_COURS" | "LIVREE">("EN_COURS");

  // Charger la commande et le client
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

  const resteAPayer = Number(commande?.montantNetTotal ?? 0) - Number(commande?.montantPaye ?? 0);
  const montantValide = montantActuel === "" || Number(montantActuel) <= resteAPayer;

  // ================= PAIEMENT & STATUT =================
  async function handleValiderPaiement() {
    if (!commande || !montantValide) return;

    try {
      const payload = {
        statut: nouveauStatut,
        montantActuel: Number(montantActuel || 0),
      };

      // 1️⃣ Mettre à jour le statut/paiement
      const updatedCommande = await updateStatutCommandeAvecMontant(commande.id, payload);

      setCommande(updatedCommande);

      if (updatedCommande.clientId) {
        const updatedClient = await getClientById(updatedCommande.clientId);
        setClient(updatedClient);
      }

      setMontantActuel("");
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour du paiement/statut");
    }
  }

  // ================= PDF =================
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

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 dark:bg-gray-900 dark:text-gray-100">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/commandes")}
            className="flex items-center gap-2 text-blue-700 hover:underline dark:text-blue-400"
          >
            <ArrowLeft size={20} /> Retour
          </button>

          <Button
            className="bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-800 text-white flex items-center gap-2"
            onClick={handleDownloadPdf}
          >
            <FileText size={16} /> Télécharger PDF
          </Button>
        </div>

        <Button
          className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white flex items-center gap-2"
          onClick={() => setShowModal(true)}
        >
          <CheckCircle className="h-4 w-4 mr-2" /> Mettre à jour le paiement/statut
        </Button>
      </div>

      {/* TITRE */}
      <div>
        <h1 className="text-3xl font-bold dark:text-gray-100">Commande #{commande.id}</h1>
        <p className="text-gray-600 mt-1 dark:text-gray-300">
          Réception : <b>{commande.dateReception}</b> — Livraison : <b>{commande.dateLivraison}</b>
        </p>
      </div>

      {/* INFORMATIONS CLIENT & ARTICLES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 shadow-sm border-l-4 border-blue-600 dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">Informations Client</h2>
          <div className="space-y-2 text-sm">
            <p><b>Nom :</b> {client?.nom}</p>
            <p><b>Téléphone :</b> {client?.telephone}</p>
          </div>
        </Card>

        <Card className="p-6 shadow-sm border-l-4 border-green-600 dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">Articles & Services</h2>
          <div className="space-y-2 text-sm">
            {commande.articles?.map((a: any) => (
              <p key={a.id}>
                <b>{a.article} / {a.service}</b> : {a.qte} {a.kilo ? `kg` : "pcs"}
              </p>
            ))}
          </div>
        </Card>

        {/* MONTANTS */}
        <Card className="p-6 shadow-sm bg-gray-50 border dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">Montants</h2>
          <div className="space-y-2 text-sm">
            <p><b>Montant brut :</b> {commande.articles?.reduce((sum: number, a: any) => sum + a.montantBrut, 0).toLocaleString()} FCFA</p>
            <p><b>Remise :</b> {commande.remiseGlobale?.toLocaleString() ?? 0} FCFA</p>
            <p><b>Net :</b> {commande.montantNetTotal?.toLocaleString() ?? 0} FCFA</p>
            <p><b>Payé :</b> {Number(commande.montantPaye ?? 0).toLocaleString()} FCFA</p>
            <p className={`font-bold ${resteAPayer === 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              Reste à payer : {resteAPayer.toLocaleString()} FCFA
            </p>
            <p>
              <b>Statut paiement :</b>{" "}
              <Badge className={`px-3 py-1 text-white ${commande.statutPaiement === "Payé" ? "bg-green-600 dark:bg-green-700" : commande.statutPaiement === "Partiel" ? "bg-orange-500 dark:bg-orange-600" : "bg-red-500 dark:bg-red-600"}`}>
                {commande.statutPaiement}
              </Badge>
            </p>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Montant payé</label>
              <Input
                type="number"
                placeholder="Montant payé..."
                value={montantActuel}
                min={0}
                max={resteAPayer}
                onChange={(e) => setMontantActuel(e.target.value)}
                className="dark:bg-gray-700 dark:text-white"
              />
              {!montantValide && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle size={14} /> Montant invalide
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Statut commande</label>
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

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowModal(false)} className="dark:border-gray-600 dark:text-gray-100">Annuler</Button>
            <Button className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white" disabled={!montantValide} onClick={handleValiderPaiement}>
              Valider
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
