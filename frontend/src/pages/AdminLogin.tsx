import { useState } from "react";
// We use window.location for the main login action to force context reload.
import { Shield, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMockBackend } from "@/context/MockBackendContext";
import { toast } from "sonner";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useMockBackend();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await login(email, password);

      if (user && user.role === "admin") {
        toast.success("Admin Access Granted", {
          description: "Entering the Command Center...",
        });

        // ---------------------------------------------------------
        // CRITICAL FIX: Force Hard Reload
        // This ensures the Context re-initializes and fetches
        // Admin-specific data (logs, all requests) from the backend.
        // ---------------------------------------------------------
        window.location.href = "/admin/dashboard";
      } else if (user) {
        toast.error("Access Denied", {
          description: "This portal is for admins only.",
        });
        // Optional: Logout if they logged in as client by mistake
      } else {
        toast.error("Access Denied", {
          description: "Invalid credentials.",
        });
      }
    } catch {
      toast.error("Access Denied", {
        description: "Something went wrong.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-200/40 rounded-full blur-[100px] pointer-events-none" />

      <Card className="w-full max-w-md border-slate-200 bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* Top Gradient Border Accent */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-600 to-cyan-500" />

        <CardHeader className="text-center pt-10 pb-2">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-5 shadow-sm">
            <Shield className="w-8 h-8 text-indigo-600" />
          </div>
          <CardTitle className="font-extrabold text-2xl tracking-tight text-slate-900">
            Master Control
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium text-sm mt-2">
            Restricted Access — Authorized Personnel Only
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2 text-left">
              <label className="text-sm font-semibold text-slate-700">
                Admin Email
              </label>
              <Input
                type="email"
                placeholder="admin@tcg.internal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 rounded-xl text-slate-900 placeholder:text-slate-400 font-medium"
              />
            </div>

            <div className="space-y-2 text-left">
              <label className="text-sm font-semibold text-slate-700">
                Access Key
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 rounded-xl text-slate-900 placeholder:text-slate-400 font-medium pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-bold shadow-lg shadow-indigo-200 bg-indigo-600 hover:bg-indigo-700 text-white mt-4 rounded-xl transition-all"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
              Access Command Center
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs text-center font-medium text-slate-500 leading-relaxed">
              This is a secure admin portal. <br /> All access attempts are
              monitored and logged.
            </p>
            <div className="mt-4 inline-flex w-full items-center justify-center gap-2">
              <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-mono text-slate-500 font-semibold tracking-wider">
                DEMO: master@tcg.com / admin123
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
