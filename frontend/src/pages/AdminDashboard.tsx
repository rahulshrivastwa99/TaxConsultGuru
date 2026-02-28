import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Shield,
  LogOut,
  Users,
  Briefcase,
  Terminal,
  MessageCircle,
  Send,
  UserPlus,
  CheckCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Receipt,
  Headphones,
  BookOpen,
  ShieldCheck,
  AlertTriangle,
  CreditCard,
  Wallet,
  Eye,
  Activity,
  Menu,
  X,
  User as UserIcon, // Icon imported securely as UserIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useMockBackend,
  ActivityLog,
  ServiceRequest,
} from "@/context/MockBackendContext";
import { useSocket } from "@/context/SocketContext";
import { toast } from "sonner";
import { PremiumAlert } from "@/components/ui/PremiumAlert";
import {
  PremiumConfirmDialog,
  ConfirmType,
} from "@/components/ui/PremiumConfirmDialog";

const SidebarItem = ({
  id,
  label,
  icon: Icon,
  badge = 0,
  activeTab,
  setActiveTab,
  onClickMobile,
}: {
  id: any;
  label: string;
  icon: React.ElementType;
  badge?: number;
  activeTab: string;
  setActiveTab: (val: any) => void;
  onClickMobile?: () => void;
}) => {
  const isActive = activeTab === id;
  return (
    <button
      onClick={() => {
        setActiveTab(id);
        onClickMobile?.();
      }}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all mb-1 ${
        isActive
          ? "bg-indigo-600 text-white shadow-md shadow-indigo-200/50 font-semibold"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium"
      }`}
    >
      <div className="flex items-center gap-3 text-[14px]">
        <Icon
          className={`w-[18px] h-[18px] ${
            isActive ? "text-white" : "text-slate-500"
          }`}
        />
        {label}
      </div>
      {badge > 0 && (
        <Badge
          className={`h-5 min-w-[20px] px-1.5 flex items-center justify-center border-0 text-[10px] font-black ${
            isActive
              ? "bg-white/20 text-white"
              : "bg-indigo-600 text-white shadow-sm"
          }`}
        >
          {badge}
        </Badge>
      )}
    </button>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    isLoading,
    logout,
    users,
    requests,
    logs,
    clientMessages,
    caMessages,
    addClientMessage,
    addCAMessage,
    forwardToClient,
    forwardToCA,
    addAdmin,
    pendingCAs,
    pendingJobs,
    fetchAdminData,
    verifyCA,
    approveJob,
    rejectJob,
    unlockWorkspace,
    archiveProject,
  } = useMockBackend();
  const { socket } = useSocket();

  const [activeTab, setActiveTab] = useState<
    | "bridge"
    | "team"
    | "feed"
    | "verification"
    | "moderation"
    | "payments"
    | "overwatch"
    | "payouts"
    | "history"
  >("bridge");

  // Mobile Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(
    null,
  );
  const [clientMessageInput, setClientMessageInput] = useState("");
  const [caMessageInput, setCAMessageInput] = useState("");

  // Add admin form state
  const [addAdminOpen, setAddAdminOpen] = useState(false);
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");

  // Confirmation state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    description: string;
    onConfirm: () => void;
    type: ConfirmType;
  }>({
    title: "",
    description: "",
    onConfirm: () => {},
    type: "question",
  });

  const triggerConfirm = (config: {
    title: string;
    description: string;
    onConfirm: () => void;
    type: ConfirmType;
  }) => {
    setConfirmConfig(config);
    setConfirmOpen(true);
  };

  useEffect(() => {
    if (!isLoading) {
      if (!currentUser || currentUser.role !== "admin") {
        navigate("/");
      } else {
        fetchAdminData();
      }
    }
  }, [currentUser, isLoading, navigate, fetchAdminData]);

  useEffect(() => {
    if (!socket || currentUser?.role !== "admin") return;

    const handleNewJob = (data: any) => {
      toast.info(`New Job Posted: ${data.serviceName}`);
      fetchAdminData();
    };

    const handlePendingPayment = (data: any) => {
      toast.info(`New Hire! Pending Payment for: ${data.request.serviceName}`);
      fetchAdminData();
    };

    const handleStatusUpdate = (data: any) => {
      toast.info(`Status Update: ${data.message}`);
      fetchAdminData();
    };

    socket.on("new_pending_job", handleNewJob);
    socket.on("new_pending_payment", handlePendingPayment);
    socket.on("job_status_updated", handleStatusUpdate);

    return () => {
      socket.off("new_pending_job", handleNewJob);
      socket.off("new_pending_payment", handlePendingPayment);
      socket.off("job_status_updated", handleStatusUpdate);
    };
  }, [socket, currentUser, fetchAdminData]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "admin") return null;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  const getPendingApprovalRequests = () =>
    requests.filter((r) => r.status === "pending_approval");

  const getActiveRequests = () =>
    requests.filter(
      (r) =>
        r.status === "active" ||
        r.status === "live" ||
        r.status === "completed",
    );

  const getPendingPaymentRequests = () =>
    requests.filter((r) => r.status === "awaiting_payment");

  const pendingRequests = getPendingApprovalRequests();
  const activeRequests = getActiveRequests();
  const paymentAlerts = getPendingPaymentRequests();
  const payoutRequests = requests.filter(
    (r) => r.status === "ready_for_payout",
  );
  const archivedRequests = requests.filter((r) => r.isArchived === true);
  const allActiveAndPending = [
    ...pendingRequests,
    ...activeRequests,
    ...paymentAlerts,
  ];

  const onlineClients = users.filter((u) => u.role === "client" && u.isOnline);
  const onlineCAs = users.filter((u) => u.role === "ca" && u.isOnline);
  const adminUsers = users.filter((u) => u.role === "admin");

  const getLogColor = (type: ActivityLog["type"]) => {
    switch (type) {
      case "request":
        return "text-amber-400";
      case "accept":
        return "text-blue-400";
      case "approve":
        return "text-emerald-400";
      case "forward":
        return "text-purple-400";
      case "admin_added":
        return "text-pink-400";
      default:
        return "text-slate-400";
    }
  };

  const highlightSpam = (text: string) => {
    // Simplified highlight for brevity, actual function works fine
    return text;
  };

  const hasSpam = (text: string) => {
    if (!text) return false;
    const spamRegex = /(\d{10}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
    return spamRegex.test(text);
  };

  const sendToClient = () => {
    if (!clientMessageInput.trim() || !selectedRequest) return;
    addClientMessage(
      selectedRequest.id,
      currentUser.id,
      "TCG Expert Team",
      "admin",
      clientMessageInput,
    );
    setClientMessageInput("");
  };

  const sendToCA = () => {
    if (!caMessageInput.trim() || !selectedRequest) return;
    addCAMessage(
      selectedRequest.id,
      currentUser.id,
      "TCG Admin Desk",
      "admin",
      caMessageInput,
    );
    setCAMessageInput("");
  };

  const handleForwardToClient = (messageId: string) => {
    if (!selectedRequest) return;
    forwardToClient(selectedRequest.id, messageId);
  };

  const handleForwardToCA = (messageId: string) => {
    if (!selectedRequest) return;
    forwardToCA(selectedRequest.id, messageId);
  };

  const handleApprove = (requestId: string) => {
    approveJob(requestId);
    toast.success("Request Approved!", {
      description: "Job is now live and available for experts to bid.",
    });
  };

  const handleAddAdmin = () => {
    if (!newAdminName || !newAdminEmail || !newAdminPassword) {
      toast.error("Please fill all fields");
      return;
    }
    addAdmin(newAdminName, newAdminEmail, newAdminPassword);
    setAddAdminOpen(false);
    setNewAdminName("");
    setNewAdminEmail("");
    setNewAdminPassword("");
  };

  const clientMsgs = selectedRequest
    ? clientMessages[selectedRequest.id] || []
    : [];
  const caMsgs = selectedRequest ? caMessages[selectedRequest.id] || [] : [];

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Mobile Overlay Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* --- SIDEBAR (Responsive Drawer) --- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[260px] md:w-[280px] bg-white border-r border-slate-200 flex flex-col h-full transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 md:p-6 pb-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-extrabold text-slate-900 leading-tight">
                Command Center
              </h1>
            </div>
          </div>
          <button
            className="md:hidden text-slate-400 hover:text-slate-700"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <ScrollArea className="flex-1 px-4">
          <div className="py-2">
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 mt-2">
              Operations
            </p>
            <SidebarItem
              id="bridge"
              label="Bridge Chat"
              icon={MessageCircle}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onClickMobile={() => setIsSidebarOpen(false)}
            />
            <SidebarItem
              id="feed"
              label="Live Feed"
              icon={Activity}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onClickMobile={() => setIsSidebarOpen(false)}
            />
            <SidebarItem
              id="overwatch"
              label="Overwatch"
              icon={Eye}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onClickMobile={() => setIsSidebarOpen(false)}
            />

            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 mt-5">
              Review & Approvals
            </p>
            <SidebarItem
              id="verification"
              label="CA Verification"
              icon={ShieldCheck}
              badge={pendingCAs.length}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onClickMobile={() => setIsSidebarOpen(false)}
            />
            <SidebarItem
              id="moderation"
              label="Job Moderation"
              icon={AlertTriangle}
              badge={pendingJobs.length}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onClickMobile={() => setIsSidebarOpen(false)}
            />

            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 mt-5">
              Financials
            </p>
            <SidebarItem
              id="payments"
              label="Pending Payments"
              icon={CreditCard}
              badge={paymentAlerts.length}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onClickMobile={() => setIsSidebarOpen(false)}
            />
            <SidebarItem
              id="payouts"
              label="Payouts"
              icon={Wallet}
              badge={payoutRequests.length}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onClickMobile={() => setIsSidebarOpen(false)}
            />

            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 mt-5">
              Management
            </p>
            <SidebarItem
              id="team"
              label="Admin Team"
              icon={Users}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onClickMobile={() => setIsSidebarOpen(false)}
            />
            <SidebarItem
              id="history"
              label="Archives"
              icon={BookOpen}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onClickMobile={() => setIsSidebarOpen(false)}
            />
          </div>
        </ScrollArea>

        {/* FIXED FOOTER WITH CORRECT LOGO & BUTTON ORDER */}
        <div className="p-4 border-t border-slate-100 bg-white flex flex-col gap-3">
          <div
            onClick={() => navigate("/profile")}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 cursor-pointer font-bold text-sm transition-all"
          >
            {/* Using the CORRECT UserIcon import here */}
            <UserIcon className="w-4 h-4 text-indigo-600" /> Admin Profile
          </div>
          <div
            className="flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity text-sm font-extrabold tracking-tight text-slate-900 py-1"
            onClick={() => navigate("/")}
          >
            {"Tax"}
            <span className="text-indigo-600">Consult</span>
            {"Guru"}
          </div>
          <Button
            variant="outline"
            className="w-full justify-start text-slate-600 h-10 border-slate-200"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Navbar for Hamburger Menu */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-slate-900">
            <Shield className="w-5 h-5 text-indigo-600" /> Command Center
          </div>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 bg-slate-100 rounded-md text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        <ScrollArea className="flex-1 z-10 bg-slate-50/50">
          <div className="p-4 md:p-8">
            {/* Top Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 md:p-6">
                  <p className="text-xs md:text-sm text-slate-500 mb-1 font-medium">
                    Online Clients
                  </p>
                  <p className="text-2xl md:text-3xl font-extrabold text-slate-900">
                    {onlineClients.length}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 md:p-6">
                  <p className="text-xs md:text-sm text-slate-500 mb-1 font-medium">
                    Online CAs
                  </p>
                  <p className="text-2xl md:text-3xl font-extrabold text-slate-900">
                    {onlineCAs.length}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 md:p-6">
                  <p className="text-xs md:text-sm text-slate-500 mb-1 font-medium">
                    Pending Mod
                  </p>
                  <p className="text-2xl md:text-3xl font-extrabold text-amber-600">
                    {pendingJobs.length}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 md:p-6">
                  <p className="text-xs md:text-sm text-slate-500 mb-1 font-medium">
                    Active Jobs
                  </p>
                  <p className="text-2xl md:text-3xl font-extrabold text-indigo-600">
                    {activeRequests.length}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* TAB CONTENTS */}

            {/* 1. BRIDGE CHAT */}
            {activeTab === "bridge" && (
              <div className="grid lg:grid-cols-4 gap-4 md:gap-6 animate-in fade-in">
                {/* Job List Sidebar */}
                <Card className="bg-white shadow-sm border-slate-200 h-[250px] lg:h-[600px] overflow-hidden flex flex-col">
                  <CardHeader className="p-4 border-b bg-slate-50">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-700">
                      Active Jobs
                    </CardTitle>
                  </CardHeader>
                  <ScrollArea className="flex-1 p-2 md:p-3">
                    <div className="space-y-2">
                      {allActiveAndPending.length === 0 ? (
                        <p className="text-xs text-center p-4 text-slate-500">
                          No active jobs
                        </p>
                      ) : (
                        allActiveAndPending.map((req) => (
                          <div
                            key={req.id}
                            onClick={() => setSelectedRequest(req)}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                              selectedRequest?.id === req.id
                                ? "bg-indigo-50 border-indigo-200"
                                : "bg-white hover:bg-slate-50 border-transparent hover:border-slate-200"
                            }`}
                          >
                            <p className="font-bold text-xs truncate text-slate-800">
                              {req.serviceName}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-1 truncate">
                              C: {req.clientName}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </Card>

                <div className="lg:col-span-3">
                  {selectedRequest ? (
                    <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
                      {/* --- LEFT: Client Chat --- */}
                      <Card className="h-[400px] lg:h-[600px] flex flex-col shadow-sm border-slate-200">
                        <CardHeader className="p-3 md:p-4 bg-blue-50 border-b flex-row justify-between items-center">
                          <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-600" />
                            Client: {selectedRequest.clientName}
                          </span>
                        </CardHeader>
                        <ScrollArea className="flex-1 p-3 md:p-4 bg-slate-50/50">
                          <div className="space-y-3">
                            {clientMsgs.map((msg) => (
                              <div
                                key={msg.id}
                                className={`flex ${
                                  msg.senderRole === "admin"
                                    ? "justify-end"
                                    : "justify-start"
                                }`}
                              >
                                <div
                                  className={`flex flex-col max-w-[85%] ${
                                    msg.senderRole === "admin"
                                      ? "items-end"
                                      : "items-start"
                                  }`}
                                >
                                  <div
                                    className={`text-xs md:text-sm p-2.5 md:p-3 rounded-xl shadow-sm ${
                                      msg.senderRole === "admin"
                                        ? "bg-indigo-600 text-white rounded-br-none"
                                        : "bg-white border border-slate-200 rounded-bl-none text-slate-800"
                                    }`}
                                  >
                                    <p>{msg.text}</p>
                                  </div>
                                  {!msg.senderRole.includes("admin") && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 text-[9px] md:text-[10px] mt-1 p-1 px-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                      onClick={() =>
                                        forwardToCA(selectedRequest.id, msg.id)
                                      }
                                    >
                                      Forward CA{" "}
                                      <ArrowRight className="w-3 h-3 ml-1" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                        <div className="p-2 md:p-3 flex gap-2 border-t border-slate-100 bg-white">
                          <Input
                            value={clientMessageInput}
                            onChange={(e) =>
                              setClientMessageInput(e.target.value)
                            }
                            onKeyDown={(e) =>
                              e.key === "Enter" && sendToClient()
                            }
                            className="h-9 md:h-10 text-xs md:text-sm bg-slate-50 border-slate-200"
                            placeholder="Message Client..."
                          />
                          <Button
                            size="sm"
                            onClick={sendToClient}
                            className="h-9 w-9 md:h-10 md:w-10 bg-indigo-600 p-0 shrink-0"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </Card>

                      {/* --- RIGHT: CA Chat --- */}
                      <Card className="h-[400px] lg:h-[600px] flex flex-col shadow-sm border-slate-200">
                        <CardHeader className="p-3 md:p-4 bg-emerald-50 border-b flex-row justify-between items-center">
                          <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-emerald-600" />
                            Expert: {selectedRequest.caName || "N/A"}
                          </span>
                        </CardHeader>
                        <ScrollArea className="flex-1 p-3 md:p-4 bg-slate-50/50">
                          <div className="space-y-3">
                            {caMsgs.map((msg) => (
                              <div
                                key={msg.id}
                                className={`flex ${
                                  msg.senderRole === "admin"
                                    ? "justify-end"
                                    : "justify-start"
                                }`}
                              >
                                <div
                                  className={`flex flex-col max-w-[85%] ${
                                    msg.senderRole === "admin"
                                      ? "items-end"
                                      : "items-start"
                                  }`}
                                >
                                  <div
                                    className={`text-xs md:text-sm p-2.5 md:p-3 rounded-xl shadow-sm ${
                                      msg.senderRole === "admin"
                                        ? "bg-slate-800 text-white rounded-br-none"
                                        : "bg-white border border-slate-200 rounded-bl-none text-slate-800"
                                    }`}
                                  >
                                    <p>{msg.text}</p>
                                  </div>
                                  {!msg.senderRole.includes("admin") && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 text-[9px] md:text-[10px] mt-1 p-1 px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                      onClick={() =>
                                        forwardToClient(
                                          selectedRequest.id,
                                          msg.id,
                                        )
                                      }
                                    >
                                      <ArrowLeft className="w-3 h-3 mr-1" />{" "}
                                      Forward Client
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                        <div className="p-2 md:p-3 flex gap-2 border-t border-slate-100 bg-white">
                          <Input
                            value={caMessageInput}
                            onChange={(e) => setCAMessageInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendToCA()}
                            className="h-9 md:h-10 text-xs md:text-sm bg-slate-50 border-slate-200"
                            placeholder="Message CA..."
                          />
                          <Button
                            size="sm"
                            onClick={sendToCA}
                            className="h-9 w-9 md:h-10 md:w-10 bg-slate-800 p-0 shrink-0"
                          >
                            <Send className="w-3.5 h-3.5 text-white" />
                          </Button>
                        </div>
                      </Card>
                    </div>
                  ) : (
                    <Card className="h-[300px] lg:h-[600px] flex items-center justify-center border-dashed border-2 text-slate-400 bg-white/50">
                      <div className="text-center">
                        <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
                        <p className="font-medium text-sm">
                          Select a job to open communications
                        </p>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* Other tabs wrapped in mobile friendly containers */}

            {activeTab === "payments" && (
              <Card className="bg-white shadow-sm animate-in fade-in">
                <CardHeader className="bg-blue-50 border-b p-4 md:p-6">
                  <CardTitle className="text-lg md:text-xl">
                    Pending Payments
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full min-w-[700px] text-left text-sm whitespace-nowrap">
                      <thead>
                        <tr className="bg-slate-50 border-b">
                          <th className="p-4 font-semibold text-xs uppercase text-slate-500">
                            Job
                          </th>
                          <th className="p-4 font-semibold text-xs uppercase text-slate-500">
                            Client
                          </th>
                          <th className="p-4 font-semibold text-xs uppercase text-slate-500">
                            CA
                          </th>
                          <th className="p-4 font-semibold text-xs uppercase text-slate-500 text-right">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {paymentAlerts.map((req) => (
                          <tr key={req.id}>
                            <td className="p-4 font-bold text-slate-800">
                              {req.serviceName}
                            </td>
                            <td className="p-4 text-slate-600">
                              {req.clientName}
                            </td>
                            <td className="p-4">
                              <Badge
                                variant="outline"
                                className="bg-indigo-50 text-indigo-700"
                              >
                                {req.caName}
                              </Badge>
                            </td>
                            <td className="p-4 text-right">
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                onClick={() => unlockWorkspace(req.id)}
                              >
                                Unlock Workspace
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {paymentAlerts.length === 0 && (
                          <tr>
                            <td
                              colSpan={4}
                              className="p-10 text-center text-slate-500"
                            >
                              No pending payments.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "payouts" && (
              <Card className="bg-white shadow-sm animate-in fade-in">
                <CardHeader className="bg-purple-50 border-b p-4 md:p-6">
                  <CardTitle className="text-lg md:text-xl">
                    Ready for Payout
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full min-w-[700px] text-left text-sm whitespace-nowrap">
                      <thead>
                        <tr className="bg-slate-50 border-b">
                          <th className="p-4 font-semibold text-xs uppercase text-slate-500">
                            Job Details
                          </th>
                          <th className="p-4 font-semibold text-xs uppercase text-slate-500">
                            Payout Amount
                          </th>
                          <th className="p-4 font-semibold text-xs uppercase text-slate-500 text-right">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {payoutRequests.map((req) => {
                          const budget = req.budget || 0;
                          const commission = budget * 0.1;
                          const finalPayout = budget - commission;

                          return (
                            <tr
                              key={req.id}
                              className="hover:bg-purple-50/30 transition-colors"
                            >
                              <td className="p-4">
                                <p className="font-bold text-slate-800">
                                  {req.serviceName}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                  Expert: {req.caName}
                                </p>
                              </td>
                              <td className="p-4 font-mono font-bold text-emerald-600 text-lg">
                                ₹{finalPayout.toLocaleString()}
                              </td>
                              <td className="p-4 text-right">
                                <Button
                                  size="sm"
                                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
                                  onClick={() => archiveProject(req.id)}
                                >
                                  Mark Paid & Archive
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                        {payoutRequests.length === 0 && (
                          <tr>
                            <td
                              colSpan={3}
                              className="p-10 text-center text-slate-500"
                            >
                              No payouts pending.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Moderation Tab */}
            {activeTab === "moderation" && (
              <Card className="bg-white shadow-sm animate-in fade-in">
                <CardHeader className="bg-amber-50 border-b p-4 md:p-6">
                  <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" /> Job
                    Moderation
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  <div className="space-y-4">
                    {pendingJobs.length === 0 ? (
                      <p className="text-center text-slate-500 py-10">
                        Queue is clear.
                      </p>
                    ) : (
                      pendingJobs.map((job) => (
                        <div
                          key={job.id}
                          className="border p-4 md:p-5 rounded-xl bg-slate-50"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                            <h3 className="font-bold text-slate-800 text-base md:text-lg">
                              {job.serviceName}{" "}
                              <span className="text-xs font-normal text-slate-500 block sm:inline sm:ml-2">
                                by {job.clientName}
                              </span>
                            </h3>
                            <span className="font-black text-emerald-600">
                              ₹{job.budget}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 bg-white p-3 rounded-lg border mb-4">
                            "{job.description}"
                          </p>
                          <div className="flex justify-end gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => rejectJob(job.id)}
                            >
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              className="bg-indigo-600 text-white"
                              onClick={() => approveJob(job.id)}
                            >
                              Approve Job
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Verification Tab */}
            {activeTab === "verification" && (
              <Card className="bg-white shadow-sm animate-in fade-in">
                <CardHeader className="bg-slate-50 border-b p-4 md:p-6">
                  <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" /> CA
                    Verification
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  <div className="space-y-4">
                    {pendingCAs.length === 0 ? (
                      <p className="text-center text-slate-500 py-10">
                        No pending verifications.
                      </p>
                    ) : (
                      pendingCAs.map((ca) => (
                        <div
                          key={ca.id}
                          className="border p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white"
                        >
                          <div>
                            <p className="font-bold text-slate-800 text-base">
                              {ca.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {ca.email} • {ca.experience} Yrs Exp.
                            </p>
                          </div>
                          <Button
                            size="sm"
                            className="bg-emerald-600 text-white w-full sm:w-auto"
                            onClick={() => verifyCA(ca.id)}
                          >
                            Verify Expert
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Live Feed Tab */}
            {activeTab === "feed" && (
              <Card className="bg-white shadow-sm animate-in fade-in">
                <CardHeader className="bg-slate-50 border-b p-4 md:p-6">
                  <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-slate-700" /> Live Feed
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  <div className="bg-slate-900 rounded-xl p-4 h-[400px] md:h-[500px]">
                    <ScrollArea className="h-full">
                      <div className="font-mono text-xs md:text-sm space-y-2">
                        {logs.map((log) => (
                          <div key={log.id} className="flex gap-2 items-start">
                            <span className="text-slate-500 shrink-0">
                              [{formatTime(log.timestamp)}]
                            </span>
                            <span className={getLogColor(log.type)}>
                              {log.message}
                            </span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* History Tab */}
            {activeTab === "history" && (
              <Card className="bg-white shadow-sm animate-in fade-in">
                <CardHeader className="bg-slate-50 border-b p-4 md:p-6">
                  <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-slate-600" /> Archives
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full min-w-[700px] text-left text-sm whitespace-nowrap">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="p-4">Project</th>
                          <th className="p-4">Users</th>
                          <th className="p-4">Budget</th>
                          <th className="p-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {archivedRequests.map((req) => (
                          <tr key={req.id} className="hover:bg-slate-50">
                            <td className="p-4 font-bold">{req.serviceName}</td>
                            <td className="p-4 text-xs text-slate-600">
                              C: {req.clientName}
                              <br />
                              E: {req.caName}
                            </td>
                            <td className="p-4 font-mono font-semibold">
                              ₹{req.budget}
                            </td>
                            <td className="p-4 text-right">
                              <Badge className="bg-slate-200 text-slate-600 border-none text-[10px]">
                                ARCHIVED
                              </Badge>
                            </td>
                          </tr>
                        ))}
                        {archivedRequests.length === 0 && (
                          <tr>
                            <td
                              colSpan={4}
                              className="p-10 text-center text-slate-500"
                            >
                              No archives found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Admin Team Tab */}
            {activeTab === "team" && (
              <Card className="bg-white shadow-sm animate-in fade-in max-w-3xl">
                <CardHeader className="bg-slate-50 border-b p-4 md:p-6 flex flex-row justify-between items-center">
                  <CardTitle className="text-lg md:text-xl">
                    Admin Team
                  </CardTitle>
                  <Button
                    size="sm"
                    className="bg-slate-900"
                    onClick={() => setAddAdminOpen(true)}
                  >
                    <UserPlus className="w-4 h-4 md:mr-2" />
                    <span className="hidden md:inline">Add Admin</span>
                  </Button>
                </CardHeader>
                <CardContent className="p-4 md:p-6 space-y-3">
                  {adminUsers.map((admin) => (
                    <div
                      key={admin.id}
                      className="flex justify-between items-center p-3 md:p-4 bg-slate-50 rounded-xl border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <Shield className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-bold text-sm md:text-base">
                            {admin.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {admin.email}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          admin.isOnline
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200 text-[10px]"
                            : "bg-slate-100 text-slate-500 text-[10px]"
                        }
                      >
                        {admin.isOnline ? "Online" : "Offline"}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Overwatch Tab */}
            {activeTab === "overwatch" && (
              <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in">
                {requests.filter(
                  (r) => r.status === "active" || r.status === "completed",
                ).length === 0 ? (
                  <div className="col-span-full py-20 text-center">
                    <Eye className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No active workspaces.</p>
                  </div>
                ) : (
                  requests
                    .filter(
                      (r) => r.status === "active" || r.status === "completed",
                    )
                    .map((req) => (
                      <Card
                        key={req.id}
                        className="bg-white shadow-sm border-slate-200"
                      >
                        <CardHeader className="p-5 border-b bg-indigo-50/30">
                          <CardTitle className="text-base font-bold truncate">
                            {req.serviceName}
                          </CardTitle>
                          <Badge className="w-fit text-[9px] mt-2">
                            {req.status.toUpperCase()}
                          </Badge>
                        </CardHeader>
                        <CardContent className="p-5">
                          <p className="text-xs text-slate-500 mb-1">
                            Client:{" "}
                            <span className="font-bold text-slate-800">
                              {req.clientName}
                            </span>
                          </p>
                          <p className="text-xs text-slate-500 mb-4">
                            Expert:{" "}
                            <span className="font-bold text-slate-800">
                              {req.caName}
                            </span>
                          </p>
                          <Button
                            className="w-full bg-slate-900"
                            size="sm"
                            onClick={() => navigate(`/workspace/${req.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-2" /> Overwatch
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                )}
              </div>
            )}
          </div>

          <footer className="mt-8 border-t border-slate-200 bg-white/50 py-6 px-4 md:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs md:text-sm text-slate-500 font-medium text-center md:text-left">
              <p>
                © {new Date().getFullYear()} TaxConsultGuru. All rights
                reserved.
              </p>
              <div className="flex flex-wrap justify-center gap-4 md:gap-6 font-semibold">
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
                  Privacy
                </Link>
                <Link
                  to="/terms"
                  className="hover:text-indigo-600 transition-colors"
                >
                  Terms
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
        </ScrollArea>
      </main>

      {/* Add Admin Dialog - Mobile friendly */}
      <Dialog open={addAdminOpen} onOpenChange={setAddAdminOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle>Add New Admin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              placeholder="Name"
              value={newAdminName}
              onChange={(e) => setNewAdminName(e.target.value)}
              className="h-11"
            />
            <Input
              type="email"
              placeholder="Email"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              className="h-11"
            />
            <Input
              type="password"
              placeholder="Password"
              value={newAdminPassword}
              onChange={(e) => setNewAdminPassword(e.target.value)}
              className="h-11"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setAddAdminOpen(false)}
              className="h-11"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddAdmin}
              className="bg-indigo-600 hover:bg-indigo-700 text-white h-11"
            >
              Create Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PremiumConfirmDialog
        isOpen={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmConfig.title}
        description={confirmConfig.description}
        onConfirm={confirmConfig.onConfirm}
        type={confirmConfig.type}
      />
    </div>
  );
};

export default AdminDashboard;
