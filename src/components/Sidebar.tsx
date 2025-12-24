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
  Gift,
  Snowflake,
  Star,
  TreePine,
  CandyCane,
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
  const [showSnow, setShowSnow] = useState(false); // Changé à false par défaut
  const navigate = useNavigate();

  const role = localStorage.getItem("role") || "COMPTOIR";
  const isAdmin = role === "ADMIN" || role === "ADMINISTRATEUR";

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

  // Effets de neige
  useEffect(() => {
    if (!showSnow) return;

    const snowflakes = document.createElement("div");
    snowflakes.className = "snowflakes";
    snowflakes.innerHTML = `
      <style>
        .snowflakes {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1000;
        }
        .snowflake {
          position: absolute;
          background: white;
          border-radius: 50%;
          opacity: 0.8;
          animation: fall linear infinite;
        }
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
          }
        }
      </style>
    `;

    for (let i = 0; i < 30; i++) {
      const snowflake = document.createElement("div");
      snowflake.className = "snowflake";
      snowflake.style.width = `${Math.random() * 8 + 2}px`;
      snowflake.style.height = snowflake.style.width;
      snowflake.style.left = `${Math.random() * 100}%`;
      snowflake.style.animationDuration = `${Math.random() * 5 + 5}s`;
      snowflake.style.animationDelay = `${Math.random() * 5}s`;
      snowflake.style.opacity = `${Math.random() * 0.7 + 0.3}`;
      snowflakes.appendChild(snowflake);
    }

    document.body.appendChild(snowflakes);

    return () => {
      const existingSnowflakes = document.querySelector(".snowflakes");
      if (existingSnowflakes) {
        document.body.removeChild(existingSnowflakes);
      }
    };
  }, [showSnow]);

  const navigation = [
    { 
      name: "Dashboard", 
      href: "/dashboard", 
      icon: LayoutDashboard,
      festiveIcon: Star 
    },
    { 
      name: "Clients", 
      href: "/clients", 
      icon: Users,
      festiveIcon: CandyCane 
    },
    { 
      name: "Commandes", 
      href: "/commandes", 
      icon: ShoppingBag,
      festiveIcon: Gift 
    },
    { 
      name: "Pressing", 
      href: "/parametres", 
      icon: Shirt,
      festiveIcon: TreePine 
    },
    ...(isAdmin
      ? [
          { 
            name: "Charge", 
            href: "/charge", 
            icon: Archive,
            festiveIcon: Snowflake 
          },
          { 
            name: "Rapport", 
            href: "/rapports", 
            icon: FileText,
            festiveIcon: Star 
          },
        ]
      : []),
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
  const toggleSnow = () => setShowSnow((v) => !v);

  // Component pour afficher le logo
  const PressingLogo = () => (
    <div className="relative flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-r from-red-500 to-green-600 overflow-hidden shadow-lg">
      {/* Guirlande autour du logo */}
      <div className="absolute -top-1 -left-1 -right-1 -bottom-1 rounded-xl border-2 border-yellow-400 animate-pulse opacity-60"></div>
      
      {pressingLogo ? (
        <img
          src={pressingLogo}
          alt={pressingName || "Logo Pressing"}
          className="h-full w-full object-contain p-1 relative z-10"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <DefaultLogo />
      )}
      
      {/* Petite étoile au-dessus */}
      <Star className="absolute -top-1 -right-1 h-3 w-3 text-yellow-400 animate-spin" />
    </div>
  );

  const QuickActions = () => (
    <div className="lg:hidden p-4 border-t border-gray-200 dark:border-gray-700">
      <h3 className="text-xs font-semibold text-red-500 uppercase mb-3 flex items-center gap-2">
        <Gift size={12} /> Actions de Noël
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => {
            navigate("/commandes/nouveau");
            setIsOpen(false);
          }}
          className="flex items-center justify-center gap-2 p-2 text-sm bg-gradient-to-r from-red-50 to-green-50 dark:from-red-900/20 dark:to-green-900/20 text-red-700 dark:text-red-300 rounded-lg hover:from-red-100 hover:to-green-100 dark:hover:from-red-900/30 dark:hover:to-green-900/30 border border-red-200 dark:border-red-800"
        >
          <Gift size={14} /> Offre spéciale
        </button>
        <button
          onClick={() => {
            navigate("/clients/nouveau");
            setIsOpen(false);
          }}
          className="flex items-center justify-center gap-2 p-2 text-sm bg-gradient-to-r from-green-50 to-white dark:from-green-900/20 dark:to-gray-800 text-green-700 dark:text-green-300 rounded-lg hover:from-green-100 hover:to-white dark:hover:from-green-900/30 dark:hover:to-gray-700 border border-green-200 dark:border-green-800"
        >
          <TreePine size={14} /> Cadeau client
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
        @keyframes christmas-lights {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        .christmas-border {
          background: linear-gradient(90deg, 
            #ff0000, #ff9900, #ffff00, #00ff00, 
            #0099ff, #6600ff, #ff0000);
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* HEADER MOBILE */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-700 via-green-700 to-red-700 shadow-lg border-b border-yellow-400 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <PressingLogo />
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              {pressingName || "PressPro"}
              <span className="text-xs bg-yellow-400 text-red-700 px-2 py-0.5 rounded-full animate-pulse">
                🎄 Noël
              </span>
            </h1>
            <p className="text-xs text-yellow-300">Joyeux Noël !</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleSnow}
            className={cn(
              "p-2 rounded-lg transition-all",
              showSnow 
                ? "bg-white/30" 
                : "bg-white/20 hover:bg-white/30"
            )}
          >
            <Snowflake size={18} className="text-white" />
          </button>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30"
          >
            {isOpen ? (
              <X size={20} className="text-white" />
            ) : (
              <TreePine size={20} className="text-white" />
            )}
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
          "fixed top-0 left-0 z-50 h-screen bg-gradient-to-b from-gray-900 via-red-900/20 to-green-900/20 dark:from-gray-900 dark:via-red-900/30 dark:to-green-900/30 border-r-4 border-gradient-to-r from-red-500 via-yellow-400 to-green-500 flex flex-col shadow-2xl transition-all duration-300 lg:translate-x-0 sidebar-content",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isCollapsed ? "w-20" : "w-64"
        )}
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,0,0,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(0,255,0,0.1) 0%, transparent 50%)'
        }}
      >
        {/* Guirlande de Noël en haut */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 animate-pulse"></div>

        {/* HEADER */}
        <div className="relative flex items-center justify-between p-4 border-b border-red-500/30 bg-gradient-to-r from-red-700 via-red-800 to-green-800">
          {/* Étoiles scintillantes */}
          <Star className="absolute top-2 left-4 h-2 w-2 text-yellow-400 animate-pulse" />
          <Star className="absolute top-3 right-10 h-3 w-3 text-yellow-400 animate-spin" style={{animationDuration: '3s'}} />
          <Star className="absolute bottom-2 left-10 h-2 w-2 text-yellow-400 animate-pulse" style={{animationDelay: '0.5s'}} />
          
          {!isCollapsed ? (
            <div className="flex items-center gap-3 flex-1">
              <PressingLogo />
              <div className="flex-1">
                <h1 className="text-lg font-bold text-white flex items-center gap-2">
                  {pressingName || "PressPro"}
                  <span className="text-xs bg-yellow-400 text-red-700 px-2 py-0.5 rounded-full animate-bounce">
                    🎅
                  </span>
                </h1>
                <p className="text-xs text-yellow-300 flex items-center gap-1">
                  <Snowflake className="h-3 w-3" /> 
                  Bonne année 2026
                  <Snowflake className="h-3 w-3" />
                </p>
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
        <nav className="flex-1 space-y-2 p-4 bg-gradient-to-b from-white/5 to-transparent dark:from-gray-800/20 overflow-y-auto">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all group relative",
                  isActive
                    ? "bg-gradient-to-r from-red-50 to-green-50 dark:from-red-900/30 dark:to-green-900/30 text-red-700 dark:text-red-300 shadow-lg border-2 border-yellow-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r from-red-50/50 to-green-50/50 dark:from-red-900/20 dark:to-green-900/20 hover:text-red-600 dark:hover:text-red-400 hover:shadow-md hover:border hover:border-yellow-300/30",
                  isCollapsed ? "justify-center" : ""
                )
              }
              onClick={() => setIsOpen(false)}
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    {Math.random() > 0.7 ? (
                      <item.festiveIcon
                        className={cn(
                          "h-5 w-5 transition-transform group-hover:scale-110 group-hover:rotate-12 text-red-500",
                          isCollapsed ? "" : "flex-shrink-0"
                        )}
                      />
                    ) : (
                      <item.icon
                        className={cn(
                          "h-5 w-5 transition-transform group-hover:scale-110",
                          isCollapsed ? "" : "flex-shrink-0"
                        )}
                      />
                    )}
                    {/* Petit effet de neige sur l'icône */}
                    {showSnow && Math.random() > 0.5 && (
                      <Snowflake className="absolute -top-1 -right-1 h-2 w-2 text-blue-300 animate-spin" />
                    )}
                  </div>
                  {!isCollapsed && (
                    <span className="flex-1 relative">
                      {item.name}
                      {item.name === "Commandes" && (
                        <span className="absolute -top-2 -right-2 text-[8px] bg-red-500 text-white px-1 rounded-full animate-pulse">
                          OFFRE
                        </span>
                      )}
                    </span>
                  )}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gradient-to-r from-red-600 to-green-600 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-lg">
                      {item.name}
                    </div>
                  )}
                  
                  {/* Effet de guirlande sur les liens actifs */}
                  {isActive && (
                    <div className="absolute -top-1 -left-1 -right-1 -bottom-1 rounded-xl border border-yellow-400/50 animate-pulse"></div>
                  )}
                </>
              )}
            </NavLink>
          ))}
          
          
        </nav>

        <QuickActions />

        {/* FOOTER */}
        <div className="border-t border-red-500/20 bg-gradient-to-r from-red-900/10 to-green-900/10 dark:from-red-900/20 dark:to-green-900/20 p-4 space-y-3">
          <div
            className={cn(
              "flex items-center gap-2",
              isCollapsed ? "justify-center flex-col gap-1" : "justify-between"
            )}
          >
            {/* TOGGLE NEIGE */}
            <button
              onClick={toggleSnow}
              className={cn(
                "p-2 rounded-lg transition-all",
                showSnow 
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" 
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
              title={showSnow ? "Désactiver la neige" : "Activer la neige"}
            >
              <Snowflake className={cn("h-4 w-4", showSnow && "animate-spin")} />
            </button>

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
                className="flex items-center gap-2 px-3 py-2 text-sm bg-gradient-to-r from-red-50 to-gray-50 dark:from-red-900/20 dark:to-gray-800 text-red-600 dark:text-red-400 hover:from-red-100 hover:to-gray-100 dark:hover:from-red-900/30 dark:hover:to-gray-700 rounded-lg border border-red-200 dark:border-red-800"
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
          
          {/* Message de Noël */}
          {!isCollapsed && (
            <div className="text-center">
              <p className="text-xs text-yellow-600 dark:text-yellow-400 animate-pulse">
                🎄 Joyeuses Fêtes ! 🎅
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}