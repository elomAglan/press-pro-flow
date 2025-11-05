import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";

const Signup: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas !");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Création de compte :", email, password);
      // Appel API pour créer le compte
      // await api.signup({ email, password });
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl w-full mx-auto mt-10"> 
        <div className="bg-white rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl flex flex-col md:flex-row">
          
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
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold mb-2">Créer un compte</h1>
              <p className="text-blue-200">Rejoignez-nous dès aujourd'hui et explorez nos services.</p>
            </div>
          </div>

          {/* COLONNE 2 : FORMULAIRE */}
          <div className="md:w-2/3 p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 md:hidden">Créer un compte</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Champ Email */}
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

              {/* Champ Mot de passe */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
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
                    minLength={6}
                  />
                </div>
              </div>

              {/* Champ Confirmation mot de passe */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {/* Bouton de soumission */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                    Création en cours...
                  </div>
                ) : (
                  "Créer mon compte"
                )}
              </button>
            </form>

            {/* Lien de connexion */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Déjà un compte ?{" "}
                <Link 
                  to="/login" 
                  className="text-blue-500 hover:text-blue-600 font-semibold transition-colors duration-200 hover:underline"
                >
                  Se connecter
                </Link>
              </p>
            </div>
            
            {/* Footer légal */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                En créant un compte, vous acceptez nos{" "}
                <a href="#" className="text-gray-600 hover:text-gray-800 underline">conditions d'utilisation</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;