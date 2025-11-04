import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Edit, Save, UserPlus, X, User } from "lucide-react";
// Composants de Shadcn UI (à adapter si vous utilisez une autre librairie)
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserType {
  id: number;
  nom: string;
  email: string;
  role: "admin" | "comptoir";
  password: string; // En production, il ne faudrait jamais stocker ou envoyer le mot de passe en clair !
}

const initialUsers: UserType[] = [
  { id: 1, nom: "Admin PressPro", email: "admin@press.com", role: "admin", password: "1234" },
  { id: 2, nom: "Comptoir 1", email: "ab@press.com", role: "comptoir", password: "1234" },
  { id: 3, nom: "Comptoir 2", email: "cd@press.com", role: "comptoir", password: "1234" },
];

// Valeur initiale pour un nouvel utilisateur
const newUserTemplate: Partial<UserType> = {
    nom: "",
    email: "",
    role: "comptoir",
    password: "",
};


export default function Compte() {
  const [users, setUsers] = useState<UserType[]>(initialUsers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [formData, setFormData] = useState<Partial<UserType>>({});

  // Récupération simulée du rôle de l'utilisateur actuel (pour les permissions)
  // En production, cette valeur devrait être gérée de manière sécurisée (ex: Contexte, Redux, JWT)
  const role = localStorage.getItem("role") || "admin"; 

  /**
   * Ouvre la modale pour l'édition d'un utilisateur existant.
   * @param user L'utilisateur à éditer
   */
  const handleEdit = (user: UserType) => {
    setFormData({ ...user });
    setIsAddingUser(false);
    setIsDialogOpen(true);
  };

  /**
   * Ouvre la modale pour l'ajout d'un nouvel utilisateur.
   */
  const handleAdd = () => {
    setFormData(newUserTemplate); // Réinitialise pour l'ajout
    setIsAddingUser(true);
    setIsDialogOpen(true);
  };
  
  /**
   * Met à jour l'état du formulaire (Input).
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  /**
   * Met à jour l'état du formulaire (Select pour le rôle).
   */
  const handleRoleChange = (value: "admin" | "comptoir") => {
    setFormData({ ...formData, role: value });
  };

  /**
   * Gère l'enregistrement des modifications ou l'ajout d'un nouvel utilisateur.
   */
  const handleSave = () => {
    if (isAddingUser) {
        // Logique d'ajout
        const newId = Math.max(...users.map(u => u.id), 0) + 1; // Simple génération d'ID
        const newUser = { ...newUserTemplate, ...formData, id: newId } as UserType;
        setUsers([...users, newUser]);
    } else {
        // Logique de modification
        setUsers(users.map(u => u.id === formData.id ? { ...u, ...formData } as UserType : u));
    }
    
    setIsDialogOpen(false); // Ferme la modale
    setFormData({}); // Réinitialise le formulaire
  };

  /**
   * Gère la suppression d'un utilisateur.
   */
  const handleDelete = (id: number) => {
    if (role !== "admin" || users.find(u => u.id === id)?.role === "admin") return; // Protection
    if (confirm("Voulez-vous vraiment supprimer ce compte ?")) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  // Le formulaire modale d'édition/ajout
  const UserForm = () => (
    <div className="space-y-4">
        <div>
            <Label htmlFor="nom">Nom</Label>
            <Input 
                id="nom" 
                name="nom" 
                value={formData.nom || ''} 
                onChange={handleChange} 
                className="mt-1" 
                placeholder="Nom de l'utilisateur"
                disabled={!isAddingUser} // Le nom n'est éditable que lors de l'ajout (simplification)
            />
        </div>
        <div>
            <Label htmlFor="email">Email</Label>
            <Input 
                id="email" 
                name="email" 
                type="email" 
                value={formData.email || ''} 
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
                value={formData.password || ''} 
                onChange={handleChange} 
                className="mt-1" 
                placeholder={isAddingUser ? "Mot de passe initial" : "Laisser vide pour ne pas changer"}
            />
        </div>
        <div>
            <Label htmlFor="role">Rôle</Label>
            <Select 
                onValueChange={handleRoleChange as (value: string) => void} 
                value={formData.role || "comptoir"}
                disabled={formData.role === "admin" && !isAddingUser} // Empêche la modification du rôle admin principal
            >
                <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="admin">Administrateur</SelectItem>
                    <SelectItem value="comptoir">Comptoir</SelectItem>
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
        {/* Affichage des utilisateurs dans un tableau pour plus de clarté */}
        <Table>
            <TableCaption>Liste des comptes utilisateurs.</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[150px]">Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead className="text-right w-[150px]">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map(user => (
                    <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.nom}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                                {user.role === 'admin' ? 'Administrateur' : 'Comptoir'}
                            </span>
                        </TableCell>
                        <TableCell className="text-right">
                            {role === "admin" && (
                                <div className="flex justify-end gap-2">
                                    <Button 
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleEdit(user)}
                                        title="Modifier"
                                    >
                                        <Edit size={16} className="text-yellow-500" />
                                    </Button>
                                    {user.role !== "admin" && (
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
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
      </Card>
      
      {/* Bouton flottant pour l'ajout d'un nouvel utilisateur (meilleure UX) */}
      {role === "admin" && (
        <div className="fixed bottom-6 right-6">
            <Button
                onClick={handleAdd}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg p-4 rounded-full flex items-center gap-2"
            >
                <UserPlus size={20} /> Ajouter un compte
            </Button>
        </div>
      )}

      {/* Modale d'Édition/Ajout (Dialog) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                  <DialogTitle>{isAddingUser ? "Ajouter un nouvel utilisateur" : `Modifier l'utilisateur: ${formData.nom}`}</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                  <UserForm />
              </div>
              <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      <X size={16} className="mr-2" /> Annuler
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    className="bg-green-600 hover:bg-green-700"
                    disabled={!formData.nom || !formData.email || (isAddingUser && !formData.password)} // Validation de base
                  >
                      <Save size={16} className="mr-2" /> Enregistrer
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}