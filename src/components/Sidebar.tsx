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
  ChevronDown,
  Sun,
  Moon,
  Archive,
  FileText,
  UserCog,
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

  useEffect(() => {
    const loadPressing = async () => {
      try {
        const p = await getMyPressing();
        if (p) {
          setPressingLogo(p.logo ? `data:image/png;base64,${p.logo}` : null);
          setPressingName(p.nom || "");
        }
      } catch (e) {
        setPressingLogo(null);
        setPressingName("");
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
          { name: "Charges", href: "/charge", icon: Archive },
          { name: "Rapports", href: "/rapports", icon: FileText },
          { name: "Compte", href: "/compte", icon: UserCog }, // Corrigé : /compte
        ]
      : []),
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const PressingLogo = () => (
    <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-white/20 overflow-hidden shadow-inner">
      {pressingLogo ? (
        <img src={pressingLogo} alt="Logo" className="h-full w-full object-contain p-1" />
      ) : (
        <Shirt className="text-white h-6 w-6" />
      )}
    </div>
  );

  return (
    <>
      {/* HEADER MOBILE */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl w-10 h-10 flex items-center justify-center bg-blue-600 text-white shadow-lg">
            <PressingLogo />
          </div>
          <h1 className="font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">
            {pressingName || "PressPro"}
          </h1>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" />}

      {/* SIDEBAR */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-900 flex flex-col transition-all duration-300 lg:translate-x-0 shadow-2xl",
          isOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0",
          isCollapsed ? "lg:w-20" : "lg:w-72"
        )}
      >
        {/* LOGO SECTION */}
        <div className="p-6">
          <div className={cn("flex items-center gap-3", isCollapsed ? "justify-center" : "")}>
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
              <PressingLogo />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-black text-xl text-gray-900 dark:text-white leading-none tracking-tight">
                  {pressingName.split(' ')[0] || "PRO"}
                </span>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Management</span>
              </div>
            )}
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto scrollbar-none">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all group relative",
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white",
                  isCollapsed ? "justify-center px-0" : ""
                )
              }
            >
              <item.icon size={22} className={cn("transition-transform group-hover:scale-110", isCollapsed ? "" : "min-w-[22px]")} />
              {!isCollapsed && <span>{item.name}</span>}
              
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-xs rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl">
                  {item.name}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* FOOTER ACTIONS */}
        <div className="p-4 mt-auto border-t border-gray-100 dark:border-gray-900">
          <div className={cn("flex items-center gap-2", isCollapsed ? "flex-col" : "justify-between")}>
            {/* THEME TOGGLE */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:text-blue-600 border border-gray-100 dark:border-gray-800 transition-all active:scale-95"
              title="Changer de thème"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {/* LOGOUT */}
            <button
              onClick={handleLogout}
              className={cn(
                "p-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95",
                isCollapsed ? "" : "flex-1 flex items-center justify-center gap-2 font-bold text-sm"
              )}
              title="Déconnexion"
            >
              <LogOut size={20} />
              {!isCollapsed && <span>Quitter</span>}
            </button>
          </div>
        </div>

        {/* COLLAPSE TRIGGER (Desktop) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-24 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1 text-gray-400 hover:text-blue-600 shadow-md transition-all hover:scale-110"
        >
          <ChevronDown size={14} className={cn("transition-transform", isCollapsed ? "-rotate-90" : "rotate-90")} />
        </button>
      </aside>
    </>
  );
}