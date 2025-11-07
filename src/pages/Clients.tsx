import React, { useState, useMemo, useEffect } from "react";
import { getAllClients, createClient, updateClient, deleteClient } from "@/services/client.service.ts";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Pencil, Trash, Download, X, Users, Star, UserX } from "lucide-react";

type ClientStatus = 'Actif' | 'Inactif';

interface Client {
  id: number;
  nom: string;
  telephone: string;
  adresse: string;
  date: string;
  status: ClientStatus;
}

const emptyFormData = { nom: "", telephone: "", adresse: "" };
type FilterType = 'all' | 'actif' | 'inactive';

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState(emptyFormData);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [filterBy, setFilterBy] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState(false);

  // --- CHARGEMENT DES CLIENTS DEPUIS L'API ---
  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      try {
        const data = await getAllClients();
        const transformed = data.map((c: any) => ({
          id: c.id,
          nom: c.nom,
          telephone: c.telephone,
          adresse: c.adresse,
          date: c.date,
          status: c.statutClient || "Actif",
        }));
        setClients(transformed);
      } catch (err) {
        console.error("Erreur récupération clients :", err);
        alert("Impossible de charger les clients");
      } finally {
        setIsLoading(false);
      }
    };
    fetchClients();
  }, []);

  // --- FILTRAGE ---
  const statusMap: Record<FilterType, ClientStatus | null> = {
    'all': null,
    'actif': 'Actif',
    'inactive': 'Inactif'
  };

  const filteredClients = useMemo(() => {
    const searchFiltered = clients.filter(
      client =>
        client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.telephone.includes(searchTerm)
    );
    const requiredStatus = statusMap[filterBy];
    return requiredStatus ? searchFiltered.filter(c => c.status === requiredStatus) : searchFiltered;
  }, [clients, searchTerm, filterBy]);

  // --- FORMULAIRE ---
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({ nom: client.nom, telephone: client.telephone, adresse: client.adresse });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) return;
    
    try {
      await deleteClient(id);
      setClients(clients.filter(c => c.id !== id));
    } catch (err) {
      console.error("Erreur suppression client :", err);
      alert("Impossible de supprimer le client");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingClient) {
        // Mise à jour
        const updated = await updateClient(editingClient.id, formData);
        setClients(clients.map(c => c.id === editingClient.id 
          ? { ...c, ...formData, status: updated.statutClient || c.status } 
          : c
        ));
      } else {
        // Création
        const newClient = await createClient(formData);
        const clientToAdd: Client = {
          id: newClient.id,
          nom: newClient.nom,
          telephone: newClient.telephone,
          adresse: newClient.adresse,
          date: newClient.date || new Date().toISOString(),
          status: newClient.statutClient || "Actif"
        };
        setClients([...clients, clientToAdd]);
      }
      
      setFormData(emptyFormData);
      setEditingClient(null);
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Erreur sauvegarde client :", err);
      alert("Impossible de sauvegarder le client");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: ClientStatus) => 
    status === "Actif"
      ? <Badge className="bg-green-500 text-green-900">Actif</Badge>
      : <Badge className="bg-red-100 text-red-700">Inactif</Badge>;

  const handleExport = () => {
    const headers = ["ID","Nom","Téléphone","Adresse","Statut","Date"];
    const csvRows = filteredClients.map(c => [
      c.id, c.nom, c.telephone, c.adresse, c.status, new Date(c.date).toLocaleDateString()
    ].map(f => `"${f}"`).join(','));
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'clients.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Clients</h1>
        <div className="flex gap-2">
          <Button onClick={handleExport} className="bg-yellow-500 hover:bg-yellow-600 text-white">
            <Download className="w-4 h-4 mr-2" />
            Exporter CSV
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau Client
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingClient ? "Modifier Client" : "Ajouter Client"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nom">Nom</Label>
                  <Input id="nom" value={formData.nom} onChange={handleFormChange} required />
                </div>
                <div>
                  <Label htmlFor="telephone">Téléphone</Label>
                  <Input id="telephone" value={formData.telephone} onChange={handleFormChange} required />
                </div>
                <div>
                  <Label htmlFor="adresse">Adresse</Label>
                  <Input id="adresse" value={formData.adresse} onChange={handleFormChange} required />
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white w-full" disabled={isLoading}>
                    {isLoading ? "Chargement..." : editingClient ? "Sauvegarder" : "Ajouter"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        <Input 
          placeholder="Rechercher par nom ou téléphone..." 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading && <p className="text-center text-gray-500">Chargement...</p>}

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 bg-white rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nom</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Téléphone</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Adresse</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Statut</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredClients.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{c.id}</td>
                <td className="px-4 py-3 text-sm font-medium">{c.nom}</td>
                <td className="px-4 py-3 text-sm">{c.telephone}</td>
                <td className="px-4 py-3 text-sm">{c.adresse}</td>
                <td className="px-4 py-3 text-sm">{getStatusBadge(c.status)}</td>
                <td className="px-4 py-3 text-sm">{new Date(c.date).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleEdit(c)} 
                      size="sm" 
                      variant="outline"
                      className="hover:bg-blue-50"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button 
                      onClick={() => handleDelete(c.id)} 
                      size="sm" 
                      variant="outline"
                      className="hover:bg-red-50 text-red-600"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredClients.length === 0 && !isLoading && (
          <p className="text-center text-gray-500 py-8">Aucun client trouvé</p>
        )}
      </div>
    </div>
  );
}