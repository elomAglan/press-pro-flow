import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Shield, Loader2 } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ;

const Signup: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [role, setRole] = useState<string>("Comptoir");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas !");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      // Ton backend renvoie directement le token en texte brut
      const token = await response.text();

      console.log("Token reçu :", token);

      if (!response.ok || !token || token.length < 15) {
        throw new Error("Échec de l'inscription ou token invalide.");
      }

      // Stockage du token pour rester connecté
      localStorage.setItem("authToken", token);
      localStorage.setItem("role", role);
      localStorage.setItem("email", email);

      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
      <div className="max-w-4xl w-full mx-auto">
        <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col md:flex-row overflow-hidden">

          {/* COLONNE VISUELLE */}
          <div
            className="md:w-1/3 p-8 relative flex items-center justify-center text-white"
            style={{
              backgroundImage: "url('/machine a laver.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-blue-800 opacity-80"></div>
            <div className="relative z-10 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-extrabold mb-2 tracking-wide">Créer un compte</h1>
              <p className="text-blue-200 text-sm">Accédez à votre plateforme de blanchisserie.</p>
            </div>
          </div>

          {/* FORMULAIRE */}
          <div className="md:w-2/3 p-8 sm:p-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 md:hidden">Créer un compte</h2>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Adresse email</label>
                <input
                  type="email"
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemple@mail.com"
                  className="w-full pl-3 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-3 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="Comptoir">Comptoir (Accès limité)</option>
                  <option value="Admin">Administrateur (Accès complet)</option>
                </select>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm font-medium">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
              >
                {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                {isLoading ? "Création en cours..." : "Créer mon compte"}
              </button>
            </form>

            {/* Lien login */}
            <div className="mt-8 text-center border-t pt-6">
              <p className="text-gray-600">
                Déjà un compte ?{" "}
                <Link className="text-blue-600 font-bold hover:underline" to="/login">
                  Se connecter
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
