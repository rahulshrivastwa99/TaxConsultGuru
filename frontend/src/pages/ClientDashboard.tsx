import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Calculator,
  ClipboardCheck,
  Building2,
  Receipt,
  BookOpen,
  LogOut,
  User,
  Loader2,
  MessageCircle,
  Send,
  Headphones,
  Shield,
  CheckCircle,
  Activity,
  Flame,
  Rocket,
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMockBackend, SERVICES } from "@/context/MockBackendContext";
import { useSocket } from "@/context/SocketContext";
import { toast } from "sonner";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText,
  Calculator,
  ClipboardCheck,
  Building2,
  Receipt,
  BookOpen,
};

const ClientDashboard = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    isLoading,
    logout,
    requests,
    createRequest,
    fetchBidsForRequest,
    hireCA,
    clientMessages,
    addClientMessage,
    refreshData,
  } = useMockBackend();
  const { socket } = useSocket();

  const [selectedService, setSelectedService] = useState<
    (typeof SERVICES)[0] | null
  >(null);
  const [description, setDescription] = useState("");
  const [expectedBudget, setExpectedBudget] = useState<number | "">("");
  const [isRequesting, setIsRequesting] = useState(false);

  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatRequestId, setChatRequestId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");

  // Bidding State
  const [bidsDialogOpen, setBidsDialogOpen] = useState(false);
  const [selectedReqForBids, setSelectedReqForBids] = useState<string | null>(
    null,
  );
  const [bids, setBids] = useState<any[]>([]);
  const [isFetchingBids, setIsFetchingBids] = useState(false);
  const [isHiring, setIsHiring] = useState(false);
  const [hireSuccessOpen, setHireSuccessOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !currentUser) {
      navigate("/");
    }
  }, [currentUser, isLoading, navigate]);

  useEffect(() => {
    if (!socket || currentUser?.role !== "client") return;

    const handleNewBid = (data: any) => {
      toast.success("New Bid Received!", {
        description: "An expert has submitted a proposal for your project.",
      });
      refreshData();
    };

    const handleWorkspaceUnlocked = (data: any) => {
      toast.success("Workspace Unlocked!", {
        description:
          "Your session is now active. You can chat with your expert.",
      });
      refreshData();
    };

    socket.on("new_bid_received", handleNewBid);
    socket.on("workspace_unlocked", handleWorkspaceUnlocked);

    return () => {
      socket.off("new_bid_received", handleNewBid);
      socket.off("workspace_unlocked", handleWorkspaceUnlocked);
    };
  }, [socket, currentUser, refreshData]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!currentUser) return null;

  const myRequests = requests.filter((r) => r.clientId === currentUser.id);
  const activeRequests = myRequests.filter(
    (r) =>
      r.status === "active" ||
      r.status === "pending_approval" ||
      r.status === "awaiting_payment" ||
      r.status === "live",
  );
  const searchingRequests = myRequests.filter((r) => r.status === "searching");
  const workspaceJobs = myRequests.filter(
    (r) => r.status === "active" && r.isWorkspaceUnlocked === true,
  );
  const pastProjects = myRequests.filter((r) => r.isArchived === true);

  // Stats Calculations
  const totalActive =
    activeRequests.length + workspaceJobs.length + searchingRequests.length;
  const totalCompleted = pastProjects.length;
  const totalBidsPending = myRequests.filter((r) => r.status === "live").length;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleRequestService = async () => {
    if (!selectedService || !currentUser) return;
    setIsRequesting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    await createRequest(
      currentUser.id,
      currentUser.name,
      selectedService.id,
      selectedService.name,
      description,
      selectedService.defaultBudget,
      Number(expectedBudget) || selectedService.defaultBudget,
    );
    toast.success("Request submitted! Matching with expert...");
    setSelectedService(null);
    setDescription("");
    setExpectedBudget("");
    setIsRequesting(false);
  };

  const openChat = (requestId: string) => {
    setChatRequestId(requestId);
    setChatOpen(true);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !chatRequestId || !currentUser) return;
    addClientMessage(
      chatRequestId,
      currentUser.id,
      currentUser.name,
      "client",
      newMessage,
    );
    setNewMessage("");
  };

  const handleViewBids = async (requestId: string) => {
    setSelectedReqForBids(requestId);
    setBidsDialogOpen(true);
    setIsFetchingBids(true);
    try {
      const data = await fetchBidsForRequest(requestId);
      setBids(data);
    } catch (e) {
      toast.error("Failed to load bids");
    } finally {
      setIsFetchingBids(false);
    }
  };

  const handleHireCA = async (bidId: string) => {
    if (!selectedReqForBids) return;
    setIsHiring(true);
    try {
      await hireCA(selectedReqForBids, bidId);
      setBidsDialogOpen(false);
      setHireSuccessOpen(true);
    } catch (e) {
      // Error handled by context
    } finally {
      setIsHiring(false);
    }
  };

  const messages = chatRequestId ? clientMessages[chatRequestId] || [] : [];

  return (
    <div className="min-h-screen bg-[#f4f7fb] font-sans flex flex-col relative overflow-hidden">
      {/* Enhanced Background Decor */}
      <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[100%] h-[60%] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-200/40 via-indigo-50/20 to-transparent pointer-events-none z-0" />

      {/* Hero-Style Navbar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 transition-all">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate("/")}
          >
            <span className="text-2xl font-extrabold tracking-tight text-slate-900">
              {"Tax"}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">
                Consult
              </span>
              {"Guru"}
            </span>
            <Badge
              variant="outline"
              className="hidden sm:flex bg-slate-50 text-slate-500 border-slate-200 text-[10px] tracking-widest uppercase font-bold px-2 py-0.5 mt-1"
            >
              Client Portal
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 mr-2 text-sm bg-slate-50 px-4 py-2 rounded-full border border-slate-200 shadow-sm transition-shadow hover:bg-white hover:shadow-md">
              <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200">
                <User className="w-3.5 h-3.5 text-indigo-700" />
              </div>
              <span className="font-bold text-slate-700">
                {currentUser.name}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-slate-600 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 h-10 rounded-xl font-bold transition-all shadow-sm"
            >
              <LogOut className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full container mx-auto px-4 md:px-6 py-8 max-w-6xl pb-24 relative z-10">
        {/* --- 1. LIGHT THEME WELCOME BANNER --- */}
        <div className="mb-8 relative overflow-hidden rounded-[2rem] bg-white shadow-sm border border-slate-200 p-8 md:p-10">
          {/* Decorative Glowing Orbs inside Banner */}
          <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-indigo-100/60 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-50%] left-[-10%] w-64 h-64 bg-cyan-100/60 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-widest mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Dashboard Active
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
                Welcome back, {currentUser.name.split(" ")[0]} 👋
              </h2>
              <p className="text-slate-500 font-medium text-base max-w-lg">
                Manage your legal compliance, track expert progress, and scale
                your business securely from one place.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() =>
                  document
                    .getElementById("services-grid")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 px-6 rounded-xl shadow-md shadow-indigo-600/20 transition-all hover:-translate-y-0.5"
              >
                Post New Request
              </Button>
            </div>
          </div>
        </div>

        {/* --- 2. QUICK INSIGHTS ROW --- */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <Card className="bg-white border-slate-200 shadow-sm rounded-2xl hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                  Active Jobs
                </p>
                <p className="text-2xl font-black text-slate-900 leading-none">
                  {totalActive}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200 shadow-sm rounded-2xl hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100 shrink-0">
                <ClipboardCheck className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                  Proposals
                </p>
                <p className="text-2xl font-black text-slate-900 leading-none">
                  {totalBidsPending}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200 shadow-sm rounded-2xl hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shrink-0">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                  Completed
                </p>
                <p className="text-2xl font-black text-slate-900 leading-none">
                  {totalCompleted}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="mb-10 bg-white/60 p-1.5 rounded-2xl inline-flex h-14 border border-slate-200/60 shadow-sm backdrop-blur-md">
            <TabsTrigger
              value="dashboard"
              className="px-8 h-full rounded-xl data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm font-bold text-slate-500 transition-all"
            >
              <ClipboardCheck className="w-4 h-4 mr-2" />
              My Workspace
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="px-8 h-full rounded-xl data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm font-bold text-slate-500 transition-all"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Project History
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="dashboard"
            className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out"
          >
            {/* Searching indicator */}
            {searchingRequests.length > 0 && (
              <Card className="border-indigo-200 bg-indigo-50/50 shadow-sm rounded-3xl overflow-hidden relative backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-pulse" />
                <CardContent className="py-10 text-center relative z-10">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm border border-indigo-100">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                  </div>
                  <h3 className="font-extrabold text-xl text-slate-900 mb-2">
                    Finding the perfect Expert...
                  </h3>
                  <p className="text-slate-600 font-medium">
                    Please wait while we connect you with the best professional
                    for your{" "}
                    <span className="font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                      {searchingRequests[0].serviceName}
                    </span>{" "}
                    request.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Active Workspaces */}
            {workspaceJobs.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center border border-emerald-200">
                    <Shield className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Secure Active Workspaces
                  </h2>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {workspaceJobs.map((req) => (
                    <Card
                      key={req.id}
                      className="bg-gradient-to-br from-emerald-600 to-emerald-800 border-none shadow-xl shadow-emerald-900/20 rounded-3xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
                    >
                      <div className="absolute -right-6 -top-6 opacity-[0.07] group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                        <Shield className="w-40 h-40 text-white" />
                      </div>
                      <CardHeader className="p-6 pb-4 relative z-10">
                        <div className="flex justify-between items-start mb-3">
                          <CardTitle className="text-xl font-bold text-white leading-tight pr-4">
                            {req.serviceName}
                          </CardTitle>
                          <Badge className="bg-emerald-400/30 text-white border border-emerald-400/50 font-extrabold text-[10px] tracking-widest uppercase shrink-0 backdrop-blur-md">
                            UNLOCKED
                          </Badge>
                        </div>
                        <CardDescription className="text-emerald-100/80 font-medium text-sm">
                          Workspace is active & encrypted
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 pt-0 relative z-10 flex flex-col h-full">
                        <div className="bg-black/10 rounded-2xl p-4 mb-6 backdrop-blur-sm border border-white/10">
                          <p className="text-xs text-emerald-100 uppercase tracking-wider font-bold mb-1">
                            Assigned Expert
                          </p>
                          <p className="text-base text-white font-extrabold">
                            {req.caName || "Verified Professional"}
                          </p>
                        </div>
                        <Button
                          className="w-full bg-white hover:bg-emerald-50 text-emerald-800 font-bold h-12 rounded-xl shadow-lg group-hover:shadow-xl transition-all mt-auto"
                          onClick={() => {
                            toast.success("Entering Secure Workspace...");
                            navigate(`/workspace/${req.id}`);
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

            {/* Active Requests */}
            {activeRequests.length > 0 && (
              <section>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-6 tracking-tight">
                  Pipeline & Proposals
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {activeRequests.map((req) => (
                    <Card
                      key={req.id}
                      className="group bg-white border border-slate-200 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 hover:border-indigo-200 transition-all duration-300 rounded-3xl flex flex-col relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <CardHeader className="p-6 pb-4 border-b border-slate-50">
                        <div className="flex items-start justify-between mb-3">
                          <CardTitle className="text-[17px] font-extrabold text-slate-900 leading-tight pr-3 group-hover:text-indigo-700 transition-colors">
                            {req.serviceName}
                          </CardTitle>
                          <Badge
                            variant="secondary"
                            className={`text-[10px] px-2.5 py-1 uppercase tracking-widest font-extrabold shrink-0 border ${
                              req.status === "pending_approval"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : req.status === "awaiting_payment"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            {req.status === "pending_approval"
                              ? "Processing"
                              : req.status === "awaiting_payment"
                                ? "Payment Due"
                                : "Active"}
                          </Badge>
                        </div>
                        <CardDescription className="text-xs font-semibold text-slate-500">
                          {req.status === "awaiting_payment"
                            ? "Expert selected. Awaiting manual payment."
                            : "Expert team assigned"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 pt-4 mt-auto flex flex-col bg-slate-50/30">
                        <p className="text-sm text-slate-600 mb-6 line-clamp-2 leading-relaxed font-medium">
                          {req.description}
                        </p>
                        <div className="flex gap-3 mt-auto">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-11 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-colors shadow-sm"
                            onClick={() => handleViewBids(req.id)}
                          >
                            View Proposals
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 h-11 font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
                            onClick={() => openChat(req.id)}
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Admin Chat
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* --- 4. ENHANCED EMPTY STATE (If no jobs at all) --- */}
            {activeRequests.length === 0 &&
              workspaceJobs.length === 0 &&
              searchingRequests.length === 0 && (
                <div className="py-16 px-6 text-center border-2 border-dashed border-indigo-200 rounded-[2rem] bg-indigo-50/50">
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto mb-5 shadow-sm border border-indigo-100">
                    <Rocket className="w-10 h-10 text-indigo-500" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">
                    Ready to grow your business?
                  </h3>
                  <p className="text-slate-500 font-medium max-w-md mx-auto mb-6">
                    You don't have any active requests. Browse our catalog below
                    and let our experts handle the compliance while you focus on
                    scaling.
                  </p>
                  <Button
                    onClick={() =>
                      document
                        .getElementById("services-grid")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="bg-indigo-600 hover:bg-indigo-700 text-white h-12 px-8 rounded-xl font-bold shadow-md"
                  >
                    Explore Services Below
                  </Button>
                </div>
              )}

            {/* Service Catalog */}
            <section id="services-grid">
              <div className="flex items-center justify-between mb-8 border-t border-slate-200 pt-10">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Request New Service
                </h2>
                <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold px-3 py-1 hidden sm:inline-flex rounded-lg shadow-sm">
                  Instant Matchmaking
                </Badge>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {SERVICES.map((service, index) => {
                  const IconComponent = iconMap[service.icon] || FileText;
                  // Add a "Popular" badge to the first two services to make it dynamic
                  const isPopular = index === 0 || index === 1;

                  return (
                    <Card
                      key={service.id}
                      className="group cursor-pointer bg-white border border-slate-200 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 hover:border-indigo-300 transition-all duration-300 rounded-3xl flex flex-col overflow-hidden relative"
                      onClick={() => setSelectedService(service)}
                    >
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {isPopular && (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-amber-100 text-amber-700 border-none font-bold text-[10px] uppercase tracking-widest px-2 shadow-sm flex items-center gap-1">
                            <Flame className="w-3 h-3" /> Popular
                          </Badge>
                        </div>
                      )}

                      <CardHeader className="p-6 pb-4">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-5 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors duration-300 shadow-sm">
                          <IconComponent
                            className="w-7 h-7 text-slate-600 group-hover:text-indigo-600 transition-colors duration-300"
                            strokeWidth={2}
                          />
                        </div>
                        <CardTitle className="text-lg font-extrabold text-slate-900 leading-tight group-hover:text-indigo-700 transition-colors pr-10">
                          {service.name}
                        </CardTitle>
                        <CardDescription className="text-sm text-slate-500 leading-relaxed line-clamp-2 mt-2 font-medium">
                          {service.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 pt-0 mt-auto">
                        <div className="flex items-center justify-between text-sm bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:bg-indigo-50/30 group-hover:border-indigo-50 transition-colors duration-300">
                          <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                            Starting from
                          </span>
                          <span className="font-black text-indigo-600 text-lg">
                            ₹{service.defaultBudget.toLocaleString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          </TabsContent>

          {/* HISTORY TAB */}
          <TabsContent
            value="history"
            className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out"
          >
            <section className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-sm">
              <div className="mb-10 border-b border-slate-100 pb-6">
                <h2 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">
                  Project History
                </h2>
                <p className="text-slate-500 font-medium">
                  Review all your completed and archived projects securely in
                  one place.
                </p>
              </div>

              {pastProjects.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto mb-5 shadow-sm border border-slate-100">
                    <BookOpen className="w-10 h-10 text-slate-300" />
                  </div>
                  <p className="text-slate-800 font-extrabold text-lg mb-1">
                    No archived projects yet.
                  </p>
                  <p className="text-slate-500 font-medium text-sm">
                    Once a project is completed and paid, it will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {pastProjects.map((req) => (
                    <Card
                      key={req.id}
                      className="bg-slate-50/80 border-slate-200 border-dashed hover:bg-white hover:border-solid hover:shadow-md hover:border-slate-300 transition-all duration-300 rounded-3xl"
                    >
                      <CardHeader className="p-6 pb-4 border-b border-slate-200/60">
                        <div className="flex items-center justify-between mb-4">
                          <Badge
                            variant="outline"
                            className="text-[10px] uppercase font-bold tracking-widest bg-white border-slate-300 text-slate-500"
                          >
                            Archived
                          </Badge>
                          <span className="text-xs font-semibold text-slate-400">
                            {new Date(req.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <CardTitle className="text-lg font-extrabold text-slate-800">
                          {req.serviceName}
                        </CardTitle>
                        <CardDescription className="text-sm text-slate-500 line-clamp-1 mt-1.5 font-medium">
                          {req.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 pt-5">
                        <div className="flex flex-col gap-3 p-4 bg-white rounded-2xl border border-slate-100 text-sm shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
                              Final Budget
                            </span>
                            <span className="font-extrabold text-slate-800">
                              ₹{req.budget?.toLocaleString()}
                            </span>
                          </div>
                          <div className="h-px bg-slate-100 w-full" />
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
                              Consultant
                            </span>
                            <span className="font-bold text-indigo-600">
                              {req.caName || "Expert"}
                            </span>
                          </div>
                        </div>
                        <div className="mt-6 flex items-center justify-center gap-2 text-emerald-600 font-extrabold text-[10px] uppercase tracking-widest bg-emerald-50/50 py-2.5 rounded-xl border border-emerald-100">
                          <CheckCircle className="w-4 h-4" />
                          Work & Payout Completed
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </TabsContent>
        </Tabs>
      </main>

      {/* --- MINIMAL LIGHT FOOTER --- */}
      <footer className="mt-auto border-t border-slate-200 bg-white/60 backdrop-blur-md">
        <div className="container mx-auto px-6 py-6 max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500 font-medium">
            © {new Date().getFullYear()} TaxConsultGuru. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm font-semibold text-slate-500">
            <a
              href="/about"
              className="hover:text-indigo-600 transition-colors"
            >
              About Us
            </a>
            <a
              href="/privacy"
              className="hover:text-indigo-600 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              className="hover:text-indigo-600 transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="/contact"
              className="hover:text-indigo-600 transition-colors"
            >
              Support
            </a>
          </div>
        </div>
      </footer>

      {/* Service Request Dialog - REDUCED SIZE TO FIT SCREEN */}
      <Dialog
        open={!!selectedService}
        onOpenChange={() => setSelectedService(null)}
      >
        <DialogContent className="sm:max-w-[420px] bg-white border-slate-200 rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader className="mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 border border-indigo-100 mx-auto sm:mx-0">
              <FileText size={20} strokeWidth={2.5} />
            </div>
            <DialogTitle className="text-xl font-extrabold text-slate-900 tracking-tight">
              Request {selectedService?.name}
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">
              Tell us exactly what you need, and our matchmaking algorithm will
              pair you with the best expert for the job.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-1">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  Selected Service
                </span>
                <span className="font-bold text-sm text-slate-900">
                  {selectedService?.name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  Est. Budget
                </span>
                <span className="font-extrabold text-indigo-600 text-base bg-indigo-50 px-2 py-0.5 rounded-md">
                  ₹{selectedService?.defaultBudget.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">
                Requirement Details
              </label>
              <Textarea
                placeholder="Briefly describe what you need help with..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 rounded-xl resize-none font-medium text-sm text-slate-700 min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">
                  Expected Budget (₹)
                </label>
                <p className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                  Suggested: ₹{selectedService?.defaultBudget.toLocaleString()}
                </p>
              </div>
              <Input
                type="number"
                placeholder={`e.g. ${selectedService?.defaultBudget}`}
                value={expectedBudget}
                onChange={(e) =>
                  setExpectedBudget(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                className="h-11 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 rounded-xl font-bold text-base text-slate-900"
              />
            </div>

            <Button
              onClick={handleRequestService}
              className="w-full h-11 text-sm font-extrabold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 mt-2 transition-all hover:-translate-y-0.5"
              disabled={!description.trim() || isRequesting}
            >
              {isRequesting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Post Request & Find Expert"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bids Dialog */}
      <Dialog open={bidsDialogOpen} onOpenChange={setBidsDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col bg-white border-slate-200 rounded-[2rem] p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="p-8 pb-6 border-b border-slate-100 bg-slate-50/50">
            <DialogTitle className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Review Expert Proposals
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-500 mt-2">
              Compare bids from verified professionals. Choose the best fit,
              hire them, and proceed to the secure workspace.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 p-6 lg:p-8 bg-slate-50/30">
            {isFetchingBids ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-5" />
                <p className="text-base font-bold text-slate-900">
                  Fetching latest proposals...
                </p>
              </div>
            ) : bids.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-3xl bg-white">
                <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-5 border border-slate-100 shadow-sm">
                  <Calculator className="w-10 h-10 text-slate-400" />
                </div>
                <p className="text-slate-900 font-extrabold text-xl mb-1">
                  No proposals yet.
                </p>
                <p className="text-sm font-medium text-slate-500">
                  Verified experts are currently reviewing your requirement.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {bids.map((bid) => (
                  <Card
                    key={bid.id}
                    className="bg-white border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-lg transition-all duration-300 rounded-3xl overflow-hidden group"
                  >
                    <CardHeader className="p-6 border-b border-slate-50 bg-slate-50/50">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center shadow-sm">
                            <User className="w-6 h-6 text-indigo-700" />
                          </div>
                          <div>
                            <CardTitle className="text-lg font-extrabold text-slate-900">
                              {bid.caId?.name || "Expert"}
                            </CardTitle>
                            <CardDescription className="text-xs font-extrabold text-emerald-700 mt-1 bg-emerald-100 px-2.5 py-0.5 rounded-md inline-block border border-emerald-200">
                              <CheckCircle className="w-3 h-3 inline mr-1 -mt-0.5" />
                              {bid.caId?.experience} Yrs Verified Exp
                            </CardDescription>
                          </div>
                        </div>
                        <div className="text-right bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold mb-1">
                            Fee Quote
                          </p>
                          <p className="text-2xl font-black text-indigo-600">
                            ₹{bid.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-5">
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-sm text-slate-700 leading-relaxed mb-6 relative">
                        <span className="absolute -top-3 left-5 bg-slate-800 text-white px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-widest rounded-md shadow-sm">
                          Proposal Message
                        </span>
                        <p className="italic font-medium">
                          "{bid.proposalText}"
                        </p>
                      </div>
                      <Button
                        className="w-full h-14 text-base font-extrabold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 group-hover:-translate-y-0.5 transition-all"
                        onClick={() => handleHireCA(bid.id)}
                        disabled={isHiring}
                      >
                        {isHiring ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <ClipboardCheck className="w-5 h-5 mr-2" />
                            Accept Bid & Proceed to Payment
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Hire Success Modal */}
      <Dialog open={hireSuccessOpen} onOpenChange={setHireSuccessOpen}>
        <DialogContent className="sm:max-w-sm bg-white border-slate-200 rounded-[2rem] p-8 shadow-2xl text-center">
          <div className="mx-auto w-24 h-24 rounded-full bg-emerald-100 border-[6px] border-emerald-50 flex items-center justify-center mb-6 shadow-inner">
            <ClipboardCheck className="w-12 h-12 text-emerald-600" />
          </div>
          <DialogTitle className="font-black text-3xl text-slate-900 mb-3 tracking-tight">
            Expert Hired!
          </DialogTitle>
          <DialogDescription className="text-base font-medium text-slate-500 leading-relaxed mb-8">
            Excellent choice. Our support team will contact you shortly to
            complete the secure payment process and unlock your workspace.
          </DialogDescription>
          <Button
            onClick={() => setHireSuccessOpen(false)}
            className="w-full h-14 rounded-xl text-base font-extrabold bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20"
          >
            Got it, thanks!
          </Button>
        </DialogContent>
      </Dialog>

      {/* Masked Chat Dialog */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="sm:max-w-md h-[600px] flex flex-col bg-white border-slate-200 rounded-3xl p-0 overflow-hidden gap-0 shadow-2xl">
          <DialogHeader className="border-b border-slate-100 px-6 py-5 bg-slate-50/80 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200">
                <Headphones className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <DialogTitle className="text-lg font-extrabold text-slate-900 leading-tight">
                  TCG Support Team
                </DialogTitle>
                <DialogDescription className="text-xs font-bold text-indigo-600 mt-1 uppercase tracking-widest bg-indigo-50 inline-block px-2 py-0.5 rounded">
                  Platform Admin
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 p-6 bg-slate-50/50">
            <div className="space-y-5">
              {messages.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-white border border-slate-200 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
                    <Headphones className="w-10 h-10 text-slate-300" />
                  </div>
                  <p className="text-slate-800 font-extrabold text-lg mb-1">
                    Start a conversation.
                  </p>
                  <p className="text-sm font-medium text-slate-500">
                    We're here to help coordinate with your expert safely.
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.senderRole === "client"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-sm ${
                        msg.senderRole === "client"
                          ? "bg-indigo-600 text-white rounded-br-none"
                          : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"
                      }`}
                    >
                      <p className="text-[15px] font-medium leading-relaxed">
                        {msg.text}
                      </p>
                      <p
                        className={`text-[10px] mt-2 font-bold tracking-wider ${
                          msg.senderRole === "client"
                            ? "text-indigo-200 text-right"
                            : "text-slate-400 text-left"
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

          <div className="border-t border-slate-100 p-4 bg-white flex gap-3">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="bg-slate-50 border-slate-200 h-12 rounded-xl focus-visible:ring-indigo-500 font-medium text-slate-700"
            />
            <Button
              onClick={sendMessage}
              size="icon"
              className="h-12 w-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-sm shrink-0"
            >
              <Send className="w-5 h-5 text-white" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientDashboard;
