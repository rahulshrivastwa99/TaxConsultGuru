import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Shield, Users, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMockBackend } from "@/context/MockBackendContext";
import { toast } from "sonner";

const Landing = () => {
  const navigate = useNavigate();
  // Note: We will replace useMockBackend with real API calls in the next step
  const { login, registerUser } = useMockBackend();

  const [loginOpen, setLoginOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"client" | "ca">("client");
  const [isRegister, setIsRegister] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isRegister) {
        const user = await registerUser(name, email, password, activeTab);
        if (user) {
          toast.success("Account created successfully!");
          navigate(
            activeTab === "client" ? "/client/dashboard" : "/ca/dashboard",
          );
        } else {
          toast.error("Email already exists");
        }
      } else {
        const user = await login(email, password);
        if (user) {
          toast.success(`Welcome back, ${user.name}!`);
          if (user.role === "client") navigate("/client/dashboard");
          else if (user.role === "ca") navigate("/ca/dashboard");
          else if (user.role === "admin") navigate("/admin/dashboard");
        } else {
          toast.error("Invalid credentials");
        }
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setIsRegister(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* FIXED SIZES:
               h-14 (56px) for Mobile
               h-16 (64px) for Desktop (Standard navbar logo size)
            */}
            <img
              src="/logo-full.png"
              alt="TaxConsultGuru"
              className="h-14 md:h-16 w-auto object-contain"
            />
          </div>
          <Button onClick={() => setLoginOpen(true)}>Login</Button>
        </div>
      </header>
      {/* Hero */}
      <section className="py-24 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-heading text-5xl font-bold text-foreground mb-6">
            Professional Tax Services
            <br />
            <span className="text-primary">Managed For You</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Your dedicated tax team handles everything. Simply request a service
            and our expert team takes care of the rest — seamlessly, securely,
            professionally.
          </p>
          <Button size="lg" className="px-8" onClick={() => setLoginOpen(true)}>
            Get Started
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-6">
          <h3 className="font-heading text-3xl font-bold text-center text-foreground mb-12">
            How It Works
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-xl bg-background border border-border">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <h4 className="font-heading text-xl font-semibold mb-3">
                1. Request Service
              </h4>
              <p className="text-muted-foreground">
                Select from GST, ITR, Audit, Company Registration, and more.
              </p>
            </div>
            <div className="text-center p-8 rounded-xl bg-background border border-border">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h4 className="font-heading text-xl font-semibold mb-3">
                2. Expert Assignment
              </h4>
              <p className="text-muted-foreground">
                Our system matches you with a qualified expert instantly.
              </p>
            </div>
            <div className="text-center p-8 rounded-xl bg-background border border-border">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h4 className="font-heading text-xl font-semibold mb-3">
                3. Secure Collaboration
              </h4>
              <p className="text-muted-foreground">
                Chat with our team, share documents, track progress — all in one
                place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm opacity-80">
            © 2026 TaxConsultGuru. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Login Modal */}
      <Dialog
        open={loginOpen}
        onOpenChange={(open) => {
          setLoginOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl text-center">
              {isRegister ? "Create Account" : "Welcome Back"}
            </DialogTitle>
            <DialogDescription className="text-center">
              {isRegister
                ? "Join TaxConsultGuru today"
                : "Login to access your dashboard"}
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "client" | "ca")}
            className="mt-4"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="client">Client</TabsTrigger>
              <TabsTrigger value="ca">CA / Professional</TabsTrigger>
            </TabsList>

            <TabsContent value="client" className="mt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {isRegister && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <Input
                      placeholder="Your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={isRegister}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {isRegister ? "Create Account" : "Sign In"}
                </Button>
              </form>
              <p className="text-center text-sm mt-4">
                <button
                  type="button"
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-primary hover:underline"
                >
                  {isRegister
                    ? "Already have an account? Sign in"
                    : "Don't have an account? Sign up"}
                </button>
              </p>
            </TabsContent>

            <TabsContent value="ca" className="mt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {isRegister && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Full Name (CA)
                    </label>
                    <Input
                      placeholder="CA Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={isRegister}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    placeholder="ca@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {isRegister ? "Register as CA" : "Sign In"}
                </Button>
              </form>
              <p className="text-center text-sm mt-4">
                <button
                  type="button"
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-primary hover:underline"
                >
                  {isRegister
                    ? "Already registered? Sign in"
                    : "New to TCG? Register"}
                </button>
              </p>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Landing;
