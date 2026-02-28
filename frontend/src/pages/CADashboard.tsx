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
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 h-16 md:h-20 flex items-center shadow-sm">
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          <div
            className="flex items-center gap-2 md:gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="hidden md:flex w-10 h-10 rounded-xl bg-indigo-600 items-center justify-center shadow-md shadow-indigo-200">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-xl md:text-2xl tracking-tight text-slate-900 leading-none">
                {"Tax"}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">
                  Consult
                </span>
                {"Guru"}
              </h1>
              <p className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1 hidden sm:block">
                Expert Portal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 bg-slate-100 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-indigo-600" />
              <span className="font-semibold text-xs md:text-sm text-slate-700">
                {currentUser.name.split(" ")[0]}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-slate-600 border-slate-300 hover:bg-slate-100 hover:text-slate-900 h-9 md:h-10 rounded-lg font-medium px-3 md:px-4"
            >
              <LogOut className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 md:px-6 py-6 md:py-8 max-w-6xl pb-24">
        <Tabs defaultValue="jobs" className="w-full">
          <TabsList className="mb-6 md:mb-8 bg-slate-200/60 p-1.5 rounded-xl grid grid-cols-2 sm:inline-flex h-auto sm:h-14 border border-slate-200 w-full sm:w-auto">
            <TabsTrigger
              value="jobs"
              className="px-4 sm:px-6 py-2.5 sm:py-0 h-full rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 font-bold text-sm sm:text-base text-slate-600"
            >
              <Briefcase className="w-4 h-4 mr-2 hidden sm:inline-block" />
              My Work
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="px-4 sm:px-6 py-2.5 sm:py-0 h-full rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 font-bold text-sm sm:text-base text-slate-600"
            >
              <BookOpen className="w-4 h-4 mr-2 hidden sm:inline-block" />
              Job History
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="jobs"
            className="space-y-8 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            {/* Unverified Warning */}
            {!currentUser.isVerified && (
              <Card className="border border-amber-200 bg-amber-50 shadow-sm rounded-2xl mx-1 md:mx-0">
                <CardContent className="py-4 md:py-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0 border border-amber-200 hidden sm:flex">
                    <Shield className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-sm md:text-base font-bold text-amber-900">
                      Your account is pending verification
                    </p>
                    <p className="text-xs md:text-sm text-amber-700 font-medium mt-0.5">
                      You can view available jobs below, but you will not be
                      able to place bids until the Admin approves your account.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Listening Toggle */}
            <Card
              className={`rounded-2xl transition-all duration-300 shadow-sm border mx-1 md:mx-0 ${
                isListening
                  ? "border-emerald-200 bg-emerald-50/30"
                  : "border-slate-200 bg-white"
              }`}
            >
              <CardContent className="py-5 md:py-6 px-5 md:px-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-6">
                  <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 text-center sm:text-left">
                    <div className="relative">
                      <div
                        className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-colors ${
                          isListening
                            ? "bg-emerald-500 shadow-lg shadow-emerald-200"
                            : "bg-slate-100 border border-slate-200"
                        }`}
                      >
                        {isListening ? (
                          <Radio className="w-6 h-6 md:w-7 md:h-7 text-white" />
                        ) : (
                          <WifiOff className="w-6 h-6 md:w-7 md:h-7 text-slate-400" />
                        )}
                      </div>
                      {isListening && (
                        <div className="absolute inset-0 rounded-full border-[3px] border-emerald-500 animate-ping opacity-75" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-extrabold text-slate-900">
                        {isListening
                          ? "Listening for Jobs"
                          : "Currently Offline"}
                      </h3>
                      <p className="text-xs md:text-sm font-medium text-slate-500 mt-1">
                        {isListening
                          ? "You are receiving new job opportunities in real-time."
                          : "Toggle to start receiving new job requests."}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={isListening ? "outline" : "default"}
                    size="lg"
                    className={`w-full sm:w-auto h-11 md:h-12 px-6 md:px-8 font-bold rounded-xl shadow-sm transition-all ${
                      isListening
                        ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        : "bg-slate-900 text-white hover:bg-slate-800 hover:shadow-md"
                    }`}
                    onClick={() => setIsListening(!isListening)}
                  >
                    {isListening ? "Go Offline" : "Go Online"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Active Workspaces (Unlocked) */}
            {workspaceJobs.length > 0 && (
              <section className="mx-1 md:mx-0">
                <h2 className="text-lg md:text-xl font-extrabold text-slate-900 mb-4 md:mb-5 flex items-center gap-2">
                  <Shield className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
                  Unlocked Client Workspaces
                </h2>
                <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {workspaceJobs.map((job) => (
                    <Card
                      key={job.id}
                      className="bg-indigo-600 border-indigo-700 shadow-xl shadow-indigo-200/50 rounded-2xl relative overflow-hidden group"
                    >
                      <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                        <Shield className="w-32 h-32 text-white" />
                      </div>
                      <CardHeader className="p-5 md:p-6 pb-3 relative z-10">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                          <CardTitle className="text-base md:text-lg font-bold text-white leading-tight">
                            {job.serviceName}
                          </CardTitle>
                          <Badge className="bg-white/20 text-white border-none font-bold text-[9px] md:text-[10px] tracking-wider uppercase shrink-0 w-fit">
                            UNLOCKED
                          </Badge>
                        </div>
                        <CardDescription className="text-indigo-200 font-medium text-xs md:text-sm">
                          Client:{" "}
                          <span className="text-white font-semibold">
                            {job.clientName}
                          </span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-5 md:p-6 pt-0 relative z-10 flex flex-col h-full">
                        <p className="text-[11px] md:text-xs text-indigo-100/90 mb-4 md:mb-5 font-medium leading-relaxed">
                          The client has completed payment. You can now
                          communicate directly and share files.
                        </p>
                        <Button
                          className="w-full bg-white hover:bg-slate-50 text-indigo-700 font-bold h-10 md:h-11 rounded-xl shadow-sm group-hover:shadow-md transition-all mt-auto"
                          onClick={() => {
                            toast.success(
                              "Entering Secure Client Workspace...",
                            );
                            navigate(`/workspace/${job.id}`);
                          }}
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          Enter Secure Workspace
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* My Jobs (Pending / Active but locked) */}
            <section className="mx-1 md:mx-0">
              <h2 className="text-lg md:text-xl font-extrabold text-slate-900 mb-4 md:mb-5">
                My Pipeline ({myJobs.length})
              </h2>
              {myJobs.length === 0 ? (
                <div className="py-12 md:py-20">
                  <PremiumAlert
                    type="info"
                    title="No active jobs"
                    description="Your project pipeline is currently quiet. Stay online to be notified of new opportunities."
                  />
                </div>
              ) : (
                <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {myJobs.map((job) => (
                    <Card
                      key={job.id}
                      className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow rounded-2xl flex flex-col"
                    >
                      <CardHeader className="p-5 md:p-6 pb-4 border-b border-slate-100">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                          <CardTitle className="text-sm md:text-base font-bold text-slate-900 leading-tight pr-2">
                            {job.serviceName}
                          </CardTitle>
                          <Badge
                            variant="secondary"
                            className={`text-[9px] md:text-[10px] px-2 py-0.5 uppercase tracking-wider font-bold shrink-0 w-fit ${
                              job.status === "pending_approval"
                                ? "bg-amber-100 text-amber-700"
                                : job.status === "awaiting_payment"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {job.status === "pending_approval"
                              ? "Admin Review"
                              : job.status === "awaiting_payment"
                                ? "Awaiting Payment"
                                : "Active"}
                          </Badge>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center">
                          <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Agreed Budget
                          </span>
                          <span className="font-extrabold text-emerald-600 text-base md:text-lg">
                            ₹{job.budget.toLocaleString()}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="p-5 md:p-6 pt-4 mt-auto flex flex-col">
                        <p className="text-xs md:text-sm text-slate-600 mb-4 md:mb-5 line-clamp-3 leading-relaxed">
                          {job.description}
                        </p>
                        <Button
                          className="w-full h-10 md:h-11 font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-sm mt-auto"
                          onClick={() => openChat(job.id)}
                          disabled={
                            job.status === "pending_approval" ||
                            !currentUser.isVerified
                          }
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Chat with Admin
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* Find New Jobs Section */}
            <section className="mx-1 md:mx-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-5">
                <h2 className="text-lg md:text-xl font-extrabold text-slate-900">
                  Find New Jobs
                </h2>
                <Badge className="bg-indigo-100 text-indigo-700 border-none font-bold px-2 py-0.5 w-fit">
                  {availableJobs.length} Live Opportunities
                </Badge>
              </div>

              {availableJobs.length === 0 ? (
                <Card className="border-dashed border-2 border-slate-200 bg-white rounded-2xl shadow-sm">
                  <CardContent className="py-12 md:py-16 text-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3 md:mb-4 border border-slate-100">
                      <Briefcase className="w-6 h-6 md:w-8 md:h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-600 font-bold text-base md:text-lg">
                      No new requests available right now.
                    </p>
                    <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">
                      Keep your status "Online" to be notified immediately.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {availableJobs.map((job) => (
                    <Card
                      key={job.id}
                      className="bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all rounded-2xl flex flex-col"
                    >
                      <CardHeader className="p-5 md:p-6 pb-3 md:pb-4 border-b border-slate-50">
                        <div className="flex justify-between items-start mb-2 md:mb-3">
                          <CardTitle className="text-sm md:text-base font-bold text-slate-900 leading-tight">
                            {job.serviceName}
                          </CardTitle>
                          <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 shrink-0 ml-2">
                            ₹{(job.budget || 0).toLocaleString()}
                          </span>
                        </div>
                        <CardDescription className="text-xs md:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                          {job.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-5 md:p-6 pt-4 mt-auto">
                        <Button
                          className="w-full text-xs md:text-sm h-10 md:h-11 font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-colors rounded-xl shadow-sm"
                          onClick={() => handleOpenBidDialog(job)}
                          disabled={!currentUser.isVerified}
                        >
                          Review & Place Bid
                        </Button>
                      </CardContent>
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
