import React, { useState, useMemo, useEffect } from "react";
import { apiFetch } from "@/services/api"; // <-- ton service centralisé
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

  // --- CHARGEMENT DES CLIENTS DEPUIS L'API ---
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await apiFetch("/auth/comptes"); // <-- endpoint réel
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

  const handleDelete = (id: number) => {
    setClients(clients.filter(c => c.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) {
      setClients(clients.map(c => c.id === editingClient.id ? { ...c, ...formData } : c));
    } else {
      const newClient: Client = {
        id: clients.length + 1,
        ...formData,
        date: new Date().toISOString(),
        status: "Actif"
      };
      setClients([...clients, newClient]);
    }
    setFormData(emptyFormData);
    setEditingClient(null);
    setIsDialogOpen(false);
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
          <Button onClick={handleExport} className="bg-yellow-500 hover:bg-yellow-600 text-white">Exporter CSV</Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Nouveau Client</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingClient ? "Modifier Client" : "Ajouter Client"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-2">
                <Label htmlFor="nom">Nom</Label>
                <Input id="nom" value={formData.nom} onChange={handleFormChange} required />
                <Label htmlFor="telephone">Téléphone</Label>
                <Input id="telephone" value={formData.telephone} onChange={handleFormChange} required />
                <Label htmlFor="adresse">Adresse</Label>
                <Input id="adresse" value={formData.adresse} onChange={handleFormChange} required />
                <DialogFooter>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white w-full">
                    {editingClient ? "Sauvegarder" : "Ajouter"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Input placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />

      <table className="min-w-full mt-4 border border-gray-200">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Téléphone</th>
            <th>Adresse</th>
            <th>Statut</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredClients.map(c => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.nom}</td>
              <td>{c.telephone}</td>
              <td>{c.adresse}</td>
              <td>{getStatusBadge(c.status)}</td>
              <td>{new Date(c.date).toLocaleDateString()}</td>
              <td className="flex gap-2">
                <Button onClick={() => handleEdit(c)}>✏️</Button>
                <Button onClick={() => handleDelete(c.id)}>🗑️</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
