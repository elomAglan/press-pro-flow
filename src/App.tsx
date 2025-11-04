import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Compte from "./pages/Compte";
import Clients from "./pages/Clients";
import Commandes from "./pages/Commandes";
import Paiements from "./pages/Paiements";
import Parametres from "./pages/Parametres";
import Rapports from "./pages/Rapports";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";

const queryClient = new QueryClient();

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Auth routes */}
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/clients" element={<Layout><Clients /></Layout>} />
          <Route path="/commandes" element={<Layout><Commandes /></Layout>} />
          <Route path="/paiements" element={<Layout><Paiements /></Layout>} />
          <Route path="/parametres" element={<Layout><Parametres /></Layout>} />
          <Route path="/rapports" element={<Layout><Rapports /></Layout>} />
          <Route path="/compte" element={<Layout><Compte /></Layout>} />
          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
