import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shirt, Truck, Shield, CheckCircle, ArrowRight,
  BarChart3, Zap, Tag, Send, Phone, Menu, X, Users, ClipboardList, Wallet
} from "lucide-react";

const LandingPage = () => {
  const [email, setEmail] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const whatsappNumber = "22898801667";
  const whatsappMsg = encodeURIComponent("Bonjour ! Je veux essayer press pro");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMsg}`;

  const features = [
    { 
      icon: <Users className="w-8 h-8" />, 
      title: "Gestion Clients", 
      desc: "Base de données sécurisée. Historique et préférences de chaque client.",
      color: "bg-blue-600"
    },
    { 
      icon: <ClipboardList className="w-8 h-8" />, 
      title: "Suivi Commandes", 
      desc: "Tableau de bord simple : du dépôt jusqu'à la remise au client.",
      color: "bg-indigo-600"
    },
    { 
      icon: <Wallet className="w-8 h-8" />, 
      title: "Rapport Financier", 
      desc: "Suivez vos revenus, impayés et bénéfices avec précision.",
      color: "bg-emerald-600"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-200">
      
      {/* --- BANDEAU PROMO --- */}
      <div className="w-full bg-blue-600 text-white py-2 px-4 overflow-hidden">
        <motion.div 
          animate={{ x: [10, -10, 10] }}
          transition={{ duration: 5, repeat: Infinity }}
             className="max-w-screen-2xl mx-auto flex justify-center items-center gap-3 text-[10px] md:text-xs font-black tracking-[0.2em] uppercase"
        >
          <Tag className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span>Promotion Exceptionnelle : -50% sur l'abonnement</span>
        </motion.div>
      </div>

      {/* --- NAVIGATION --- */}
      <nav className="relative bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 z-50">
        <div className="w-full mx-auto px-6 lg:px-12 xl:px-24 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/icon.png" alt="Logo Press Pro" className="w-10 h-10 object-contain shadow-sm rounded-lg" />
            <span className="text-2xl font-black tracking-tighter">press.pro</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <a href={whatsappUrl} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-full font-bold transition-all flex items-center gap-2 text-sm shadow-md">
              <Phone className="w-4 h-4" /> Contact Whatsapp
            </a>
            <a href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-full font-bold transition-all flex items-center gap-2 text-sm shadow-md">
              <Users className="w-4 h-4" /> Espace Client
            </a>
          </div>

          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 shadow-lg z-50">
          <div className="w-full mx-auto px-6 lg:px-12 xl:px-24 py-4">
            <div className="flex flex-col gap-3">
              <a href={whatsappUrl} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-lg font-bold flex items-center gap-3">
                <Phone className="w-5 h-5" /> Contact Whatsapp
              </a>
              <a href="/login" className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-bold flex items-center gap-3">
                <Users className="w-5 h-5" /> Espace Client
              </a>
            </div>
          </div>
        </div>
      )}

      {/* --- HERO SECTION --- */}
      <section className="relative px-6 pt-12 pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
        <div className="w-full mx-auto px-6 lg:px-12 xl:px-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            <div className="text-center lg:text-left space-y-8">
              <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest border border-blue-100">
                🚀 Logiciel de gestion N°1
              </div>
              <h1 className="text-5xl md:text-7xl font-black leading-[0.95] tracking-tight text-slate-900">
                Gérez votre pressing <br />
                <span className="text-blue-600 italic underline decoration-blue-100">sans stress.</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-500 font-medium max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Clients, commandes et finances... Tout est centralisé dans un tableau de bord simple et ultra-précis.
              </p>

              <div className="mt-4 flex items-center gap-3">
                <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full font-semibold text-sm shadow-sm">
                  <span className="text-base">📱</span>
                  <span className="text-base">💻</span>
                  <span>Responsive — utilisable sur téléphone et PC</span>
                </span>
              </div>

              {/* --- BLOC ESSAI GRATUIT --- */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-4 md:p-6 rounded-[32px] shadow-2xl shadow-blue-200/50 border border-blue-50 max-w-md mx-auto lg:mx-0"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-black uppercase text-slate-400">14 jours d'essai gratuit</span>
                </div>
                <div className="flex flex-col gap-3">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Votre email" 
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-600 outline-none font-bold transition-all"
                  />
                  <button className="w-full bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group">
                    ESSAI GRATUIT <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            </div>

            {/* --- VISUEL --- */}
            <div className="relative">
              <div className="relative z-10 rounded-[40px] overflow-hidden shadow-2xl border-[8px] border-white transform lg:rotate-2">
                <img src="/femme contente.avif" alt="Success" className="w-full h-[400px] md:h-[550px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent" />
              </div>
              
              {/* Dashboard Flottant */}
              <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-10 -left-6 md:-left-12 z-20 w-3/4 max-w-[350px] bg-white rounded-3xl p-3 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-4 border-white"
              >
                <img src="/Dashboard.jpeg" alt="Interface" className="rounded-2xl w-full" />
                <div className="mt-3 px-2 py-1 flex justify-between items-center">
                   <span className="text-[10px] font-black text-slate-400 uppercase">Rapport Financier OK</span>
                   <CheckCircle className="text-emerald-500 w-4 h-4" />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION FONCTIONNALITÉS --- */}
      <section className="bg-white py-24 px-6 relative">
        <div className="w-full mx-auto px-6 lg:px-12 xl:px-24">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">Simple. Précis. Complet.</h2>
            <p className="text-slate-500 font-bold">L'outil qui travaille pour vous.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="p-10 rounded-[40px] bg-slate-50 hover:bg-white border border-transparent hover:border-blue-100 hover:shadow-2xl transition-all duration-300 group">
                <div className={`${f.color} w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all`}>
                  {f.icon}
                </div>
                <h3 className="text-2xl font-black mb-4">{f.title}</h3>
                <p className="text-slate-500 font-semibold leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA WHATSAPP --- */}
      <section className="py-20 px-6">
        <div className="w-full mx-auto px-6 lg:px-12 xl:px-24 bg-gradient-to-br from-blue-700 to-indigo-800 rounded-[50px] p-10 md:p-20 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] -mr-32 -mt-32 rounded-full" />
          
          <h2 className="text-3xl md:text-5xl font-black text-white mb-8 leading-tight">
            Prêt à passer à la vitesse <br /> supérieure ?
          </h2>
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <a 
              href={whatsappUrl}
              className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-5 rounded-2xl font-black text-lg shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3"
            >
              <Phone className="w-6 h-6" /> CONTACTEZ-NOUS
            </a>
            
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-full md:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20 px-10 py-5 rounded-2xl font-black text-lg transition-all"
            >
              ESSAYER GRATUITEMENT
            </button>
          </div>
          <p className="mt-8 text-blue-100 font-bold text-sm uppercase tracking-widest">
            Aucune carte bancaire requise • Compte créé en 2 minutes
          </p>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white py-12 px-6 border-t border-slate-100">
        <div className="w-full mx-auto px-6 lg:px-12 xl:px-24 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <img src="/icon.png" alt="Logo Press Pro" className="w-8 h-8 object-contain" />
            <span className="text-xl font-black tracking-tighter">press.pro</span>
          </div>
          <p className="text-slate-400 font-bold text-sm">© 2025 Press-Pro. Tous droits réservés.</p>
          <div className="flex gap-6 text-sm font-black text-slate-900 uppercase tracking-widest">
            <span className="opacity-50">L'excellence au service du linge</span>
          </div>
        </div>
      </footer>

      {/* --- BOUTON WHATSAPP FLOTTANT (Mobile) --- */}
      <a 
        href={whatsappUrl}
        className="fixed bottom-6 right-6 w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-2xl z-[100] hover:scale-110 transition-all md:hidden"
      >
        <Phone className="w-8 h-8" />
      </a>

    </div>
  );
};

export default LandingPage;