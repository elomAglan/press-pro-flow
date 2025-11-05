import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Exemple : utilisateurs (à remplacer par votre logique d'API)
    const users = [
      { email: "admin@press.com", password: "1234", role: "admin" },
      { email: "ab@press.com", password: "1234", role: "comptoir" },
    ];

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      localStorage.setItem("auth", "true");
      localStorage.setItem("role", user.role);
      localStorage.setItem("email", user.email);
      navigate("/dashboard");
    } else {
      alert("Identifiants incorrects !");
    }
  };

  return (
    // Conteneur principal (Aligné en haut)
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      
      {/* Conteneur de la carte (Centré horizontalement, large) */}
      <div className="max-w-4xl w-full mx-auto mt-10"> 
        
        {/* Carte : Division en deux colonnes (flex) */}
        <div className="bg-white rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl flex flex-col md:flex-row overflow-hidden">
          
          {/* COLONNE 1 : ICONE & TITRE avec image de fond et overlay */}
          <div 
            className="md:w-1/3 p-8 rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none relative overflow-hidden flex items-center justify-center text-white"
            style={{
              backgroundImage: "url('/machine a laver.jpg')", // Chemin de l'image
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Overlay pour assombrir l'image et rendre le texte lisible */}
            <div className="absolute inset-0 bg-blue-800 opacity-70"></div>
            
            <div className="relative z-10 text-center md:text-left"> {/* z-10 pour que le texte soit au-dessus de l'overlay */}
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto md:mx-0 mb-4">
                {/* Icône de cadenas pour la connexion */}
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold mb-2">Accès Pressing</h1>
              <p className="text-blue-200">Connectez-vous pour gérer vos commandes et votre dashboard.</p>
            </div>
          </div>

          {/* COLONNE 2 : FORMULAIRE */}
          <div className="md:w-2/3 p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 md:hidden">Connexion</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Champ Email (Vertical) */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Adresse email
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <input
                            id="email"
                            type="email"
                            placeholder="votre@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            required
                        />
                    </div>
                </div>

                {/* Champ Mot de passe (Vertical) */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Mot de passe
                        </label>
                        {/* 1. Mot de passe oublié ajouté ici */}
                        <Link 
                            to="/forgot-password" // Lien à définir
                            className="text-xs text-blue-500 hover:text-blue-600 font-medium hover:underline"
                        >
                            Mot de passe oublié ?
                        </Link>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            required
                        />
                    </div>
                </div>


                {/* Bouton de soumission */}
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-600 focus:ring-4 focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200 transform hover:-translate-y-0.5"
                >
                    Se connecter
                </button>
            </form>

            {/* Lien d'inscription */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Pas encore de compte ?{" "}
                <Link 
                  to="/signup" 
                  className="text-blue-500 hover:text-blue-600 font-semibold transition-colors duration-200 hover:underline"
                >
                  S’inscrire
                </Link>
              </p>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;