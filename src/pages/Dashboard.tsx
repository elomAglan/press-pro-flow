import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, ShoppingBag, Users, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { mockCommandes, mockClients, getClientById } from "@/services/mockData";

export default function Dashboard() {
  const totalRevenu = mockCommandes.reduce((acc, cmd) => acc + cmd.montantPaye, 0);
  const commandesEnAttente = mockCommandes.filter(cmd => cmd.statutPaiement === "non_paye").length;
  const commandesDuJour = mockCommandes.filter(
    cmd => new Date(cmd.dateCreation).toDateString() === new Date().toDateString()
  ).length;

  const getStatutBadgeVariant = (statut: string) => {
    switch (statut) {
      case "pret":
      case "livre":
        return "default";
      case "en_cours":
        return "secondary";
      case "en_attente":
        return "outline";
      default:
        return "secondary";
    }
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Vue d'ensemble de votre activité</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Revenu Total"
          value={`${totalRevenu.toLocaleString()} FCFA`}
          icon={DollarSign}
          variant="success"
          trend={{ value: "+12.5%", positive: true }}
        />
        <StatCard
          title="Commandes"
          value={mockCommandes.length}
          icon={ShoppingBag}
          variant="default"
          trend={{ value: "+8", positive: true }}
        />
        <StatCard
          title="Clients"
          value={mockClients.length}
          icon={Users}
          variant="default"
        />
        <StatCard
          title="En Attente"
          value={commandesEnAttente}
          icon={Clock}
          variant="warning"
        />
      </div>

      {/* Commandes Récentes */}
      <Card className="bg-gradient-card p-6 shadow-md">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Commandes Récentes</h2>
          <Badge variant="secondary">{mockCommandes.length} commandes</Badge>
        </div>

        <div className="space-y-4">
          {mockCommandes.slice(0, 5).map((commande) => {
            const client = getClientById(commande.clientId);
            return (
              <div
                key={commande.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-all hover:shadow-md"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-foreground">{commande.numero}</p>
                    <Badge variant={getStatutBadgeVariant(commande.statut)}>
                      {commande.statut.replace("_", " ")}
                    </Badge>
                    <Badge className={getPaiementBadgeClass(commande.statutPaiement)}>
                      {commande.statutPaiement === "non_paye" && "Non payé"}
                      {commande.statutPaiement === "partiel" && "Partiel"}
                      {commande.statutPaiement === "paye" && "Payé"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Client: {client?.nom || "Inconnu"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {commande.articles.length} article(s) • Créée le {new Date(commande.dateCreation).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-foreground">{commande.total.toLocaleString()} FCFA</p>
                  <p className="text-sm text-muted-foreground">
                    Payé: {commande.montantPaye.toLocaleString()} FCFA
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gradient-primary p-6 text-primary-foreground shadow-glow transition-all hover:shadow-xl">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-white/20 p-3">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm opacity-90">Nouvelle</p>
              <p className="text-xl font-bold">Commande</p>
            </div>
          </div>
        </Card>

        <Card className="bg-card p-6 shadow-md transition-all hover:shadow-lg">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-success-light p-3 text-success">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Commandes</p>
              <p className="text-xl font-bold text-foreground">Prêtes</p>
            </div>
          </div>
        </Card>

        <Card className="bg-card p-6 shadow-md transition-all hover:shadow-lg">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-warning-light p-3 text-warning">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Voir les</p>
              <p className="text-xl font-bold text-foreground">Rapports</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
