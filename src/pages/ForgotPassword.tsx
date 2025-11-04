import { useState, FormEvent } from "react";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState<string>("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Réinitialisation du mot de passe pour :", email);
    // Appel API pour envoyer email de réinitialisation
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4">Mot de passe oublié</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <button type="submit" className="w-full bg-yellow-500 text-white p-2 rounded">
          Envoyer l'email
        </button>
        <div className="mt-4 text-sm text-center">
          <a href="/" className="text-blue-500">Retour à la connexion</a>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;
