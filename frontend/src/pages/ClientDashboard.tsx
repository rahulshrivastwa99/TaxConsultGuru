import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  PlusCircle,
  TrendingUp,
  ShieldCheck,
  Users as UsersIcon,
  Globe,
  Scale,
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

const iconMap: Record<string, React.ComponentType<any>> = {
  FileText,
  Calculator,
  ClipboardCheck,
  Building2,
  Receipt,
  BookOpen,
  ShieldCheck,
  Users: UsersIcon,
  Globe,
  Scale,
};

const NEW_COMPLIANCES = [
  {
    id: "roc-filing",
    name: "Annual ROC Filing",
    description:
      "Filing of Financial Statements (Form AOC-4) and Annual Returns (MGT-7/7A) with MCA.",
    defaultBudget: 4500,
    icon: "Building2",
  },
  {
    id: "tax-audit",
    name: "Tax Audit (Sec 44AB)",
    description:
      "Mandatory income tax audits for businesses exceeding turnover thresholds.",
    defaultBudget: 15000,
    icon: "Calculator",
  },
  {
    id: "epf-esi",
    name: "EPF & ESI Compliance",
    description:
      "Monthly return filing for Employees’ Provident Fund (EPF) and State Insurance (ESI).",
    defaultBudget: 3000,
    icon: "Users",
  },
  {
    id: "trademark-ipr",
    name: "Trademark & IPR",
    description:
      "Registration and renewal of Trademarks, Copyrights, and Patents to protect intellectual property.",
    defaultBudget: 7500,
    icon: "ShieldCheck",
  },
  {
    id: "contract-drafting",
    name: "Contract Drafting",
    description:
      "Drafting MOUs, vendor agreements, employment contracts, and shareholder agreements.",
    defaultBudget: 5000,
    icon: "FileText",
  },
  {
    id: "licensing",
    name: "Regulatory Licensing",
    description:
      "Obtaining FSSAI, Shops & Establishment, Drug Licenses, or Import-Export Code (IEC).",
    defaultBudget: 4000,
    icon: "Receipt",
  },
  {
    id: "payroll-pt",
    name: "Payroll & Prof. Tax",
    description:
      "Managing salary structures, PT registration, and minimum wage compliance.",
    defaultBudget: 3500,
    icon: "ClipboardCheck",
  },
  {
    id: "fdi-odi",
    name: "FDI/ODI Returns",
    description:
      "Filing Foreign Liability and Assets (FLA) return with RBI for international transactions.",
    defaultBudget: 12000,
    icon: "Globe",
  },
  {
    id: "msme-1",
    name: "MSME-1 Filing",
    description:
      "Half-yearly return for outstanding payments to Micro or Small Enterprises.",
    defaultBudget: 1500,
    icon: "Scale",
  },
];

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

  // Deduplicate services, prioritizing NEW_COMPLIANCES for descriptions
  const ALL_SERVICES = [
    ...NEW_COMPLIANCES,
    ...SERVICES.filter((s) => !NEW_COMPLIANCES.find((nc) => nc.id === s.id)),
  ];

  const [selectedService, setSelectedService] = useState<any | null>(null);
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
      toast.success("New Proposal Received!", {
        description: "An expert has bid on your project.",
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
      (r.status === "active" && r.isWorkspaceUnlocked !== true) ||
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
      expectedBudget === "" ? selectedService.defaultBudget : Number(expectedBudget),
    );
    toast.success("Request submitted! Connecting to expert...");
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
    <div className="min-h-screen bg-[#f8fafc] font-sans flex flex-col relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[110%] h-[70%] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/40 via-slate-50/10 to-transparent pointer-events-none z-0" />

      {/* Hero-Style Navbar */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-40 transition-all shadow-sm">
        <div className="container mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          <div
            className="flex items-center gap-2 md:gap-3 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <span className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900">
              {"Tax"}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">
                Consult
              </span>
              {"Guru"}
            </span>
            <Badge
              variant="outline"
              className="hidden sm:flex bg-white/50 text-slate-500 border-slate-200 text-[10px] tracking-widest uppercase font-bold px-2 py-0.5 mt-1"
            >
              Client Portal
            </Badge>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 md:gap-3 bg-white/50 px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md hover:bg-white cursor-pointer"
            >
              <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100">
                <User className="w-3.5 h-3.5 text-indigo-700" />
              </div>
              <span className="font-bold text-sm text-slate-700 hidden sm:inline-block">
                {currentUser.name.split(" ")[0]}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-slate-600 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 h-9 md:h-11 rounded-xl font-bold transition-all shadow-sm px-3 md:px-4"
            >
              <LogOut className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full container mx-auto px-4 md:px-6 py-6 md:py-8 max-w-6xl pb-24 relative z-10">
        {/* Welcome Banner */}
        <div className="mb-8 md:mb-10 relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-white shadow-sm border border-slate-200 p-6 md:p-12">
          <div className="absolute top-[-40%] right-[-5%] w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl pointer-events-none hidden md:block" />
          <div className="absolute bottom-[-30%] left-[-5%] w-64 h-64 bg-cyan-100/50 rounded-full blur-3xl pointer-events-none hidden md:block" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] md:text-[11px] font-bold uppercase tracking-widest mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Network Active
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2 md:mb-3">
                Hello, {currentUser.name.split(" ")[0]} 👋
              </h2>
              <p className="text-slate-500 font-medium text-sm md:text-lg max-w-lg leading-relaxed">
                Connect with India's top 10,000+ financial experts. Your journey
                to seamless compliance starts here.
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Button
                onClick={() =>
                  document
                    .getElementById("services-section")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 md:h-14 px-6 md:px-8 rounded-xl md:rounded-2xl shadow-xl shadow-indigo-600/20 transition-all hover:-translate-y-1"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                New Request
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Insights Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-10 md:mb-12">
          <Card className="bg-white border-slate-200 shadow-sm rounded-2xl md:rounded-3xl hover:shadow-md transition-shadow flex items-center gap-4 md:gap-5 p-5 md:p-6">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
              <Activity className="w-6 h-6 md:w-7 md:h-7 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                Active Jobs
              </p>
              <p className="text-xl md:text-2xl font-black text-slate-900 leading-none">
                {totalActive}
              </p>
            </div>
          </Card>
          <Card className="bg-white border-slate-200 shadow-sm rounded-2xl md:rounded-3xl hover:shadow-md transition-shadow flex items-center gap-4 md:gap-5 p-5 md:p-6">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-100 shrink-0">
              <TrendingUp className="w-6 h-6 md:w-7 md:h-7 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                Live Proposals
              </p>
              <p className="text-xl md:text-2xl font-black text-slate-900 leading-none">
                {totalBidsPending}
              </p>
            </div>
          </Card>
          <Card className="bg-white border-slate-200 shadow-sm rounded-2xl md:rounded-3xl hover:shadow-md transition-shadow flex items-center gap-4 md:gap-5 p-5 md:p-6">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shrink-0">
              <CheckCircle className="w-6 h-6 md:w-7 md:h-7 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                Successful Payouts
              </p>
              <p className="text-xl md:text-2xl font-black text-slate-900 leading-none">
                {totalCompleted}
              </p>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="mb-8 md:mb-10 bg-slate-200/50 p-1.5 rounded-2xl grid grid-cols-2 sm:inline-flex h-auto sm:h-14 border border-slate-200 shadow-inner backdrop-blur-sm">
            <TabsTrigger
              value="dashboard"
              className="px-4 sm:px-8 py-2.5 sm:py-0 rounded-xl data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm font-bold text-sm sm:text-base text-slate-500 transition-all"
            >
              <ClipboardCheck className="w-4 h-4 mr-2 hidden sm:inline" />
              My Workspace
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="px-4 sm:px-8 py-2.5 sm:py-0 rounded-xl data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm font-bold text-sm sm:text-base text-slate-500 transition-all"
            >
              <BookOpen className="w-4 h-4 mr-2 hidden sm:inline" />
              Project History
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="dashboard"
            className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out"
          >
            {/* Searching indicator */}
            {searchingRequests.length > 0 && (
              <Card className="border-indigo-100 bg-white shadow-xl shadow-indigo-100/50 rounded-3xl md:rounded-[2.5rem] overflow-hidden relative border-2 border-dashed">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-50/30 to-transparent animate-pulse" />
                <CardContent className="py-8 md:py-10 text-center relative z-10 px-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-sm border border-indigo-100">
                    <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin text-indigo-600" />
                  </div>
                  <h3 className="font-black text-xl md:text-2xl text-slate-900 mb-2">
                    Analyzing Marketplace Bids...
                  </h3>
                  <p className="text-sm md:text-base text-slate-500 font-medium">
                    Matching you with the highest rated expert for{" "}
                    <span className="font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                      {searchingRequests[0].serviceName}
                    </span>
                    .
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Active Workspaces */}
            {workspaceJobs.length > 0 && (
              <section>
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
                  <Shield className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />{" "}
                  Active Client-Expert Hubs
                </h2>
                <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {workspaceJobs.map((req) => (
                    <Card
                      key={req.id}
                      className="bg-white border-2 border-indigo-50 shadow-2xl shadow-indigo-100/30 rounded-[2.5rem] relative overflow-hidden group hover:shadow-indigo-200/50 transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="absolute -right-6 -top-6 opacity-[0.05] group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                        <Shield className="w-32 h-32 md:w-40 md:h-40 text-indigo-600" />
                      </div>
                      <CardHeader className="p-6 md:p-8 pb-4 relative z-10">
                        <div className="flex flex-col md:flex-row justify-between md:items-start gap-3 mb-4 md:mb-6">
                          <CardTitle className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight pr-4">
                            {req.serviceName}
                          </CardTitle>
                          <Badge className="bg-emerald-50 text-emerald-700 font-black text-[9px] tracking-widest uppercase shrink-0 border border-emerald-100 w-fit px-3 py-1 rounded-full">
                            SECURE HUB
                          </Badge>
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-4 md:p-5 border border-slate-100">
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">
                            Allocated Expert
                          </p>
                          <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                               <User className="w-3 h-3 text-indigo-600" />
                             </div>
                             <p className="text-base text-slate-900 font-black truncate">
                               {req.caName || "Pro Verified Expert"}
                             </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 md:p-8 pt-0 relative z-10">
                        <Button
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black h-14 md:h-16 rounded-[1.5rem] shadow-xl transition-all active:scale-95"
                          onClick={() => {
                            toast.success("Entering Secure Hub...");
                            navigate(`/workspace/${req.id}`);
                          }}
                        >
                          <Shield className="w-5 h-5 mr-3" />
                          Enter Premium Workspace
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
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 mb-4 md:mb-6 tracking-tight">
                  Current Requests & Proposals
                </h2>
                <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {activeRequests.map((req) => (
                    <Card
                      key={req.id}
                      className="group bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-indigo-200 transition-all duration-300 rounded-3xl md:rounded-[2rem] flex flex-col relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />

                      <CardHeader className="p-5 md:p-7 pb-4 md:pb-5 border-b border-slate-50">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3 md:mb-4">
                          <CardTitle className="text-base md:text-[17px] font-extrabold text-slate-900 leading-tight pr-3 group-hover:text-indigo-700 transition-colors">
                            {req.serviceName}
                          </CardTitle>
                          <Badge
                            className={`text-[9px] px-2.5 py-1 uppercase tracking-widest font-black border w-fit ${
                              req.status === "pending_approval"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : req.status === "awaiting_payment"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            {req.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-xs md:text-sm text-slate-500 font-medium line-clamp-2 italic">
                          "{req.description}"
                        </p>
                      </CardHeader>
                      <CardContent className="p-5 md:p-7 pt-4 md:pt-6 mt-auto flex flex-col bg-slate-50/40">
                        <div className="flex flex-col sm:flex-row gap-2 md:gap-3 mt-auto">
                          <Button
                            variant="outline"
                            className="w-full sm:flex-1 h-10 md:h-11 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-white hover:border-indigo-300 transition-all shadow-sm"
                            onClick={() => handleViewBids(req.id)}
                          >
                            View Bids
                          </Button>
                          <Button
                            className="w-full sm:flex-1 h-10 md:h-11 font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-md"
                            onClick={() => openChat(req.id)}
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Admin
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
                <div className="py-12 md:py-20 px-4 md:px-6 text-center border-2 border-dashed border-slate-300 rounded-3xl md:rounded-[3rem] bg-white/50">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-inner border border-slate-100">
                    <Rocket className="w-8 h-8 md:w-10 md:h-10 text-slate-300" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2 md:mb-3">
                    No active business requests
                  </h3>
                  <p className="text-sm md:text-base text-slate-500 font-medium max-w-sm mx-auto mb-6 md:mb-8">
                    Ready to streamline your compliance? Pick a service below
                    and get matched instantly.
                  </p>
                  <Button
                    onClick={() =>
                      document
                        .getElementById("services-section")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="bg-indigo-600 hover:bg-indigo-700 text-white h-11 md:h-12 px-6 md:px-8 rounded-xl font-bold shadow-lg w-full sm:w-auto"
                  >
                    Browse Catalog
                  </Button>
                </div>
              )}

            {/* Service Catalog */}
            <section id="services-section">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 md:mb-8 pt-6 border-t border-slate-200">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                  Available Premium Services
                </h2>
                <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold px-3 py-1 self-start sm:self-auto rounded-lg shadow-sm">
                  Instant Hiring
                </Badge>
              </div>

              <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {ALL_SERVICES.map((service, index) => {
                  const IconComponent = iconMap[service.icon] || FileText;
                  const isPopular = index === 0 || index === 1;

                  return (
                    <Card
                      key={service.id}
                      className="group cursor-pointer bg-white border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 rounded-3xl md:rounded-[2.5rem] flex flex-col overflow-hidden relative"
                      onClick={() => setSelectedService(service)}
                    >
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {isPopular && (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-amber-100 text-amber-700 border-none font-black text-[9px] uppercase tracking-widest px-2.5 py-1 shadow-sm flex items-center gap-1">
                            <Flame className="w-3 h-3" /> Popular
                          </Badge>
                        </div>
                      )}

                      <CardHeader className="p-6 md:p-8 pb-4 md:pb-5">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 md:mb-6 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all duration-300 shadow-sm">
                          <IconComponent
                            className="w-6 h-6 md:w-8 md:h-8 text-slate-500 group-hover:text-indigo-600 transition-colors"
                            strokeWidth={2}
                          />
                        </div>
                        <CardTitle className="text-lg md:text-xl font-black text-slate-900 pr-10 group-hover:text-indigo-700 transition-colors">
                          {service.name}
                        </CardTitle>
                        <CardDescription className="text-xs md:text-sm text-slate-500 leading-relaxed line-clamp-2 mt-2 font-medium">
                          {service.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 md:p-8 pt-0 mt-auto">
                        <div className="flex items-center justify-between bg-slate-50 p-4 md:p-5 rounded-xl md:rounded-[1.5rem] border border-slate-100 group-hover:bg-indigo-50/50 transition-colors">
                          <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px] md:text-[10px]">
                            Investment
                          </span>
                          <span className="font-black text-indigo-600 text-lg md:text-xl">
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
            <section className="bg-white p-6 md:p-10 rounded-3xl md:rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none hidden md:block">
                <BookOpen className="w-64 h-64 text-indigo-900" />
              </div>
              <div className="mb-8 md:mb-12 border-b border-slate-100 pb-6 md:pb-8 relative z-10">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-2">
                  Vault Archives
                </h2>
                <p className="text-sm md:text-lg text-slate-500 font-medium">
                  Secure history of your completed financial milestones.
                </p>
              </div>

              {pastProjects.length === 0 ? (
                <div className="py-16 md:py-24 text-center border-2 border-dashed border-slate-200 rounded-3xl md:rounded-[2.5rem] bg-slate-50/50">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-sm border border-slate-100">
                    <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-slate-300" />
                  </div>
                  <p className="text-slate-800 font-black text-lg md:text-xl mb-1">
                    Your vault is empty
                  </p>
                  <p className="text-slate-500 font-medium text-sm md:text-base">
                    Completed and paid projects will be securely archived here.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {pastProjects.map((req) => (
                    <Card
                      key={req.id}
                      className="bg-slate-50/60 border-slate-200 border-dashed hover:bg-white hover:border-solid hover:shadow-xl transition-all duration-300 rounded-3xl md:rounded-[2rem]"
                    >
                      <CardHeader className="p-5 md:p-7 pb-4 md:pb-5 border-b border-slate-100">
                        <div className="flex items-center justify-between mb-3 md:mb-4">
                          <Badge
                            variant="outline"
                            className="text-[9px] uppercase font-black tracking-widest bg-white border-slate-300 text-slate-500 px-2 py-0.5"
                          >
                            ARCHIVED
                          </Badge>
                          <span className="text-xs font-bold text-slate-400">
                            {new Date(req.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <CardTitle className="text-base md:text-lg font-black text-slate-800">
                          {req.serviceName}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-5 md:p-7">
                        <div className="space-y-3 bg-white p-4 md:p-5 rounded-xl md:rounded-2xl border border-slate-100 shadow-sm">
                          <div className="flex justify-between items-center text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400">
                            <span>Paid</span>
                            <span className="text-slate-900 font-black text-sm">
                              ₹{req.budget?.toLocaleString()}
                            </span>
                          </div>
                          <div className="h-px bg-slate-100 w-full" />
                          <div className="flex justify-between items-center text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400">
                            <span>Expert</span>
                            <span className="text-indigo-600 font-black text-xs md:text-sm truncate max-w-[120px]">
                              {req.caName || "Verified Professional"}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 md:mt-6 flex items-center justify-center gap-2 text-emerald-600 font-black text-[9px] md:text-[10px] uppercase tracking-widest bg-emerald-50 py-2.5 md:py-3 rounded-xl border border-emerald-100">
                          <CheckCircle className="w-3 h-3 md:w-4 md:h-4" />{" "}
                          Compliance Completed
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

      {/* Mini Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white/60 backdrop-blur-md">
        <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-xs md:text-sm text-slate-500 font-semibold italic">
            © {new Date().getFullYear()} TaxConsultGuru. Designed for
            Excellence.
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-xs md:text-sm font-black text-slate-400">
            <Link
              to="/about"
              className="hover:text-indigo-600 transition-colors uppercase tracking-widest text-[10px] md:text-[11px]"
            >
              About Us
            </Link>
            <Link
              to="/privacy"
              className="hover:text-indigo-600 transition-colors uppercase tracking-widest text-[10px] md:text-[11px]"
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="hover:text-indigo-600 transition-colors uppercase tracking-widest text-[10px] md:text-[11px]"
            >
              Terms
            </Link>
            <Link
              to="/contact"
              className="hover:text-indigo-600 transition-colors uppercase tracking-widest text-[10px] md:text-[11px]"
            >
              Support
            </Link>
          </div>
        </div>
      </footer>

      {/* Service Request Dialog - Mobile Optimized */}
      <Dialog
        open={!!selectedService}
        onOpenChange={() => setSelectedService(null)}
      >
        <DialogContent className="w-[95vw] sm:max-w-[460px] bg-white border-none rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 shadow-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 border border-indigo-100 mx-auto sm:mx-0">
              <FileText size={24} strokeWidth={3} />
            </div>
            <DialogTitle className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight text-center sm:text-left">
              Request {selectedService?.name}
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-medium mt-2 leading-relaxed text-sm sm:text-base text-center sm:text-left">
              Tell us exactly what you need. Our algorithm will match you with a
              top-rated expert instantly.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-6 pt-2">
            <div className="p-4 sm:p-5 bg-slate-50 border border-slate-100 rounded-2xl sm:rounded-3xl flex justify-between items-center">
              <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">
                Base Investment
              </span>
              <span className="font-black text-indigo-600 text-xl sm:text-2xl">
                ₹{selectedService?.defaultBudget?.toLocaleString()}
              </span>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest px-1">
                Detailed Requirements
              </label>
              <Textarea
                placeholder="E.g. I need to file GSTR-1..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-600 rounded-xl sm:rounded-2xl resize-none font-medium text-sm text-slate-700 min-h-[80px] sm:min-h-[100px] p-3 sm:p-4"
              />
            </div>

            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between items-end px-1">
                <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">
                  Your Budget (₹)
                </label>
                <span className="text-[9px] sm:text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  Standard: ₹{selectedService?.defaultBudget.toLocaleString()}
                </span>
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
                className="h-12 sm:h-14 bg-slate-50 border-slate-200 focus-visible:ring-indigo-600 rounded-xl sm:rounded-2xl font-black text-lg sm:text-xl text-slate-900 px-4 sm:px-6 shadow-inner"
              />
            </div>

            <Button
              onClick={handleRequestService}
              className="w-full h-14 sm:h-16 text-base sm:text-lg font-black rounded-xl sm:rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/30 transition-all hover:-translate-y-1"
              disabled={!description.trim() || isRequesting}
            >
              {isRequesting ? (
                <>
                  <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 animate-spin" />{" "}
                  Matching...
                </>
              ) : (
                "Submit to Marketplace"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bids Dialog - Mobile Optimized */}
      <Dialog open={bidsDialogOpen} onOpenChange={setBidsDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[85vh] flex flex-col bg-white border-none rounded-3xl sm:rounded-[3rem] p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="p-6 sm:p-10 pb-4 sm:pb-8 border-b border-slate-100 bg-slate-50/50 text-left">
            <DialogTitle className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Expert Marketplace
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base font-medium text-slate-500 mt-1 sm:mt-2">
              Verified professionals have reviewed your request. Compare
              proposals and hire your partner.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 p-4 sm:p-10 bg-white">
            {isFetchingBids ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin text-indigo-600 mb-4 sm:mb-5" />
                <p className="text-base sm:text-lg font-bold text-slate-900">
                  Scanning proposals...
                </p>
              </div>
            ) : bids.length === 0 ? (
              <div className="text-center py-20">
                <Calculator className="w-12 h-12 sm:w-16 sm:h-16 text-slate-200 mx-auto mb-4 sm:mb-6" />
                <p className="text-slate-900 font-black text-lg sm:text-xl">
                  Waiting for expert reviews
                </p>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {bids.map((bid) => (
                  <Card
                    key={bid.id}
                    className="bg-white border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-xl transition-all duration-300 rounded-2xl sm:rounded-[2rem] overflow-hidden group"
                  >
                    <CardHeader className="p-5 sm:p-8 border-b border-slate-50 bg-slate-50/30 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-indigo-100 border-2 border-white shadow-sm flex items-center justify-center shrink-0">
                          <User className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-700" />
                        </div>
                        <div>
                          <CardTitle className="text-lg sm:text-xl font-black text-slate-900">
                            {bid.caId?.name || "Expert"}
                          </CardTitle>
                          <CardDescription className="text-[10px] sm:text-xs font-black text-emerald-600 mt-1 bg-emerald-50 px-2 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-full inline-block border border-emerald-100">
                            <CheckCircle className="w-3 h-3 inline mr-1 -mt-0.5" />
                            {bid.caId?.experience} Yrs Verified Exp
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-left sm:text-right w-full sm:w-auto bg-white sm:bg-transparent p-3 sm:p-0 rounded-xl border border-slate-100 sm:border-none">
                        <p className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-widest font-black mb-0.5 sm:mb-1">
                          Quote
                        </p>
                        <p className="text-2xl sm:text-3xl font-black text-indigo-600">
                          ₹{bid.price.toLocaleString()}
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className="p-5 sm:p-8 pt-4 sm:pt-6">
                      <div className="bg-slate-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-100 mb-6 sm:mb-8 relative italic font-medium text-sm sm:text-base text-slate-600 leading-relaxed">
                        <span className="absolute -top-3 left-4 sm:left-6 bg-slate-800 text-white px-2 sm:px-3 py-0.5 sm:py-1 text-[8px] sm:text-[9px] font-black uppercase tracking-widest rounded-md">
                          Proposal Note
                        </span>
                        "{bid.proposalText}"
                      </div>
                      <Button
                        className="w-full h-12 sm:h-16 text-sm sm:text-lg font-black rounded-xl sm:rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/20 sm:group-hover:-translate-y-1 transition-all"
                        onClick={() => handleHireCA(bid.id)}
                        disabled={isHiring}
                      >
                        {isHiring ? (
                          <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                        ) : (
                          <>
                            <ClipboardCheck className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                            Hire Expert & Start Workspace
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
        <DialogContent className="w-[95vw] sm:max-w-sm bg-white border-slate-200 rounded-[2rem] p-6 sm:p-8 shadow-2xl text-center">
          <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-100 border-[6px] border-emerald-50 flex items-center justify-center mb-5 sm:mb-6 shadow-inner">
            <ClipboardCheck className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-600" />
          </div>
          <DialogTitle className="font-black text-2xl sm:text-3xl text-slate-900 mb-2 sm:mb-3 tracking-tight">
            Expert Hired!
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base font-medium text-slate-500 leading-relaxed mb-6 sm:mb-8">
            Excellent choice. Our support team will contact you shortly to
            complete the secure payment process and unlock your workspace.
          </DialogDescription>
          <Button
            onClick={() => setHireSuccessOpen(false)}
            className="w-full h-12 sm:h-14 rounded-xl text-sm sm:text-base font-extrabold bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20"
          >
            Got it, thanks!
          </Button>
        </DialogContent>
      </Dialog>

      {/* Masked Chat Dialog - Mobile Optimized */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md h-[85vh] sm:h-[600px] flex flex-col bg-white border-slate-200 rounded-3xl p-0 overflow-hidden gap-0 shadow-2xl">
          <DialogHeader className="border-b border-slate-100 px-5 sm:px-6 py-4 sm:py-5 bg-slate-50/80 backdrop-blur-md">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200">
                <Headphones className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="text-left">
                <DialogTitle className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
                  TCG Support Team
                </DialogTitle>
                <DialogDescription className="text-[10px] sm:text-xs font-bold text-indigo-600 mt-1 uppercase tracking-widest bg-indigo-50 inline-block px-2 py-0.5 rounded">
                  Platform Admin
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 p-4 sm:p-6 bg-slate-50/50">
            <div className="space-y-4 sm:space-y-5">
              {messages.length === 0 ? (
                <div className="text-center py-12 sm:py-16">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white border border-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5 shadow-sm">
                    <Headphones className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300" />
                  </div>
                  <p className="text-slate-800 font-extrabold text-base sm:text-lg mb-1">
                    Start a conversation.
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-slate-500">
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
                      className={`max-w-[85%] rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3 shadow-sm ${
                        msg.senderRole === "client"
                          ? "bg-indigo-600 text-white rounded-br-none"
                          : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm sm:text-[15px] font-medium leading-relaxed">
                        {msg.text}
                      </p>
                      <p
                        className={`text-[9px] sm:text-[10px] mt-1.5 sm:mt-2 font-bold tracking-wider ${
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

          <div className="border-t border-slate-100 p-3 sm:p-4 bg-white flex gap-2 sm:gap-3">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="bg-slate-50 border-slate-200 h-11 sm:h-12 rounded-xl focus-visible:ring-indigo-500 font-medium text-sm sm:text-base text-slate-700"
            />
            <Button
              onClick={sendMessage}
              size="icon"
              className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-sm shrink-0"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientDashboard;
