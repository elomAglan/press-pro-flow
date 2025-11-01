import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DollarSign, CreditCard, Smartphone, Wallet } from "lucide-react";
import { mockCommandes, mockClients, Commande } from "@/services/mockData";
import { toast } from "@/hooks/use-toast";

export default function Paiements() {
  const [commandes, setCommandes] = useState<Commande[]>(mockCommandes);
  const [selectedCommande, setSelectedCommande] = useState<Commande | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [montant, setMontant] = useState("");
  const [modePaiement, setModePaiement] = useState<"especes" | "mobile_money" | "carte">("especes");

  const commandesNonPayees = commandes.filter(c => c.statutPaiement !== "paye");
  const totalImpaye = commandesNonPayees.reduce((sum, c) => sum + (c.total - c.montantPaye), 0);

  const handlePaiement = () => {
    if (!selectedCommande || !montant) {
      toast({ title: "Erreur", description: "Veuillez entrer un montant", variant: "destructive" });
      return;
    }

    const montantNum = parseFloat(montant);
    const nouveauMontantPaye = selectedCommande.montantPaye + montantNum;
    const nouveauStatut = nouveauMontantPaye >= selectedCommande.total
      ? "paye"
      : nouveauMontantPaye > 0
      ? "partiel"
      : "non_paye";

    setCommandes(commandes.map(c =>
      c.id === selectedCommande.id
        ? {
            ...c,
            montantPaye: nouveauMontantPaye,
            statutPaiement: nouveauStatut,
            modePaiement,
          }
        : c
    ));

    setIsDialogOpen(false);
    setMontant("");
    toast({
      title: "Paiement enregistré",
      description: `${montantNum.toLocaleString()} FCFA reçu via ${modePaiement}`,
    });
  };

  const getPaiementBadgeClass = (statut: string) => {
    switch (statut) {
      case "paye":
        return "bg-success-light text-success border-success/20";
      case "partiel":
        return "bg-warning-light text-warning border-warning/20";
      case "non_paye":
        return "bg-danger-light text-danger border-danger/20";
      default:
        return "";
    }
  };

  const getModePaiementIcon = (mode?: string) => {
    switch (mode) {
      case "especes":
        return <Wallet className="h-4 w-4" />;
      case "mobile_money":
        return <Smartphone className="h-4 w-4" />;
      case "carte":
        return <CreditCard className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Paiements</h1>
        <p className="text-muted-foreground">Gérez les paiements des commandes</p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gradient-card p-6 shadow-md">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-danger-light p-3 text-danger">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Impayé</p>
              <p className="text-2xl font-bold text-foreground">{totalImpaye.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">FCFA</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-card p-6 shadow-md">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-warning-light p-3 text-warning">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Commandes Non Payées</p>
              <p className="text-2xl font-bold text-foreground">{commandesNonPayees.length}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-card p-6 shadow-md">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-success-light p-3 text-success">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Commandes Payées</p>
              <p className="text-2xl font-bold text-foreground">
                {commandes.filter(c => c.statutPaiement === "paye").length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Payment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enregistrer un paiement</DialogTitle>
          </DialogHeader>
          {selectedCommande && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted p-4">
                <p className="text-sm text-muted-foreground">Commande</p>
                <p className="font-bold text-foreground">{selectedCommande.numero}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Total: {selectedCommande.total.toLocaleString()} FCFA
                </p>
                <p className="text-sm text-muted-foreground">
                  Payé: {selectedCommande.montantPaye.toLocaleString()} FCFA
                </p>
                <p className="font-semibold text-danger">
                  Reste: {(selectedCommande.total - selectedCommande.montantPaye).toLocaleString()} FCFA
                </p>
              </div>

              <div className="space-y-2">
                <Label>Montant à payer (FCFA)</Label>
                <Input
                  type="number"
                  value={montant}
                  onChange={(e) => setMontant(e.target.value)}
                  placeholder="0"
                  max={selectedCommande.total - selectedCommande.montantPaye}
                />
              </div>

              <div className="space-y-2">
                <Label>Mode de paiement</Label>
                <Select value={modePaiement} onValueChange={(v: any) => setModePaiement(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="especes">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        Espèces
                      </div>
                    </SelectItem>
                    <SelectItem value="mobile_money">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        Mobile Money
                      </div>
                    </SelectItem>
                    <SelectItem value="carte">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Carte bancaire
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handlePaiement} className="w-full bg-gradient-primary">
                Enregistrer le paiement
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Commandes List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">Toutes les commandes</h2>
        {commandes.map(commande => {
          const client = mockClients.find(c => c.id === commande.clientId);
          const reste = commande.total - commande.montantPaye;

          return (
            <Card key={commande.id} className="bg-gradient-card p-6 shadow-md">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-foreground">{commande.numero}</h3>
                    <Badge className={getPaiementBadgeClass(commande.statutPaiement)}>
                      {commande.statutPaiement === "non_paye" && "Non payé"}
                      {commande.statutPaiement === "partiel" && "Partiel"}
                      {commande.statutPaiement === "paye" && "Payé"}
                    </Badge>
                    {commande.modePaiement && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        {getModePaiementIcon(commande.modePaiement)}
                        <span className="capitalize">{commande.modePaiement.replace("_", " ")}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">Client: {client?.nom || "Inconnu"}</p>
                  <div className="flex gap-4 text-sm">
                    <span className="text-muted-foreground">Total: <span className="font-semibold text-foreground">{commande.total.toLocaleString()} FCFA</span></span>
                    <span className="text-muted-foreground">Payé: <span className="font-semibold text-success">{commande.montantPaye.toLocaleString()} FCFA</span></span>
                    {reste > 0 && (
                      <span className="text-muted-foreground">Reste: <span className="font-semibold text-danger">{reste.toLocaleString()} FCFA</span></span>
                    )}
                  </div>
                </div>
                {reste > 0 && (
                  <Button
                    onClick={() => {
                      setSelectedCommande(commande);
                      setIsDialogOpen(true);
                    }}
                    className="bg-gradient-primary"
                  >
                    <DollarSign className="mr-2 h-4 w-4" />
                    Payer
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
