import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { getRoles } from "@/services/auth.service.ts";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [role, setRole] = useState<string>("COMPTOIR");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const data = await getRoles();
        setRole(data?.role || "COMPTOIR");
        localStorage.setItem("role", data?.role || "COMPTOIR");
      } catch (error) {
        console.error("Erreur récupération rôle :", error);
        setRole("COMPTOIR");
      }
    };
    fetchRole();
  }, []);

  const handleProfileClick = () => navigate("/compte");

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* 
         On passe les props nécessaires à la Sidebar.
         Note: Le cast 'as any' n'est pas idéal en TS strict, mais je le laisse pour matcher ton code.
      */}
      <Sidebar {...({ isCollapsed, setIsCollapsed } as unknown as any)} />

      <div
        className={cn(
          "flex flex-col flex-1 transition-all duration-300",
          // DESKTOP : Marge à gauche selon si la sidebar est pliée ou non
          isCollapsed ? "lg:ml-20" : "lg:ml-64",
          // MOBILE : Padding en haut (pt-16) pour ne pas être caché sous le header de la Sidebar
          "pt-16 lg:pt-0" 
        )}
      >
        {/* 
           HEADER DU CONTENU (Cloche + Profil)
           - Sur Mobile : Il scrolle avec la page (pas sticky) pour éviter d'avoir 2 barres fixes.
           - Sur Desktop : Il reste collé en haut (sticky).
        */}
        <header className="flex items-center justify-between bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 shadow-sm lg:sticky lg:top-0 z-20">
          <div className="flex-1 flex items-center justify-end sm:justify-between max-w-full mx-auto">
            
            {/* Titre (visible uniquement sur écran moyen/large pour gagner de la place sur mobile) */}
            <h1 className="hidden sm:block text-lg font-bold text-gray-800 dark:text-white truncate">
              {/* Tu peux mettre un titre dynamique ici si besoin */}
            </h1>

            <div className="flex items-center gap-3 sm:gap-4">
              {/* Notification Bell */}
              <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 animate-pulse ring-2 ring-white dark:ring-gray-900"></span>
              </button>

              {/* Profile Badge */}
              <div
                onClick={handleProfileClick}
                className="flex items-center gap-2 pl-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-sm shadow-sm">
                  {role[0]?.toUpperCase()}
                </div>
                <span className="hidden sm:inline text-sm text-gray-700 dark:text-gray-300 font-medium truncate uppercase max-w-[100px]">
                  {role}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENU PRINCIPAL */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 sm:p-6 min-h-[calc(100vh-8rem)]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}