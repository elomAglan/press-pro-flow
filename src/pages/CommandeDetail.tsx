import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Loader2, CheckCircle, Scale, Shirt, 
  Trash2, FileText, Phone, User, Calendar, CreditCard, ChevronRight 
} from "lucide-react";
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

// Type strict pour TypeScript
type StatutCommande = "EN_COURS" | "LIVREE";

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
  const [nouveauStatut, setNouveauStatut] = useState<StatutCommande>("EN_COURS");
  const [showMontantWarning, setShowMontantWarning] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getCommandeById(Number(id));
        setCommande(data);
        // On s'assure que le statut est bien du type attendu
        if (data.statut === "LIVREE" || data.statut === "EN_COURS") {
          setNouveauStatut(data.statut);
        }
        if (data.clientId) {
          const clientData = await getClientById(data.clientId);
          setClient(clientData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[80vh] dark:bg-gray-950">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!commande) {
    return <div className="p-8 text-center text-red-500">Commande introuvable</div>;
  }

  const resteAPayer = commande?.resteAPayer ?? 0;
  const montantValide = montantActuel === "" || Number(montantActuel) <= resteAPayer;
  const estCommandePesage = commande?.articles?.some((a: any) => a.tranchePoids);

  async function handleValiderPaiement() {
    if (!commande || !montantValide) return;
    try {
      const payload = {
        montantActuel: Number(montantActuel || 0),
        reliquat: reliquat > 0 ? reliquat : undefined,
        nouveauStatut: nouveauStatut as "EN_COURS" | "LIVREE",
      };
      await updateStatutCommandeAvecPaiement(commande.id, payload);
      const data = await getCommandeById(commande.id);
      setCommande(data);
      setMontantActuel("");
      setShowModal(false);
    } catch (err) {
      alert("Erreur lors de la mise à jour");
    }
  }

  async function handleDownloadPdf() {
    try {
      const blob = await getCommandePdf(commande.id);
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      alert("Erreur lors de la génération du PDF");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-10">
      {/* HEADER STICKY */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b p-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/commandes")}>
            <ArrowLeft className="h-5 w-5 md:mr-2" />
            <span className="hidden md:inline">Retour</span>
          </Button>
          <div className="flex gap-2">

            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => setShowModal(true)}>
              <CreditCard className="h-4 w-4 md:mr-2" />
              Paiement
            </Button>
            {isAdmin && (
              <Button size="icon" variant="destructive" className="h-9 w-9" onClick={() => {}}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-bold">Commande #{commande.id}</h1>
            <Badge className={estCommandePesage ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}>
              {estCommandePesage ? "Pesage" : "Standard"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-4">
            <span>Reçu : {commande.dateReception}</span>
            <span className="text-orange-600 font-medium">Livraison : {commande.dateLivraison}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* CLIENT & FINANCE */}
          <div className="space-y-6">
            <Card className="p-5 border-t-4 border-t-blue-500 shadow-sm">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-4"><User className="h-5 w-5 text-blue-500" /> Client</h2>
              <div className="space-y-2 text-sm">
                <p><b>Nom :</b> {client?.nom || "N/A"}</p>
                <p><b>Tel :</b> {client?.telephone || "N/A"}</p>
              </div>
            </Card>

            <Card className="p-5 border-t-4 border-t-green-500 shadow-sm">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-4"><CreditCard className="h-5 w-5 text-green-500" /> Paiement</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Net à payer</span>
                  <span className="font-bold">{commande.montantNetTotal?.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-sm text-green-600">
                  <span>Déjà payé</span>
                  <span>{(commande.montantPaye || 0).toLocaleString()} FCFA</span>
                </div>
                <div className="pt-2 border-t flex justify-between items-center text-red-600 font-black">
                  <span>Reste</span>
                  <span className="text-xl">{resteAPayer.toLocaleString()} FCFA</span>
                </div>
              </div>
            </Card>
          </div>

          {/* ARTICLES */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b font-bold">Liste des Articles</div>
              <div className="divide-y">
                {commande.articles?.map((a: any, idx: number) => (
                  <div key={idx} className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-sm">{a.article || a.tranchePoids}</p>
                      <p className="text-xs text-muted-foreground">{a.service} • Qté: {a.qte || a.kilo}</p>
                    </div>
                    <p className="font-bold text-blue-600">{a.montantBrut?.toLocaleString()} FCFA</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* MODAL */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Mettre à jour la commande</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-bold">Encaisser (FCFA)</label>
              <Input
                type="number"
                value={montantActuel}
                onChange={(e) => setMontantActuel(e.target.value)}
                className={!montantValide ? "border-red-500" : ""}
              />
              <p className="text-[10px] text-muted-foreground text-right italic">Maximum : {resteAPayer} FCFA</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold">Statut</label>
              <Select value={nouveauStatut} onValueChange={(v: StatutCommande) => setNouveauStatut(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EN_COURS">EN COURS</SelectItem>
                  <SelectItem value="LIVREE">LIVRÉE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Annuler</Button>
            <Button className="flex-1 bg-green-600" disabled={!montantValide} onClick={handleValiderPaiement}>Valider</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}