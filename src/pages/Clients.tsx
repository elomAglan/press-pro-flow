import React, { useState, useMemo, useEffect } from "react";
import {
  getAllClients,
  createClient,
  updateClient,
  deleteClient,
} from "@/services/client.service.ts";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Pencil, Trash, FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type ClientStatus = "Actif" | "Inactif";

interface Client {
  id: number;
  nom: string;
  telephone: string;
  adresse: string;
  date: string;
  status: ClientStatus;
}

const emptyFormData = { nom: "", telephone: "", adresse: "" };
type FilterType = "all" | "actif" | "inactive";

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState(emptyFormData);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [filterBy, setFilterBy] = useState<FilterType>("all");
  const [isLoading, setIsLoading] = useState(false);

  // ========= FETCH CLIENTS =========
  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      try {
        const data = await getAllClients();
        setClients(
          data.map((c: any) => ({
            id: c.id,
            nom: c.nom,
            telephone: c.telephone,
            adresse: c.adresse,
            date: c.date,
            status: c.statutClient || "Actif",
          }))
        );
      } catch {
        alert("Impossible de charger les clients");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, []);

  // ========= FILTRE + RECHERCHE =========

  const statusMap: Record<FilterType, ClientStatus | null> = {
    all: null,
    actif: "Actif",
    inactive: "Inactif",
  };

  const filteredClients = useMemo(() => {
    const filtered = clients.filter(
      (c) =>
        c.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.telephone.includes(searchTerm)
    );

    const requiredStatus = statusMap[filterBy];
    return requiredStatus
      ? filtered.filter((c) => c.status === requiredStatus)
      : filtered;
  }, [clients, searchTerm, filterBy]);

  // ========= TRI EN ORDRE DÉCROISSANT (5 → 4 → 3 → 2 → 1) =========
  const sortedClients = useMemo(
    () => [...filteredClients].sort((a, b) => b.id - a.id),
    [filteredClients]
  );

  // ========= FORM HANDLERS =========

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      nom: client.nom,
      telephone: client.telephone,
      adresse: client.adresse,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Confirmer la suppression ?")) return;

    try {
      await deleteClient(id);
      setClients(clients.filter((c) => c.id !== id));
    } catch {
      alert("Impossible de supprimer ce client car il est associé à des commandes.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingClient) {
        const updated = await updateClient(editingClient.id, formData);

        setClients(
          clients.map((c) =>
            c.id === editingClient.id
              ? { ...c, ...formData, status: updated.statutClient || c.status }
              : c
          )
        );
      } else {
        const newClient = await createClient(formData);

        setClients([
          ...clients,
          {
            id: newClient.id,
            nom: newClient.nom,
            telephone: newClient.telephone,
            adresse: newClient.adresse,
            date: newClient.date || new Date().toISOString(),
            status: newClient.statutClient || "Actif",
          },
        ]);
      }

      setFormData(emptyFormData);
      setEditingClient(null);
      setIsDialogOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  // ========= BADGES =========
  const getStatusBadge = (status: ClientStatus) =>
    status === "Actif" ? (
      <Badge className="bg-green-500 text-white">Actif</Badge>
    ) : (
      <Badge className="bg-red-500 text-white">Inactif</Badge>
    );

  // ========= EXPORT PDF =========
  const exportPDF = () => {
    const doc = new jsPDF();
    const exportDate = new Date().toLocaleString();

    doc.setFontSize(18);
    doc.text("Liste des Clients", 14, 20);
    doc.setFontSize(11);
    doc.text(`Exporté le : ${exportDate}`, 14, 28);

    autoTable(doc, {
      head: [["#", "Nom", "Téléphone", "Adresse", "Statut", "Date"]],
      body: sortedClients.map((c, index) => [
        index + 1,
        c.nom,
        c.telephone,
        c.adresse,
        c.status,
        new Date(c.date).toLocaleDateString(),
      ]),
      startY: 35,
    });

    doc.save(`clients_${Date.now()}.pdf`);
  };

  // ========= RENDER =========

  return (
    <div className="p-4 space-y-6 dark:bg-gray-900 dark:text-gray-100 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Clients ({sortedClients.length})
        </h1>

        <div className="flex gap-2">
          <Button
            onClick={exportPDF}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <FileText className="w-4 h-4 mr-2" /> Export PDF
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" /> Nouveau Client
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingClient ? "Modifier Client" : "Ajouter Client"}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Nom</Label>
                  <Input
                    id="nom"
                    value={formData.nom}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div>
                  <Label>Téléphone</Label>
                  <Input
                    id="telephone"
                    value={formData.telephone}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div>
                  <Label>Adresse</Label>
                  <Input
                    id="adresse"
                    value={formData.adresse}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <DialogFooter>
                  <Button type="submit" className="bg-blue-600 text-white w-full">
                    {editingClient ? "Sauvegarder" : "Ajouter"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Rechercher client…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading && (
        <p className="text-center text-gray-500">Chargement…</p>
      )}

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="min-w-full border rounded-lg dark:border-gray-700 bg-white dark:bg-gray-800">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Nom</th>
              <th className="px-4 py-3 text-left">Téléphone</th>
              <th className="px-4 py-3 text-left">Adresse</th>
              <th className="px-4 py-3 text-left">Statut</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>

         <tbody>
  {sortedClients.map((c, index) => (
    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
      {/* Ici on change index + 1 en décroissant */}
      <td className="px-4 py-3">{sortedClients.length - index}</td>
      <td className="px-4 py-3">{c.nom}</td>
      <td className="px-4 py-3">{c.telephone}</td>
      <td className="px-4 py-3">{c.adresse}</td>
      <td className="px-4 py-3">{getStatusBadge(c.status)}</td>
      <td className="px-4 py-3">{new Date(c.date).toLocaleDateString()}</td>
      <td className="px-4 py-3 flex gap-2">
        <Button size="sm" variant="outline" onClick={() => handleEdit(c)}>
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-red-600"
          onClick={() => handleDelete(c.id)}
        >
          <Trash className="w-4 h-4" />
        </Button>
      </td>
    </tr>
  ))}
</tbody>

        </table>

        {sortedClients.length === 0 && !isLoading && (
          <p className="text-center text-gray-500 py-6">
            Aucun client trouvé
          </p>
        )}
      </div>
    </div>
  );
}
