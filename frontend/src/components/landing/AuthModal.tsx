// src/components/landing/AuthModal.tsx
import { useState } from "react";
import { registerUser, loginUser, verifyOtp } from "../../lib/api";
import { 
  Loader2, 
  Mail, 
  Lock, 
  User, 
  Briefcase, 
  Award, 
  Building2, 
  UserCircle,
  KeyRound
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
  
  // New State to track if we are on the Form step or OTP step
  const [authStep, setAuthStep] = useState<"form" | "otp">("form");
  const [otp, setOtp] = useState("");

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [experience, setExperience] = useState<number | "">("");
  const [certifications, setCertifications] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setExperience("");
    setCertifications("");
    setOtp("");
    setAgreedToTerms(false);
    setAuthStep("form"); // Always reset to form
  };

  // Step 1: Handle initial login/register
  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isRegister) {
        if (!agreedToTerms) {
          toast.error("Please agree to the Terms and Service to continue.");
          setIsLoading(false);
          return;
        }
        await registerUser({
          name,
          email,
          password,
          role: activeTab,
          experience: activeTab === "ca" ? Number(experience) : undefined,
          certificationDetails: activeTab === "ca" ? certifications : undefined,
        });
        toast.success("Registration initiated. OTP sent to your email!");
        // Move to OTP step for signup
        setAuthStep("otp");
      } else {
        const data = await loginUser({
          email,
          password,
          role: activeTab,
        });
        toast.success(`Welcome back, ${data.name}!`);
        
        // Direct Success: Save user info & Token to localStorage
        localStorage.setItem("userInfo", JSON.stringify(data));

        // Redirect based on role
        if (data.role === "client") {
          window.location.href = "/client/dashboard";
        } else if (data.role === "ca") {
          window.location.href = "/ca/dashboard";
        } else if (data.role === "admin") {
          window.location.href = "/admin/dashboard";
        }
      }
    } catch (error: any) {
      console.error(error);
      
      // CRITICAL FIX: Handle unverified user (403 Forbidden)
      if (error.status === 403) {
        toast.warning(error.message || "Email not verified. Redirecting to OTP...");
        setAuthStep("otp");
      } else {
        toast.error(error.message || "Authentication failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Handle OTP Verification
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Hit the new verify-otp endpoint
      const data = await verifyOtp({ email, otp });
      
      toast.success(data.message || "Authentication successful!");

      // Save user info & Token to localStorage
      localStorage.setItem("userInfo", JSON.stringify(data));

      // Redirect based on role
      if (data.role === "client") {
        window.location.href = "/client/dashboard";
      } else if (data.role === "ca") {
        window.location.href = "/ca/dashboard";
      } else if (data.role === "admin") {
        window.location.href = "/admin/dashboard";
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Invalid or expired OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // Dynamic Text Helpers
  const getTitle = () => {
    if (authStep === "otp") return "Verify Your Email";
    if (isRegister) {
      return activeTab === "ca" ? "Join as a Tax Expert" : "Create Client Account";
    }
    return activeTab === "ca" ? "Expert Dashboard Login" : "Client Dashboard Login";
  };

  const getDescription = () => {
    if (authStep === "otp") return `Enter the 6-digit OTP sent to ${email}`;
    if (isRegister) {
      return activeTab === "ca" 
        ? "Join our network of elite financial professionals and CAs." 
        : "Start managing your tax and compliance needs seamlessly.";
    }
    return activeTab === "ca" 
      ? "Access your assigned consultations and expert tools." 
      : "Access your dashboard to track cases and documents.";
  };

  return (
    <Dialog
      open={loginOpen}
      onOpenChange={(open) => {
        setLoginOpen(open);
        if (!open) resetForm();
      }}
    >
      <DialogContent className="w-[95vw] max-w-[420px] sm:w-full sm:max-w-md p-0 overflow-y-auto max-h-[95vh] sm:overflow-hidden sm:max-h-none gap-0 border-0 shadow-2xl rounded-[1.5rem] sm:rounded-[2rem] bg-white">
        
        {/* Modern Accent Bar */}
        <div className={`h-2 w-full ${activeTab === 'ca' ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-indigo-500 to-cyan-400'}`} />

        <div className="px-8 pt-6 pb-2 text-center">
          <DialogHeader>
            <div className="mx-auto w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3 shadow-sm">
              {authStep === "otp" ? (
                <KeyRound className="w-5 h-5 text-amber-500" />
              ) : activeTab === 'ca' ? (
                <Briefcase className="w-5 h-5 text-emerald-600" />
              ) : (
                <Building2 className="w-5 h-5 text-indigo-600" />
              )}
            </div>
            <DialogTitle className="text-xl font-extrabold tracking-tight text-slate-900">
              {getTitle()}
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-xs mt-1 font-medium">
              {getDescription()}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-8 pb-8">
          {/* Only show tabs if we are on the initial form step */}
          {authStep === "form" && (
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as "client" | "ca")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6 h-12 bg-slate-100 rounded-xl p-1 border border-slate-200">
                <TabsTrigger
                  value="client"
                  className="text-xs rounded-lg text-slate-500 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-indigo-100 font-bold transition-all duration-300 flex items-center justify-center gap-2 h-full"
                >
                  <UserCircle className="w-3.5 h-3.5" />
                  Client Dashboard
                </TabsTrigger>
                <TabsTrigger
                  value="ca"
                  className="text-xs rounded-lg text-slate-500 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-emerald-100 font-bold transition-all duration-300 flex items-center justify-center gap-2 h-full"
                >
                  <Award className="w-3.5 h-3.5" />
                  Expert Dashboard
                </TabsTrigger>
              </TabsList>
              
              {/* Role Indicator Badge */}
              <div className="flex justify-center -mb-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                  activeTab === 'ca' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                }`}>
                  {activeTab === 'ca' ? 'Expert Console' : 'Client Console'}
                </span>
              </div>
            </Tabs>
          )}

          <div className="space-y-4 mt-2">
            
            {/* VIEW 1: EMAIL & PASSWORD FORM */}
            {authStep === "form" && (
              <form onSubmit={handleInitialSubmit} className="space-y-3">
                {isRegister && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <Input
                        placeholder="e.g. John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required={isRegister}
                        className="pl-9 h-11 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 rounded-lg text-xs transition-all shadow-sm"
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <Input
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-9 h-11 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 rounded-lg text-xs transition-all shadow-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      Password
                    </label>
                    {!isRegister && (
                      <a href="#" className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-700">
                        Forgot?
                      </a>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-9 h-11 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 rounded-lg text-xs transition-all shadow-sm"
                    />
                  </div>
                </div>

                {isRegister && activeTab === "ca" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
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
                        className="h-11 bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 rounded-lg text-xs shadow-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                        Certifications
                      </label>
                      <Input
                        placeholder="e.g. CA, GST"
                        value={certifications}
                        onChange={(e) => setCertifications(e.target.value)}
                        required
                        className="h-11 bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 rounded-lg text-xs shadow-sm"
                      />
                    </div>
                  </div>
                )}

                {isRegister && (
                  <div className="flex items-center space-x-2 py-2">
                    <Checkbox 
                      id="terms" 
                      checked={agreedToTerms} 
                      onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                      className={activeTab === 'ca' ? 'data-[state=checked]:bg-emerald-600 border-slate-300' : 'data-[state=checked]:bg-indigo-600 border-slate-300'}
                    />
                    <Label 
                      htmlFor="terms" 
                      className="text-[11px] font-medium text-slate-600 cursor-pointer leading-none"
                    >
                      I agree to the{" "}
                      <a 
                        href="/terms" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`font-bold hover:underline ${activeTab === 'ca' ? 'text-emerald-600' : 'text-indigo-600'}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Terms and Service
                      </a>
                    </Label>
                  </div>
                )}

                <Button
                  type="submit"
                  className={`w-full h-11 text-xs font-extrabold shadow-md mt-4 rounded-lg transition-all hover:-translate-y-0.5 ${
                    activeTab === 'ca' 
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10' 
                      : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/10'
                  } text-white`}
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {isRegister
                    ? activeTab === "client"
                      ? "Send Verification OTP"
                      : "Submit Application & Verify"
                    : "Secure Login"}
                </Button>
              </form>
            )}

            {/* VIEW 2: OTP VERIFICATION FORM */}
            {authStep === "otp" && (
              <form onSubmit={handleOtpSubmit} className="space-y-4 mt-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider text-center block mb-2">
                    6-Digit Security Code
                  </label>
                  <Input
                    type="text"
                    maxLength={6}
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    className="h-14 text-center text-xl tracking-[0.5em] font-bold bg-slate-50 border-slate-200 focus-visible:ring-amber-500 rounded-lg transition-all shadow-inner"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-xs font-extrabold shadow-md mt-4 rounded-lg transition-all hover:-translate-y-0.5 bg-slate-900 hover:bg-slate-800 text-white"
                  disabled={isLoading || otp.length < 6}
                >
                  {isLoading && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Verify & Access Dashboard
                </Button>
                
                <div className="text-center mt-4">
                   <button
                    type="button"
                    onClick={() => setAuthStep("form")}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            )}

            {/* Bottom Toggle Link (Only show on form step) */}
            {authStep === "form" && (
              <div className="text-center mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRegister(!isRegister)}
                  className={`text-xs font-bold transition-colors ${
                    activeTab === 'ca' ? 'text-emerald-600 hover:text-emerald-800' : 'text-indigo-600 hover:text-indigo-800'
                  }`}
                >
                  {isRegister
                    ? "Already have an account? Sign in"
                    : "New to TCG? Create an Account"}
                </button>
              </div>
            )}

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;