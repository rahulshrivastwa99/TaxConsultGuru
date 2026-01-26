import { useState } from "react";
// Remove useNavigate if not used, or keep for other links.
// We use window.location for the main login action.
import { useNavigate } from "react-router-dom";
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

  const navigate = useNavigate();
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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <Card className="w-full max-w-md border-slate-700 bg-slate-800/50">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="font-heading text-2xl text-slate-100">
            Master Control
          </CardTitle>
          <CardDescription className="text-slate-400">
            Restricted Access — Authorized Personnel Only
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
                Admin Email
              </label>
              <Input
                type="email"
                placeholder="admin@tcg.internal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
                Access Key
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-slate-700 border-slate-600 text-slate-100 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Access Command Center
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-xs text-center text-slate-500">
              This is a secure admin portal. All access attempts are logged.
            </p>
            <p className="text-xs text-center text-slate-600 mt-2">
              Demo: master@tcg.com / admin123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
