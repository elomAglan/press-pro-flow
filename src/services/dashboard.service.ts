import { DashboardData } from "../pages/Dashboard";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export async function getDashboardMetrics(): Promise<DashboardData> {
    const res = await fetch(`${API_URL}/api/dashboard/metrics`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (!res.ok) {
        throw new Error("Erreur API Dashboard");
    }

    return res.json();
}
