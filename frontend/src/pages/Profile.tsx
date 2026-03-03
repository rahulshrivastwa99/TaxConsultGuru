// src/pages/Profile.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Lock,
  Mail,
  Shield,
  ArrowLeft,
  Loader2,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useMockBackend } from "@/context/MockBackendContext";
import { toast } from "sonner";

const Profile = () => {
  const navigate = useNavigate();
  const { currentUser, isLoading, updateProfile } = useMockBackend();

  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !currentUser) {
      navigate("/");
    } else if (currentUser) {
      setName(currentUser.name);
    }
  }, [currentUser, isLoading, navigate]);

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Name cannot be empty");

    if (newPassword) {
      if (!currentPassword)
        return toast.error(
          "Please enter your current password to set a new one",
        );
      if (newPassword !== confirmPassword)
        return toast.error("New passwords do not match");
      if (newPassword.length < 6)
        return toast.error("Password must be at least 6 characters");
    }

    setIsSaving(true);
    try {
      await updateProfile(name, currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      // Error handled by context
    } finally {
      setIsSaving(false);
    }
  };

  const getDashboardRoute = () => {
    if (currentUser.role === "admin") return "/admin/dashboard";
    if (currentUser.role === "ca") return "/ca/dashboard";
    return "/client/dashboard";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex flex-col relative overflow-hidden">
      {/* Background Decor - Refined Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-200/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50 transition-all">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate(getDashboardRoute())}
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-xl">T</span>
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-slate-900">
              {"Tax"}
              <span className="text-indigo-600">Consult</span>
              {"Guru"}
            </span>
          </div>
          <Button
            variant="ghost"
            className="text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-bold rounded-xl h-11"
            onClick={() => navigate(getDashboardRoute())}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="flex-1 w-full container mx-auto px-4 md:px-6 py-12 max-w-4xl relative z-10">
        <div className="flex flex-col md:flex-row gap-8 items-start mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="relative group">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-white text-3xl md:text-4xl font-black shadow-2xl shadow-indigo-200">
              {getInitials(currentUser.name)}
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 md:w-10 md:h-10 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center shadow-lg" title="Verified Member">
              <Shield className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                {currentUser.name}
              </h2>
              <Badge className="bg-indigo-600/10 text-indigo-700 hover:bg-indigo-600/20 border-none font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full">
                {currentUser.role}
              </Badge>
            </div>
            <p className="text-slate-500 font-medium flex items-center gap-2">
              <Mail className="w-4 h-4" /> {currentUser.email}
            </p>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden">
              <CardHeader className="p-8 border-b border-slate-100">
                <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-3">
                  <User className="w-5 h-5 text-indigo-600" /> Personal Information
                </CardTitle>
                <CardDescription className="text-slate-500 font-medium pt-1 text-base">
                  Update your profile name and view fixed contact details.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700 ml-1">
                    Display Name
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="h-14 bg-slate-50 border-slate-200 focus-visible:ring-indigo-600 focus-visible:ring-offset-0 rounded-2xl font-medium text-slate-900 text-base"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3 opacity-80">
                    <label className="text-sm font-bold text-slate-700 ml-1">
                      Phone Number
                    </label>
                    <div className="h-14 bg-slate-100/50 border border-slate-200 rounded-2xl flex items-center px-4 text-slate-600 font-medium select-none cursor-default">
                      {currentUser.phoneNumber || "Not provided"}
                    </div>
                  </div>
                  <div className="space-y-3 opacity-80">
                    <label className="text-sm font-bold text-slate-700 ml-1">
                      Email Address
                    </label>
                    <div className="h-14 bg-slate-100/50 border border-slate-200 rounded-2xl flex items-center px-4 text-slate-600 font-medium select-none cursor-default">
                      {currentUser.email}
                    </div>
                  </div>
                </div>

                {currentUser.role === "ca" && (
                  <div className="pt-6 border-t border-slate-100 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3 opacity-80">
                        <label className="text-sm font-bold text-slate-700 ml-1">
                          Experience (Years)
                        </label>
                        <div className="h-14 bg-slate-100/50 border border-slate-200 rounded-2xl flex items-center px-4 text-slate-600 font-medium select-none cursor-default">
                          {currentUser.experience || 0}
                        </div>
                      </div>
                      <div className="space-y-3 opacity-80">
                        <label className="text-sm font-bold text-slate-700 ml-1">
                          Certification Status
                        </label>
                        <div className="h-14 bg-slate-100/50 border border-slate-200 rounded-2xl flex items-center px-4 text-slate-600 font-medium select-none cursor-default">
                          Verified Expert
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-700 ml-1">
                        Professional Credentials
                      </label>
                      <div className="p-4 bg-indigo-50/30 border border-indigo-100 rounded-2xl min-h-[100px] text-indigo-900/70 font-medium italic">
                        {currentUser.certificationDetails || "Verified ICAI Member - Details locked by Admin"}
                      </div>
                      <p className="text-[11px] text-slate-400 font-bold ml-1 flex items-center gap-1">
                        <Shield className="w-3 h-3 text-emerald-500" /> Verified CA details can only be modified through support.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Security Section */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden">
              <CardHeader className="p-8 border-b border-slate-100">
                <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-3">
                  <Lock className="w-5 h-5 text-amber-600" /> Security & Password
                </CardTitle>
                <CardDescription className="text-slate-500 font-medium pt-1 text-base">
                  Secure your account by updating your login credentials.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700 ml-1">
                    Current Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter current password to verify"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="h-14 bg-slate-50 border-slate-200 focus-visible:ring-amber-600 focus-visible:ring-offset-0 rounded-2xl font-medium text-base"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 ml-1">
                      New Password
                    </label>
                    <Input
                      type="password"
                      placeholder="Min. 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-14 bg-slate-50 border-slate-200 focus-visible:ring-indigo-600 focus-visible:ring-offset-0 rounded-2xl font-medium text-base"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 ml-1">
                      Confirm New Password
                    </label>
                    <Input
                      type="password"
                      placeholder="Repeat new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-14 bg-slate-50 border-slate-200 focus-visible:ring-indigo-600 focus-visible:ring-offset-0 rounded-2xl font-medium text-base"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:sticky lg:top-32 space-y-6">
            <Card className="bg-indigo-600 text-white border-none shadow-2xl shadow-indigo-200 rounded-[2.5rem] overflow-hidden p-8">
              <h4 className="text-xl font-black mb-4 tracking-tight">Need Help?</h4>
              <p className="text-indigo-100 font-medium text-sm leading-relaxed mb-8">
                If you encounter any issues while updating your profile or need higher-level authorization changes, our support team is ready to assist.
              </p>
              <Button className="w-full h-14 bg-white text-indigo-700 hover:bg-indigo-50 font-bold rounded-2xl transition-all shadow-xl shadow-indigo-900/20">
                Contact Support
              </Button>
            </Card>

            <div className="bg-white/40 backdrop-blur-md p-2 rounded-[2.8rem] shadow-xl border border-white/60">
              <Button
                type="submit"
                disabled={isSaving}
                className="w-full h-16 bg-slate-900 hover:bg-indigo-700 text-white font-black text-lg rounded-[2.2rem] transition-all hover:-translate-y-1 shadow-2xl disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {isSaving ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-3" /> Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </main>
      
      {/* Dynamic Style for animations */}
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-profile {
          animation: fadeInScale 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};

export default Profile;
