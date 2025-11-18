import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Shirt,
  Menu,
  X,
  LogOut,
  Bell,
  ChevronDown,
  Sun,
  Moon,
  Archive,
  FileText,
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

  // Logo par défaut (icône Shirt)
  const DefaultLogo = () => <Shirt className="text-white h-6 w-6" />;

  // Charger pressing
  useEffect(() => {
    const loadPressing = async () => {
      try {
        const p = await getMyPressing();
        if (p) {
          setPressingLogo(p.logo ? `data:image/png;base64,${p.logo}` : null);
          setPressingName(p.nom || "");
        }
      } catch (e) {
        console.error("Impossible de récupérer le pressing :", e);
        setPressingLogo(null);
        setPressingName("");
      }
    };
    loadPressing();
  }, []);

  // Mode sombre
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Clients", href: "/clients", icon: Users },
    { name: "Commandes", href: "/commandes", icon: ShoppingBag },
    { name: "Pressing", href: "/parametres", icon: Shirt },
    { name: "Charge", href: "/charge", icon: Archive },
    { name: "Rapport", href: "/rapports", icon: FileText },
  ];

  const handleLogout = () => {
    const sidebarContent = document.querySelector(".sidebar-content");
    if (sidebarContent) sidebarContent.classList.add("opacity-0", "scale-95");
    setTimeout(() => {
      localStorage.clear();
      navigate("/");
    }, 300);
  };

  const toggleTheme = () => setDarkMode((v) => !v);

  // Component pour afficher le logo
  const PressingLogo = () => (
    <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-white/20 overflow-hidden shadow-lg">
      {pressingLogo ? (
        <img
          src={pressingLogo}
          alt={pressingName || "Logo Pressing"}
          className="h-full w-full object-contain p-1"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <DefaultLogo />
      )}
    </div>
  );

  const QuickActions = () => (
    <div className="lg:hidden p-4 border-t border-gray-200 dark:border-gray-700">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
        Actions rapides
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => {
            navigate("/commandes/nouveau");
            setIsOpen(false);
          }}
          className="flex items-center justify-center gap-2 p-2 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30"
        >
          <ShoppingBag size={14} /> Nouvelle commande
        </button>
        <button
          onClick={() => {
            navigate("/clients/nouveau");
            setIsOpen(false);
          }}
          className="flex items-center justify-center gap-2 p-2 text-sm bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30"
        >
          <Users size={14} /> Ajouter client
        </button>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes fade-in { 
          from { opacity: 0; } 
          to { opacity: 1; } 
        }
      `}</style>

      {/* HEADER MOBILE */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl w-10 h-10 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md overflow-hidden">
            <PressingLogo />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800 dark:text-white">
              {pressingName || "PressPro"}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">En ligne</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <Bell size={18} className="text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col shadow-xl transition-all duration-300 lg:translate-x-0 sidebar-content",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-500 to-purple-600">
          {!isCollapsed ? (
            <div className="flex items-center gap-3 flex-1">
              <PressingLogo />
              <div className="flex-1">
                <h1 className="text-lg font-bold text-white">
                  {pressingName || "PressPro"}
                </h1>
              </div>
            </div>
          ) : (
            <div className="flex justify-center w-full">
              <PressingLogo />
            </div>
          )}

          {/* Toggle collapse */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 text-white hover:bg-white/30"
          >
            <ChevronDown
              size={16}
              className={cn(
                "transition-transform duration-300",
                isCollapsed ? "-rotate-90" : "rotate-90"
              )}
            />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 space-y-1 p-4 bg-gray-50 dark:bg-gray-800/50 overflow-y-auto">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all group relative",
                  isActive
                    ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-lg border border-blue-100 dark:border-blue-800"
                    : "text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-md",
                  isCollapsed ? "justify-center" : ""
                )
              }
              onClick={() => setIsOpen(false)}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 transition-transform group-hover:scale-110",
                  isCollapsed ? "" : "flex-shrink-0"
                )}
              />
              {!isCollapsed && <span className="flex-1">{item.name}</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-lg">
                  {item.name}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        <QuickActions />

        {/* FOOTER */}
        <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 space-y-3">
          <div
            className={cn(
              "flex items-center gap-2",
              isCollapsed ? "justify-center flex-col gap-1" : "justify-between"
            )}
          >
            {/* DARK MODE */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* LOGOUT */}
            {!isCollapsed ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
              >
                <LogOut size={16} /> Déconnexion
              </button>
            ) : (
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
