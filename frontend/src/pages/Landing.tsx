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
  Phone,
  Mail,
  Menu,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const Landing = () => {
  const navigate = useNavigate();

  const [loginOpen, setLoginOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"client" | "ca">("client");
  const [isRegister, setIsRegister] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [experience, setExperience] = useState<number | "">("");
  const [certifications, setCertifications] = useState("");

  // --- ACTIONS & HANDLERS ---

  const handleLogoClick = () => {
    window.location.href = "/";
  };

  const handleServicesClick = () => {
    setMobileMenuOpen(false);
    const section = document.getElementById("services-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleExpertsClick = () => {
    setMobileMenuOpen(false);
    setActiveTab("ca");
    setIsRegister(true);
    setLoginOpen(true);
  };

  const handleGetStartedClick = () => {
    setMobileMenuOpen(false);
    setActiveTab("client");
    setIsRegister(true);
    setLoginOpen(true);
  };

  const handleLoginClick = () => {
    setMobileMenuOpen(false);
    setIsRegister(false);
    setActiveTab("client");
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

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setExperience("");
    setCertifications("");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-500/20 overflow-x-hidden flex flex-col">
      {/* --- INJECTED CUSTOM CSS FOR SMOOTH FLOATING ANIMATIONS --- */}
      <style>{`
        @keyframes customFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: customFloat 6s ease-in-out infinite;
        }
      `}</style>

      {/* --- HEADER --- */}
      <header className="fixed top-0 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md z-50 transition-all duration-300">
        <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleLogoClick}
          >
            <span className="text-2xl font-extrabold tracking-tight text-slate-900">
              Tax
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">
                Consult
              </span>
              Guru
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            <button
              onClick={handleServicesClick}
              className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Services
            </button>
            <button
              onClick={handleExpertsClick}
              className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
            >
              For Experts
            </button>
          </nav>

          {/* Right Side Actions & Icons */}
          <div className="flex items-center gap-3 md:gap-5">
            {/* Contact Icons (Hidden on mobile) */}
            <div className="hidden md:flex items-center gap-4 text-slate-400 mr-2">
              <Phone className="w-5 h-5 hover:text-indigo-600 cursor-pointer transition-colors" />
              <Mail className="w-5 h-5 hover:text-indigo-600 cursor-pointer transition-colors" />
              <div className="cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center">
                <img
                  src="/Picsart_26-02-26_20-21-22-387.png"
                  alt="WhatsApp"
                  className="w-6 h-6 object-contain"
                />
              </div>
            </div>

            <Button
              onClick={handleLoginClick}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 hidden sm:flex shadow-md shadow-indigo-200"
            >
              Login
            </Button>

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-2 text-slate-600 hover:text-indigo-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-200 shadow-xl p-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
            <button
              onClick={handleServicesClick}
              className="text-left font-semibold text-slate-700 py-2 hover:text-indigo-600"
            >
              Services
            </button>
            <button
              onClick={handleExpertsClick}
              className="text-left font-semibold text-slate-700 py-2 hover:text-indigo-600"
            >
              For Experts
            </button>
            <Button
              onClick={handleLoginClick}
              className="w-full bg-indigo-600 hover:bg-indigo-700 mt-2"
            >
              Login
            </Button>
            <Button
              onClick={handleGetStartedClick}
              variant="outline"
              className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              Get Started
            </Button>
          </div>
        )}
      </header>

      {/* --- HERO SECTION WITH VISIBLE VIDEO BACKGROUND --- */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 min-h-[90vh] flex items-center">
        {/* === BACKGROUND VIDEO LAYER === */}
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-slate-100">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source
              src="/Video_Generation_Request_Fulfilled.mp4"
              type="video/mp4"
            />
          </video>
          {/* Overlay to ensure text visibility but keeps video highly visible on the right */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/50 to-transparent"></div>
        </div>
        {/* ============================== */}
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column: Text & CTA */}
            <div className="text-left animate-in fade-in slide-in-from-bottom-8 duration-700">
              <h1 className="text-5xl md:text-6xl lg:text-[4rem] font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]">
                Expert Tax & <br /> Financial <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">
                  Compliance Solutions
                </span>{" "}
                <br />
                Made Simple.
              </h1>

              <p className="text-lg text-slate-800 max-w-lg mb-8 font-medium">
                Connect with top-tier Chartered Accountants for GST, ITR
                filings, and company registrations. We handle the complex
                paperwork so you can focus on scaling your business.
              </p>

              {/* Search Bar */}
              <div className="flex w-full max-w-md items-center space-x-2 border border-slate-300 bg-white/95 backdrop-blur-md rounded-xl p-1.5 shadow-md hover:shadow-lg transition-shadow mb-8">
                <Input
                  type="text"
                  placeholder="e.g. GST Registration"
                  className="border-0 focus-visible:ring-0 shadow-none text-base bg-transparent font-medium placeholder:text-slate-400"
                />
                <Button
                  onClick={handleGetStartedClick}
                  className="bg-[#0b1b36] hover:bg-slate-800 text-white px-8 h-11 rounded-lg font-semibold"
                >
                  Search
                </Button>
              </div>

              {/* Recommended Services Pills */}
              <div className="mb-8">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-3">
                  Popular Services
                </p>
                <div className="flex flex-wrap gap-2">
                  <span
                    onClick={handleServicesClick}
                    className="px-4 py-2 bg-white/80 text-indigo-700 border border-indigo-200 shadow-sm text-sm font-semibold rounded-full cursor-pointer hover:bg-indigo-50 transition-colors backdrop-blur-md"
                  >
                    Company Registration
                  </span>
                  <span
                    onClick={handleServicesClick}
                    className="px-4 py-2 bg-white/80 text-cyan-700 border border-cyan-200 shadow-sm text-sm font-semibold rounded-full cursor-pointer hover:bg-cyan-50 transition-colors backdrop-blur-md"
                  >
                    GST Registration
                  </span>
                  <span
                    onClick={handleServicesClick}
                    className="px-4 py-2 bg-white/80 text-emerald-700 border border-emerald-200 shadow-sm text-sm font-semibold rounded-full cursor-pointer hover:bg-emerald-50 transition-colors backdrop-blur-md"
                  >
                    ISO Registration
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Button
                  size="lg"
                  className="h-14 px-8 text-base font-semibold shadow-xl shadow-indigo-600/20 bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                  onClick={handleGetStartedClick}
                >
                  Get Quotation <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-base font-semibold border-2 border-slate-300 text-slate-800 bg-white/80 hover:bg-white hover:border-slate-400 rounded-xl backdrop-blur-md"
                  onClick={handleServicesClick}
                >
                  Explore Services
                </Button>
              </div>
            </div>

            {/* Right Column */}
            <div className="relative hidden lg:flex h-full min-h-[550px] w-full items-center justify-center animate-in fade-in slide-in-from-right-12 duration-700 delay-200">
              <div className="relative w-full max-w-[420px] h-[400px]"></div>
            </div>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section id="services-section" className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-slate-900">
              Streamlined Process
            </h2>
            <p className="text-slate-600 max-w-xl mx-auto text-lg">
              We bridge the gap between businesses and tax experts through a
              secure, managed workflow.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-slate-300 to-transparent border-t border-dashed border-slate-300 -z-10" />

            <Card className="border-0 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 bg-white group rounded-2xl">
              <CardContent className="p-8 text-center relative">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 group-hover:bg-indigo-100 transition-all duration-300">
                  <FileText className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  1. Post Request
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Select a service like GST or ITR, describe your needs, and set
                  your budget. It takes less than 2 minutes.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 bg-white group rounded-2xl">
              <CardContent className="p-8 text-center relative">
                <div className="w-16 h-16 rounded-2xl bg-cyan-50 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 group-hover:bg-cyan-100 transition-all duration-300">
                  <Users className="w-8 h-8 text-cyan-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  2. Expert Assigned
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Our smart system assigns a qualified CA. The admin oversees
                  the process to ensure quality and deadlines.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 bg-white group rounded-2xl">
              <CardContent className="p-8 text-center relative">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 group-hover:bg-emerald-100 transition-all duration-300">
                  <Shield className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  3. Secure Completion
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Chat privately via our bridge, share docs securely, and get
                  work done. We handle the mediation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* --- FEATURES / BENEFITS --- */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <div className="inline-flex items-center gap-2 mb-6">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Zap className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="text-sm font-bold text-indigo-600 tracking-wide uppercase">
                  Why Choose Us
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
                Tax compliance <br /> without the chaos.
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                Designed for freelancers, startups, and enterprises. We take the
                stress out of tax season with a managed, professional approach.
              </p>

              <ul className="space-y-5">
                {[
                  "Verified Chartered Accountants Only",
                  "Double-Blind Privacy Protection",
                  "Real-time Status Tracking",
                  "Admin-Managed Disputes & Quality",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="font-semibold text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>

              <Button
                size="lg"
                className="mt-10 h-14 px-8 bg-slate-900 hover:bg-slate-800 text-white text-base shadow-lg rounded-xl"
                onClick={handleGetStartedClick}
              >
                Start Your First Request
              </Button>
            </div>

            <div className="order-1 md:order-2 relative">
              <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-200/40 to-cyan-200/40 rounded-[2rem] opacity-50 blur-3xl" />
              <div className="relative bg-slate-50/80 backdrop-blur-xl border border-slate-100 rounded-[2rem] p-8 shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-50 rounded-xl">
                        <Briefcase className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-800">
                          GST Return Filing
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Pending Admin Approval
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-full">
                      Processing
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-50 rounded-xl">
                        <Users className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-800">
                          Company Registration
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Assigned to Expert
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full">
                      Active
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm opacity-60">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-100 rounded-xl">
                        <Shield className="w-6 h-6 text-slate-500" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-800">
                          Audit Report
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Completed
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
                      Done
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CLEAN DARK FOOTER --- */}
      <footer className="mt-auto py-16 bg-slate-900 text-slate-300">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div
                className="flex items-center gap-3 mb-6 cursor-pointer hover:opacity-80 transition-opacity text-2xl font-extrabold tracking-tight text-white"
                onClick={handleLogoClick}
              >
                Tax<span className="text-indigo-400">Consult</span>Guru
              </div>
              <p className="text-slate-400 max-w-sm leading-relaxed">
                India's most trusted managed marketplace connecting businesses
                with top-tier Chartered Accountants. Fast, secure, and reliable.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6">Platform</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li>
                  <a
                    href="#"
                    className="hover:text-indigo-400 cursor-pointer transition-colors block"
                  >
                    For CA Experts
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-indigo-400 cursor-pointer transition-colors block"
                  >
                    Browse Services
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-indigo-400 cursor-pointer transition-colors block"
                  >
                    Register
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6">Legal</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li>
                  <a
                    href="/privacy"
                    className="hover:text-white cursor-pointer transition-colors block"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="/terms"
                    className="hover:text-white cursor-pointer transition-colors block"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    className="hover:text-white cursor-pointer transition-colors block"
                  >
                    Contact Support
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
            <p>
              © {new Date().getFullYear()} TaxConsultGuru. All rights reserved.
            </p>
            <p className="mt-2 md:mt-0">Designed for Professional Excellence</p>
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
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value),
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
    </div>
  );
};

export default Landing;
