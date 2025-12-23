import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Edit, Save, UserPlus, X, User, ShieldCheck, Mail, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { signup, getComptes, updateCompte, deleteCompte } from "@/services/auth.service.ts";

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
  const [isLoading, setIsLoading] = useState(false);

  const role = localStorage.getItem("role") || "COMPTOIR";
  const isAdmin = role === "ADMIN" || role === "ADMINISTRATEUR";

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getComptes();
      setUsers(data);
    } catch (err) {
      console.error("Erreur récupération comptes :", err);
    } finally {
      setIsLoading(false);
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
    if (!isAdmin) return;
    setEmail(user.email);
    setPassword("");
    setRoleValue(user.role);
    setEditingId(user.id);
    setIsAddingUser(false);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    if (!isAdmin) return;
    resetForm();
    setIsAddingUser(true);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!isAdmin) return;
    try {
      setError("");
      if (!email) return setError("L'email est requis");

      if (isAddingUser) {
        if (!password) return setError("Le mot de passe est requis");
        await signup(email, password, roleValue);
      } else {
        if (!editingId) return setError("ID utilisateur manquant");
        await updateCompte(editingId, email, password, roleValue);
      }

      resetForm();
      setIsDialogOpen(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la sauvegarde");
    }
  };

  const handleDelete = async (id: number) => {
    if (!isAdmin) return;
    if (!window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) return;
    try {
      await deleteCompte(id);
      fetchUsers();
    } catch (err) {
      console.error("Erreur suppression :", err);
    }
  };

  return (
    <div className="h-screen flex flex-col p-4 md:p-8 space-y-6 bg-white dark:bg-gray-950 overflow-hidden max-w-7xl mx-auto">
      
      {/* HEADER SECTION */}
      <div className="flex-none flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
              <User size={24} />
            </div>
            Gestion des Comptes
          </h1>
          <p className="text-muted-foreground text-sm">{users.length} utilisateurs enregistrés</p>
        </div>

        {isAdmin && (
          <Button 
            onClick={handleAdd} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
          >
            <UserPlus size={20} /> Ajouter un compte
          </Button>
        )}
      </div>

      {/* ZONE SCROLLABLE */}
      <div className="flex-1 overflow-y-auto scrollbar-thin pr-1 -mr-1">
        {isLoading ? (
          <div className="flex justify-center py-20 animate-pulse text-blue-600">Chargement des comptes...</div>
        ) : (
          <>
            {/* VUE MOBILE (Cartes) */}
            <div className="grid grid-cols-1 gap-4 md:hidden pb-10">
              {users.map(user => (
                <div key={user.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
                        <Mail size={18} className="text-gray-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate max-w-[150px]">{user.email}</h3>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                          user.role.toUpperCase() === "ADMIN" ? "bg-red-100 text-red-600 dark:bg-red-900/30" : "bg-green-100 text-green-600 dark:bg-green-900/30"
                        }`}>
                          {user.role}
                        </span>
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(user)} className="text-indigo-600 h-8 w-8">
                          <Edit size={16} />
                        </Button>
                        {user.role.toUpperCase() !== "ADMIN" && (
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)} className="text-red-600 h-8 w-8">
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 italic">
                    <Lock size={12} /> Mot de passe protégé
                  </div>
                </div>
              ))}
            </div>

            {/* VUE DESKTOP (Tableau) */}
            <div className="hidden md:block rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-gray-800/50 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="font-bold">Utilisateur (Email)</TableHead>
                    <TableHead className="font-bold">Sécurité</TableHead>
                    <TableHead className="font-bold">Rôle</TableHead>
                    {isAdmin && <TableHead className="text-right font-bold">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10">
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-gray-400 text-xs italic">
                          <Lock size={14} /> ••••••••
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          user.role.toUpperCase() === "ADMIN" 
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" 
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        }`}>
                          <ShieldCheck size={12} />
                          {user.role.toUpperCase() === "ADMIN" ? "Administrateur" : "Comptoir"}
                        </span>
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="icon" onClick={() => handleEdit(user)} className="h-8 w-8 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30">
                              <Edit size={14} className="text-indigo-600" />
                            </Button>
                            {user.role.toUpperCase() !== "ADMIN" && (
                              <Button variant="outline" size="icon" onClick={() => handleDelete(user.id)} className="h-8 w-8 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30">
                                <Trash2 size={14} className="text-red-600" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>

      {/* DIALOG MODAL */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">
              {isAddingUser ? "Créer un compte" : "Modifier le compte"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-2 rounded-xl text-sm italic">{error}</div>}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase text-gray-500">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="rounded-xl border-none bg-gray-100 dark:bg-gray-700" placeholder="exemple@mail.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold uppercase text-gray-500">
                Mot de passe {!isAddingUser && <span className="lowercase font-normal">(laisser vide pour inchangé)</span>}
              </Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="rounded-xl border-none bg-gray-100 dark:bg-gray-700" placeholder="••••••••" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-xs font-bold uppercase text-gray-500">Permissions</Label>
              <Select value={roleValue} onValueChange={setRoleValue}>
                <SelectTrigger className="rounded-xl border-none bg-gray-100 dark:bg-gray-700">
                  <SelectValue placeholder="Rôle" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="ADMIN">Administrateur (Tous les droits)</SelectItem>
                  <SelectItem value="COMPTOIR">Comptoir (Ventes uniquement)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl font-bold">Annuler</Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-8 shadow-lg shadow-blue-600/20">
              <Save size={16} className="mr-2" /> 
              {isAddingUser ? "Créer" : "Mettre à jour"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}