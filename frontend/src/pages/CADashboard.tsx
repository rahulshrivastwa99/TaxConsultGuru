import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useMockBackend,
  SERVICES,
  ServiceRequest,
} from "@/context/MockBackendContext";
import { useSocket } from "@/context/SocketContext";
import { toast } from "sonner";

const CADashboard = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    isLoading, // 1. Get Loading State
    logout,
    requests,
    getLiveJobs,
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
  const [selectedJob, setSelectedJob] =
    useState<ServiceRequest | null>(null);
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
        description: "You can now place bids on live jobs."
      });
      refreshData();
    };

    const handleWorkspaceUnlocked = (data: any) => {
      toast.success("Workspace Unlocked!", {
        description: "A client has unlocked a workspace for you."
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
  }, [socket, isListening, refreshData, seenJobIds]); // seenJobIds added just in case, but refreshData is now stable

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
      (r.status === "pending_approval" ||
        r.status === "active" ||
        r.status === "awaiting_payment"),
  );

  const workspaceJobs = requests.filter(
    (r) =>
      r.caId === currentUser.id &&
      r.status === "active" &&
      r.isWorkspaceUnlocked === true,
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
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 transition-all shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-xl tracking-tight text-slate-900 leading-none">
                Tax
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">
                  Consult
                </span>
                Guru
              </h1>
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1">
                Expert Portal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 mr-2 text-sm bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center border border-slate-200 shadow-sm">
                <User className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <span className="font-semibold text-slate-700">
                {currentUser.name}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-slate-600 border-slate-300 hover:bg-slate-100 hover:text-slate-900 h-10 rounded-lg font-medium"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-6xl">
        <Tabs defaultValue="jobs" className="w-full">
          <TabsList className="mb-8 bg-slate-200/60 p-1.5 rounded-xl inline-flex h-14 border border-slate-200">
            <TabsTrigger
              value="jobs"
              className="px-6 h-full rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 font-bold text-slate-600"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              My Work
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="px-6 h-full rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 font-bold text-slate-600"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Job History
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="jobs"
            className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            {/* Unverified Warning */}
            {!currentUser.isVerified && (
              <Card className="border border-amber-200 bg-amber-50 shadow-sm rounded-2xl">
                <CardContent className="py-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0 border border-amber-200">
                    <Shield className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-bold text-amber-900">
                      Your account is pending verification
                    </p>
                    <p className="text-sm text-amber-700 font-medium mt-0.5">
                      You can view available jobs below, but you will not be
                      able to place bids until the Admin approves your account.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Listening Toggle */}
            <Card
              className={`rounded-2xl transition-all duration-300 shadow-sm border ${
                isListening
                  ? "border-emerald-200 bg-emerald-50/30"
                  : "border-slate-200 bg-white"
              }`}
            >
              <CardContent className="py-6 px-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="relative">
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                          isListening
                            ? "bg-emerald-500 shadow-lg shadow-emerald-200"
                            : "bg-slate-100 border border-slate-200"
                        }`}
                      >
                        {isListening ? (
                          <Radio className="w-7 h-7 text-white" />
                        ) : (
                          <WifiOff className="w-7 h-7 text-slate-400" />
                        )}
                      </div>
                      {isListening && (
                        <div className="absolute inset-0 rounded-full border-[3px] border-emerald-500 animate-ping opacity-75" />
                      )}
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="text-2xl font-extrabold text-slate-900">
                        {isListening
                          ? "Listening for Jobs"
                          : "Currently Offline"}
                      </h3>
                      <p className="text-sm font-medium text-slate-500 mt-1">
                        {isListening
                          ? "You are receiving new job opportunities in real-time."
                          : "Toggle to start receiving new job requests."}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={isListening ? "outline" : "default"}
                    size="lg"
                    className={`h-12 px-8 font-bold rounded-xl shadow-sm transition-all ${
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
              <section className="mb-10">
                <h2 className="text-xl font-extrabold text-slate-900 mb-5 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-indigo-600" />
                  Unlocked Client Workspaces
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {workspaceJobs.map((job) => (
                    <Card
                      key={job.id}
                      className="bg-indigo-600 border-indigo-700 shadow-xl shadow-indigo-200/50 rounded-2xl relative overflow-hidden group"
                    >
                      <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                        <Shield className="w-32 h-32 text-white" />
                      </div>
                      <CardHeader className="pb-3 relative z-10">
                        <div className="flex justify-between items-start mb-2">
                          <CardTitle className="text-lg font-bold text-white leading-tight">
                            {job.serviceName}
                          </CardTitle>
                          <Badge className="bg-white text-indigo-700 border-none font-bold text-[10px] tracking-wider uppercase shrink-0 ml-2">
                            Unlocked
                          </Badge>
                        </div>
                        <CardDescription className="text-indigo-200 font-medium text-sm">
                          Client:{" "}
                          <span className="text-white font-semibold">
                            {job.clientName}
                          </span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="relative z-10 pt-2">
                        <p className="text-xs text-indigo-100/90 mb-5 font-medium leading-relaxed">
                          The client has completed payment. You can now
                          communicate directly and share files in the secure
                          workspace.
                        </p>
                        <Button
                          className="w-full bg-white hover:bg-slate-50 text-indigo-700 font-bold h-11 rounded-xl shadow-sm group-hover:shadow-md transition-all"
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
            <section className="mb-10">
              <h2 className="text-xl font-extrabold text-slate-900 mb-5">
                My Pipeline ({myJobs.length})
              </h2>
              {myJobs.length === 0 ? (
                <Card className="border-dashed border-2 border-slate-200 bg-white rounded-2xl shadow-sm">
                  <CardContent className="py-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100">
                      <Clock className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-600 font-bold text-lg">
                      No active jobs in your pipeline.
                    </p>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                      Stay online and bid on new opportunities to get started.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {myJobs.map((job) => (
                    <Card
                      key={job.id}
                      className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow rounded-2xl flex flex-col"
                    >
                      <CardHeader className="pb-4 border-b border-slate-100">
                        <div className="flex items-start justify-between mb-3">
                          <CardTitle className="text-base font-bold text-slate-900 leading-tight pr-2">
                            {job.serviceName}
                          </CardTitle>
                          <Badge
                            variant="secondary"
                            className={`text-[10px] px-2 py-0.5 uppercase tracking-wider font-bold shrink-0 ${
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
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Agreed Budget
                          </span>
                          <span className="font-extrabold text-emerald-600 text-lg">
                            ₹{job.budget.toLocaleString()}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4 mt-auto flex flex-col">
                        <p className="text-sm text-slate-600 mb-5 line-clamp-3 leading-relaxed">
                          {job.description}
                        </p>
                        <Button
                          className="w-full h-11 font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-sm mt-auto"
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
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-5">
                <h2 className="text-xl font-extrabold text-slate-900">
                  Find New Jobs
                </h2>
                <Badge className="bg-indigo-100 text-indigo-700 border-none font-bold px-2 py-0.5">
                  {availableJobs.length} Live Opportunities
                </Badge>
              </div>

              {availableJobs.length === 0 ? (
                <Card className="border-dashed border-2 border-slate-200 bg-white rounded-2xl shadow-sm">
                  <CardContent className="py-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100">
                      <Briefcase className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-600 font-bold text-lg">
                      No new requests available right now.
                    </p>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                      Keep your status "Online" to be notified immediately.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {availableJobs.map((job) => (
                    <Card
                      key={job.id}
                      className="bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all rounded-2xl flex flex-col"
                    >
                      <CardHeader className="pb-4 border-b border-slate-50">
                        <div className="flex justify-between items-start mb-3">
                          <CardTitle className="text-base font-bold text-slate-900 leading-tight">
                            {job.serviceName}
                          </CardTitle>
                          <span className="text-sm font-extrabold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 shrink-0 ml-2">
                            ₹{(job.budget || 0).toLocaleString()}
                          </span>
                        </div>
                        <CardDescription className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                          {job.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4 mt-auto">
                        <Button
                          className="w-full text-sm h-11 font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-colors rounded-xl shadow-sm"
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

            {/* Services info */}
            <section className="pt-6 border-t border-slate-200">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
                Services You Can Accept
              </h2>
              <div className="flex flex-wrap gap-2">
                {SERVICES.map((service) => (
                  <Badge
                    key={service.id}
                    variant="secondary"
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border-none rounded-lg text-xs"
                  >
                    {service.name}
                  </Badge>
                ))}
              </div>
            </section>
          </TabsContent>

          {/* HISTORY TAB */}
          <TabsContent
            value="history"
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="mb-8">
                <h2 className="font-extrabold text-2xl text-slate-900 mb-2">
                  Earnings & Project History
                </h2>
                <p className="text-slate-500 font-medium">
                  Review your completed projects, approved payouts, and total
                  platform earnings.
                </p>
              </div>

              {pastJobs.length === 0 ? (
                <Card className="border-dashed border-2 border-slate-200 bg-slate-50 rounded-2xl py-16 shadow-none">
                  <CardContent className="text-center">
                    <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto mb-4 border border-slate-200 shadow-sm">
                      <BookOpen className="w-10 h-10 text-slate-300" />
                    </div>
                    <p className="text-slate-600 font-bold text-lg">
                      No history available yet.
                    </p>
                    <p className="text-slate-500 font-medium text-sm mt-1">
                      Completed and archived jobs will appear here.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {pastJobs.map((job) => {
                    const commission = (job.budget || 0) * 0.1;
                    const netEarnings = (job.budget || 0) - commission;

                    return (
                      <Card
                        key={job.id}
                        className="border-slate-200 bg-white hover:shadow-md transition-all shadow-sm rounded-2xl"
                      >
                        <CardHeader className="pb-4 border-b border-slate-50">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md border border-emerald-200 uppercase tracking-widest">
                              PAYOUT RELEASED
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono font-medium">
                              {new Date(job.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <CardTitle className="text-base font-bold text-slate-900 leading-tight">
                            {job.serviceName}
                          </CardTitle>
                          <CardDescription className="text-xs font-medium text-slate-500 mt-1">
                            Client:{" "}
                            <span className="text-slate-700">
                              {job.clientName}
                            </span>
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm shadow-inner">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500 font-medium">
                                Gross Amount:
                              </span>
                              <span className="font-bold text-slate-700">
                                ₹{job.budget?.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-pink-600">
                              <span className="font-medium">
                                Platform Fee (10%):
                              </span>
                              <span className="font-bold">
                                -₹{commission.toLocaleString()}
                              </span>
                            </div>
                            <div className="h-px bg-slate-200 my-2" />
                            <div className="flex justify-between items-center font-extrabold text-emerald-600 text-base">
                              <span>Net Earnings:</span>
                              <span>₹{netEarnings.toLocaleString()}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </section>
          </TabsContent>
        </Tabs>
      </main>

      {/* Actual Bidding Modal */}
      <Dialog open={isBidModalOpen} onOpenChange={setIsBidModalOpen}>
        <DialogContent className="sm:max-w-[420px] bg-white border-slate-200 rounded-2xl p-6 shadow-2xl">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-xl font-extrabold text-slate-900">
              {selectedJob ? selectedJob.serviceName : "Place Your Bid"}
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-500 mt-1 line-clamp-3">
              {selectedJob ? selectedJob.description : "Submit your best price and a short proposal to the client."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="grid gap-2">
              <label
                htmlFor="price"
                className="text-xs font-bold text-slate-700 uppercase tracking-widest"
              >
                Your Quote (₹)
              </label>
              <Input
                id="price"
                type="number"
                placeholder="e.g. 5000"
                value={bidPrice}
                onChange={(e) => setBidPrice(e.target.value)}
                className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 text-lg font-semibold rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <label
                htmlFor="proposal"
                className="text-xs font-bold text-slate-700 uppercase tracking-widest"
              >
                Short Proposal
              </label>
              <ScrollArea className="h-32 w-full rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shadow-inner">
                <textarea
                  id="proposal"
                  className="flex min-h-[120px] w-full bg-transparent px-4 py-3 text-sm placeholder:text-slate-400 focus-visible:outline-none resize-none"
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
              className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold h-11"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitBid}
              disabled={isSubmittingBid}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold h-11 shadow-sm"
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

      {/* CA Chat Dialog - Talks to "TCG Admin Desk" */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="sm:max-w-md h-[600px] flex flex-col bg-white border-slate-200 rounded-2xl p-0 overflow-hidden gap-0 shadow-2xl">
          <DialogHeader className="border-b border-slate-100 px-6 py-4 bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-sm">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <DialogTitle className="text-base font-extrabold text-slate-900 leading-tight">
                  TCG Admin Desk
                </DialogTitle>
                <DialogDescription className="text-xs font-medium text-slate-500 mt-0.5">
                  Report progress & get instructions
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 p-5 bg-slate-50/50">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-white border border-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Shield className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-600 font-bold">
                    Report your progress here.
                  </p>
                  <p className="text-sm font-medium text-slate-500 mt-1">
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
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm ${
                        msg.senderRole === "ca"
                          ? "bg-indigo-600 text-white rounded-br-none"
                          : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p
                        className={`text-[10px] mt-1 text-right font-medium ${
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

          <div className="border-t border-slate-100 p-4 bg-white flex gap-2">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="h-11 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 rounded-xl"
            />
            <Button
              onClick={sendMessage}
              size="icon"
              className="h-11 w-11 rounded-xl bg-slate-900 hover:bg-slate-800 shadow-sm shrink-0"
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
