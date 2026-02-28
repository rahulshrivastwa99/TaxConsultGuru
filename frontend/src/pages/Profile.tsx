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

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex flex-col relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[110%] h-[70%] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/40 via-slate-50/10 to-transparent pointer-events-none z-0" />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-50 transition-all shadow-sm">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate(getDashboardRoute())}
          >
            <span className="text-2xl font-extrabold tracking-tight text-slate-900">
              {"Tax"}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">
                Consult
              </span>
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

      <main className="flex-1 w-full container mx-auto px-4 md:px-6 py-12 max-w-3xl relative z-10">
        <div className="mb-8">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Account Settings
          </h2>
          <p className="text-slate-500 font-medium mt-1">
            Manage your personal information and security preferences.
          </p>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-6">
          {/* Profile Information Card */}
          <Card className="bg-white border-slate-200 shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">
                    Personal Information
                  </CardTitle>
                  <CardDescription className="font-medium text-slate-500">
                    Update your display name.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                  Full Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 rounded-xl font-medium text-slate-900"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email Address
                  </label>
                  <div className="h-12 bg-slate-100 border border-slate-200 rounded-xl flex items-center px-4 text-slate-500 font-medium cursor-not-allowed select-none">
                    {currentUser.email}
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold">
                    Email cannot be changed.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" /> Account Role
                  </label>
                  <div className="h-12 flex items-center">
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none font-black text-xs uppercase tracking-widest px-3 py-1">
                      {currentUser.role}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Card */}
          <Card className="bg-white border-slate-200 shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100">
                  <Lock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">
                    Security
                  </CardTitle>
                  <CardDescription className="font-medium text-slate-500">
                    Change your password (leave blank to keep current).
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                  Current Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-amber-500 rounded-xl font-medium"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                    New Password
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-amber-500 rounded-xl font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                    Confirm New Password
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-amber-500 rounded-xl font-medium"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5"
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Profile;
