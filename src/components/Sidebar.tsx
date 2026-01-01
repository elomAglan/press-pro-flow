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
          { name: "Compte", href: "/compte", icon: UserCog },
        ]
      : []),
  ];

  // --- MODIFICATION ICI ---
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login"); // Redirige explicitement vers /login
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
      {/* HEADER MOBILE OPTIMISÉ */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border-b border-gray-100 dark:border-gray-900 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <PressingLogo />
          </div>
          <h1 className="font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">
            {pressingName || "PressPro"}
          </h1>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 active:scale-90 transition-transform"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay tactile */}
      {isOpen && <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300" />}

      {/* SIDEBAR : Suppression de h-screen pour la flexibilité mobile */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 min-h-screen bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-900 flex flex-col transition-all duration-500 lg:translate-x-0 shadow-[20px_0_40px_rgba(0,0,0,0.02)] dark:shadow-none",
          isOpen ? "translate-x-0 w-[280px]" : "-translate-x-full lg:translate-x-0",
          isCollapsed ? "lg:w-24" : "lg:w-72"
        )}
      >
        {/* LOGO SECTION */}
        <div className="p-8">
          <div className={cn("flex items-center gap-4", isCollapsed ? "justify-center" : "")}>
            <div className="h-12 w-12 rounded-[1.2rem] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-xl shadow-blue-500/20 transition-transform hover:rotate-3">
              <PressingLogo />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-black text-xl text-gray-900 dark:text-white leading-none tracking-tighter">
                  {pressingName.split(' ')[0] || "PRO"}
                </span>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mt-1.5 opacity-80">System</span>
              </div>
            )}
          </div>
        </div>

        {/* NAVIGATION SCROLLABLE */}
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto scrollbar-none">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-4 px-4 py-4 rounded-[1.2rem] text-[13px] font-black uppercase tracking-widest transition-all group relative",
                  isActive
                    ? "bg-blue-600 text-white shadow-xl shadow-blue-500/40"
                    : "text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900/50 hover:text-blue-600",
                  isCollapsed ? "justify-center px-0" : ""
                )
              }
            >
              <item.icon size={20} className={cn("transition-all duration-300 group-hover:scale-110 group-active:scale-90", isCollapsed ? "" : "min-w-[20px]")} />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
              
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-4 py-2 bg-gray-900 dark:bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-2xl">
                  {item.name}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* FOOTER ACTIONS : Plus spacieux */}
        <div className="p-6 mt-auto bg-gray-50/50 dark:bg-gray-900/20 border-t border-gray-100 dark:border-gray-900">
          <div className={cn("flex items-center gap-3", isCollapsed ? "flex-col" : "justify-between")}>
            {/* THEME TOGGLE */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-3.5 rounded-2xl bg-white dark:bg-gray-900 text-gray-400 hover:text-blue-600 border border-gray-100 dark:border-gray-800 transition-all shadow-sm active:scale-90"
              title="Thème"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {/* LOGOUT : Bouton Quitter plus imposant */}
            <button
              onClick={handleLogout}
              className={cn(
                "p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/20 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95 group",
                isCollapsed ? "" : "flex-1 flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest"
              )}
            >
              <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
              {!isCollapsed && <span>Quitter</span>}
            </button>
          </div>
        </div>

        {/* COLLAPSE TRIGGER (Desktop) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3.5 top-28 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-full p-1.5 text-gray-400 hover:text-blue-600 shadow-xl transition-all hover:scale-110 z-50"
        >
          <ChevronDown size={14} className={cn("transition-transform duration-500", isCollapsed ? "-rotate-90" : "rotate-90")} />
        </button>
      </aside>
    </>
  );
}