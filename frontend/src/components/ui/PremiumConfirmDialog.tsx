import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertCircle, AlertTriangle, ShieldCheck, Info, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ConfirmType = "danger" | "warning" | "success" | "info" | "question";

interface PremiumConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmType;
  isLoading?: boolean;
}

const typeStyles: Record<ConfirmType, {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  buttonBg: string;
  borderColor: string;
}> = {
  danger: {
    icon: AlertCircle,
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
    buttonBg: "bg-red-600 hover:bg-red-700",
    borderColor: "border-red-100",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    buttonBg: "bg-amber-600 hover:bg-amber-700",
    borderColor: "border-amber-100",
  },
  success: {
    icon: ShieldCheck,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    buttonBg: "bg-emerald-600 hover:bg-emerald-700",
    borderColor: "border-emerald-100",
  },
  info: {
    icon: Info,
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
    buttonBg: "bg-indigo-600 hover:bg-indigo-700",
    borderColor: "border-indigo-100",
  },
  question: {
    icon: HelpCircle,
    iconBg: "bg-slate-50",
    iconColor: "text-slate-600",
    buttonBg: "bg-slate-900 hover:bg-slate-800",
    borderColor: "border-slate-100",
  },
};

const PremiumConfirmDialog = ({
  isOpen,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "question",
  isLoading = false,
}: PremiumConfirmDialogProps) => {
  const style = typeStyles[type];
  const Icon = style.icon;

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white/90 backdrop-blur-xl border-slate-200 rounded-[2rem] p-8 max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
        <AlertDialogHeader className="flex flex-col items-center text-center">
          <div className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm",
            style.iconBg
          )}>
            <Icon className={cn("w-10 h-10", style.iconColor)} />
          </div>
          <AlertDialogTitle className="text-2xl font-black text-slate-900 tracking-tight mb-2">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base font-medium text-slate-500 leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-3 sm:justify-center mt-8">
          <AlertDialogCancel className="h-14 px-8 rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all flex-1 sm:flex-none">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className={cn(
              "h-14 px-8 rounded-xl text-white font-bold shadow-lg transition-all flex-1 sm:flex-none",
              style.buttonBg
            )}
          >
            {isLoading ? "Processing..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export { PremiumConfirmDialog };
