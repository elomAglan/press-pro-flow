import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, DollarSign, ShoppingBag, AlertCircle } from "lucide-react";
import { mockCommandes, mockClients, getClientById } from "@/services/mockData";

export default function Rapports() {
  const today = new Date();
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const getRevenu = (startDate: Date) => {
    return mockCommandes
      .filter(c => new Date(c.dateCreation) >= startDate)
      .reduce((sum, c) => sum + c.montantPaye, 0);
  };

  const getCommandes = (startDate: Date) => {
    return mockCommandes.filter(c => new Date(c.dateCreation) >= startDate);
  };

  const revenuJour = getRevenu(new Date(new Date().setHours(0, 0, 0, 0)));
  const revenuSemaine = getRevenu(startOfWeek);
  const revenuMois = getRevenu(startOfMonth);

  const commandesNonPayees = mockCommandes.filter(c => c.statutPaiement === "non_paye");
  const totalImpaye = commandesNonPayees.reduce((sum, c) => sum + (c.total - c.montantPaye), 0);

  // Articles les plus fréquents
  const articlesCount: Record<string, number> = {};
  mockCommandes.forEach(commande => {
    commande.articles.forEach(article => {
      const key = `${article.type} - ${article.service}`;
      articlesCount[key] = (articlesCount[key] || 0) + article.quantite;
    });
  });

  const topArticles = Object.entries(articlesCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Clients les plus actifs
  const clientsStats = mockClients.map(client => ({
    client,
    commandes: mockCommandes.filter(c => c.clientId === client.id).length,
    total: mockCommandes
      .filter(c => c.clientId === client.id)
      .reduce((sum, c) => sum + c.total, 0),
  })).sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Rapports</h1>
        <p className="text-muted-foreground">Analyse de votre activité</p>
      </div>

      {/* Revenue Stats */}
      <Tabs defaultValue="jour" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="jour">Jour</TabsTrigger>
          <TabsTrigger value="semaine">Semaine</TabsTrigger>
          <TabsTrigger value="mois">Mois</TabsTrigger>
        </TabsList>

        <TabsContent value="jour" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="bg-gradient-primary p-6 text-primary-foreground shadow-glow">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8" />
                <div>
                  <p className="text-sm opacity-90">Revenu du jour</p>
                  <p className="text-3xl font-bold">{revenuJour.toLocaleString()}</p>
                  <p className="text-xs opacity-75">FCFA</p>
                </div>
              </div>
            </Card>
            <Card className="bg-gradient-card p-6 shadow-md">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Commandes du jour</p>
                  <p className="text-3xl font-bold text-foreground">{getCommandes(new Date(new Date().setHours(0, 0, 0, 0))).length}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-gradient-card p-6 shadow-md">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-success" />
                <div>
                  <p className="text-sm text-muted-foreground">Moyenne/commande</p>
                  <p className="text-3xl font-bold text-foreground">
                    {getCommandes(new Date(new Date().setHours(0, 0, 0, 0))).length > 0
                      ? Math.round(revenuJour / getCommandes(new Date(new Date().setHours(0, 0, 0, 0))).length).toLocaleString()
                      : 0}
                  </p>
                  <p className="text-xs text-muted-foreground">FCFA</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="semaine" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="bg-gradient-primary p-6 text-primary-foreground shadow-glow">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8" />
                <div>
                  <p className="text-sm opacity-90">Revenu de la semaine</p>
                  <p className="text-3xl font-bold">{revenuSemaine.toLocaleString()}</p>
                  <p className="text-xs opacity-75">FCFA</p>
                </div>
              </div>
            </Card>
            <Card className="bg-gradient-card p-6 shadow-md">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Commandes de la semaine</p>
                  <p className="text-3xl font-bold text-foreground">{getCommandes(startOfWeek).length}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-gradient-card p-6 shadow-md">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-success" />
                <div>
                  <p className="text-sm text-muted-foreground">Moyenne/commande</p>
                  <p className="text-3xl font-bold text-foreground">
                    {getCommandes(startOfWeek).length > 0
                      ? Math.round(revenuSemaine / getCommandes(startOfWeek).length).toLocaleString()
                      : 0}
                  </p>
                  <p className="text-xs text-muted-foreground">FCFA</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mois" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="bg-gradient-primary p-6 text-primary-foreground shadow-glow">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8" />
                <div>
                  <p className="text-sm opacity-90">Revenu du mois</p>
                  <p className="text-3xl font-bold">{revenuMois.toLocaleString()}</p>
                  <p className="text-xs opacity-75">FCFA</p>
                </div>
              </div>
            </Card>
            <Card className="bg-gradient-card p-6 shadow-md">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Commandes du mois</p>
                  <p className="text-3xl font-bold text-foreground">{getCommandes(startOfMonth).length}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-gradient-card p-6 shadow-md">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-success" />
                <div>
                  <p className="text-sm text-muted-foreground">Moyenne/commande</p>
                  <p className="text-3xl font-bold text-foreground">
                    {getCommandes(startOfMonth).length > 0
                      ? Math.round(revenuMois / getCommandes(startOfMonth).length).toLocaleString()
                      : 0}
                  </p>
                  <p className="text-xs text-muted-foreground">FCFA</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Commandes non payées */}
      <Card className="bg-gradient-card p-6 shadow-md">
        <div className="mb-6 flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-danger" />
          <div>
            <h2 className="text-xl font-bold text-foreground">Commandes Non Payées</h2>
            <p className="text-sm text-muted-foreground">
              {commandesNonPayees.length} commandes • {totalImpaye.toLocaleString()} FCFA à recevoir
            </p>
          </div>
        </div>
        <div className="space-y-3">
          {commandesNonPayees.slice(0, 5).map(commande => {
            const client = getClientById(commande.clientId);
            return (
              <div key={commande.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
                <div>
                  <p className="font-semibold text-foreground">{commande.numero}</p>
                  <p className="text-sm text-muted-foreground">{client?.nom}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-danger">{(commande.total - commande.montantPaye).toLocaleString()} FCFA</p>
                  <Badge variant="outline" className="mt-1">En attente</Badge>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Articles populaires */}
      <Card className="bg-gradient-card p-6 shadow-md">
        <h2 className="mb-6 text-xl font-bold text-foreground">Articles les plus fréquents</h2>
        <div className="space-y-3">
          {topArticles.map(([article, count], index) => (
            <div key={article} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <Badge className="bg-primary/10 text-primary">#{index + 1}</Badge>
                <p className="font-medium text-foreground">{article}</p>
              </div>
              <p className="text-lg font-bold text-foreground">{count} unités</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Meilleurs clients */}
      <Card className="bg-gradient-card p-6 shadow-md">
        <h2 className="mb-6 text-xl font-bold text-foreground">Meilleurs Clients</h2>
        <div className="space-y-3">
          {clientsStats.slice(0, 5).map((stat, index) => (
            <div key={stat.client.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <Badge className="bg-success/10 text-success">#{index + 1}</Badge>
                <div>
                  <p className="font-medium text-foreground">{stat.client.nom}</p>
                  <p className="text-sm text-muted-foreground">{stat.commandes} commande(s)</p>
                </div>
              </div>
              <p className="text-lg font-bold text-foreground">{stat.total.toLocaleString()} FCFA</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
