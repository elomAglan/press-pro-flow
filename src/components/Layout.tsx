import { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  // Clic sur le profil → tous vers /compte
  const handleProfileClick = () => {
    navigate("/compte");
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <Sidebar {...({ isCollapsed, setIsCollapsed } as unknown as any)} />

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
              {/* Titre dynamique si nécessaire */}
            </h1>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
              </button>

              {/* Profil cliquable */}
              <div
                onClick={handleProfileClick}
                className="flex items-center gap-2 p-1 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
