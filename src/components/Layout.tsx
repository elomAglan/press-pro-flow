import { useState, useEffect, useRef } from "react";
import { Sidebar } from "./Sidebar";
import { Bell, LogOut, User, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { getRoles } from "@/services/auth.service.ts";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [role, setRole] = useState<string>("COMPTOIR");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const data = await getRoles();
        const userRole = data?.role || "COMPTOIR";
        setRole(userRole);
        localStorage.setItem("role", userRole);
      } catch (error) {
        setRole("COMPTOIR");
      }
    };
    fetchRole();

    // Fermer le menu si on clique à l'extérieur
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login"); // Changé de "/" à "/login"
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar {...({ isCollapsed, setIsCollapsed } as any)} />

      <div className={cn("flex flex-col flex-1 transition-all duration-300", isCollapsed ? "lg:ml-20" : "lg:ml-72")}>
        <header className="flex items-center justify-between bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-8 py-3 shadow-sm sticky top-0 z-40">
          <div className="flex-1 flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-800 dark:text-white truncate"></h1>

            <div className="flex items-center gap-4">
              {/* NOTIFICATIONS */}
              <button className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Bell className="h-5 w-5 text-gray-500" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white dark:border-gray-900"></span>
              </button>

              {/* PROFIL DROPDOWN */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className={cn(
                    "flex items-center gap-3 p-1.5 pr-3 rounded-2xl transition-all",
                    showProfileMenu ? "bg-gray-100 dark:bg-gray-800" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  )}
                >
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 uppercase">
                    {role[0]}
                  </div>
                  <div className="hidden sm:flex flex-col items-start leading-tight">
                    <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tighter">
                      {role}
                    </span>
                    <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Connecté</span>
                  </div>
                  <ChevronDown size={14} className={cn("text-gray-400 transition-transform", showProfileMenu && "rotate-180")} />
                </button>

                {/* LA PETITE CARD (DROPDOWN) */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 py-2 z-50 animate-in fade-in zoom-in duration-200">
                    <div className="px-4 py-3 border-b border-gray-50 dark:border-gray-800 mb-2">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Session</p>
                    </div>
                    
                    <button
                      onClick={() => { navigate("/compte"); setShowProfileMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <User size={18} />
                      Mon Compte
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-1"
                    >
                      <LogOut size={18} />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Espace pour le header mobile si nécessaire */}
        <div className="h-[52px] lg:hidden" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}