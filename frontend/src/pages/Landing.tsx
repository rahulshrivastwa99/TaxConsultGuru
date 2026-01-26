import { useState } from "react";
// Import API functions
import { registerUser, loginUser } from "../lib/api";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Shield,
  Users,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Briefcase,
  Zap,
  BarChart3,
} from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const Landing = () => {
  const navigate = useNavigate();

  const [loginOpen, setLoginOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"client" | "ca">("client");
  const [isRegister, setIsRegister] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // --- ACTIONS & HANDLERS ---

  // 1. Logo Click -> Refresh Website
  const handleLogoClick = () => {
    window.location.href = "/";
  };

  // 2. Services Click -> Scroll to Section
  const handleServicesClick = () => {
    const section = document.getElementById("services-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  // 3. Experts Click -> Open Signup as CA
  const handleExpertsClick = () => {
    setActiveTab("ca");
    setIsRegister(true);
    setLoginOpen(true);
  };

  // 4. Get Started Click -> Open Signup as Client
  const handleGetStartedClick = () => {
    setActiveTab("client");
    setIsRegister(true);
    setLoginOpen(true);
  };

  // 5. Login Click -> Open Standard Login
  const handleLoginClick = () => {
    setIsRegister(false);
    setActiveTab("client"); // Default to client, user can switch
    setLoginOpen(true);
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
        });
        toast.success("Account created successfully!");
      } else {
        data = await loginUser({
          email,
          password,
        });
        toast.success(`Welcome back, ${data.name}!`);
      }

      // Save to storage
      localStorage.setItem("userInfo", JSON.stringify(data));

      // Force refresh/redirect to load Context
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

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    // Keep isRegister state to maintain context (Signup vs Login)
  };

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
      {/* --- HEADER --- */}
      <header className="fixed top-0 w-full border-b border-border/40 bg-background/80 backdrop-blur-md z-50 transition-all duration-300">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo with Refresh Action */}
          <div
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleLogoClick}
          >
            <img
              src="/logo-full.png"
              alt="TaxConsultGuru"
              className="h-14 md:h-16 w-auto object-contain"
            />
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2 md:gap-6">
            <button
              onClick={handleServicesClick}
              className="hidden md:block text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Services
            </button>
            <button
              onClick={handleExpertsClick}
              className="hidden md:block text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              For Experts
            </button>
            <Button onClick={handleLoginClick} variant="outline" className="px-6 border-primary/20 hover:bg-primary/5">
              Login
            </Button>
            <Button onClick={handleGetStartedClick} className="hidden sm:flex shadow-lg shadow-primary/20">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10" />
        
        <div className="container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/50 border border-secondary mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_2px_rgba(34,197,94,0.4)]"></span>
            <span className="text-xs font-semibold tracking-wide text-foreground/80 uppercase">
              Secure & Certified Platform
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 max-w-5xl mx-auto leading-tight animate-in fade-in slide-in-from-bottom-8 duration-700">
            Tax Compliance, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-600 to-purple-600">
              Simplifed & Managed.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-700 delay-100">
            Connect with dedicated Chartered Accountants instantly. We handle the complexities of GST, ITR, and Audits so you can focus on your growth.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-700 delay-200">
            <Button 
              size="lg" 
              className="h-14 px-8 text-base shadow-xl shadow-primary/20 hover:scale-105 transition-transform" 
              onClick={handleGetStartedClick}
            >
              Start Your Request <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="secondary" 
              className="h-14 px-8 text-base border border-border/50 hover:bg-secondary/80"
              onClick={handleServicesClick}
            >
              Explore Services
            </Button>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section id="services-section" className="py-24 bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Streamlined Process</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We bridge the gap between businesses and tax experts through a secure, managed workflow.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-border to-transparent border-t border-dashed border-muted-foreground/30 -z-10" />

            <Card className="border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-background/50 backdrop-blur-sm group">
              <CardContent className="p-8 text-center relative">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">1. Post Request</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Select a service like GST or ITR, describe your needs, and set your budget. It takes less than 2 minutes.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-background/50 backdrop-blur-sm group">
              <CardContent className="p-8 text-center relative">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">2. Expert Assigned</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Our smart system assigns a qualified CA. The admin oversees the process to ensure quality and deadlines.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-background/50 backdrop-blur-sm group">
              <CardContent className="p-8 text-center relative">
                <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">3. Secure Completion</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Chat privately via our bridge, share docs securely, and get work done. We handle the mediation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* --- FEATURES / BENEFITS --- */}
      <section className="py-24 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <div className="inline-flex items-center gap-2 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-bold text-primary tracking-wide uppercase">Why Choose Us</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                Tax compliance <br/> without the chaos.
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Designed for freelancers, startups, and enterprises. We take the stress out of tax season with a managed, professional approach.
              </p>
              
              <ul className="space-y-5">
                {[
                  "Verified Chartered Accountants Only",
                  "Double-Blind Privacy Protection",
                  "Real-time Status Tracking",
                  "Admin-Managed Disputes & Quality"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="font-medium text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>
              
              <Button size="lg" className="mt-10 h-12 px-8" onClick={handleGetStartedClick}>
                Start Your First Request
              </Button>
            </div>
            
            {/* Visual Abstract Graphic */}
            <div className="order-1 md:order-2 relative">
              <div className="absolute -inset-4 bg-gradient-to-tr from-primary/30 to-purple-500/30 rounded-[2rem] opacity-40 blur-3xl" />
              <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-[2rem] p-8 shadow-2xl">
                <div className="space-y-6">
                  {/* Mock UI Elements */}
                  <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border/50 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                        <BarChart3 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">GST Return Filing</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Pending Admin Approval</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 rounded-full">Processing</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border/50 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                        <Briefcase className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Company Registration</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Assigned to Expert</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 bg-green-500/10 text-green-600 border border-green-500/20 rounded-full">Active</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border/50 shadow-sm opacity-60">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                        <Shield className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Audit Report</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Completed</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-600 rounded-full">Done</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 bg-slate-950 text-slate-200">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6 cursor-pointer hover:opacity-80 transition-opacity" onClick={handleLogoClick}>
                <img
                  src="/logo-full.png"
                  alt="TaxConsultGuru"
                  className="h-12 md:h-14 w-auto object-contain"
                />
              </div>
              <p className="text-slate-400 max-w-sm leading-relaxed">
                India's most trusted managed marketplace connecting businesses with top-tier Chartered Accountants. Fast, secure, and reliable.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6">Platform</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="hover:text-primary cursor-pointer transition-colors" onClick={handleExpertsClick}>For CA Experts</li>
                <li className="hover:text-primary cursor-pointer transition-colors" onClick={handleServicesClick}>Browse Services</li>
                <li className="hover:text-primary cursor-pointer transition-colors" onClick={handleGetStartedClick}>Register</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6">Legal</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="hover:text-white cursor-pointer">Privacy Policy</li>
                <li className="hover:text-white cursor-pointer">Terms of Service</li>
                <li className="hover:text-white cursor-pointer">Contact Support</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
            <p>© 2026 TaxConsultGuru. All rights reserved.</p>
            <p>Designed for Professional Excellence</p>
          </div>
        </div>
      </footer>

      {/* --- AUTH MODAL --- */}
      <Dialog
        open={loginOpen}
        onOpenChange={(open) => {
          setLoginOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0 border-0 shadow-2xl">
          {/* Header Area */}
          <div className="bg-slate-950 p-8 text-white text-center">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold tracking-tight mb-2">
                {isRegister 
                  ? (activeTab === 'ca' ? "Join as Expert" : "Create Account")
                  : "Welcome Back"
                }
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-base">
                {isRegister
                  ? "Get started with TaxConsultGuru today"
                  : "Login to access your dashboard"}
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="p-8 bg-background">
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as "client" | "ca")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-8 h-12">
                <TabsTrigger value="client" className="text-base">Client</TabsTrigger>
                <TabsTrigger value="ca" className="text-base">Expert (CA)</TabsTrigger>
              </TabsList>

              <div className="space-y-5">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {isRegister && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Full Name</label>
                      <Input
                        placeholder="e.g. Rahul Shrivastwa"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required={isRegister}
                        className="h-11"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <Input
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11"
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
                      className="h-11"
                    />
                  </div>
                  
                  <Button type="submit" className="w-full h-11 text-base font-semibold shadow-md" disabled={isLoading}>
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {isRegister ? (activeTab === 'client' ? "Create Client Account" : "Register as Expert") : "Secure Login"}
                  </Button>
                </form>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase font-medium">
                    <span className="bg-background px-4 text-muted-foreground">
                      Or
                    </span>
                  </div>
                </div>

                <div className="text-center text-sm">
                  <button
                    type="button"
                    onClick={() => setIsRegister(!isRegister)}
                    className="text-primary hover:text-primary/80 hover:underline font-medium transition-colors"
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
    </div>
  );
};

export default Landing;