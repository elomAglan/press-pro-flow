import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Edit, Save, UserPlus, X, User, ShieldCheck, Mail, Lock, RefreshCw } from "lucide-react";
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
    <div className="space-y-8 pb-24">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200 dark:shadow-none">
            <User size={24} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
              Gestion des Comptes
            </h1>
            <p className="text-sm text-gray-500 font-medium italic">{users.length} accès configurés</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={fetchUsers} 
            className="p-3.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-gray-400 hover:text-blue-600 transition-all shadow-sm active:rotate-180 duration-500"
          >
            <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
          </button>
          
          {isAdmin && (
            <Button 
              onClick={handleAdd} 
              className="flex-1 md:flex-none h-12 bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-2xl font-black shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <UserPlus size={20} /> <span className="hidden sm:inline">Nouveau compte</span><span className="sm:hidden">Ajouter</span>
            </Button>
          )}
        </div>
      </div>

      {/* ZONE DE CONTENU */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Synchronisation...</p>
        </div>
      ) : (
        <>
          {/* VUE MOBILE (CARDS) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {users.map(user => (
              <div key={user.id} className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <Mail size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 dark:text-white text-lg truncate max-w-[180px]">{user.email}</h3>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                        user.role.toUpperCase() === "ADMIN" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                      }`}>
                        <ShieldCheck size={10} />
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold mb-6">
                   <Lock size={12} /> SESSION SÉCURISÉE
                </div>

                {isAdmin && (
                  <div className="flex gap-2 pt-4 border-t border-gray-50 dark:border-gray-800">
                    <Button onClick={() => handleEdit(user)} className="flex-1 bg-indigo-50 text-indigo-600 font-black rounded-xl h-10 border-none">Modifier</Button>
                    {user.role.toUpperCase() !== "ADMIN" && (
                      <Button onClick={() => handleDelete(user.id)} className="bg-red-50 text-red-600 font-black rounded-xl h-10 border-none"><Trash2 size={16}/></Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* VUE DESKTOP (TABLEAU) */}
          <div className="hidden md:block bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
                <TableRow>
                  <TableHead className="px-8 py-6 font-black uppercase text-[11px] text-gray-400 tracking-widest">Utilisateur</TableHead>
                  <TableHead className="px-8 py-6 font-black uppercase text-[11px] text-gray-400 tracking-widest text-center">Rôle</TableHead>
                  <TableHead className="px-8 py-6 font-black uppercase text-[11px] text-gray-400 tracking-widest text-center">Statut</TableHead>
                  {isAdmin && <TableHead className="px-8 py-6 font-black uppercase text-[11px] text-gray-400 tracking-widest text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user.id} className="hover:bg-blue-50/30 transition-colors border-gray-50 dark:border-gray-800">
                    <TableCell className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-black text-gray-900 dark:text-white text-lg">{user.email}</span>
                        <span className="text-xs text-gray-400 italic">Compte actif</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter ${
                        user.role.toUpperCase() === "ADMIN" 
                        ? "bg-red-50 text-red-600" 
                        : "bg-emerald-50 text-emerald-600"
                      }`}>
                        <ShieldCheck size={14} />
                        {user.role === "ADMIN" ? "Administrateur" : "Comptoir"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                       <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
                          <Lock size={14} /> ••••••••
                       </div>
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-3">
                          <Button variant="ghost" onClick={() => handleEdit(user)} className="h-11 w-11 rounded-xl text-indigo-600 bg-indigo-50"><Edit size={18} /></Button>
                          {user.role.toUpperCase() !== "ADMIN" && (
                            <Button variant="ghost" onClick={() => handleDelete(user.id)} className="h-11 w-11 rounded-xl text-red-600 bg-red-50"><Trash2 size={18} /></Button>
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

      {/* BOUTON FLOTTANT MOBILE */}
      {isAdmin && (
        <button
          onClick={handleAdd}
          className="md:hidden fixed bottom-8 right-8 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50 active:scale-90 transition-transform"
        >
          <UserPlus size={32} />
        </button>
      )}

      {/* DIALOG MODAL (Adapté mobile) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] border-none p-8 dark:bg-gray-900 shadow-2xl overflow-hidden">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
               <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                 <UserPlus size={24} />
               </div>
               {isAddingUser ? "Nouveau Compte" : "Édition"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 px-5 py-3 rounded-2xl text-xs font-bold border-l-4 border-red-500 animate-in fade-in slide-in-from-left-2">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest">Email de connexion</Label>
              <Input value={email} onChange={e => setEmail(e.target.value)} className="h-14 rounded-2xl border-none bg-gray-50 dark:bg-gray-800 text-sm font-bold focus:ring-2 focus:ring-blue-500" placeholder="nom@pressing.com" />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest">
                Mot de passe {!isAddingUser && "(Optionnel)"}
              </Label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} className="h-14 rounded-2xl border-none bg-gray-50 dark:bg-gray-800 text-sm font-bold focus:ring-2 focus:ring-blue-500" placeholder="••••••••" />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest">Niveau de permissions</Label>
              <Select value={roleValue} onValueChange={setRoleValue}>
                <SelectTrigger className="h-14 rounded-2xl border-none bg-gray-50 dark:bg-gray-800 font-bold">
                  <SelectValue placeholder="Choisir un rôle" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-xl">
                  <SelectItem value="ADMIN" className="font-bold py-3 text-red-600">ADMINISTRATEUR (Total)</SelectItem>
                  <SelectItem value="COMPTOIR" className="font-bold py-3 text-emerald-600">COMPTOIR (Ventes)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="mt-10 gap-3">
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="h-14 rounded-2xl font-black text-gray-400 hover:bg-gray-50 uppercase text-xs tracking-widest">Annuler</Button>
            <Button onClick={handleSave} className="h-14 px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-lg shadow-blue-500/30 uppercase text-xs tracking-widest">
              <Save size={18} className="mr-2" /> 
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}