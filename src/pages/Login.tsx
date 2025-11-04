import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Exemple : utilisateurs
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
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-100 to-blue-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">Connexion Pressing</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border rounded-lg focus:ring-2 focus:ring-blue-300"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-6 border rounded-lg focus:ring-2 focus:ring-blue-300"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Se connecter
        </button>
      </form>
    </div>
  );
};

export default Login;
