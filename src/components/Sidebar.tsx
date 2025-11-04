import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, ShoppingBag, CreditCard, Settings, BarChart3, Shirt, Menu, X, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Clients", href: "/clients", icon: Users },
    { name: "Commandes", href: "/commandes", icon: ShoppingBag },
    { name: "Paiements", href: "/paiements", icon: CreditCard },
    { name: "Paramètres", href: "/parametres", icon: Settings },
    { name: "Rapports", href: "/rapports", icon: BarChart3 },
  ];

  if (role === "admin") {
    navigation.push({ name: "Gestion des comptes", href: "/compte", icon: User });
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleCompteClick = () => {
    navigate("/compte");
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow-md flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="bg-blue-500 text-white p-2 rounded-lg">
            <Shirt className="h-5 w-5" />
          </div>
          <h1 className="text-lg font-bold text-gray-800">PressPro</h1>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md hover:bg-gray-100">
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200 flex flex-col shadow-lg transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-gray-100 bg-gradient-to-r from-blue-500 to-blue-600">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 text-white">
            <Shirt className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">PressPro</h1>
            <p className="text-xs text-blue-100">Gestion Pressing</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4 bg-gray-50">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-blue-100 text-blue-700 shadow-sm"
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                )
              }
              onClick={() => setIsOpen(false)}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Compte utilisateur */}
        <div className="border-t border-gray-200 bg-white p-4">
          <div
            onClick={handleCompteClick}
            className="flex items-center gap-3 mb-3 cursor-pointer rounded-md p-2 hover:bg-blue-50 transition-all"
          >
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <User size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{role === "admin" ? "Admin" : "Comptoir"}</p>
              <p className="text-xs text-gray-500">{localStorage.getItem("email")}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center w-full gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </aside>

      {isOpen && (
        <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"></div>
      )}
    </>
  );
}
