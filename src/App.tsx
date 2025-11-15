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
import CommandeDetail from "./pages/CommandeDetails";
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
function NouvelleCommandeWrapper() {
  const navigate = useNavigate();
  return <NouvelleCommande onCancel={() => navigate("/commandes")} />;
}

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
          <Route
            path="/dashboard"
            element={
              <Layout>
                <Dashboard />
              </Layout>
            }
          />

          <Route
            path="/clients"
            element={
              <Layout>
                <Clients />
              </Layout>
            }
          />

          {/* 🧺 COMMANDES */}
          <Route
            path="/commandes"
            element={
              <Layout>
                <Commandes />
              </Layout>
            }
          />

          <Route
            path="/commandes/nouvelle"
            element={
              <Layout>
                <NouvelleCommandeWrapper />
              </Layout>
            }
          />

          <Route
            path="/commandes/:id"
            element={
              <Layout>
                <CommandeDetail />
              </Layout>
            }
          />

          <Route
            path="/charge"
            element={
              <Layout>
                <ChargePage />
              </Layout>
            }
          />

          {/* AUTRES */}
          <Route
            path="/paiements"
            element={
              <Layout>
                <Paiements />
              </Layout>
            }
          />

          <Route
            path="/parametres"
            element={
              <Layout>
                <Parametres />
              </Layout>
            }
          />

          <Route
            path="/tarifs"
            element={
              <Layout>
                <Tarifs />
              </Layout>
            }
          />

          <Route
            path="/rapports"
            element={
              <Layout>
                <Rapports />
              </Layout>
            }
          />

          <Route
            path="/compte"
            element={
              <Layout>
                <Compte />
              </Layout>
            }
          />

          {/* 🚫 NOT FOUND */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
