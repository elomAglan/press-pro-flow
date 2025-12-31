import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { getAllCommandes } from "../services/commande.service";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  List, Plus, Search, Calendar, FileText, 
  FileSpreadsheet, Eye, ChevronDown, Package 
} from "lucide-react";

// --- 1. REMPLACEMENT PAR PDFMAKE ---
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

// Assignation des polices virtuelles (nécessaire pour pdfmake)
(pdfMake as any).vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

interface Commande {
  id: number;
  clientNom: string;
  articles?: string[];
  montantsNets?: number[];
  montantNetTotal?: number;
  dateReception?: string;
  dateLivraison?: string;
  statut?: string;
}

export default function Commandes() {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const navigate = useNavigate();

  // --- FORMATAGE FIABLE DES MONTANTS ---
  const formatNumber = (val: number | undefined) => {
    if (val === undefined || val === null || isNaN(val)) return "0";
    const rounded = Math.round(val);
    return new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(rounded);
  };

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllCommandes();
        const dataWithTotals = data.map((c: any) => ({
          ...c,
          montantNetTotal:
            c.montantsNets?.reduce((sum: number, m: number) => sum + m, 0) ?? 0,
        }));
        setCommandes(dataWithTotals.sort((a: any, b: any) => b.id - a.id));
      } catch (err) {
        console.error("Erreur récupération commandes:", err);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return commandes.filter((c) => {
      const matchSearch = (c.clientNom ?? "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchDate = !filterDate || c.dateReception === filterDate;
      const matchStatus = !filterStatus || c.statut === filterStatus;
      return matchSearch && matchDate && matchStatus;
    });
  }, [commandes, searchTerm, filterDate, filterStatus]);

  const getStatusColor = (status: string | undefined) => {
    const s = status?.toLowerCase() || "";
    if (s.includes("livre") || s.includes("termine") || s.includes("paye")) 
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    if (s.includes("attente") || s.includes("cours")) 
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    if (s.includes("annule") || s.includes("rejete")) 
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
  };

  // --- 2. FONCTION EXPORT PDF CORRIGÉE (Sans séparateur d'espace/point) ---
  const exportPDF = () => {
    const body = [
      ["N.", "Client", "Articles", "Total (FCFA)", "Livraison", "Statut"],
      ...filtered.map((c, i) => [
        (filtered.length - i).toString(),
        c.clientNom || "",
        (c.articles?.length || 0).toString(),
        // MODIFICATION ICI : On utilise Math.round().toString() au lieu de formatNumber()
        // Cela affiche "10000" au lieu de "10 000" ou "10.000"
        Math.round(c.montantNetTotal || 0).toString(), 
        c.dateLivraison || "",
        c.statut || ""
      ])
    ];
  
    const docDefinition: any = {
      content: [
        { text: "LISTE DES COMMANDES", style: "header" },
        {
          table: {
            headerRows: 1,
            widths: ["auto", "*", "auto", "auto", "auto", "auto"],
            body
          },
          layout: "lightHorizontalLines"
        }
      ],
      styles: {
        header: { fontSize: 16, bold: true, margin: [0, 0, 0, 10] }
      }
    };
  
    pdfMake.createPdf(docDefinition).download("commandes.pdf");
  };

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filtered.map((c, i) => ({
        "N.": filtered.length - i,
        "Client": c.clientNom,
        "Articles": c.articles?.length ?? 0,
        "Montant (FCFA)": c.montantNetTotal,
        "Livraison": c.dateLivraison,
        "Statut": c.statut,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Commandes");
    XLSX.writeFile(workbook, `commandes.xlsx`);
  };

  const uniqueStatuses = Array.from(new Set(commandes.map((c) => c.statut).filter(Boolean)));

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      
      {/* HEADER */}
      <div className="p-4 md:p-8 pb-4 space-y-6 flex-none">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <List className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight dark:text-white">Commandes</h1>
              <p className="text-sm text-muted-foreground">{filtered.length} commande(s) filtrees</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="h-10 border-gray-200" onClick={exportPDF}>
              <FileText className="h-4 w-4 mr-2 text-red-500" /> PDF
            </Button>
            <Button variant="outline" size="sm" className="h-10 border-gray-200" onClick={exportExcel}>
              <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" /> Excel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white h-10" onClick={() => navigate("/commandes/nouvelle")}>
              <Plus className="h-4 w-4 mr-2" /> Nouvelle Commande
            </Button>
          </div>
        </div>

        {/* FILTERS CARD */}
        <Card className="p-4 shadow-sm border-gray-200 dark:border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-11 bg-white dark:bg-gray-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="relative group">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none group-focus-within:text-blue-600 transition-colors" />
                <Input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="pl-10 pr-2 h-11 bg-white dark:bg-gray-800 text-[11px] w-full focus-visible:ring-2 focus-visible:ring-blue-500"
                />
              </div>
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full h-11 pl-3 pr-8 rounded-md border border-input bg-white dark:bg-gray-800 text-[11px] appearance-none"
                >
                  <option value="">Tous les statuts</option>
                  {uniqueStatuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* TABLEAU (Desktop) ET LISTE (Mobile) */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-8">
        
        {/* --- 3. VUE MOBILE (AJOUTÉE) --- */}
        <div className="md:hidden space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-gray-500">Aucune commande trouvée</div>
          ) : (
            filtered.map((c) => (
              <Card 
                key={c.id} 
                className="p-4 flex flex-col gap-3 active:scale-98 transition-transform"
                onClick={() => navigate(`/commandes/${c.id}`)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{c.clientNom}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Calendar size={12} /> Livraison : {c.dateLivraison || "--/--"}
                    </p>
                  </div>
                  <Badge className={`${getStatusColor(c.statut)} border-none px-2 py-0.5 text-[10px]`}>
                    {c.statut}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Package size={14} />
                    <span>{c.articles?.length ?? 0} article(s)</span>
                  </div>
                  <span className="font-bold text-blue-600 text-lg">
                    {formatNumber(c.montantNetTotal)} F
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* --- VUE DESKTOP (TABLEAU) --- */}
        <div className="hidden md:block">
          <Card className="overflow-hidden border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/80">
                <tr>
                  {["#", "Client", "Articles", "Montant Net", "Livraison", "Statut", "Action"].map((h) => (
                    <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map((c, index) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 cursor-pointer" onClick={() => navigate(`/commandes/${c.id}`)}>
                    <td className="px-6 py-4 text-sm font-mono">{filtered.length - index}</td>
                    <td className="px-6 py-4 text-sm font-bold">{c.clientNom}</td>
                    <td className="px-6 py-4 text-sm">{c.articles?.length ?? 0} art.</td>
                    <td className="px-6 py-4 text-sm font-bold text-blue-600">
                      {formatNumber(c.montantNetTotal)} FCFA
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{c.dateLivraison || "--/--"}</td>
                    <td className="px-6 py-4">
                      <Badge className={`${getStatusColor(c.statut)} border-none px-3 py-1`}>
                        {c.statut}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Button size="sm" variant="secondary" className="bg-blue-50 text-blue-600">
                        <Eye className="h-4 w-4 mr-2" /> Voir
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-muted-foreground">
                      Aucune commande ne correspond à votre recherche.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </div>
  );
}