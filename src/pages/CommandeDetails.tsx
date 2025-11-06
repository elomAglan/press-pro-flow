import React from "react"; // Suppression de useState et useMemo car non utilisés
import { useParams, useNavigate } from "react-router-dom"; 
// Imports UI
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; 
import { ArrowLeft, User, DollarSign, Clock, Package, Edit, Printer } from "lucide-react";

// Imports des utilitaires. Ajout du type 'Commande'.
import { 
    getCommandes, 
    getClientById, 
    getStatutBadge, 
    getPaiementBadge,
    Commande // <-- Ajout de l'importation du type Commande
} from "./Commandes.utils"; 

// Composant Placeholder pour le QR Code
const QRCodePlaceholder = ({ commandeNumber }: { commandeNumber: string }) => (
    <div className="flex flex-col items-center justify-center p-4 h-40 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-24 h-24 text-gray-500 dark:text-gray-400">
            <rect width="100" height="100" fill="none" stroke="currentColor" strokeWidth="2" rx="5"/>
            <rect x="10" y="10" width="20" height="20" fill="currentColor"/>
            <rect x="70" y="10" width="20" height="20" fill="currentColor"/>
            <rect x="10" y="70" width="20" height="20" fill="currentColor"/>
            <rect x="45" y="45" width="10" height="10" fill="currentColor"/>
            <rect x="35" y="35" width="5" height="5" fill="currentColor"/>
        </svg>
        <p className="text-xs mt-1 text-gray-600 dark:text-gray-300">QR Code: {commandeNumber}</p>
    </div>
);

// Composant de rendu de Badge basé sur les données des utilitaires
const BadgeRenderer = ({ statut, getBadgeData }: { statut: any, getBadgeData: (s: any) => { text: string, className: string } }) => {
    const { text, className } = getBadgeData(statut);
    return <span className={className}>{text}</span>;
};


export default function CommandeDetail(props: { commande?: Commande; onBack?: () => void; onUpdate?: (updatedCommande: any) => void }) {
    const { id } = useParams<{ id: string }>(); // Récupère l'ID de l'URL
    const navigate = useNavigate();

    // Récupération de la commande à partir des données (mocks) ou utilisation de la commande fournie en props.
    const commande: Commande | undefined = props.commande ?? getCommandes().find(c => c.id === id);

    const handleBack = () => {
        if (props.onBack) return props.onBack();
        navigate("/commandes"); // Redirection vers la liste
    }

    // Gestion de l'état non trouvé
    if (!commande) {
        return (
            <div className="p-8 text-center bg-white dark:bg-gray-900 min-h-screen">
                <h1 className="text-3xl font-bold text-red-500">Commande non trouvée (ID: {id})</h1>
                <Button onClick={handleBack} className="mt-4 gap-2">
                    <ArrowLeft className="h-4 w-4" /> Retour à la liste
                </Button>
            </div>
        );
    }
    
    // Récupération du client
    const client = getClientById(commande.clientId);
    const clientName = client ? client.nom : "Client Inconnu";

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-8 font-sans max-w-6xl mx-auto">
            <div className="flex items-center justify-between border-b pb-4 mb-6">
                <div className="flex items-center gap-4">
                    <Button 
                        variant="ghost" 
                        onClick={handleBack} 
                        className="p-2 h-auto text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" /> Retour à la Liste
                    </Button>
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        Commande: <span className="text-blue-600 dark:text-blue-400">{commande.numero}</span>
                    </h1>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2 text-green-600 border-green-300 hover:bg-green-50 dark:hover:bg-gray-800">
                        <Printer className="h-4 w-4" /> Imprimer
                    </Button>
                    <Button className="gap-2 bg-yellow-500 hover:bg-yellow-600 text-white">
                        <Edit className="h-4 w-4" /> Modifier
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Colonne 1: Résumé & Client */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="shadow-xl p-6">
                        <CardHeader className="p-0 mb-4 border-b pb-2">
                            <h2 className="text-2xl font-semibold flex items-center gap-2 text-gray-800 dark:text-white"><Package className="h-6 w-6 text-blue-600" /> Détails de la Commande</h2>
                        </CardHeader>
                        <CardContent className="p-0 space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <DetailItem icon={<Clock className="h-5 w-5 text-gray-500" />} label="Date Création" value={commande.dateCreation.toLocaleDateString('fr-FR')} />
                                {/* Utilisation du nouveau composant pour le rendu des badges */}
                                <DetailItem icon={<Package className="h-5 w-5 text-gray-500" />} label="Statut Commande" value={<BadgeRenderer statut={commande.statut} getBadgeData={getStatutBadge} />} />
                                <DetailItem icon={<DollarSign className="h-5 w-5 text-gray-500" />} label="Statut Paiement" value={<BadgeRenderer statut={commande.statutPaiement} getBadgeData={getPaiementBadge} />} />
                                <DetailItem icon={<User className="h-5 w-5 text-gray-500" />} label="Client" value={clientName} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section Articles */}
                    <Card className="shadow-xl p-6">
                        <CardHeader className="p-0 mb-4 border-b pb-2">
                            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Articles ({commande.articles.length})</h2>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="space-y-3">
                                {commande.articles.map(article => (
                                    <div key={article.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <div>
                                            <p className="font-medium">{article.type} - {article.service}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{article.quantite} x {article.prixUnitaire.toLocaleString()} FCFA</p>
                                        </div>
                                        <p className="font-bold text-lg text-blue-600 dark:text-blue-400">
                                            {(article.quantite * article.prixUnitaire).toLocaleString()} FCFA
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                {/* Colonne 2: Totaux & QR Code */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="shadow-xl p-6 sticky top-4">
                        <CardHeader className="p-0 mb-4 border-b pb-2">
                            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Résumé Financier</h2>
                        </CardHeader>
                        <CardContent className="p-0 space-y-3">
                            <SummaryItem label="Total Commande" value={commande.total} highlight={false} />
                            <SummaryItem label="Montant Payé" value={commande.montantPaye} highlight={true} color="text-green-600" />
                            <SummaryItem label="Reste à Payer" value={commande.total - commande.montantPaye} highlight={true} color="text-red-600" />
                            <div className="pt-4">
                                <QRCodePlaceholder commandeNumber={commande.numero} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// Composants internes pour le rendu
const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) => (
    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex-shrink-0 pt-1">{icon}</div>
        <div>
            <p className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">{label}</p>
            {/* Le rendu utilise désormais directement le composant BadgeRenderer si nécessaire */}
            <div className="font-bold text-base text-gray-900 dark:text-white">{value}</div>
        </div>
    </div>
);

const SummaryItem = ({ label, value, highlight, color = "text-gray-900" }: { label: string, value: number, highlight: boolean, color?: string }) => (
    <div className={`flex justify-between items-center ${highlight ? 'text-xl font-bold border-t pt-3 mt-3 border-gray-200 dark:border-gray-700' : 'text-base'}`}>
        <span className={`${color}`}>{label}:</span>
        <span className={`${color}`}>{value.toLocaleString()} FCFA</span>
    </div>
);