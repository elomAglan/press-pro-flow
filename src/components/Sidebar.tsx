import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Shirt,
  X,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
  Archive,
  FileText,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getMyPressing } from "../services/pressing.service";

export function Sidebar({
  isCollapsed,
  setIsCollapsed,
}: {
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [pressingLogo, setPressingLogo] = useState<string | null>(null);
  const [pressingName, setPressingName] = useState<string>("");
  const navigate = useNavigate();

  const role = localStorage.getItem("role") || "COMPTOIR";
  const isAdmin = role === "ADMIN" || role === "ADMINISTRATEUR";

  // Logo par défaut
  const DefaultLogo = () => <Shirt className="text-white h-6 w-6" />;

  useEffect(() => {
    const loadPressing = async () => {
      try {
        const p = await getMyPressing();
        if (p) {
          setPressingLogo(p.logo ? `data:image/png;base64,${p.logo}` : null);
          setPressingName(p.nom || "");
        }
      } catch (e) {
        console.error("Erreur chargement pressing", e);
      }
    };
    loadPressing();
  }, []);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Clients", href: "/clients", icon: Users },
    { name: "Commandes", href: "/commandes", icon: ShoppingBag },
    { name: "Pressing", href: "/parametres", icon: Shirt },
    ...(isAdmin
      ? [
          { name: "Charge", href: "/charge", icon: Archive },
          { name: "Rapport", href: "/rapports", icon: FileText },
        ]
      : []),
  ];

  const handleLogout = () => {
    // Petit effet visuel
    const sidebarContent = document.querySelector(".sidebar-content");
    if (sidebarContent) sidebarContent.classList.add("opacity-50");
    setTimeout(() => {
      localStorage.clear();
      navigate("/");
    }, 200);
  };

  const toggleTheme = () => setDarkMode((v) => !v);

  // LOGO COMPONENT
  const PressingLogo = () => (
    <div className="flex items-center justify-center h-10 w-10 min-w-[40px] rounded-xl bg-blue-600 shadow-md overflow-hidden">
      {pressingLogo ? (
        <img
          src={pressingLogo}
          alt="Logo"
          className="h-full w-full object-contain bg-white"
        />
      ) : (
        <DefaultLogo />
      )}
    </div>
  );

  return (
    <>
      {/* --- HEADER MOBILE (Visible uniquement sur petit écran) --- */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 h-16 shadow-sm">
        <div className="flex items-center gap-3">
          <PressingLogo />
          <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate max-w-[200px]">
            {pressingName || "PressPro"}
          </h1>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* --- OVERLAY MOBILE --- */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden transition-opacity"
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 shadow-2xl lg:shadow-none sidebar-content",
          // Z-INDEX : Très élevé sur mobile pour passer au dessus du header mobile
          "z-[60] lg:z-30",
          // POSITION : Translation pour l'effet slide
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          // LARGEUR : 
          // Mobile = Toujours 280px (confortable)
          // Desktop = Soit 80px (replié), soit 256px (ouvert)
          "w-[280px]", 
          isCollapsed ? "lg:w-20" : "lg:w-64"
        )}
      >
        {/* HEADER DE LA SIDEBAR */}
        <div className="flex items-center justify-between p-4 h-[73px] border-b border-gray-100 dark:border-gray-800">
          
          {/* Logo & Titre */}
          <div className={cn(
            "flex items-center gap-3 overflow-hidden transition-all",
            // Sur desktop replié, on centre le logo
            isCollapsed ? "lg:justify-center lg:w-full" : ""
          )}>
            <PressingLogo />
            
            {/* Le titre s'affiche : 
                1. Sur Mobile (toujours)
                2. Sur Desktop (si NON replié) 
            */}
            <div className={cn(
              "flex-1 min-w-0 transition-opacity duration-300",
              isCollapsed ? "lg:hidden lg:opacity-0" : "block opacity-100"
            )}>
              <h1 className="text-base font-bold text-gray-900 dark:text-white truncate">
                {pressingName || "PressPro"}
              </h1>
              <p className="text-xs text-gray-500 truncate">Gestion</p>
            </div>
          </div>

          {/* Bouton Fermer (Mobile uniquement) */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <X size={20} />
          </button>

          {/* Bouton Collapse (Desktop uniquement) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "hidden lg:flex items-center justify-center p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors",
              isCollapsed && "hidden" // Optionnel : Cacher le bouton si replié (ou le mettre ailleurs)
            )}
          >
            <ChevronDown
              size={16}
              className={cn("transition-transform", isCollapsed ? "-rotate-90" : "rotate-90")}
            />
          </button>
        </div>

        {/* NAVIGATION LIST */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => setIsOpen(false)} // UX : Fermer le menu après clic sur mobile
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all group relative",
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200",
                  // Si desktop replié : centrer l'icône
                  isCollapsed ? "justify-center px-2" : ""
                )
              }
            >
              <item.icon 
                size={20} 
                className={cn(
                  "transition-all",
                  // Si desktop replié, pas de marge, sinon marge droite
                  isCollapsed ? "" : "min-w-[20px]" 
                )} 
              />
              
              <span className={cn(
                "transition-all duration-300 whitespace-nowrap overflow-hidden",
                // Cacher le texte si Desktop replié, sinon afficher
                isCollapsed ? "lg:w-0 lg:opacity-0 hidden lg:block" : "w-auto opacity-100"
              )}>
                {item.name}
              </span>

              {/* Tooltip au survol (Desktop replié uniquement) */}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* FOOTER BAS (Logout / Theme) */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20">
          <div className={cn(
            "flex items-center gap-2", 
            isCollapsed ? "lg:flex-col lg:justify-center" : "justify-between"
          )}>
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors shadow-sm border border-transparent hover:border-gray-200"
              title="Thème"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            
            {isCollapsed ? (
               <button
               onClick={handleLogout}
               className="p-2 text-gray-500 hover:text-red-600 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors"
               title="Déconnexion"
             >
               <LogOut size={18} />
             </button>
            ) : (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                <LogOut size={18} />
                <span>Déconnexion</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}