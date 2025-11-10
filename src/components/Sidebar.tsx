import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom"; 
// Import de User, Search retirés
import { LayoutDashboard, Users, ShoppingBag, Shirt, Menu, X, LogOut, Bell, ChevronDown, Sun, Moon } from "lucide-react"; 
import { cn } from "@/lib/utils";

// MODIFICATION: Accepter isCollapsed et setIsCollapsed via les props
export function Sidebar({ isCollapsed, setIsCollapsed }) {
  const [isOpen, setIsOpen] = useState(false);
  // RETRAIT: activeNotification n'est plus utilisé et a été supprimé
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  // Appliquer le mode sombre
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const navigation = [
    // RETRAIT des propriétés badge et count
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Clients", href: "/clients", icon: Users },
    { name: "Commandes", href: "/commandes", icon: ShoppingBag },
    { name: "Pressing", href: "/parametres", icon: Shirt },
  ];

  const handleLogout = () => {
    const sidebarContent = document.querySelector('.sidebar-content');
    if (sidebarContent) {
      sidebarContent.classList.add('opacity-0', 'scale-95');
    }
    setTimeout(() => {
      localStorage.clear();
      navigate("/");
    }, 300);
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  // Navigation rapide pour mobile
  const QuickActions = () => (
    <div className="lg:hidden p-4 border-t border-gray-200 dark:border-gray-700">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">Actions rapides</h3>
      <div className="grid grid-cols-2 gap-2">
        <button 
          onClick={() => {
            navigate("/commandes/nouveau");
            setIsOpen(false);
          }}
          className="flex items-center justify-center gap-2 p-2 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/30"
        >
          <ShoppingBag size={14} />
          Nouvelle commande
        </button>
        <button 
          onClick={() => {
            navigate("/clients/nouveau");
            setIsOpen(false);
          }}
          className="flex items-center justify-center gap-2 p-2 text-sm bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg transition-colors hover:bg-green-100 dark:hover:bg-green-900/30"
        >
          <Users size={14} />
          Ajouter client
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header amélioré */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-2 rounded-xl shadow-md">
            <Shirt className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800 dark:text-white">PressPro</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">En ligne</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Le bouton notification est conservé mais sans la logique de l'indicateur actif */}
          <button 
            // setActiveNotification(!activeNotification) retiré
            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Bell size={18} className="text-gray-600 dark:text-gray-300" />
            {/* L'indicateur de notification est retiré */}
          </button>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)} 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          style={{ animation: 'fade-in 0.2s ease-out' }}
        ></div>
      )}

      {/* Sidebar amélioré */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col shadow-xl transition-all duration-300 lg:translate-x-0 sidebar-content",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        // Utilise l'état isCollapsed du Layout pour la largeur
        isCollapsed ? "w-20" : "w-64"
      )}>
        {/* En-tête du sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-500 to-purple-600">
          {!isCollapsed && (
            <div className="flex items-center gap-3 flex-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white shadow-lg">
                <Shirt className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h1 className="text-lg font-bold text-white">PressPro</h1>
                <p className="text-xs text-blue-100">Gestion Pressing</p>
              </div>
            </div>
          )}
          
          {isCollapsed && (
            <div className="flex justify-center w-full">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white shadow-lg">
                <Shirt className="h-6 w-6" />
              </div>
            </div>
          )}

          {/* Bouton collapse pour desktop */}
          <button
            // Utilise setIsCollapsed passé en prop
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
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

        {/* Navigation principale */}
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
              <item.icon className={cn(
                "h-5 w-5 transition-transform group-hover:scale-110",
                isCollapsed ? "" : "flex-shrink-0"
              )} />
              
              {!isCollapsed && (
                <>
                  <span className="flex-1">{item.name}</span>
                  {/* RETRAIT des blocs item.badge et item.count */}
                </>
              )}

              {/* Tooltip pour le mode collapsed */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
                  {item.name}
                  {/* RETRAIT de l'affichage du badge dans le tooltip */}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Actions rapides mobile */}
        <QuickActions />

        {/* Actions en bas (Thème/Déconnexion) */}
        <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 space-y-3">
          <div className={cn(
            "flex items-center gap-2 transition-all",
            isCollapsed ? "justify-center flex-col gap-1" : "justify-between"
          )}>
            <button
              onClick={toggleTheme}
              className={cn(
                "p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                isCollapsed ? "w-full" : ""
              )}
              title={darkMode ? "Mode clair" : "Mode sombre"}
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {!isCollapsed && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all group"
              >
                <LogOut size={16} className="group-hover:scale-110 transition-transform" />
                Déconnexion
              </button>
            )}

            {isCollapsed && (
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full"
                title="Déconnexion"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Styles globaux pour les animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}