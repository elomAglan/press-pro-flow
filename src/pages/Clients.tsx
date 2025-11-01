import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Mail, Phone, MapPin } from "lucide-react";
import { mockClients, Client } from "@/services/mockData";
import { toast } from "@/hooks/use-toast";

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    telephone: "",
    email: "",
    adresse: "",
  });

  const filteredClients = clients.filter(
    (client) =>
      client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.telephone.includes(searchTerm) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newClient: Client = {
      id: String(clients.length + 1),
      ...formData,
      createdAt: new Date(),
    };
    setClients([...clients, newClient]);
    setFormData({ nom: "", telephone: "", email: "", adresse: "" });
    setIsDialogOpen(false);
    toast({
      title: "Client ajouté",
      description: `${newClient.nom} a été ajouté avec succès.`,
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clients</h1>
          <p className="text-muted-foreground">Gérez vos clients</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-primary shadow-md hover:shadow-lg">
              <Plus className="h-4 w-4" />
              Nouveau Client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Ajouter un client</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom complet</Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone</Label>
                <Input
                  id="telephone"
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adresse">Adresse</Label>
                <Input
                  id="adresse"
                  value={formData.adresse}
                  onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-primary">
                Ajouter le client
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="bg-gradient-card p-4 shadow-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un client (nom, téléphone, email)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gradient-card p-6 shadow-md">
          <p className="text-sm text-muted-foreground">Total Clients</p>
          <p className="text-3xl font-bold text-foreground">{clients.length}</p>
        </Card>
        <Card className="bg-gradient-card p-6 shadow-md">
          <p className="text-sm text-muted-foreground">Nouveaux ce mois</p>
          <p className="text-3xl font-bold text-success">+{clients.filter(c => new Date(c.createdAt).getMonth() === new Date().getMonth()).length}</p>
        </Card>
        <Card className="bg-gradient-card p-6 shadow-md">
          <p className="text-sm text-muted-foreground">Résultats</p>
          <p className="text-3xl font-bold text-foreground">{filteredClients.length}</p>
        </Card>
      </div>

      {/* Clients List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredClients.map((client) => (
          <Card key={client.id} className="bg-gradient-card p-6 shadow-md transition-all hover:shadow-lg">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{client.nom}</h3>
                  <Badge variant="secondary" className="mt-1">
                    ID: {client.id}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {client.telephone}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {client.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {client.adresse}
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-xs text-muted-foreground">
                  Client depuis {new Date(client.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <Card className="bg-gradient-card p-12 text-center shadow-md">
          <p className="text-muted-foreground">Aucun client trouvé</p>
        </Card>
      )}
    </div>
  );
}
