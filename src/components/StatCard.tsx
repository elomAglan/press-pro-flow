import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  variant?: "default" | "success" | "warning" | "danger";
}

export function StatCard({ title, value, icon: Icon, trend, variant = "default" }: StatCardProps) {
  const variantStyles = {
    default: "text-primary",
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
  };

  return (
    <Card className="bg-gradient-card p-6 shadow-md transition-all hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {trend && (
            <p className={cn("text-sm font-medium", trend.positive ? "text-success" : "text-danger")}>
              {trend.positive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        <div className={cn("rounded-lg bg-muted p-3", variantStyles[variant])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}
