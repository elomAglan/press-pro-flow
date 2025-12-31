import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader2, LogIn, ArrowLeft, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const token = await response.text();
      if (!response.ok) throw new Error("Email ou mot de passe incorrect");
      
      localStorage.setItem("authToken", token);

      try {
        const payloadBase64 = token.split('.')[1];
        const decodedClaims = JSON.parse(atob(payloadBase64));
        const role = decodedClaims.role || decodedClaims.roles?.[0] || "USER";
        localStorage.setItem("role", role);
      } catch (decodeError) {
        localStorage.setItem("role", "ADMIN"); 
      }

      navigate("/dashboard");
      
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white overflow-hidden">
      
      {/* BOUTON RETOUR (Flottant) */}
      <button 
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 z-50 p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white md:text-slate-900 md:border-slate-200 md:bg-white hover:scale-105 transition-all flex items-center gap-2 font-bold text-sm shadow-xl"
      >
        <ArrowLeft size={18} /> Retour
      </button>

      {/* --- VOLET GAUCHE (Image Pleine Page) --- */}
      <div className="relative w-full md:w-1/2 lg:w-[60%] h-[40vh] md:h-screen">
        <div 
          className="absolute inset-0 z-0"
          style={{ 
            backgroundImage: "url('/machine a laver.jpg')", 
            backgroundSize: "cover", 
            backgroundPosition: "center" 
          }}
        />
        {/* Overlay dégradé pour le style */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-blue-700/80 to-indigo-900/95 z-10" />
        
        <div className="relative z-20 h-full p-12 flex flex-col justify-end text-white">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md space-y-4"
          >
            <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-[24px] flex items-center justify-center mb-8 border border-white/30">
              <img src="/icon.png" alt="Logo" className="w-10 h-10 brightness-0 invert" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tighter">
              L'excellence <br />
              est à portée <br />
              <span className="text-blue-300 italic underline decoration-blue-400/30">de clic.</span>
            </h1>
            <p className="text-blue-100/80 font-medium text-lg">
              Reprenez le contrôle de votre activité avec l'interface press.pro
            </p>
          </motion.div>
        </div>
      </div>

      {/* --- VOLET DROIT (Formulaire Pleine Page) --- */}
      <div className="w-full md:w-1/2 lg:w-[40%] h-full flex items-center justify-center p-8 md:p-16 bg-white">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-sm space-y-10"
        >
          {/* Logo Mobile uniquement */}
          <div className="md:hidden flex items-center gap-3 mb-8">
             <img src="/icon.png" alt="Logo" className="w-10 h-10" />
             <span className="text-2xl font-black tracking-tighter text-blue-600">press.pro</span>
          </div>

          <header>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Connexion</h2>
            <p className="text-slate-400 font-bold">Ravi de vous revoir !</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Champ Email */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Identifiant Email</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Mail size={20} />
                </div>
                <input 
                  type="email" 
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-[22px] p-5 pl-14 font-bold outline-none transition-all placeholder:text-slate-300"
                  placeholder="nom@exemple.com"
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                />
              </div>
            </div>

            {/* Champ Mot de passe */}
            <div className="space-y-3">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Mot de passe</label>
                <button type="button" className="text-xs font-bold text-blue-600 hover:underline">Oublié ?</button>
              </div>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Lock size={20} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-[22px] p-5 pl-14 pr-14 font-bold outline-none transition-all placeholder:text-slate-300"
                  placeholder="••••••••"
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Message d'Erreur */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-3"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bouton de Soumission */}
            <Button 
              disabled={isLoading} 
              className="w-full h-[70px] bg-blue-600 hover:bg-blue-700 text-white rounded-[24px] font-black text-lg shadow-2xl shadow-blue-200 transition-all active:scale-[0.98] mt-4"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="animate-spin" /> Authentification...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  SE CONNECTER <ArrowRight size={20} />
                </div>
              )}
            </Button>
          </form>


<footer className="text-center">
  <p className="text-slate-400 font-bold text-sm">
    Pas encore de compte ? <br />
    <a 
      href="https://wa.me/22898801667?text=Bonjour%20Press%20Pro%2C%20je%20souhaite%20cr%C3%A9er%20un%20compte%20pour%20mon%20pressing." 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-blue-600 hover:text-blue-700 hover:underline transition-colors flex items-center justify-center gap-1 mt-1"
    >
      Contactez l'administrateur
    </a>
  </p>
</footer>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;