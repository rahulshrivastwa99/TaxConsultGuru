// src/components/landing/AuthModal.tsx
import { useState } from "react";
import { registerUser, loginUser } from "../../lib/api";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface AuthModalProps {
  loginOpen: boolean;
  setLoginOpen: (open: boolean) => void;
  activeTab: "client" | "ca";
  setActiveTab: (tab: "client" | "ca") => void;
  isRegister: boolean;
  setIsRegister: (register: boolean) => void;
}

const AuthModal = ({
  loginOpen,
  setLoginOpen,
  activeTab,
  setActiveTab,
  isRegister,
  setIsRegister,
}: AuthModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [experience, setExperience] = useState<number | "">("");
  const [certifications, setCertifications] = useState("");

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setExperience("");
    setCertifications("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let data;

      if (isRegister) {
        data = await registerUser({
          name,
          email,
          password,
          role: activeTab,
          experience: activeTab === "ca" ? Number(experience) : undefined,
          certificationDetails: activeTab === "ca" ? certifications : undefined,
        });
        toast.success("Account created successfully!");
      } else {
        data = await loginUser({
          email,
          password,
        });
        toast.success(`Welcome back, ${data.name}!`);
      }

      localStorage.setItem("userInfo", JSON.stringify(data));

      if (data.role === "client") {
        window.location.href = "/client/dashboard";
      } else if (data.role === "ca") {
        window.location.href = "/ca/dashboard";
      } else if (data.role === "admin") {
        window.location.href = "/admin/dashboard";
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={loginOpen}
      onOpenChange={(open) => {
        setLoginOpen(open);
        if (!open) resetForm();
      }}
    >
      <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0 border-0 shadow-2xl rounded-2xl">
        <div className="bg-slate-900 p-8 text-white text-center">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight mb-2 text-white">
              {isRegister
                ? activeTab === "ca"
                  ? "Join as Expert"
                  : "Create Account"
                : "Welcome Back"}
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-base">
              {isRegister
                ? "Get started with TaxConsultGuru today"
                : "Login to access your dashboard"}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8 bg-white">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "client" | "ca")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-8 h-12 bg-slate-100 rounded-xl p-1">
              <TabsTrigger
                value="client"
                className="text-base rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 font-medium"
              >
                Client
              </TabsTrigger>
              <TabsTrigger
                value="ca"
                className="text-base rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 font-medium"
              >
                Expert (CA)
              </TabsTrigger>
            </TabsList>

            <div className="space-y-5">
              <form onSubmit={handleSubmit} className="space-y-5">
                {isRegister && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Full Name
                    </label>
                    <Input
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={isRegister}
                      className="h-11 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 rounded-lg"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 rounded-lg"
                  />
                </div>
                {isRegister && activeTab === "ca" && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Experience (Years)
                      </label>
                      <Input
                        type="number"
                        placeholder="e.g. 5"
                        value={experience}
                        onChange={(e) =>
                          setExperience(
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                        required
                        className="h-11 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Certification Details
                      </label>
                      <Input
                        placeholder="e.g. CA Final (ICAI), GST Practitioner"
                        value={certifications}
                        onChange={(e) => setCertifications(e.target.value)}
                        required
                        className="h-11 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 rounded-lg"
                      />
                    </div>
                  </>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-bold shadow-md shadow-indigo-200 bg-indigo-600 hover:bg-indigo-700 text-white mt-4 rounded-xl"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {isRegister
                    ? activeTab === "client"
                      ? "Create Client Account"
                      : "Register as Expert"
                    : "Secure Login"}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase font-bold">
                  <span className="bg-white px-4 text-slate-400">Or</span>
                </div>
              </div>

              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-indigo-600 hover:text-indigo-800 hover:underline font-bold transition-colors"
                >
                  {isRegister
                    ? "Already have an account? Sign in"
                    : "New to TCG? Create Account"}
                </button>
              </div>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;