import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Briefcase,
  LogOut,
  User,
  Radio,
  WifiOff,
  MessageCircle,
  CheckCircle,
  Clock,
  Send,
  Shield,
  Loader2,
  BookOpen,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMockBackend, ServiceRequest } from "@/context/MockBackendContext";
import { useSocket } from "@/context/SocketContext";
import { toast } from "sonner";
import { PremiumAlert } from "@/components/ui/PremiumAlert";

const CADashboard = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    isLoading, // 1. Get Loading State
    logout,
    requests,
    placeBid,
    caMessages,
    addCAMessage,
    refreshData,
  } = useMockBackend();
  const { socket } = useSocket();

  const [isListening, setIsListening] = useState(true);
  const [seenJobIds, setSeenJobIds] = useState<Set<string>>(new Set());

  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatRequestId, setChatRequestId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");

  // Bidding State
  const [selectedJob, setSelectedJob] = useState<ServiceRequest | null>(null);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [bidPrice, setBidPrice] = useState("");
  const [bidProposal, setBidProposal] = useState("");
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);

  useEffect(() => {
    // 2. Wait for loading to finish before checking user
    if (!isLoading) {
      if (!currentUser || currentUser.role !== "ca") {
        navigate("/");
      }
    }
  }, [currentUser, isLoading, navigate]);

  useEffect(() => {
    if (!socket || !isListening) return;

    const handleNewJob = (newJob: any) => {
      // Avoid duplicates
      if (seenJobIds.has(newJob.id || newJob._id)) return;

      setSeenJobIds((prev) => new Set(prev).add(newJob.id || newJob._id));

      toast.info("New Job Opportunity!", {
        description: `${newJob.serviceName} - ₹${newJob.budget.toLocaleString()}`,
        action: {
          label: "Bid Now",
          onClick: () => handleOpenBidDialog(newJob),
        },
        duration: 10000,
      });
      refreshData(); // Sync the list
    };

    const handleAccountVerified = () => {
      toast.success("Account Verified!", {
        description: "You can now place bids on live jobs.",
      });
      refreshData();
    };

    const handleWorkspaceUnlocked = (data: any) => {
      toast.success("Workspace Unlocked!", {
        description: "A client has unlocked a workspace for you.",
      });
      refreshData();
    };

    socket.on("new_live_job", handleNewJob);
    socket.on("account_verified", handleAccountVerified);
    socket.on("workspace_unlocked", handleWorkspaceUnlocked);

    return () => {
      socket.off("new_live_job", handleNewJob);
      socket.off("account_verified", handleAccountVerified);
      socket.off("workspace_unlocked", handleWorkspaceUnlocked);
    };
  }, [socket, isListening, refreshData, seenJobIds]);

  // 3. Show Spinner while loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // 4. Safety Check
  if (!currentUser || currentUser.role !== "ca") return null;

  // Jobs this CA has accepted (pending approval or active)
  const myJobs = requests.filter(
    (r) =>
      r.caId === currentUser.id &&
      !r.isArchived &&
      !r.isWorkspaceUnlocked &&
      (r.status === "pending_approval" ||
        r.status === "active" ||
        r.status === "awaiting_payment"),
  );

  const workspaceJobs = requests.filter(
    (r) =>
      r.caId === currentUser.id &&
      r.isWorkspaceUnlocked === true &&
      !r.isArchived,
  );

  const pastJobs = requests.filter(
    (r) => r.caId === currentUser.id && r.isArchived === true,
  );

  // Jobs available for bidding (not accepted by any CA, not completed, not cancelled)
  const availableJobs = requests.filter(
    (r) =>
      (!r.caId || r.caId === null || r.caId === "") &&
      r.status !== "completed" &&
      r.status !== "cancelled" &&
      r.status !== "pending_approval", // Exclude jobs already bid on and pending approval
  );

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleOpenBidDialog = (job: ServiceRequest) => {
    setSelectedJob(job);
    setBidPrice((job.budget || 0).toString());
    setIsBidModalOpen(true);
  };

  const handleSubmitBid = async () => {
    if (!selectedJob || !currentUser || !bidPrice || !bidProposal) {
      toast.error("Please fill all fields");
      return;
    }

    setIsSubmittingBid(true);
    try {
      await placeBid({
        requestId: selectedJob?.id || "",
        price: Number(bidPrice),
        proposalText: bidProposal,
      });

      // Show success toast
      toast.success("Bid submitted successfully!");

      // Optional: Emit socket event so client gets it instantly
      if (socket) {
        socket.emit("new_bid", { requestId: selectedJob.id });
      }

      // Mark as seen so it doesn't pop up again
      setSeenJobIds((prev) => new Set(prev).add(selectedJob.id));

      // Close modal and clear inputs
      setIsBidModalOpen(false);
      setSelectedJob(null);
      setBidPrice("");
      setBidProposal("");
    } catch (e) {
      // Error handled by context toast or API layer
    } finally {
      setIsSubmittingBid(false);
    }
  };

  const openChat = (requestId: string) => {
    setChatRequestId(requestId);
    setChatOpen(true);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !chatRequestId || !currentUser) return;
    addCAMessage(
      chatRequestId,
      currentUser.id,
      currentUser.name,
      "ca",
      newMessage,
    );
    setNewMessage("");
  };

  const messages = chatRequestId ? caMessages[chatRequestId] || [] : [];

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col overflow-x-hidden">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50 h-20 md:h-24 flex items-center shadow-sm">
        <div className="container mx-auto px-4 md:px-8 flex items-center justify-between gap-4">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-600/20 group-hover:rotate-3 transition-transform">
              <Briefcase className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-black text-xl md:text-2xl tracking-tight text-slate-900 leading-none">
                {"Tax"}
                <span className="text-indigo-600">Consult</span>
                {"Guru"}
              </h1>
              <div className="flex items-center gap-1.5 mt-1">
                <Badge className="bg-indigo-50 text-indigo-700 border-none font-black text-[9px] tracking-widest uppercase px-1.5 py-0">
                  EXPERT
                </Badge>
                <div className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="text-[10px] font-bold text-slate-400 tracking-tighter uppercase whitespace-nowrap">
                  Premium Dashboard
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            {/* Compact Listening Toggle */}
            <div
              className={`hidden sm:flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all duration-300 cursor-pointer ${
                isListening
                  ? "bg-emerald-50 border-emerald-100 shadow-inner"
                  : "bg-slate-50 border-slate-200"
              }`}
              onClick={() => setIsListening(!isListening)}
            >
              <div className="relative">
                <Radio
                  className={`w-4 h-4 ${isListening ? "text-emerald-500" : "text-slate-400"}`}
                />
                {isListening && (
                  <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/50" />
                )}
              </div>
              <span
                className={`text-xs font-black uppercase tracking-widest ${
                  isListening ? "text-emerald-700" : "text-slate-500"
                }`}
              >
                {isListening ? "Listening" : "Offline"}
              </span>
              <div
                className={`w-8 h-4 rounded-full relative transition-colors ${
                  isListening ? "bg-emerald-500" : "bg-slate-300"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${
                    isListening ? "left-4.5" : "left-0.5"
                  }`}
                  style={{ left: isListening ? "18px" : "2px" }}
                />
              </div>
            </div>

            <div className="h-10 w-px bg-slate-200 hidden md:block" />

            <div className="flex items-center gap-3">
              <div
                onClick={() => navigate("/profile")}
                className="flex items-center gap-3 bg-slate-50 px-3 md:px-5 py-2 md:py-2.5 rounded-2xl border border-slate-200 cursor-pointer hover:bg-white hover:border-indigo-300 hover:shadow-lg transition-all"
              >
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-white shadow-sm">
                  <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-indigo-700" />
                </div>
                <div className="hidden md:block">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                    Verified Pro
                  </p>
                  <p className="font-bold text-sm text-slate-900 leading-none">
                    {currentUser.name.split(" ")[0]}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl md:w-11 md:h-11 border border-transparent hover:border-red-100 transition-all"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 md:px-8 py-8 md:py-12 max-w-7xl pb-32">
        {/* Statistics Bar - Premium Style */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
          <Card className="bg-white border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden p-6 hover:shadow-2xl transition-all border-b-4 border-b-indigo-500">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
              Pipeline Jobs
            </p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-black text-slate-900 leading-none">{myJobs.length}</h3>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </Card>
          <Card className="bg-white border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden p-6 hover:shadow-2xl transition-all border-b-4 border-b-emerald-500">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
              Live Workspaces
            </p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-black text-slate-900 leading-none">{workspaceJobs.length}</h3>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Shield className="w-5 h-5" />
              </div>
            </div>
          </Card>
          <Card className="bg-white border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden p-6 hover:shadow-2xl transition-all border-b-4 border-b-amber-500">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
              Total Earnings
            </p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-black text-slate-900 leading-none">
                ₹{pastJobs.reduce((acc, job) => acc + (job.budget || 0) * 0.9, 0).toLocaleString()}
              </h3>
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
          </Card>
          <Card className="bg-slate-900 border-none shadow-xl shadow-slate-950/20 rounded-[2rem] overflow-hidden p-6 relative group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
              <Radio className="w-24 h-24 text-white" />
            </div>
            <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-3">
              Network Status
            </p>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isListening ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`} />
              <h3 className="text-xl font-black text-white leading-none">
                {isListening ? "ACTIVE MONITORING" : "OFFLINE"}
              </h3>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="jobs" className="w-full">
          <TabsList className="mb-8 md:mb-12 bg-white/50 backdrop-blur-sm p-2 rounded-[2rem] border border-slate-200/80 inline-flex md:h-16 shadow-lg shadow-slate-200/30">
            <TabsTrigger
              value="jobs"
              className="px-8 md:px-10 h-full rounded-[1.5rem] data-[state=active]:bg-slate-900 data-[state=active]:text-white font-black text-sm uppercase tracking-widest transition-all"
            >
              My Projects
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="px-8 md:px-10 h-full rounded-[1.5rem] data-[state=active]:bg-slate-900 data-[state=active]:text-white font-black text-sm uppercase tracking-widest transition-all"
            >
              Archives
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="jobs"
            className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out"
          >
            {/* Unverified Warning - Premium Remake */}
            {!currentUser.isVerified && (
              <div className="relative group overflow-hidden rounded-[2.5rem] bg-amber-50 border border-amber-200/50 p-8 md:p-10 shadow-xl shadow-amber-200/20">
                <div className="absolute -right-10 -top-10 opacity-5 group-hover:rotate-12 transition-transform duration-1000">
                  <Shield className="w-48 h-48 text-amber-900" />
                </div>
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                  <div className="w-20 h-20 rounded-[2rem] bg-white text-amber-600 flex items-center justify-center shadow-lg border border-amber-100">
                    <ShieldCheck className="w-10 h-10" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-black text-amber-900 tracking-tight mb-2">
                      Verification in Process
                    </h3>
                    <p className="text-amber-800/80 font-bold max-w-2xl text-lg leading-relaxed">
                      Our compliance team is currently reviewing your credentials. Bidding will be
                      enabled automatically once verified.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Active Workspaces - High Premium Remake */}
            {workspaceJobs.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-10 bg-indigo-600 rounded-full" />
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                      Active High-Priority Workspaces
                    </h2>
                  </div>
                  <Badge className="bg-indigo-600 text-white border-none font-black px-4 py-1.5 rounded-full shadow-lg shadow-indigo-600/20">
                    {workspaceJobs.length} LIVE
                  </Badge>
                </div>

                <div className="grid gap-6 md:gap-10 grid-cols-1 lg:grid-cols-2">
                  {workspaceJobs.map((job) => (
                    <Card
                      key={job.id}
                      className="bg-[#0f172a] border border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[3rem] p-8 md:p-12 relative overflow-hidden group hover:shadow-indigo-500/10 transition-all duration-500 border-t-8 border-t-indigo-500"
                    >
                      <div className="absolute right-0 top-0 p-12 opacity-5 pointer-events-none group-hover:scale-125 transition-transform duration-1000">
                        <Shield className="w-64 h-64 text-white" />
                      </div>
                      <div className="relative z-10 flex flex-col h-full">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                          <div className="max-w-md">
                            <p className="text-indigo-400 font-black text-[10px] uppercase tracking-widest mb-2">
                              Secure Environment
                            </p>
                            <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight mb-3">
                              {job.serviceName}
                            </h3>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                                <User className="w-3.5 h-3.5 text-slate-400" />
                              </div>
                              <span className="text-slate-400 font-bold text-sm">
                                Client: <span className="text-white">{job.clientName}</span>
                              </span>
                            </div>
                          </div>
                          <Badge className="bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 font-black text-[10px] px-4 py-1.5 rounded-full tracking-tighter">
                            WORK IN PROGRESS
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-10">
                          <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                            <p className="text-[9px] font-black text-slate-500 uppercase mb-1">
                              Project Value
                            </p>
                            <p className="text-2xl font-black text-white">
                              ₹{job.budget.toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                            <p className="text-[9px] font-black text-slate-500 uppercase mb-1">
                              Started On
                            </p>
                            <p className="text-lg font-black text-white">
                              {new Date(job.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <Button
                          className="w-full bg-white hover:bg-slate-100 text-slate-900 font-black h-16 md:h-20 rounded-[2rem] text-lg shadow-2xl transition-all hover:-translate-y-1 active:scale-95"
                          onClick={() => {
                            toast.success("Entering Military-Grade Secure Workspace...");
                            navigate(`/workspace/${job.id}`);
                          }}
                        >
                          <Shield className="w-6 h-6 mr-3" strokeWidth={3} />
                          Resume Advanced Workspace
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* My Jobs (Pipeline) - Premium Card Remake */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-10 bg-slate-900 rounded-full" />
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                    Project Pipeline
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                    Awaiting Action
                  </span>
                </div>
              </div>

              {myJobs.length === 0 ? (
                <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-[3rem] py-24 text-center">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <Briefcase className="w-8 h-8 text-slate-200" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">No projects in pipeline</h3>
                  <p className="text-slate-500 font-bold max-w-sm mx-auto">
                    Your current pipeline is quiet. Check the marketplace below for new
                    opportunities.
                  </p>
                </div>
              ) : (
                <div className="grid gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                  {myJobs.map((job) => (
                    <Card
                      key={job.id}
                      className="group bg-white border border-slate-200 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 rounded-[2.5rem] overflow-hidden flex flex-col"
                    >
                      <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardHeader className="p-8 pb-5">
                        <div className="flex justify-between items-start gap-4 mb-4">
                          <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                            {job.serviceName}
                          </h3>
                          <Badge
                            className={`text-[9px] font-black tracking-widest uppercase px-3 py-1 rounded-full border shadow-sm ${
                              job.status === "pending_approval"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : job.status === "awaiting_payment"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-indigo-50 text-indigo-700 border-indigo-200"
                            }`}
                          >
                            {job.status === "pending_approval" ? "Review" : "Escrow"}
                          </Badge>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex justify-between items-center group-hover:bg-indigo-50 transition-colors">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Agreed Fee
                          </p>
                          <p className="text-2xl font-black text-indigo-600">
                            ₹{job.budget.toLocaleString()}
                          </p>
                        </div>
                      </CardHeader>
                      <CardContent className="px-8 pb-8 flex-1 flex flex-col">
                        <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8 italic line-clamp-3">
                          "{job.description}"
                        </p>
                        <Button
                          className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-50"
                          onClick={() => openChat(job.id)}
                          disabled={job.status === "pending_approval" || !currentUser.isVerified}
                        >
                          <MessageCircle className="w-5 h-5 mr-3" />
                          Coordinate with Administration
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* Find New Jobs (Marketplace) - Modern Grid */}
            <section id="marketplace">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10 pt-16 border-t border-slate-200 px-4">
                <div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
                    Global Marketplace
                  </h2>
                  <p className="text-slate-500 font-bold mt-1 text-lg">
                    Premium opportunities for top-tier experts.
                  </p>
                </div>
                <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-lg border border-slate-100">
                  <Badge className="bg-indigo-600 text-white border-none font-black text-sm px-5 py-2 rounded-xl">
                    {availableJobs.length} Live Postings
                  </Badge>
                </div>
              </div>

              {availableJobs.length === 0 ? (
                <div className="bg-white border border-slate-200 shadow-2xl rounded-[3rem] p-16 md:p-24 text-center">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                    <div className="absolute inset-0 border-4 border-dashed border-slate-200 rounded-full animate-[spin_20s_linear_infinite]" />
                    <Radio className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">
                    Marketplace Scanning...
                  </h3>
                  <p className="text-slate-500 font-extrabold text-xl mb-10 max-w-sm mx-auto leading-relaxed">
                    No new requests satisfy your criteria at this moment. Stay tuned.
                  </p>
                  <Button
                    onClick={() => setIsListening(true)}
                    disabled={isListening}
                    className="h-16 px-12 rounded-3xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-2xl shadow-indigo-600/30 transition-all hover:-translate-y-1"
                  >
                    {isListening ? "Smart Monitoring Live" : "Enable Live Monitoring"}
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {availableJobs.map((job) => (
                    <Card
                      key={job.id}
                      className="bg-white border border-slate-100 shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:border-indigo-400/50 transition-all duration-300 rounded-[2rem] flex flex-col group p-1"
                    >
                      <div className="p-6 pb-2">
                        <div className="flex justify-between items-start gap-4 mb-4">
                          <h3 className="text-lg font-black text-slate-900 leading-tight pr-4 group-hover:text-indigo-600 transition-colors line-clamp-2">
                            {job.serviceName}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 mb-6">
                          <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl border border-emerald-100 text-lg font-black">
                            ₹{(job.budget || 0).toLocaleString()}
                          </div>
                          <Badge className="bg-slate-100 text-slate-500 border-none font-black text-[8px] uppercase tracking-widest py-1.5">
                            Standard
                          </Badge>
                        </div>
                        <p className="text-xs font-bold text-slate-500 leading-relaxed mb-6 line-clamp-3">
                          {job.description}
                        </p>
                      </div>
                      <div className="mt-auto p-2">
                        <Button
                          className="w-full h-14 font-black transition-all rounded-[1.5rem] bg-indigo-50 text-indigo-700 hover:bg-slate-900 hover:text-white border border-indigo-100 hover:border-slate-900 text-sm shadow-sm hover:shadow-lg active:scale-95"
                          onClick={() => handleOpenBidDialog(job)}
                          disabled={!currentUser.isVerified}
                        >
                          Submit Expert Proposal
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </TabsContent>

          {/* HISTORY TAB */}
          <TabsContent
            value="history"
            className="animate-in fade-in slide-in-from-bottom-4 duration-500 mx-1 md:mx-0"
          >
            <section className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm">
              <div className="mb-6 md:mb-8">
                <h2 className="font-extrabold text-xl md:text-2xl text-slate-900 mb-1 md:mb-2">
                  Earnings & Project History
                </h2>
                <p className="text-xs md:text-sm text-slate-500 font-medium">
                  Review your completed projects, approved payouts, and total
                  platform earnings.
                </p>
              </div>

              {pastJobs.length === 0 ? (
                <div className="py-12 md:py-20">
                  <PremiumAlert
                    type="info"
                    title="No project history"
                    description="Your completed and archived jobs will appear here once you've finished your first project."
                  />
                </div>
              ) : (
                <div className="overflow-x-auto w-full pb-4">
                  <table className="w-full min-w-[600px] text-left text-sm whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                        <th className="p-3 md:p-4 font-semibold text-xs uppercase tracking-wider">
                          Project
                        </th>
                        <th className="p-3 md:p-4 font-semibold text-xs uppercase tracking-wider">
                          Client
                        </th>
                        <th className="p-3 md:p-4 font-semibold text-xs uppercase tracking-wider">
                          Payout Amount
                        </th>
                        <th className="p-3 md:p-4 font-semibold text-xs uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pastJobs.map((job) => {
                        const commission = (job.budget || 0) * 0.1;
                        const netEarnings = (job.budget || 0) - commission;
                        return (
                          <tr
                            key={job.id}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <td className="p-3 md:p-4">
                              <p className="font-bold text-slate-800">
                                {job.serviceName}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                {new Date(job.updatedAt).toLocaleDateString()}
                              </p>
                            </td>
                            <td className="p-3 md:p-4 text-slate-600">
                              {job.clientName}
                            </td>
                            <td className="p-3 md:p-4 font-bold text-emerald-600">
                              ₹{netEarnings.toLocaleString()}
                            </td>
                            <td className="p-3 md:p-4">
                              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[9px] px-1.5 py-0.5">
                                COMPLETED
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </TabsContent>
        </Tabs>
      </main>

      {/* --- MINIMAL LIGHT FOOTER --- */}
      <footer className="mt-auto border-t border-slate-200 bg-white/60 backdrop-blur-md">
        <div className="container mx-auto px-4 md:px-6 py-6 max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            © {new Date().getFullYear()} TaxConsultGuru. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-xs md:text-sm font-semibold text-slate-500">
            <Link
              to="/about"
              className="hover:text-indigo-600 transition-colors"
            >
              About Us
            </Link>
            <Link
              to="/privacy"
              className="hover:text-indigo-600 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="hover:text-indigo-600 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/contact"
              className="hover:text-indigo-600 transition-colors"
            >
              Support
            </Link>
          </div>
        </div>
      </footer>

      {/* Actual Bidding Modal - Mobile Optimized */}
      <Dialog open={isBidModalOpen} onOpenChange={setIsBidModalOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[420px] bg-white border-slate-200 rounded-2xl p-5 md:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-lg md:text-xl font-extrabold text-slate-900 text-left">
              {selectedJob ? selectedJob.serviceName : "Place Your Bid"}
            </DialogTitle>
            <DialogDescription className="text-xs md:text-sm font-medium text-slate-500 mt-1 line-clamp-3 text-left">
              {selectedJob
                ? selectedJob.description
                : "Submit your best price and a short proposal to the client."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 md:gap-5 py-2 md:py-4">
            <div className="grid gap-2">
              <label
                htmlFor="price"
                className="text-[10px] md:text-xs font-bold text-slate-700 uppercase tracking-widest"
              >
                Your Quote (₹)
              </label>
              <Input
                id="price"
                type="number"
                placeholder="e.g. 5000"
                value={bidPrice}
                onChange={(e) => setBidPrice(e.target.value)}
                className="h-11 md:h-12 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 text-base md:text-lg font-semibold rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <label
                htmlFor="proposal"
                className="text-[10px] md:text-xs font-bold text-slate-700 uppercase tracking-widest"
              >
                Short Proposal
              </label>
              <ScrollArea className="h-28 md:h-32 w-full rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shadow-inner">
                <textarea
                  id="proposal"
                  className="flex min-h-[100px] md:min-h-[120px] w-full bg-transparent px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm placeholder:text-slate-400 focus-visible:outline-none resize-none"
                  placeholder="Tell the client why you are the best fit for this job..."
                  value={bidProposal}
                  onChange={(e) => setBidProposal(e.target.value)}
                />
              </ScrollArea>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0 mt-2">
            <Button
              variant="outline"
              onClick={() => setIsBidModalOpen(false)}
              disabled={isSubmittingBid}
              className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold h-10 md:h-11"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitBid}
              disabled={isSubmittingBid}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold h-10 md:h-11 shadow-sm"
            >
              {isSubmittingBid ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting
                </>
              ) : (
                "Submit Bid"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CA Chat Dialog - Mobile Optimized */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md h-[80vh] sm:h-[600px] flex flex-col bg-white border-slate-200 rounded-2xl p-0 overflow-hidden gap-0 shadow-2xl">
          <DialogHeader className="border-b border-slate-100 px-4 sm:px-6 py-3 sm:py-4 bg-slate-50 text-left">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-sm shrink-0">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="text-left">
                <DialogTitle className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                  TCG Admin Desk
                </DialogTitle>
                <DialogDescription className="text-[10px] sm:text-xs font-medium text-slate-500 mt-0.5">
                  Report progress & get instructions
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 p-4 sm:p-5 bg-slate-50/50">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-10 sm:py-12">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white border border-slate-200 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-sm">
                    <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-slate-300" />
                  </div>
                  <p className="text-sm sm:text-base text-slate-600 font-bold">
                    Report your progress here.
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
                    The admin will relay your updates to the client securely.
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.senderRole === "ca" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 shadow-sm ${
                        msg.senderRole === "ca"
                          ? "bg-indigo-600 text-white rounded-br-none"
                          : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"
                      }`}
                    >
                      <p className="text-xs sm:text-sm">{msg.text}</p>
                      <p
                        className={`text-[8px] sm:text-[10px] mt-1 text-right font-medium ${
                          msg.senderRole === "ca"
                            ? "text-indigo-200"
                            : "text-slate-400"
                        }`}
                      >
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          <div className="border-t border-slate-100 p-3 sm:p-4 bg-white flex gap-2">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="h-10 sm:h-11 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 rounded-xl text-xs sm:text-sm"
            />
            <Button
              onClick={sendMessage}
              size="icon"
              className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-slate-900 hover:bg-slate-800 shadow-sm shrink-0 p-0"
            >
              <Send className="w-4 h-4 text-white" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CADashboard;
