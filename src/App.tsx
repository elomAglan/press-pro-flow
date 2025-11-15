import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { Layout } from "./components/Layout";

import Dashboard from "./pages/Dashboard";
import Compte from "./pages/Compte";
import Clients from "./pages/Clients";
import Commandes from "./pages/Commandes";
import CommandeDetail from "./pages/CommandeDetail";
import NouvelleCommande from "./pages/NouvelleCommande";
import Paiements from "./pages/Paiements";
import Parametres from "./pages/Parametres";
import Rapports from "./pages/Rapports";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Tarifs from "./pages/Tarifs";
import ChargePage from "./pages/ChargePage";

const queryClient = new QueryClient();

// Wrapper pour passer onCancel()
const NouvelleCommandeWrapper = () => {
  const navigate = useNavigate();
  return <NouvelleCommande onCancel={() => navigate("/commandes")} />;
};

// Helper pour les routes avec Layout
const withLayout = (Component: React.ReactNode) => <Layout>{Component}</Layout>;

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* 🔐 AUTH */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* 🧭 APP PROTÉGÉE */}
          <Route path="/dashboard" element={withLayout(<Dashboard />)} />
          <Route path="/clients" element={withLayout(<Clients />)} />
          <Route path="/commandes" element={withLayout(<Commandes />)} />
          <Route path="/commandes/nouvelle" element={withLayout(<NouvelleCommandeWrapper />)} />
          <Route path="/commandes/:id" element={withLayout(<CommandeDetail />)} />
          <Route path="/charge" element={withLayout(<ChargePage />)} />
          <Route path="/paiements" element={withLayout(<Paiements />)} />
          <Route path="/parametres" element={withLayout(<Parametres />)} />
          <Route path="/tarifs" element={withLayout(<Tarifs />)} />
          <Route path="/rapports" element={withLayout(<Rapports />)} />
          <Route path="/compte" element={withLayout(<Compte />)} />

          {/* 🚫 NOT FOUND */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
