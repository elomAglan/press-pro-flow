import React, { useState, useMemo, useEffect } from "react";
import * as XLSX from "xlsx";
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
import { 
  Search, Plus, Pencil, Trash, FileText, 
  Phone, MapPin, FileSpreadsheet, User
} from "lucide-react";
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
        console.error("Impossible de charger les clients");
      } finally {
        setIsLoading(false);
      }
    };
    fetchClients();
  }, []);

  // ========= LOGIQUE FILTRE & TRI =========
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
    return requiredStatus ? filtered.filter((c) => c.status === requiredStatus) : filtered;
  }, [clients, searchTerm, filterBy]);

  const sortedClients = useMemo(
    () => [...filteredClients].sort((a, b) => b.id - a.id),
    [filteredClients]
  );

  // ========= ACTIONS =========
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({ nom: client.nom, telephone: client.telephone, adresse: client.adresse });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Confirmer la suppression ?")) return;
    try {
      await deleteClient(id);
      setClients(clients.filter((c) => c.id !== id));
    } catch {
      alert("Erreur : Ce client est probablement lié à des commandes.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingClient) {
        const updated = await updateClient(editingClient.id, formData);
        setClients(clients.map((c) => c.id === editingClient.id ? { ...c, ...formData, status: updated.statutClient || c.status } : c));
      } else {
        const newClient = await createClient(formData);
        setClients([...clients, { ...newClient, date: newClient.date || new Date().toISOString(), status: newClient.statutClient || "Actif" }]);
      }
      setFormData(emptyFormData);
      setEditingClient(null);
      setIsDialogOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  // ========= EXPORTS =========
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Liste des Clients", 14, 15);
    autoTable(doc, {
      head: [["#", "Nom", "Téléphone", "Adresse", "Statut"]],
      body: sortedClients.map((c, i) => [sortedClients.length - i, c.nom, c.telephone, c.adresse, c.status]),
      startY: 20,
    });
    doc.save(`clients_${Date.now()}.pdf`);
  };

  const exportExcel = () => {
    const data = sortedClients.map((c, i) => ({
      ID: sortedClients.length - i,
      Nom: c.nom,
      Telephone: c.telephone,
      Adresse: c.adresse,
      Statut: c.status,
      Date: new Date(c.date).toLocaleDateString()
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Clients");
    XLSX.writeFile(wb, `clients_${Date.now()}.xlsx`);
  };

  const getStatusBadge = (status: ClientStatus) => (
    <Badge variant="outline" className={status === "Actif" 
      ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400" 
      : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400"}>
      {status}
    </Badge>
  );

  return (
    /* h-screen + flex-col + overflow-hidden pour bloquer le scroll du navigateur */
    <div className="h-screen flex flex-col p-4 md:p-8 space-y-6 bg-white dark:bg-gray-950 overflow-hidden">
      
      {/* HEADER SECTION (Fixe) */}
      <div className="flex-none flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Annuaire Clients</h1>
          <p className="text-muted-foreground text-sm">{sortedClients.length} clients enregistrés</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={exportPDF} variant="outline" size="sm" className="border-gray-300 dark:border-gray-700">
            <FileText className="w-4 h-4 mr-2 text-red-500" />
            <span className="hidden sm:inline">PDF</span>
          </Button>
          <Button onClick={exportExcel} variant="outline" size="sm" className="border-gray-300 dark:border-gray-700">
            <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
            <span className="hidden sm:inline">Excel</span>
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 shadow-md">
                <Plus className="w-4 h-4 mr-2" /> Nouveau
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingClient ? "Modifier le profil" : "Nouveau client"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom complet</Label>
                  <Input id="nom" value={formData.nom} onChange={handleFormChange} required placeholder="Jean Dupont" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telephone">Téléphone</Label>
                  <Input id="telephone" type="tel" value={formData.telephone} onChange={handleFormChange} required placeholder="06..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adresse">Adresse</Label>
                  <Input id="adresse" value={formData.adresse} onChange={handleFormChange} required placeholder="Quartier, Rue..." />
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full mt-2 bg-blue-600 hover:bg-blue-700">
                    {editingClient ? "Mettre à jour" : "Enregistrer le client"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* SEARCH BAR (Fixe) */}
      <div className="flex-none relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
        <Input
          placeholder="Rechercher par nom ou téléphone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-12 rounded-xl shadow-sm border-gray-200 dark:border-gray-800 focus-visible:ring-blue-500"
        />
      </div>

      {/* CONTENU SCROLLABLE (Interne) */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {/* MOBILE: CARDS VIEW */}
            <div className="grid grid-cols-1 gap-4 md:hidden pb-10">
              {sortedClients.map((c, index) => (
                <Card key={c.id} className="p-4 border-gray-100 dark:border-gray-800 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm">{c.nom}</h3>
                        <p className="text-[10px] text-muted-foreground uppercase">ID #{sortedClients.length - index}</p>
                      </div>
                    </div>
                    {getStatusBadge(c.status)}
                  </div>
                  <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex items-center"><Phone className="w-3.5 h-3.5 mr-2" /> {c.telephone}</div>
                    <div className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-2" /> {c.adresse}</div>
                  </div>
                  <div className="flex gap-2 pt-2 border-t dark:border-gray-800">
                    <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs" onClick={() => handleEdit(c)}>
                      <Pencil className="w-3 h-3 mr-1.5" /> Modifier
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs text-red-500" onClick={() => handleDelete(c.id)}>
                      <Trash className="w-3 h-3 mr-1.5" /> Supprimer
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* DESKTOP: TABLE VIEW */}
            <div className="hidden md:block rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-800/50 sticky top-0 z-10">
                  <tr>
                    {["#", "Client", "Contact", "Localisation", "Statut", "Actions"].map((h) => (
                      <th key={h} className="px-6 py-4 text-left text-xs font-semibold uppercase text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {sortedClients.map((c, index) => (
                    <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-muted-foreground">{sortedClients.length - index}</td>
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100">{c.nom}</td>
                      <td className="px-6 py-4 text-sm">{c.telephone}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{c.adresse}</td>
                      <td className="px-6 py-4">{getStatusBadge(c.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(c)}><Pencil className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => handleDelete(c.id)}><Trash className="w-4 h-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {sortedClients.length === 0 && (
              <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/40 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                <p className="text-muted-foreground">Aucun client trouvé dans la base.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Petit composant Loader pour l'état de chargement
function Loader2({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}