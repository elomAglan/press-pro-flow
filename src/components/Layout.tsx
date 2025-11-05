import { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Bell } from "lucide-react"; // User, Settings, LogOut retirés car non utilisés directement ici
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom"; 

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  // Fonction pour gérer la navigation vers la page de compte (Admin)
  const handleProfileClick = () => {
    // Si l'utilisateur est admin, naviguer vers la gestion des comptes
    if (role === "admin") {
      navigate("/compte"); 
    } else {
      // Optionnel : navigation pour les autres utilisateurs (ex: leur propre profil)
      // navigate("/profil"); 
    }
    // Note: Pour une implémentation complète, vous auriez probablement
    // besoin d'un menu déroulant ici au lieu d'une navigation directe.
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <Sidebar
        {...({ isCollapsed, setIsCollapsed } as unknown as any)}
      />

      {/* Conteneur principal */}
      <div
        className={cn(
          "flex flex-col flex-1 transition-all duration-300",
          isCollapsed ? "lg:ml-20" : "lg:ml-64"
        )}
      >
        {/* Navbar */}
        <header className="flex items-center justify-between bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 lg:px-8 py-3 shadow-sm sticky top-0 z-20 transition-all duration-300">
          <div className="flex-1 flex items-center justify-between max-w-full mx-auto">
            <h1 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white truncate">
              {/* Titre dynamique à venir */}
            </h1>

            <div className="flex items-center gap-4">
              {/* Notification */}
              <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
              </button>

              {/* Profil (Affichage du rôle) - Maintenant cliquable pour Admin */}
              <div 
                onClick={handleProfileClick} // Appel de la fonction de navigation ici
                className={cn(
                    "flex items-center gap-2 p-1 rounded-lg transition-colors",
                    // Ajout du style de clic/survol uniquement si c'est l'admin ou si une autre navigation est définie
                    role === "admin" ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" : "cursor-default" 
                )}
              >
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-semibold">
                  {role ? role[0].toUpperCase() : "U"}
                </div>
                <span className="hidden sm:inline text-gray-700 dark:text-gray-300 font-medium truncate">
                  {role || "Utilisateur"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Ajustement mobile */}
        <div className="h-[52px] lg:hidden" />

        {/* Contenu */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-300">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 sm:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}