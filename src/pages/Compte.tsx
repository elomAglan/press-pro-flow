import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Edit, Save, UserPlus, X, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { signup, getComptes } from "@/services/auth.service.ts";

interface UserType {
  id: number;
  email: string;
  role: string; // ADMIN | COMPTOR
  password?: string;
}

const newUserTemplate: Partial<UserType> = {
  email: "",
  role: "COMPTOR",
  password: "",
};

export default function Compte() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [formData, setFormData] = useState<Partial<UserType>>({});
  const role = localStorage.getItem("role") || "ADMIN";

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getComptes();
      setUsers(data);
    } catch (error: any) {
      console.error("Erreur récupération comptes :", error.message);
    }
  };

  const handleEdit = (user: UserType) => {
    setFormData({ ...user });
    setIsAddingUser(false);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setFormData(newUserTemplate);
    setIsAddingUser(true);
    setIsDialogOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (value: string) => {
    setFormData({ ...formData, role: value.toUpperCase() });
  };

  const handleSave = async () => {
    try {
      if (isAddingUser) {
        if (!formData.email || !formData.password) return;
        await signup(formData.email, formData.password!, formData.role!);
      } else {
        console.warn("Modification d'utilisateur non implémentée dans l'API PUT /api/auth/{id}");
        // Ici tu pourrais appeler PUT /api/auth/{id} pour éditer l'utilisateur
      }
      setIsDialogOpen(false);
      setFormData({});
      fetchUsers();
    } catch (error: any) {
      console.error("Erreur sauvegarde :", error.message);
    }
  };

  const handleDelete = (id: number) => {
    console.warn("Suppression via API non implémentée ici");
  };

  const UserForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email || ""}
          onChange={handleChange}
          className="mt-1"
          placeholder="Adresse email"
        />
      </div>
      <div>
        <Label htmlFor="password">Mot de passe</Label>
        <Input
          id="password"
          name="password"
          type="password"
          value={formData.password || ""}
          onChange={handleChange}
          className="mt-1"
          placeholder={isAddingUser ? "Mot de passe initial" : "Laisser vide pour ne pas changer"}
        />
      </div>
      <div>
        <Label htmlFor="role">Rôle</Label>
        <Select
          onValueChange={handleRoleChange as (value: string) => void}
          value={formData.role || "COMPTOR"}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Sélectionner un rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ADMIN">Administrateur</SelectItem>
            <SelectItem value="COMPTOR">Comptoir</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 text-center flex items-center justify-center gap-3">
        <User size={30} className="text-blue-600" /> Gestion des Comptes
      </h1>

      <Card className="p-6 shadow-xl">
        <Table>
          <TableCaption>Liste des comptes utilisateurs.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Mot de passe</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead className="text-right w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(user => {
              const userRole = user.role.toUpperCase();
              return (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className="text-gray-500 italic">••••••••</span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        userRole === "ADMIN" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                      }`}
                    >
                      {userRole === "ADMIN" ? "Administrateur" : "Comptoir"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {role.toUpperCase() === "ADMIN" && (
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleEdit(user)} title="Modifier">
                          <Edit size={16} className="text-yellow-500" />
                        </Button>
                        {userRole !== "ADMIN" && (
                          <Button variant="outline" size="icon" onClick={() => handleDelete(user.id)} title="Supprimer">
                            <Trash2 size={16} className="text-red-500" />
                          </Button>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {role.toUpperCase() === "ADMIN" && (
        <div className="fixed bottom-6 right-6">
          <Button
            onClick={handleAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg p-4 rounded-full flex items-center gap-2"
          >
            <UserPlus size={20} /> Ajouter un compte
          </Button>
        </div>
      )}

<Dialog
  open={isDialogOpen}
  onOpenChange={(open) => {
    setIsDialogOpen(open);
    if (!open) setFormData({}); // reset total quand on ferme
  }}
>
  <DialogContent
    // clé unique pour recréer le formulaire à chaque ouverture
    key={isAddingUser ? "new-user" : `edit-${formData.id || Math.random()}`}
    className="sm:max-w-[425px]"
    aria-describedby="user-form-description"
  >
    <DialogHeader>
      <DialogTitle>
        {isAddingUser ? "Ajouter un nouvel utilisateur" : `Modifier: ${formData.email}`}
      </DialogTitle>
    </DialogHeader>
    <div className="py-4" id="user-form-description">
      <UserForm />
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
        <X size={16} className="mr-2" /> Annuler
      </Button>
      <Button
        onClick={handleSave}
        className="bg-green-600 hover:bg-green-700"
        disabled={!formData.email || (isAddingUser && !formData.password)}
      >
        <Save size={16} className="mr-2" /> Enregistrer
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

    </div>
  );
}
