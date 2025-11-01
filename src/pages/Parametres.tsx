import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { mockTarifs, Tarif } from "@/services/mockData";
import { toast } from "@/hooks/use-toast";

export default function Parametres() {
  const [tarifs, setTarifs] = useState<Tarif[]>(mockTarifs);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTarif, setEditingTarif] = useState<Tarif | null>(null);
  const [formData, setFormData] = useState({
    typeArticle: "",
    service: "",
    prix: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTarif) {
      setTarifs(tarifs.map(t =>
        t.id === editingTarif.id
          ? { ...t, ...formData, prix: parseFloat(formData.prix) }
          : t
      ));
      toast({ title: "Tarif modifié", description: "Le tarif a été mis à jour avec succès" });
    } else {
      const newTarif: Tarif = {
        id: String(tarifs.length + 1),
        typeArticle: formData.typeArticle,
        service: formData.service,
        prix: parseFloat(formData.prix),
      };
      setTarifs([...tarifs, newTarif]);
      toast({ title: "Tarif ajouté", description: "Le nouveau tarif a été créé avec succès" });
    }

    setFormData({ typeArticle: "", service: "", prix: "" });
    setEditingTarif(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (tarif: Tarif) => {
    setEditingTarif(tarif);
    setFormData({
      typeArticle: tarif.typeArticle,
      service: tarif.service,
      prix: String(tarif.prix),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setTarifs(tarifs.filter(t => t.id !== id));
    toast({ title: "Tarif supprimé", description: "Le tarif a été supprimé avec succès" });
  };

  const typesArticles = [...new Set(tarifs.map(t => t.typeArticle))];
  const services = [...new Set(tarifs.map(t => t.service))];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Paramètres</h1>
          <p className="text-muted-foreground">Gérez les tarifs et configurations</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingTarif(null);
            setFormData({ typeArticle: "", service: "", prix: "" });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-primary shadow-md hover:shadow-lg">
              <Plus className="h-4 w-4" />
              Nouveau Tarif
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTarif ? "Modifier le tarif" : "Ajouter un tarif"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="typeArticle">Type d'article</Label>
                <Input
                  id="typeArticle"
                  value={formData.typeArticle}
                  onChange={(e) => setFormData({ ...formData, typeArticle: e.target.value })}
                  placeholder="Ex: Chemise, Pantalon..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service">Service</Label>
                <Input
                  id="service"
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  placeholder="Ex: Nettoyage, Repassage..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prix">Prix (FCFA)</Label>
                <Input
                  id="prix"
                  type="number"
                  value={formData.prix}
                  onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
                  placeholder="0"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-primary">
                {editingTarif ? "Modifier" : "Ajouter"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gradient-card p-6 shadow-md">
          <p className="text-sm text-muted-foreground">Total Tarifs</p>
          <p className="text-3xl font-bold text-foreground">{tarifs.length}</p>
        </Card>
        <Card className="bg-gradient-card p-6 shadow-md">
          <p className="text-sm text-muted-foreground">Types d'articles</p>
          <p className="text-3xl font-bold text-foreground">{typesArticles.length}</p>
        </Card>
        <Card className="bg-gradient-card p-6 shadow-md">
          <p className="text-sm text-muted-foreground">Services</p>
          <p className="text-3xl font-bold text-foreground">{services.length}</p>
        </Card>
      </div>

      {/* Tarifs Table */}
      <Card className="bg-gradient-card shadow-md">
        <div className="p-6">
          <h2 className="mb-4 text-xl font-bold text-foreground">Liste des tarifs</h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type d'article</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead className="text-right">Prix (FCFA)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tarifs.map((tarif) => (
                  <TableRow key={tarif.id}>
                    <TableCell className="font-medium">{tarif.typeArticle}</TableCell>
                    <TableCell>{tarif.service}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {tarif.prix.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(tarif)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(tarif.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>
    </div>
  );
}
