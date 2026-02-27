import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white/80 group-[.toaster]:backdrop-blur-xl group-[.toaster]:text-slate-900 group-[.toaster]:border-slate-200 group-[.toaster]:shadow-[0_8px_30px_rgb(0,0,0,0.08)] group-[.toaster]:rounded-2xl group-[.toaster]:font-sans",
          description: "group-[.toast]:text-slate-500 group-[.toast]:font-medium",
          actionButton: "group-[.toast]:bg-indigo-600 group-[.toast]:text-white group-[.toast]:rounded-lg group-[.toast]:font-bold",
          cancelButton: "group-[.toast]:bg-slate-100 group-[.toast]:text-slate-600 group-[.toast]:rounded-lg",
          success: "group-[.toaster]:border-emerald-200 group-[.toaster]:bg-emerald-50/90",
          error: "group-[.toaster]:border-red-200 group-[.toaster]:bg-red-50/90",
          info: "group-[.toaster]:border-indigo-200 group-[.toaster]:bg-indigo-50/90",
          warning: "group-[.toaster]:border-amber-200 group-[.toaster]:bg-amber-50/90",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
