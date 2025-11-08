import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Edit, Save, UserPlus, X, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  signup,
  getComptes,
  updateCompte,
  deleteCompte,
} from "@/services/auth.service.ts";

interface UserType {
  id: number;
  email: string;
  role: string;
  password?: string;
}

export default function Compte() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleValue, setRoleValue] = useState("COMPTOIR");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const role = (localStorage.getItem("role") || "ADMIN").toUpperCase();
  const isAdmin = role === "ADMIN" || role === "ADMINISTRATEUR";

  // 🔹 Charger les utilisateurs au montage
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getComptes();
      setUsers(data);
    } catch (err: any) {
      console.error("❌ Erreur récupération comptes :", err);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setRoleValue("COMPTOIR");
    setEditingId(null);
    setError("");
  };

  const handleEdit = (user: UserType) => {
    setEmail(user.email);
    setPassword("");
    setRoleValue(user.role);
    setEditingId(user.id);
    setIsAddingUser(false);
    setError("");
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    resetForm();
    setIsAddingUser(true);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setError("");

      if (!email) {
        setError("L'email est requis");
        return;
      }

      let response: UserType | null = null;

      if (isAddingUser) {
        if (!password) {
          setError("Le mot de passe est requis");
          return;
        }
        response = await signup(email, password, roleValue);
        if (response) setUsers((prev) => [...prev, response]);
      } else {
        if (!editingId) {
          setError("ID utilisateur manquant");
          return;
        }
        response = await updateCompte(editingId, email, password, roleValue);
        if (response)
          setUsers((prev) =>
            prev.map((u) => (u.id === editingId ? response! : u))
          );
      }

      resetForm();
      setIsDialogOpen(false);
      await fetchUsers();
    } catch (err: any) {
      console.error("❌ Erreur sauvegarde :", err);
      setError(err.message || "Erreur lors de la sauvegarde");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      if (!window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?"))
        return;
      await deleteCompte(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err: any) {
      console.error("❌ Erreur suppression :", err);
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 text-center flex items-center justify-center gap-3">
        <User size={30} className="text-blue-600" /> Gestion des Comptes
      </h1>

      <Card className="p-6 shadow-xl">
        <Table>
          <TableCaption>Liste des comptes utilisateurs</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Mot de passe</TableHead>
              <TableHead>Rôle</TableHead>
              {isAdmin && (
                <TableHead className="text-right w-[150px]">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {users.map((user) => {
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
                        userRole === "ADMIN"
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {userRole === "ADMIN" ? "Administrateur" : "Comptoir"}
                    </span>
                  </TableCell>

                  {isAdmin && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(user)}
                          title="Modifier"
                        >
                          <Edit size={16} className="text-yellow-500" />
                        </Button>

                        {userRole !== "ADMIN" && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(user.id)}
                            title="Supprimer"
                          >
                            <Trash2 size={16} className="text-red-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* ✅ Bouton "Ajouter" visible uniquement pour ADMIN */}
      {isAdmin && (
        <div className="fixed bottom-6 right-6">
          <Button
            onClick={handleAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg p-4 rounded-full flex items-center gap-2"
          >
            <UserPlus size={20} /> Ajouter un compte
          </Button>
        </div>
      )}

      {/* 🔹 Dialogue d'ajout / modification */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {isAddingUser
                ? "Ajouter un nouvel utilisateur"
                : `Modifier : ${email}`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                placeholder="Adresse email"
              />
            </div>

            <div>
              <Label htmlFor="password">
                Mot de passe{" "}
                {!isAddingUser && (
                  <span className="text-gray-500 text-sm">(optionnel)</span>
                )}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                placeholder={
                  isAddingUser
                    ? "Mot de passe initial"
                    : "Laisser vide pour ne pas changer"
                }
              />
            </div>

            <div>
              <Label htmlFor="role">Rôle</Label>
              <Select value={roleValue} onValueChange={setRoleValue}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrateur</SelectItem>
                  <SelectItem value="COMPTOIR">Comptoir</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              <X size={16} className="mr-2" /> Annuler
            </Button>
            <Button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700"
              disabled={!email || (isAddingUser && !password)}
            >
              <Save size={16} className="mr-2" /> Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}