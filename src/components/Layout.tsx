import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Bell } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Contenu principal */}
      <div className="flex flex-col flex-1 lg:ml-64 transition-all duration-300">
        {/* Navbar */}
        <header className="flex items-center justify-between bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3 shadow-sm sticky top-0 z-20">
          <div className="flex-1 flex items-center justify-between max-w-full mx-auto">
            {/* Titre */}
            <h1 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
             
            </h1>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
              </button>

              {/* Profil rapide */}
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                  A
                </div>
                <span className="hidden sm:inline text-gray-700 font-medium truncate">
                  {localStorage.getItem("role") || "Utilisateur"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Espace mobile */}
        <div className="h-14 lg:hidden" />

        {/* Contenu principal */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
