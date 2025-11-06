import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";

// ⚠️ Assurez-vous que la variable d'environnement est bien VITE_API_BASE_URL
const API_URL = import.meta.env.VITE_API_BASE_URL;

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // Ton backend renvoie du texte brut (token)
      const token = await response.text();

      console.log("Réponse API brute:", token);

      if (!response.ok) {
        throw new Error("Identifiants incorrects");
      }

      if (!token || token.length < 15) {
        throw new Error("Le serveur n'a pas renvoyé de token valide.");
      }

      // Stockage du token
      localStorage.setItem("authToken", token);

      navigate("/dashboard");

    } catch (err: any) {
      console.error("Erreur API:", err);
      setError(err.message || "Erreur inconnue");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl w-full mx-auto mt-10">
        <div className="bg-white rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden">

          {/* COLONNE GAUCHE */}
          <div
            className="md:w-1/3 p-8 relative flex items-center justify-center text-white"
            style={{
              backgroundImage: "url('/machine a laver.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-blue-800 opacity-70"></div>
            <div className="relative z-10 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">Accès Pressing</h1>
              <p className="text-blue-200">Connectez-vous pour continuer</p>
            </div>
          </div>

          {/* COLONNE FORMULAIRE */}
          <div className="md:w-2/3 p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 md:hidden">
              Connexion
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse email
                </label>
                <input
                  type="email"
                  className="w-full border rounded-lg p-3"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  className="w-full border rounded-lg p-3"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Zone d'erreur */}
              {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              {/* Bouton */}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Se connecter
              </button>
            </form>

            {/* Lien inscription */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Pas encore de compte ?
                <Link to="/signup" className="text-blue-500 ml-1">
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
