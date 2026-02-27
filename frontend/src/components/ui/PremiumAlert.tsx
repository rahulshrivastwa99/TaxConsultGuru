import React from "react";
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertType = "success" | "error" | "info" | "warning";

interface PremiumAlertProps {
  type?: AlertType;
  title: string;
  description?: string;
  className?: string;
  onClose?: () => void;
  action?: React.ReactNode;
}

const alertStyles: Record<AlertType, { 
  container: string; 
  icon: React.ElementType; 
  iconColor: string;
  accent: string;
}> = {
  success: {
    container: "bg-emerald-50/50 border-emerald-200 text-emerald-900",
    icon: CheckCircle2,
    iconColor: "text-emerald-600",
    accent: "bg-emerald-600",
  },
  error: {
    container: "bg-red-50/50 border-red-200 text-red-900",
    icon: AlertCircle,
    iconColor: "text-red-600",
    accent: "bg-red-600",
  },
  info: {
    container: "bg-indigo-50/50 border-indigo-200 text-indigo-900",
    icon: Info,
    iconColor: "text-indigo-600",
    accent: "bg-indigo-600",
  },
  warning: {
    container: "bg-amber-50/50 border-amber-200 text-amber-900",
    icon: AlertTriangle,
    iconColor: "text-amber-600",
    accent: "bg-amber-600",
  },
};

const PremiumAlert = ({
  type = "info",
  title,
  description,
  className,
  onClose,
  action,
}: PremiumAlertProps) => {
  const style = alertStyles[type];
  const Icon = style.icon;

  return (
    <div
      className={cn(
        "relative w-full rounded-2xl border p-4 backdrop-blur-sm transition-all animate-in fade-in slide-in-from-top-2 duration-300",
        style.container,
        className
      )}
    >
      {/* Accent Strip */}
      <div className={cn("absolute left-0 top-1/2 -translate-y-1/2 w-1 h-2/3 rounded-r-full", style.accent)} />
      
      <div className="flex gap-4">
        <div className={cn("mt-0.5 shrink-0", style.iconColor)}>
          <Icon className="w-5 h-5" />
        </div>
        
        <div className="flex-1">
          <h5 className="font-extrabold text-sm tracking-tight leading-none mb-1 text-inherit">
            {title}
          </h5>
          {description && (
            <p className="text-sm font-medium opacity-80 leading-relaxed">
              {description}
            </p>
          )}
          {action && <div className="mt-3">{action}</div>}
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="shrink-0 opacity-50 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export { PremiumAlert };
