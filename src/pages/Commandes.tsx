import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, QrCode } from "lucide-react";
import { mockClients, mockTarifs, generateCommandeNumber, Article, Commande, mockCommandes } from "@/services/mockData";
import { toast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";

export default function Commandes() {
  const [commandes, setCommandes] = useState<Commande[]>(mockCommandes);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [currentArticle, setCurrentArticle] = useState({
    type: "",
    service: "",
    quantite: 1,
  });
  const [selectedCommande, setSelectedCommande] = useState<Commande | null>(null);
  const [etiquetteType, setEtiquetteType] = useState<"commande" | "article">("commande");

  const types = [...new Set(mockTarifs.map(t => t.typeArticle))];
  const services = [...new Set(mockTarifs.map(t => t.service))];

  const getPrixUnitaire = () => {
    const tarif = mockTarifs.find(
      t => t.typeArticle === currentArticle.type && t.service === currentArticle.service
    );
    return tarif?.prix || 0;
  };

  const addArticle = () => {
    if (!currentArticle.type || !currentArticle.service) {
      toast({ title: "Erreur", description: "Veuillez sélectionner un type et un service", variant: "destructive" });
      return;
    }

    const newArticle: Article = {
      id: `a${articles.length + 1}`,
      ...currentArticle,
      prixUnitaire: getPrixUnitaire(),
    };

    setArticles([...articles, newArticle]);
    setCurrentArticle({ type: "", service: "", quantite: 1 });
    toast({ title: "Article ajouté", description: "L'article a été ajouté à la commande" });
  };

  const removeArticle = (id: string) => {
    setArticles(articles.filter(a => a.id !== id));
  };

  const calculateTotal = () => {
    return articles.reduce((sum, article) => sum + (article.prixUnitaire * article.quantite), 0);
  };

  const handleSubmit = () => {
    if (!selectedClient || articles.length === 0) {
      toast({ title: "Erreur", description: "Veuillez sélectionner un client et ajouter au moins un article", variant: "destructive" });
      return;
    }

    const newCommande: Commande = {
      id: String(commandes.length + 1),
      numero: generateCommandeNumber(),
      clientId: selectedClient,
      articles,
      total: calculateTotal(),
      statut: "en_attente",
      statutPaiement: "non_paye",
      montantPaye: 0,
      dateCreation: new Date(),
    };

    setCommandes([newCommande, ...commandes]);
    setSelectedCommande(newCommande);
    setArticles([]);
    setSelectedClient("");
    setIsDialogOpen(false);
    setIsQRDialogOpen(true);
    toast({ title: "Commande créée", description: `Commande ${newCommande.numero} créée avec succès` });
  };

  const getStatutBadgeClass = (statut: string) => {
    switch (statut) {
      case "pret":
      case "livre":
        return "bg-success-light text-success border-success/20";
      case "en_cours":
        return "bg-primary/10 text-primary border-primary/20";
      case "en_attente":
        return "bg-warning-light text-warning border-warning/20";
      default:
        return "";
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Commandes</h1>
          <p className="text-muted-foreground">Gérez vos commandes</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-primary shadow-md hover:shadow-lg">
              <Plus className="h-4 w-4" />
              Nouvelle Commande
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Créer une commande</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Client Selection */}
              <div className="space-y-2">
                <Label>Client</Label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockClients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.nom} - {client.telephone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Article Form */}
              <Card className="p-4">
                <h3 className="mb-4 font-semibold text-foreground">Ajouter un article</h3>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={currentArticle.type} onValueChange={(v) => setCurrentArticle({...currentArticle, type: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {types.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Service</Label>
                    <Select value={currentArticle.service} onValueChange={(v) => setCurrentArticle({...currentArticle, service: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map(service => (
                          <SelectItem key={service} value={service}>{service}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Quantité</Label>
                    <Input
                      type="number"
                      min="1"
                      value={currentArticle.quantite}
                      onChange={(e) => setCurrentArticle({...currentArticle, quantite: parseInt(e.target.value) || 1})}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="button" onClick={addArticle} className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter
                    </Button>
                  </div>
                </div>
                {currentArticle.type && currentArticle.service && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Prix unitaire: {getPrixUnitaire().toLocaleString()} FCFA
                  </p>
                )}
              </Card>

              {/* Articles List */}
              {articles.length > 0 && (
                <Card className="p-4">
                  <h3 className="mb-4 font-semibold text-foreground">Articles ({articles.length})</h3>
                  <div className="space-y-2">
                    {articles.map(article => (
                      <div key={article.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                        <div className="flex-1">
                          <p className="font-medium text-foreground">
                            {article.type} - {article.service}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {article.quantite} x {article.prixUnitaire.toLocaleString()} = {(article.quantite * article.prixUnitaire).toLocaleString()} FCFA
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeArticle(article.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 border-t border-border pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-primary">{calculateTotal().toLocaleString()} FCFA</span>
                    </div>
                  </div>
                </Card>
              )}

              <Button onClick={handleSubmit} className="w-full bg-gradient-primary">
                Créer la commande
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Générer les étiquettes</DialogTitle>
          </DialogHeader>
          {selectedCommande && (
            <div className="space-y-6">
              <div className="space-y-4">
                <Label>Type d'étiquette</Label>
                <div className="grid gap-4 md:grid-cols-2">
                  <Button
                    variant={etiquetteType === "commande" ? "default" : "outline"}
                    onClick={() => setEtiquetteType("commande")}
                  >
                    Étiquette commande
                  </Button>
                  <Button
                    variant={etiquetteType === "article" ? "default" : "outline"}
                    onClick={() => setEtiquetteType("article")}
                  >
                    Étiquette par article
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-6 text-center">
                {etiquetteType === "commande" ? (
                  <div className="space-y-4">
                    <QRCodeSVG value={selectedCommande.numero} size={200} />
                    <div>
                      <p className="font-bold text-foreground">{selectedCommande.numero}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedCommande.articles.length} article(s)
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {selectedCommande.articles.map((article, idx) => (
                      <div key={article.id} className="space-y-2 border-b border-border pb-4 last:border-0">
                        <QRCodeSVG value={`${selectedCommande.numero}-${article.id}`} size={150} />
                        <div>
                          <p className="font-medium text-foreground">Article {idx + 1}</p>
                          <p className="text-sm text-muted-foreground">
                            {article.type} - {article.service}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Commandes List */}
      <div className="space-y-4">
        {commandes.map(commande => {
          const client = mockClients.find(c => c.id === commande.clientId);
          return (
            <Card key={commande.id} className="bg-gradient-card p-6 shadow-md transition-all hover:shadow-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-foreground">{commande.numero}</h3>
                    <Badge className={getStatutBadgeClass(commande.statut)}>
                      {commande.statut.replace("_", " ")}
                    </Badge>
                    <Badge className={getPaiementBadgeClass(commande.statutPaiement)}>
                      {commande.statutPaiement === "non_paye" && "Non payé"}
                      {commande.statutPaiement === "partiel" && "Partiel"}
                      {commande.statutPaiement === "paye" && "Payé"}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Client: {client?.nom || "Inconnu"}</p>
                    <p>{commande.articles.length} article(s) • {new Date(commande.dateCreation).toLocaleDateString("fr-FR")}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {commande.articles.slice(0, 3).map(article => (
                      <Badge key={article.id} variant="secondary">
                        {article.quantite}x {article.type}
                      </Badge>
                    ))}
                    {commande.articles.length > 3 && (
                      <Badge variant="outline">+{commande.articles.length - 3}</Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground">{commande.total.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">FCFA</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setSelectedCommande(commande);
                      setIsQRDialogOpen(true);
                    }}
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    QR Code
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
